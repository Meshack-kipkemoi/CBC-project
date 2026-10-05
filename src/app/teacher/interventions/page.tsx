"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Types – these mirror the JSON returned by GET /api/analytics              */
/* -------------------------------------------------------------------------- */
type Tone = "good" | "watch" | "warning";

type AnalyticsData = {
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
    learnersAssessed: { assessed: number; total: number; coverage: number };
    strongestArea: { name: string; average: number } | null;
    growth: { value: number; label: string } | null;
  };
  subjects: { name: string; score: number; tone: Tone }[];
  progression: { label: string; name: string; value: number }[];
  classSignal: string;
  insight: {
    headline: string;
    body: string;
    focusAreas: string[];
  } | null;
};

const TONE_BAR: Record<Tone, string> = {
  good: "bg-primary",
  watch: "bg-accent",
  warning: "bg-destructive/70",
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const formatPercent = (value: number | null) =>
  value === null ? "–" : `${value}%`;

function changeText(change: number | null) {
  if (change === null) return "No previous term to compare";
  if (change === 0) return "Same as last term";
  return `${change > 0 ? "Up" : "Down"} ${Math.abs(change)}% from last term`;
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
export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Load the analytics from the API
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    fetch("/api/analytics", { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error ?? "Could not load analytics.");
        }
        setData(body as AnalyticsData);
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadKey, router]);

  if (status === "loading") {
    return <CenteredMessage title="Loading analytics…" />;
  }

  if (status === "error" || !data) {
    return (
      <CenteredMessage
        title="We couldn't load analytics"
        detail={error}
        action={{ label: "Try again", onClick: () => setReloadKey((k) => k + 1) }}
      />
    );
  }

  const { metrics, subjects, progression, insight, teacher } = data;

  const classLabel = [
    [data.class.gradeName, data.class.streamName].filter(Boolean).join(" "),
    data.class.termNumber ? `Term ${data.class.termNumber}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const growthValue = metrics.growth?.value ?? null;

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
                {classLabel || "Teacher workspace"}
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight">
                Class analytics
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <div className="flex size-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                {teacher.initials}
              </div>
            </div>
          </header>

          <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Class average</p>
                <p className="mt-3 font-serif text-3xl">
                  {formatPercent(metrics.classAverage)}
                </p>
                {metrics.changeFromLastTerm === null ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {changeText(null)}
                  </p>
                ) : (
                  <p className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <TrendingUp className="size-3.5" />
                    {changeText(metrics.changeFromLastTerm)}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  Learners assessed
                </p>
                <p className="mt-3 font-serif text-3xl">
                  {metrics.learnersAssessed.assessed} /{" "}
                  {metrics.learnersAssessed.total}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {metrics.learnersAssessed.coverage}% assessment coverage
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Strongest area</p>
                <p className="mt-3 font-serif text-3xl">
                  {metrics.strongestArea?.name ?? "–"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {metrics.strongestArea
                    ? `${metrics.strongestArea.average}% class average`
                    : "No results yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  Growth this term
                </p>
                <p className="mt-3 font-serif text-3xl">
                  {growthValue === null
                    ? "–"
                    : `${growthValue > 0 ? "+" : ""}${growthValue}%`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {metrics.growth?.label ?? "Needs at least two assessments"}
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
                {subjects.length === 0 ? (
                  <p className="mt-7 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Subject averages will appear once assessments are published.
                  </p>
                ) : (
                  <div className="mt-7 flex flex-col gap-5">
                    {subjects.map((subject) => (
                      <div key={subject.name}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium">{subject.name}</span>
                          <span className="font-semibold">
                            {subject.score}%
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${TONE_BAR[subject.tone]}`}
                            style={{ width: `${Math.min(subject.score, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="font-serif text-2xl">Term progression</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Class average over the last {progression.length || "six"}{" "}
                    assessments.
                  </p>
                </div>
                {progression.length === 0 ? (
                  <p className="mt-8 flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                    No assessments published this term yet.
                  </p>
                ) : (
                  <div className="mt-8 flex h-48 items-end gap-3 border-b border-border sm:gap-5">
                    {progression.map((point, index) => (
                      <div
                        key={`${point.label}-${index}`}
                        title={point.name}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="text-xs font-semibold text-muted-foreground">
                          {point.value}%
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-primary"
                          style={{
                            height: `${point.value * 1.6}px`,
                            opacity: 0.55 + index * 0.08,
                          }}
                        />
                        <span className="pb-3 text-[11px] text-muted-foreground">
                          {point.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-5 rounded-xl bg-secondary/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Class signal
                  </p>
                  <p className="mt-2 text-sm leading-6">{data.classSignal}</p>
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
                    {insight?.headline ?? "No learning area needs priority support."}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/65">
                    {insight?.body ??
                      "No learners are below the support threshold in any learning area this term."}
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