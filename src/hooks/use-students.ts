import { useInfiniteQuery } from "@tanstack/react-query";
import type { StudentsPage } from "@/lib/queries/students";

export type { StudentRow, StudentsPage } from "@/lib/queries/students";

export function useStudentsQuery(search: string) {
  return useInfiniteQuery<
    StudentsPage,
    Error,
    { pages: StudentsPage[] },
    unknown[],
    number
  >({
    queryKey: ["students", search],
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ cursor: String(pageParam), search });
      const res = await fetch(`/api/students?${params}`);
      if (!res.ok) throw new Error("Failed to load students");
      return res.json() as Promise<StudentsPage>;
    },
  });
}
