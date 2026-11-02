"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";

const chartConfig = {
  average: { label: "Average %", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function AcademicAverageChart() {
  const { query, scope, stale } = useDashboard();

  if (query.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (!query.data) return null;

  const { trend } = query.data;
  const withData = trend.filter((t) => t.average !== null);
  const last = withData[withData.length - 1];
  const prev = withData[withData.length - 2];
  const delta =
    last && prev
      ? Math.round(((last.average as number) - (prev.average as number)) * 10) /
        10
      : null;

  return (
    <Card className={cn("transition-opacity", stale && "opacity-60")}>
      <CardHeader>
        <CardTitle>Academic Average</CardTitle>
        <CardDescription>
          Average score per term · {scope.cohort} · {scope.year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {withData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No results recorded for this selection yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={trend}
              margin={{ top: 8, left: 12, right: 12 }}
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
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        {delta !== null && last && prev ? (
          <div className="flex gap-2 leading-none font-medium">
            {last.label} is {delta >= 0 ? "up" : "down"} {Math.abs(delta)} pts
            on {prev.label}
            {delta >= 0 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
          </div>
        ) : (
          <div className="font-medium">
            Not enough terms to show a trend yet
          </div>
        )}
        <div className="text-muted-foreground">
          Draft assessments are excluded
        </div>
      </CardFooter>
    </Card>
  );
}
