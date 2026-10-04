"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const classes = [
  {
    name: "Grade 7 East",
    learners: 38,
    average: 68,
    change: "+8%",
    status: "On track",
  },
  {
    name: "Grade 7 West",
    learners: 41,
    average: 64,
    change: "+5%",
    status: "On track",
  },
  {
    name: "Grade 8 North",
    learners: 36,
    average: 59,
    change: "+2%",
    status: "Watch",
  },
  {
    name: "Grade 8 West",
    learners: 42,
    average: 64,
    change: "+6%",
    status: "On track",
  },
  {
    name: "Grade 9 East",
    learners: 35,
    average: 57,
    change: "-3%",
    status: "Needs support",
  },
];

function Stat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 font-serif text-3xl tracking-tight">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="size-3.5 text-primary" />
        {detail}
      </p>
    </div>
  );
}

function Nav() {
  return (
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
      <nav
        aria-label="Principal navigation"
        className="mt-10 flex gap-2 overflow-x-auto lg:flex-col"
      >
        <Link
          href="/principal/dashboard"
          className="flex items-center gap-3 rounded-xl bg-primary-foreground/12 px-3 py-3 text-sm font-semibold"
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>
        <Link
          href="/principal/interventions"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-primary-foreground/60 hover:bg-primary-foreground/8"
        >
          <ClipboardList className="size-4" />
          Interventions
        </Link>
        <Link
          href="/principal/analytics"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-primary-foreground/60 hover:bg-primary-foreground/8"
        >
          <BarChart3 className="size-4" />
          Analytics
        </Link>
      </nav>
    </aside>
  );
}

export default function PrincipalDashboard() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Nav />
        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Tuesday, 22 September 2026
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight">
                Good morning, Mr. Kamau
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <div className="flex size-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                PK
              </div>
            </div>
          </header>
          <div className="mx-auto flex max-w-[1400px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                label="School average"
                value="63%"
                detail="Up 4% from last term"
                icon={BarChart3}
              />
              <Stat
                label="Learners"
                value="486"
                detail="Across 12 classes"
                icon={Users}
              />
              <Stat
                label="Classes on track"
                value="9 / 12"
                detail="75% of school"
                icon={GraduationCap}
              />
              <Stat
                label="Needs intervention"
                value="3"
                detail="Classes to review"
                icon={AlertTriangle}
              />
            </div>
            <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr]">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-2xl">School performance</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Average competency score across the last six assessments.
                    </p>
                  </div>
                  <Building2 className="size-5 text-muted-foreground" />
                </div>
                <div className="mt-8 flex h-56 items-end gap-3 border-b border-border sm:gap-6">
                  {[55, 57, 58, 60, 61, 63].map((value, index) => (
                    <div
                      key={index}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold text-muted-foreground">
                        {value}%
                      </span>
                      <div
                        className="w-full max-w-12 rounded-t-lg bg-primary"
                        style={{
                          height: `${value * 2.3}px`,
                          opacity: 0.5 + index * 0.08,
                        }}
                      />
                      <span className="pb-3 text-[11px] text-muted-foreground">
                        {["Apr", "May", "Jun", "Jul", "Aug", "Sep"][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    School signal
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-2xl leading-tight">
                  Numeracy is the clearest opportunity.
                </h2>
                <p className="mt-3 text-sm leading-6 text-primary-foreground/65">
                  Three classes are below the 60% threshold in Mathematics.
                  Coordinate a shared support cycle with their class teachers.
                </p>
                <Link
                  href="/principal/interventions"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
                >
                  Review classes <ArrowUpRight className="size-4" />
                </Link>
              </section>
            </div>
            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5 sm:p-6">
                <h2 className="font-serif text-2xl">
                  Class performance overview
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a class to inspect its performance and learner
                  profiles.
                </p>
              </div>
              <div className="divide-y divide-border">
                {classes.map((item) => (
                  <Link
                    key={item.name}
                    href={`/principal/analytics?class=${encodeURIComponent(item.name)}`}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-secondary/50 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.learners} learners · {item.change} this term
                      </p>
                    </div>
                    <div className="w-full max-w-56">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-muted-foreground">Average</span>
                        <span className="font-semibold">{item.average}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.average}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${item.status === "Needs support" ? "bg-destructive/10 text-destructive" : item.status === "Watch" ? "bg-accent/40 text-accent-foreground" : "bg-primary/10 text-primary"}`}
                    >
                      {item.status}
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
