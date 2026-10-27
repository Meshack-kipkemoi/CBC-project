import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccount, requireUser, updateProfile } from "@/lib/account/queries";
import { firstError, validateProfile } from "@/lib/account";
import { createResponse } from "@/lib/api";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await getAccount(supabase);

  if (error) {
    return createResponse({ status: error.status, message: error.message });
  }

  return createResponse({
    status: 200,
    message: "Account successfully fetched",
    data,
  });
}

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
  const parsed = validateProfile(body ?? {});
  if (!parsed.ok) {
    return createResponse({ status: 400, message: firstError(parsed.errors) });
  }

  const { data, error } = await updateProfile(supabase, user.id, parsed.data);
  if (error) {
    return createResponse({ status: error.status, message: error.message });
  }

  return createResponse({ status: 200, message: "Profile updated", data });
}
