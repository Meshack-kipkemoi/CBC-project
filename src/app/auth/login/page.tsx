import { Spinner } from "@/components/ui/spinner";
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to access your account",
  openGraph: {
    title: "Login",
    description: "Access your account and manage your data.",
    type: "website",
  },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <Suspense fallback={<Spinner />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
