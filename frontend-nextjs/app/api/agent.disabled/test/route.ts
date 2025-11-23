import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Simple test call
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });

    return NextResponse.json({ 
      success: true, 
      message: response.choices[0]?.message?.content,
      apiKeySet: !!process.env.OPENAI_API_KEY 
    });
  } catch (error) {
    return NextResponse.json({
      error: "OpenAI API test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      apiKeySet: !!process.env.OPENAI_API_KEY
    }, { status: 500 });
  }
}

