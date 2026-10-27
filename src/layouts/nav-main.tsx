"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {items.map((item) => {
            const urlObj = new URL(item.url, "http://localhost");
            const itemTab = urlObj.searchParams.get("tab");

            let isActive = false;
            if (item.url.includes("?tab=")) {
              isActive = pathname === urlObj.pathname && currentTab === itemTab;
            } else {
              isActive =
                item.url !== "/dashboard"
                  ? pathname.startsWith(item.url)
                  : pathname === item.url && !currentTab;
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => setOpenMobile(false)}
                  className={cn(
                    "h-10 w-full justify-start gap-2 rounded-md px-3 font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-secondary-foreground hover:bg-secondary/80",
                  )}
                  asChild
                >
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
