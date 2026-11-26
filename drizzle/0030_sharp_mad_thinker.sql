ALTER TABLE "schools" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "county" text;--> statement-breakpoint
ALTER POLICY "schools_select_member" ON "schools" TO authenticated USING (exists (
        select 1 from user_roles ur
        where ur.school_id = schools.id
        and ur.user_id = (select auth.uid())
      ));