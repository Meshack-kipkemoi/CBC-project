import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PAGE_SIZE,
  studentsQuery,
  type StudentsPage,
} from "@/lib/queries/students";

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const next = cursor + PAGE_SIZE;
  const body: StudentsPage = {
    rows: data,
    nextCursor: next < (count ?? 0) ? next : null,
  };
  return NextResponse.json(body);
}
