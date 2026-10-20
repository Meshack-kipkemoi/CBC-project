import { StudentsTable } from "@/sections/students/students-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Students",
};

export default function StudentsResults() {
  return (
    <div className="container mx-auto bg-background/50 dark:bg-background/30 px-10 py-10 rounded-xl border">
      <StudentsTable />
    </div>
  );
}
