import { AcademicAverageChart } from "@/sections/dashboard/academic-average-chart";
import { Filters } from "@/sections/dashboard/filters";
import { StatCards } from "@/sections/dashboard/stat-cards";
import { TotalLearnersChart } from "@/sections/dashboard/total-learners-chart";

export default function Dashboard() {
  return (
    <>
      <Filters />
      <StatCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TotalLearnersChart />
        <AcademicAverageChart />
      </div>
    </>
  );
}
