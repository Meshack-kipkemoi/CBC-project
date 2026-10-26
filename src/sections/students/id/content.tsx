import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Brain, Compass, User, type LucideIcon } from "lucide-react";
import { Profile } from "./profile";
import { SubjectPerformance } from "./subject-performance";
import { CoreCompetencies } from "./core-competencies";
import { PathwayReadiness } from "./pathway-readiness";
import Link from "next/link";

type TabItem = {
  title: string;
  description: string;
  content: ({ id }: { id: string }) => React.JSX.Element;
  icon: LucideIcon;
};

export const tabs: TabItem[] = [
  {
    title: "Profile",
    description: "Personal details and learner overview",
    content: Profile,
    icon: User,
  },
  {
    title: "Subject Performance",
    description: "How you are doing across each subject",
    content: SubjectPerformance,
    icon: BarChart3,
  },
  {
    title: "Core Competencies",
    description: "Skills and strengths developed over time",
    content: CoreCompetencies,
    icon: Brain,
  },
  {
    title: "Pathway readiness",
    description: "How prepared you are for the next step",
    content: PathwayReadiness,
    icon: Compass,
  },
];

export const getSlug = (title: string) =>
  title.toLowerCase().replace(/\s+/g, "-");

export function Content({
  id,
  defaultTab,
}: {
  id: string;
  defaultTab: string;
}) {
  return (
    <Tabs defaultValue={defaultTab} className="gap-4">
      <TabsList className="group-data-horizontal/tabs:h-auto gap-1 overflow-x-auto p-1.5 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full lg:w-fit">
        {tabs.map(({ title, icon: Icon, description }) => {
          const val = getSlug(title);
          return (
            <TabsTrigger
              key={val}
              value={val}
              className="h-auto flex-none gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 hover:bg-background/60 data-active:text-primary data-active:shadow-md data-active:ring-1 data-active:ring-primary/15 sm:flex-1"
              title={description}
              asChild
            >
              <Link href={`?tab=${val}`} scroll={false}>
                <Icon className="size-4 transition-transform duration-200 group-hover/tabs-list:scale-105" />
                <span>{title}</span>
              </Link>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map(({ title, content: Content }) => {
        const val = getSlug(title);
        return (
          <TabsContent
            key={val}
            value={val}
            className="relative animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {<Content id={id} />}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
