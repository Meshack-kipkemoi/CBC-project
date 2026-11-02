import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboard } from "@/lib/dashboard/queries";
import { createResponse } from "@/lib/api";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const year = sp.get("year");
  const term = sp.get("term"); // uuid | "all"
  const grade = sp.get("grade"); // uuid | "all"
  const stream = sp.get("stream"); // uuid | "all"

  const bad = (v: string | null, allowAll: boolean) =>
    v !== null && !UUID_RE.test(v) && !(allowAll && v === "all");

  if (
    bad(year, false) ||
    bad(term, true) ||
    bad(grade, true) ||
    bad(stream, true)
  ) {
    return createResponse({ status: 400, message: "Invalid filter" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return createResponse({ status: 401, message: "Not signed in" });
  }

  const { data, error } = await getDashboard(supabase, {
    yearId: year,
    termId: term,
    gradeId: grade === "all" ? null : grade,
    streamId: stream === "all" ? null : stream,
  });

  if (error) {
    console.log(error);
    return createResponse({ status: 500, message: error.message });
  }

  return createResponse({
    status: 200,
    message: "Dashboard successfully fetched",
    data,
  });
}
