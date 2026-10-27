import { useQuery } from "@tanstack/react-query";
import type { StudentProfile } from "@/lib/student/queries/profile";
import type { ApiResponse } from "@/lib/api";
import { SubjectPerformanceData } from "@/lib/student/queries/subject-performance";
import type { ReadinessReport } from "@/lib/student/data/pathways";

export type { StudentProfile } from "@/lib/student/queries/profile";
export type {
  SubjectPerformanceData,
  SubjectSummary,
  AssessmentPoint,
} from "@/lib/student/queries/subject-performance";

type StudentTab =
  | "profile"
  | "subject-performance"
  | "core-competencies"
  | "pathway-readiness";

type TabData = {
  profile: StudentProfile;
  "subject-performance": SubjectPerformanceData;
  "core-competencies": StudentProfile;
  "pathway-readiness": ReadinessReport;
};

export function useStudentQuery<Tab extends StudentTab>(id: string, tab: Tab) {
  return useQuery<ApiResponse<TabData[Tab]>, Error, TabData[Tab]>({
    queryKey: ["student", id, tab],
    retry: false,
    select: (res) => res.data,
    queryFn: async () => {
      const search = new URLSearchParams({ tab: tab });

      const res = await fetch(`/api/students/${id}?${search}`);
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Request failed");
      }

      return body as ApiResponse<TabData[Tab]>;
    },
  });
}
