// components/user-menu.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";
import { AlertCircle, ArrowUpDown, User, Wallet } from "lucide-react";
import { useUserQuery } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export const dropdownLinks = [
  {
    label: "Withdraw",
    icon: Wallet,
    url: "/dashboard/withdraw",
  },
  {
    label: "My Transactions",
    icon: ArrowUpDown,
    url: "/dashboard/transactions",
  },
  {
    label: "Account",
    icon: User,
    url: "/dashboard/account",
  },
];

function Content({ children }: React.ComponentProps<"div">) {
  return (
    <DropdownMenuContent className="w-56" align="end">
      <DropdownMenuGroup>{children}</DropdownMenuGroup>
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
      <DropdownMenuGroup>
        <DropdownMenuItem variant="destructive" className="w-full" asChild>
          <LogoutButton>Log out</LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}

export function UserMenu() {
  const { data: user, isLoading, isError, error } = useUserQuery();

  // Loading state - show skeleton avatar
  if (isLoading) {
    return (
      <Button variant="ghost" className="h-8 w-8 rounded-full p-0" disabled>
        <Skeleton className="h-8 w-8 rounded-full" />
      </Button>
    );
  }

  // Error state - show error indicator with fallback
  if (isError) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 rounded-full p-0 text-destructive"
          >
            <Avatar className="h-8 w-8 border-2 border-destructive">
              <AvatarFallback className="bg-destructive/10 text-destructive text-xs">
                <AlertCircle className="size-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <Content />
      </DropdownMenu>
    );
  }

  // No user data - show fallback
  if (!user) {
    return (
      <Button variant="ghost" className="h-8 w-8 rounded-full p-0" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
            ?
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Success state - derive values from user data
  const fullName = user.fullName;
  const email = user.email;
  const avatarUrl = user.avatarUrl;

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : email?.slice(0, 2).toUpperCase() || "U";

  const displayName = fullName || email?.split("@")[0] || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <Content>
        <div className="flex gap-2 p-2 items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>
      </Content>
    </DropdownMenu>
  );
}
