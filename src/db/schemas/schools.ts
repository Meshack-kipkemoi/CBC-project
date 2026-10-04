import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

// School
export const schools = pgTable("schools", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  code: text().notNull().unique(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
