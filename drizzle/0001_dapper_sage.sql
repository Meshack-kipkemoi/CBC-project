ALTER TABLE "class_teacher_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "grades" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "parent_students" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "streams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_enrollments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "class_teacher_assignments_select_own" ON "class_teacher_assignments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (class_teacher_assignments.teacher_id = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "class_teacher_assignments_select_principal" ON "class_teacher_assignments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1 from streams s
  join grades g on g.id = s.grade_id
  join user_roles ur on ur.school_id = g.school_id
  join roles r on r.id = ur.role_id
  where s.id = class_teacher_assignments.stream_id
    and ur.user_id = (select auth.uid())
    and r.name = 'principal'
));--> statement-breakpoint
CREATE POLICY "grades_select_school_members" ON "grades" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
    select 1 from user_roles ur
    where ur.user_id = (select auth.uid()) and ur.school_id = grades.school_id
  ));--> statement-breakpoint
CREATE POLICY "parent_students_select_own" ON "parent_students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (parent_students.parent_id = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "roles_select_all" ON "roles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "streams_select_school_members" ON "streams" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
    select 1 from grades g
    join user_roles ur on ur.school_id = g.school_id
    where g.id = streams.grade_id and ur.user_id = (select auth.uid())
  ));--> statement-breakpoint
CREATE POLICY "enrollments_select_principal" ON "student_enrollments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1 from streams s
  join grades g on g.id = s.grade_id
  join user_roles ur on ur.school_id = g.school_id
  join roles r on r.id = ur.role_id
  where s.id = student_enrollments.stream_id
    and ur.user_id = (select auth.uid())
    and r.name = 'principal'
));--> statement-breakpoint
CREATE POLICY "enrollments_select_class_teacher" ON "student_enrollments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
    select 1 from class_teacher_assignments cta
    where cta.teacher_id = (select auth.uid())
      and cta.stream_id = student_enrollments.stream_id
      and cta.academic_year_id = student_enrollments.academic_year_id
  ));--> statement-breakpoint
CREATE POLICY "enrollments_select_subject_teacher" ON "student_enrollments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
    select 1 from subject_teacher_assignments sta
    where sta.teacher_id = (select auth.uid())
      and sta.stream_id = student_enrollments.stream_id
      and sta.academic_year_id = student_enrollments.academic_year_id
  ));--> statement-breakpoint
CREATE POLICY "enrollments_select_parent" ON "student_enrollments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
    select 1 from parent_students ps
    where ps.parent_id = (select auth.uid())
      and ps.student_id = student_enrollments.student_id
      and ps.verification_status = 'verified'
  ));--> statement-breakpoint
CREATE POLICY "subject_teacher_assignments_select_own" ON "subject_teacher_assignments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (subject_teacher_assignments.teacher_id = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "subject_teacher_assignments_select_principal" ON "subject_teacher_assignments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1 from streams s
  join grades g on g.id = s.grade_id
  join user_roles ur on ur.school_id = g.school_id
  join roles r on r.id = ur.role_id
  where s.id = subject_teacher_assignments.stream_id
    and ur.user_id = (select auth.uid())
    and r.name = 'principal'
));--> statement-breakpoint
CREATE POLICY "user_roles_select_own" ON "user_roles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (user_roles.user_id = (select auth.uid()));