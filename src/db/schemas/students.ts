import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
  pgPolicy,
  date,
} from "drizzle-orm/pg-core";
import { schools } from "./schools";
import { studentStatus } from "./shared";
import { authenticatedRole } from "drizzle-orm/supabase";
import {
  isClassTeacherOfStudent,
  isPrincipalOf,
  isSubjectTeacherOfStudent,
  isVerifiedParentOf,
} from "./rls";

// Students and enrolments
export const students = pgTable(
  "students",
  {
    id: uuid().defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),
    admissionNumber: text("admission_number").notNull(),
    fullName: text("full_name").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    status: studentStatus().default("active").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique().on(table.schoolId, table.admissionNumber),
    index("students_school_idx").on(table.schoolId),

    pgPolicy("students_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOf("students.school_id"),
    }),
    pgPolicy("students_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isClassTeacherOfStudent("students.id"),
    }),
    pgPolicy("students_select_subject_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isSubjectTeacherOfStudent("students.id"),
    }),
    pgPolicy("students_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: isVerifiedParentOf("students.id"),
    }),
  ],
);

export type InsertStudent = typeof students.$inferInsert;
export type SelectStudent = typeof students.$inferSelect;
