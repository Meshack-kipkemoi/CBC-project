import { pgTable, uuid, text, unique, pgPolicy } from "drizzle-orm/pg-core";
import { grades } from "./grades";
import { authenticatedRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";
import { uid } from "./rls";

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
    pgPolicy("streams_select_school_members", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
    select 1 from grades g
    join user_roles ur on ur.school_id = g.school_id
    where g.id = streams.grade_id and ur.user_id = ${uid}
  )`,
    }),
  ],
);
