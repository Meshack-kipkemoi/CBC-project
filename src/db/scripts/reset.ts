// src/db/scripts/reset.ts
import { sql } from "drizzle-orm";
import { db } from "@/index";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Supabase env vars are missing from environment");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function deleteAuthUsers() {
  console.log("🗑️  Deleting auth users...");
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();

  if (error) throw error;

  for (const user of users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id,
    );
    if (deleteError) {
      console.warn(
        `⚠️  Failed to delete ${user.email}: ${deleteError.message}`,
      );
      continue;
    }
    console.log(`🗑️  Deleted ${user.email}`);
  }
}

async function main() {
  console.log("🧹 Truncating all tables...");
  await db.execute(sql`
    TRUNCATE TABLE
      student_results, assessments, parent_students, student_enrollments,
      students, subject_teacher_assignments, class_teacher_assignments,
      user_roles, profiles, grading_scales, learning_areas, streams,
      grades, terms, academic_years, schools, roles
    RESTART IDENTITY CASCADE;
  `);

  await deleteAuthUsers();

  // remove stale id map so a failed user-creation run can't inject deleted ids
  fs.rmSync(path.resolve("src/db/seeds/.auth-user-ids.json"), { force: true });

  console.log("✅ Database reset complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
