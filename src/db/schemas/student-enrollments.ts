import {
  pgTable,
  uuid,
  timestamp,
  index,
  date,
  check,
} from "drizzle-orm/pg-core";
import { students } from "./students";
import { streams } from "./streams";
import { academicYears } from "./academic-years";
import { sql } from "drizzle-orm";

export const studentEnrollments = pgTable(
  "student_enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),

    streamId: uuid("stream_id")
      .notNull()
      .references(() => streams.id),

    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),

    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("student_enrollments_student_year_idx").on(
      table.studentId,
      table.academicYearId,
    ),

    index("student_enrollments_stream_year_idx").on(
      table.streamId,
      table.academicYearId,
    ),

    check(
      "enrollment_dates_check",
      sql`${table.endDate} is null or ${table.startDate} <= ${table.endDate}`,
    ),
  ],
);
