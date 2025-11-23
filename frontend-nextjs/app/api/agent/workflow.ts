import { tool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";

type WorkflowInput = { input_as_text: string; jwtToken?: string; userRole?: string };

export const runWorkflow = async (workflow: WorkflowInput) => {
  const userRole = workflow.userRole || "Student";
  const isStudent = userRole === "Student";
  const isTeacher = userRole === "Teacher";
  const isAdmin = userRole === "Admin";

  // Student information tool (available for all roles, but mainly for students)
  const getStudentInformation = tool({
    name: "getStudentInformation",
    description: `Get information from the school portal. 

VALID QUERY TYPES (use exactly as shown):
- "events" - for school events
- "news" - for news articles
- "schedule" - for class schedules (NOT "schedules")
- "subjects" - for subject information
- "modules" - for learning modules
- "quizzes" - for quizzes
- "grades" - for grades/GWA
- "clubs" - for club information

IMPORTANT FOR EVENTS:
- When user asks for "upcoming events", "future events", or "events coming up", you MUST filter by date
- Use startDate filter set to today's date (format: YYYY-MM-DD) to get only future events
- Example: { "query_type": "events", "filters": { "startDate": "2025-01-15" } }
- Always use the current date when filtering for upcoming events to avoid showing past events

IMPORTANT FOR SCHEDULE:
- Use query_type: "schedule" (singular, NOT "schedules")`,
    parameters: z.object({
      query_type: z.enum(["events", "news", "schedule", "subjects", "modules", "quizzes", "grades", "clubs"]),
    }),
    execute: async (input: { query_type: string }) => {
      try {
        const apiUrl =
          process.env.STUDENT_ASSISTANT_API_URL ||
          "https://iva-venerable-lissette.ngrok-free.dev/api/v1/student-assistant/query";

        const jwtToken =
          workflow.jwtToken ||
          process.env.STUDENT_ASSISTANT_JWT_TOKEN ||
          null;

        if (!jwtToken) {
          throw new Error("JWT token is required");
        }

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            type: input.query_type,
            filters: {},
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${errorText}`);
        }

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error. Response text:", responseText.substring(0, 500));
          throw new Error(`Invalid JSON response from API: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        // Ensure all values are JSON-serializable
        const result = {
          success: true,
          type: data.type || null,
          data: data.data || null,
          metadata: data.metadata || null,
        };

        // Validate it's serializable
        try {
          JSON.stringify(result);
        } catch (stringifyError) {
          console.error("Result not JSON-serializable:", result);
          throw new Error(`Tool result contains invalid JSON: ${stringifyError instanceof Error ? stringifyError.message : 'Unknown error'}`);
        }

        return result;
      } catch (error) {
        console.error("Error fetching student information:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
  });

  // Build role-specific instructions (condensed to reduce tokens)
  let roleInstructions = "";
  let availableRoutes = "";
  let roleContext = "";

  if (isStudent) {
    roleContext = "student";
    roleInstructions = `Helpful student assistant. Students can ask about: Events, News, Schedule, Subjects, Modules, Quizzes, Grades, Clubs, Library hours, FAQs.`;
    availableRoutes = `Routes: [/student/help](/student/help), [/student/grades](/student/grades), [/student/schedule](/student/schedule), [/student/events](/student/events), [/student/news](/student/news), [/student/courses](/student/courses), [/student/modules](/student/modules), [/student/quiz](/student/quiz), [/student/clubs](/student/clubs)`;
  } else if (isTeacher) {
    roleContext = "teacher";
    roleInstructions = `Helpful teacher assistant. Teachers can ask about: Quiz Management, Modules, Schedule, Students, Classes, Learning Materials, News, Reports, Clubs, Events, FAQs.`;
    availableRoutes = `Routes: [/teacher](/teacher), [/teacher/quiz](/teacher/quiz), [/teacher/classes](/teacher/classes), [/teacher/students](/teacher/students), [/teacher/class-schedule](/teacher/class-schedule), [/teacher/subjects](/teacher/subjects), [/teacher/learning-materials](/teacher/learning-materials), [/teacher/student-materials](/teacher/student-materials), [/teacher/news](/teacher/news)`;
  } else if (isAdmin) {
    roleContext = "administrator";
    roleInstructions = `Helpful admin assistant. Admins can ask about: User Management, System Config, Reports, Events, Schedule, Settings, FAQs.`;
    availableRoutes = `Routes: [/admin](/admin), [/admin/users/all](/admin/users/all)`;
  }

  const agent = new Agent({
    name: "Agent",
    instructions: `You are a helpful ${roleContext} assistant for the Southville NHS School Portal.

${roleInstructions}

SCHOOL INFO: Library Hours: 9:00 AM - 1:00 PM

${availableRoutes}

KEY INFO:
- Password reset: Login screen > "Forgot Password"
- View grades: [/student/grades](/student/grades) - GWA on cards, filter by quarter/year
- Check schedule: [/student/schedule](/student/schedule) - Weekly calendar, today highlighted
- Announcements: Home tab "School Updates" or Announcements tab
- Profile: Profile > Edit Profile
- Mobile app: Available iOS/Android

${isTeacher ? `TEACHER: Create quiz: [/teacher/quiz/create](/teacher/quiz/create), Monitor: [/teacher/quiz](/teacher/quiz), Classes: [/teacher/classes](/teacher/classes), Schedule: [/teacher/class-schedule](/teacher/class-schedule), Modules: [/teacher/student-materials](/teacher/student-materials), News: [/teacher/news/create](/teacher/news/create)` : ""}
${isAdmin ? `ADMIN: Users: [/admin/users/all](/admin/users/all), Reports: Reports section` : ""}

RULES:
1. For "upcoming events", add startDate filter with today's date (YYYY-MM-DD) to show only future events
2. Personal info - explain you don't have access, suggest checking profile
3. Use Student Assistant API tool only for specific data (events, schedules, grades, etc.)
4. Introduce as "CampusConnect AI"
5. Be friendly, conversational, format clearly
6. ALWAYS provide clickable markdown links at the end of responses: [Link Text](/route-path)
7. For events: Always include link to [/student/events](/student/events) or [/teacher/events](/teacher/events)
8. For schedule: Always include link to [/student/schedule](/student/schedule) or [/teacher/class-schedule](/teacher/class-schedule)
9. For grades: Always include link to [/student/grades](/student/grades)
10. For news: Always include link to [/student/news](/student/news) or [/teacher/news](/teacher/news)
11. Answer FAQs from knowledge base when matched

When ${roleContext} asks for specific info (events, schedules, grades, quizzes), use Student Assistant API tool, then provide friendly response with clickable links.`,
    model: "gpt-4.1",
    tools: [getStudentInformation],
    modelSettings: {
      temperature: 1,
      topP: 1,
      parallelToolCalls: true,
      maxTokens: 1923,
      store: false, // Disable automatic storage to prevent token limit issues
    },
  });

  return await withTrace("New workflow", async () => {
    // Start with fresh conversation history each time
    // This prevents token accumulation from stored conversations
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

    // Handle case where agent responds without tool calls
    let outputText = agentResultTemp.finalOutput;

    if (!outputText || outputText.trim().length === 0) {
      // Check if there are any text messages in the response
      const textMessages = agentResultTemp.newItems
        .filter(item => {
          const rawItem = item.rawItem as any;
          return rawItem && rawItem.role === 'assistant' && rawItem.content;
        })
        .map(item => {
          const rawItem = item.rawItem as any;
          const content = rawItem.content;
          if (Array.isArray(content)) {
            return content
              .filter((c: any) => c.type === 'text' || c.type === 'output_text')
              .map((c: any) => c.text || c.content || '')
              .join(' ');
          }
          return typeof content === 'string' ? content : '';
        })
        .filter(Boolean);

      if (textMessages.length > 0) {
        outputText = textMessages.join(' ');
      }
    }

    // Final fallback if still empty
    if (!outputText || outputText.trim().length === 0) {
      outputText = "I apologize, but I couldn't generate a response to that question. Could you please rephrase your question or try asking something else?";
    }

    const agentResult = {
      output_text: outputText,
    };

    return agentResult;
  });
};
