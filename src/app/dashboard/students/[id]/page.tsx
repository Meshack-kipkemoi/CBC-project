import { BreadcrumbLabel } from "@/layouts/app-breadcrumb";
import { getStudent } from "@/lib/queries/student";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudent(id);
  return {
    title: student?.full_name ?? "Student",
  };
}

export default async function StudentPage({ params }: Params) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  return (
    <>
      <BreadcrumbLabel label={student.full_name} />
      <div>Individual student page</div>
    </>
  );
}
