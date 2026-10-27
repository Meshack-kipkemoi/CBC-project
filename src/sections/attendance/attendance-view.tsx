"use client";

import { useState, type ReactNode } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  CalendarCheck,
  ChevronRight,
  Layers,
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
  useAttendanceQuery,
  type AttendanceStatus,
  type AttendanceData,
  type AttendanceStream,
} from "@/hooks/use-attendance";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_KEYS: AttendanceStatus[] = [
  "present",
  "late",
  "absent",
  "excused",
];
const STATUS_STYLE: Record<AttendanceStatus, { label: string; bar: string }> = {
  present: { label: "Present", bar: "bg-emerald-500" },
  late: { label: "Late", bar: "bg-amber-500" },
  absent: { label: "Absent", bar: "bg-rose-500" },
  excused: { label: "Excused", bar: "bg-sky-500" },
};

const pct = (n: number | null) => (n === null ? "—" : `${n}%`);

const trendConfig = {
  rate: { label: "Attendance %", color: "var(--chart-1)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function StatusBar({ stream: s }: { stream: AttendanceStream }) {
  const total = s.records;
  if (total === 0) return <div className="h-2 w-full rounded-full bg-muted" />;

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
      {STATUS_KEYS.map(
        (k) =>
          s[k] > 0 && (
            <div
              key={k}
              className={STATUS_STYLE[k].bar}
              style={{ width: `${(s[k] / total) * 100}%` }}
              title={`${STATUS_STYLE[k].label}: ${Math.round((s[k] / total) * 100)}%`}
            />
          ),
      )}
    </div>
  );
}

function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {STATUS_KEYS.map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", STATUS_STYLE[k].bar)} />
          {STATUS_STYLE[k].label}
        </span>
      ))}
    </div>
  );
}

function RateText({ value }: { value: number | null }) {
  const tone =
    value === null
      ? "text-muted-foreground"
      : value >= 95
        ? "text-emerald-600 dark:text-emerald-400"
        : value >= 90
          ? "text-amber-600 dark:text-amber-400"
          : "text-rose-600 dark:text-rose-400";
  return (
    <span className={cn("text-3xl font-semibold tracking-tight", tone)}>
      {pct(value)}
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
  data: AttendanceData;
  selection: Record<string, string | undefined>;
  onChange: (next: Record<string, string | undefined>) => void;
}) {
  const f = data.filters;
  const year = f.years.find((y) => y.id === (selection.year ?? f.yearId));
  const term = year?.terms.find((t) => t.id === (selection.term ?? f.termId));
  const grade = f.grades.find((g) => g.id === (selection.grade ?? f.gradeId));
  const learningArea = data.learningAreas.find(
    (la) => la.id === selection.learningArea,
  );

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

        {data.role === "principal" && (
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
        )}

        {data.role === "subject_teacher" && data.learningAreas.length > 0 && (
          <Field label="Subject">
            <Select
              value={learningArea?.id ?? "all"}
              onValueChange={(v) =>
                v &&
                onChange({
                  ...selection,
                  learningArea: v === "all" ? undefined : v,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {learningArea?.name ?? "All subjects"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {data.learningAreas.map((la) => (
                  <SelectItem key={la.id} value={la.id}>
                    {la.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function StatCards({ data, scope }: { data: AttendanceData; scope: string }) {
  const { summary } = data;
  const cards = [
    {
      title: "Attendance rate",
      value: pct(summary.rate),
      description: `Present + late · ${scope}`,
    },
    {
      title: "Sessions recorded",
      value: summary.sessions.toLocaleString(),
      description: scope,
    },
    {
      title: "Absences",
      value: summary.absent.toLocaleString(),
      description: `${summary.late.toLocaleString()} late · ${summary.excused.toLocaleString()} excused`,
    },
    {
      title: "Learners",
      value: summary.learners.toLocaleString(),
      description: `${summary.streams} stream${summary.streams === 1 ? "" : "s"}`,
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

// ---------------------------------------------------------------------------
// Stream card + details dialog
// ---------------------------------------------------------------------------

function AttendanceCard({
  stream: s,
  onOpen,
}: {
  stream: AttendanceStream;
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
          {s.isMine && <Badge>Your stream</Badge>}
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <RateText value={s.rate} />
            <span className="text-xs text-muted-foreground">
              {s.sessions} session{s.sessions === 1 ? "" : "s"}
            </span>
          </div>
          <StatusBar stream={s} />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {STATUS_KEYS.map((k) => (
            <div key={k}>
              <p className="text-sm font-semibold">{s[k]}</p>
              <p className="text-[11px] text-muted-foreground">
                {STATUS_STYLE[k].label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {s.learners} learner{s.learners === 1 ? "" : "s"}
          </p>
          <Button variant="ghost" size="sm" onClick={onOpen}>
            Details <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceDialog({
  stream: s,
  scope,
  onClose,
}: {
  stream: AttendanceStream | null;
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
                { label: "Attendance", value: pct(s.rate) },
                { label: "Sessions", value: String(s.sessions) },
                { label: "Learners", value: String(s.learners) },
                { label: "Absences", value: String(s.absent) },
              ].map((x) => (
                <div key={x.label} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{x.label}</p>
                  <p className="text-lg font-semibold">{x.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Breakdown</p>
              <ul className="divide-y rounded-lg border">
                {STATUS_KEYS.map((k) => (
                  <li
                    key={k}
                    className="flex items-center justify-between px-3 py-2.5 text-sm"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          STATUS_STYLE[k].bar,
                        )}
                      />
                      {STATUS_STYLE[k].label}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {s.records > 0
                          ? `${Math.round((s[k] / s.records) * 100)}%`
                          : "—"}
                      </span>
                      <span className="w-12 text-right font-semibold">
                        {s[k]}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Attendance per term</p>
              {s.trend.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No attendance recorded yet.
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
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                      dataKey="rate"
                      type="monotone"
                      stroke="var(--color-rate)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--color-rate)" }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
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

function AttendanceContent({
  data,
  scope,
}: {
  data: AttendanceData;
  scope: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { streams } = data;

  if (streams.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <CalendarCheck className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No streams to show for this selection.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (streams.every((s) => s.records === 0)) {
    return (
      <>
        <StatCards data={data} scope={scope} />
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <TriangleAlert className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No attendance has been recorded for this period yet.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <StatCards data={data} scope={scope} />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight">
            All streams
          </h2>
          <StatusLegend />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {streams.map((s) => (
            <AttendanceCard
              key={s.id}
              stream={s}
              onOpen={() => setOpenId(s.id)}
            />
          ))}
        </div>
      </div>
      <AttendanceDialog
        stream={streams.find((s) => s.id === openId) ?? null}
        scope={scope}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function AttendanceSkeleton() {
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AttendanceView() {
  // undefined = let the server pick the default
  const [selection, setSelection] = useState<
    Record<string, string | undefined>
  >({});
  const query = useAttendanceQuery(selection);

  if (query.isPending) return <AttendanceSkeleton />;

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

  const roleLine =
    data.role === "principal"
      ? "Every stream in the school"
      : data.role === "class_teacher"
        ? "Your stream"
        : "Streams where you teach";

  return (
    <div
      className={cn(
        "space-y-4 transition-opacity",
        query.isPlaceholderData && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground">
            {roleLine}
            {data.role === "principal" && ` · ${grade?.name ?? "All grades"}`}
          </p>
        </div>
      </div>

      <Filters data={data} selection={selection} onChange={setSelection} />
      <AttendanceContent data={data} scope={scope} />
    </div>
  );
}
