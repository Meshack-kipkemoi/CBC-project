import { sql } from "drizzle-orm";

export const uid = sql`(select auth.uid())`;

export const isPrincipalOf = (schoolCol: string) =>
  sql`is_principal_of(${uid}, ${sql.raw(schoolCol)})`;

export const isPrincipalOfStream = (streamCol: string) =>
  sql`is_principal_of_stream(${uid}, ${sql.raw(streamCol)})`;

export const isPrincipalOfStudent = (studentCol: string) =>
  sql`is_principal_of(${uid}, student_school(${sql.raw(studentCol)}))`;

export const isVerifiedParentOf = (studentCol: string) =>
  sql`is_verified_parent_of(${uid}, ${sql.raw(studentCol)})`;

export const isClassTeacherOfStudent = (studentCol: string) =>
  sql`is_class_teacher_of_student(${uid}, ${sql.raw(studentCol)})`;

export const isSubjectTeacherOfStudent = (studentCol: string) =>
  sql`is_subject_teacher_of_student(${uid}, ${sql.raw(studentCol)})`;

export const isClassTeacherOfStudentGrade = (studentCol: string) =>
  sql`is_class_teacher_of_student_grade(${uid}, ${sql.raw(studentCol)})`;

export const isClassTeacherOfStream = (streamCol: string, yearCol: string) =>
  sql`is_class_teacher_of_stream(${uid}, ${sql.raw(streamCol)}, ${sql.raw(yearCol)})`;

export const isSubjectTeacherOfStream = (streamCol: string, yearCol: string) =>
  sql`is_subject_teacher_of_stream(${uid}, ${sql.raw(streamCol)}, ${sql.raw(yearCol)})`;

export const isClassTeacherOfSchool = (schoolCol: string) =>
  sql`is_class_teacher_of_school(${uid}, ${sql.raw(schoolCol)})`;

export const isSubjectTeacherOfSchool = (schoolCol: string) =>
  sql`is_subject_teacher_of_school(${uid}, ${sql.raw(schoolCol)})`;

export const isVerifiedParentOfSchool = (schoolCol: string) =>
  sql`is_verified_parent_of_school(${uid}, ${sql.raw(schoolCol)})`;

export const isPrincipalOfTerm = (termCol: string) =>
  sql`is_principal_of_term(${uid}, ${sql.raw(termCol)})`;

export const isClassTeacherOfTerm = (termCol: string) =>
  sql`is_class_teacher_of_term(${uid}, ${sql.raw(termCol)})`;

export const isSubjectTeacherOfTerm = (termCol: string) =>
  sql`is_subject_teacher_of_term(${uid}, ${sql.raw(termCol)})`;

export const isVerifiedParentOfTerm = (termCol: string) =>
  sql`is_verified_parent_of_term(${uid}, ${sql.raw(termCol)})`;

export const isPrincipalOfProfile = (profileCol: string) =>
  sql`is_principal_of_profile(${uid}, ${sql.raw(profileCol)})`;
