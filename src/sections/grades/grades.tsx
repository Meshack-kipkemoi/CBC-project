"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ClipboardList,
  Gauge,
  TrendingDown,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BANDS, type Band } from "@/lib/student/data/competencies";
import {
  VIEW_META,
  bandOf,
  type GradesReport,
  type GradesView,
  type StudentStat,
  type SubjectStat,
  type TermStat,
} from "@/lib/grades";
import { useGradesQuery } from "@/hooks/use-grades";

// Recharts needs real colour values (these match the band badge colours)
const BAND_COLORS: Record<Band, string> = {
  EE: "#10b981",
  ME: "#3b82f6",
  AE: "#f59e0b",
  BE: "#ef4444",
};
const BAND_ORDER: Band[] = ["EE", "ME", "AE", "BE"];

const distributionConfig: ChartConfig = {
  EE: { label: "Exceeding", color: BAND_COLORS.EE },
  ME: { label: "Meeting", color: BAND_COLORS.ME },
  AE: { label: "Approaching", color: BAND_COLORS.AE },
  BE: { label: "Below", color: BAND_COLORS.BE },
};

const averageConfig: ChartConfig = {
  average: { label: "Average", color: "var(--chart-1)" },
};

const shorten = (value: string) =>
  value.length > 22 ? `${value.slice(0, 21)}…` : value;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function BandBadge({ band }: { band: Band }) {
  return (
    <span
      title={BANDS[band].label}
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        BANDS[band].badge,
      )}
    >
      {band}
    </span>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  band,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  band?: Band;
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-semibold tabular-nums">
              {value}
            </p>
            {band && <BandBadge band={band} />}
          </div>
          {sub && (
            <p className="truncate text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BandLegend() {
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
      {[
        ["EE", "80% and above"],
        ["ME", "60–79%"],
        ["AE", "40–59%"],
        ["BE", "below 40%"],
      ].map(([band, range]) => (
        <span key={band} className="inline-flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: BAND_COLORS[band as Band] }}
          />
          {band} · {range}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

/** Horizontal bars, coloured by the band the average falls in. */
function AverageBars({ rows }: { rows: { label: string; average: number }[] }) {
  const data = rows.map((row) => ({
    ...row,
    fill: BAND_COLORS[bandOf(row.average)],
  }));

  return (
    <ChartContainer
      config={averageConfig}
      className="aspect-auto w-full"
      style={{ height: rows.length * 36 + 32 }}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 40 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          width={140}
          tick={{ fontSize: 12 }}
          tickFormatter={shorten}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _name, item) => (
                <div className="flex w-full items-center justify-between gap-6">
                  <span>{item.payload.label}</span>
                  <span className="font-mono font-medium tabular-nums">
                    {Number(value).toFixed(1)}%
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="average" radius={6}>
          <LabelList
            dataKey="average"
            position="right"
            formatter={(value: unknown) => `${Number(value).toFixed(0)}%`}
            className="fill-foreground text-xs font-medium"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/** Share of EE / ME / AE / BE results in each learning area. */
function Distribution({ subjects }: { subjects: SubjectStat[] }) {
  const data = subjects.map((s) => {
    const total = s.ee + s.me + s.ae + s.be;
    const share = (n: number) =>
      total ? Math.round((n / total) * 1000) / 10 : 0;

    return {
      name: s.name,
      EE: share(s.ee),
      ME: share(s.me),
      AE: share(s.ae),
      BE: share(s.be),
    };
  });

  return (
    <ChartContainer
      config={distributionConfig}
      className="aspect-auto w-full"
      style={{ height: data.length * 36 + 72 }}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 8 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={140}
          tick={{ fontSize: 12 }}
          tickFormatter={shorten}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-6">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-xs"
                      style={{ backgroundColor: BAND_COLORS[name as Band] }}
                    />
                    {distributionConfig[String(name)]?.label}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {Number(value).toFixed(1)}%
                  </span>
                </div>
              )}
            />
          }
        />
        {BAND_ORDER.map((band, i) => (
          <Bar
            key={band}
            dataKey={band}
            stackId="bands"
            fill={`var(--color-${band})`}
            radius={
              i === 0
                ? [6, 0, 0, 6]
                : i === BAND_ORDER.length - 1
                  ? [0, 6, 6, 0]
                  : 0
            }
          />
        ))}
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}

function Trend({ terms }: { terms: TermStat[] }) {
  if (terms.length === 0) return null;

  const data = terms.map((t) => ({
    term: `Term ${t.termNumber}`,
    average: t.average,
  }));
  const values = data.map((d) => d.average);
  const yMin = Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10);
  const yMax = Math.min(100, Math.ceil((Math.max(...values) + 5) / 10) * 10);

  return (
    <ChartContainer config={averageConfig} className="aspect-auto h-64 w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 0, right: 16, top: 20 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="term"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          domain={[yMin, yMax]}
          width={32}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Line
          dataKey="average"
          type="monotone"
          stroke="var(--color-average)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "var(--color-average)" }}
        >
          <LabelList
            position="top"
            offset={10}
            formatter={(value: unknown) => `${Number(value).toFixed(0)}%`}
            className="fill-foreground text-xs font-medium"
          />
        </Line>
      </LineChart>
    </ChartContainer>
  );
}

// ---------------------------------------------------------------------------
// Comparison and student lists
// ---------------------------------------------------------------------------

function Comparison({ report }: { report: GradesReport }) {
  const streams = report.byStream
    .map((s) => ({
      label: `${s.gradeName} · ${s.streamName}`,
      average: s.average,
    }))
    .sort((a, b) => b.average - a.average);
  const grades = report.byGrade
    .map((g) => ({ label: g.name, average: g.average }))
    .sort((a, b) => b.average - a.average);

  const showGrades = grades.length > 1;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Compare classes</CardTitle>
        <CardDescription>Average score in each class.</CardDescription>
      </CardHeader>
      <CardContent>
        {showGrades ? (
          <Tabs defaultValue="grades">
            <TabsList>
              <TabsTrigger value="grades">By grade</TabsTrigger>
              <TabsTrigger value="streams">By stream</TabsTrigger>
            </TabsList>
            <div className="mt-4" data-slot="comparison">
              <TabsPanels grades={grades} streams={streams} />
            </div>
          </Tabs>
        ) : (
          <AverageBars rows={streams} />
        )}
      </CardContent>
    </Card>
  );
}

// Tabs without remounting charts: both charts are rendered, one is hidden
function TabsPanels({
  grades,
  streams,
}: {
  grades: { label: string; average: number }[];
  streams: { label: string; average: number }[];
}) {
  return (
    <>
      <div className="hidden [[data-state=active]~&]:block" />
      <TabContentSwitch grades={grades} streams={streams} />
    </>
  );
}

function TabContentSwitch({
  grades,
  streams,
}: {
  grades: { label: string; average: number }[];
  streams: { label: string; average: number }[];
}) {
  const [tab, setTab] = useState<"grades" | "streams">("grades");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["grades", "streams"] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={tab === value ? "default" : "outline"}
            onClick={() => setTab(value)}
          >
            {value === "grades" ? "Grades" : "Streams"}
          </Button>
        ))}
      </div>
      <AverageBars rows={tab === "grades" ? grades : streams} />
    </div>
  );
}

function StudentList({
  title,
  description,
  students,
  empty,
}: {
  title: string;
  description: string;
  students: StudentStat[];
  empty: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ol className="space-y-1">
            {students.map((student, i) => (
              <li key={student.id}>
                <Link
                  href={`/dashboard/students/${student.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {student.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {student.gradeName} · {student.streamName} ·{" "}
                      {student.admissionNumber}
                    </span>
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {student.average.toFixed(1)}%
                  </span>
                  <BandBadge band={bandOf(student.average)} />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function Dashboard({ report }: { report: GradesReport }) {
  const { summary, bySubject } = report;
  const strongest = bySubject[0];
  const weakest = bySubject.length > 1 ? bySubject[bySubject.length - 1] : null;
  const showComparison = report.byStream.length > 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          icon={Gauge}
          label="Average score"
          value={
            summary.average !== null ? `${summary.average.toFixed(1)}%` : "—"
          }
          band={summary.average !== null ? bandOf(summary.average) : undefined}
          sub={
            summary.average !== null
              ? BANDS[bandOf(summary.average)].label
              : undefined
          }
        />
        <Kpi
          icon={Users}
          label="Students assessed"
          value={summary.students.toLocaleString()}
          sub={`${summary.results.toLocaleString()} results recorded`}
        />
        <Kpi
          icon={Trophy}
          label="Strongest subject"
          value={strongest?.name ?? "—"}
          sub={
            strongest ? `${strongest.average.toFixed(1)}% average` : undefined
          }
        />
        <Kpi
          icon={TrendingDown}
          label="Needs attention"
          value={weakest?.name ?? "—"}
          sub={weakest ? `${weakest.average.toFixed(1)}% average` : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Learning areas</CardTitle>
            <CardDescription>
              Average score in each learning area, coloured by band.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AverageBars
              rows={bySubject.map((s) => ({
                label: s.name,
                average: s.average,
              }))}
            />
            <BandLegend />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Trend by term</CardTitle>
            <CardDescription>
              Average score across {report.year.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Trend terms={report.byTerm} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className={showComparison ? "lg:col-span-3" : "lg:col-span-5"}>
          <CardHeader>
            <CardTitle className="text-base">Grade distribution</CardTitle>
            <CardDescription>
              How results split across the four bands in each learning area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Distribution subjects={bySubject} />
          </CardContent>
        </Card>

        {showComparison && <Comparison report={report} />}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StudentList
          title="Top performers"
          description="Highest average across the results shown."
          students={report.topStudents}
          empty="No results yet."
        />
        <StudentList
          title="Needs support"
          description="Lowest average across the results shown."
          students={report.supportStudents}
          empty="No students to show."
        />
      </div>
    </div>
  );
}

function GradesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-80 rounded-xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-96 rounded-xl lg:col-span-3" />
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function GradesPage() {
  const [view, setView] = useState<GradesView>();
  const [termId, setTermId] = useState<string>();

  const {
    data: report,
    isPending,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useGradesQuery(view, termId);

  if (isPending) return <GradesSkeleton />;

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {VIEW_META[report.view].title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {report.scopeLabel} · {report.year.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {report.availableViews.length > 1 && (
            <Tabs
              value={report.view}
              onValueChange={(value) => setView(value as GradesView)}
            >
              <TabsList>
                {report.availableViews.map((v) => (
                  <TabsTrigger key={v} value={v}>
                    {VIEW_META[v].label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <Select
            value={report.termId ?? "all"}
            onValueChange={(value) =>
              setTermId(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All terms</SelectItem>
              {report.terms.map((term) => (
                <SelectItem key={term.id} value={term.id}>
                  Term {term.termNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={cn(
          "transition-opacity",
          isPlaceholderData && "pointer-events-none opacity-60",
        )}
      >
        {report.summary.results === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <ClipboardList className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No published results yet</p>
              <p className="text-xs text-muted-foreground">
                Performance appears here once assessment results are published.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Dashboard report={report} />
        )}
      </div>
    </div>
  );
}
