import { StudentsTable } from "@/sections/students/students-table";

export default function StudentsPage() {
  return (
    <div className="container mx-auto bg-background/50 dark:bg-background/30 px-10 py-10 rounded-xl border">
      <StudentsTable />
    </div>
  );
}
