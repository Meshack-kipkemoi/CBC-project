import {
  pgTable,
  uuid,
  text,
  integer,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { schools } from "./schools";

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
  ],
);
