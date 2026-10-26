import {
  pgTable,
  timestamp,
  index,
  date,
  check,
  pgPolicy,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { students } from "./students";
import { streams } from "./streams";
import { academicYears } from "./academic-years";
import { sql } from "drizzle-orm";
import { authenticatedRole } from "drizzle-orm/supabase";
import {
  isClassTeacherOfStream,
  isPrincipalOfStream,
  isSubjectTeacherOfStream,
  isVerifiedParentOf,
} from "./rls";

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
    // A student can have many enrollments, but only one that is still open
    uniqueIndex("one_active_enrollment_per_student")
      .on(table.studentId)
      .where(sql`${table.endDate} is null`),

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
    pgPolicy("enrollments_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOfStream("student_enrollments.stream_id"),
    }),
    pgPolicy("enrollments_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isClassTeacherOfStream(
        "student_enrollments.stream_id",
        "student_enrollments.academic_year_id",
      ),
    }),
    pgPolicy("enrollments_select_subject_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isSubjectTeacherOfStream(
        "student_enrollments.stream_id",
        "student_enrollments.academic_year_id",
      ),
    }),
    pgPolicy("enrollments_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: isVerifiedParentOf("student_enrollments.student_id"),
    }),
  ],
);
