ALTER TABLE "terms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "terms_select_principal" ON "terms" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_principal_of_term((select auth.uid()), terms.id));--> statement-breakpoint
CREATE POLICY "terms_select_class_teacher" ON "terms" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_class_teacher_of_term((select auth.uid()), terms.id));--> statement-breakpoint
CREATE POLICY "terms_select_subject_teacher" ON "terms" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_subject_teacher_of_term((select auth.uid()), terms.id));--> statement-breakpoint
CREATE POLICY "terms_select_parent" ON "terms" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_verified_parent_of_term((select auth.uid()), terms.id));