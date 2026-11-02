import {
  pgTable,
  uuid,
  timestamp,
  unique,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { roles } from "./roles";
import { schools } from "./schools";
import { authenticatedRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";
import { uid } from "./rls";

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique().on(table.userId, table.roleId, table.schoolId),
    index("user_roles_user_idx").on(table.userId),
    pgPolicy("user_roles_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`user_roles.user_id = ${uid}`,
    }),
  ],
);
