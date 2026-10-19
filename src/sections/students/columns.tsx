"use client";
import { createColumnHelper } from "@tanstack/react-table";
import { type DataTableFeatures } from "./data-table-features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { StudentRow } from "@/lib/queries/students";

export type TableStudent = StudentRow & { rowNumber: number };

const columnHelper = createColumnHelper<DataTableFeatures, TableStudent>();

const getStudentStream = (s: StudentRow) => {
  return s.student_enrollments.find((e) => !e.end_date)?.streams;
};

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "rowNumber",
    header: "#",
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {row.original.rowNumber + 1}.
      </span>
    ),
  }),

  columnHelper.accessor("full_name", { header: "Name" }),
  columnHelper.accessor("admission_number", { header: "Admission No." }),
  columnHelper.accessor((row) => getStudentStream(row)?.grades?.name, {
    id: "grade",
    header: "Grade",
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  columnHelper.accessor((row) => getStudentStream(row)?.name, {
    id: "class",
    header: "Class",
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "secondary"}
        className="capitalize"
      >
        {row.original.status}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button asChild variant={"outline"} size="sm" className="group/button">
          <Link href={`/dashboard/students/${row.original.id}`}>
            Details
            <ChevronRight className="group-hover/button:translate-x-0.5 transition-all" />
          </Link>
        </Button>
      </div>
    ),
  }),
]);
