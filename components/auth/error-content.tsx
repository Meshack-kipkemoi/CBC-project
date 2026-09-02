"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Ban, ShieldAlert } from "lucide-react";
import Link from "next/link";

const ERROR_MAP: Record<string, { title: string; desc: string; icon: any }> = {
  user_banned: {
    title: "Account Restricted",
    desc: "Your account has been suspended for violating our terms of service. If you think this is a mistake, please contact support.",
    icon: Ban,
  },
  access_denied: {
    title: "Access Denied",
    desc: "You don't have permission to access this resource or your login request was rejected.",
    icon: ShieldAlert,
  },
  default: {
    title: "Something went wrong",
    desc: "We couldn't complete your request. Please try signing in again.",
    icon: AlertCircle,
  },
};

export default function ErrorContent() {
  const [errorInfo, setErrorInfo] = useState(ERROR_MAP.default);
  const [rawCode, setRawCode] = useState<string | null>(null);

  useEffect(() => {
    // Parse the hash fragment (#error=...)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const errorCode = params.get("error_code") || params.get("error");

    if (errorCode && ERROR_MAP[errorCode]) {
      setErrorInfo(ERROR_MAP[errorCode]);
    }
    setRawCode(errorCode);
  }, []);

  const Icon = errorInfo.icon;

  return (
    <Card className="border-destructive/20 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {errorInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {errorInfo.desc}
        </p>
        {rawCode && (
          <code className="mt-4 block rounded bg-muted px-2 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Error ID: {rawCode}
          </code>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-2" variant="default" render={<Link href="/auth/login" />} nativeButton={false}>Sign In <ArrowRight /></Button>
        <Button className="flex-1" variant="secondary" render={<Link href="/" className="flex items-center gap-2" />} nativeButton={false}>Go Home
                        </Button>
      </CardFooter>
    </Card>
  );
}
