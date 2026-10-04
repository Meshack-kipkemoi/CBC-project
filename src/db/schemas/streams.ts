import { pgTable, uuid, text, unique } from "drizzle-orm/pg-core";
import { grades } from "./grades";

export const streams = pgTable(
  "streams",
  {
    id: uuid().defaultRandom().primaryKey(),
    gradeId: uuid("grade_id")
      .notNull()
      .references(() => grades.id),
    name: text().notNull(),
  },
  (table) => [unique().on(table.gradeId, table.name)],
);
