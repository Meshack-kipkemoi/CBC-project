import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*  Tunable rules                                                             */
/* -------------------------------------------------------------------------- */
const NEEDS_SUPPORT_BELOW = 50; // a learner below this in a subject needs support
const SUBJECT_GOOD_AT = 70; // subject class average at/above this => "good"
const SUBJECT_WATCH_AT = 60; // at/above this => "watch", below => "warning"
const PROGRESSION_POINTS = 6; // assessments shown in the term progression chart
const TREND_DELTA = 2; // change (in % points) needed to call a trend up/down

type Tone = "good" | "watch" | "warning";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
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
const classAverage = (rows: ResultRow[]) =>
  mean([...studentAverages(rows).values()]);

const toneFor = (score: number): Tone =>
  score >= SUBJECT_GOOD_AT
    ? "good"
    : score >= SUBJECT_WATCH_AT
      ? "watch"
      : "warning";

const joinNames = (names: string[]) => names.join(" and ");

const fail = (step: string, error: { message: string }) =>
  NextResponse.json({ error: `${step}: ${error.message}` }, { status: 500 });

/* -------------------------------------------------------------------------- */
/*  GET /api/analytics?stream_id=<optional>                                   */
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

  // 2. Teacher profile + the class(es) they teach this academic year
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

  // 3. Learners currently enrolled in that stream
  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from("student_enrollments")
    .select("students!inner(id, full_name, admission_number, status)")
    .eq("stream_id", current.stream_id)
    .eq("academic_year_id", current.academic_year_id)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .eq("students.status", "active");

  if (enrollmentError) return fail("enrollments", enrollmentError);

  const students = (
    (enrollmentData ?? []) as unknown as { students: StudentRow }[]
  ).map((e) => e.students);
  const studentIds = students.map((s) => s.id);

  // 4. Terms and published results
  const [termsRes, resultsRes] = await Promise.all([
    supabase
      .from("terms")
      .select("id, term_number, start_date")
      .eq("academic_year_id", current.academic_year_id)
      .order("term_number"),
    studentIds.length
      ? supabase
          .from("student_results")
          .select(
            "student_id, score, updated_at, assessments!inner(id, name, max_score, created_at, term_id, learning_area_id, learning_areas(name))",
          )
          .in("student_id", studentIds)
          .eq("assessments.academic_year_id", current.academic_year_id)
          .neq("assessments.status", "draft") // only published assessments
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (termsRes.error) return fail("terms", termsRes.error);
  if (resultsRes.error) return fail("results", resultsRes.error);

  const terms = termsRes.data ?? [];
  const allResults = (resultsRes.data ?? []) as unknown as ResultRow[];

  // 5. Active term = latest started term that has results (same rule as the dashboard)
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

  // 6. Headline metrics
  const currentAvg = classAverage(termResults);
  const previousAvg = classAverage(previousResults);
  const assessed = new Set(termResults.map((r) => r.student_id)).size;
  const total = students.length;

  // 7. Performance by subject: class average per learning area, best first
  const areaGroups = [
    ...groupBy(
      termResults,
      (r) => r.assessments.learning_areas?.name ?? "Unknown",
    ),
  ].map(([name, rows]) => {
    const perStudent = [...studentAverages(rows).values()];
    return {
      name,
      average: mean(perStudent)!,
      belowThreshold: perStudent.filter((avg) => avg < NEEDS_SUPPORT_BELOW)
        .length,
      belowStudentIds: [...studentAverages(rows)]
        .filter(([, avg]) => avg < NEEDS_SUPPORT_BELOW)
        .map(([id]) => id),
    };
  });

  const subjects = areaGroups
    .slice()
    .sort((a, b) => b.average - a.average)
    .map((a) => ({
      name: a.name,
      score: round(a.average),
      tone: toneFor(a.average),
    }));

  const strongest = subjects[0] ?? null;

  // 8. Term progression: class average on each of the last N assessments this term
  const progression = [
    ...groupBy(termResults, (r) => r.assessments.id).values(),
  ]
    .map((rows) => ({
      createdAt: rows[0].assessments.created_at,
      name: rows[0].assessments.name,
      value: mean(rows.map(percent))!,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-PROGRESSION_POINTS)
    .map((p) => ({
      label: new Date(p.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "Africa/Nairobi",
      }),
      name: p.name,
      value: round(p.value),
    }));

  // Growth this term = last point minus first point
  let growth: { value: number; label: string } | null = null;
  if (progression.length >= 2) {
    const diff =
      progression[progression.length - 1].value - progression[0].value;
    growth = {
      value: diff,
      label:
        diff >= TREND_DELTA
          ? "Steady upward movement"
          : diff <= -TREND_DELTA
            ? "Downward movement this term"
            : "Holding steady",
    };
  }

  // 9. Class signal (plain-language summary under the chart)
  let classSignal = "Not enough results yet to show a class signal.";
  if (progression.length >= 2 && subjects.length > 0) {
    const diff = growth!.value;
    const trendText =
      diff >= TREND_DELTA
        ? "The class is progressing consistently."
        : diff <= -TREND_DELTA
          ? "Class results have dipped this term."
          : "Class results are holding steady.";

    const needSupport = subjects
      .filter((s) => s.tone !== "good")
      .slice(-2) // weakest two (list is sorted best -> worst)
      .reverse()
      .map((s) => s.name);

    const supportText = needSupport.length
      ? `${joinNames(needSupport)} ${needSupport.length === 1 ? "is" : "are"} the clearest ${needSupport.length === 1 ? "opportunity" : "opportunities"} for targeted support.`
      : "No learning area currently needs targeted support.";

    classSignal = `${trendText} ${supportText}`;
  }

  // 10. AI-assisted insight: the subjects with the most learners below the line
  const focusAreas = areaGroups
    .filter((a) => a.belowThreshold > 0)
    .sort((a, b) => b.belowThreshold - a.belowThreshold)
    .slice(0, 2);

  let insight: { headline: string; body: string; focusAreas: string[] } | null =
    null;

  if (focusAreas.length > 0) {
    const names = focusAreas.map((a) => a.name);
    const affected = new Set(focusAreas.flatMap((a) => a.belowStudentIds)).size;
    insight = {
      headline: `Prioritise ${joinNames(names)}.`,
      body: `${affected} ${affected === 1 ? "learner is" : "learners are"} below ${NEEDS_SUPPORT_BELOW}% in ${joinNames(names)}. Consider a two-week small-group cycle, then compare evidence in the next assessment.`,
      focusAreas: names,
    };
  }

  // 11. Response
  return NextResponse.json(
    {
      date: today,
      teacher: {
        fullName: profileRes.data.full_name,
        initials: initialsOf(profileRes.data.full_name),
      },
      class: {
        streamId: current.stream_id,
        streamName: current.streams?.name ?? null,
        gradeName: current.streams?.grades?.name ?? null,
        academicYear: current.academic_years.name,
        termNumber: activeTerm?.term_number ?? null,
      },
      metrics: {
        classAverage: currentAvg === null ? null : round(currentAvg),
        changeFromLastTerm:
          currentAvg !== null && previousAvg !== null
            ? round(currentAvg - previousAvg)
            : null,
        learnersAssessed: {
          assessed,
          total,
          coverage: total ? round((assessed / total) * 100) : 0,
        },
        strongestArea: strongest
          ? { name: strongest.name, average: strongest.score }
          : null,
        growth,
      },
      subjects,
      progression,
      classSignal,
      insight,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
