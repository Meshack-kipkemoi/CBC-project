import ErrorContent from "@/components/auth/error-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error",
  description: "Something went wrong. Please try again or contact support.",
  robots: { index: false, follow: false },
};

export default function ErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center pt-20 bg-secondary/30">
      <div className="w-full max-w-sm">
        <ErrorContent />
      </div>
    </div>
  );
}
