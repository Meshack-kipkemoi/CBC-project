import { pgTable, text, unique, pgPolicy, uuid } from "drizzle-orm/pg-core";
import { grades } from "./grades";
import { authenticatedRole } from "drizzle-orm/supabase";
import { uid } from "./rls";
import { sql } from "drizzle-orm";

const streamSchool = sql`(select g.school_id from grades g where g.id = streams.grade_id)`;

export const streams = pgTable(
  "streams",
  {
    id: uuid().defaultRandom().primaryKey(),
    gradeId: uuid("grade_id")
      .notNull()
      .references(() => grades.id),
    name: text().notNull(),
  },
  (table) => [
    unique().on(table.gradeId, table.name),

    pgPolicy("streams_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: sql`is_principal_of(${uid}, ${streamSchool})`,
    }),
    pgPolicy("streams_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`is_class_teacher_of_school(${uid}, ${streamSchool})`,
    }),
    pgPolicy("streams_select_subject_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`is_subject_teacher_of_school(${uid}, ${streamSchool})`,
    }),
    pgPolicy("streams_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: sql`is_verified_parent_of_school(${uid}, ${streamSchool})`,
    }),
  ],
);
