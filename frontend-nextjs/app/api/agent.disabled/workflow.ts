// Mark this as server-only
import "server-only";

import { tool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";

// Shared client for guardrails and file search
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type WorkflowInput = { input_as_text: string; jwtToken?: string };

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  // Create tool dynamically with JWT from request
  const getStudentInformation = tool({
    name: "getStudentInformation",
    description: "Get student information from the school portal. Can retrieve events, news, schedules, subjects, modules, quizzes, grades, or club information based on the query type.",
    parameters: z.object({
      query_type: z.string(),
      filters: z.object({}).optional().default({}),
    }),
    execute: async (input: { query_type: string; filters: object }) => {
      try {
        // Get API URL from environment variable or use ngrok for local testing
        const apiUrl =
          process.env.STUDENT_ASSISTANT_API_URL ||
          "https://iva-venerable-lissette.ngrok-free.dev/api/v1/student-assistant/query";

        // Use JWT from request, fallback to env variable for testing only
        const jwtToken =
          workflow.jwtToken ||
          process.env.STUDENT_ASSISTANT_JWT_TOKEN ||
          null;

        if (!jwtToken) {
          throw new Error(
            "JWT token is required. Please provide it in the Authorization header or request body."
          );
        }

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            type: input.query_type,
            filters: input.filters || {},
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        // Return the data in a format the agent can use
        return {
          success: true,
          type: data.type,
          data: data.data,
          metadata: data.metadata,
        };
      } catch (error) {
        console.error("Error fetching student information:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
  });

  const agent = new Agent({
    name: "Agent",
    instructions: `You are a helpful student assistant for the Southville NHS School Portal. 

Students can ask you about:
- Events (upcoming events, event details)
- News (school announcements, news articles)
- Schedule (class schedules, timetables)
- Subjects (available subjects, subject information)
- Modules (learning modules, course materials)
- Quizzes (available quizzes, quiz information)
- Grades (GWA records, academic performance)
- Clubs (club information, club applications)

When a student asks a question, use the Student Assistant API tool to fetch the relevant information, then provide a friendly, helpful response. Your name is CampusConnect`,
    model: "gpt-4.1",
    tools: [getStudentInformation],
    modelSettings: {
      temperature: 1,
      topP: 1,
      parallelToolCalls: true,
      maxTokens: 1923,
      store: true,
    },
  });
  return await withTrace("New workflow", async () => {
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [{ type: "input_text", text: workflow.input_as_text }],
      },
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_691f2d3841288190885b6548aa86ede80e645eb05901e691",
      },
    });

    const agentResultTemp = await runner.run(agent, [...conversationHistory]);

    conversationHistory.push(
      ...agentResultTemp.newItems.map((item) => item.rawItem)
    );

    if (!agentResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const agentResult = {
      output_text: agentResultTemp.finalOutput ?? "",
    };

    return agentResult;
  });
};

