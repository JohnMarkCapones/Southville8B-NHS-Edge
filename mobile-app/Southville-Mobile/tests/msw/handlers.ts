import { rest } from "msw";

// Base URL detection: fallback to localhost for tests if not provided
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000/api/v1";

// Shared in-memory token state for tests
let currentAccessToken = "access_token_initial";
let currentRefreshToken = "refresh_token_initial";

export const handlers = [
  // Login
  rest.post(`${API_BASE_URL}/auth/login`, async (req, res, ctx) => {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (email === "student@example.com" && password === "Correct#123") {
      currentAccessToken = "access_token_abc";
      currentRefreshToken = "refresh_token_xyz";
      return res(
        ctx.status(200),
        ctx.json({
          access_token: currentAccessToken,
          refresh_token: currentRefreshToken,
          token_type: "bearer",
          expires_in: 3600,
          user_id: "user_123",
        })
      );
    }

    if (email === "locked@example.com") {
      return res(
        ctx.status(423),
        ctx.json({ error: "account_locked", message: "Account is locked" })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        error: "invalid_credentials",
        message: "Invalid email or password",
      })
    );
  }),

  // Me (protected)
  rest.get(`${API_BASE_URL}/me`, (req, res, ctx) => {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");

    if (token === "expired") {
      return res(ctx.status(401), ctx.json({ error: "token_expired" }));
    }

    if (token === currentAccessToken) {
      return res(
        ctx.status(200),
        ctx.json({
          user_id: "user_123",
          email: "student@example.com",
          role: "student",
        })
      );
    }

    return res(ctx.status(401), ctx.json({ error: "unauthorized" }));
  }),

  // Refresh token
  rest.post(`${API_BASE_URL}/auth/refresh`, async (req, res, ctx) => {
    const body = await req.json();
    const { refresh_token } = body as { refresh_token?: string };

    if (refresh_token === currentRefreshToken) {
      currentAccessToken = "access_token_refreshed";
      return res(
        ctx.status(200),
        ctx.json({
          access_token: currentAccessToken,
          token_type: "bearer",
          expires_in: 3600,
        })
      );
    }

    return res(ctx.status(401), ctx.json({ error: "invalid_refresh_token" }));
  }),

  // Logout
  rest.post(`${API_BASE_URL}/auth/logout`, (req, res, ctx) => {
    currentAccessToken = "";
    return res(ctx.status(200), ctx.json({}));
  }),

  // Current user profile
  rest.get(`${API_BASE_URL}/users/me`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: "user_123",
        email: "student@example.com",
        full_name: "Student User",
        student: {
          student_id: "S-0001",
          first_name: "Student",
          last_name: "User",
          birthday: new Date().toISOString(),
          section: { name: "Newton" },
          grade_level: "10",
          rank: "N/A",
        },
        profile: {
          phone_number: "",
          address: "",
        },
      })
    );
  }),

  // Schedules: my-schedule
  rest.get(`${API_BASE_URL}/schedules/my-schedule`, (req, res, ctx) => {
    // Default: success response with a few classes this week
    const todayName = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    const data = [
      {
        id: "sched_1",
        subjectId: "subj_math",
        teacherId: "teach_1",
        sectionId: "sec_a",
        roomId: "room_101",
        buildingId: "bldg_main",
        dayOfWeek: todayName,
        startTime: "08:00",
        endTime: "09:00",
        schoolYear: "2025-2026",
        semester: "1st",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subject: { id: "subj_math", subject_name: "Mathematics" },
        teacher: { id: "teach_1", first_name: "Alan", last_name: "Turing" },
        section: { id: "sec_a", name: "Newton" },
        room: { id: "room_101", room_number: "101", floor_id: "floor_1" },
      },
      {
        id: "sched_2",
        subjectId: "subj_sci",
        teacherId: "teach_2",
        sectionId: "sec_a",
        roomId: "room_102",
        buildingId: "bldg_main",
        dayOfWeek: "Tuesday",
        startTime: "10:00",
        endTime: "11:30",
        schoolYear: "2025-2026",
        semester: "1st",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subject: { id: "subj_sci", subject_name: "Science" },
        teacher: { id: "teach_2", first_name: "Marie", last_name: "Curie" },
        section: { id: "sec_a", name: "Newton" },
        room: { id: "room_102", room_number: "102", floor_id: "floor_1" },
      },
    ];
    return res(ctx.status(200), ctx.json(data));
  }),

  // Academics: GWA (Grades) - my GWA records
  rest.get(`${API_BASE_URL}/gwa/my-gwa`, (req, res, ctx) => {
    const gradingPeriod = req.url.searchParams.get("grading_period");
    const schoolYear = req.url.searchParams.get("school_year");

    // Default: return success with GWA records
    const data = [
      {
        id: "gwa_1",
        student_id: "student_456",
        gwa: 95.5,
        grading_period: "Q1",
        school_year: "2025-2026",
        honor_status: "With Highest Honors",
        remarks: "Excellent performance",
        recorded_by: "teacher_123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "gwa_2",
        student_id: "student_456",
        gwa: 92.3,
        grading_period: "Q2",
        school_year: "2025-2026",
        honor_status: "With High Honors",
        recorded_by: "teacher_123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Filter by grading_period if provided
    const filteredData = gradingPeriod
      ? data.filter((r) => r.grading_period === gradingPeriod)
      : data;

    // Filter by school_year if provided
    const finalData = schoolYear
      ? filteredData.filter((r) => r.school_year === schoolYear)
      : filteredData;

    return res(ctx.status(200), ctx.json(finalData));
  }),

  // Announcements list
  rest.get(`${API_BASE_URL}/announcements`, (req, res, ctx) => {
    const page = Number(req.url.searchParams.get("page") || "1");
    const limit = Number(req.url.searchParams.get("limit") || "10");
    // includeExpired is not used in mock filtering

    const all = [
      {
        id: "ann_1",
        userId: "user_admin",
        title: "School Assembly on Monday",
        content: "All students gather at the gym by 8:00 AM.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: "public",
      },
      {
        id: "ann_2",
        userId: "user_admin",
        title: "Exam Schedule Released",
        content: "Please check the portal for your exam dates.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: "public",
      },
    ];

    const start = (page - 1) * limit;
    const paged = all.slice(start, start + limit);

    return res(
      ctx.status(200),
      ctx.json({
        data: paged,
        pagination: {
          page,
          limit,
          total: all.length,
          totalPages: Math.ceil(all.length / limit),
        },
      })
    );
  }),

  // Events list (Home uses useUpcomingEvents -> services/events.ts -> GET /events)
  rest.get(`${API_BASE_URL}/events`, (_req, res, ctx) => {
    const now = new Date();
    const plus1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const plus2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const data = [
      {
        id: "evt_1",
        title: "School Fair",
        description: "Join our annual school fair with booths and games.",
        date: plus1.toISOString(),
        time: "09:00",
        location: "Main Campus Grounds",
        organizerId: "user_admin",
        eventImage: undefined,
        status: "published",
        visibility: "public",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        organizer: {
          id: "user_admin",
          fullName: "Admin",
          email: "admin@example.com",
        },
        tags: [{ id: "tag1", name: "SCHOOL", color: "#007AFF" }],
        additionalInfo: [
          { id: "info1", title: "Note", content: "Bring ID", orderIndex: 0 },
        ],
      },
      {
        id: "evt_2",
        title: "Math Olympiad",
        description: "Competitive math event for top students.",
        date: plus2.toISOString(),
        time: "13:00",
        location: "Auditorium",
        organizerId: "user_admin",
        eventImage: undefined,
        status: "published",
        visibility: "public",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        organizer: {
          id: "user_admin",
          fullName: "Admin",
          email: "admin@example.com",
        },
        tags: [{ id: "tag2", name: "EVENT", color: "#22C55E" }],
        additionalInfo: [
          {
            id: "info2",
            title: "Reminder",
            content: "Practice sets available",
            orderIndex: 0,
          },
        ],
      },
    ];

    return res(
      ctx.status(200),
      ctx.json({ data, pagination: { total: data.length, page: 1, limit: 10 } })
    );
  }),
];
