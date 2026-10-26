CREATE POLICY "parent_students_select_principal" ON "parent_students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
    is_principal_of(
      (select auth.uid()),
      (select s.school_id from students s where s.id = parent_students.student_id)
    )
  );