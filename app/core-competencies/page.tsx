"use client";

import {
  BrainCircuit,
  CheckCircle2,
  Circle,
  Info,
  Lightbulb,
  Star,
} from "lucide-react";
import {
  ParentShell,
  ProgressBar,
  SectionHeading,
} from "@/components/parent-shell";
const competencies = [
  {
    title: "Communication & collaboration",
    description: "Expresses ideas clearly and works well with others.",
    value: 86,
    level: "Exceeding expectations",
    items: [
      "Listening and responding",
      "Team participation",
      "Presenting ideas",
    ],
  },
  {
    title: "Critical thinking & problem solving",
    description: "Uses evidence and reasoning to solve new problems.",
    value: 74,
    level: "Meeting expectations",
    items: [
      "Analysing information",
      "Making connections",
      "Applying solutions",
    ],
  },
  {
    title: "Self-efficacy & resilience",
    description:
      "Manages learning, reflects, and keeps trying through challenges.",
    value: 82,
    level: "Meeting expectations",
    items: ["Goal setting", "Self-reflection", "Perseverance"],
  },
  {
    title: "Creativity & imagination",
    description: "Explores ideas and creates original work.",
    value: 91,
    level: "Exceeding expectations",
    items: ["Generating ideas", "Creative expression", "Experimenting"],
  },
];
export default function CoreCompetenciesPage() {
  return (
    <ParentShell eyebrow="Learning profile" title="Core competencies">
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold">
                  <BrainCircuit className="size-3.5" /> CBC learning profile
                </span>
                <h2 className="mt-6 max-w-md font-serif text-3xl font-bold tracking-tight md:text-4xl">
                  Learning is more than a score.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/75">
                  These competencies show the skills Amani is building to thrive
                  in school, work, and life.
                </p>
              </div>
              <Star className="hidden size-10 text-primary-foreground/40 md:block" />
            </div>
            <div className="mt-8 flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">
                  4.2
                  <span className="text-lg font-normal text-primary-foreground/60">
                    {" "}
                    / 5
                  </span>
                </p>
                <p className="mt-1 text-xs text-primary-foreground/70">
                  Overall competency level
                </p>
              </div>
              <div className="w-40">
                <ProgressBar value={84} color="bg-primary-foreground" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <SectionHeading
              icon={Lightbulb}
              title="Amani's strength"
              description="An insight from recent activities"
            />
            <div className="rounded-xl bg-accent p-4">
              <p className="text-sm font-bold">A natural collaborator</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Amani often helps classmates understand new ideas and
                contributes thoughtful perspectives during group work.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Info className="size-4 text-primary" /> Based on 14 recent
              observations
            </div>
          </div>
        </div>
        <section>
          <div className="mb-5">
            <SectionHeading
              icon={BrainCircuit}
              title="Competency areas"
              description="Track the skills behind Amani's academic progress"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {competencies.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.value >= 85 ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {item.level}
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <ProgressBar value={item.value} />
                  <span className="text-sm font-bold">{item.value}%</span>
                </div>
                <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
                  {item.items.map((sub, i) => (
                    <div
                      key={sub}
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
                    >
                      {i < 2 ? (
                        <CheckCircle2 className="size-4 text-primary" />
                      ) : (
                        <Circle className="size-4" />
                      )}
                      {sub}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </ParentShell>
  );
}
