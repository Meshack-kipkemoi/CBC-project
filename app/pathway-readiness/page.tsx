"use client";

import {
  ArrowUpRight,
  Compass,
  Heart,
  Lightbulb,
  Map,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  ParentShell,
  ProgressBar,
  SectionHeading,
} from "@/components/parent-shell";
const pathways = [
  {
    name: "STEM & Innovation",
    icon: Wrench,
    fit: 86,
    copy: "Strong alignment with problem solving, science, and mathematical reasoning.",
    color: "bg-primary",
  },
  {
    name: "Arts & Sports Science",
    icon: Heart,
    fit: 74,
    copy: "Creative expression and collaboration are emerging strengths.",
    color: "bg-chart-2",
  },
  {
    name: "Social Sciences & Humanities",
    icon: Compass,
    fit: 79,
    copy: "Communication and curiosity create a solid foundation here.",
    color: "bg-chart-3",
  },
];
export default function PathwayReadinessPage() {
  return (
    <ParentShell eyebrow="Looking ahead" title="Pathway readiness">
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground md:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold">
              <Map className="size-3.5" /> Senior school pathways
            </span>
            <h2 className="mt-6 max-w-lg font-serif text-3xl font-bold tracking-tight md:text-4xl">
              A direction, not a decision.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              Amani&apos;s current learning profile points to a few exciting
              possibilities. Keep exploring — readiness grows over time.
            </p>
            <div className="mt-8 flex items-center gap-8">
              <div>
                <p className="text-4xl font-bold">81%</p>
                <p className="mt-1 text-xs text-primary-foreground/70">
                  Readiness snapshot
                </p>
              </div>
              <div className="h-10 w-px bg-primary-foreground/20" />
              <div>
                <p className="text-sm font-bold">Grade 8</p>
                <p className="mt-1 text-xs text-primary-foreground/70">
                  Early exploration stage
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <SectionHeading
              icon={Lightbulb}
              title="What this means"
              description="A note for you as a parent"
            />
            <p className="text-sm leading-6 text-muted-foreground">
              Pathway readiness combines performance, competency growth, and
              interests. It is not a fixed prediction — it is a helpful starting
              point for conversations.
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-accent p-3 text-sm font-semibold">
              <ShieldCheck className="size-5 text-primary" /> Keep building a
              broad foundation
            </div>
          </div>
        </div>
        <section>
          <SectionHeading
            icon={Compass}
            title="Emerging pathways"
            description="Based on Amani's current profile and learning evidence"
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {pathways.map(({ name, icon: Icon, fit, copy, color }) => (
              <article
                key={name}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-primary">
                    <ArrowUpRight className="size-4" />
                    {fit}% fit
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-xl font-bold">{name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-5 text-muted-foreground">
                  {copy}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <ProgressBar value={fit} color={color} />
                  <span className="text-xs font-bold">{fit}%</span>
                </div>
                <button className="mt-5 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-bold hover:bg-accent">
                  Explore pathway
                </button>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6">
          <SectionHeading
            icon={Heart}
            title="Keep the conversation going"
            description="Simple ways to support Amani's discovery"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold">Ask open questions</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                What did you enjoy learning this week?
              </p>
            </div>
            <div>
              <p className="text-sm font-bold">Notice strengths</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Celebrate effort, curiosity, and progress.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold">Try something new</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Connect classroom skills to real life.
              </p>
            </div>
          </div>
        </section>
      </div>
    </ParentShell>
  );
}
