import { NextRequest, NextResponse } from "next/server";
import { runWorkflow } from "./workflow";

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set in environment variables" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { input_as_text, jwt_token } = body;

    if (!input_as_text) {
      return NextResponse.json(
        { error: "input_as_text is required" },
        { status: 400 }
      );
    }

    // Extract JWT from Authorization header, request body, or use env fallback
    const authHeader = request.headers.get("authorization");
    const jwtToken =
      jwt_token || // From request body
      (authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader) || // From Authorization header
      null; // Will use env fallback in workflow if needed

    console.log("Starting agent workflow with input:", input_as_text);
    
    const result = await Promise.race([
      runWorkflow({
        input_as_text,
        jwtToken: jwtToken || undefined,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Workflow timeout after 60 seconds")), 60000)
      ),
    ]);

    console.log("Agent workflow completed");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent workflow error:", error);
    return NextResponse.json(
      {
        error: "Failed to run agent workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

