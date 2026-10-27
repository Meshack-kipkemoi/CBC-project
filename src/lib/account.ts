export const ROLE_LABELS: Record<string, string> = {
  principal: "Principal",
  class_teacher: "Class teacher",
  teacher: "Subject teacher",
  parent: "Parent",
};

export const ROLE_ORDER = ["principal", "class_teacher", "teacher", "parent"];

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // longest password Supabase accepts

export type ProfileInput = { fullName: string; phone: string | null };

type Result<T, K extends string> =
  | { ok: true; data: T }
  | { ok: false; errors: Partial<Record<K, string>> };

/** First error message, for API responses. */
export const firstError = (errors: Partial<Record<string, string>>) =>
  Object.values(errors).find(Boolean) ?? "Invalid input.";

/**
 * Turns Kenyan local formats into E.164 (0712 345 678 -> +254712345678).
 * Other international numbers must already start with +. Returns null if invalid.
 */
export function normalizePhone(raw: string): string | null {
  let phone = raw.replace(/[\s\-().]/g, "");

  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  else if (/^0[17]\d{8}$/.test(phone)) phone = `+254${phone.slice(1)}`;
  else if (/^254[17]\d{8}$/.test(phone)) phone = `+${phone}`;

  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

export function validateProfile(input: {
  fullName?: unknown;
  phone?: unknown;
}): Result<ProfileInput, "fullName" | "phone"> {
  const errors: Partial<Record<"fullName" | "phone", string>> = {};

  const fullName =
    typeof input.fullName === "string"
      ? input.fullName.trim().replace(/\s+/g, " ")
      : "";
  if (fullName.length < 2) errors.fullName = "Enter your full name.";
  else if (fullName.length > 100)
    errors.fullName = "Name must be 100 characters or fewer.";

  const rawPhone = typeof input.phone === "string" ? input.phone.trim() : "";
  let phone: string | null = null;
  if (rawPhone) {
    phone = normalizePhone(rawPhone);
    if (!phone) errors.phone = "Enter a valid phone number, e.g. 0712 345 678.";
  }

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, data: { fullName, phone } };
}

export function validateEmail(input: unknown): Result<string, "email"> {
  const email = typeof input === "string" ? input.trim().toLowerCase() : "";

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, errors: { email: "Enter a valid email address." } };
  }
  return { ok: true, data: email };
}

export function validatePasswordChange(input: {
  currentPassword?: unknown;
  newPassword?: unknown;
}): Result<
  { currentPassword: string; newPassword: string },
  "currentPassword" | "newPassword"
> {
  const errors: Partial<Record<"currentPassword" | "newPassword", string>> = {};
  const currentPassword =
    typeof input.currentPassword === "string" ? input.currentPassword : "";
  const newPassword =
    typeof input.newPassword === "string" ? input.newPassword : "";

  if (!currentPassword) errors.currentPassword = "Enter your current password.";

  if (newPassword.length < PASSWORD_MIN)
    errors.newPassword = `Use at least ${PASSWORD_MIN} characters.`;
  else if (newPassword.length > PASSWORD_MAX)
    errors.newPassword = `Use ${PASSWORD_MAX} characters or fewer.`;
  else if (newPassword === currentPassword)
    errors.newPassword = "Choose a password different from your current one.";

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, data: { currentPassword, newPassword } };
}
