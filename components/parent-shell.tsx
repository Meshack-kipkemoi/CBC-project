"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  BrainCircuit,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/core-competencies",
    label: "Core Competencies",
    icon: BrainCircuit,
  },
  { href: "/interventions", label: "Interventions", icon: ClipboardCheck },
  { href: "/pathway-readiness", label: "Pathway Readiness", icon: Route },
];

export function ParentShell({
  children,
  title,
  eyebrow,
}: {
  children: React.ReactNode;
  title: string;
  eyebrow: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-sidebar px-5 py-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap />
            </span>
            <span>
              <span className="block font-serif text-lg font-bold tracking-tight">
                CBC<span className="text-primary">AI</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Parent portal
              </span>
            </span>
          </Link>
          <button
            className="rounded-lg p-2 text-muted-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <div className="mt-10 flex flex-col gap-2">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Your child&apos;s learning
          </p>
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${pathname === href ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <Icon className="size-[18px]" />
              {label}
            </Link>
          ))}
        </div>
        <div className="mt-auto rounded-2xl bg-accent p-4">
          <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-background text-primary">
            <Sparkles className="size-4" />
          </div>
          <p className="text-sm font-bold">A little goes a long way</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Small, consistent support at home makes a big difference.
          </p>
        </div>
        <button className="mt-5 flex items-center gap-3 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <LogOut className="size-4" />
          Sign out
        </button>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur md:px-10">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-muted-foreground lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">
                {title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
            </button>
            <div className="hidden items-center gap-2 rounded-xl border border-border py-1.5 pl-2 pr-3 sm:flex">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
                <UserRound className="size-4" />
              </span>
              <span className="text-left">
                <span className="block text-xs font-bold">Mary Wanjiku</span>
                <span className="block text-[10px] text-muted-foreground">
                  Parent account
                </span>
              </span>
              <ChevronDown className="ml-1 size-3.5 text-muted-foreground" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="size-[18px]" />
      </span>
      <div>
        <h2 className="font-serif text-xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export const subjectData = [
  { name: "Mathematics", score: 78, change: 8, color: "bg-primary" },
  { name: "English", score: 84, change: 4, color: "bg-chart-2" },
  { name: "Integrated Science", score: 72, change: 12, color: "bg-chart-3" },
  { name: "Kiswahili", score: 88, change: 3, color: "bg-chart-4" },
  { name: "Social Studies", score: 81, change: 6, color: "bg-chart-5" },
  { name: "Creative Arts & Sports", score: 91, change: 5, color: "bg-primary" },
];

export function TrendChart() {
  return (
    <div className="relative h-64 w-full overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-muted-foreground">
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>
      <div className="absolute inset-y-2 left-9 right-0 flex flex-col justify-between">
        <i className="border-t border-dashed border-border" />
        <i className="border-t border-dashed border-border" />
        <i className="border-t border-dashed border-border" />
        <i className="border-t border-dashed border-border" />
        <i className="border-t border-border" />
      </div>
      <svg
        className="absolute inset-y-2 left-9 right-0 h-[calc(100%-8px)] w-[calc(100%-36px)]"
        viewBox="0 0 600 220"
        preserveAspectRatio="none"
        aria-label="Progress trend chart"
      >
        <path
          d="M0 155 C50 150 65 132 110 138 S170 124 210 130 S270 100 315 110 S370 88 420 92 S475 70 520 76 S565 45 600 50"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M0 180 C50 174 70 165 110 170 S170 156 210 162 S270 143 315 150 S370 130 420 138 S475 118 520 126 S565 102 600 108"
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth="3"
          strokeDasharray="7 8"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute bottom-0 left-9 right-0 flex justify-between text-[10px] font-medium text-muted-foreground">
        <span>Term 1</span>
        <span>Term 2</span>
        <span>Term 3</span>
        <span>Current</span>
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  color = "bg-primary",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_oklch(0.2_0.02_160/0.04)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-4 font-serif text-3xl font-bold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function PageLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export { BookOpenCheck };
