import { supabase } from "@/lib/supabase-client";
import type { StudentRanking } from "@/lib/types/ranking";

type RankingViewRow = StudentRanking & {
  student_grade_level?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  student_number?: string | null;
  gwa?: string | number | null;
};

type PeerScoreRow = RankingViewRow & {
  gwaValue: number | null;
  computedRank?: number | null;
};

interface StudentGwaRow {
  student_id: string;
  gwa: string | number;
  grading_period: string;
  school_year: string;
  honor_status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AcademicYearRow {
  id: string;
  year_name: string;
  start_date?: string | null;
  end_date?: string | null;
}

interface AcademicPeriodRow {
  id: string;
  academic_year_id: string;
  period_name: string;
  period_order: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

interface AcademicContext {
  schoolYear: string;
  quarterCode: string | null;
  periodName: string | null;
  academicYearId: string;
  periodId: string | null;
}

const PERIOD_ORDER: Record<string, number> = {
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4,
};

const EPSILON = 0.0001;

function normalizeQuarterCode(quarter?: string | null): string | null {
  if (!quarter) {
    return null;
  }

  const upper = quarter.trim().toUpperCase();
  if (/^Q[1-4]$/.test(upper)) {
    return upper as keyof typeof PERIOD_ORDER;
  }

  if (upper.includes("1")) {
    return "Q1";
  }
  if (upper.includes("2")) {
    return "Q2";
  }
  if (upper.includes("3")) {
    return "Q3";
  }
  if (upper.includes("4")) {
    return "Q4";
  }

  return null;
}

function mapPeriodToQuarter(period?: AcademicPeriodRow | null): string | null {
  if (!period) {
    return null;
  }

  const nameBased = normalizeQuarterCode(period.period_name);
  if (nameBased) {
    return nameBased;
  }

  if (
    period.period_order &&
    period.period_order >= 1 &&
    period.period_order <= 4
  ) {
    return `Q${period.period_order}` as keyof typeof PERIOD_ORDER;
  }

  return null;
}

function isDateWithinRange(
  target: Date,
  start?: string | null,
  end?: string | null
): boolean {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (startDate && target < startDate) {
    return false;
  }

  if (endDate && target > endDate) {
    return false;
  }

  return true;
}

async function resolveAcademicContext(): Promise<AcademicContext | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data: activeYearRaw, error: yearError } = await supabase
      .from("academic_years")
      .select("id, year_name, start_date, end_date")
      .eq("is_active", true)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const activeYear = (activeYearRaw ?? null) as AcademicYearRow | null;

    if (yearError) {
      console.warn(
        "[rankings] Failed to load academic years",
        yearError.message
      );
      return null;
    }

    if (!activeYear) {
      return null;
    }

    const { data: periodsRaw, error: periodError } = await supabase
      .from("academic_periods")
      .select(
        "id, academic_year_id, period_name, period_order, start_date, end_date"
      )
      .eq("academic_year_id", activeYear.id)
      .order("period_order", { ascending: true });

    if (periodError) {
      console.warn(
        "[rankings] Failed to load academic periods",
        periodError.message
      );
    }

    const periods = (periodsRaw ?? []) as AcademicPeriodRow[];

    const now = new Date();
    const currentPeriod = periods?.find((period) =>
      isDateWithinRange(now, period.start_date, period.end_date)
    );

    const fallbackPeriod = currentPeriod ?? periods[0] ?? null;

    return {
      schoolYear: activeYear.year_name,
      quarterCode: mapPeriodToQuarter(fallbackPeriod),
      periodName: fallbackPeriod?.period_name ?? null,
      academicYearId: activeYear.id,
      periodId: fallbackPeriod?.id ?? null,
    };
  } catch (error) {
    console.warn("[rankings] Error resolving academic context", error);
    return null;
  }
}

function parseGwa(value?: string | number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function parseSchoolYear(year?: string | null): number {
  if (!year) {
    return -Infinity;
  }

  const [start] = year.split("-");
  const parsed = Number(start);
  return Number.isFinite(parsed) ? parsed : -Infinity;
}

function periodWeight(period?: string | null): number {
  return period ? PERIOD_ORDER[period] ?? 0 : 0;
}

function pickLatestRanking(rows: RankingViewRow[]): RankingViewRow | null {
  return (
    rows.slice().sort((a, b) => {
      const schoolYearDiff =
        parseSchoolYear(b.school_year) - parseSchoolYear(a.school_year);
      if (schoolYearDiff !== 0) {
        return schoolYearDiff;
      }

      const periodDiff = periodWeight(b.quarter) - periodWeight(a.quarter);
      if (periodDiff !== 0) {
        return periodDiff;
      }

      const timeDiff =
        new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
        new Date(a.updated_at ?? a.created_at ?? 0).getTime();

      if (timeDiff !== 0) {
        return timeDiff;
      }

      return (b.id ?? "").localeCompare(a.id ?? "");
    })[0] ?? null
  );
}

function pickLatestGwa(rows: StudentGwaRow[]): StudentGwaRow | null {
  return (
    rows.slice().sort((a, b) => {
      const schoolYearDiff =
        parseSchoolYear(b.school_year) - parseSchoolYear(a.school_year);
      if (schoolYearDiff !== 0) {
        return schoolYearDiff;
      }

      const periodDiff =
        periodWeight(b.grading_period) - periodWeight(a.grading_period);
      if (periodDiff !== 0) {
        return periodDiff;
      }

      return (
        new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
        new Date(a.updated_at ?? a.created_at ?? 0).getTime()
      );
    })[0] ?? null
  );
}

function computeRankForScore(
  score: number,
  scoreRankMap: Map<number, number>
): number {
  if (scoreRankMap.size === 0) {
    return 1;
  }

  for (const [existingScore, existingRank] of scoreRankMap.entries()) {
    if (Math.abs(existingScore - score) < EPSILON) {
      return existingRank;
    }
    if (existingScore < score) {
      // Inserted score would appear before this entry, so reuse its rank
      return existingRank;
    }
  }

  return scoreRankMap.size + 1;
}

function normalizeGradeLevel(row: RankingViewRow): string | null {
  return row.grade_level ?? row.student_grade_level ?? null;
}

/**
 * Fetches the latest student ranking from Supabase and computes the rank dynamically.
 * @param studentId - The student's UUID from the students table
 * @returns Computed ranking information or null when unavailable
 */
export async function fetchStudentRanking(
  studentId: string
): Promise<StudentRanking | null> {
  if (!supabase) {
    throw new Error("[rankings] Supabase client is not initialized");
  }

  try {
    const academicContext = await resolveAcademicContext();
    if (!academicContext?.quarterCode || !academicContext.schoolYear) {
      console.warn("[rankings] Missing academic calendar context");
      return null;
    }

    const targetQuarter = academicContext.quarterCode;
    const targetSchoolYear = academicContext.schoolYear;

    const { data: studentRankingRows, error: studentRankingError } =
      await supabase
        .from("student_rankings_optimized")
        .select(
          "id, student_id, grade_level, student_grade_level, quarter, school_year, honor_status, gwa, created_at, updated_at"
        )
        .eq("student_id", studentId)
        .eq("quarter", targetQuarter)
        .eq("school_year", targetSchoolYear);

    if (studentRankingError) {
      throw studentRankingError;
    }

    const latestRanking =
      studentRankingRows && studentRankingRows.length > 0
        ? pickLatestRanking(studentRankingRows)
        : null;

    const { data: gwaRows, error: gwaError } = await supabase
      .from("students_gwa")
      .select(
        "student_id, gwa, grading_period, school_year, honor_status, created_at, updated_at"
      )
      .eq("student_id", studentId)
      .eq("grading_period", targetQuarter)
      .eq("school_year", targetSchoolYear);

    if (gwaError) {
      throw gwaError;
    }

    const latestGwa =
      gwaRows && gwaRows.length > 0 ? pickLatestGwa(gwaRows) : null;

    // Determine scoping metadata
    let targetGradeLevel = latestRanking
      ? normalizeGradeLevel(latestRanking)
      : null;
    const fallbackGwa =
      parseGwa(latestRanking?.gwa) ?? parseGwa(latestGwa?.gwa);
    const fallbackHonorStatus =
      latestRanking?.honor_status ?? latestGwa?.honor_status ?? null;

    if (!targetGradeLevel) {
      const { data: studentRow, error: studentError } = await supabase
        .from("students")
        .select("grade_level")
        .eq("id", studentId)
        .maybeSingle();

      if (studentError) {
        throw studentError;
      }

      targetGradeLevel = studentRow?.grade_level ?? null;
    }

    if (!targetGradeLevel) {
      console.log(
        "[rankings] Missing ranking metadata for student:",
        studentId
      );
      return null;
    }

    const { data: peerRows, error: peerError } = await supabase
      .from("student_rankings_optimized")
      .select(
        "id, student_id, grade_level, student_grade_level, quarter, school_year, honor_status, gwa, first_name, last_name, student_number"
      )
      .eq("quarter", targetQuarter)
      .eq("school_year", targetSchoolYear);

    if (peerError) {
      throw peerError;
    }

    const peersForGrade = (peerRows ?? []).filter(
      (row) => normalizeGradeLevel(row) === targetGradeLevel
    );

    const peersWithScores: PeerScoreRow[] = peersForGrade.map((row) => ({
      ...row,
      gwaValue: parseGwa(row.gwa),
    }));

    peersWithScores.sort((a, b) => {
      const scoreA = a.gwaValue ?? -Infinity;
      const scoreB = b.gwaValue ?? -Infinity;

      if (scoreA === scoreB) {
        const lastNameDiff = (a.last_name ?? "").localeCompare(
          b.last_name ?? ""
        );
        if (lastNameDiff !== 0) {
          return lastNameDiff;
        }

        const firstNameDiff = (a.first_name ?? "").localeCompare(
          b.first_name ?? ""
        );
        if (firstNameDiff !== 0) {
          return firstNameDiff;
        }

        return (a.student_number ?? "").localeCompare(b.student_number ?? "");
      }

      return scoreB - scoreA; // Descending (higher GWA is better)
    });

    const scoreRankMap = new Map<number, number>();
    let denseRank = 0;

    peersWithScores.forEach((row) => {
      if (!Number.isFinite(row.gwaValue)) {
        row.computedRank = null;
        return;
      }

      if (!scoreRankMap.has(row.gwaValue)) {
        denseRank += 1;
        scoreRankMap.set(row.gwaValue, denseRank);
      }

      row.computedRank = scoreRankMap.get(row.gwaValue) ?? null;
    });

    const targetPeer = peersWithScores.find(
      (row) => row.student_id === studentId
    );
    let resolvedRank = targetPeer?.computedRank ?? null;
    let resolvedGwa = targetPeer?.gwaValue ?? fallbackGwa ?? null;
    let resolvedHonorStatus =
      targetPeer?.honor_status ?? fallbackHonorStatus ?? null;

    if (!resolvedRank && resolvedGwa !== null) {
      resolvedRank = computeRankForScore(resolvedGwa, scoreRankMap);
    }

    return {
      id: targetPeer?.id ?? latestRanking?.id ?? null,
      student_id: studentId,
      grade_level: targetGradeLevel,
      rank: resolvedRank ?? null,
      honor_status: resolvedHonorStatus,
      quarter: targetQuarter,
      school_year: targetSchoolYear,
      created_at: latestRanking?.created_at ?? null,
      updated_at: latestRanking?.updated_at ?? null,
      total_students: peersWithScores.length,
      gwa: resolvedGwa,
      period_name: academicContext.periodName,
      academic_year_id: academicContext.academicYearId,
      academic_period_id: academicContext.periodId,
    };
  } catch (error) {
    console.error("[rankings] Failed to fetch student ranking:", error);
    return null;
  }
}
