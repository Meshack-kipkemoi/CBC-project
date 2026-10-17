// lib/queries/students.ts
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const PAGE_SIZE = 25;

export function studentsQuery(
  supabase: SupabaseClient<Database>,
  { cursor, search }: { cursor: number; search: string },
) {
  let query = supabase
    .from("students")
    .select(
      `id, full_name, admission_number, status,
       student_enrollments(end_date, streams(name, grades(name, level)))`,
      { count: "exact" },
    )
    .order("full_name")
    .order("id")
    .range(cursor, cursor + PAGE_SIZE - 1);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,admission_number.ilike.%${search}%`,
    );
  }

  return query;
}

// One student row exactly as Supabase returns it
export type StudentRow = QueryData<ReturnType<typeof studentsQuery>>[number];

export type StudentsPage = {
  rows: StudentRow[];
  nextCursor: number | null;
};
