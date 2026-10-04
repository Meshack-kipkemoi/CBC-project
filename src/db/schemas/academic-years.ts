import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  unique,
  check,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { schools } from "./schools";

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
  ],
);
