import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { appRole } from "./shared";

export const roles = pgTable("roles", {
  id: uuid().defaultRandom().primaryKey(),
  name: appRole().notNull().unique(),
  description: text(),
});
