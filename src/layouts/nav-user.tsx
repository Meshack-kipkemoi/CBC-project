"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { dropdownLinks } from "./user-menu";
import { useUserQuery } from "@/hooks/use-user";
import {
  AlertCircleIcon,
  EllipsisVerticalIcon,
  Loader2Icon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: user, isLoading, isError } = useUserQuery();

  // Loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Loader2Icon className="ml-auto size-4 animate-spin text-muted-foreground" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Error state
  if (isError) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="text-destructive aria-expanded:bg-destructive/10"
              >
                <Avatar className="size-8 rounded-lg border-2 border-destructive">
                  <AvatarFallback className="rounded-lg bg-destructive/10">
                    <AlertCircleIcon className="size-4 text-destructive" />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-destructive">
                    Error loading user
                  </span>
                  <span className="truncate text-xs text-destructive/70">
                    Tap to retry options
                  </span>
                </div>
                <EllipsisVerticalIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" asChild>
                  <LogoutButton>
                    <LogOutIcon className="mr-2 size-4" />
                    Log out
                  </LogoutButton>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Empty/no user state
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-muted">
                <UserIcon className="size-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-muted-foreground">
                Not signed in
              </span>
              <span className="truncate text-xs text-muted-foreground/70">
                Please log in
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Success state - derive values with fallbacks
  const fullName = user.fullName || "User";
  const email = user.email || "No email";
  const avatarUrl = user.avatarUrl;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="aria-expanded:bg-muted">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {dropdownLinks.map((link) => (
                <DropdownMenuItem
                  key={link.label}
                  className={"cursor-pointer"}
                  asChild
                >
                  <Link href={link.url}>
                    <link.icon className="mr-2 size-4" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className={"w-full"}
              asChild
            >
              <LogoutButton>Log out</LogoutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
