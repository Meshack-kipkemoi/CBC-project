import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { schools } from "./schools";
import { studentStatus } from "./shared";
import { sql } from "drizzle-orm";
import { authenticatedRole } from "drizzle-orm/supabase";

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

    // Principal: every student in their school
    pgPolicy("students_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = (select auth.uid())
        and r.name = 'principal'
        and ur.school_id = students.school_id
    )`,
    }),

    // Class teacher: students enrolled in the stream they're assigned to
    pgPolicy("students_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
      select 1 from class_teacher_assignments cta
      join student_enrollments se
        on se.stream_id = cta.stream_id
       and se.academic_year_id = cta.academic_year_id
      where cta.teacher_id = (select auth.uid())
        and se.student_id = students.id
    )`,
    }),

    // Subject teacher: students in the streams where they teach a subject
    pgPolicy("students_select_subject_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
      select 1 from subject_teacher_assignments sta
      join student_enrollments se
        on se.stream_id = sta.stream_id
       and se.academic_year_id = sta.academic_year_id
      where sta.teacher_id = (select auth.uid())
        and se.student_id = students.id
    )`,
    }),

    // Parent: only their own verified children
    pgPolicy("students_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
      select 1 from parent_students ps
      where ps.parent_id = (select auth.uid())
        and ps.student_id = students.id
        and ps.verification_status = 'verified'
    )`,
    }),
  ],
);

export type InsertStudent = typeof students.$inferInsert;
export type SelectStudent = typeof students.$inferSelect;
