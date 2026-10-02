"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";

const classes = [
  "Grade 7 East",
  "Grade 7 West",
  "Grade 8 North",
  "Grade 8 West",
  "Grade 9 East",
];
const students = [
  { name: "Amani Mwangi", initials: "AM", average: 72, status: "On track" },
  {
    name: "Cynthia Wanjiru",
    initials: "CW",
    average: 48,
    status: "Needs support",
  },
  { name: "Baraka Kiptoo", initials: "BK", average: 61, status: "Watch" },
  { name: "David Njoroge", initials: "DN", average: 76, status: "On track" },
];
const subjects = [
  { name: "Kiswahili", score: 76 },
  { name: "Creative Arts", score: 72 },
  { name: "Social Studies", score: 68 },
  { name: "Integrated Science", score: 63 },
  { name: "English", score: 59 },
  { name: "Mathematics", score: 54 },
];

export default function PrincipalAnalytics() {
  const [activeClass, setActiveClass] = useState("Grade 8 West");
  const [query, setQuery] = useState("");
  const filtered = students.filter((student) =>
    student.name.toLowerCase().includes(query.toLowerCase()),
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
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-primary-foreground/60"
            >
              <ClipboardList className="size-4" />
              Interventions
            </Link>
            <Link
              href="/principal/analytics"
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
                href="/principal/dashboard"
                className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <ArrowLeft className="size-3" />
                Back to dashboard
              </Link>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                School analytics · Term 3
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight">
                Class performance
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <div className="flex size-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                PK
              </div>
            </div>
          </header>
          <div className="mx-auto flex max-w-[1300px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="font-serif text-2xl">Select a class</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Compare performance, then inspect individual learners.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {classes.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setActiveClass(name)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${activeClass === name ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Class average</p>
                <p className="mt-3 font-serif text-3xl">64%</p>
                <p className="mt-2 text-xs text-primary">+6% this term</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Learners</p>
                <p className="mt-3 font-serif text-3xl">42</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  36 assessed
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Strongest area</p>
                <p className="mt-3 font-serif text-3xl">Kiswahili</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  76% average
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Intervention</p>
                <p className="mt-3 font-serif text-3xl text-destructive">8</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Learners to follow up
                </p>
              </div>
            </div>
            <div className="grid gap-7 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-2xl">{activeClass}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Performance by learning area.
                    </p>
                  </div>
                  <BookOpen className="size-5 text-muted-foreground" />
                </div>
                <div className="mt-7 flex flex-col gap-5">
                  {subjects.map((subject) => (
                    <div key={subject.name}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{subject.name}</span>
                        <span className="font-semibold">{subject.score}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${subject.score < 60 ? "bg-destructive/70" : subject.score < 70 ? "bg-accent" : "bg-primary"}`}
                          style={{ width: `${subject.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <h2 className="font-serif text-2xl">
                      Learners in {activeClass}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open a learner profile to inspect individual evidence.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-56">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      aria-label="Search learners"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search learners"
                      className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {filtered.map((student) => (
                    <Link
                      key={student.name}
                      href="/teacher/dashboard"
                      className="flex items-center gap-4 px-5 py-4 transition hover:bg-secondary/50 sm:px-6"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-accent/80 text-xs font-bold text-accent-foreground">
                        {student.initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{student.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Individual learner profile
                        </p>
                      </div>
                      <span className="font-serif text-xl">
                        {student.average}%
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${student.status === "Needs support" ? "bg-destructive/10 text-destructive" : student.status === "Watch" ? "bg-accent/30 text-accent-foreground" : "bg-primary/10 text-primary"}`}
                      >
                        {student.status}
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
