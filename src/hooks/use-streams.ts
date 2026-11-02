import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { StreamsData } from "@/lib/streams/queries";
import type { ApiResponse } from "@/lib/api";

export type { StreamsData, StreamStat, Level } from "@/lib/streams/queries";

export type StreamsFilters = {
  year?: string;
  term?: string; // uuid | "all"
  grade?: string; // uuid | "all"
};

export function useStreamsQuery(filters: StreamsFilters) {
  return useQuery<ApiResponse<StreamsData>, Error, StreamsData>({
    queryKey: ["streams", filters],
    retry: false,
    select: (res) => res.data,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) search.set(key, value);
      }

      const res = await fetch(`/api/streams?${search}`);
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Request failed");
      }
      return body as ApiResponse<StreamsData>;
    },
  });
}
