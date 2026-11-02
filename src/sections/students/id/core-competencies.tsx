"use client";

import { useState } from "react";
import { ClipboardList, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BAND_LEVEL,
  BANDS,
  COMPETENCIES,
  SAMPLE_RATINGS,
  type Band,
  type Competency,
  type CompetencyRating,
} from "@/lib/student/data/competencies";

type Row = {
  competency: Competency;
  rating?: CompetencyRating;
  previous?: CompetencyRating;
};

// ---------------------------------------------------------------------------
// Radar chart (plain SVG, no chart library)
// ---------------------------------------------------------------------------

const RING_LABELS = ["BE", "AE", "ME", "EE"];

function Radar({ data }: { data: { label: string; level: number }[] }) {
  const W = 460;
  const H = 340;
  const cx = W / 2;
  const cy = H / 2;
  const R = 105;
  const n = data.length;

  const point = (i: number, radius: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      cos: Math.cos(angle),
      sin: Math.sin(angle),
    };
  };

  const polygon = (radiusFor: (i: number) => number) =>
    data
      .map((_, i) => {
        const p = point(i, radiusFor(i));
        return `${p.x},${p.y}`;
      })
      .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Radar chart of core competency ratings"
      className="w-full"
    >
      {/* Rings: BE (inner) to EE (outer) */}
      {[1, 2, 3, 4].map((level) => (
        <polygon
          key={level}
          points={polygon(() => (R * level) / 4)}
          className="fill-none stroke-border"
        />
      ))}

      {/* Axes */}
      {data.map((d, i) => {
        const p = point(i, R);
        return (
          <line
            key={d.label}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            className="stroke-border"
          />
        );
      })}

      {/* Ring labels */}
      {RING_LABELS.map((code, i) => (
        <text
          key={code}
          x={cx + 4}
          y={cy - (R * (i + 1)) / 4 - 2}
          className="fill-muted-foreground text-[9px]"
        >
          {code}
        </text>
      ))}

      {/* The student's shape */}
      <polygon
        points={polygon((i) => (R * data[i]!.level) / 4)}
        className="fill-primary/20 stroke-primary"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        if (!d.level) return null;
        const p = point(i, (R * d.level) / 4);
        return (
          <circle
            key={d.label}
            cx={p.x}
            cy={p.y}
            r={3.5}
            className="fill-primary"
          />
        );
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const p = point(i, R + 16);
        const anchor = p.cos > 0.3 ? "start" : p.cos < -0.3 ? "end" : "middle";
        const dy = p.sin > 0.3 ? "0.8em" : p.sin < -0.3 ? "-0.2em" : "0.35em";

        return (
          <text
            key={d.label}
            x={p.x}
            y={p.y}
            dy={dy}
            textAnchor={anchor}
            className="fill-foreground text-xs font-medium"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function BandBadge({ band }: { band?: Band }) {
  if (!band) return <Badge variant="outline">Not rated</Badge>;

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

function LevelMeter({ band }: { band?: Band }) {
  const level = band ? BAND_LEVEL[band] : 0;

  return (
    <div
      className="flex gap-1"
      aria-label={band ? BANDS[band].label : "Not rated"}
    >
      {[1, 2, 3, 4].map((segment) => (
        <div
          key={segment}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            band && segment <= level ? BANDS[band].bar : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

function Trend({ rating, previous }: { rating?: Band; previous?: Band }) {
  if (!rating || !previous) return null;

  const diff = BAND_LEVEL[rating] - BAND_LEVEL[previous];

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-3" />
        Improved
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <TrendingDown className="size-3" />
        Dropped
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="size-3" />
      Steady
    </span>
  );
}

function CompetencyCard({ row }: { row: Row }) {
  const { competency, rating, previous } = row;
  const Icon = competency.icon;

  return (
    <Card className="py-4">
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="text-sm font-semibold">{competency.name}</h3>
              <Trend rating={rating?.band} previous={previous?.band} />
            </div>
            <p className="text-xs text-muted-foreground">
              {competency.description}
            </p>
          </div>

          <BandBadge band={rating?.band} />
        </div>

        <LevelMeter band={rating?.band} />

        {rating?.comment && (
          <p className="rounded-md bg-muted/50 p-3 text-sm">
            “{rating.comment}”
          </p>
        )}

        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            What the teacher looks for
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {competency.indicators.map((indicator) => (
              <li key={indicator}>{indicator}</li>
            ))}
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}

function NameList({ rows, empty }: { rows: Row[]; empty: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="space-y-2">
      {rows.map(({ competency, rating }) => (
        <li
          key={competency.id}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <span className="truncate">{competency.name}</span>
          <BandBadge band={rating?.band} />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------

export function CoreCompetencies({ id }: { id: string }) {
  const ratings: CompetencyRating[] = SAMPLE_RATINGS;
  const [selected, setSelected] = useState<number | null>(null);

  const terms = [...new Set(ratings.map((r) => r.termNumber))].sort(
    (a, b) => a - b,
  );

  if (terms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <ClipboardList className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No core competency ratings yet</p>
          <p className="text-xs text-muted-foreground">
            Ratings appear here once the class teacher has assessed the student.
          </p>
        </CardContent>
      </Card>
    );
  }

  const termNumber =
    selected !== null && terms.includes(selected)
      ? selected
      : terms[terms.length - 1]!;
  const previousTerm = [...terms].reverse().find((t) => t < termNumber);

  const lookup = (term?: number) =>
    new Map(
      ratings
        .filter((r) => r.termNumber === term)
        .map((r) => [r.competencyId, r] as const),
    );
  const current = lookup(termNumber);
  const previous = lookup(previousTerm);

  const rows: Row[] = COMPETENCIES.map((competency) => ({
    competency,
    rating: current.get(competency.id),
    previous: previous.get(competency.id),
  }));

  const strengths = rows.filter((r) => r.rating?.band === "EE");
  const focusAreas = rows.filter(
    (r) => r.rating && BAND_LEVEL[r.rating.band] <= 2,
  );

  const radarData = rows.map((r) => ({
    label: r.competency.shortName,
    level: r.rating ? BAND_LEVEL[r.rating.band] : 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Core competencies
          </h2>
          <p className="text-sm text-muted-foreground">
            Teacher observations, rated each term.
          </p>
        </div>

        <div className="inline-flex gap-1 rounded-lg border p-1">
          {terms.map((term) => (
            <Button
              key={term}
              size="sm"
              variant={term === termNumber ? "default" : "ghost"}
              onClick={() => setSelected(term)}
            >
              Term {term}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Overview */}
        <div className="space-y-4 self-start lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Radar data={radarData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <NameList
                rows={strengths}
                empty="No competency is rated EE this term."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Needs support</CardTitle>
            </CardHeader>
            <CardContent>
              <NameList
                rows={focusAreas}
                empty="Nothing below expectation this term."
              />
            </CardContent>
          </Card>
        </div>

        {/* Per competency */}
        <div className="space-y-4 lg:col-span-3">
          {rows.map((row) => (
            <CompetencyCard key={row.competency.id} row={row} />
          ))}
        </div>
      </div>
    </div>
  );
}
