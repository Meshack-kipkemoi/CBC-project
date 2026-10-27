ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "attendance records: school members" ON "attendance_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
        select 1 from attendance_sessions s
        join user_roles ur on ur.school_id = s.school_id
        where s.id = "attendance_records"."session_id" and ur.user_id = auth.uid()
      ));--> statement-breakpoint
CREATE POLICY "attendance sessions: school members" ON "attendance_sessions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
        select 1 from user_roles ur
        where ur.user_id = auth.uid() and ur.school_id = "attendance_sessions"."school_id"
      ));--> statement-breakpoint
CREATE POLICY "attendance sessions: assigned teachers insert" ON "attendance_sessions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((
        "attendance_sessions"."taken_by" = auth.uid()
        and (
          exists (
            select 1 from class_teacher_assignments cta
            where cta.stream_id = "attendance_sessions"."stream_id"
              and cta.teacher_id = auth.uid()
              and cta.academic_year_id = "attendance_sessions"."academic_year_id"
          )
          or exists (
            select 1 from subject_teacher_assignments sta
            where sta.stream_id = "attendance_sessions"."stream_id"
              and sta.teacher_id = auth.uid()
              and sta.academic_year_id = "attendance_sessions"."academic_year_id"
          )
        )
      ));