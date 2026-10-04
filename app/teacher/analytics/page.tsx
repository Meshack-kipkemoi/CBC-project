"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const subjects = [
  { name: "Kiswahili", score: 76, color: "bg-primary" },
  { name: "Creative Arts", score: 72, color: "bg-primary" },
  { name: "Social Studies", score: 68, color: "bg-accent" },
  { name: "Integrated Science", score: 63, color: "bg-accent" },
  { name: "English", score: 59, color: "bg-destructive/70" },
  { name: "Mathematics", score: 54, color: "bg-destructive/70" },
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col bg-primary px-5 py-5 text-primary-foreground lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:px-4 lg:py-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold tracking-[0.18em]">
                CBC / INSIGHT
              </span>
              <p className="mt-1 text-xs text-primary-foreground/55">
                Teacher workspace
              </p>
            </div>
          </div>
          <nav className="mt-10 flex gap-2 overflow-x-auto lg:flex-col">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-primary-foreground/60 hover:bg-primary-foreground/8"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link
              href="/teacher/interventions"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-primary-foreground/60 hover:bg-primary-foreground/8"
            >
              <ClipboardList className="size-4" />
              Interventions
            </Link>
            <Link
              href="/teacher/analytics"
              className="flex items-center gap-3 rounded-xl bg-primary-foreground/12 px-3 py-3 text-sm font-semibold"
            >
              <BarChart3 className="size-4" />
              Analytics
            </Link>
          </nav>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <Link
                href="/teacher/dashboard"
                className="mb-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="size-3" />
                Back to dashboard
              </Link>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Class 8 West · Term 3
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight">
                Class analytics
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <div className="flex size-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                MA
              </div>
            </div>
          </header>
          <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Class average</p>
                <p className="mt-3 font-serif text-3xl">64%</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-primary">
                  <TrendingUp className="size-3.5" />
                  6% from last term
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  Learners assessed
                </p>
                <p className="mt-3 font-serif text-3xl">36 / 42</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  86% assessment coverage
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Strongest area</p>
                <p className="mt-3 font-serif text-3xl">Kiswahili</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  76% class average
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  Growth this term
                </p>
                <p className="mt-3 font-serif text-3xl">+6%</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Steady upward movement
                </p>
              </div>
            </div>
            <div className="grid gap-7 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-2xl">
                      Performance by subject
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Current class average across CBC learning areas.
                    </p>
                  </div>
                  <BookOpen className="size-5 text-muted-foreground" />
                </div>
                <div className="mt-7 flex flex-col gap-5">
                  {subjects.map((subject) => (
                    <div key={subject.name}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{subject.name}</span>
                        <span className="font-semibold">{subject.score}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${subject.color}`}
                          style={{ width: `${subject.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="font-serif text-2xl">Term progression</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Class average over six assessments.
                  </p>
                </div>
                <div className="mt-8 flex h-48 items-end gap-3 border-b border-border sm:gap-5">
                  {[54, 58, 57, 61, 63, 64].map((value, index) => (
                    <div
                      key={index}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold text-muted-foreground">
                        {value}%
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-primary"
                        style={{
                          height: `${value * 2.1}px`,
                          opacity: 0.55 + index * 0.08,
                        }}
                      />
                      <span className="pb-3 text-[11px] text-muted-foreground">
                        {["Apr", "May", "Jun", "Jul", "Aug", "Sep"][index]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl bg-secondary/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Class signal
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    The class is progressing consistently. Mathematics and
                    English are the clearest opportunities for targeted support.
                  </p>
                </div>
              </section>
            </div>
            <section className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-accent">
                    <Sparkles className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      AI-assisted class insight
                    </span>
                  </div>
                  <h2 className="mt-3 font-serif text-2xl">
                    Prioritise numeracy and reading fluency.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/65">
                    Learners who need support are concentrated in Mathematics
                    and English. Consider a two-week small-group cycle, then
                    compare evidence in the next assessment.
                  </p>
                </div>
                <Link
                  href="/teacher/interventions"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
                >
                  View interventions <Users className="size-4" />
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
