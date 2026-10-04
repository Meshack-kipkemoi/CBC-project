import { pgTable, uuid, text, numeric, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { schools } from "./schools";

export const gradingScales = pgTable(
  "grading_scales",
  {
    id: uuid().defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),
    name: text().notNull(),
    minScore: numeric("min_score", {
      precision: 8,
      scale: 2,
    }).notNull(),
    maxScore: numeric("max_score", {
      precision: 8,
      scale: 2,
    }).notNull(),
    grade: text().notNull(),
    remark: text(),
  },
  (table) => [
    check(
      "grading_scale_range_check",
      sql`${table.minScore} <= ${table.maxScore}`,
    ),
  ],
);
