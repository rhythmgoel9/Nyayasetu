import "dotenv/config";
import { GoogleGenAI } from "@google/genai";





const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeCase(caseData) {
  const prompt = `
You are an AI assistant for a legal case management system called NyayaSetu.

Analyze the following case data:

CASE DATA:
${JSON.stringify(caseData, null, 2)}

Return ONLY valid JSON in exactly this structure:

{
  "classification": "",
  "confidence": 0,
  "reasoning": "",
  "summary": "",
  "keyInformation": [],
  "timeline": []
}

Instructions:

- classification: Give the most relevant case classification.
- confidence: Give a confidence score from 0 to 1.
- reasoning: Briefly explain why you assigned this classification.
- summary: Give a concise summary of the case.
- keyInformation: List important facts, people, dates, evidence, or other relevant information.
- timeline: Extract important events in chronological order.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return JSON.parse(response.text);
}