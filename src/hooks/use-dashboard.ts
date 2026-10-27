import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@/lib/dashboard/queries";
import type { ApiResponse } from "@/lib/api";

export type { DashboardData } from "@/lib/dashboard/queries";

export type DashboardFilters = {
  year?: string;
  term?: string; // uuid | "all"
  grade?: string; // uuid | "all"
  stream?: string; // uuid | "all"
};

export function useDashboardQuery(filters: DashboardFilters) {
  return useQuery<ApiResponse<DashboardData>, Error, DashboardData>({
    queryKey: ["dashboard", filters],
    retry: false,
    select: (res) => res.data,
    // Keep the old numbers on screen while new filters load
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) search.set(key, value);
      }

      const res = await fetch(`/api/dashboard?${search}`);
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Request failed");
      }
      return body as ApiResponse<DashboardData>;
    },
  });
}
