import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { GradesReport, GradesView } from "@/lib/grades";
import type { ApiResponse } from "@/lib/api";

export function useGradesQuery(view?: GradesView, termId?: string) {
  return useQuery<ApiResponse<GradesReport>, Error, GradesReport>({
    queryKey: ["grades", view ?? "auto", termId ?? "all"],
    retry: false,
    placeholderData: keepPreviousData,
    select: (res) => res.data,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (view) params.set("view", view);
      if (termId) params.set("term", termId);

      const res = await fetch(`/api/grades?${params}`);
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Request failed");
      }

      return body as ApiResponse<GradesReport>;
    },
  });
}
