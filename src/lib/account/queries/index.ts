import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { ROLE_ORDER, type ProfileInput } from "@/lib/account";

type Client = SupabaseClient<Database>;

export type AccountError = { status: number; message: string };
export type QueryResult<T> =
  | { data: T; error: null }
  | { data: null; error: AccountError };

export type Account = {
  id: string;
  email: string;
  /** Set while an email change is waiting to be confirmed */
  pendingEmail: string | null;
  fullName: string;
  phone: string | null;
  createdAt: string;
  roles: string[];
  school: { name: string; code: string } | null;
};

/** The signed-in user, verified with Supabase Auth. */
export async function requireUser(
  supabase: Client,
): Promise<QueryResult<User>> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      data: null,
      error: { status: 401, message: "You need to sign in." },
    };
  }
  return { data: user, error: null };
}

export async function getAccount(
  supabase: Client,
): Promise<QueryResult<Account>> {
  const { data: user, error: authError } = await requireUser(supabase);
  if (authError) return { data: null, error: authError };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `id, full_name, phone, created_at,
       user_roles(roles(name), schools(name, code))`,
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { data: null, error: { status: 500, message: error.message } };
  }
  if (!profile) {
    return {
      data: null,
      error: { status: 404, message: "Profile not found." },
    };
  }

  const roles = [
    ...new Set(
      profile.user_roles.flatMap((ur) =>
        ur.roles?.name ? [ur.roles.name as string] : [],
      ),
    ),
  ].sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b));

  const school = profile.user_roles.map((ur) => ur.schools).find(Boolean);

  return {
    data: {
      id: profile.id,
      email: user.email ?? "",
      pendingEmail: user.new_email ?? null,
      fullName: profile.full_name,
      phone: profile.phone,
      createdAt: profile.created_at,
      roles,
      school: school ? { name: school.name, code: school.code } : null,
    },
    error: null,
  };
}

export async function updateProfile(
  supabase: Client,
  userId: string,
  input: ProfileInput,
): Promise<QueryResult<ProfileInput>> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName, phone: input.phone })
    .eq("id", userId)
    .select("full_name, phone")
    .maybeSingle();

  if (error) {
    return { data: null, error: { status: 500, message: error.message } };
  }

  // When RLS blocks an update it matches zero rows instead of failing
  if (!data) {
    return {
      data: null,
      error: { status: 403, message: "You can't edit this profile." },
    };
  }

  return {
    data: { fullName: data.full_name, phone: data.phone },
    error: null,
  };
}
