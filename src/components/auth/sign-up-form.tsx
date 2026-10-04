"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Extract the 'next' param, or default to dashboard/home
      const next = searchParams.get("next") || "/dashboard";

      // 2. Build the redirect URL with the 'next' parameter encoded
      // This sends the user to /auth/callback (standard) or directly to the dashboard
      // but keeps the 'next' instruction alive.

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 py-24", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Create a new account and get your link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <OAuthButtons />
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <InputGroupAddon>
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <InputGroup className="overflow-hidden">
                    <InputGroupInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password here..."
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputGroupAddon>
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupAddon align={"inline-end"}>
                      <InputGroupButton
                        onClick={() => setShowPassword(!showPassword)}
                        className="cursor-pointer hover:bg-muted transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                  </div>
                  <InputGroup className="overflow-hidden">
                    <InputGroupInput
                      id="repeat-password"
                      placeholder="Enter password confirmation here..."
                      type={showRepeatPassword ? "text" : "password"}
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                    <InputGroupAddon>
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupAddon align={"inline-end"}>
                      <InputGroupButton
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() =>
                          setShowRepeatPassword(!showRepeatPassword)
                        }
                      >
                        {showRepeatPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating an account..." : "Create account"}
                </Button>
              </div>
            </form>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
