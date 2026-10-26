// lib/queries/student/profile.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getStudent = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("id", id)
    .maybeSingle();
  return data;
});

type Client = SupabaseClient<Database>;

function studentQuery(supabase: Client, id: string) {
  return (
    supabase
      .from("students")
      .select(
        `id, full_name, admission_number, status, date_of_birth, created_at,
         student_enrollments(
           id, stream_id, academic_year_id, start_date, end_date,
           academic_years(name),
           streams(name, grades(name, level))
         ),
         parent_students(
           verification_status, verified_at,
           parent:profiles!parent_id(id, full_name, phone)
         )`,
      )
      .eq("id", id)
      // Newest enrollment first
      .order("start_date", {
        referencedTable: "student_enrollments",
        ascending: false,
      })
      .maybeSingle()
  );
}

// Class teachers for every stream and year the student has been enrolled in
function classTeachersQuery(
  supabase: Client,
  streamIds: string[],
  yearIds: string[],
) {
  return supabase
    .from("class_teacher_assignments")
    .select(
      "stream_id, academic_year_id, teacher:profiles!teacher_id(full_name, phone)",
    )
    .in("stream_id", streamIds)
    .in("academic_year_id", yearIds);
}

type ClassTeacherRows = NonNullable<
  Awaited<ReturnType<typeof classTeachersQuery>>["data"]
>;

/**
 * Loads a student with their enrollments, guardians and the class teacher of
 * each enrollment. Returns `{ data: null }` when no row matches (or RLS hides it).
 */
export async function getStudentProfile(supabase: Client, id: string) {
  const { data: student, error } = await studentQuery(supabase, id);

  if (error || !student) return { data: null, error };

  const enrollments = student.student_enrollments;

  let teachers: ClassTeacherRows = [];
  if (enrollments.length > 0) {
    const res = await classTeachersQuery(
      supabase,
      [...new Set(enrollments.map((e) => e.stream_id))],
      [...new Set(enrollments.map((e) => e.academic_year_id))],
    );

    // The profile is still useful without teacher names, so don't fail the
    // whole request (a role may not be allowed to read these rows).
    if (res.error) console.log(res.error);
    else teachers = res.data;
  }

  return {
    data: {
      ...student,
      student_enrollments: enrollments.map((e) => ({
        ...e,
        class_teacher:
          teachers.find(
            (t) =>
              t.stream_id === e.stream_id &&
              t.academic_year_id === e.academic_year_id,
          )?.teacher ?? null,
      })),
    },
    error: null,
  };
}

export type StudentProfile = NonNullable<
  Awaited<ReturnType<typeof getStudentProfile>>["data"]
>;
