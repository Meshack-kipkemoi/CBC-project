"use client";

import { useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  GitCompareArrows,
  Layers,
  Minus,
  Trophy,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useStreamsQuery,
  type Level,
  type StreamsData,
  type StreamStat,
  type StreamsFilters,
} from "@/hooks/use-streams";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_COMPARE = 4;
const LEVEL_KEYS: Level[] = ["EE", "ME", "AE", "BE"];
const LEVEL_STYLE: Record<Level, { label: string; bar: string }> = {
  EE: { label: "Exceeding", bar: "bg-emerald-500" },
  ME: { label: "Meeting", bar: "bg-sky-500" },
  AE: { label: "Approaching", bar: "bg-amber-500" },
  BE: { label: "Below", bar: "bg-rose-500" },
};

const pct = (n: number | null) => (n === null ? "—" : `${n}%`);
const signed = (n: number) => `${n > 0 ? "+" : ""}${n}`;
const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

/** Mine first, then the other streams of the same grade (what a class teacher compares with) */
function defaultCompare(streams: StreamStat[]) {
  const mine = streams.filter((s) => s.isMine);
  const base = mine[0]?.gradeId ?? streams[0]?.gradeId;
  const pool = [
    ...mine,
    ...streams.filter((s) => !s.isMine && s.gradeId === base),
  ];
  return pool.slice(0, 3).map((s) => s.id);
}

function gradeSubjectAverage(
  streams: StreamStat[],
  gradeId: string,
  subjectId: string,
) {
  let sum = 0;
  let n = 0;
  for (const s of streams) {
    if (s.gradeId !== gradeId) continue;
    const x = s.subjects.find((p) => p.id === subjectId);
    if (x && x.average !== null) {
      sum += x.average * x.results;
      n += x.results;
    }
  }
  return n > 0 ? sum / n : null;
}

const trendConfig = {
  average: { label: "Average %", color: "var(--chart-1)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function ProgressBar({ value }: { value: number | null }) {
  const v = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

function LevelBar({ levels }: { levels: Record<Level, number> }) {
  const total = LEVEL_KEYS.reduce((n, l) => n + levels[l], 0);
  if (total === 0) return <div className="h-2 w-full rounded-full bg-muted" />;

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
      {LEVEL_KEYS.map(
        (l) =>
          levels[l] > 0 && (
            <div
              key={l}
              className={LEVEL_STYLE[l].bar}
              style={{ width: `${(levels[l] / total) * 100}%` }}
              title={`${LEVEL_STYLE[l].label}: ${Math.round((levels[l] / total) * 100)}%`}
            />
          ),
      )}
    </div>
  );
}

function LevelLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {LEVEL_KEYS.map((l) => (
        <span key={l} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", LEVEL_STYLE[l].bar)} />
          {l} · {LEVEL_STYLE[l].label}
        </span>
      ))}
    </div>
  );
}

function Delta({
  value,
  suffix = "pts",
}: {
  value: number | null;
  suffix?: string;
}) {
  if (value === null) {
    return <span className="text-xs text-muted-foreground">No trend</span>;
  }
  const dir = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const { Icon, cls } = {
    up: {
      Icon: ArrowUpRight,
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    down: { Icon: ArrowDownRight, cls: "bg-destructive/10 text-destructive" },
    flat: { Icon: Minus, cls: "bg-muted text-muted-foreground" },
  }[dir];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      <Icon className="size-3.5" />
      {signed(value)} {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Filters({
  data,
  selection,
  onChange,
}: {
  data: StreamsData;
  selection: StreamsFilters;
  onChange: (next: StreamsFilters) => void;
}) {
  const f = data.filters;
  const year = f.years.find((y) => y.id === (selection.year ?? f.yearId));
  const term = year?.terms.find((t) => t.id === (selection.term ?? f.termId));
  const grade = f.grades.find((g) => g.id === (selection.grade ?? f.gradeId));

  return (
    <ScrollArea>
      <div className="flex flex-nowrap gap-4">
        <Field label="Year">
          <Select
            value={year?.id ?? ""}
            onValueChange={(v) =>
              v && onChange({ ...selection, year: v, term: undefined })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue>{year?.name ?? "Select year"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {f.years.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Term">
          <Select
            value={term?.id ?? "all"}
            onValueChange={(v) => v && onChange({ ...selection, term: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {term ? `Term ${term.term_number}` : "All terms"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All terms</SelectItem>
              {year?.terms.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  Term {t.term_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Grade">
          <Select
            value={grade?.id ?? "all"}
            onValueChange={(v) => v && onChange({ ...selection, grade: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{grade?.name ?? "All grades"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All grades</SelectItem>
              {f.grades.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function StatCards({ data, scope }: { data: StreamsData; scope: string }) {
  const { summary } = data;
  const cards = [
    {
      title: "Streams",
      value: String(summary.streams),
      description: `${summary.learners.toLocaleString()} learners · ${scope}`,
    },
    {
      title: "Average across streams",
      value: pct(summary.average),
      description: scope,
    },
    {
      title: "Top stream",
      value: summary.top?.label ?? "—",
      description: summary.top
        ? `${summary.top.average}% average`
        : "Needs 2+ streams with results",
    },
    {
      title: "Needs attention",
      value: summary.lowest?.label ?? "—",
      description: summary.lowest
        ? `${summary.lowest.average}% average`
        : "Needs 2+ streams with results",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title} className="relative gap-0 py-0 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-[calc(0.5*var(--radius))] bg-linear-to-r from-primary via-indigo-400 to-emerald-500" />
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle className="text-sm text-muted-foreground">
              {c.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pt-2 pb-0">
            <span className="block truncate text-2xl font-bold tracking-tight">
              {c.value}
            </span>
          </CardContent>
          <CardFooter className="px-6 pt-2 pb-4">
            <CardDescription className="text-xs">
              {c.description}
            </CardDescription>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ComparisonCard({
  streams,
  selected,
  onToggle,
}: {
  streams: StreamStat[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const chosen = selected
    .map((id) => streams.find((s) => s.id === id))
    .filter((s): s is StreamStat => !!s);

  const subjects = new Map<string, { code: string; name: string }>();
  for (const s of chosen) {
    for (const x of s.subjects)
      subjects.set(x.id, { code: x.code, name: x.name });
  }

  const rows = [...subjects.entries()]
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, meta]) => {
      const row: Record<string, string | number | null> = {
        code: meta.code,
        name: meta.name,
      };
      chosen.forEach((s, i) => {
        row[`s${i}`] = s.subjects.find((x) => x.id === id)?.average ?? null;
      });
      return row;
    });

  const config = Object.fromEntries(
    chosen.map((s, i) => [
      `s${i}`,
      { label: s.label, color: `var(--chart-${i + 1})` },
    ]),
  ) as ChartConfig;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCompareArrows className="size-4 text-muted-foreground" />
          Compare streams
        </CardTitle>
        <CardDescription>
          Average per subject · pick up to {MAX_COMPARE} streams
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          {streams.map((s) => {
            const idx = selected.indexOf(s.id);
            const on = idx !== -1;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onToggle(s.id)}
                disabled={!on && selected.length >= MAX_COMPARE}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  on ? "bg-muted" : "text-muted-foreground hover:bg-muted/60",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {on && (
                  <span
                    className="size-2 rounded-full"
                    style={{ background: `var(--chart-${idx + 1})` }}
                  />
                )}
                {s.label}
                {s.isMine && <span className="text-primary">· yours</span>}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No results for the selected streams in this period.
          </p>
        ) : (
          <ChartContainer config={config} className="h-72 w-full">
            <BarChart data={rows} margin={{ top: 8, left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="code"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {chosen.map((_, i) => (
                <Bar
                  key={i}
                  dataKey={`s${i}`}
                  fill={`var(--color-s${i})`}
                  radius={4}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function Leaderboard({
  streams,
  onOpen,
}: {
  streams: StreamStat[];
  onOpen: (id: string) => void;
}) {
  // Grouped by grade, best first inside each grade
  const groups = new Map<string, StreamStat[]>();
  for (const s of streams)
    groups.set(s.gradeId, [...(groups.get(s.gradeId) ?? []), s]);
  const ordered = [...groups.values()].flatMap((g) =>
    [...g].sort((a, b) => (b.average ?? -1) - (a.average ?? -1)),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-muted-foreground" />
          Ranking
        </CardTitle>
        <CardDescription>By average, within each grade</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {ordered.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onOpen(s.id)}
                className={cn(
                  "w-full space-y-1.5 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                  s.isMine && "border-primary/40 bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">
                    <span className="mr-2 text-muted-foreground">
                      #{s.rank ?? "–"}
                    </span>
                    {s.label}
                  </p>
                  <span className="text-sm font-semibold">
                    {pct(s.average)}
                  </span>
                </div>
                <ProgressBar value={s.average} />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Stream card + details dialog
// ---------------------------------------------------------------------------

function StreamCard({
  stream: s,
  comparing,
  compareDisabled,
  onCompare,
  onOpen,
}: {
  stream: StreamStat;
  comparing: boolean;
  compareDisabled: boolean;
  onCompare: () => void;
  onOpen: () => void;
}) {
  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        s.isMine && "ring-2 ring-primary/40",
      )}
    >
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{s.label}</p>
            <p className="truncate text-xs text-muted-foreground">
              {s.teacher
                ? `Class teacher: ${s.teacher}`
                : "No class teacher assigned"}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {s.isMine && <Badge>Your stream</Badge>}
            {s.rank !== null && s.rankOf > 1 && (
              <Badge variant="outline">
                {ordinal(s.rank)} of {s.rankOf}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <p className="text-3xl font-semibold tracking-tight">
              {s.average === null ? "—" : s.average}
              {s.average !== null && (
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / 100
                </span>
              )}
            </p>
            <Delta value={s.change} />
          </div>
          <ProgressBar value={s.average} />
          {s.vsGrade !== null && (
            <p className="text-xs text-muted-foreground">
              <span
                className={cn(
                  "font-medium",
                  s.vsGrade >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive",
                )}
              >
                {signed(s.vsGrade)} pts
              </span>{" "}
              vs {s.gradeName} average ({s.gradeAverage}%)
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Meeting expectations or better</span>
            <span className="font-medium text-foreground">
              {pct(s.meetingRate)}
            </span>
          </div>
          <LevelBar levels={s.levels} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {s.learners} learner{s.learners === 1 ? "" : "s"}
          </p>
          <div className="flex gap-1">
            <Button
              variant={comparing ? "secondary" : "ghost"}
              size="sm"
              onClick={onCompare}
              disabled={compareDisabled}
            >
              <GitCompareArrows className="size-4" />
              {comparing ? "Comparing" : "Compare"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onOpen}>
              Details <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StreamDialog({
  stream: s,
  streams,
  scope,
  onClose,
}: {
  stream: StreamStat | null;
  streams: StreamStat[];
  scope: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!s} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {s && (
          <>
            <DialogHeader>
              <DialogTitle>{s.label}</DialogTitle>
              <DialogDescription>
                {s.teacher ? `${s.teacher} · ` : ""}
                {scope}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Average", value: pct(s.average) },
                { label: "Meeting expectations", value: pct(s.meetingRate) },
                {
                  label: "Vs grade",
                  value: s.vsGrade === null ? "—" : `${signed(s.vsGrade)} pts`,
                },
                {
                  label: "Rank",
                  value: s.rank ? `${ordinal(s.rank)} of ${s.rankOf}` : "—",
                },
              ].map((x) => (
                <div key={x.label} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{x.label}</p>
                  <p className="text-lg font-semibold">{x.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Performance levels</p>
              <LevelBar levels={s.levels} />
              <LevelLegend />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Average per term</p>
              {s.trend.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No results recorded yet.
                </p>
              ) : (
                <ChartContainer config={trendConfig} className="h-48 w-full">
                  <LineChart
                    data={s.trend}
                    margin={{ top: 8, left: 0, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      dataKey="average"
                      type="monotone"
                      stroke="var(--color-average)"
                      strokeWidth={2}
                      connectNulls
                      dot={{ r: 4, fill: "var(--color-average)" }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Subjects</p>
              <ul className="divide-y rounded-lg border">
                {[...s.subjects]
                  .sort((a, b) => (b.average ?? -1) - (a.average ?? -1))
                  .map((sub) => {
                    const g = gradeSubjectAverage(streams, s.gradeId, sub.id);
                    const diff =
                      sub.average !== null && g !== null
                        ? Math.round((sub.average - g) * 10) / 10
                        : null;
                    return (
                      <li key={sub.id} className="space-y-1.5 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate font-medium">
                            {sub.name}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {diff !== null && (
                              <Delta value={diff} suffix="vs grade" />
                            )}
                            <span className="w-12 text-right font-semibold">
                              {pct(sub.average)}
                            </span>
                          </span>
                        </div>
                        <ProgressBar value={sub.average} />
                      </li>
                    );
                  })}
              </ul>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

function StreamsContent({ data, scope }: { data: StreamsData; scope: string }) {
  const [picked, setPicked] = useState<string[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const { streams } = data;

  // Drop picks that no longer exist after a filter change
  const ids = new Set(streams.map((s) => s.id));
  let selected = (picked ?? defaultCompare(streams)).filter((id) =>
    ids.has(id),
  );
  if (selected.length === 0) selected = defaultCompare(streams);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) setPicked(selected.filter((x) => x !== id));
    } else if (selected.length < MAX_COMPARE) {
      setPicked([...selected, id]);
    }
  };

  if (streams.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Layers className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No streams to show for this selection.
            {data.role === "class_teacher" &&
              " You are only a class teacher in years you were assigned a stream."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <StatCards data={data} scope={scope} />

      <div className="grid gap-4 lg:grid-cols-3">
        <ComparisonCard
          streams={streams}
          selected={selected}
          onToggle={toggle}
        />
        <Leaderboard streams={streams} onOpen={setOpenId} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight">
            All streams
          </h2>
          <LevelLegend />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {streams.map((s) => {
            const comparing = selected.includes(s.id);
            return (
              <StreamCard
                key={s.id}
                stream={s}
                comparing={comparing}
                compareDisabled={!comparing && selected.length >= MAX_COMPARE}
                onCompare={() => toggle(s.id)}
                onOpen={() => setOpenId(s.id)}
              />
            );
          })}
        </div>
      </div>

      <StreamDialog
        stream={streams.find((s) => s.id === openId) ?? null}
        streams={streams}
        scope={scope}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function StreamsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 flex-1" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function StreamsView() {
  // undefined = let the server pick the default
  const [selection, setSelection] = useState<StreamsFilters>({});
  const query = useStreamsQuery(selection);

  if (query.isPending) return <StreamsSkeleton />;

  if (query.isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">{query.error.message}</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const data = query.data;
  const f = data.filters;
  const year = f.years.find((y) => y.id === f.yearId);
  const term = year?.terms.find((t) => t.id === f.termId);
  const grade = f.grades.find((g) => g.id === f.gradeId);
  const scope = `${year?.name ?? ""} · ${term ? `Term ${term.term_number}` : "All terms"}`;

  return (
    <div
      className={cn(
        "space-y-4 transition-opacity",
        query.isPlaceholderData && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Stream performance
          </h1>
          <p className="text-sm text-muted-foreground">
            {data.role === "principal"
              ? "Every stream in the school"
              : "Your stream and the other streams in your grade"}
            {" · "}
            {grade?.name ?? "All grades"}
          </p>
        </div>
      </div>

      <Filters data={data} selection={selection} onChange={setSelection} />
      <StreamsContent data={data} scope={scope} />
    </div>
  );
}
