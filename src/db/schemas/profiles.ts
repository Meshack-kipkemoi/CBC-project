import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, pgPolicy } from "drizzle-orm/pg-core";
import { authenticatedRole, authUsers } from "drizzle-orm/supabase";
import { isPrincipalOfProfile, uid } from "./rls";

// Profiles and roles
export const profiles = pgTable(
  "profiles",
  {
    id: uuid()
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    phone: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("select_own_profile", {
      for: "select",
      to: authenticatedRole,
      using: sql`profiles.id = ${uid}`,
    }),
    pgPolicy("profiles_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${table.id} = ${uid}`,
      withCheck: sql`${table.id} = ${uid}`,
    }),
    pgPolicy("principal_selects_all", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOfProfile("profiles.id"),
    }),
  ],
);

export type InsertProfile = typeof profiles.$inferInsert;
export type SelectProfile = typeof profiles.$inferSelect;
