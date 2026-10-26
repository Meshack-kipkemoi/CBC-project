// lib/queries/student/subject-performance.ts
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

/** A subject is "at risk" when its latest % is this many points below the previous assessment */
export const AT_RISK_DROP = 20;

export type AssessmentPoint = {
  id: string;
  name: string;
  type: string;
  score: number;
  max_score: number;
  percentage: number;
  grade: string | null;
  remark: string | null;
  term_id: string;
  term_number: number;
  created_at: string;
};

export type SubjectSummary = {
  id: string;
  name: string;
  code: string;
  average: number | null; // mean % in the selected scope
  latest: number | null; // % of the latest assessment in scope
  previous: number | null; // % of the assessment right before it
  change: number | null; // latest - previous (percentage points)
  direction: "up" | "down" | "flat" | "none";
  grade: string | null; // grade stored on the latest result
  atRisk: boolean;
  assessments: AssessmentPoint[]; // in scope, chronological
};

export type SubjectPerformanceData = {
  filters: {
    years: {
      id: string;
      name: string;
      terms: { id: string; term_number: number }[];
    }[];
    yearId: string | null;
    termId: string | null; // null = all terms
  };
  summary: { average: number | null; assessments: number; subjects: number };
  trend: {
    termId: string;
    label: string;
    average: number | null;
    assessments: number;
  }[];
  atRisk: SubjectSummary[];
  subjects: SubjectSummary[];
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (xs: number[]) =>
  xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : null;

// Years (with their terms) the student has been enrolled in + the streams
function enrollmentYearsQuery(supabase: Client, studentId: string) {
  return supabase
    .from("student_enrollments")
    .select(
      `stream_id, academic_year_id,
       academic_years(id, name, start_date, end_date,
         terms(id, term_number, start_date, end_date))`,
    )
    .eq("student_id", studentId);
}

// All published results of the student in one academic year
function resultsQuery(supabase: Client, studentId: string, yearId: string) {
  return supabase
    .from("student_results")
    .select(
      `id, score, grade, remark,
       assessments!inner(
         id, name, assessment_type, max_score, created_at, term_id,
         learning_areas(id, name, code),
         terms(term_number)
       )`,
    )
    .eq("student_id", studentId)
    .eq("assessments.academic_year_id", yearId)
    .neq("assessments.status", "draft");
}

// Subjects taught to the student's stream(s), so subjects with no results still show
function assignedSubjectsQuery(
  supabase: Client,
  streamIds: string[],
  yearId: string,
) {
  return supabase
    .from("subject_teacher_assignments")
    .select("learning_areas(id, name, code)")
    .in("stream_id", streamIds)
    .eq("academic_year_id", yearId);
}

const emptyData = (
  years: SubjectPerformanceData["filters"]["years"],
): SubjectPerformanceData => ({
  filters: { years, yearId: years[0]?.id ?? null, termId: null },
  summary: { average: null, assessments: 0, subjects: 0 },
  trend: [],
  atRisk: [],
  subjects: [],
});

export async function getSubjectPerformance(
  supabase: Client,
  studentId: string,
  opts: { yearId?: string | null; termId?: string | null } = {},
): Promise<{
  data: SubjectPerformanceData | null;
  error: PostgrestError | null;
}> {
  const { data: enrollments, error } = await enrollmentYearsQuery(
    supabase,
    studentId,
  );
  if (error) return { data: null, error };

  // Unique years, newest first
  const yearMap = new Map<
    string,
    {
      id: string;
      name: string;
      start_date: string;
      end_date: string;
      terms: { id: string; term_number: number }[];
    }
  >();
  for (const e of enrollments) {
    const y = e.academic_years;
    if (!y) continue;
    yearMap.set(y.id, {
      id: y.id,
      name: y.name,
      start_date: y.start_date,
      end_date: y.end_date,
      terms: [...y.terms]
        .sort((a, b) => a.term_number - b.term_number)
        .map((t) => ({ id: t.id, term_number: t.term_number })),
    });
  }
  const years = [...yearMap.values()].sort((a, b) =>
    b.start_date.localeCompare(a.start_date),
  );
  const yearOptions = years.map(({ id, name, terms }) => ({ id, name, terms }));

  if (years.length === 0) return { data: emptyData([]), error: null };

  // Default: the year we're currently in, otherwise the most recent one
  const today = new Date().toISOString().slice(0, 10);
  const year =
    years.find((y) => y.id === opts.yearId) ??
    years.find((y) => y.start_date <= today && today <= y.end_date) ??
    years[0];
  const term = year.terms.find((t) => t.id === opts.termId) ?? null;

  const streamIds = [
    ...new Set(
      enrollments
        .filter((e) => e.academic_year_id === year.id)
        .map((e) => e.stream_id),
    ),
  ];

  const [results, assigned] = await Promise.all([
    resultsQuery(supabase, studentId, year.id),
    streamIds.length > 0
      ? assignedSubjectsQuery(supabase, streamIds, year.id)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (results.error) return { data: null, error: results.error };
  // Subjects still show from results if a role can't read the assignments
  if (assigned.error) console.log(assigned.error);

  // ---- Group results by subject ------------------------------------------
  type Bucket = {
    id: string;
    name: string;
    code: string;
    points: AssessmentPoint[];
  };
  const buckets = new Map<string, Bucket>();
  const bucket = (la: { id: string; name: string; code: string }) => {
    let b = buckets.get(la.id);
    if (!b) {
      b = { id: la.id, name: la.name, code: la.code, points: [] };
      buckets.set(la.id, b);
    }
    return b;
  };

  for (const row of assigned.data ?? []) {
    if (row.learning_areas) bucket(row.learning_areas);
  }

  for (const r of results.data) {
    const a = r.assessments;
    if (!a?.learning_areas) continue;
    const score = Number(r.score);
    const max = Number(a.max_score);
    bucket(a.learning_areas).points.push({
      id: r.id,
      name: a.name,
      type: String(a.assessment_type),
      score,
      max_score: max,
      percentage: max > 0 ? round1((score / max) * 100) : 0,
      grade: r.grade,
      remark: r.remark,
      term_id: a.term_id,
      term_number: a.terms?.term_number ?? 0,
      created_at: a.created_at,
    });
  }

  // No assessment date column exists, so order by term, then creation time
  const chronological = (a: AssessmentPoint, b: AssessmentPoint) =>
    a.term_number - b.term_number || a.created_at.localeCompare(b.created_at);

  const allPoints: AssessmentPoint[] = [];

  const subjects: SubjectSummary[] = [...buckets.values()]
    .map((b) => {
      const all = b.points.sort(chronological);
      allPoints.push(...all);

      const scoped = term ? all.filter((p) => p.term_id === term.id) : all;
      const latest = scoped[scoped.length - 1] ?? null;
      // "previous" looks across the whole year, so the first assessment of
      // Term 2 is still compared with the last one of Term 1
      const previous = latest ? (all[all.indexOf(latest) - 1] ?? null) : null;
      const change =
        latest && previous
          ? round1(
              ((latest.percentage - previous.percentage) /
                previous.percentage) *
                100,
            )
          : null;

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        average: mean(scoped.map((p) => p.percentage)),
        latest: latest?.percentage ?? null,
        previous: previous?.percentage ?? null,
        change,
        direction:
          change === null
            ? "none"
            : change > 0
              ? "up"
              : change < 0
                ? "down"
                : "flat",
        grade: latest?.grade ?? null,
        atRisk: change !== null && change <= -AT_RISK_DROP,
        assessments: scoped,
      } satisfies SubjectSummary;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const withData = subjects.filter((s) => s.average !== null);

  return {
    data: {
      filters: {
        years: yearOptions,
        yearId: year.id,
        termId: term?.id ?? null,
      },
      summary: {
        average: mean(withData.map((s) => s.average as number)),
        assessments: subjects.reduce((n, s) => n + s.assessments.length, 0),
        subjects: subjects.length,
      },
      trend: year.terms.map((t) => {
        const pts = allPoints.filter((p) => p.term_id === t.id);
        return {
          termId: t.id,
          label: `Term ${t.term_number}`,
          average: mean(pts.map((p) => p.percentage)),
          assessments: pts.length,
        };
      }),
      atRisk: subjects.filter((s) => s.atRisk),
      subjects,
    },
    error: null,
  };
}
