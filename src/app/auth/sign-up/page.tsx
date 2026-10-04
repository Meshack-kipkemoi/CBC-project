import { Spinner } from "@/components/ui/spinner";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your account.",
  openGraph: {
    title: "Create Account - GetFifty",
    description: "Create your account today.",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<Spinner />}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
