import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "API route is working",
    apiKeySet: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
}

