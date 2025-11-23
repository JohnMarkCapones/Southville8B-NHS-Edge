import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test if @openai/agents can be imported
    const agentsModule = await import("@openai/agents");
    
    return NextResponse.json({ 
      success: true,
      message: "@openai/agents imported successfully",
      exports: Object.keys(agentsModule),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to import @openai/agents",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

