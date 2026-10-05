import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*  Tunable rules – change these to match your school's definitions           */
/* -------------------------------------------------------------------------- */
const NEEDS_SUPPORT_BELOW = 50; // average % below this => "Needs support"
const WATCH_BELOW = 65; // average % below this => "Watch closely"
const TREND_POINTS = 6; // how many points in a learner's sparkline
const CHART_MONTHS = 6; // how many months in the class performance chart
const NEW_WINDOW_DAYS = 7; // what counts as "new this week"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
type Tone = "warning" | "watch" | "good" | "none";

type Assignment = {
  stream_id: string;
  academic_year_id: string;
  academic_years: { name: string };
  streams: { name: string; grades: { name: string } | null } | null;
};

type StudentRow = { id: string; full_name: string; admission_number: string };

type ResultRow = {
  student_id: string;
  score: number;
  updated_at: string;
  assessments: {
    id: string;
    name: string;
    max_score: number;
    created_at: string;
    term_id: string;
    learning_area_id: string;
    learning_areas: { name: string } | null;
  };
};

type GuardianRow = {
  student_id: string;
  parent: { full_name: string } | null;
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const round = (n: number) => Math.round(n);

const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

const percent = (r: ResultRow) =>
  (Number(r.score) / Number(r.assessments.max_score)) * 100;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

// "YYYY-MM-DD" in Kenya time, so "today" matches what teachers see
const todayInNairobi = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(
    new Date(),
  );

function groupBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}

/** Average % per student (each student's mean of their own result percentages). */
function studentAverages(rows: ResultRow[]) {
  const out = new Map<string, number>();
  for (const [studentId, studentRows] of groupBy(rows, (r) => r.student_id)) {
    const avg = mean(studentRows.map(percent));
    if (avg !== null) out.set(studentId, avg);
  }
  return out;
}

/** Class average = mean of the individual student averages. */
function classAverage(rows: ResultRow[]) {
  return mean([...studentAverages(rows).values()]);
}

function levelFor(avg: number | null): { level: string; tone: Tone } {
  if (avg === null) return { level: "No data yet", tone: "none" };
  if (avg < NEEDS_SUPPORT_BELOW)
    return { level: "Needs support", tone: "warning" };
  if (avg < WATCH_BELOW) return { level: "Watch closely", tone: "watch" };
  return { level: "On track", tone: "good" };
}

function buildNote(
  firstName: string,
  avg: number | null,
  strengths: string[],
  focus: string[],
) {
  if (avg === null)
    return `${firstName} has no published assessment results yet this term.`;
  const good = strengths.join(" and ");
  const support = focus.join(" and ");
  if (good && support)
    return `${firstName} is performing well in ${good} but may benefit from extra support in ${support}.`;
  if (good) return `${firstName} is performing well in ${good}.`;
  if (support)
    return `${firstName} may benefit from extra support in ${support}.`;
  return `${firstName} has limited results so far.`;
}

const fail = (step: string, error: { message: string }) =>
  NextResponse.json({ error: `${step}: ${error.message}` }, { status: 500 });

/* -------------------------------------------------------------------------- */
/*  GET /api/dashboard?stream_id=<optional>                                   */
/* -------------------------------------------------------------------------- */
export async function GET(request: Request) {
  const supabase = await createClient();

  // 1. Who is asking?
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedStreamId = new URL(request.url).searchParams.get("stream_id");
  const today = todayInNairobi();

  // 2. Teacher profile + the class(es) they are class teacher of this year
  const [profileRes, assignmentsRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("class_teacher_assignments")
      .select(
        "stream_id, academic_year_id, academic_years!inner(name, start_date, end_date), streams(name, grades(name))",
      )
      .eq("teacher_id", user.id)
      .lte("academic_years.start_date", today)
      .gte("academic_years.end_date", today),
  ]);

  if (profileRes.error) return fail("profile", profileRes.error);
  if (assignmentsRes.error) return fail("assignments", assignmentsRes.error);

  const assignments = (assignmentsRes.data ?? []) as unknown as Assignment[];
  if (assignments.length === 0) {
    return NextResponse.json(
      { error: "You have no class assigned for the current academic year." },
      { status: 404 },
    );
  }

  const current =
    assignments.find((a) => a.stream_id === requestedStreamId) ??
    assignments[0];
  const streamId = current.stream_id;
  const yearId = current.academic_year_id;

  // 3. Learners currently enrolled in that stream
  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from("student_enrollments")
    .select("students!inner(id, full_name, admission_number, status)")
    .eq("stream_id", streamId)
    .eq("academic_year_id", yearId)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .eq("students.status", "active");

  if (enrollmentError) return fail("enrollments", enrollmentError);

  const students = (
    (enrollmentData ?? []) as unknown as { students: StudentRow }[]
  ).map((e) => e.students);
  const studentIds = students.map((s) => s.id);

  // 4. Terms, results and guardians (skipped if the class is empty)
  const [termsRes, resultsRes, guardiansRes] = await Promise.all([
    supabase
      .from("terms")
      .select("id, term_number, start_date")
      .eq("academic_year_id", yearId)
      .order("term_number"),
    studentIds.length
      ? supabase
          .from("student_results")
          .select(
            "student_id, score, updated_at, assessments!inner(id, name, max_score, created_at, term_id, learning_area_id, learning_areas(name))",
          )
          .in("student_id", studentIds)
          .eq("assessments.academic_year_id", yearId)
          .neq("assessments.status", "draft") // only published assessments
      : Promise.resolve({ data: [], error: null }),
    studentIds.length
      ? supabase
          .from("parent_students")
          .select(
            "student_id, parent:profiles!parent_students_parent_id_profiles_id_fkey(full_name)",
          )
          .in("student_id", studentIds)
          .not("verified_at", "is", null) // only verified guardians
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (termsRes.error) return fail("terms", termsRes.error);
  if (resultsRes.error) return fail("results", resultsRes.error);
  if (guardiansRes.error) return fail("guardians", guardiansRes.error);

  const terms = termsRes.data ?? [];
  const allResults = (resultsRes.data ?? []) as unknown as ResultRow[];
  const guardianRows = (guardiansRes.data ?? []) as unknown as GuardianRow[];

  // 5. Work out the "active" term = latest started term that has results
  const termIdsWithResults = new Set(
    allResults.map((r) => r.assessments.term_id),
  );
  const startedTerms = terms.filter(
    (t) => t.start_date <= today && termIdsWithResults.has(t.id),
  );
  const activeTerm = startedTerms[startedTerms.length - 1] ?? null;
  const previousTerm = startedTerms[startedTerms.length - 2] ?? null;

  const termResults = activeTerm
    ? allResults.filter((r) => r.assessments.term_id === activeTerm.id)
    : [];
  const previousResults = previousTerm
    ? allResults.filter((r) => r.assessments.term_id === previousTerm.id)
    : [];

  // 6. Per-learner breakdown
  const termByStudent = groupBy(termResults, (r) => r.student_id);
  const allByStudent = groupBy(allResults, (r) => r.student_id);
  const guardianByStudent = new Map<string, string>();
  for (const g of guardianRows) {
    if (g.parent && !guardianByStudent.has(g.student_id)) {
      guardianByStudent.set(g.student_id, g.parent.full_name);
    }
  }

  const newCutoff = Date.now() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  let newlyFlagged = 0;

  const learners = students.map((student) => {
    const rows = termByStudent.get(student.id) ?? [];
    const average = mean(rows.map(percent));
    const { level, tone } = levelFor(average);

    // Strengths / focus = best and weakest learning areas this term
    const areaAverages = [
      ...groupBy(rows, (r) => r.assessments.learning_areas?.name ?? "Unknown"),
    ]
      .map(([name, areaRows]) => ({ name, avg: mean(areaRows.map(percent))! }))
      .sort((a, b) => b.avg - a.avg);

    const strengths = areaAverages.slice(0, 2).map((a) => a.name);
    const focus = areaAverages
      .slice()
      .reverse()
      .filter((a) => !strengths.includes(a.name))
      .slice(0, 2)
      .map((a) => a.name);

    // Was this learner already below the line before this week?
    if (tone === "warning") {
      const prior = mean(
        rows
          .filter((r) => new Date(r.updated_at).getTime() < newCutoff)
          .map(percent),
      );
      if (prior === null || prior >= NEEDS_SUPPORT_BELOW) newlyFlagged += 1;
    }

    // Trend + last assessment use the whole year, oldest -> newest
    const history = (allByStudent.get(student.id) ?? [])
      .slice()
      .sort((a, b) =>
        a.assessments.created_at.localeCompare(b.assessments.created_at),
      );

    return {
      id: student.id,
      name: student.full_name,
      initials: initialsOf(student.full_name),
      admissionNumber: student.admission_number,
      level,
      levelTone: tone,
      average: average === null ? null : round(average),
      attendance: null as number | null, // no attendance table in the schema yet
      strengths,
      focus,
      note: buildNote(
        student.full_name.split(" ")[0],
        average,
        strengths,
        focus,
      ),
      guardian: guardianByStudent.get(student.id) ?? null,
      lastAssessment: history.length
        ? history[history.length - 1].assessments.created_at
        : null,
      trend: history.slice(-TREND_POINTS).map((r) => round(percent(r))),
    };
  });

  // Most in need of attention first; learners with no data go last
  learners.sort((a, b) => (a.average ?? 1000) - (b.average ?? 1000));

  // 7. Headline metrics
  const currentAvg = classAverage(termResults);
  const previousAvg = classAverage(previousResults);
  const assessedCount = new Set(termResults.map((r) => r.student_id)).size;
  const needSupportCount = learners.filter(
    (l) => l.levelTone === "warning",
  ).length;

  // 8. Class performance chart: average % per month, last N months with data
  const monthly = [
    ...groupBy(allResults, (r) => r.assessments.created_at.slice(0, 7)),
  ]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-CHART_MONTHS)
    .map(([month, rows]) => ({
      month: new Date(`${month}-01T00:00:00Z`).toLocaleString("en-GB", {
        month: "short",
        timeZone: "UTC",
      }),
      value: round(mean(rows.map(percent))!),
    }));

  // 9. AI-style insight: learning area with most learners below the line
  let insight: {
    learningArea: string;
    belowThresholdCount: number;
    threshold: number;
  } | null = null;

  for (const [area, rows] of groupBy(
    termResults,
    (r) => r.assessments.learning_areas?.name ?? "Unknown",
  )) {
    const below = [...studentAverages(rows).values()].filter(
      (avg) => avg < NEEDS_SUPPORT_BELOW,
    ).length;
    if (below > 0 && (!insight || below > insight.belowThresholdCount)) {
      insight = {
        learningArea: area,
        belowThresholdCount: below,
        threshold: NEEDS_SUPPORT_BELOW,
      };
    }
  }

  // 10. Response
  return NextResponse.json(
    {
      date: today,
      teacher: {
        fullName: profileRes.data.full_name,
        initials: initialsOf(profileRes.data.full_name),
      },
      class: {
        streamId,
        streamName: current.streams?.name ?? null,
        gradeName: current.streams?.grades?.name ?? null,
        academicYear: current.academic_years.name,
        termNumber: activeTerm?.term_number ?? null,
      },
      classes: assignments.map((a) => ({
        streamId: a.stream_id,
        streamName: a.streams?.name ?? null,
        gradeName: a.streams?.grades?.name ?? null,
      })),
      metrics: {
        classAverage: currentAvg === null ? null : round(currentAvg),
        changeFromLastTerm:
          currentAvg !== null && previousAvg !== null
            ? round(currentAvg - previousAvg)
            : null,
        learners: { total: students.length, assessed: assessedCount },
        needIntervention: {
          total: needSupportCount,
          newThisWeek: newlyFlagged,
        },
        attendance: null as number | null, // needs an attendance table
      },
      performance: monthly,
      insight,
      learners,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
