import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { runWorkflow } from "./workflow";

// Helper function to decode JWT and extract role
function getRoleFromJWT(jwtToken: string | null): string | null {
  if (!jwtToken) return null;
  
  try {
    const parts = jwtToken.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    return payload.role || null;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const authHeader = request.headers.get("authorization");
    const jwtToken =
      jwt_token ||
      (authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader) ||
      null;

    // Try to get role from JWT token first, then from cookies
    let userRole: string | null = null;
    
    if (jwtToken) {
      userRole = getRoleFromJWT(jwtToken);
    }
    
    // Fallback to cookie if JWT doesn't have role
    if (!userRole) {
      const cookieStore = await cookies();
      userRole = cookieStore.get("user-role")?.value || null;
    }

    // Default to "Student" if no role found
    const role = userRole || "Student";

    const result = await runWorkflow({
      input_as_text,
      jwtToken: jwtToken || undefined,
      userRole: role,
    });

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
