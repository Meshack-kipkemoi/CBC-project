import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/account/queries";
import { firstError, validatePasswordChange } from "@/lib/account";
import { createResponse } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: user, error: authError } = await requireUser(supabase);
  if (authError || !user.email) {
    return createResponse({
      status: 401,
      message: authError?.message ?? "You need to sign in.",
    });
  }

  const body = await req.json().catch(() => null);
  const parsed = validatePasswordChange(body ?? {});
  if (!parsed.ok) {
    return createResponse({ status: 400, message: firstError(parsed.errors) });
  }

  // Check the current password first, so a stolen session can't change it
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (verifyError) {
    return createResponse({
      status: verifyError.status === 429 ? 429 : 400,
      message:
        verifyError.status === 429
          ? "Too many attempts. Try again in a few minutes."
          : "Your current password is incorrect.",
    });
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (error) {
    return createResponse({ status: 400, message: error.message });
  }

  return createResponse({ status: 200, message: "Password updated." });
}
