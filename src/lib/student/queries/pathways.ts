import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { computeReadiness, type RawResult } from "@/lib/student/data/pathways";

export async function getStudentPathwayReadiness(
  supabase: SupabaseClient<Database>,
  studentId: string,
) {
  const { data, error } = await supabase
    .from("student_results")
    .select(
      `score,
       assessments!inner(
         max_score, status,
         learning_areas(code),
         terms(id, term_number, academic_years(name))
       )`,
    )
    .eq("student_id", studentId)
    // Draft assessments aren't final, so they don't count
    .eq("assessments.status", "published");

  if (error) return { data: null, error };

  const results: RawResult[] = data.flatMap((row) => {
    const assessment = row.assessments;
    const code = assessment?.learning_areas?.code;
    const term = assessment?.terms;
    const max = Number(assessment?.max_score);

    if (!assessment || !code || !term || !max) return [];

    return [
      {
        code,
        percent: (Number(row.score) / max) * 100,
        termId: term.id,
        termNumber: term.term_number,
        year: term.academic_years?.name ?? "",
      },
    ];
  });

  return { data: computeReadiness(results), error: null };
}
