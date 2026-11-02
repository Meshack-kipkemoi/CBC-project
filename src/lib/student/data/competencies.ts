import {
  BookOpen,
  Landmark,
  Laptop,
  MessagesSquare,
  Palette,
  Puzzle,
  Rocket,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Rating bands (the same CBC bands you already use for grades)
// ---------------------------------------------------------------------------

export type Band = "EE" | "ME" | "AE" | "BE";

/** Numeric level used for the radar chart, the meter and trends. */
export const BAND_LEVEL: Record<Band, number> = { EE: 4, ME: 3, AE: 2, BE: 1 };

export const BANDS: Record<
  Band,
  { label: string; badge: string; bar: string }
> = {
  EE: {
    label: "Exceeding expectation",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  ME: {
    label: "Meeting expectation",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    bar: "bg-blue-500",
  },
  AE: {
    label: "Approaching expectation",
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  BE: {
    label: "Below expectation",
    badge: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    bar: "bg-red-500",
  },
};

// ---------------------------------------------------------------------------
// The seven core competencies
// ---------------------------------------------------------------------------

export type Competency = {
  id: string;
  name: string;
  /** Short label for the radar chart. */
  shortName: string;
  icon: LucideIcon;
  description: string;
  /** What the teacher looks for. A guide for rating, not stored data. */
  indicators: string[];
};

export const COMPETENCIES: Competency[] = [
  {
    id: "communication",
    name: "Communication & Collaboration",
    shortName: "Communication",
    icon: MessagesSquare,
    description: "Sharing ideas clearly and working well with others.",
    indicators: [
      "Expresses ideas clearly in speech and writing",
      "Listens and responds respectfully",
      "Plays their part in group work",
      "Helps resolve disagreements",
    ],
  },
  {
    id: "critical-thinking",
    name: "Critical Thinking & Problem Solving",
    shortName: "Critical thinking",
    icon: Puzzle,
    description: "Questioning, analysing and finding solutions.",
    indicators: [
      "Asks questions and examines information",
      "Spots problems and suggests solutions",
      "Gives reasons for decisions",
      "Applies learning to new situations",
    ],
  },
  {
    id: "self-efficacy",
    name: "Self-efficacy",
    shortName: "Self-efficacy",
    icon: Rocket,
    description: "Confidence in their own ability and the drive to keep going.",
    indicators: [
      "Shows confidence in their own ability",
      "Keeps trying after setbacks",
      "Sets goals and takes initiative",
      "Accepts feedback calmly",
    ],
  },
  {
    id: "creativity",
    name: "Creativity & Imagination",
    shortName: "Creativity",
    icon: Palette,
    description: "Original ideas and new ways of doing things.",
    indicators: [
      "Comes up with original ideas",
      "Tries different approaches",
      "Produces creative work",
      "Combines ideas in new ways",
    ],
  },
  {
    id: "citizenship",
    name: "Citizenship",
    shortName: "Citizenship",
    icon: Landmark,
    description: "Responsibility to school, community and environment.",
    indicators: [
      "Respects others and differences",
      "Takes part in school and community activities",
      "Follows rules and takes responsibility",
      "Cares for the environment",
    ],
  },
  {
    id: "digital-literacy",
    name: "Digital Literacy",
    shortName: "Digital literacy",
    icon: Laptop,
    description: "Using technology confidently, safely and responsibly.",
    indicators: [
      "Uses devices and software confidently",
      "Finds and checks information online",
      "Creates digital work",
      "Stays safe and behaves responsibly online",
    ],
  },
  {
    id: "learning-to-learn",
    name: "Learning to Learn",
    shortName: "Learning to learn",
    icon: BookOpen,
    description: "Managing their own learning and progress.",
    indicators: [
      "Organises time and work",
      "Asks for help when stuck",
      "Reflects on their own progress",
      "Works independently",
    ],
  },
];

// ---------------------------------------------------------------------------
// Rating shape (what the query will return later)
// ---------------------------------------------------------------------------

export type CompetencyRating = {
  competencyId: string;
  termNumber: number;
  band: Band;
  comment?: string | null;
};

// ---------------------------------------------------------------------------
// Sample data so the UI renders before the database part exists.
// Delete this once the real query is wired up.
// ---------------------------------------------------------------------------

const SAMPLE_BANDS: Record<string, Band[]> = {
  communication: ["ME", "ME", "EE"],
  "critical-thinking": ["AE", "ME", "ME"],
  "self-efficacy": ["ME", "EE", "EE"],
  creativity: ["EE", "EE", "EE"],
  citizenship: ["ME", "ME", "ME"],
  "digital-literacy": ["AE", "AE", "ME"],
  "learning-to-learn": ["BE", "AE", "AE"],
};

const SAMPLE_COMMENTS: Record<Band, string> = {
  EE: "Consistently shows this and helps others do the same.",
  ME: "Shows this regularly without being prompted.",
  AE: "Shows this sometimes, usually with a reminder.",
  BE: "Needs regular support to show this.",
};

export const SAMPLE_RATINGS: CompetencyRating[] = Object.entries(
  SAMPLE_BANDS,
).flatMap(([competencyId, bands]) =>
  bands.map((band, i) => ({
    competencyId,
    termNumber: i + 1,
    band,
    comment: SAMPLE_COMMENTS[band],
  })),
);
