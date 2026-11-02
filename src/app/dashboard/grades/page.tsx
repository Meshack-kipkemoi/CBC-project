import { Metadata } from "next";
import { GradesPage as Grades } from "@/sections/grades/grades";

export const metadata: Metadata = {
  title: "Grades",
};

export default function GradesPage() {
  return <Grades />;
}
