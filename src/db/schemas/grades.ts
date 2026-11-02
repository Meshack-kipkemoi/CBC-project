import {
  pgTable,
  uuid,
  text,
  integer,
  unique,
  check,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { schools } from "./schools";
import { authenticatedRole } from "drizzle-orm/supabase";
import { uid } from "./rls";

// Grades and streams
export const grades = pgTable(
  "grades",
  {
    id: uuid().defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),
    name: text().notNull(),
    level: integer().notNull(),
  },
  (table) => [
    unique().on(table.schoolId, table.level),
    check("grades_level_check", sql`${table.level} between 7 and 9`),
    pgPolicy("grades_select_school_members", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
    select 1 from user_roles ur
    where ur.user_id = ${uid} and ur.school_id = grades.school_id
  )`,
    }),
  ],
);
