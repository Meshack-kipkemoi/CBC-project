import { pgEnum } from "drizzle-orm/pg-core";

// Enums
export const appRole = pgEnum("app_role", [
  "principal",
  "class_teacher",
  "teacher",
  "parent",
]);

export const studentStatus = pgEnum("student_status", [
  "active",
  "transferred",
  "graduated",
  "inactive",
]);

export const verificationStatus = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected",
]);

export const assessmentStatus = pgEnum("assessment_status", [
  "draft",
  "published",
  "archived",
]);
