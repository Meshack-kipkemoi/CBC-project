// api/students/route.ts

import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PAGE_SIZE,
  studentsQuery,
  type StudentsResults,
} from "@/lib/queries/students";
import { createResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cursor = Number(searchParams.get("cursor") ?? 0);
  const search = (searchParams.get("search") ?? "").replace(/[,()%]/g, "");

  const supabase = await createClient();
  const { data, count, error } = await studentsQuery(supabase, {
    cursor,
    search,
  });

  if (error) {
    console.log(error);
    return createResponse({
      status: 500,
      message: error.message,
    });
  }

  const next = cursor + PAGE_SIZE;

  const body: StudentsResults = {
    rows: data,
    nextCursor: next < (count ?? 0) ? next : null,
  };

  return createResponse({
    status: 200,
    message: "Students successfully fetched",
    data: body,
  });
}
