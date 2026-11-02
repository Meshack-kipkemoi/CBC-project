"use client";

import CursorGrid from "@/components/react-bits/cursor-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function NotFoundPage() {
  const { resolvedTheme } = useTheme();
  return (
    <div className="w-full h-150 relative">
      <CursorGrid
        lightMode={resolvedTheme === "light"}
        cellSize={60}
        color="var(--foreground)"
        highlight="area"
        gridStyle="lines"
        radius={140}
        holdTime={400}
        fadeDuration={800}
        fillOpacity={0.08}
        gridOpacity={0.08}
        spotlight={0.6}
        clickPulse
      >
        <div className="w-full h-full flex justify-center items-center px-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-background/40 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xs sm:p-10">
            <div className="absolute top-24 right-24 bg-destructive blur-3xl size-24" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full border border-destructive/10 bg-destructive/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-destructive">
                Error 404
              </span>

              <h1 className="mt-6 bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text font-serif text-7xl font-bold tracking-wider text-transparent sm:text-8xl">
                404
              </h1>

              <p className="mt-4 text-xl font-semibold tracking-tight">
                This page doesn&apos;t exist
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                The page you&apos;re looking for may have been moved, deleted,
                or never existed in the first place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size={"lg"} className="group" asChild>
                  <Link href="/">
                    <Home className="group-hover:animate-bounce" />
                    Back to home
                  </Link>
                </Button>
                <Button
                  type="button"
                  size={"lg"}
                  variant={"outline"}
                  onClick={() => window.history.back()}
                  className="group"
                >
                  <ArrowLeft className="group-hover:-translate-x-1 transition-all" />
                  Go back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CursorGrid>
    </div>
  );
}
