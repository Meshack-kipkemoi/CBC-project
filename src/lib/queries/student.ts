// lib/queries/student.ts
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export function studentQuery(supabase: SupabaseClient<Database>, id: string) {
  return supabase
    .from("students")
    .select(
      `id, full_name, admission_number, status,
       student_enrollments(end_date, streams(name, grades(name, level)))`,
    )
    .eq("id", id);
}

export const getStudent = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("id", id)
    .maybeSingle();
  return data;
});

// One student row exactly as Supabase returns it
export type Student = QueryData<ReturnType<typeof studentQuery>>[number];
