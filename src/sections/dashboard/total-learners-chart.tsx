"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
  learners: { label: "Learners", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function TotalLearnersChart() {
  const { query, scope, stale } = useDashboard();

  if (query.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (!query.data) return null;

  const { learnersByClass, filters, stats } = query.data;
  const byStream = filters.gradeId !== null;

  return (
    <Card className={cn("transition-opacity", stale && "opacity-60")}>
      <CardHeader>
        <CardTitle>Total Learners</CardTitle>
        <CardDescription>
          Learners per {byStream ? `stream · ${scope.cohort}` : "grade"} ·{" "}
          {scope.year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {learnersByClass.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No learners enrolled for this selection.
          </p>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={learnersByClass}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="learners" fill="var(--color-learners)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="font-medium">
          {stats.learners.toLocaleString()} learner
          {stats.learners === 1 ? "" : "s"} in total
        </div>
        <div className="text-muted-foreground">
          Based on each learner&apos;s latest enrollment in {scope.year}
        </div>
      </CardFooter>
    </Card>
  );
}
