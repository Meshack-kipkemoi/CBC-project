import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/account/queries";
import { firstError, validateEmail } from "@/lib/account";
import { createResponse } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: user, error: authError } = await requireUser(supabase);
  if (authError) {
    return createResponse({
      status: authError.status,
      message: authError.message,
    });
  }

  const body = await req.json().catch(() => null);
  const parsed = validateEmail(body?.email);
  if (!parsed.ok) {
    return createResponse({ status: 400, message: firstError(parsed.errors) });
  }

  if (parsed.data === user.email?.toLowerCase()) {
    return createResponse({
      status: 400,
      message: "That is already your email address.",
    });
  }

  const { error } = await supabase.auth.updateUser({ email: parsed.data });
  if (error) {
    return createResponse({ status: 400, message: error.message });
  }

  return createResponse({
    status: 200,
    message: `We sent a confirmation link to ${parsed.data}. Your email changes once you confirm it.`,
  });
}
