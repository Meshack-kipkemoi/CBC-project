import { pgTable, uuid, timestamp, unique, index } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { students } from "./students";
import { verificationStatus } from "./shared";

// Parent-child relationships
export const parentStudents = pgTable(
  "parent_students",
  {
    id: uuid().defaultRandom().primaryKey(),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => profiles.id),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    verificationStatus: verificationStatus("verification_status")
      .default("pending")
      .notNull(),
    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
    }),
    verifiedBy: uuid("verified_by").references(() => profiles.id),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique().on(table.parentId, table.studentId),
    index("parent_students_parent_idx").on(table.parentId),
    index("parent_students_student_idx").on(table.studentId),
  ],
);
