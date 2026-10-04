import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  check,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { schools } from "./schools";
import { academicYears } from "./academic-years";
import { terms } from "./terms";
import { learningAreas } from "./learning-areas";
import { assessmentStatus } from "./shared";
import { profiles } from "./profiles";

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
  (table) => [check("assessment_max_score_check", sql`${table.maxScore} > 0`)],
);
