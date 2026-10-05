"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types (mirror the /api/analytics response)                                */
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
  insight: { headline: string; body: string; focusAreas: string[] } | null;
};

const toneColor: Record<Tone, string> = {
  good: "bg-primary",
  watch: "bg-accent",
  warning: "bg-destructive/70",
};

const signed = (n: number) => `${n > 0 ? "+" : ""}${n}%`;

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/analytics", {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load analytics");
        setData(json as AnalyticsData);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const classLabel = data
    ? [data.class.gradeName, data.class.streamName].filter(Boolean).join(" ") ||
      "Your class"
    : "";
  const termLabel = data?.class.termNumber
    ? `Term ${data.class.termNumber}`
    : "No active term";

  const metrics = data?.metrics;
  const change = metrics?.changeFromLastTerm ?? null;
  const growth = metrics?.growth ?? null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
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
          {/* Header */}
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
                {data ? `${classLabel} · ${termLabel}` : "Loading class…"}
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight">
                Class analytics
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <div
                className="flex size-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground"
                title={data?.teacher.fullName}
              >
                {data?.teacher.initials ?? "··"}
              </div>
            </div>
          </header>

          <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading class analytics…
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-2xl border border-destructive/30 bg-card p-6">
                <h2 className="font-serif text-xl">
                  We couldn&apos;t load your analytics
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && data && metrics && (
              <>
                {/* Metric cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                      Class average
                    </p>
                    <p className="mt-3 font-serif text-3xl">
                      {metrics.classAverage !== null
                        ? `${metrics.classAverage}%`
                        : "—"}
                    </p>
                    {change !== null ? (
                      <p
                        className={`mt-2 flex items-center gap-1 text-xs ${
                          change >= 0 ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {change >= 0 ? (
                          <TrendingUp className="size-3.5" />
                        ) : (
                          <TrendingDown className="size-3.5" />
                        )}
                        {Math.abs(change)}% {change >= 0 ? "up" : "down"} from
                        last term
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        No previous term to compare
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
                    <p className="text-sm text-muted-foreground">
                      Strongest area
                    </p>
                    <p className="mt-3 font-serif text-3xl">
                      {metrics.strongestArea?.name ?? "—"}
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
                      {growth ? signed(growth.value) : "—"}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {growth
                        ? growth.label
                        : "Needs at least two assessments"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-7 xl:grid-cols-[1.2fr_0.8fr]">
                  {/* Subjects */}
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
                    {data.subjects.length === 0 ? (
                      <p className="mt-7 text-sm text-muted-foreground">
                        No published results yet for this term.
                      </p>
                    ) : (
                      <div className="mt-7 flex flex-col gap-5">
                        {data.subjects.map((subject) => (
                          <div key={subject.name}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="font-medium">
                                {subject.name}
                              </span>
                              <span className="font-semibold">
                                {subject.score}%
                              </span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-secondary">
                              <div
                                className={`h-full rounded-full ${toneColor[subject.tone]}`}
                                style={{
                                  width: `${Math.min(subject.score, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Progression */}
                  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <div>
                      <h2 className="font-serif text-2xl">Term progression</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Class average over the last{" "}
                        {data.progression.length || "few"} assessment
                        {data.progression.length === 1 ? "" : "s"}.
                      </p>
                    </div>
                    {data.progression.length === 0 ? (
                      <p className="mt-8 text-sm text-muted-foreground">
                        Assessments will appear here once results are published.
                      </p>
                    ) : (
                      <div className="mt-8 flex h-48 items-end gap-3 border-b border-border sm:gap-5">
                        {data.progression.map((point, index, arr) => (
                          <div
                            key={`${point.label}-${index}`}
                            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                            title={point.name}
                          >
                            <span className="text-xs font-semibold text-muted-foreground">
                              {point.value}%
                            </span>
                            <div
                              className="w-full rounded-t-lg bg-primary"
                              style={{
                                height: `${Math.min(point.value, 100) * 1.4}px`,
                                opacity:
                                  arr.length === 1
                                    ? 1
                                    : 0.5 + (0.5 * index) / (arr.length - 1),
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
                      <p className="mt-2 text-sm leading-6">
                        {data.classSignal}
                      </p>
                    </div>
                  </section>
                </div>

                {/* AI insight */}
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
                        {data.insight
                          ? data.insight.headline
                          : "No learners need extra support right now."}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/65">
                        {data.insight
                          ? data.insight.body
                          : "No learner is currently below the support threshold in any learning area. Keep an eye on the next assessment."}
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
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}