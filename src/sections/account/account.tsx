"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  PASSWORD_MIN,
  ROLE_LABELS,
  validateEmail,
  validatePasswordChange,
  validateProfile,
} from "@/lib/account";
import type { Account } from "@/lib/account/queries";
import {
  useAccountQuery,
  useChangeEmail,
  useChangePassword,
  useUpdateProfile,
} from "@/hooks/use-account";
import { useQueryClient } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-KE", { dateStyle: "long" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function FormMessage({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 text-sm",
        tone === "success"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-destructive",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function FormCard({
  icon: Icon,
  title,
  description,
  onSubmit,
  footer,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onSubmit: (e: FormEvent) => void;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">{children}</CardContent>
        <CardFooter className="mt-6 flex flex-wrap items-center gap-3">
          {footer}
        </CardFooter>
      </form>
    </Card>
  );
}

function SubmitButton({
  pending,
  disabled,
  children,
}: {
  pending: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

function ProfileForm({ account }: { account: Account }) {
  const update = useUpdateProfile();
  const [fullName, setFullName] = useState(account.fullName);
  const [phone, setPhone] = useState(account.phone ?? "");
  const [errors, setErrors] = useState<
    Partial<Record<"fullName" | "phone", string>>
  >({});

  const query = useQueryClient();
  const dirty =
    fullName.trim() !== account.fullName ||
    phone.trim() !== (account.phone ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();

    const parsed = validateProfile({ fullName, phone });
    if (!parsed.ok) return setErrors(parsed.errors);
    setErrors({});

    update.mutate(parsed.data, {
      // Show the cleaned-up values (for example +254... for 07...)
      onSuccess: ({ data }) => {
        setFullName(data.fullName);
        setPhone(data.phone ?? "");
      },
    });
  };

  const discard = () => {
    setFullName(account.fullName);
    setPhone(account.phone ?? "");
    setErrors({});
    update.reset();
  };

  return (
    <FormCard
      icon={UserRound}
      title="Personal information"
      description="This is how you appear to teachers, parents and school staff."
      onSubmit={submit}
      footer={
        <>
          <SubmitButton pending={update.isPending} disabled={!dirty}>
            Save changes
          </SubmitButton>
          {dirty && (
            <Button type="button" variant="ghost" onClick={discard}>
              Discard
            </Button>
          )}
          {update.isError && (
            <FormMessage tone="error">{update.error.message}</FormMessage>
          )}
          {update.isSuccess && !dirty && (
            <FormMessage tone="success">Profile updated.</FormMessage>
          )}
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="full-name" label="Full name" error={errors.fullName}>
          <Input
            id="full-name"
            value={fullName}
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              update.reset();
            }}
          />
        </Field>

        <Field
          id="phone"
          label="Phone number"
          hint="The school uses this to contact you."
          error={errors.phone}
        >
          <Input
            id="phone"
            type="tel"
            value={phone}
            autoComplete="tel"
            placeholder="0712 345 678"
            aria-invalid={!!errors.phone}
            onChange={(e) => {
              setPhone(e.target.value);
              update.reset();
            }}
          />
        </Field>
      </div>
    </FormCard>
  );
}

function EmailForm({ account }: { account: Account }) {
  const change = useChangeEmail();
  const [email, setEmail] = useState(account.email);
  const [error, setError] = useState<string>();

  const dirty = email.trim().toLowerCase() !== account.email.toLowerCase();

  const submit = (e: FormEvent) => {
    e.preventDefault();

    const parsed = validateEmail(email);
    if (!parsed.ok) return setError(parsed.errors.email);
    setError(undefined);

    change.mutate(parsed.data);
  };

  return (
    <FormCard
      icon={Mail}
      title="Email address"
      description="You use this to sign in. We email a link to confirm any change."
      onSubmit={submit}
      footer={
        <>
          <SubmitButton pending={change.isPending} disabled={!dirty}>
            Send confirmation
          </SubmitButton>
          {change.isError && (
            <FormMessage tone="error">{change.error.message}</FormMessage>
          )}
          {change.isSuccess && (
            <FormMessage tone="success">{change.data.message}</FormMessage>
          )}
        </>
      }
    >
      {account.pendingEmail && (
        <p className="rounded-lg border bg-muted/50 p-3 text-sm">
          Waiting for you to confirm{" "}
          <span className="font-medium">{account.pendingEmail}</span>. Check
          your inbox. Until then you keep signing in with your current address.
        </p>
      )}

      <Field id="email" label="Email" error={error}>
        <Input
          id="email"
          type="email"
          value={email}
          autoComplete="email"
          aria-invalid={!!error}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(undefined);
            change.reset();
          }}
        />
      </Field>
    </FormCard>
  );
}

function PasswordForm() {
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<"currentPassword" | "newPassword" | "confirm", string>>
  >({});

  const submit = (e: FormEvent) => {
    e.preventDefault();

    const parsed = validatePasswordChange({
      currentPassword: current,
      newPassword: next,
    });
    const found: typeof errors = parsed.ok ? {} : { ...parsed.errors };
    if (!found.newPassword && next !== confirm) {
      found.confirm = "The passwords don't match.";
    }

    setErrors(found);
    if (!parsed.ok || found.confirm) return;

    change.mutate(parsed.data, {
      onSuccess: () => {
        setCurrent("");
        setNext("");
        setConfirm("");
      },
    });
  };

  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    change.reset();
  };

  return (
    <FormCard
      icon={Lock}
      title="Password"
      description="Choose a strong password you don't use anywhere else."
      onSubmit={submit}
      footer={
        <>
          <SubmitButton
            pending={change.isPending}
            disabled={!current && !next && !confirm}
          >
            Update password
          </SubmitButton>
          {change.isError && (
            <FormMessage tone="error">{change.error.message}</FormMessage>
          )}
          {change.isSuccess && (
            <FormMessage tone="success">{change.data.message}</FormMessage>
          )}
        </>
      }
    >
      <Field
        id="current-password"
        label="Current password"
        error={errors.currentPassword}
      >
        <PasswordInput
          id="current-password"
          value={current}
          onChange={edit(setCurrent)}
          autoComplete="current-password"
          invalid={!!errors.currentPassword}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="new-password"
          label="New password"
          hint={`At least ${PASSWORD_MIN} characters.`}
          error={errors.newPassword}
        >
          <PasswordInput
            id="new-password"
            value={next}
            onChange={edit(setNext)}
            autoComplete="new-password"
            invalid={!!errors.newPassword}
          />
        </Field>

        <Field
          id="confirm-password"
          label="Confirm new password"
          error={errors.confirm}
        >
          <PasswordInput
            id="confirm-password"
            value={confirm}
            onChange={edit(setConfirm)}
            autoComplete="new-password"
            invalid={!!errors.confirm}
          />
        </Field>
      </div>
    </FormCard>
  );
}

// ---------------------------------------------------------------------------
// Read-only details
// ---------------------------------------------------------------------------

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 not-last:border-b">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap justify-end gap-1.5 text-right text-sm font-medium">
        {children}
      </dd>
    </div>
  );
}

function AccountDetails({ account }: { account: Account }) {
  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle className="text-base">Account details</CardTitle>
        <CardDescription>
          Your role and school are set by the school administrator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow label="Role">
            {account.roles.length
              ? account.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {ROLE_LABELS[role] ?? role}
                  </Badge>
                ))
              : "—"}
          </InfoRow>
          <InfoRow label="School">
            {account.school
              ? `${account.school.name} (${account.school.code})`
              : "—"}
          </InfoRow>
          <InfoRow label="Member since">
            {formatDate(account.createdAt)}
          </InfoRow>
        </dl>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function AccountSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

export function AccountPage() {
  const {
    data: account,
    isPending,
    isError,
    error,
    refetch,
  } = useAccountQuery();

  if (isPending) return <AccountSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="h-24 bg-linear-to-r from-primary/25 via-primary/10 to-transparent" />
        <CardContent className="pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground shadow-sm ring-4 ring-card">
              {initials(account.fullName)}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {account.fullName}
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                {account.email}
                {account.school ? ` · ${account.school.name}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {account.roles.map((role) => (
                <Badge key={role} variant="outline">
                  {ROLE_LABELS[role] ?? role}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ProfileForm account={account} />
          <EmailForm account={account} />
          <PasswordForm />
        </div>

        <AccountDetails account={account} />
      </div>
    </div>
  );
}
