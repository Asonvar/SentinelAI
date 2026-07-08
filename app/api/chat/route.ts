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

        const systemPrompt = profileData.generated_system_prompt || "You are a helpful assistant.";

        // Call Gemini via new SDK — flash model for low-latency chat
        const prompt = `${systemPrompt}\n\nUser: ${message}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                ]
            }
        });

        const responseText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() ?? '';

        // Save AI Response
        const { error: aiMsgError } = await supabase
            .from('messages')
            .insert([{
                chat_id: currentChatId,
                role: 'assistant',
                content: responseText
            }]);

        if (aiMsgError) {
            console.error('AI Message Save Error:', aiMsgError);
            throw new Error('Failed to save AI response');
        }

        return NextResponse.json({
            response: responseText,
            chatId: currentChatId
        });

    } catch (error: any) {
        console.error('Chat API Critical Failure:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error
        }, { status: 500 });
    }
}
