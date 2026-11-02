import type { Band } from "@/lib/student/data/competencies";

export type GradesView = "school" | "class" | "subjects";

/** Broadest first. This is also the order used to pick a default view. */
export const GRADES_VIEWS: GradesView[] = ["school", "class", "subjects"];

export const VIEW_META: Record<GradesView, { label: string; title: string }> = {
  school: { label: "Whole school", title: "School performance" },
  class: { label: "My class", title: "Class performance" },
  subjects: { label: "My subjects", title: "Subject performance" },
};

// Same cut-offs as your grading scale (80 / 60 / 40)
export const bandOf = (percent: number): Band =>
  percent >= 80 ? "EE" : percent >= 60 ? "ME" : percent >= 40 ? "AE" : "BE";

export type SubjectStat = {
  code: string;
  name: string;
  average: number;
  results: number;
  ee: number;
  me: number;
  ae: number;
  be: number;
};

export type GradeStat = {
  level: number;
  name: string;
  average: number;
  students: number;
};

export type StreamStat = {
  streamId: string;
  streamName: string;
  gradeLevel: number;
  gradeName: string;
  average: number;
  students: number;
};

export type TermStat = {
  termId: string;
  termNumber: number;
  year: string;
  average: number;
  results: number;
};

export type StudentStat = {
  id: string;
  name: string;
  admissionNumber: string;
  streamName: string;
  gradeName: string;
  average: number;
  results: number;
};

/** What the database function returns. */
export type GradesData = {
  summary: { results: number; students: number; average: number | null };
  bySubject: SubjectStat[];
  byGrade: GradeStat[];
  byStream: StreamStat[];
  byTerm: TermStat[];
  topStudents: StudentStat[];
  supportStudents: StudentStat[];
};

export type GradesReport = GradesData & {
  view: GradesView;
  availableViews: GradesView[];
  /** "Whole school", the stream names, or the subject names */
  scopeLabel: string;
  year: { id: string; name: string };
  terms: { id: string; termNumber: number }[];
  /** The term filter in use, or null for all terms */
  termId: string | null;
};
