import { pgTable, uuid, timestamp, unique, index } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { roles } from "./roles";
import { schools } from "./schools";

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
  ],
);
