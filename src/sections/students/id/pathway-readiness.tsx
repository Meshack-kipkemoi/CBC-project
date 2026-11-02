"use client";

import {
  ClipboardList,
  Info,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BANDS } from "@/lib/student/data/competencies";
import {
  PATHWAYS,
  READINESS_LABEL,
  RUBRIC,
  type PathwayId,
  type PathwayResult,
  type ReadinessReport,
  type Rubric,
} from "@/lib/student/data/pathways";
import { useStudentQuery } from "@/hooks/use-student";

const CONFIG = new Map(PATHWAYS.map((p) => [p.id, p] as const));

// Recharts needs real colour values, so these match the Tailwind colours
// used for each pathway in the config (sky-500, violet-500, orange-500).
const PATHWAY_COLORS: Record<PathwayId, string> = {
  stem: "#0ea5e9",
  "arts-sports": "#8b5cf6",
  "social-sciences": "#f97316",
};

// ChartContainer turns each `color` into a `--color-<id>` CSS variable
const chartConfig: ChartConfig = Object.fromEntries(
  PATHWAYS.map((p) => [p.id, { label: p.name, color: PATHWAY_COLORS[p.id] }]),
);

const percent = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(1)}%`;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function RubricBadge({ rubric }: { rubric: Rubric | null }) {
  if (!rubric) return null;

  return (
    <span
      title={`${BANDS[rubric.band].label} · ${rubric.points}/8 points`}
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        BANDS[rubric.band].badge,
      )}
    >
      {rubric.code}
    </span>
  );
}

function ScoreBar({
  value,
  className,
}: {
  value: number | null;
  className: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", className)}
        style={{ width: `${value ?? 0}%` }}
      />
    </div>
  );
}

function Delta({ value, suffix }: { value: number; suffix: string }) {
  const up = value > 0;
  const down = value < 0;
  const Icon = up ? TrendingUp : down ? TrendingDown : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        up && "text-emerald-600 dark:text-emerald-400",
        down && "text-red-600 dark:text-red-400",
        !up && !down && "text-muted-foreground",
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      {up ? "+" : ""}
      {value.toFixed(1)} pts {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Hero: best match + ranking
// ---------------------------------------------------------------------------

function Hero({ report }: { report: ReadinessReport }) {
  const ranked = report.pathways.filter((p) => p.average !== null);
  const top = ranked[0];
  if (!top) return null;

  const config = CONFIG.get(top.id)!;
  const second = ranked[1];
  const gap = second ? top.average! - second.average! : null;
  const closeCall =
    second && gap !== null && gap < 2
      ? { name: CONFIG.get(second.id)!.name, gap }
      : null;

  const ringData = ranked.map((p) => ({
    pathway: p.id,
    value: p.average as number,
    fill: `var(--color-${p.id})`,
  }));

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card py-0">
      <div className="grid md:grid-cols-5">
        {/* Rings */}
        <div className="relative flex items-center justify-center p-6 md:col-span-2">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[260px]"
          >
            <RadialBarChart
              data={ringData}
              startAngle={90}
              endAngle={-270}
              innerRadius="40%"
              outerRadius="100%"
              barSize={16}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="pathway" />}
              />
              <RadialBar
                dataKey="value"
                background={{ fill: "var(--muted)" }}
                cornerRadius={8}
              />
            </RadialBarChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tabular-nums">
              {top.average!.toFixed(0)}%
            </span>
            <span className="text-xs text-muted-foreground">
              {config.short}
            </span>
          </div>
        </div>

        {/* Best match + ranking */}
        <div className="space-y-5 p-6 md:col-span-3 md:border-l">
          <div className="space-y-2">
            <Badge className="gap-1">
              <Sparkles className="size-3" />
              Strongest pathway
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              {config.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <RubricBadge rubric={top.rubric} />
            {top.rubric && (
              <span className="text-sm text-muted-foreground">
                {top.rubric.points}/8 points ·{" "}
                {READINESS_LABEL[top.rubric.band]}
              </span>
            )}
            {top.deltaVsOverall !== null && (
              <Delta value={top.deltaVsOverall} suffix="vs overall" />
            )}
          </div>

          <p className="text-sm">
            <span className="font-medium">Leads to: </span>
            <span className="text-muted-foreground">{config.leadsTo}</span>
          </p>

          <ol className="space-y-1 border-t pt-4">
            {report.pathways.map((p) => {
              const c = CONFIG.get(p.id)!;
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                    {p.rank ?? "–"}
                  </span>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: PATHWAY_COLORS[p.id] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {c.name}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {percent(p.average)}
                  </span>
                  <RubricBadge rubric={p.rubric} />
                </li>
              );
            })}
          </ol>

          {closeCall && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Close call: {closeCall.name} is only {closeCall.gap.toFixed(1)}{" "}
              points behind, so both are worth considering.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Subject breakdown (bar chart)
// ---------------------------------------------------------------------------

function SubjectChart({ report }: { report: ReadinessReport }) {
  const data = report.pathways
    .flatMap((p) =>
      p.slots
        .filter((s) => s.average !== null)
        .map((s) => ({
          subject: s.label,
          average: s.average as number,
          pathway: p.id,
          fill: `var(--color-${p.id})`,
        })),
    )
    .sort((a, b) => b.average - a.average);

  if (data.length === 0) return null;

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-base">Subject breakdown</CardTitle>
        <CardDescription>
          Average score per subject, coloured by pathway. The dashed line is the
          student’s overall average.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height: data.length * 42 + 40 }}
        >
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 44 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="subject"
              type="category"
              tickLine={false}
              axisLine={false}
              width={132}
              tick={{ fontSize: 12 }}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
            />
            {report.overallAverage !== null && (
              <ReferenceLine
                x={report.overallAverage}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
              />
            )}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <div className="flex w-full items-center justify-between gap-6">
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-[2px]"
                          style={{ backgroundColor: item.payload.fill }}
                        />
                        {chartConfig[item.payload.pathway as PathwayId]?.label}
                      </span>
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

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {PATHWAYS.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: PATHWAY_COLORS[p.id] }}
              />
              {p.short}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Trend by term (line chart)
// ---------------------------------------------------------------------------

function TrendChart({ pathways }: { pathways: PathwayResult[] }) {
  const terms = [
    ...new Map(
      pathways.flatMap((p) => p.trend).map((t) => [t.termId, t] as const),
    ).values(),
  ].sort((a, b) => a.year.localeCompare(b.year) || a.termNumber - b.termNumber);

  if (terms.length === 0) return null;

  const multiYear = new Set(terms.map((t) => t.year)).size > 1;
  const termLabel = (t: (typeof terms)[number]) =>
    multiYear ? `${t.year} T${t.termNumber}` : `Term ${t.termNumber}`;

  const data = terms.map((term) => ({
    term: termLabel(term),
    ...Object.fromEntries(
      pathways.map((p) => [
        p.id,
        p.trend.find((t) => t.termId === term.termId)?.average ?? null,
      ]),
    ),
  }));

  const values = pathways.flatMap((p) => p.trend.map((t) => t.average));
  const yMin = Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10);
  const yMax = Math.min(100, Math.ceil((Math.max(...values) + 5) / 10) * 10);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Trend by term</CardTitle>
        <CardDescription>
          Average score in each pathway, term by term.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-72 w-full"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 12, top: 12 }}
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
            <ChartTooltip content={<ChartTooltipContent />} />
            {pathways.map((p) => (
              <Line
                key={p.id}
                dataKey={p.id}
                type="monotone"
                stroke={`var(--color-${p.id})`}
                strokeWidth={2.5}
                dot={{ r: 4, fill: `var(--color-${p.id})` }}
                connectNulls
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Pathway explorer (tabs)
// ---------------------------------------------------------------------------

function PathwayPanel({ result }: { result: PathwayResult }) {
  const config = CONFIG.get(result.id)!;
  const trend = result.trend;
  const previous =
    trend.length > 1
      ? trend[trend.length - 1]!.average - trend[trend.length - 2]!.average
      : null;

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="space-y-4 md:col-span-3">
        <p className="text-sm text-muted-foreground">{config.description}</p>

        <ul className="space-y-4">
          {result.slots.map((slot) => (
            <li key={slot.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{slot.label}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-muted-foreground">
                    {slot.average !== null
                      ? `${slot.average.toFixed(1)}%`
                      : "No results"}
                  </span>
                  <RubricBadge rubric={slot.rubric} />
                </span>
              </div>
              <ScoreBar value={slot.average} className={config.color.bar} />
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 md:col-span-2">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Pathway average</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-2xl font-semibold tabular-nums">
              {percent(result.average)}
            </p>
            <RubricBadge rubric={result.rubric} />
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {result.deltaVsOverall !== null && (
              <Delta value={result.deltaVsOverall} suffix="vs overall" />
            )}
            {previous !== null && (
              <Delta value={previous} suffix="since last term" />
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4 text-sm">
          <p className="text-xs text-muted-foreground">Leads to</p>
          <p className="mt-1">{config.leadsTo}</p>
        </div>
      </div>
    </div>
  );
}

function PathwayExplorer({ pathways }: { pathways: PathwayResult[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Explore each pathway</CardTitle>
        <CardDescription>
          The subjects that count towards each pathway.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={pathways[0]!.id}>
          <TabsList className="grid w-full grid-cols-3">
            {pathways.map((p) => {
              const c = CONFIG.get(p.id)!;
              const Icon = c.icon;
              return (
                <TabsTrigger key={p.id} value={p.id} className="gap-2">
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{c.short}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {pathways.map((p) => (
            <TabsContent key={p.id} value={p.id} className="mt-4">
              <PathwayPanel result={p} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------

function HowItWorks() {
  return (
    <Card>
      <CardContent>
        <details className="text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <Info className="size-4 text-muted-foreground" />
            How this is calculated
          </summary>

          <div className="mt-3 space-y-3 text-muted-foreground">
            <p>
              Each subject’s score is the average of its published assessments,
              as a percentage. A pathway’s score is the average of its subjects,
              weighted equally. Religious Education counts once, whichever
              variant the student takes. Bands use the KNEC 8-point rubric:
            </p>

            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {RUBRIC.map((row) => (
                <li key={row.code} className="flex items-center gap-2">
                  <RubricBadge rubric={row} />
                  <span className="text-xs">
                    {row.range} · {row.points} pts
                  </span>
                </li>
              ))}
            </ul>

            <p>
              This shows where the student’s strengths lie. It is not a
              placement. Official Senior School placement also draws on KJSEA
              (60%), Grade 7 and 8 school-based assessments (20%) and KPSEA
              (20%).
            </p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

function ReadinessSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-72 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-96 rounded-xl lg:col-span-3" />
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab (this is what the tabs array renders)
// ---------------------------------------------------------------------------

export function PathwayReadiness({ id }: { id: string }) {
  const {
    data: report,
    isPending,
    isError,
    error,
    refetch,
  } = useStudentQuery(id, "pathway-readiness");

  if (isPending) return <ReadinessSkeleton />;

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

  if (report.resultsCount === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <ClipboardList className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No published results yet</p>
          <p className="text-xs text-muted-foreground">
            Pathway readiness appears once assessment results are published.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Pathway readiness
        </h2>
        <p className="text-sm text-muted-foreground">
          Based on {report.resultsCount} published results across{" "}
          {report.subjectsCount} learning areas
          {report.overallAverage !== null
            ? ` · overall average ${report.overallAverage.toFixed(1)}%`
            : ""}
        </p>
      </div>

      <Hero report={report} />

      <div className="grid gap-4 lg:grid-cols-5">
        <SubjectChart report={report} />
        <TrendChart pathways={report.pathways} />
      </div>

      <PathwayExplorer pathways={report.pathways} />
      <HowItWorks />
    </div>
  );
}
