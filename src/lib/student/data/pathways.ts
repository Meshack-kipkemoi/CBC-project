import { FlaskConical, Globe, Trophy, type LucideIcon } from "lucide-react";
import type { Band } from "@/lib/student/data/competencies";

// ---------------------------------------------------------------------------
// KNEC 8-point rubric
// ---------------------------------------------------------------------------

export type Rubric = { code: string; band: Band; points: number };
type RubricRow = Rubric & { min: number; range: string };

export const RUBRIC: RubricRow[] = [
  { code: "EE1", band: "EE", points: 8, min: 90, range: "90–100%" },
  { code: "EE2", band: "EE", points: 7, min: 75, range: "75–89%" },
  { code: "ME1", band: "ME", points: 6, min: 58, range: "58–74%" },
  { code: "ME2", band: "ME", points: 5, min: 41, range: "41–57%" },
  { code: "AE1", band: "AE", points: 4, min: 31, range: "31–40%" },
  { code: "AE2", band: "AE", points: 3, min: 21, range: "21–30%" },
  { code: "BE1", band: "BE", points: 2, min: 11, range: "11–20%" },
  { code: "BE2", band: "BE", points: 1, min: 0, range: "1–10%" },
];

export function rubricFor(percent: number): Rubric {
  const rounded = Math.round(percent);
  const row =
    RUBRIC.find((r) => rounded >= r.min) ?? RUBRIC[RUBRIC.length - 1]!;
  return { code: row.code, band: row.band, points: row.points };
}

export const READINESS_LABEL: Record<Band, string> = {
  EE: "Excellent fit",
  ME: "Good fit",
  AE: "Developing",
  BE: "Needs support",
};

// ---------------------------------------------------------------------------
// Pathways
// ---------------------------------------------------------------------------

export type PathwayId = "stem" | "arts-sports" | "social-sciences";

/** One subject slot. Religious Education has three codes but counts once. */
type Slot = { label: string; codes: string[] };

export type PathwayConfig = {
  id: PathwayId;
  name: string;
  short: string;
  icon: LucideIcon;
  description: string;
  leadsTo: string;
  slots: Slot[];
  color: {
    bar: string;
    stroke: string;
    fill: string;
    tint: string;
    text: string;
  };
};

export const PATHWAYS: PathwayConfig[] = [
  {
    id: "stem",
    name: "STEM & Innovation",
    short: "STEM",
    icon: FlaskConical,
    description: "Science, technology, engineering and mathematics.",
    leadsTo: "Engineering, medicine, ICT, agriculture, applied sciences",
    slots: [
      { label: "Pre-Technical Studies", codes: ["PTS"] },
      { label: "Integrated Science", codes: ["ISC"] },
      { label: "Agriculture", codes: ["AGR"] },
      { label: "Mathematics", codes: ["MAT"] },
    ],
    color: {
      bar: "bg-sky-500",
      stroke: "stroke-sky-500",
      fill: "fill-sky-500",
      tint: "bg-sky-500/10",
      text: "text-sky-600 dark:text-sky-400",
    },
  },
  {
    id: "arts-sports",
    name: "Arts & Sports Science",
    short: "Arts & Sports",
    icon: Trophy,
    description: "Performing and visual arts, music and sports.",
    leadsTo: "Music, theatre, design, film, sports science, coaching",
    slots: [{ label: "Creative Arts and Sports", codes: ["CAS"] }],
    color: {
      bar: "bg-violet-500",
      stroke: "stroke-violet-500",
      fill: "fill-violet-500",
      tint: "bg-violet-500/10",
      text: "text-violet-600 dark:text-violet-400",
    },
  },
  {
    id: "social-sciences",
    name: "Social Sciences & Humanities",
    short: "Social Sciences",
    icon: Globe,
    description: "Languages, religion, society and human behaviour.",
    leadsTo: "Law, journalism, teaching, business, languages, public service",
    slots: [
      { label: "Religious Education", codes: ["CRE", "IRE", "HRE"] },
      { label: "English", codes: ["ENG"] },
      { label: "Social Studies", codes: ["SST"] },
      { label: "Kiswahili", codes: ["KIS"] },
    ],
    color: {
      bar: "bg-orange-500",
      stroke: "stroke-orange-500",
      fill: "fill-orange-500",
      tint: "bg-orange-500/10",
      text: "text-orange-600 dark:text-orange-400",
    },
  },
];

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/** One published result, as a percentage of the assessment's max score. */
export type RawResult = {
  code: string;
  percent: number;
  termId: string;
  termNumber: number;
  year: string;
};

export type SlotScore = {
  label: string;
  average: number | null;
  assessments: number;
  rubric: Rubric | null;
};

export type TrendPoint = {
  termId: string;
  termNumber: number;
  year: string;
  average: number;
};

export type PathwayResult = {
  id: PathwayId;
  /** 1 = best match. Null when the student has no results for the pathway. */
  rank: number | null;
  average: number | null;
  rubric: Rubric | null;
  /** Pathway average minus the student's overall average. */
  deltaVsOverall: number | null;
  slots: SlotScore[];
  trend: TrendPoint[];
};

export type ReadinessReport = {
  overallAverage: number | null;
  resultsCount: number;
  subjectsCount: number;
  /** Ranked best first, pathways without results last. */
  pathways: PathwayResult[];
};

const mean = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

const round1 = (value: number) => Math.round(value * 10) / 10;

export function computeReadiness(results: RawResult[]): ReadinessReport {
  const percentsFor = (codes: string[], termId?: string) =>
    results
      .filter(
        (r) =>
          codes.includes(r.code) &&
          (termId === undefined || r.termId === termId),
      )
      .map((r) => r.percent);

  // Average of the slot averages that have data (slots are weighted equally)
  const averageOf = (slots: Slot[], termId?: string) =>
    mean(
      slots
        .map((slot) => mean(percentsFor(slot.codes, termId)))
        .filter((v): v is number => v !== null),
    );

  const codes = [...new Set(results.map((r) => r.code))];
  const overall = mean(
    codes
      .map((code) => mean(percentsFor([code])))
      .filter((v): v is number => v !== null),
  );

  const terms = [
    ...new Map(
      results.map(
        (r) =>
          [
            r.termId,
            { termId: r.termId, termNumber: r.termNumber, year: r.year },
          ] as const,
      ),
    ).values(),
  ].sort((a, b) => a.year.localeCompare(b.year) || a.termNumber - b.termNumber);

  const computed = PATHWAYS.map((pathway) => {
    const slots: SlotScore[] = pathway.slots.map((slot) => {
      const percents = percentsFor(slot.codes);
      const average = mean(percents);
      return {
        label: slot.label,
        average: average === null ? null : round1(average),
        assessments: percents.length,
        rubric: average === null ? null : rubricFor(average),
      };
    });

    const trend: TrendPoint[] = terms.flatMap((term) => {
      const termAverage = averageOf(pathway.slots, term.termId);
      return termAverage === null
        ? []
        : [{ ...term, average: round1(termAverage) }];
    });

    return { id: pathway.id, slots, trend, average: averageOf(pathway.slots) };
  });

  const withScore = computed
    .filter((c) => c.average !== null)
    .sort((a, b) => (b.average as number) - (a.average as number));
  const withoutScore = computed.filter((c) => c.average === null);

  const pathways: PathwayResult[] = [...withScore, ...withoutScore].map(
    (c, index) => ({
      id: c.id,
      rank: c.average === null ? null : index + 1,
      average: c.average === null ? null : round1(c.average),
      rubric: c.average === null ? null : rubricFor(c.average),
      deltaVsOverall:
        c.average === null || overall === null
          ? null
          : round1(c.average - overall),
      slots: c.slots,
      trend: c.trend,
    }),
  );

  return {
    overallAverage: overall === null ? null : round1(overall),
    resultsCount: results.length,
    subjectsCount: codes.length,
    pathways,
  };
}
