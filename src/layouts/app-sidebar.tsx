"use client";
import * as React from "react";
import { NavMain } from "@/layouts/nav-main";
import { NavSecondary } from "@/layouts/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboardIcon, User } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
  ],

  navSecondary: [
    {
      title: "Account",
      url: "/dashboard/account",
      icon: <User />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:py-1.5 data-[slot=sidebar-menu-button]:pl-0"
              asChild
            >
              <Link href={"#"}>
                <div className="bg-primary p-2 rounded-full group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 transition-all text-primary-foreground group-data-[collapsible=icon]:text-foreground">
                  <Logo className="size-6" />
                </div>
                <span className="text-base font-sans font-semibold">
                  CBC AI
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
