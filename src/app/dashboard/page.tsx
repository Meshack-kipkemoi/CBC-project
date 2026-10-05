"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  ParentShell,
  PageLink,
  ProgressBar,
  SectionHeading,
  StatCard,
} from "@/components/parent-shell";

/* -------------------------------------------------------------------------- */
/*  Types (mirror the /api/parents/dashboard response)                        */
/* -------------------------------------------------------------------------- */
type Tone = "good" | "watch" | "warning";
type TrendPoint = { label: string; name: string; value: number };

type DashboardData = {
  date: string;
  parent: { fullName: string; firstName: string };
  child: {
    id: string;
    fullName: string;
    firstName: string;
    initials: string;
    admissionNumber: string;
    gradeName: string | null;
    streamName: string | null;
    academicYear: string;
    termNumber: number | null;
  };
  children: { id: string; fullName: string; initials: string }[];
  stats: {
    overallProgress: { value: number | null; changeFromLastTerm: number | null };
    subjectsOnTrack: { onTrack: number; total: number };
    assessmentsCompleted: number;
    latestAssessment: {
      name: string;
      subject: string | null;
      date: string;
      percent: number;
    } | null;
  };
  trend: { current: TrendPoint[]; previous: TrendPoint[] };
  focus: {
    headline: string;
    body: string;
    subjects: { name: string; score: number }[];
  } | null;
  subjects: {
    name: string;
    score: number;
    change: number | null;
    tone: Tone;
  }[];
};

/** ProgressBar colour per tone (undefined = the bar's default colour). */
const toneBar: Record<Tone, string | undefined> = {
  good: undefined,
  watch: "bg-chart-2",
  warning: "bg-destructive/70",
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
function greetingFor(name?: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Africa/Nairobi",
    }).format(new Date()),
  );
  const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return name ? `Good ${part}, ${name}` : `Good ${part}`;
}

const formatLongDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const signed = (n: number) => `${n > 0 ? "+" : ""}${n}%`;

/* -------------------------------------------------------------------------- */
/*  Trend chart (inline so it can take real data)                             */
/* -------------------------------------------------------------------------- */
function Trend({
  current,
  previous,
}: {
  current: TrendPoint[];
  previous: TrendPoint[];
}) {
  const W = 600;
  const H = 200;
  const PAD = 24;
  const count = Math.max(current.length, previous.length);

  const x = (i: number) =>
    count <= 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (count - 1);
  const y = (v: number) => H - PAD - (Math.min(v, 100) / 100) * (H - PAD * 2);

  const line = (pts: TrendPoint[]) =>
    pts.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");

  return (
    <div className="mt-6">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-52 w-full"
        role="img"
        aria-label="Average performance for each assessment this term"
      >
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD}
              x2={W - PAD}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={0}
              y={y(tick) + 3}
              className="fill-muted-foreground"
              fontSize={9}
            >
              {tick}
            </text>
          </g>
        ))}
        {previous.length > 1 && (
          <polyline
            points={line(previous)}
            fill="none"
            className="stroke-chart-2"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        )}
        {previous.map((p, i) => (
          <circle
            key={`prev-${i}`}
            cx={x(i)}
            cy={y(p.value)}
            r={3}
            className="fill-chart-2"
          />
        ))}
        {current.length > 1 && (
          <polyline
            points={line(current)}
            fill="none"
            className="stroke-primary"
            strokeWidth={2.5}
          />
        )}
        {current.map((p, i) => (
          <g key={`cur-${i}`}>
            <circle cx={x(i)} cy={y(p.value)} r={4} className="fill-primary" />
            <text
              x={x(i)}
              y={y(p.value) - 9}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              className="fill-foreground"
            >
              {p.value}%
            </text>
          </g>
        ))}
      </svg>
      <div className="flex justify-between px-1 text-[11px] text-muted-foreground">
        {current.map((p, i) => (
          <span key={`${p.label}-${i}`} title={p.name}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const url = studentId
          ? `/api/parents/dashboard?student_id=${studentId}`
          : "/api/parents/dashboard";
        const res = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load dashboard");
        setData(json as DashboardData);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [studentId]);

  const eyebrow = data ? formatLongDate(data.date) : "Loading…";
  const title = greetingFor(data?.parent.firstName);

  const child = data?.child;
  const stats = data?.stats;
  const change = stats?.overallProgress.changeFromLastTerm ?? null;
  const termLabel = child?.termNumber
    ? `Term ${child.termNumber}, ${child.academicYear}`
    : child?.academicYear ?? "";
  const classLabel = child
    ? [child.gradeName, child.streamName].filter(Boolean).join(" ")
    : "";

  return (
    <ParentShell eyebrow={eyebrow} title={title}>
      <div className="flex flex-col gap-8">
        {loading && !data && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading your child&apos;s progress…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-destructive/30 bg-card p-6">
            <h2 className="text-lg font-bold">
              We couldn&apos;t load the dashboard
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

        {!error && data && child && stats && (
          <div
            className={`flex flex-col gap-8 transition-opacity ${loading ? "opacity-50" : ""}`}
          >
            {/* Child header */}
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-muted-foreground">
                  Here&apos;s how {child.firstName} is doing this term.
                </p>
                <div className="relative mt-4 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-accent font-serif text-lg font-bold text-primary">
                    {child.initials}
                  </span>
                  <div>
                    <p className="font-bold">{child.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[classLabel, termLabel].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {data.children.length > 1 && (
                    <>
                      <button
                        className="rounded-lg p-1 text-muted-foreground"
                        aria-label="Change child"
                        aria-expanded={switcherOpen}
                        onClick={() => setSwitcherOpen((o) => !o)}
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      {switcherOpen && (
                        <ul className="absolute left-0 top-full z-10 mt-2 min-w-56 rounded-xl border border-border bg-card p-1 shadow-md">
                          {data.children.map((c) => (
                            <li key={c.id}>
                              <button
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                                onClick={() => {
                                  setStudentId(c.id);
                                  setSwitcherOpen(false);
                                }}
                              >
                                <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                                  {c.initials}
                                </span>
                                {c.fullName}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
              {termLabel && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                  <CalendarDays className="size-4 text-primary" />
                  <span className="font-semibold">{termLabel}</span>
                </div>
              )}
            </section>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Overall progress"
                value={
                  stats.overallProgress.value !== null
                    ? `${stats.overallProgress.value}%`
                    : "—"
                }
                detail={
                  change === null
                    ? "No previous term to compare"
                    : `${change >= 0 ? "↑" : "↓"} ${Math.abs(change)}% since last term`
                }
                icon={TrendingUp}
              />
              <StatCard
                label="Subjects on track"
                value={
                  stats.subjectsOnTrack.total
                    ? `${stats.subjectsOnTrack.onTrack} / ${stats.subjectsOnTrack.total}`
                    : "—"
                }
                detail={
                  stats.subjectsOnTrack.total === 0
                    ? "No results yet"
                    : stats.subjectsOnTrack.onTrack ===
                        stats.subjectsOnTrack.total
                      ? "On track in every subject"
                      : "Some subjects need attention"
                }
                icon={Target}
              />
              <StatCard
                label="Assessments completed"
                value={String(stats.assessmentsCompleted)}
                detail="Published this term"
                icon={BookOpen}
              />
              <StatCard
                label="Latest assessment"
                value={
                  stats.latestAssessment
                    ? `${stats.latestAssessment.percent}%`
                    : "—"
                }
                detail={
                  stats.latestAssessment
                    ? `${stats.latestAssessment.subject ?? "Assessment"} · ${stats.latestAssessment.date}`
                    : "No results yet"
                }
                icon={CheckCircle2}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
              {/* Progress over time */}
              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex items-start justify-between">
                  <SectionHeading
                    icon={TrendingUp}
                    title="Progress over time"
                    description={`${child.firstName}'s average performance across all subjects`}
                  />
                  {change !== null && (
                    <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-primary">
                      {signed(change)} this term
                    </span>
                  )}
                </div>
                {data.trend.current.length === 0 ? (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Progress will appear here once assessments are published.
                  </p>
                ) : (
                  <Trend
                    current={data.trend.current}
                    previous={data.trend.previous}
                  />
                )}
                <div className="mt-4 flex gap-5 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <i className="size-2 rounded-full bg-primary" />
                    Current progress
                  </span>
                  {data.trend.previous.length > 0 && (
                    <span className="flex items-center gap-2">
                      <i className="size-2 rounded-full bg-chart-2" />
                      Previous term
                    </span>
                  )}
                </div>
              </section>

              {/* Focus */}
              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex items-start justify-between">
                  <SectionHeading
                    icon={Target}
                    title="This term's focus"
                    description="Recommended by CBC AI"
                  />
                  <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                    AI INSIGHT
                  </span>
                </div>
                {data.focus ? (
                  <>
                    <div className="rounded-xl bg-accent p-4">
                      <p className="text-sm font-bold">{data.focus.headline}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {data.focus.body}
                      </p>
                      <PageLink href="/interventions">
                        View recommendations
                      </PageLink>
                    </div>
                    <div className="mt-5 flex flex-col gap-4">
                      {data.focus.subjects.map((s, i) => (
                        <div key={s.name} className="flex flex-col gap-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold">{s.name}</span>
                            <span className="font-bold">{s.score}%</span>
                          </div>
                          <ProgressBar
                            value={s.score}
                            color={i === 1 ? "bg-chart-2" : undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Recommendations will appear once results are published.
                  </p>
                )}
              </section>
            </div>

            {/* Subject performance */}
            <section>
              <div className="flex items-end justify-between">
                <SectionHeading
                  icon={BookOpen}
                  title="Subject performance"
                  description={`See how ${child.firstName} is progressing across the CBC curriculum`}
                />
                <PageLink href="/core-competencies">View competencies</PageLink>
              </div>
              {data.subjects.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No published results yet for this term.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.subjects.map((subject) => (
                    <div
                      key={subject.name}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">{subject.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Current average
                          </p>
                        </div>
                        {subject.change !== null && (
                          <span
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                              subject.change >= 0
                                ? "bg-accent text-primary"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {subject.change >= 0 ? (
                              <ArrowUpRight className="size-3" />
                            ) : (
                              <ArrowDownRight className="size-3" />
                            )}
                            {Math.abs(subject.change)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <ProgressBar
                          value={subject.score}
                          color={toneBar[subject.tone]}
                        />
                        <span className="text-sm font-bold">
                          {subject.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </ParentShell>
  );
}