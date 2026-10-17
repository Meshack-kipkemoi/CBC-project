import { pgTable, uuid, text, pgPolicy } from "drizzle-orm/pg-core";
import { appRole } from "./shared";
import { authenticatedRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";

export const roles = pgTable(
  "roles",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: appRole().notNull().unique(),
    description: text(),
  },
  () => [
    pgPolicy("roles_select_all", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ],
);
