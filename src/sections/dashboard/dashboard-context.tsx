"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  useDashboardQuery,
  type DashboardFilters,
} from "@/hooks/use-dashboard";

type DashboardContextValue = {
  selection: DashboardFilters;
  setYear: (id: string) => void;
  setTerm: (id: string) => void;
  setGrade: (id: string) => void;
  setStream: (id: string) => void;
  query: ReturnType<typeof useDashboardQuery>;
  /** True while old numbers are shown and new ones are loading */
  stale: boolean;
  /** Human labels for what the numbers currently cover */
  scope: { year: string; term: string; cohort: string };
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // undefined = "let the server pick the default"
  const [selection, setSelection] = useState<DashboardFilters>({});
  const query = useDashboardQuery(selection);

  const f = query.data?.filters;
  const year = f?.years.find((y) => y.id === f.yearId);
  const term = year?.terms.find((t) => t.id === f?.termId);
  const grade = f?.grades.find((g) => g.id === f?.gradeId);
  const stream = grade?.streams.find((s) => s.id === f?.streamId);

  const value: DashboardContextValue = {
    selection,
    // A new year resets the term, so the server picks that year's default
    setYear: (id) => setSelection((s) => ({ ...s, year: id, term: undefined })),
    setTerm: (id) => setSelection((s) => ({ ...s, term: id })),
    // A new grade resets the stream
    setGrade: (id) =>
      setSelection((s) => ({ ...s, grade: id, stream: undefined })),
    setStream: (id) => setSelection((s) => ({ ...s, stream: id })),
    query,
    stale: query.isPlaceholderData,
    scope: {
      year: year?.name ?? "",
      term: term ? `Term ${term.term_number}` : "All terms",
      cohort: stream
        ? `${grade?.name} ${stream.name}`
        : (grade?.name ?? "All grades"),
    },
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}
