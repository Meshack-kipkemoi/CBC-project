import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGradesReport } from "@/lib/grades/queries";
import { GRADES_VIEWS } from "@/lib/grades";
import { createResponse } from "@/lib/api";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const viewParam = searchParams.get("view");
  const termParam = searchParams.get("term");

  if (termParam && !UUID_RE.test(termParam)) {
    return createResponse({ status: 400, message: "Invalid term." });
  }

  // An unknown view is ignored and the user's default view is used instead
  const view = GRADES_VIEWS.find((v) => v === viewParam);

  const supabase = await createClient();
  const { data, error } = await getGradesReport(supabase, {
    view,
    termId: termParam ?? undefined,
  });

  if (error) {
    console.log(error);
    return createResponse({ status: error.status, message: error.message });
  }

  return createResponse({
    status: 200,
    message: "Grades successfully fetched",
    data,
  });
}
