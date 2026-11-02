import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getUserRole = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching user roles:", error);
    return null;
  }

  const roles = data?.map((ur: any) => ur.roles?.name?.toLowerCase()) || [];

  return {
    user,
    roles,
    isParent: roles.includes("parent"),
    isStaff: roles.some((role) =>
      ["principal", "class_teacher", "teacher", "admin"].includes(role),
    ),
  };
});
