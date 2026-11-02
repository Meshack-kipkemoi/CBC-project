import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AttendanceData } from "@/lib/attendance/queries";
import type { ApiResponse } from "@/lib/api";

export type {
  AttendanceData,
  AttendanceStream,
  AttendanceStatus,
  AttendanceRole,
} from "@/lib/attendance/queries";

export type AttendanceFilters = {
  year?: string;
  term?: string; // uuid | "all"
  grade?: string; // uuid | "all"
  learningArea?: string; // uuid (subject_teacher only)
};

export function useAttendanceQuery(filters: AttendanceFilters) {
  return useQuery<ApiResponse<AttendanceData>, Error, AttendanceData>({
    queryKey: ["attendance", filters],
    retry: false,
    select: (res) => res.data,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) search.set(key, value);
      }

      const res = await fetch(`/api/attendance?${search}`);
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Request failed");
      }
      return body as ApiResponse<AttendanceData>;
    },
  });
}
