// app/dashboard/page.tsx
import { AcademicAverageChart } from "@/sections/dashboard/academic-average-chart";
import { DashboardError } from "@/sections/dashboard/dashboard-error";
import { DashboardProvider } from "@/sections/dashboard/dashboard-context";
import { Filters } from "@/sections/dashboard/filters";
import { StatCards } from "@/sections/dashboard/stat-cards";
import { TotalLearnersChart } from "@/sections/dashboard/total-learners-chart";
import { Content } from "@/sections/students/id/content";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; studentId?: string }>;
}) {
  const params = await searchParams;
  const defaultTab = params.tab || "profile";
  const requestedStudentId = params.studentId;

  const supabase = await createClient();

  // 1. Get the current authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // 2. Query user roles from user_roles joined with roles
  const { data: userRolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select(
      `
      roles (
        name
      )
    `,
    )
    .eq("user_id", user.id);

  if (rolesError) {
    console.error("Error fetching user roles:", rolesError);
  }

  // Extract role names into a clean array (e.g. ['parent'], ['principal'])
  // Adjust based on how your role names are formatted in your database enum/table (e.g., lowercase or capitalized)
  const roles =
    userRolesData?.map((ur: any) => ur.roles?.name?.toLowerCase()) || [];

  const isParent = roles.includes("parent");
  const isStaff = roles.some((r) =>
    ["principal", "class_teacher", "teacher", "admin"].includes(r),
  );

  // 3. If user is a parent, fetch their linked student record(s)
  if (isParent || (!isStaff && roles.length === 0)) {
    let query = supabase
      .from("parent_students")
      .select("student_id")
      .eq("parent_id", user.id);

    if (requestedStudentId) {
      query = query.eq("student_id", requestedStudentId);
    }

    const { data: parentStudents, error: dbError } = await query;

    if (dbError || !parentStudents || parentStudents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
          <h2 className="text-xl font-semibold tracking-tight">
            No Student Record Found
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Your account is not currently linked to any student profile. Please
            contact the school administrator for assistance.
          </p>
        </div>
      );
    }

    const studentId = parentStudents[0].student_id;

    return (
      <div className="flex flex-col gap-6 p-6">
        <Content id={studentId} defaultTab={defaultTab} showTabs={false} />
      </div>
    );
  }

  // 4. Otherwise, render the staff / principal dashboard view
  return (
    <DashboardProvider>
      <Filters />
      <DashboardError />
      <StatCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TotalLearnersChart />
        <AcademicAverageChart />
      </div>
    </DashboardProvider>
  );
}
