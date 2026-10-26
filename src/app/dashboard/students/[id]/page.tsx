import { BreadcrumbLabel } from "@/layouts/app-breadcrumb";
import { getStudent } from "@/lib/queries/student/profile";
import { Content, getSlug, tabs } from "@/sections/students/id/content";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudent(id);
  return {
    title: student?.full_name ?? "Student",
  };
}

export default async function StudentPage({ params, searchParams }: Params) {
  const [{ id }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const student = await getStudent(id);
  if (!student) notFound();

  const validSlugs = tabs.map((t) => getSlug(t.title));
  const defaultSlug = validSlugs[0];

  const rawTab = resolvedSearchParams.tab;
  const requestedTab = typeof rawTab === "string" ? rawTab : undefined;

  const activeTab =
    requestedTab && validSlugs.includes(requestedTab)
      ? requestedTab
      : defaultSlug;

  return (
    <>
      <BreadcrumbLabel label={student.full_name} />
      <Content id={id} defaultTab={activeTab} />
    </>
  );
}
