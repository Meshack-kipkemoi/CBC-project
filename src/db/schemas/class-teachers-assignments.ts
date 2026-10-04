import { pgTable, uuid, unique, index } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { streams } from "./streams";
import { academicYears } from "./academic-years";

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
  ],
);
