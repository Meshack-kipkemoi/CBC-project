import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  unique,
  check,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { schools } from "./schools";
import { authenticatedRole } from "drizzle-orm/supabase";
import {
  isClassTeacherOfSchool,
  isPrincipalOf,
  isSubjectTeacherOfSchool,
  isVerifiedParentOfSchool,
} from "./rls";

export const academicYears = pgTable(
  "academic_years",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),

    name: text("name").notNull(), // e.g. "2026"

    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("academic_years_school_name_unique").on(table.schoolId, table.name),

    check(
      "academic_years_valid_date_range",
      sql`${table.startDate} <= ${table.endDate}`,
    ),

    index("academic_years_school_dates_idx").on(
      table.schoolId,
      table.startDate,
      table.endDate,
    ),

    // Principal: all academic years in their school
    pgPolicy("academic_years_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOf("academic_years.school_id"),
    }),

    // Class teacher: years in any school they have a class teacher assignment in
    pgPolicy("academic_years_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isClassTeacherOfSchool("academic_years.school_id"),
    }),

    // Subject teacher: years in any school they have a subject teacher assignment in
    pgPolicy("academic_years_select_subject_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isSubjectTeacherOfSchool("academic_years.school_id"),
    }),

    // Parent: years in schools where they have a verified child
    pgPolicy("academic_years_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: isVerifiedParentOfSchool("academic_years.school_id"),
    }),
  ],
);
