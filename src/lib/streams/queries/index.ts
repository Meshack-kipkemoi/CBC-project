import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export const LEVELS = ["EE", "ME", "AE", "BE"] as const;
export type Level = (typeof LEVELS)[number];
export type StreamsRole = "principal" | "class_teacher";

export type StreamStat = {
  id: string;
  name: string;
  label: string; // "Grade 8 West"
  gradeId: string;
  gradeName: string;
  isMine: boolean;
  teacher: string | null;
  learners: number;
  results: number;
  average: number | null;
  levels: Record<Level, number>;
  meetingRate: number | null; // % of results graded EE or ME
  gradeAverage: number | null;
  vsGrade: number | null; // average - gradeAverage (points)
  change: number | null; // vs previous term with data (points)
  rank: number | null; // within the grade
  rankOf: number;
  subjects: {
    id: string;
    name: string;
    code: string;
    average: number | null;
    results: number;
  }[];
  trend: { termId: string; label: string; average: number | null }[];
};

export type StreamsData = {
  role: StreamsRole;
  filters: {
    years: {
      id: string;
      name: string;
      terms: { id: string; term_number: number }[];
    }[];
    grades: { id: string; name: string }[];
    yearId: string | null;
    termId: string | null; // null = all terms
    gradeId: string | null; // null = all grades
  };
  summary: {
    streams: number;
    learners: number;
    average: number | null;
    top: { label: string; average: number } | null;
    lowest: { label: string; average: number } | null;
  };
  streams: StreamStat[];
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
type RpcResult = {
  grades: { id: string; name: string }[];
  streams: {
    id: string;
    name: string;
    grade_id: string;
    grade_name: string;
    is_mine: boolean;
    teacher: string | null;
    learners: number;
    results: number;
    average: number | null;
    levels: Partial<Record<Level, number>>;
  }[];
  subjects: {
    stream_id: string;
    id: string;
    name: string;
    code: string;
    average: number | null;
    results: number;
  }[];
  trend: {
    stream_id: string;
    term_id: string;
    term_number: number;
    average: number | null;
  }[];
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export type StreamsOptions = {
  yearId?: string | null;
  /** undefined = current term (or all terms); "all" = all terms */
  termId?: string | null;
  gradeId?: string | null;
};

/** `null` when the user may not see the Streams page at all */
export async function getStreamsAccess(
  supabase: Client,
): Promise<StreamsRole | null> {
  const { data, error } = await supabase.rpc("streams_access");
  if (error) {
    console.log(error);
    return null;
  }
  return data === "principal" || data === "class_teacher" ? data : null;
}

export async function getStreams(
  supabase: Client,
  opts: StreamsOptions = {},
): Promise<{
  data: StreamsData | null;
  error: PostgrestError | null;
  forbidden?: boolean;
}> {
  const role = await getStreamsAccess(supabase);
  if (!role) return { data: null, error: null, forbidden: true };

  const yearsRes = await supabase
    .from("academic_years")
    .select(
      "id, name, start_date, end_date, terms(id, term_number, start_date, end_date)",
    )
    .order("start_date", { ascending: false });
  if (yearsRes.error) return { data: null, error: yearsRes.error };

  const years = ((yearsRes.data ?? []) as unknown as YearRow[]).map((y) => ({
    ...y,
    terms: [...(y.terms ?? [])].sort((a, b) => a.term_number - b.term_number),
  }));
  const yearOptions = years.map(({ id, name, terms }) => ({
    id,
    name,
    terms: terms.map((t) => ({ id: t.id, term_number: t.term_number })),
  }));

  const empty = (
    yearId: string | null,
    grades: StreamsData["filters"]["grades"] = [],
  ): StreamsData => ({
    role,
    filters: {
      years: yearOptions,
      grades,
      yearId,
      termId: null,
      gradeId: null,
    },
    summary: {
      streams: 0,
      learners: 0,
      average: null,
      top: null,
      lowest: null,
    },
    streams: [],
  });

  if (years.length === 0) return { data: empty(null), error: null };

  // Year: requested, else the one we're in now, else the newest
  const today = new Date().toISOString().slice(0, 10);
  const year =
    years.find((y) => y.id === opts.yearId) ??
    years.find((y) => y.start_date <= today && today <= y.end_date) ??
    years[0];

  // Term: "all" -> all terms, requested -> that term, nothing -> the current term
  const term =
    opts.termId === "all"
      ? null
      : opts.termId
        ? (year.terms.find((t) => t.id === opts.termId) ?? null)
        : (year.terms.find(
            (t) => t.start_date <= today && today <= t.end_date,
          ) ?? null);

  const { data, error } = await supabase.rpc("streams_overview", {
    p_year_id: year.id,
    p_term_id: term?.id,
    p_grade_id: opts.gradeId ?? undefined,
  });
  if (error) return { data: null, error };

  const r = data as unknown as RpcResult | null;
  if (!r) return { data: empty(year.id), error: null };

  // ---- Index subjects and trend by stream ----
  const subjectsBy = new Map<string, StreamStat["subjects"]>();
  for (const s of r.subjects) {
    const list = subjectsBy.get(s.stream_id) ?? [];
    list.push({
      id: s.id,
      name: s.name,
      code: s.code,
      average: s.average,
      results: s.results,
    });
    subjectsBy.set(s.stream_id, list);
  }

  const trendBy = new Map<
    string,
    {
      termId: string;
      termNumber: number;
      label: string;
      average: number | null;
    }[]
  >();
  for (const t of r.trend) {
    const list = trendBy.get(t.stream_id) ?? [];
    list.push({
      termId: t.term_id,
      termNumber: t.term_number,
      label: `Term ${t.term_number}`,
      average: t.average,
    });
    trendBy.set(t.stream_id, list);
  }

  // Grade averages, weighted by number of results
  const gradeTotals = new Map<string, { sum: number; n: number }>();
  for (const s of r.streams) {
    if (s.average === null || s.results === 0) continue;
    const t = gradeTotals.get(s.grade_id) ?? { sum: 0, n: 0 };
    t.sum += s.average * s.results;
    t.n += s.results;
    gradeTotals.set(s.grade_id, t);
  }

  const streams: StreamStat[] = r.streams.map((s) => {
    const levels: Record<Level, number> = {
      EE: s.levels.EE ?? 0,
      ME: s.levels.ME ?? 0,
      AE: s.levels.AE ?? 0,
      BE: s.levels.BE ?? 0,
    };
    const graded = LEVELS.reduce((n, l) => n + levels[l], 0);

    const gt = gradeTotals.get(s.grade_id);
    const gradeAverage = gt && gt.n > 0 ? round1(gt.sum / gt.n) : null;

    const trend = (trendBy.get(s.id) ?? []).sort(
      (a, b) => a.termNumber - b.termNumber,
    );
    const withData = trend.filter((p) => p.average !== null);
    const idx = term
      ? withData.findIndex((p) => p.termId === term.id)
      : withData.length - 1;
    const cur = idx >= 0 ? withData[idx] : null;
    const prev = idx > 0 ? withData[idx - 1] : null;

    return {
      id: s.id,
      name: s.name,
      label: `${s.grade_name} ${s.name}`,
      gradeId: s.grade_id,
      gradeName: s.grade_name,
      isMine: s.is_mine,
      teacher: s.teacher,
      learners: s.learners,
      results: s.results,
      average: s.average,
      levels,
      meetingRate:
        graded > 0 ? round1(((levels.EE + levels.ME) / graded) * 100) : null,
      gradeAverage,
      vsGrade:
        s.average !== null && gradeAverage !== null
          ? round1(s.average - gradeAverage)
          : null,
      change:
        cur && prev
          ? round1((cur.average as number) - (prev.average as number))
          : null,
      rank: null,
      rankOf: 0,
      subjects: (subjectsBy.get(s.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      trend: trend.map(({ termId, label, average }) => ({
        termId,
        label,
        average,
      })),
    };
  });

  // Rank inside each grade (comparing Grade 7 with Grade 9 isn't meaningful)
  const byGrade = new Map<string, StreamStat[]>();
  for (const s of streams) {
    byGrade.set(s.gradeId, [...(byGrade.get(s.gradeId) ?? []), s]);
  }
  for (const group of byGrade.values()) {
    const ranked = group
      .filter((s) => s.average !== null)
      .sort((a, b) => (b.average as number) - (a.average as number));
    ranked.forEach((s, i) => (s.rank = i + 1));
    group.forEach((s) => (s.rankOf = ranked.length));
  }

  // ---- Summary ----
  const withAvg = streams
    .filter((s) => s.average !== null)
    .sort((a, b) => (b.average as number) - (a.average as number));
  const totalResults = withAvg.reduce((n, s) => n + s.results, 0);
  const pick = (s: StreamStat | undefined) =>
    s && withAvg.length > 1
      ? { label: s.label, average: s.average as number }
      : null;

  return {
    data: {
      role,
      filters: {
        years: yearOptions,
        grades: r.grades,
        yearId: year.id,
        termId: term?.id ?? null,
        gradeId: r.grades.find((g) => g.id === opts.gradeId)?.id ?? null,
      },
      summary: {
        streams: streams.length,
        learners: streams.reduce((n, s) => n + s.learners, 0),
        average:
          totalResults > 0
            ? round1(
                withAvg.reduce(
                  (n, s) => n + (s.average as number) * s.results,
                  0,
                ) / totalResults,
              )
            : null,
        top: pick(withAvg[0]),
        lowest: pick(withAvg[withAvg.length - 1]),
      },
      streams,
    },
    error: null,
  };
}
