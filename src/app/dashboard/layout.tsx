import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppBreadcrumb } from "@/layouts/app-breadcrumb";
import { AppHeader } from "@/layouts/app-header";
import { AppSidebar } from "@/layouts/app-sidebar";
import type { Metadata } from "next";
import { cookies } from "next/headers";

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
          <div className="flex-1 space-y-8 bg-muted/30 p-4">
            <AppBreadcrumb />
            {children}
          </div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
