// api/students/[id]/route.ts

import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStudent, getStudentProfile } from "@/lib/student/queries/profile";
import { createResponse } from "@/lib/api";
import { getSubjectPerformance } from "@/lib/student/queries/subject-performance";
import { getStudentPathwayReadiness } from "@/lib/student/queries/pathways";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TAB_CONFIG = {
  profile: {
    fetcher: async (supabase: any, id: string) =>
      getStudentProfile(supabase, id),
    successMessage: "Student successfully fetched",
  },
  "subject-performance": {
    fetcher: async (supabase: any, id: string) => {
      const student = await getStudent(id);
      if (!student) return { data: null, error: null, notFound: true };
      return getSubjectPerformance(supabase, id);
    },
    successMessage: "Subject performance successfully fetched",
  },
  "pathway-readiness": {
    fetcher: async (supabase: any, id: string) =>
      getStudentPathwayReadiness(supabase, id),
    successMessage: "Pathway readiness successfully fetched",
  },
  "core-competencies": null,
} as const;

type Tab = keyof typeof TAB_CONFIG;
const isTab = (v: string): v is Tab => v in TAB_CONFIG;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;

  if (!UUID_RE.test(id)) {
    return createResponse({ status: 404, message: "Student not found" });
  }

  // Fallback to lowercase "profile" to match config keys
  const tab = (searchParams.get("tab") ?? "profile").toLowerCase();

  if (!isTab(tab)) {
    return createResponse({ status: 400, message: "Unknown tab" });
  }

  const config = TAB_CONFIG[tab];
  if (!config) {
    return createResponse({ status: 501, message: "Tab not implemented yet" });
  }

  const supabase = await createClient();
  const result = (await config.fetcher(supabase, id)) as any;

  if (result?.notFound || (!result?.error && !result?.data)) {
    return createResponse({ status: 404, message: "Student not found!" });
  }

  if (result?.error) {
    console.error(result.error);
    return createResponse({ status: 500, message: result.error.message });
  }

  return createResponse({
    status: 200,
    message: config.successMessage,
    data: result.data,
  });
}
