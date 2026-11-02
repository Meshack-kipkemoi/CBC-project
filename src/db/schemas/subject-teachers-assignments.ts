import { pgTable, uuid, unique, index, pgPolicy } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { streams } from "./streams";
import { learningAreas } from "./learning-areas";
import { academicYears } from "./academic-years";
import { authenticatedRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";
import { isPrincipalOfStream, uid } from "./rls";

export const subjectTeacherAssignments = pgTable(
  "subject_teacher_assignments",
  {
    id: uuid().defaultRandom().primaryKey(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => profiles.id),
    streamId: uuid("stream_id")
      .notNull()
      .references(() => streams.id),
    learningAreaId: uuid("learning_area_id")
      .notNull()
      .references(() => learningAreas.id),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
  },
  (table) => [
    unique().on(
      table.teacherId,
      table.streamId,
      table.learningAreaId,
      table.academicYearId,
    ),
    index("subject_teacher_user_idx").on(table.teacherId),
    pgPolicy("subject_teacher_assignments_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`subject_teacher_assignments.teacher_id = ${uid}`,
    }),
    pgPolicy("subject_teacher_assignments_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOfStream("subject_teacher_assignments.stream_id"),
    }),
  ],
);
