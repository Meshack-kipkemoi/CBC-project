import {
  index,
  pgTable,
  timestamp,
  uuid,
  date,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { schools } from "./schools";
import { academicYears } from "./academic-years";
import { terms } from "./terms";
import { streams } from "./streams";
import { learningAreas } from "./learning-areas";
import { profiles } from "./profiles";

export const attendanceSessions = pgTable(
  "attendance_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),

    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),

    termId: uuid("term_id")
      .notNull()
      .references(() => terms.id),

    streamId: uuid("stream_id")
      .notNull()
      .references(() => streams.id),

    // Null means a class/homeroom attendance session.
    learningAreaId: uuid("learning_area_id").references(() => learningAreas.id),

    sessionDate: date("session_date").notNull(),

    takenBy: uuid("taken_by")
      .notNull()
      .references(() => profiles.id),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("attendance_sessions_year_idx").on(
      table.academicYearId,
      table.streamId,
    ),

    // RLS Policies
    pgPolicy("attendance sessions: school members", {
      for: "select",
      to: "authenticated",
      using: sql`exists (
        select 1 from user_roles ur
        where ur.user_id = auth.uid() and ur.school_id = ${table.schoolId}
      )`,
    }),

    pgPolicy("attendance sessions: assigned teachers insert", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(
        ${table.takenBy} = auth.uid()
        and (
          exists (
            select 1 from class_teacher_assignments cta
            where cta.stream_id = ${table.streamId}
              and cta.teacher_id = auth.uid()
              and cta.academic_year_id = ${table.academicYearId}
          )
          or exists (
            select 1 from subject_teacher_assignments sta
            where sta.stream_id = ${table.streamId}
              and sta.teacher_id = auth.uid()
              and sta.academic_year_id = ${table.academicYearId}
          )
        )
      )`,
    }),
  ],
);
