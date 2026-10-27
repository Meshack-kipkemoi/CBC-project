import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  requireUser,
  type AccountError,
  type QueryResult,
} from "@/lib/account/queries";
import {
  GRADES_VIEWS,
  type GradesData,
  type GradesReport,
  type GradesView,
} from "@/lib/grades";

type Client = SupabaseClient<Database>;

const fail = (
  status: number,
  message: string,
): { data: null; error: AccountError } => ({
  data: null,
  error: { status, message },
});

export async function getGradesReport(
  supabase: Client,
  options: { view?: GradesView; termId?: string },
): Promise<QueryResult<GradesReport>> {
  const { data: user, error: authError } = await requireUser(supabase);
  if (authError) return { data: null, error: authError };

  // The current academic year is the latest one
  const { data: year, error: yearError } = await supabase
    .from("academic_years")
    .select("id, name")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (yearError) return fail(500, yearError.message);
  if (!year) return fail(404, "No academic year has been set up yet.");

  const [rolesRes, classRes, subjectRes, termsRes] = await Promise.all([
    supabase.from("user_roles").select("roles(name)").eq("user_id", user.id),
    supabase
      .from("class_teacher_assignments")
      .select("stream_id, streams(name, grades(name))")
      .eq("teacher_id", user.id)
      .eq("academic_year_id", year.id),
    supabase
      .from("subject_teacher_assignments")
      .select("stream_id, learning_area_id, learning_areas(name)")
      .eq("teacher_id", user.id)
      .eq("academic_year_id", year.id),
    supabase
      .from("terms")
      .select("id, term_number")
      .eq("academic_year_id", year.id)
      .order("term_number"),
  ]);

  const failed = [rolesRes, classRes, subjectRes, termsRes].find(
    (res) => res.error,
  );
  if (failed?.error) return fail(500, failed.error.message);

  const isPrincipal = (rolesRes.data ?? []).some(
    (r) => r.roles?.name === "principal",
  );
  const classRows = classRes.data ?? [];
  const subjectRows = subjectRes.data ?? [];
  const terms = termsRes.data ?? [];

  // Which views this user is allowed to open
  const available = GRADES_VIEWS.filter((v) =>
    v === "school"
      ? isPrincipal
      : v === "class"
        ? classRows.length > 0
        : subjectRows.length > 0,
  );
  if (available.length === 0) {
    return fail(403, "You don't have access to school performance.");
  }

  const view =
    options.view && available.includes(options.view)
      ? options.view
      : available[0]!;

  const termId =
    options.termId && terms.some((t) => t.id === options.termId)
      ? options.termId
      : null;

  // Only the scope for the chosen view is sent to the database
  const { data, error } = await supabase.rpc("grades_report", {
    p_year_id: year.id,
    p_term_id: termId ?? undefined,
    p_stream_ids:
      view === "class" ? classRows.map((r) => r.stream_id) : undefined,
    p_pairs:
      view === "subjects"
        ? subjectRows.map((r) => ({
            stream_id: r.stream_id,
            learning_area_id: r.learning_area_id,
          }))
        : undefined,
  });

  if (error) return fail(500, error.message);
  if (!data) return fail(500, "The report came back empty.");

  const report = data as unknown as GradesData;

  // With a small class the same student could be in both lists
  const topIds = new Set(report.topStudents.map((s) => s.id));

  const scopeLabel =
    view === "school"
      ? "Whole school"
      : view === "class"
        ? classRows
            .map((r) =>
              r.streams
                ? `${r.streams.grades?.name ?? ""} · ${r.streams.name}`
                : "",
            )
            .filter(Boolean)
            .sort()
            .join(", ")
        : [
            ...new Set(
              subjectRows.flatMap((r) =>
                r.learning_areas?.name ? [r.learning_areas.name] : [],
              ),
            ),
          ].join(", ");

  return {
    data: {
      ...report,
      supportStudents: report.supportStudents.filter((s) => !topIds.has(s.id)),
      view,
      availableViews: available,
      scopeLabel,
      year: { id: year.id, name: year.name },
      terms: terms.map((t) => ({ id: t.id, termNumber: t.term_number })),
      termId,
    },
    error: null,
  };
}
