"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// 1. Extend the correct type to natively include standard button attributes and ref
export type LogoutButtonProps = React.ComponentPropsWithRef<"button">;

export const LogoutButton = React.forwardRef<
  HTMLButtonElement,
  LogoutButtonProps
>(({ children, className, onClick, ...props }, ref) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // 2. Safely call the parent's onClick handler (e.g., to let the Dropdown Menu close)
    if (onClick) onClick(e);

    // Sign out the user
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear all react-query caches
    queryClient.clear();

    // Redirect to login
    router.push("/auth/login");
  };

  return (
    <button
      ref={ref}
      className={cn("cursor-pointer", className)}
      onClick={logout}
      {...props}
    >
      <LogOut className="mr-2" />
      {children}
    </button>
  );
});

LogoutButton.displayName = "LogoutButton";
