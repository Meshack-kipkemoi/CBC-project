"use client";

import { useState } from "react";
import { signInWithOAuth } from "@/app/auth/actions/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParams } from "next/navigation";

type OAuthButtonsProps = {
  onError?: (error: string) => void;
  disabled?: boolean;
};

export function OAuthButtons({ onError, disabled }: OAuthButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleSignIn = async (provider: "google") => {
    if (provider === "google") setIsGoogleLoading(true);

    try {
      // Extract the 'next' param, or default to dashboard/home
      const next = searchParams.get("next") || "/dashboard";
      // Call Server Action - no props needed!
      await signInWithOAuth(provider, next);
      // No need to handle redirect - Server Action does it via `redirect()`
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to sign in with ${provider}`;
      onError?.(message);
      if (provider === "google") setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSignIn("google")}
        disabled={isGoogleLoading || disabled}
      >
        {isGoogleLoading ? <Spinner /> : <GoogleIcon className="mr-2 size-5" />}
        Continue with Google
      </Button>

      <div className="relative mt-2 mb-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or continue with email
        </span>
      </div>
    </div>
  );
}

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);
