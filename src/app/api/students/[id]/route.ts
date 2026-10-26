// api/students/[id]/route.ts

import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStudent, getStudentProfile } from "@/lib/queries/student/profile";
import { createResponse } from "@/lib/api";
import { getSubjectPerformance } from "@/lib/queries/student/subject-performance";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TABS = [
  "profile",
  "subject-performance",
  "core-competencies",
  "pathway-readiness",
] as const;
type Tab = (typeof TABS)[number];
const isTab = (v: string): v is Tab => (TABS as readonly string[]).includes(v);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;

  // A malformed id would make Postgres throw a 500, so treat it as not found
  if (!UUID_RE.test(id)) {
    return createResponse({ status: 404, message: "Student not found" });
  }

  const tab = searchParams.get("tab") ?? "Profile";

  if (!isTab(tab)) {
    return createResponse({ status: 400, message: "Unknown tab" });
  }

  const supabase = await createClient();

  switch (tab) {
    case "profile": {
      const { data, error } = await getStudentProfile(supabase, id);
      if (error) {
        console.log(error);

        return createResponse({ status: 500, message: error.message });
      }
      if (!data) {
        return createResponse({ status: 404, message: "Student not found!" });
      }

      return createResponse({
        status: 200,
        message: "Student successfully fetched",
        data,
      });
    }

    case "subject-performance": {
      if (!(await getStudent(id))) {
        return createResponse({ status: 404, message: "Student not found!" });
      }

      const { data, error } = await getSubjectPerformance(supabase, id);

      if (error) {
        console.log(error);
        return createResponse({ status: 500, message: error.message });
      }

      return createResponse({
        status: 200,
        message: "Subject performance successfully fetched",
        data,
      });
    }

    default:
      return createResponse({
        status: 501,
        message: "Tab not implemented yet",
      });
  }
}
