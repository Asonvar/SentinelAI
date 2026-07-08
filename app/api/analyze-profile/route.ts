import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { NextResponse } from "next/server";

// Strict Express Mode Initialization — no project, location, or credentials.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    vertexai: true
});

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not defined" },
                { status: 500 }
            );
        }

        const { answers } = await req.json();

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: "Invalid input: 'answers' array is required." },
                { status: 400 }
            );
        }

        const prompt = `You are an expert psychologist. Analyze these user answers. Return PURE JSON. Do not use Markdown. Do not use code blocks. Return a JSON object with these keys: confidence_score (0-100), emotional_stability (string), dominant_insecurity (string), and generated_system_prompt (a string describing how to talk to them).
    
    User Answers:
    ${JSON.stringify(answers)}
    `;

        // Model selection + safety configurations via the new SDK
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
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

        const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() ?? '';
        const analysis = JSON.parse(text);

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("Analysis API Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze profile" },
            { status: 500 }
        );
    }
}
