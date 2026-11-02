import { pgEnum } from "drizzle-orm/pg-core";

export const attendanceStatus = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused",
]);
