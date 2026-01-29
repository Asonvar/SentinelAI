import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
});

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY is not defined" },
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

        const prompt = `You are an expert psychologist. Analyze these user answers. Return a JSON object with these keys: confidence_score (0-100), emotional_stability (string), dominant_insecurity (string), and generated_system_prompt (a string describing how to talk to them).
    
    User Answers:
    ${JSON.stringify(answers)}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // The response should already be in JSON format due to responseMimeType: "application/json"
        const analysis = JSON.parse(text);

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("Error analyzing profile:", error);
        return NextResponse.json(
            { error: "Failed to analyze profile" },
            { status: 500 }
        );
    }
}
