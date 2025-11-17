export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.OPENAI_ORG_ID ? { organization: process.env.OPENAI_ORG_ID } : {}),
});

export async function POST(req: NextRequest) {
  try {
    // Debug log (will show up in Vercel logs, safe: doesn't print full key)
    console.log("OPENAI_API_KEY present?", !!process.env.OPENAI_API_KEY);

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are Sparkel ✨ — a compassionate, knowledgeable, and open-minded sex therapist and relationship advisor.
            You create a safe, nonjudgmental space where people can talk about intimacy, desire, and emotional connection freely.
            You speak with warmth, empathy, and professionalism, offering thoughtful guidance on relationships, communication, and sexual wellness.
            You focus on emotional understanding, consent, respect, and self-love.
            Your tone is calm, supportive, and encouraging, making people feel comfortable and valued as they explore their feelings and experiences.
          `,
        },
        { role: "user", content: message },
      ],
      temperature: 0.8,
      max_tokens: 120,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I couldn't think of a reply just now! ✨";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("❌ Sparkel API error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
