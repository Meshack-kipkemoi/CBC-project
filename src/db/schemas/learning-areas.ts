import { pgTable, uuid, text, boolean, unique } from "drizzle-orm/pg-core";
import { schools } from "./schools";

export const learningAreas = pgTable(
  "learning_areas",
  {
    id: uuid().defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),
    name: text().notNull(),
    code: text().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [unique().on(table.schoolId, table.code)],
);
