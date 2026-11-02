import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Profile = {
  profileId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  phone: string | null;
};

export function useUserQuery() {
  const supabase = createClient();

  return useQuery<Profile>({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) throw new Error("Not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      return {
        profileId: profile?.id ?? authUser.id,
        fullName:
          profile?.full_name || authUser.user_metadata?.full_name || "User",
        email: authUser.email || "",
        avatarUrl: authUser.user_metadata?.avatar_url || "",
        phone: profile?.phone || null,
      };
    },
  });
}
