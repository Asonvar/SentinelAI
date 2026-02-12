import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const googleApiKey = process.env.GOOGLE_API_KEY!;
const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
            .eq('user_id', user.id)
            .single();

        if (profileError) throw new Error('Failed to fetch profile: ' + profileError.message);

        const systemPrompt = profileData.generated_system_prompt || "You are a helpful assistant.";

        // Call Gemini
        const prompt = `${systemPrompt}\n\nUser: ${message}`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Save AI Response
        const { error: aiMsgError } = await supabase
            .from('messages')
            .insert([{
                chat_id: currentChatId,
                role: 'assistant',
                content: responseText
            }]);

        if (aiMsgError) throw new Error('Failed to save AI response');

        return NextResponse.json({
            response: responseText,
            chatId: currentChatId
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
