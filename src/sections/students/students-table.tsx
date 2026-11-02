"use client";
import { useEffect, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentsQuery } from "@/hooks/use-students";
import { features } from "./data-table-features";
import { columns, TableStudent } from "./columns";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PAGE_SIZE } from "@/lib/students/queries";

export function StudentsTable() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  // Debounce typing so we don't fetch on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input.trim());
      setPageIndex(0);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const query = useStudentsQuery(search);
  const pages = query.data?.pages ?? [];
  const page = pages[pageIndex]?.data;

  const hasNext = !!page?.nextCursor || !!pages[pageIndex + 1];

  const data = useMemo<TableStudent[]>(
    () =>
      (page?.rows ?? []).map((row, i) => ({
        ...row,
        rowNumber: pageIndex * PAGE_SIZE + i,
      })),
    [page, pageIndex],
  );

  const table = useTable({
    features,
    columns,
    data,
    manualPagination: true,
    manualFiltering: true,
  });

  const goNext = () => {
    setPageIndex((i) => i + 1);
    if (!pages[pageIndex + 1]) query.fetchNextPage();
  };

  return (
    <div className="space-y-4">
      <InputGroup>
        <InputGroupInput
          placeholder="Search name or admission number..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!page && !query.isError ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {query.isError ? query.error.message : "No students found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 py-4">
        <span className="mr-auto text-sm text-muted-foreground">
          Page {pageIndex + 1} · {PAGE_SIZE} per page
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex((i) => i - 1)}
          disabled={pageIndex === 0}
          className="group/prev-button"
        >
          <ChevronLeft className="group-hover/prev-button:-translate-x-1 transition-all" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={!hasNext || query.isFetchingNextPage}
          className="group/next-button"
        >
          Next
          <ChevronRight className="group-hover/next-button:translate-x-1 transition-all" />
        </Button>
      </div>
    </div>
  );
}
