ALTER TABLE "schools" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "schools_select_member" ON "schools" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
      select 1 from user_roles ur
      where ur.school_id = schools.id
      and ur.user_id = (select auth.uid())
      ));