import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

/** A class is "below expectations" when its average % is under this */
export const BELOW_EXPECTATIONS_THRESHOLD = 40;

export type DashboardData = {
  filters: {
    years: {
      id: string;
      name: string;
      terms: { id: string; term_number: number }[];
    }[];
    grades: {
      id: string;
      name: string;
      streams: { id: string; name: string }[];
    }[];
    yearId: string | null;
    termId: string | null; // null = all terms
    gradeId: string | null; // null = all grades
    streamId: string | null; // null = all streams
  };
  stats: {
    learners: number;
    average: number | null;
    results: number;
    assessments: { total: number; published: number };
    classes: { total: number; below: number };
    belowThreshold: number;
  };
  learnersByClass: { id: string; label: string; learners: number }[];
  trend: {
    termId: string;
    label: string;
    average: number | null;
    results: number;
  }[];
};

// ---- Explicit row shapes, so we don't depend on Supabase's inference ----
type TermRow = {
  id: string;
  term_number: number;
  start_date: string;
  end_date: string;
};
type YearRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  terms: TermRow[] | null;
};
type GradeRow = {
  id: string;
  name: string;
  level: number;
  streams: { id: string; name: string }[] | null;
};
type RpcResult = {
  learners: number;
  average: number | null;
  results: number;
  assessments: { total: number; published: number };
  classes: { total: number; below: number };
  by_class: { id: string; label: string; learners: number }[];
  trend: {
    term_id: string;
    term_number: number;
    average: number | null;
    results: number;
  }[];
};

export type DashboardOptions = {
  yearId?: string | null;
  /** undefined = current term (or all terms); "all" = all terms */
  termId?: string | null;
  gradeId?: string | null;
  streamId?: string | null;
};

export async function getDashboard(
  supabase: Client,
  opts: DashboardOptions = {},
): Promise<{ data: DashboardData | null; error: PostgrestError | null }> {
  const [yearsRes, gradesRes] = await Promise.all([
    supabase
      .from("academic_years")
      .select(
        "id, name, start_date, end_date, terms(id, term_number, start_date, end_date)",
      )
      .order("start_date", { ascending: false }),
    supabase
      .from("grades")
      .select("id, name, level, streams(id, name)")
      .order("level", { ascending: true }),
  ]);

  if (yearsRes.error) return { data: null, error: yearsRes.error };
  if (gradesRes.error) return { data: null, error: gradesRes.error };

  const years = ((yearsRes.data ?? []) as unknown as YearRow[]).map((y) => ({
    ...y,
    terms: [...(y.terms ?? [])].sort((a, b) => a.term_number - b.term_number),
  }));
  const grades = ((gradesRes.data ?? []) as unknown as GradeRow[]).map((g) => ({
    id: g.id,
    name: g.name,
    streams: [...(g.streams ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  }));

  const filterOptions = {
    years: years.map(({ id, name, terms }) => ({
      id,
      name,
      terms: terms.map((t) => ({ id: t.id, term_number: t.term_number })),
    })),
    grades,
  };

  const empty = (yearId: string | null): DashboardData => ({
    filters: {
      ...filterOptions,
      yearId,
      termId: null,
      gradeId: null,
      streamId: null,
    },
    stats: {
      learners: 0,
      average: null,
      results: 0,
      assessments: { total: 0, published: 0 },
      classes: { total: 0, below: 0 },
      belowThreshold: BELOW_EXPECTATIONS_THRESHOLD,
    },
    learnersByClass: [],
    trend: [],
  });

  if (years.length === 0) return { data: empty(null), error: null };

  // Year: requested, else the one we're in now, else the newest
  const today = new Date().toISOString().slice(0, 10);
  const year =
    years.find((y) => y.id === opts.yearId) ??
    years.find((y) => y.start_date <= today && today <= y.end_date) ??
    years[0];

  // Term: "all" -> all terms, requested -> that term, nothing -> the current term (if any)
  const term =
    opts.termId === "all"
      ? null
      : opts.termId
        ? (year.terms.find((t) => t.id === opts.termId) ?? null)
        : (year.terms.find(
            (t) => t.start_date <= today && today <= t.end_date,
          ) ?? null);

  const grade = grades.find((g) => g.id === opts.gradeId) ?? null;
  // A stream only counts if it belongs to the chosen grade
  const stream = grade?.streams.find((s) => s.id === opts.streamId) ?? null;

  const { data, error } = await supabase.rpc("dashboard_overview", {
    p_year_id: year.id,
    p_term_id: term?.id,
    p_grade_id: grade?.id,
    p_stream_id: stream?.id,
    p_below_threshold: BELOW_EXPECTATIONS_THRESHOLD,
  });

  if (error) return { data: null, error };

  const r = data as unknown as RpcResult | null;
  if (!r) return { data: empty(year.id), error: null };

  return {
    data: {
      filters: {
        ...filterOptions,
        yearId: year.id,
        termId: term?.id ?? null,
        gradeId: grade?.id ?? null,
        streamId: stream?.id ?? null,
      },
      stats: {
        learners: r.learners,
        average: r.average,
        results: r.results,
        assessments: r.assessments,
        classes: r.classes,
        belowThreshold: BELOW_EXPECTATIONS_THRESHOLD,
      },
      learnersByClass: r.by_class,
      trend: r.trend.map((t) => ({
        termId: t.term_id,
        label: `Term ${t.term_number}`,
        average: t.average,
        results: t.results,
      })),
    },
    error: null,
  };
}
