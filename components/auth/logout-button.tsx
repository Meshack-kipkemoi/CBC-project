"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  children: React.ReactNode;
};

export function LogoutButton({
  children,
  className,
  onClick,
  ...props
}: LogoutButtonProps & React.ComponentProps<"button">) {
  const router = useRouter();

  const logout = async () => {
    // Sign out the user
    const supabase = createClient();
    await supabase.auth.signOut();

    // Redirect to login
    router.push("/auth/login");
  };

  return (
    <button
      className={cn(className, "cursor-pointer")}
      onClick={logout}
      {...props}
    >
      <LogOut className="mr-2" /> {children}
    </button>
  );
}
