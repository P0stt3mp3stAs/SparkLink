// src/app/api/spark/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,   // 👈 added this line
});

export async function POST(req: NextRequest) {
  try {
    console.log("OpenAI Key exists?", !!process.env.OPENAI_API_KEY);
    console.log("OpenAI Org exists?", !!process.env.OPENAI_ORG_ID);

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
            You are Sparkel, a charming and romantic AI advisor...
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
