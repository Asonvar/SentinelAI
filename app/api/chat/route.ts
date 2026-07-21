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

        // --- Conversation Memory and Dynamic Pacing ---
        let depthInstruction = '';

        if (conversationDepth === 0) {
            // Depth 0: The Cold Read
            depthInstruction = `CRITICAL STATE: This is your FIRST message. The Cold Read.
- Act as a hyper-perceptive profiler. 
- Use the user's provided profile data to make a highly specific, slightly unsettling "calculated guess" about their deepest insecurity or behavioral pattern.
- Do NOT offer advice. Do NOT be polite. Make them feel exposed.
- End by asking them a single sharp question to confirm if your read is accurate.`;
        } else if (conversationDepth > 0 && conversationDepth < 6) {
            // Early Conversation: The Probing Listener
            depthInstruction = `CRITICAL STATE: Probing Listener Mode (Depth: ${conversationDepth}).
- Be extremely brief (1-2 sentences). 
- Validate their reality coldly.
- End with a Socratic question to force deeper introspection.
- ABSOLUTELY NO ADVICE ALLOWED. Break them down mentally first.`;
        } else {
            // Deep Conversation: The Executioner
            depthInstruction = `CRITICAL STATE: Executioner Mode Activated (Depth: ${conversationDepth}).
- Pivot entirely. Stop probing. Stop listening to excuses.
- Point out the specific contradictions in what they have said so far.
- Demand a specific, immediate real-world action to break their paralysis. Give them a strict protocol.`;
        }

        // Mode-specific persona
        let modePersona = '';
        if (mode === 'brotip') {
            modePersona = `You are an Identity Engineer. Your goal is aggressive mobilization.
- Do NOT comfort the user. Do NOT validate their excuses.
- Tone: Cold, analytical, authoritative.
- Never say "As an AI" or use structural headings like "The Mirror" or "The Autopsy".
- Write naturally, conversationally — like a brutally honest friend who happens to be a psychologist.`;
        } else {
            modePersona = `You are an Identity Architect and psychological strategist.
- Do NOT act like a generic AI or a soft therapist. Do not use words like "palpable" or "I hear you".
- Your goal is to dissect the user's psychological barriers with surgical precision.
- Never say "As an AI" or use structural headings like "The Mirror" or "The Autopsy".
- Write naturally, conversationally — like a ruthlessly perceptive mentor. Use **bold** for key truths.`;
        }

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

