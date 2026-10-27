import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAttendanceAccess } from "@/lib/attendance/queries";
import { AttendanceView } from "@/sections/attendance/attendance-view";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Attendance",
};

export default async function AttendancePage() {
  const supabase = await createClient();
  if (!(await getAttendanceAccess(supabase))) notFound();

  return <AttendanceView />;
}
