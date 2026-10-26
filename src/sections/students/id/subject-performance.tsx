"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Minus,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
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
  useStudentQuery,
  type SubjectPerformanceData,
  type SubjectSummary,
} from "@/hooks/use-student";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const pct = (n: number | null) => (n === null ? "—" : `${n}%`);
const signed = (n: number) => `${n > 0 ? "+" : ""}${n}`;

const trendConfig = {
  average: { label: "Average %", color: "var(--chart-1)" },
} satisfies ChartConfig;

const subjectConfig = {
  percentage: { label: "Score %", color: "var(--chart-2)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function ProgressBar({
  value,
  danger,
}: {
  value: number | null;
  danger?: boolean;
}) {
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
        className={cn(
          "h-full rounded-full transition-all duration-500",
          danger ? "bg-destructive" : "bg-primary",
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

function TrendBadge({ subject }: { subject: SubjectSummary }) {
  if (subject.direction === "none") {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Minus className="size-3" /> No trend
      </Badge>
    );
  }

  const styles = {
    up: {
      Icon: ArrowUpRight,
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    down: { Icon: ArrowDownRight, cls: "bg-destructive/10 text-destructive" },
    flat: { Icon: Minus, cls: "bg-muted text-muted-foreground" },
  }[subject.direction];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        styles.cls,
      )}
    >
      <styles.Icon className="size-3.5" />
      {signed(subject.change ?? 0)} %
    </span>
  );
}

function SubjectCard({
  subject,
  onOpen,
}: {
  subject: SubjectSummary;
  onOpen: () => void;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{subject.name}</p>
            <p className="text-xs text-muted-foreground">{subject.code}</p>
          </div>
          <TrendBadge subject={subject} />
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <p className="text-3xl font-semibold tracking-tight">
              {subject.average === null ? "—" : subject.average}
              {subject.average !== null && (
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / 100
                </span>
              )}
            </p>
            {subject.grade && (
              <Badge variant="secondary">{subject.grade}</Badge>
            )}
          </div>
          <ProgressBar value={subject.average} danger={subject.atRisk} />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {subject.assessments.length} assessment
            {subject.assessments.length === 1 ? "" : "s"}
          </p>
          <Button variant="ghost" size="sm" onClick={onOpen}>
            Details <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Overview row
// ---------------------------------------------------------------------------

function OverallChart({ data }: { data: SubjectPerformanceData }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Overall performance</CardTitle>
          <CardDescription>Average score per term</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tracking-tight">
            {pct(data.summary.average)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.summary.assessments} assessments · {data.summary.subjects}{" "}
            subjects
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trendConfig} className="h-60 w-full">
          <AreaChart data={data.trend} margin={{ top: 8, right: 12, left: 0 }}>
            <defs>
              <linearGradient id="fillAverage" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-average)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-average)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
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
            <Area
              dataKey="average"
              type="monotone"
              stroke="var(--color-average)"
              strokeWidth={2}
              fill="url(#fillAverage)"
              dot={{ r: 4, fill: "var(--color-average)" }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AtRiskCard({
  subjects,
  onOpen,
}: {
  subjects: SubjectSummary[];
  onOpen: (s: SubjectSummary) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-destructive" />
          Subjects at risk
        </CardTitle>
        <CardDescription>
          Dropped 30+ points since the last assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-5" />
            </div>
            <p className="text-sm text-muted-foreground">No subjects at risk</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {subjects.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onOpen(s)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left transition-colors hover:bg-destructive/10"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pct(s.previous)} → {pct(s.latest)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">
                    {signed(s.change ?? 0)}%
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Details dialog
// ---------------------------------------------------------------------------

function SubjectDialog({
  subject,
  scope,
  onClose,
}: {
  subject: SubjectSummary | null;
  scope: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!subject} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl px-0">
        <ScrollArea className="h-[80vh]">
          <div className="p-6 space-y-8">
            {subject && (
              <>
                <DialogHeader>
                  <DialogTitle>{subject.name}</DialogTitle>
                  <DialogDescription>
                    Performance across assessments · {scope}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Average", value: pct(subject.average) },
                    { label: "Latest", value: pct(subject.latest) },
                    {
                      label: "Change",
                      value:
                        subject.change === null
                          ? "—"
                          : `${signed(subject.change)} %`,
                    },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-lg font-semibold">{s.value}</p>
                    </div>
                  ))}
                </div>

                {subject.assessments.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No assessments recorded for this period.
                  </p>
                ) : (
                  <>
                    <ChartContainer
                      config={subjectConfig}
                      className="h-56 w-full"
                    >
                      <LineChart
                        data={subject.assessments}
                        margin={{ top: 8, right: 12, left: 0 }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          interval="preserveStartEnd"
                          tickFormatter={(v: string) =>
                            v.length > 10 ? `${v.slice(0, 9)}…` : v
                          }
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
                              labelFormatter={(_, payload) =>
                                payload?.[0]?.payload?.name
                              }
                            />
                          }
                        />
                        <Line
                          dataKey="percentage"
                          type="monotone"
                          stroke="var(--color-percentage)"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "var(--color-percentage)" }}
                        />
                      </LineChart>
                    </ChartContainer>

                    <ul className="divide-y rounded-lg border">
                      {[...subject.assessments].reverse().map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{a.name}</p>
                            <p className="text-xs capitalize text-muted-foreground">
                              Term {a.term_number} · {a.type.replace(/_/g, " ")}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-muted-foreground">
                              {a.score}/{a.max_score}
                            </span>
                            <span className="w-14 text-right font-semibold">
                              {a.percentage}%
                            </span>
                            {a.grade && (
                              <Badge variant="secondary">{a.grade}</Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SubjectPerformanceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------

export function SubjectPerformance({ id }: { id: string }) {
  const [selected, setSelected] = useState<SubjectSummary | null>(null);

  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useStudentQuery(id, "subject-performance");

  if (isPending) return <SubjectPerformanceSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (data.filters.years.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <BookOpen className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            This student has no enrollment records yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const year = data.filters.years.find((y) => y.id === data.filters.yearId);
  const term = year?.terms.find((t) => t.id === data.filters.termId);
  const scope = `${year?.name ?? ""} · ${term ? `Term ${term.term_number}` : "All terms"}`;

  return (
    <div
      className={cn(
        "space-y-4 transition-opacity",
        isPlaceholderData && "opacity-60",
      )}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <OverallChart data={data} />
        <AtRiskCard subjects={data.atRisk} onOpen={setSelected} />
      </div>

      {data.subjects.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No subjects or results found for this period.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.subjects
            .filter((subject) => subject.previous !== null)
            .map((s) => (
              <SubjectCard
                key={s.id}
                subject={s}
                onOpen={() => setSelected(s)}
              />
            ))}
        </div>
      )}

      <SubjectDialog
        subject={selected}
        scope={scope}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
