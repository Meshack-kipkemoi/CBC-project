"use client";

import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "./dashboard-context";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-1.5 items-center flex-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-nowrap gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-9 flex-1" />
      ))}
    </div>
  );
}

export function Filters() {
  const { query, selection, setYear, setTerm, setGrade, setStream } =
    useDashboard();

  if (!query.data) return <FiltersSkeleton />;

  const f = query.data.filters;

  // The user's pick wins immediately; otherwise show what the server resolved
  const year = f.years.find((y) => y.id === (selection.year ?? f.yearId));
  const term = year?.terms.find((t) => t.id === (selection.term ?? f.termId));
  const grade = f.grades.find((g) => g.id === (selection.grade ?? f.gradeId));
  const stream = grade?.streams.find(
    (s) => s.id === (selection.stream ?? f.streamId),
  );

  return (
    <ScrollArea>
      <div className="flex flex-nowrap gap-4">
        <Field label="Year">
          <Select value={year?.id ?? ""} onValueChange={(v) => v && setYear(v)}>
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
            onValueChange={(v) => v && setTerm(v)}
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

        <Field label="Grade">
          <Select
            value={grade?.id ?? "all"}
            onValueChange={(v) => v && setGrade(v)}
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

        <Field label="Stream">
          <Select
            value={stream?.id ?? "all"}
            onValueChange={(v) => v && setStream(v)}
            disabled={!grade}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{stream?.name ?? "All streams"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All streams</SelectItem>
              {grade?.streams.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
