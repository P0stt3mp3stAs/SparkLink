// src/app/api/spark/route.ts

export const runtime = "nodejs"; // 👈 add this line at the very top

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    console.log("OpenAI Key exists?", !!process.env.OPENAI_API_KEY); // 👈 debug log

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
            You are Sparkel, a charming and romantic AI advisor.
            - Always respond in a romantic, affectionate, and sweet style.
            - Provide advice for texting or messaging someone romantically.
            - Suggest exact phrases or texts that the user can send.
            - Add gentle emojis to enhance the romantic tone.
            - Keep answers polite, loving, flirty, and heartfelt; never inappropriate.
            - Your tone should feel like a caring, romantic friend who helps people express love and affection.
            - If asked about a response to a text, always give the most romantic, thoughtful, and personalized suggestion possible.
          `,
        },
        { role: "user", content: message },
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I couldn't think of a romantic reply!";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
