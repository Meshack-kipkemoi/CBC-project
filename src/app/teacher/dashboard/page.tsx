"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types – these mirror the JSON returned by GET /api/dashboard              */
/* -------------------------------------------------------------------------- */
type Tone = "warning" | "watch" | "good" | "none";

type Learner = {
  id: string;
  name: string;
  initials: string;
  admissionNumber: string;
  level: string;
  levelTone: Tone;
  average: number | null;
  attendance: number | null;
  strengths: string[];
  focus: string[];
  note: string;
  guardian: string | null;
  lastAssessment: string | null;
  trend: number[];
};

type DashboardData = {
  date: string;
  teacher: { fullName: string; initials: string };
  class: {
    streamId: string;
    streamName: string | null;
    gradeName: string | null;
    academicYear: string;
    termNumber: number | null;
  };
  metrics: {
    classAverage: number | null;
    changeFromLastTerm: number | null;
    learners: { total: number; assessed: number };
    needIntervention: { total: number; newThisWeek: number };
    attendance: number | null;
  };
  performance: { month: string; value: number }[];
  insight: {
    learningArea: string;
    belowThresholdCount: number;
    threshold: number;
  } | null;
  learners: Learner[];
};

// The learner whose profile is open by default (falls back to the first learner)
const DEFAULT_LEARNER_NAME = "Joy Akinyi";

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */
const formatPercent = (value: number | null) =>
  value === null ? "–" : `${value}%`;

function formatLongDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso: string | null) {
  if (!iso) return "No assessments yet";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function changeDetail(change: number | null) {
  if (change === null) return "No previous term to compare";
  if (change === 0) return "Same as last term";
  return `${change > 0 ? "Up" : "Down"} ${Math.abs(change)}% from last term`;
}

function toneClasses(tone: Tone) {
  if (tone === "warning") return "bg-destructive/10 text-destructive";
  if (tone === "watch") return "bg-accent/30 text-accent-foreground";
  if (tone === "none") return "bg-secondary text-muted-foreground";
  return "bg-primary/10 text-primary";
}

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */
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

function CenteredMessage({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-sm text-center">
        <h1 className="font-serif text-2xl tracking-tight">{title}</h1>
        {detail && (
          <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            {action.label}
          </button>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function TeacherDashboard() {
  const pathname = usePathname();
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const navItems = useMemo(
    () => [
      { label: "Dashboard", icon: LayoutDashboard, link: "/teacher/dashboard" },
      {
        label: "Interventions",
        icon: ClipboardList,
        link: "/teacher/interventions",
      },
      { label: "Analytics", icon: BarChart3, link: "/teacher/analytics" },
      { label: "My profile", icon: CircleUserRound, link: "/teacher/profile" },
    ],
    [],
  );

  // Load the dashboard from the API
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    fetch("/api/dashboard", { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error ?? "Could not load the dashboard.");
        }
        setData(body as DashboardData);
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadKey]);

  const learners = data?.learners ?? [];

  const defaultLearner = useMemo(
    () =>
      learners.find(
        (l) => l.name.toLowerCase() === DEFAULT_LEARNER_NAME.toLowerCase(),
      ) ?? learners[0],
    [learners],
  );

  const selectedStudent =
    learners.find((l) => l.id === selectedId) ?? defaultLearner;

  const filteredStudents = useMemo(
    () =>
      learners.filter((l) =>
        l.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [learners, query],
  );

  if (status === "loading") {
    return <CenteredMessage title="Loading your dashboard…" />;
  }

  if (status === "error" || !data) {
    return (
      <CenteredMessage
        title="We couldn't load your dashboard"
        detail={error}
        action={{
          label: "Try again",
          onClick: () => setReloadKey((k) => k + 1),
        }}
      />
    );
  }

  const { metrics, performance, insight, teacher } = data;
  const teacherFirstName = teacher.fullName.split(" ")[0];

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
            {navItems.map(({ label, icon: Icon, link }) => {
              const active = pathname === link;
              return (
                <Link
                  key={label}
                  href={link}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active ? "bg-primary-foreground/12 font-semibold text-primary-foreground" : "text-primary-foreground/60 hover:bg-primary-foreground/8 hover:text-primary-foreground"}`}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 lg:block">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Bell aria-hidden="true" className="size-4 text-accent" /> Weekly
              pulse
            </div>
            <p className="mt-3 text-xs leading-5 text-primary-foreground/60">
              {metrics.needIntervention.total > 0
                ? `${metrics.needIntervention.total} ${metrics.needIntervention.total === 1 ? "learner" : "learners"} may benefit from a focused check-in this week.`
                : "No learners need a focused check-in right now."}
            </p>
            <Link
              href="/teacher/interventions"
              className="mt-3 inline-block text-xs font-semibold text-accent"
            >
              View interventions{" "}
              <ArrowUpRight aria-hidden="true" className="ml-1 inline size-3" />
            </Link>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-col gap-4 border-b border-border bg-background/95 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {formatLongDate(data.date)}
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight">
                {greeting()}, {teacherFirstName}
              </h1>
              {data.class.streamName && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.class.gradeName} {data.class.streamName}
                  {data.class.termNumber
                    ? ` · Term ${data.class.termNumber}`
                    : ""}
                </p>
              )}
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
                {teacher.initials}
              </div>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Class average"
                value={formatPercent(metrics.classAverage)}
                detail={changeDetail(metrics.changeFromLastTerm)}
                icon={BarChart3}
                accent
              />
              <MetricCard
                label="Learners"
                value={String(metrics.learners.total)}
                detail={`${metrics.learners.assessed} actively assessed`}
                icon={Users}
              />
              <MetricCard
                label="Need intervention"
                value={String(metrics.needIntervention.total)}
                detail={`${metrics.needIntervention.newThisWeek} new this week`}
                icon={AlertTriangle}
              />
              <MetricCard
                label="Attendance"
                value={formatPercent(metrics.attendance)}
                detail={
                  metrics.attendance === null
                    ? "Attendance isn't tracked yet"
                    : "Class attendance rate"
                }
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
                      Average competency scores by month.
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

                {performance.length === 0 ? (
                  <p className="mt-7 flex h-56 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                    Results will appear here once assessments are published.
                  </p>
                ) : (
                  <div className="mt-7 flex h-56 items-end gap-3 border-b border-border pb-0 sm:gap-6">
                    {performance.map(({ month, value }, index) => (
                      <div
                        key={`${month}-${index}`}
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
                          {month}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" /> Overall
                    class average
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
                {insight ? (
                  <>
                    <h2 className="mt-6 font-serif text-2xl leading-tight">
                      {insight.learningArea} needs a closer look.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-primary-foreground/65">
                      {insight.belowThresholdCount}{" "}
                      {insight.belowThresholdCount === 1
                        ? "learner is"
                        : "learners are"}{" "}
                      below the {insight.threshold}% threshold in{" "}
                      {insight.learningArea}. A small-group intervention could
                      improve fluency before the next assessment.
                    </p>
                    <button
                      type="button"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
                    >
                      Plan intervention{" "}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="mt-6 font-serif text-2xl leading-tight">
                      No learning areas need attention.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-primary-foreground/65">
                      No learners are below the threshold in any learning area
                      this term.
                    </p>
                  </>
                )}
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

              {learners.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No learners are enrolled in this class yet.
                </p>
              ) : (
                <div className="grid xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="divide-y divide-border">
                    {filteredStudents.length === 0 && (
                      <p className="p-6 text-sm text-muted-foreground">
                        No learners match &ldquo;{query}&rdquo;.
                      </p>
                    )}
                    {filteredStudents.map((student) => (
                      <button
                        type="button"
                        key={student.id}
                        onClick={() => setSelectedId(student.id)}
                        className={`flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-secondary/60 sm:px-6 ${selectedStudent?.id === student.id ? "bg-secondary/70" : ""}`}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/80 text-xs font-bold text-accent-foreground">
                          {student.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">
                              {student.name}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneClasses(student.levelTone)}`}
                            >
                              {student.level}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Strength: {student.strengths[0] ?? "–"} · Focus:{" "}
                            {student.focus[0] ?? "–"}
                          </p>
                        </div>
                        <div className="hidden text-right sm:block">
                          <span className="font-serif text-xl">
                            {formatPercent(student.average)}
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

                  {selectedStudent && (
                    <aside className="border-t border-border bg-secondary/30 p-5 xl:border-l xl:border-t-0 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Learner profile
                          </p>
                          <h3 className="mt-2 font-serif text-2xl">
                            {selectedStudent.name}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Adm. {selectedStudent.admissionNumber}
                            {selectedStudent.guardian
                              ? ` · Guardian: ${selectedStudent.guardian}`
                              : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Close learner profile"
                          onClick={() => setSelectedId(null)}
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
                            {formatPercent(selectedStudent.average)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-card p-3">
                          <span className="text-[11px] text-muted-foreground">
                            Attendance
                          </span>
                          <p className="mt-1 font-serif text-2xl">
                            {formatPercent(selectedStudent.attendance)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-col gap-4 text-sm">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Strengths
                          </span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedStudent.strengths.length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                Not enough results yet
                              </span>
                            )}
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
                            {selectedStudent.focus.length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                Not enough results yet
                              </span>
                            )}
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
                        <p className="text-xs text-muted-foreground">
                          Last assessment:{" "}
                          {formatShortDate(selectedStudent.lastAssessment)}
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
                  )}
                </div>
              )}
            </section>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquareText aria-hidden="true" className="size-4" />{" "}
              Performance signals are based on teacher-entered assessment
              evidence.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}