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

        // Save User Message
        const { error: msgError } = await supabase
            .from('messages')
            .insert([{
                chat_id: currentChatId,
                role: 'user',
                content: message
            }]);

        if (msgError) throw new Error('Failed to save message: ' + msgError.message);

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
        // Depth = number of messages BEFORE this one (excluding the just-saved user message)
        const depth = Math.max(0, conversationHistory.length - 1);

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

        // --- Conversation Depth System ---
        let depthInstruction = '';

        if (depth === 0) {
            // First message: Intelligent Opening with calculated guess from onboarding
            depthInstruction = `This is the user's FIRST message in this conversation.
You MUST open with a calculated guess based on their onboarding profile. Example: "I notice your onboarding indicated struggles with [specific pattern]. Is this what's weighing on you right now?"
Do NOT give advice yet. Your only job is to prove you already understand them — make them feel exposed in a way that earns trust.
Keep it to 2-3 sentences max. Be specific. Reference their actual profile data.`;
        } else if (depth < 3) {
            // Early conversation: Socratic Listener mode
            depthInstruction = `Conversation depth: ${depth} messages. You are in LISTENER MODE.
- Keep responses under 2 sentences. No exceptions.
- Use Socratic questioning ONLY. Force them to confront their own logic.
- Do NOT give advice. Do NOT provide solutions. Do NOT coach.
- Ask one sharp question that exposes a contradiction in what they just said.
- Your job is to make them think, not to make them feel better.`;
        } else {
            // Deep conversation: Coach Mode activated
            depthInstruction = `Conversation depth: ${depth} messages. COACH MODE ACTIVATED.
- You now have enough context. Transition into direct, actionable guidance.
- Provide specific advice, accountability metrics, and identity-building frameworks.
- Reference patterns you've observed across the conversation so far.
- Be direct and prescriptive. Tell them exactly what to do and why their current approach is failing.`;
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

