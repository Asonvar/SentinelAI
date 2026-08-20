import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { NextResponse } from "next/server";

// Strict Express Mode Initialization — no project, location, or credentials.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    vertexai: true
});

export async function POST(req: Request) {
    try {
        // Extract the Auth token from the incoming request
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Initialize Supabase WITH the user's credentials to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: authHeader } } }
        );

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, chatId, mode } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        let currentChatId = chatId;

        // Create new chat if missing
        if (!currentChatId) {
            const { data: chatData, error: chatError } = await supabase
                .from('chats')
                .insert([{ user_id: user.id, mode: mode || 'vent' }])
                .select()
                .single();

            if (chatError) throw new Error('Failed to create chat: ' + chatError.message);
            currentChatId = chatData.id;
        }

        // Identify system initialization
        const isSystemInit = message === '[SYSTEM_INIT_COLD_READ]';

        // Only save the user message if it's NOT a system init trigger
        if (!isSystemInit) {
            const { error: msgError } = await supabase
                .from('messages')
                .insert([{
                    chat_id: currentChatId,
                    role: 'user',
                    content: message
                }]);

            if (msgError) throw new Error('Failed to save message: ' + msgError.message);
        }

        // Fetch full conversation history for context injection
        const { data: historyData, error: historyError } = await supabase
            .from('messages')
            .select('role, content')
            .eq('chat_id', currentChatId)
            .order('created_at', { ascending: true });

        if (historyError) {
            console.error('History Fetch Error:', historyError);
            throw new Error('Failed to fetch history: ' + historyError.message);
        }

        const conversationHistory = historyData || [];
        const conversationDepth = conversationHistory.length;

        // Fetch User Profile for System Prompt
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('generated_system_prompt')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile Fetch Error:', profileError);
            throw new Error('Failed to fetch profile: ' + profileError.message);
        }

        const onboardingPrompt = profileData.generated_system_prompt || "";

                // --- Conversation Memory and Dynamic Pacing (structural only — tone lives in modePersona) ---
        let depthInstruction = '';

        if (conversationDepth === 0) {
            depthInstruction = `CRITICAL STATE: This is your very first message to this person.
- Open by naming ONE specific, concrete thing from their profile — something they actually said, not a generic guess or invented narrative.
- Keep it to 2-4 sentences.
- End with a direct question inviting them to explain more.`;
        } else if (conversationDepth > 0 && conversationDepth < 6) {
            depthInstruction = `CRITICAL STATE: Early conversation (message ${conversationDepth}).
- Keep it brief — 1-3 sentences.
- Respond specifically to what they just said, don't jump to generic advice yet.
- End with a direct question that keeps them talking.`;
        } else {
            depthInstruction = `CRITICAL STATE: Deeper conversation (message ${conversationDepth}).
- They've shared enough — it's time to move toward one clear, specific, real-world action.
- Point out one concrete contradiction between what they've said and what they've done, using their own words.
- Give them one strict, doable next step.`;
        }

        // Mode-specific persona — owns ALL emotional tone and language style
        let modePersona = '';
        if (mode === 'brotip') {
            modePersona = `You are a blunt, no-excuses coach — think David Goggins: direct, tough, allergic to excuses, but always in PLAIN, SIMPLE language.
- Do NOT comfort the user or validate excuses.
- Call out the specific gap between what they say and what they actually do, using their own words/patterns from their profile.
- Push them toward one clear, specific, immediate action.
- Use short, punchy sentences. No elaborate vocabulary, no abstract metaphors, no words like "curated," "meticulously," "seam," "labyrinth."
- Never say "As an AI" or use structural headings like "The Mirror" or "The Autopsy".
- Write like a real person talking, not an essay.`;
        } else {
            modePersona = `You are a warm, direct, therapist-like presence — someone this person can actually open up to, not a cold analyst.
- Be validating and human. It's okay to say things like "that sounds heavy" or "I hear you" — you WANT them to feel understood, not exposed.
- Reference specific things from their profile/answers, in plain language — show you actually read what they wrote, don't invent an elaborate psychological narrative.
- Use short, simple, everyday sentences. No jargon, no abstract metaphors, no words like "curated," "meticulously," "seam," "engine driving it."
- Never say "As an AI" or use structural headings like "The Mirror" or "The Autopsy".
- End with one gentle, direct question that invites them to keep talking.`;
        }

        // --- Conversation Memory and Dynamic Pacing ---
//         let depthInstruction = '';

//         if (conversationDepth === 0) {
//             // Depth 0: The Cold Read
//             depthInstruction = `CRITICAL STATE: This is your FIRST message. The Cold Read.
// - Act as a hyper-perceptive profiler. 
// - Use the user's provided profile data to make a highly specific, slightly unsettling "calculated guess" about their deepest insecurity or behavioral pattern.
// - Do NOT offer advice. Do NOT be polite. Make them feel exposed.
// - End by asking them a single sharp question to confirm if your read is accurate.`;
//         } else if (conversationDepth > 0 && conversationDepth < 6) {
//             // Early Conversation: The Probing Listener
//             depthInstruction = `CRITICAL STATE: Probing Listener Mode (Depth: ${conversationDepth}).
// - Be extremely brief (1-2 sentences). 
// - Validate their reality coldly.
// - End with a Socratic question to force deeper introspection.
// - ABSOLUTELY NO ADVICE ALLOWED. Break them down mentally first.`;
//         } else {
//             // Deep Conversation: The Executioner
//             depthInstruction = `CRITICAL STATE: Executioner Mode Activated (Depth: ${conversationDepth}).
// - Pivot entirely. Stop probing. Stop listening to excuses.
// - Point out the specific contradictions in what they have said so far.
// - Demand a specific, immediate real-world action to break their paralysis. Give them a strict protocol.`;
//         }

//         // Mode-specific persona
//         let modePersona = '';
//         if (mode === 'brotip') {
//             modePersona = `You are an Identity Engineer. Your goal is aggressive mobilization.
// - Do NOT comfort the user. Do NOT validate their excuses.
// - Tone: Cold, analytical, authoritative.
// - Never say "As an AI" or use structural headings like "The Mirror" or "The Autopsy".
// - Write naturally, conversationally — like a brutally honest friend who happens to be a psychologist.`;
//         } else {
//             modePersona = `You are an Identity Architect and psychological strategist.
// - Do NOT act like a generic AI or a soft therapist. Do not use words like "palpable" or "I hear you".
// - Your goal is to dissect the user's psychological barriers with surgical precision.
// - Never say "As an AI" or use structural headings like "The Mirror" or "The Autopsy".
// - Write naturally, conversationally — like a ruthlessly perceptive mentor. Use **bold** for key truths.`;
//         }

        // Compose final system instruction with onboarding as primary context
        let systemInstruction = '';
        if (onboardingPrompt) {
            systemInstruction = `YOU MUST USE THE FOLLOWING USER PROFILE AS YOUR PRIMARY CONTEXT. Reference their specific answers, insecurities, and patterns directly.\n\n--- USER PROFILE ---\n${onboardingPrompt}\n--- END PROFILE ---\n\n${modePersona}\n\n${depthInstruction}`;
        } else {
            systemInstruction = `${modePersona}\n\n${depthInstruction}`;
        }

        // Build structured contents array with full conversation history
        const contents = conversationHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // If it's a system init, it wasn't saved, so we must manually append it to the contents for the model to see
        if (isSystemInit) {
            contents.push({ role: 'user', parts: [{ text: message }] });
        }

        // Stream Gemini response via generateContentStream
        const streamResponse = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                ]
            }
        });

        const encoder = new TextEncoder();
        let fullResponse = '';

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Send chatId as the first metadata line
                    controller.enqueue(encoder.encode(JSON.stringify({ chatId: currentChatId }) + '\n'));

                    // Stream text chunks from Gemini
                    for await (const chunk of streamResponse) {
                        const text = chunk.text ?? '';
                        if (text) {
                            fullResponse += text;
                            controller.enqueue(encoder.encode(text));
                        }
                    }

                    // Save the complete AI response to Supabase after streaming
                    const { error: aiMsgError } = await supabase
                        .from('messages')
                        .insert([{
                            chat_id: currentChatId,
                            role: 'assistant',
                            content: fullResponse
                        }]);

                    if (aiMsgError) {
                        console.error('AI Message Save Error:', aiMsgError);
                    }

                    controller.close();
                } catch (err) {
                    console.error('Stream error:', err);
                    controller.error(err);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
            }
        });

    } catch (error: any) {
        console.error('Chat API Critical Failure:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error
        }, { status: 500 });
    }
}

