"use client";

import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

const roles = [
  {
    key: "parent",
    title: "Parent",
    description:
      "Follow your learner’s growth, celebrate progress, and support learning at home.",
    icon: HeartHandshake,
    label: "Continue as parent",
  },
  {
    key: "teacher",
    title: "Teacher",
    description:
      "Turn everyday assessment evidence into timely, focused learner support.",
    icon: GraduationCap,
    label: "Continue as teacher",
  },
];

export function RoleEntry() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        <section className="relative flex min-h-[440px] flex-1 flex-col justify-between overflow-hidden bg-primary px-6 py-7 text-primary-foreground sm:px-10 lg:min-h-screen lg:px-16 lg:py-10">
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
              <Sparkles aria-hidden="true" className="size-5" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-[0.2em]">
              CBC / INSIGHT
            </span>
          </div>

          <div className="relative z-10 flex max-w-xl flex-col gap-7 py-16 lg:py-0">
            <div className="flex items-center gap-3 text-sm font-medium text-primary-foreground/70">
              <span className="h-px w-8 bg-primary-foreground/40" />
              Kenya’s competency journey
            </div>
            <h1 className="text-balance font-serif text-5xl leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              See the learner behind the score.
            </h1>
            <p className="max-w-md text-pretty text-base leading-7 text-primary-foreground/70 sm:text-lg">
              A thoughtful space for families and teachers to make every
              learner’s strengths visible—and every next step clearer.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-primary-foreground/15 pt-5 text-xs text-primary-foreground/55">
            <span>Grades 7–9 · Kenya CBC</span>
            <span className="font-mono">01 / 01</span>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 top-1/2 size-96 -translate-y-1/2 rounded-full border border-primary-foreground/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 top-1/2 size-64 -translate-y-1/2 rounded-full border border-primary-foreground/10"
          />
        </section>

        <section className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-lg flex-col gap-10">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Welcome back
              </p>
              <h2 className="text-balance font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                How will you enter?
              </h2>
              <p className="max-w-md text-pretty leading-7 text-muted-foreground">
                Choose your view to continue to CBC Insight.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Link
                    key={role.key}
                    href={`/auth/login`}
                    className="group flex items-center gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:p-6"
                  >
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-accent">
                      <Icon aria-hidden="true" className="size-6" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="font-serif text-2xl tracking-[-0.02em]">
                        {role.title}
                      </span>
                      <span className="text-sm leading-6 text-muted-foreground">
                        {role.description}
                      </span>
                    </div>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                    />
                  </Link>
                );
              })}
            </div>

            <p className="text-center text-xs leading-5 text-muted-foreground">
              Secure access for CBC learning communities.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default RoleEntry;
