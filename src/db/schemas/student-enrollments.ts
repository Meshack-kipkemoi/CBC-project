import {
  pgTable,
  uuid,
  timestamp,
  index,
  date,
  check,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { students } from "./students";
import { streams } from "./streams";
import { academicYears } from "./academic-years";
import { sql } from "drizzle-orm";
import { authenticatedRole } from "drizzle-orm/supabase";
import { isPrincipalOfStream, uid } from "./rls";

export const studentEnrollments = pgTable(
  "student_enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id)
      .unique(),

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
    pgPolicy("enrollments_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOfStream("student_enrollments.stream_id"),
    }),
    pgPolicy("enrollments_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
    select 1 from class_teacher_assignments cta
    where cta.teacher_id = ${uid}
      and cta.stream_id = student_enrollments.stream_id
      and cta.academic_year_id = student_enrollments.academic_year_id
  )`,
    }),
    pgPolicy("enrollments_select_subject_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
    select 1 from subject_teacher_assignments sta
    where sta.teacher_id = ${uid}
      and sta.stream_id = student_enrollments.stream_id
      and sta.academic_year_id = student_enrollments.academic_year_id
  )`,
    }),
    pgPolicy("enrollments_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
    select 1 from parent_students ps
    where ps.parent_id = ${uid}
      and ps.student_id = student_enrollments.student_id
      and ps.verification_status = 'verified'
  )`,
    }),
  ],
);
