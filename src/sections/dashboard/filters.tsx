"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const academicYears = ["2024", "2025", "2026"];

const terms = ["Term 1", "Term 2", "Term 3"];

const grades = ["Grade 7", "Grade 8", "Grade 9"];

const streamsByGrade: Record<string, string[]> = {
  "Grade 7": ["Stream A", "Stream B", "Stream C"],
  "Grade 8": ["Stream A", "Stream B", "Stream C"],
  "Grade 9": ["Stream A", "Stream B", "Stream C"],
};

export function Filters() {
  const [academicYear, setAcademicYear] = React.useState("2026");
  const [term, setTerm] = React.useState("Term 1");
  const [grade, setGrade] = React.useState("all");
  const [stream, setStream] = React.useState("all");

  const streams = grade === "all" ? [] : (streamsByGrade[grade] ?? []);

  function handleGradeChange(value: string) {
    setGrade(value);
    setStream("all");
  }

  return (
    <ScrollArea>
      <div className="flex flex-nowrap gap-4">
        <div className="flex gap-1.5 items-center flex-1">
          <label className="text-sm font-medium">Year</label>
          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1.5 items-center flex-1">
          <label className="text-sm font-medium">Term</label>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1.5 items-center flex-1">
          <label className="text-sm font-medium">Grade</label>
          <Select value={grade} onValueChange={handleGradeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All grades</SelectItem>
              {grades.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1.5 items-center flex-1">
          <label className="text-sm font-medium">Stream</label>
          <Select
            value={stream}
            onValueChange={setStream}
            disabled={grade === "all"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All streams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All streams</SelectItem>
              {streams.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
