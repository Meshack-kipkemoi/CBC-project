import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*  Tunable rules                                                             */
/* -------------------------------------------------------------------------- */
const DEMO_STUDENT_NAME = "Joy Akinyi"; // child shown by default while building
const VERIFIED_STATUS = "verified"; // value of verification_status on parent_students
const SUBJECT_GOOD_AT = 70; // subject average at/above this => "good"
const SUBJECT_WATCH_AT = 60; // at/above this => "watch", below => "warning"
const TREND_POINTS = 6; // assessments shown on the progress chart

type Tone = "good" | "watch" | "warning";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
type StudentRow = {
  id: string;
  full_name: string;
  admission_number: string;
  status: string;
};

type EnrollmentRow = {
  stream_id: string;
  academic_year_id: string;
  start_date: string;
  end_date: string | null;
  academic_years: { name: string; start_date: string; end_date: string };
  streams: { name: string; grades: { name: string } | null } | null;
};

type ResultRow = {
  score: number;
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

const firstNameOf = (name: string) => name.split(/\s+/)[0] ?? name;

const todayInNairobi = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(
    new Date(),
  );

const toneFor = (score: number): Tone =>
  score >= SUBJECT_GOOD_AT
    ? "good"
    : score >= SUBJECT_WATCH_AT
      ? "watch"
      : "warning";

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

/** Average % per learning area, keyed by area name. */
function subjectAverages(rows: ResultRow[]) {
  const out = new Map<string, number>();
  for (const [name, areaRows] of groupBy(
    rows,
    (r) => r.assessments.learning_areas?.name ?? "Unknown",
  )) {
    const avg = mean(areaRows.map(percent));
    if (avg !== null) out.set(name, avg);
  }
  return out;
}

/** Overall progress = mean of the subject averages. */
const overallAverage = (rows: ResultRow[]) =>
  mean([...subjectAverages(rows).values()]);

/** One point per assessment (oldest -> newest), last N only. */
function assessmentSeries(rows: ResultRow[]) {
  return [...groupBy(rows, (r) => r.assessments.id).values()]
    .map((group) => ({
      createdAt: group[0].assessments.created_at,
      name: group[0].assessments.name,
      value: mean(group.map(percent))!,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-TREND_POINTS)
    .map((p) => ({
      label: new Date(p.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "Africa/Nairobi",
      }),
      name: p.name,
      value: round(p.value),
    }));
}

const fail = (step: string, error: { message: string }) =>
  NextResponse.json({ error: `${step}: ${error.message}` }, { status: 500 });

/* -------------------------------------------------------------------------- */
/*  GET /api/parents/dashboard?student_id=<optional>                          */
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

  const requestedStudentId = new URL(request.url).searchParams.get(
    "student_id",
  );
  const today = todayInNairobi();

  // 2. Parent profile + their verified children
  const [profileRes, linksRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("parent_students")
      .select("students!inner(id, full_name, admission_number, status)")
      .eq("parent_id", user.id)
      .eq("verification_status", VERIFIED_STATUS),
  ]);

  if (profileRes.error) return fail("profile", profileRes.error);
  if (linksRes.error) return fail("children", linksRes.error);

  let children = (
    (linksRes.data ?? []) as unknown as { students: StudentRow }[]
  ).map((l) => l.students);

  // Development fallback: if this parent isn't linked to anyone yet, look the
  // demo student up by name (RLS still decides whether the row is visible).
  if (children.length === 0 && process.env.NODE_ENV !== "production") {
    const { data: demo } = await supabase
      .from("students")
      .select("id, full_name, admission_number, status")
      .ilike("full_name", DEMO_STUDENT_NAME)
      .limit(1);
    children = (demo ?? []) as StudentRow[];
  }

  if (children.length === 0) {
    return NextResponse.json(
      { error: "No verified child is linked to your account." },
      { status: 404 },
    );
  }

  const student =
    children.find((c) => c.id === requestedStudentId) ??
    children.find(
      (c) => c.full_name.toLowerCase() === DEMO_STUDENT_NAME.toLowerCase(),
    ) ??
    children[0];

  // 3. The child's current class (grade, stream, academic year)
  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from("student_enrollments")
    .select(
      "stream_id, academic_year_id, start_date, end_date, academic_years!inner(name, start_date, end_date), streams(name, grades(name))",
    )
    .eq("student_id", student.id)
    .order("start_date", { ascending: false });

  if (enrollmentError) return fail("enrollment", enrollmentError);

  const enrollments = (enrollmentData ?? []) as unknown as EnrollmentRow[];
  const enrollment =
    enrollments.find(
      (e) =>
        e.academic_years.start_date <= today &&
        e.academic_years.end_date >= today,
    ) ?? enrollments[0];

  if (!enrollment) {
    return NextResponse.json(
      { error: `${student.full_name} is not enrolled in any class yet.` },
      { status: 404 },
    );
  }

  // 4. Terms + published results for that academic year
  const [termsRes, resultsRes] = await Promise.all([
    supabase
      .from("terms")
      .select("id, term_number, start_date")
      .eq("academic_year_id", enrollment.academic_year_id)
      .order("term_number"),
    supabase
      .from("student_results")
      .select(
        "score, assessments!inner(id, name, max_score, created_at, term_id, learning_area_id, learning_areas(name))",
      )
      .eq("student_id", student.id)
      .eq("assessments.academic_year_id", enrollment.academic_year_id)
      .neq("assessments.status", "draft"), // only published assessments
  ]);

  if (termsRes.error) return fail("terms", termsRes.error);
  if (resultsRes.error) return fail("results", resultsRes.error);

  const terms = termsRes.data ?? [];
  const allResults = (resultsRes.data ?? []) as unknown as ResultRow[];

  // 5. Active term = latest started term that has results (same rule as teacher pages)
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

  // 6. Overall progress
  const currentAvg = overallAverage(termResults);
  const previousAvg = overallAverage(previousResults);
  const change =
    currentAvg !== null && previousAvg !== null
      ? round(currentAvg - previousAvg)
      : null;

  // 7. Subject performance (best first) with change vs. previous term
  const previousBySubject = subjectAverages(previousResults);
  const subjects = [...subjectAverages(termResults)]
    .sort((a, b) => b[1] - a[1])
    .map(([name, avg]) => {
      const prev = previousBySubject.get(name);
      return {
        name,
        score: round(avg),
        change: prev === undefined ? null : round(avg - prev),
        tone: toneFor(avg),
      };
    });

  const onTrack = subjects.filter((s) => s.tone !== "warning").length;

  // 8. Latest published assessment this term
  const latestRows = termResults.length
    ? [...groupBy(termResults, (r) => r.assessments.id).values()].sort((a, b) =>
        b[0].assessments.created_at.localeCompare(a[0].assessments.created_at),
      )[0]
    : null;

  const latestAssessment = latestRows
    ? {
        name: latestRows[0].assessments.name,
        subject: latestRows[0].assessments.learning_areas?.name ?? null,
        date: new Date(latestRows[0].assessments.created_at).toLocaleDateString(
          "en-GB",
          { day: "numeric", month: "short", timeZone: "Africa/Nairobi" },
        ),
        percent: round(mean(latestRows.map(percent))!),
      }
    : null;

  // 9. This term's focus: the two weakest subjects
  const firstName = firstNameOf(student.full_name);
  const weakest = subjects.slice(-2).reverse(); // lowest first
  let focus: {
    headline: string;
    body: string;
    subjects: { name: string; score: number }[];
  } | null = null;

  if (weakest.length > 0) {
    const [lowest] = weakest;
    focus =
      lowest.tone === "good"
        ? {
            headline: "Keep up the strong work",
            body: `${firstName} is performing well in every subject. Keep up the regular practice to hold on to these results.`,
            subjects: weakest.map((s) => ({ name: s.name, score: s.score })),
          }
        : {
            headline: `Build confidence in ${lowest.name}`,
            body: `${firstName} is at ${lowest.score}% in ${lowest.name}. Two focused practice sessions per week can help close the remaining gap.`,
            subjects: weakest.map((s) => ({ name: s.name, score: s.score })),
          };
  }

  // 10. Response
  return NextResponse.json(
    {
      date: today,
      parent: {
        fullName: profileRes.data.full_name,
        firstName: firstNameOf(profileRes.data.full_name),
      },
      child: {
        id: student.id,
        fullName: student.full_name,
        firstName,
        initials: initialsOf(student.full_name),
        admissionNumber: student.admission_number,
        gradeName: enrollment.streams?.grades?.name ?? null,
        streamName: enrollment.streams?.name ?? null,
        academicYear: enrollment.academic_years.name,
        termNumber: activeTerm?.term_number ?? null,
      },
      children: children.map((c) => ({
        id: c.id,
        fullName: c.full_name,
        initials: initialsOf(c.full_name),
      })),
      stats: {
        overallProgress: {
          value: currentAvg === null ? null : round(currentAvg),
          changeFromLastTerm: change,
        },
        subjectsOnTrack: { onTrack, total: subjects.length },
        assessmentsCompleted: new Set(termResults.map((r) => r.assessments.id))
          .size,
        latestAssessment,
      },
      trend: {
        current: assessmentSeries(termResults),
        previous: assessmentSeries(previousResults),
      },
      focus,
      subjects,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
