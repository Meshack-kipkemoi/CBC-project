import { AcademicAverageChart } from "@/sections/dashboard/academic-average-chart";
import { DashboardError } from "@/sections/dashboard/dashboard-error";
import { DashboardProvider } from "@/sections/dashboard/dashboard-context";
import { Filters } from "@/sections/dashboard/filters";
import { StatCards } from "@/sections/dashboard/stat-cards";
import { TotalLearnersChart } from "@/sections/dashboard/total-learners-chart";
import { Content } from "@/sections/students/id/content";

import { getUserRole } from "@/lib/auth/get-user-role";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; studentId?: string }>;
}) {
  // 1. Get URL search parameters
  const params = await searchParams;
  const defaultTab = params.tab || "profile";
  const requestedStudentId = params.studentId;

  // 2. Reuse the existing authentication and role helper
  const userData = await getUserRole();

  if (!userData) {
    redirect("/auth/login");
  }

  const { user, roles, isParent, isStaff } = userData;

  // 3. Handle parent dashboard
  if (isParent || (!isStaff && roles.length === 0)) {
    const supabase = await createClient();

    let query = supabase
      .from("parent_students")
      .select("student_id")
      .eq("parent_id", user.id);

    // Filter by requested student if provided
    if (requestedStudentId) {
      query = query.eq("student_id", requestedStudentId);
    }

    const { data: parentStudents, error: dbError } = await query;

    if (dbError) {
      console.error("Error fetching parent students:", dbError);
    }

    if (!parentStudents || parentStudents.length === 0) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            No Student Record Found
          </h2>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your account is not currently linked to any student profile. Please
            contact the school administrator for assistance.
          </p>
        </div>
      );
    }

    const studentId = parentStudents[0].student_id;

    return <Content id={studentId} defaultTab={defaultTab} showTabs={false} />;
  }

  // 4. Render staff / principal dashboard
  return (
    <DashboardProvider>
      <Filters />
      <DashboardError />
      <StatCards />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TotalLearnersChart />
        <AcademicAverageChart />
      </div>
    </DashboardProvider>
  );
}
