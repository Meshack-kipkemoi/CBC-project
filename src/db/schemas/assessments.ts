import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  check,
  pgEnum,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { schools } from "./schools";
import { academicYears } from "./academic-years";
import { terms } from "./terms";
import { learningAreas } from "./learning-areas";
import { assessmentStatus } from "./shared";
import { profiles } from "./profiles";
import { authenticatedRole } from "drizzle-orm/supabase";
import {
  isClassTeacherOfSchool,
  isPrincipalOf,
  isSubjectTeacherOfSchool,
  isVerifiedParentOfSchool,
} from "./rls";

export const assessmentType = pgEnum("assessment_type", [
  "Classroom Assessment",
  "School Based Assessment",
  "National Examinations",
]);

// Assessments and grading
export const assessments = pgTable(
  "assessments",
  {
    id: uuid().defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    termId: uuid("term_id")
      .notNull()
      .references(() => terms.id),
    learningAreaId: uuid("learning_area_id")
      .notNull()
      .references(() => learningAreas.id),
    name: text().notNull(),
    assessmentType: assessmentType("assessment_type").notNull(),
    maxScore: numeric("max_score", {
      precision: 8,
      scale: 2,
    }).notNull(),
    status: assessmentStatus().default("draft").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("assessment_max_score_check", sql`${table.maxScore} > 0`),

    // Principal: all assessments in their school
    pgPolicy("assessments_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOf("assessments.school_id"),
    }),

    // Class teacher: assessments in schools they teach in
    pgPolicy("assessments_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isClassTeacherOfSchool("assessments.school_id"),
    }),

    // Subject teacher: assessments in schools they teach in
    pgPolicy("assessments_select_subject_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isSubjectTeacherOfSchool("assessments.school_id"),
    }),

    // Parent: assessments in schools where they have a verified child
    pgPolicy("assessments_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: isVerifiedParentOfSchool("assessments.school_id"),
    }),
  ],
);
