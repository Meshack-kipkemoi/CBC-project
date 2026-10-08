import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

// Profiles and roles
export const profiles = pgTable("profiles", {
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
});

export type InsertProfile = typeof profiles.$inferInsert;
export type SelectProfile = typeof profiles.$inferSelect;
