import {
  pgTable,
  uuid,
  integer,
  date,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { academicYears } from "./academic-years";

// Terms and curriculum
export const terms = pgTable(
  "terms",
  {
    id: uuid().defaultRandom().primaryKey(),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    termNumber: integer("term_number").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
  },
  (table) => [
    unique().on(table.academicYearId, table.termNumber),
    check("terms_number_check", sql`${table.termNumber} between 1 and 3`),
    check("terms_dates_check", sql`${table.startDate} <= ${table.endDate}`),
  ],
);
