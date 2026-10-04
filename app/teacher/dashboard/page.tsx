"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Search,
  Settings2,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

const students = [
  {
    id: "am",
    name: "Amani Mwangi",
    initials: "AM",
    level: "Needs support",
    levelTone: "warning",
    average: 52,
    attendance: 88,
    strengths: ["Creative Arts", "Kiswahili"],
    focus: ["Mathematics", "Integrated Science"],
    note: "Amani is showing strong creative expression but needs structured practice with fractions and measurement.",
    guardian: "Grace Mwangi",
    lastAssessment: "12 Sept 2026",
    trend: [44, 48, 46, 51, 49, 52],
  },
  {
    id: "bk",
    name: "Baraka Kiptoo",
    initials: "BK",
    level: "Watch closely",
    levelTone: "watch",
    average: 61,
    attendance: 91,
    strengths: ["Social Studies", "English"],
    focus: ["Mathematics"],
    note: "Baraka participates well in class discussions. Short weekly problem-solving check-ins may help build confidence.",
    guardian: "Samuel Kiptoo",
    lastAssessment: "12 Sept 2026",
    trend: [55, 58, 57, 60, 59, 61],
  },
  {
    id: "cw",
    name: "Cynthia Wanjiru",
    initials: "CW",
    level: "Needs support",
    levelTone: "warning",
    average: 48,
    attendance: 84,
    strengths: ["Agriculture", "Kiswahili"],
    focus: ["English", "Integrated Science"],
    note: "Cynthia benefits from visual examples and peer learning. Review reading comprehension in small groups.",
    guardian: "Mary Wanjiru",
    lastAssessment: "10 Sept 2026",
    trend: [52, 49, 51, 47, 46, 48],
  },
  {
    id: "dn",
    name: "David Njoroge",
    initials: "DN",
    level: "On track",
    levelTone: "good",
    average: 74,
    attendance: 96,
    strengths: ["Mathematics", "Integrated Science"],
    focus: ["English"],
    note: "David is consistently engaged and ready for extension tasks in STEM subjects.",
    guardian: "Peter Njoroge",
    lastAssessment: "12 Sept 2026",
    trend: [66, 68, 70, 71, 73, 74],
  },
  {
    id: "eo",
    name: "Esther Otieno",
    initials: "EO",
    level: "Watch closely",
    levelTone: "watch",
    average: 63,
    attendance: 93,
    strengths: ["English", "Creative Arts"],
    focus: ["Social Studies"],
    note: "Esther is improving steadily. Encourage concise written responses and evidence-based explanations.",
    guardian: "Jane Otieno",
    lastAssessment: "11 Sept 2026",
    trend: [54, 56, 57, 60, 61, 63],
  },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Interventions", icon: ClipboardList },
  { label: "Analytics", icon: BarChart3 },
  { label: "My profile", icon: CircleUserRound },
];

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="font-serif text-3xl tracking-tight">{value}</span>
        </div>
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${accent ? "bg-accent text-accent-foreground" : "bg-secondary text-primary"}`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp aria-hidden="true" className="size-3.5 text-primary" />
        {detail}
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const [selectedId, setSelectedId] = useState("am");
  const [query, setQuery] = useState("");
  const selectedStudent =
    students.find((student) => student.id === selectedId) ?? students[0];
  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        student.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-border bg-primary px-5 py-5 text-primary-foreground lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Sparkles aria-hidden="true" className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold tracking-[0.18em]">
                CBC / INSIGHT
              </span>
              <span className="mt-1 text-xs text-primary-foreground/55">
                Teacher workspace
              </span>
            </div>
          </div>
          <nav
            aria-label="Teacher navigation"
            className="mt-10 flex gap-2 overflow-x-auto lg:flex-col"
          >
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active ? "bg-primary-foreground/12 font-semibold text-primary-foreground" : "text-primary-foreground/60 hover:bg-primary-foreground/8 hover:text-primary-foreground"}`}
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-auto hidden rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 lg:block">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Bell aria-hidden="true" className="size-4 text-accent" /> Weekly
              pulse
            </div>
            <p className="mt-3 text-xs leading-5 text-primary-foreground/60">
              3 learners may benefit from a focused check-in this week.
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-accent"
            >
              View interventions{" "}
              <ArrowUpRight aria-hidden="true" className="ml-1 inline size-3" />
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-col gap-4 border-b border-border bg-background/95 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Tuesday, 22 September 2026
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight">
                Good morning, Ms. Achieng
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Notifications"
                className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground"
              >
                <Bell aria-hidden="true" className="size-4" />
              </button>
              <div className="flex size-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                MA
              </div>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Class average"
                value="64%"
                detail="Up 6% from last term"
                icon={BarChart3}
                accent
              />
              <MetricCard
                label="Learners"
                value="42"
                detail="36 actively assessed"
                icon={Users}
              />
              <MetricCard
                label="Need intervention"
                value="8"
                detail="3 new this week"
                icon={AlertTriangle}
              />
              <MetricCard
                label="Attendance"
                value="92%"
                detail="Above school average"
                icon={CheckCircle2}
              />
            </div>

            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.3fr)_minmax(330px,0.7fr)]">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl tracking-tight">
                      Class performance
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Average competency scores across the last six assessments.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    View analytics{" "}
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </button>
                </div>
                <div className="mt-7 flex h-56 items-end gap-3 border-b border-border pb-0 sm:gap-6">
                  {[54, 58, 57, 61, 63, 64].map((value, index) => (
                    <div
                      key={value}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold text-muted-foreground">
                        {value}%
                      </span>
                      <div
                        className="w-full max-w-12 rounded-t-lg bg-primary transition-all"
                        style={{
                          height: `${value * 2.3}px`,
                          opacity: 0.52 + index * 0.08,
                        }}
                      />
                      <span className="pb-3 text-[11px] text-muted-foreground">
                        {["Apr", "May", "Jun", "Jul", "Aug", "Sep"][index]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" /> Overall
                    class average
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-accent" />{" "}
                    Competency evidence
                  </span>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Sparkles aria-hidden="true" className="size-5" />
                  </div>
                  <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-[11px] font-medium text-primary-foreground/70">
                    AI insight
                  </span>
                </div>
                <h2 className="mt-6 font-serif text-2xl leading-tight">
                  Mathematics needs a closer look.
                </h2>
                <p className="mt-3 text-sm leading-6 text-primary-foreground/65">
                  8 learners are below the 50% threshold in Mathematics. A
                  small-group intervention could improve fluency before the next
                  assessment.
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
                >
                  Plan intervention{" "}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </button>
              </section>
            </div>

            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="font-serif text-2xl tracking-tight">
                    Learners needing attention
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a learner to inspect their individual performance.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    aria-label="Search learners"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search learners"
                    className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>
              <div className="grid xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="divide-y divide-border">
                  {filteredStudents.map((student) => (
                    <button
                      type="button"
                      key={student.id}
                      onClick={() => setSelectedId(student.id)}
                      className={`flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-secondary/60 sm:px-6 ${selectedStudent.id === student.id ? "bg-secondary/70" : ""}`}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/80 text-xs font-bold text-accent-foreground">
                        {student.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{student.name}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${student.levelTone === "warning" ? "bg-destructive/10 text-destructive" : student.levelTone === "watch" ? "bg-accent/30 text-accent-foreground" : "bg-primary/10 text-primary"}`}
                          >
                            {student.level}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Strength: {student.strengths[0]} · Focus:{" "}
                          {student.focus[0]}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <span className="font-serif text-xl">
                          {student.average}%
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          average
                        </p>
                      </div>
                      <ChevronRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                    </button>
                  ))}
                </div>
                <aside className="border-t border-border bg-secondary/30 p-5 xl:border-l xl:border-t-0 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Learner profile
                      </p>
                      <h3 className="mt-2 font-serif text-2xl">
                        {selectedStudent.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Close learner profile"
                      className="rounded-lg p-1 text-muted-foreground hover:bg-background"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-card p-3">
                      <span className="text-[11px] text-muted-foreground">
                        Average
                      </span>
                      <p className="mt-1 font-serif text-2xl">
                        {selectedStudent.average}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-card p-3">
                      <span className="text-[11px] text-muted-foreground">
                        Attendance
                      </span>
                      <p className="mt-1 font-serif text-2xl">
                        {selectedStudent.attendance}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-4 text-sm">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Strengths
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedStudent.strengths.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Focus areas
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedStudent.focus.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="border-l-2 border-accent pl-3 text-xs leading-5 text-muted-foreground">
                      {selectedStudent.note}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Open full profile{" "}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </button>
                </aside>
              </div>
            </section>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquareText aria-hidden="true" className="size-4" />{" "}
              Performance signals are based on teacher-entered assessment
              evidence and attendance records.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
