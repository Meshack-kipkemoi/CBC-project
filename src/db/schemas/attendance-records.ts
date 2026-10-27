import {
  index,
  pgTable,
  text,
  unique,
  uuid,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { attendanceSessions } from "./attendance-sessions";
import { students } from "./students";
import { attendanceStatus } from "./attendance-status";

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    sessionId: uuid("session_id")
      .notNull()
      .references(() => attendanceSessions.id, { onDelete: "cascade" }),

    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),

    status: attendanceStatus("status").notNull(),

    note: text("note"),
  },
  (table) => [
    index("attendance_records_session_idx").on(table.sessionId),
    unique("attendance_records_session_student_key").on(
      table.sessionId,
      table.studentId,
    ),

    // RLS Policy
    pgPolicy("attendance records: school members", {
      for: "select",
      to: "authenticated",
      using: sql`exists (
        select 1 from attendance_sessions s
        join user_roles ur on ur.school_id = s.school_id
        where s.id = ${table.sessionId} and ur.user_id = auth.uid()
      )`,
    }),
  ],
);
