"use client";

import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  ParentShell,
  PageLink,
  ProgressBar,
  SectionHeading,
  StatCard,
  subjectData,
  TrendChart,
} from "@/components/parent-shell";

export default function DashboardPage() {
  return (
    <ParentShell eyebrow="Monday, 12 August 2024" title="Good morning, Mary">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-muted-foreground">
              Here&apos;s how Amani is doing this term.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent font-serif text-lg font-bold text-primary">
                AW
              </span>
              <div>
                <p className="font-bold">Amani Wanjiku</p>
                <p className="text-xs text-muted-foreground">
                  Grade 8 · Term 2, 2024
                </p>
              </div>
              <button
                className="rounded-lg p-1 text-muted-foreground"
                aria-label="Change child"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <CalendarDays className="size-4 text-primary" />
            <span className="font-semibold">Term 2, 2024</span>
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Overall progress"
            value="82%"
            detail="↑ 7% since last term"
            icon={TrendingUp}
          />
          <StatCard
            label="Competencies mastered"
            value="18 / 24"
            detail="On track for this term"
            icon={Target}
          />
          <StatCard
            label="Learning streak"
            value="12 days"
            detail="Keep the momentum going"
            icon={BookOpen}
          />
          <StatCard
            label="Next check-in"
            value="24 Aug"
            detail="Mathematics · Algebra"
            icon={CheckCircle2}
          />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-start justify-between">
              <SectionHeading
                icon={TrendingUp}
                title="Progress over time"
                description="Amani's average performance across all subjects"
              />
              <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-primary">
                +7% this term
              </span>
            </div>
            <TrendChart />
            <div className="mt-4 flex gap-5 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full bg-primary" />
                Current progress
              </span>
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full bg-chart-2" />
                Previous term
              </span>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-start justify-between">
              <SectionHeading
                icon={Target}
                title="This term's focus"
                description="Recommended by CBC AI"
              />
              <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                AI INSIGHT
              </span>
            </div>
            <div className="rounded-xl bg-accent p-4">
              <p className="text-sm font-bold">Build confidence in Algebra</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Amani is making great progress. Two focused practice sessions
                per week can help close the remaining gap.
              </p>
              <PageLink href="/interventions">View recommendations</PageLink>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Mathematics</span>
                <span className="font-bold">78%</span>
              </div>
              <ProgressBar value={78} />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Integrated Science</span>
                <span className="font-bold">72%</span>
              </div>
              <ProgressBar value={72} color="bg-chart-2" />
            </div>
          </section>
        </div>
        <section>
          <div className="flex items-end justify-between">
            <SectionHeading
              icon={BookOpen}
              title="Subject performance"
              description="See how Amani is progressing across the CBC curriculum"
            />
            <PageLink href="/core-competencies">View competencies</PageLink>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjectData.map((subject) => (
              <div
                key={subject.name}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{subject.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Current average
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-bold text-primary">
                    <ArrowUpRight className="size-3" />
                    {subject.change}%
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={subject.score} color={subject.color} />
                  <span className="text-sm font-bold">{subject.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ParentShell>
  );
}
