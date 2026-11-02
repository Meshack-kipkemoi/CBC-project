"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";

const GRID =
  "grid grid-cols-1 smd:grid-cols-2 lg:grid-cols-4 justify-between gap-3";

function StatCardsSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function StatCards() {
  const { query, scope, stale } = useDashboard();

  if (query.isPending) return <StatCardsSkeleton />;
  if (!query.data) return null;

  const { stats } = query.data;
  const { total, published } = stats.assessments;
  const progress = total > 0 ? Math.round((published / total) * 100) : null;

  const cards = [
    {
      title: "Total Learners",
      value: stats.learners.toLocaleString(),
      description: `${scope.cohort} · ${scope.year}`,
    },
    {
      title: "Overall School Average",
      value: stats.average === null ? "—" : `${stats.average}%`,
      description: `${scope.term}, ${scope.year} · ${stats.results.toLocaleString()} results`,
    },
    {
      // No syllabus data exists in the schema, so this tracks assessments instead
      title: "Assessment Progress",
      value: progress === null ? "—" : `${progress}%`,
      description: `${published} of ${total} assessments published · ${scope.term}`,
    },
    {
      title: "Classes Below Expectations",
      value: String(stats.classes.below),
      description: `of ${stats.classes.total} classes averaging under ${stats.belowThreshold}%`,
    },
  ];

  return (
    <div className={cn(GRID, "transition-opacity", stale && "opacity-60")}>
      {cards.map((card) => (
        <Card key={card.title} className="relative flex-1 gap-0 py-0 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-[calc(0.5*var(--radius))] bg-linear-to-r from-primary via-indigo-400 to-emerald-500" />
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle className="text-sm text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-center gap-4 px-6 pt-2 pb-0">
            <span className="text-2xl font-bold tracking-tight">
              {card.value}
            </span>
          </CardContent>

          <CardFooter className="px-6 pt-2 pb-4">
            <CardDescription className="text-xs">
              {card.description}
            </CardDescription>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
