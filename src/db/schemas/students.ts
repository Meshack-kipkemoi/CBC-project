import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { schools } from "./schools";
import { studentStatus } from "./shared";

// Students and enrolments
export const students = pgTable(
  "students",
  {
    id: uuid().defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),
    admissionNumber: text("admission_number").notNull(),
    fullName: text("full_name").notNull(),
    status: studentStatus().default("active").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique().on(table.schoolId, table.admissionNumber),
    index("students_school_idx").on(table.schoolId),
  ],
);
