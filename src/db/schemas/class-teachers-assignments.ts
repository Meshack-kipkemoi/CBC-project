import { pgTable, uuid, unique, index, pgPolicy } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { streams } from "./streams";
import { academicYears } from "./academic-years";
import { authenticatedRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";
import { isPrincipalOfStream, uid } from "./rls";

// Teacher assignments
export const classTeacherAssignments = pgTable(
  "class_teacher_assignments",
  {
    id: uuid().defaultRandom().primaryKey(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => profiles.id),
    streamId: uuid("stream_id")
      .notNull()
      .references(() => streams.id),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
  },
  (table) => [
    unique().on(table.streamId, table.academicYearId),
    index("class_teacher_user_idx").on(table.teacherId),
    pgPolicy("class_teacher_assignments_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`class_teacher_assignments.teacher_id = ${uid}`,
    }),
    pgPolicy("class_teacher_assignments_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOfStream("class_teacher_assignments.stream_id"),
    }),
  ],
);
