import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, pgPolicy } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { uid } from "./rls";

// School
export const schools = pgTable(
  "schools",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    code: text().notNull().unique(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy("schools_select_member", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (
      select 1 from user_roles ur
      where ur.school_id = schools.id
      and ur.user_id = ${uid}
      )`,
    }),
  ],
);
