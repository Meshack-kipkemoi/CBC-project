import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  unique,
  check,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { assessments } from "./assessments";
import { students } from "./students";
import { profiles } from "./profiles";
import {
  isClassTeacherOfStudentGrade,
  isPrincipalOfStudent,
  isVerifiedParentOf,
} from "./rls";
import { authenticatedRole } from "drizzle-orm/supabase";

export const studentResults = pgTable(
  "student_results",
  {
    id: uuid().defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    score: numeric("score", {
      precision: 8,
      scale: 2,
    }).notNull(),
    grade: text(),
    remark: text(),
    enteredBy: uuid("entered_by")
      .notNull()
      .references(() => profiles.id),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique().on(table.assessmentId, table.studentId),
    check("student_result_score_nonnegative", sql`${table.score} >= 0`),
    index("student_results_student_idx").on(table.studentId),
    index("student_results_assessment_idx").on(table.assessmentId),

    // Principal: every result in their school
    pgPolicy("student_results_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOfStudent("student_results.student_id"),
    }),

    // Parent: only their own verified children
    pgPolicy("student_results_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: isVerifiedParentOf("student_results.student_id"),
    }),

    // Class teacher: own stream + sibling streams of the same grade
    pgPolicy("student_results_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isClassTeacherOfStudentGrade("student_results.student_id"),
    }),
  ],
);
