import {
  pgTable,
  uuid,
  integer,
  date,
  unique,
  check,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { academicYears } from "./academic-years";
import { authenticatedRole } from "drizzle-orm/supabase";
import {
  isClassTeacherOfTerm,
  isPrincipalOfTerm,
  isSubjectTeacherOfTerm,
  isVerifiedParentOfTerm,
} from "./rls";

// Terms and curriculum
export const terms = pgTable(
  "terms",
  {
    id: uuid().defaultRandom().primaryKey(),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    termNumber: integer("term_number").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
  },
  (table) => [
    unique().on(table.academicYearId, table.termNumber),
    check("terms_number_check", sql`${table.termNumber} between 1 and 3`),
    check("terms_dates_check", sql`${table.startDate} <= ${table.endDate}`),

    pgPolicy("terms_select_principal", {
      for: "select",
      to: authenticatedRole,
      using: isPrincipalOfTerm("terms.id"),
    }),
    pgPolicy("terms_select_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isClassTeacherOfTerm("terms.id"),
    }),
    pgPolicy("terms_select_subject_teacher", {
      for: "select",
      to: authenticatedRole,
      using: isSubjectTeacherOfTerm("terms.id"),
    }),
    pgPolicy("terms_select_parent", {
      for: "select",
      to: authenticatedRole,
      using: isVerifiedParentOfTerm("terms.id"),
    }),
  ],
);
