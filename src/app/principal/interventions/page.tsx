"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const interventions = [
  {
    name: "Grade 9 East",
    learners: 35,
    average: 57,
    subject: "Mathematics",
    reason: "Low numeracy average across three assessments",
    priority: "High priority",
    action: "Moderated numeracy cycle",
    teacher: "Ms. Wambui",
  },
  {
    name: "Grade 8 North",
    learners: 36,
    average: 59,
    subject: "English",
    reason: "Reading comprehension below school benchmark",
    priority: "Review",
    action: "Guided reading programme",
    teacher: "Mr. Otieno",
  },
  {
    name: "Grade 7 Central",
    learners: 39,
    average: 58,
    subject: "Integrated Science",
    reason: "Practical evidence gaps in recent work",
    priority: "Review",
    action: "Science lesson study",
    teacher: "Ms. Achieng",
  },
];

export default function PrincipalInterventions() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      interventions.filter((item) =>
        `${item.name} ${item.subject}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
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
                Principal workspace
              </p>
            </div>
          </div>
          <nav className="mt-10 flex gap-2 overflow-x-auto lg:flex-col">
            <Link
              href="/principal/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-primary-foreground/60"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link
              href="/principal/interventions"
              className="flex items-center gap-3 rounded-xl bg-primary-foreground/12 px-3 py-3 text-sm font-semibold"
            >
              <ClipboardList className="size-4" />
              Interventions
            </Link>
            <Link
              href="/principal/analytics"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-primary-foreground/60"
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
                href="/principal/dashboard"
                className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <ArrowLeft className="size-3" />
                Back to dashboard
              </Link>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                School leadership
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight">
                Interventions
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <div className="flex size-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                PK
              </div>
            </div>
          </header>
          <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  Classes needing support
                </p>
                <p className="mt-3 font-serif text-3xl">3</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Across 110 learners
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">High priority</p>
                <p className="mt-3 font-serif text-3xl text-destructive">1</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Leadership review needed
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">School average</p>
                <p className="mt-3 font-serif text-3xl">63%</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Across all grade levels
                </p>
              </div>
            </div>
            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="font-serif text-2xl">Classes to review</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Prioritised using class-level assessment trends and CBC
                    evidence.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    aria-label="Search classes"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search classes"
                    className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="divide-y divide-border">
                {filtered.map((item) => (
                  <Link
                    key={item.name}
                    href={`/principal/analytics?class=${encodeURIComponent(item.name)}`}
                    className="flex flex-col gap-4 px-5 py-5 transition hover:bg-secondary/50 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/80 text-accent-foreground">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.priority === "High priority" ? "bg-destructive/10 text-destructive" : "bg-accent/30 text-accent-foreground"}`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.subject} · {item.reason}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Class teacher: {item.teacher}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm sm:flex sm:items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Class average
                        </p>
                        <p className="mt-1 font-semibold">{item.average}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Suggested response
                        </p>
                        <p className="mt-1 font-medium">{item.action}</p>
                      </div>
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="size-4 text-accent-foreground" />
              Principal recommendations should be reviewed with the class
              teacher before implementation.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
