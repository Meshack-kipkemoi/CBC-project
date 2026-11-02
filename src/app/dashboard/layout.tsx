import { BreadcrumbProvider } from "@/components/providers/breadcrumb-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppBreadcrumb } from "@/layouts/app-breadcrumb";
import { AppHeader } from "@/layouts/app-header";
import { AppSidebar } from "@/layouts/app-sidebar";
import { getUserRole } from "@/lib/auth/get-user-role";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "A learner-centred CBC progress portal for families and schools in Kenya.",
  generator: "v0.app",
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  const userData = await getUserRole();

  if (!userData) {
    redirect("/auth/login");
  }

  const { isParent } = userData;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      defaultOpen={defaultOpen}
    >
      <TooltipProvider>
        <AppSidebar variant="floating" />
        <SidebarInset>
          <AppHeader />
          <BreadcrumbProvider>
            <div
              className="group/dashboard flex-1 space-y-6 bg-muted/40 dark:bg-muted/80 p-4"
              data-role={isParent ? "parent" : "staff"}
            >
              <AppBreadcrumb />
              {children}
            </div>
          </BreadcrumbProvider>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
