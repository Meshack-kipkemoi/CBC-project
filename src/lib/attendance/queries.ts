import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "late",
  "excused",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export type AttendanceRole = "principal" | "class_teacher" | "subject_teacher";

export type AttendanceStream = {
  id: string;
  name: string;
  label: string; // "Grade 8 West"
  gradeId: string;
  gradeName: string;
  isMine: boolean;
  teacher: string | null;
  learners: number;
  sessions: number;
  records: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number | null; // % attended (present + late)
  trend: { termId: string; label: string; rate: number }[];
};

export type AttendanceData = {
  role: AttendanceRole;
  filters: {
    years: {
      id: string;
      name: string;
      terms: { id: string; term_number: number }[];
    }[];
    grades: { id: string; name: string }[];
    yearId: string | null;
    termId: string | null; // null = all terms
    gradeId: string | null; // null = all grades (principal only)
  };
  learningAreas: { id: string; name: string; code: string }[];
  summary: {
    streams: number;
    learners: number;
    sessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number | null;
  };
  streams: AttendanceStream[];
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
  learningAreas: { id: string; name: string; code: string }[];
  streams: {
    id: string;
    name: string;
    grade_id: string;
    grade_name: string;
    is_mine: boolean;
    teacher: string | null;
    learners: number;
    sessions: number;
    records: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }[];
  trend: { stream_id: string; term_number: number; rate: number }[];
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export type AttendanceOptions = {
  yearId?: string | null;
  /** undefined = current term (or all terms); "all" = all terms */
  termId?: string | null;
  gradeId?: string | null;
  /** subject_teacher only: filter to one learning area's sessions */
  learningAreaId?: string | null;
};

/** `null` when the user may not see the Attendance page at all */
export async function getAttendanceAccess(
  supabase: Client,
): Promise<AttendanceRole | null> {
  const { data, error } = await supabase.rpc("attendance_access");
  if (error) {
    console.log(error);
    return null;
  }
  return data === "principal" ||
    data === "class_teacher" ||
    data === "subject_teacher"
    ? data
    : null;
}

export async function getAttendance(
  supabase: Client,
  opts: AttendanceOptions = {},
): Promise<{
  data: AttendanceData | null;
  error: PostgrestError | null;
  forbidden?: boolean;
}> {
  const role = await getAttendanceAccess(supabase);
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
    grades: AttendanceData["filters"]["grades"] = [],
  ): AttendanceData => ({
    role,
    filters: {
      years: yearOptions,
      grades,
      yearId,
      termId: null,
      gradeId: null,
    },
    learningAreas: [],
    summary: {
      streams: 0,
      learners: 0,
      sessions: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      rate: null,
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

  const { data, error } = await supabase.rpc("attendance_overview", {
    p_year_id: year.id,
    p_term_id: term?.id,
    p_grade_id: role === "principal" ? (opts.gradeId ?? undefined) : undefined,
    p_learning_area_id:
      role === "subject_teacher"
        ? (opts.learningAreaId ?? undefined)
        : undefined,
  });
  if (error) return { data: null, error };

  const r = data as unknown as RpcResult | null;
  if (!r) return { data: empty(year.id), error: null };

  const trendBy = new Map<string, { term_number: number; rate: number }[]>();
  for (const t of r.trend) {
    trendBy.set(t.stream_id, [
      ...(trendBy.get(t.stream_id) ?? []),
      { term_number: t.term_number, rate: t.rate },
    ]);
  }

  const streams: AttendanceStream[] = r.streams.map((s) => ({
    id: s.id,
    name: s.name,
    label: `${s.grade_name} ${s.name}`,
    gradeId: s.grade_id,
    gradeName: s.grade_name,
    isMine: s.is_mine,
    teacher: s.teacher,
    learners: s.learners,
    sessions: s.sessions,
    records: s.records,
    present: s.present,
    absent: s.absent,
    late: s.late,
    excused: s.excused,
    rate:
      s.records > 0 ? round1(((s.present + s.late) / s.records) * 100) : null,
    trend: [...(trendBy.get(s.id) ?? [])]
      .sort((a, b) => a.term_number - b.term_number)
      .map((t) => ({
        termId: `t${t.term_number}`,
        label: `Term ${t.term_number}`,
        rate: t.rate,
      })),
  }));

  const totals = streams.reduce(
    (acc, s) => ({
      present: acc.present + s.present,
      absent: acc.absent + s.absent,
      late: acc.late + s.late,
      excused: acc.excused + s.excused,
      records: acc.records + s.records,
      sessions: acc.sessions + s.sessions,
    }),
    { present: 0, absent: 0, late: 0, excused: 0, records: 0, sessions: 0 },
  );

  return {
    data: {
      role,
      filters: {
        years: yearOptions,
        grades: r.grades,
        yearId: year.id,
        termId: term?.id ?? null,
        gradeId:
          role === "principal"
            ? (r.grades.find((g) => g.id === opts.gradeId)?.id ?? null)
            : null,
      },
      learningAreas: r.learningAreas,
      summary: {
        streams: streams.length,
        learners: streams.reduce((n, s) => n + s.learners, 0),
        sessions: totals.sessions,
        present: totals.present,
        absent: totals.absent,
        late: totals.late,
        excused: totals.excused,
        rate:
          totals.records > 0
            ? round1(((totals.present + totals.late) / totals.records) * 100)
            : null,
      },
      streams,
    },
    error: null,
  };
}
