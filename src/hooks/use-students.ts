// hooks/use-students.ts

import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import type { StudentsResults } from "@/lib/queries/students";
import { ApiResponse } from "@/lib/api";

export type { StudentRow, StudentsResults } from "@/lib/queries/students";

export function useStudentsQuery(search: string) {
  return useInfiniteQuery<
    ApiResponse<StudentsResults>,
    ApiResponse,
    InfiniteData<ApiResponse<StudentsResults>, number>,
    unknown[],
    number
  >({
    retry: false,
    queryKey: ["students", search],
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ cursor: String(pageParam), search });
      const res = await fetch(`/api/students?${params}`);

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Request failed");
      }

      return body as ApiResponse<StudentsResults>;
    },
  });
}
