import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  GraduationCap,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-fade-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const BANDS = [
  {
    code: "EE",
    label: "Exceeding Expectation",
    range: "80% +",
    color: "bg-emerald-500",
  },
  {
    code: "ME",
    label: "Meeting Expectation",
    range: "60–79%",
    color: "bg-blue-500",
  },
  {
    code: "AE",
    label: "Approaching Expectation",
    range: "40–59%",
    color: "bg-amber-500",
  },
  {
    code: "BE",
    label: "Below Expectation",
    range: "Below 40%",
    color: "bg-red-500",
  },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Performance dashboards",
    description:
      "See averages, grade distributions, and strongest and weakest learning areas at a glance — for the whole school, a grade, or a stream.",
  },
  {
    icon: LineChart,
    title: "Term-by-term trends",
    description:
      "Track how performance moves across the year so you can spot improvement or decline before it becomes a problem.",
  },
  {
    icon: GraduationCap,
    title: "CBC band grading",
    description:
      "Results are mapped to the CBC scale — EE, ME, AE, BE — so every score is instantly meaningful to teachers, parents, and principals.",
  },
  {
    icon: Users,
    title: "Every stakeholder, covered",
    description:
      "Principals see the big picture, teachers see their classes, and parents follow their own child's progress from one place.",
  },
  {
    icon: CalendarClock,
    title: "Attendance alongside results",
    description:
      "Roll-call records sit next to academic performance, making it easy to correlate absence with slipping grades.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Role-based access and row-level security mean everyone sees exactly the data they're meant to — nothing more.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Sign in",
    description:
      "Teachers, principals, and parents log in with their own secure accounts.",
  },
  {
    step: "02",
    title: "Pick your view",
    description:
      "Switch between school-wide, grade, stream, or individual student results.",
  },
  {
    step: "03",
    title: "Act on insights",
    description:
      "Celebrate top performers and step in early for learners who need support.",
  },
];

const STATS = [
  { value: "3", label: "Grade levels" },
  { value: "12", label: "Streams tracked" },
  { value: "11", label: "Learning areas" },
  { value: "100%", label: "Results in one place" },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ------------------------------ Nav ------------------------------ */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Logo />
            </span>
            <span className="text-lg tracking-tight">CBC AI</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#grading"
              className="transition-colors hover:text-foreground"
            >
              Grading
            </a>
          </nav>

          <Button asChild size="sm">
            <Link href="/auth/login">
              Sign in
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden">
        {/* Subtle grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28">
          <FadeIn>
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              The CBC-ready results platform for your school
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <h1 className="mx-auto mt-6 max-w-3xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Every student's results,{" "}
              <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                beautifully clear.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={160}>
            <p className="mx-auto mt-5 max-w-2xl text-center text-base text-muted-foreground sm:text-lg">
              One place for principals, teachers, and parents to view academic
              performance — band-graded, trended across terms, and broken down
              by grade, stream, and learning area.
            </p>
          </FadeIn>

          <FadeIn delay={240}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/login">
                  Sign in to view results
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <a href="#features">Explore features</a>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={320}>
            <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-3xl font-bold tabular-nums tracking-tight">
                    {stat.value}
                  </dd>
                  <dd className="mt-1 text-xs text-muted-foreground">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>
      </section>

      {/* ---------------------------- Features ---------------------------- */}
      <section id="features" className="border-t bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Built for how schools actually work
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Not just a marks list — a live picture of performance across the
              whole school.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 60}>
                <div className="group h-full rounded-2xl border bg-background p-6 transition-shadow hover:shadow-md">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- How it works -------------------------- */}
      <section id="how-it-works" className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              From login to insight in seconds
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <FadeIn key={step.step} delay={i * 100}>
                <div className="relative">
                  <span className="text-5xl font-bold tracking-tight text-primary/15">
                    {step.step}
                  </span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Grading ---------------------------- */}
      <section id="grading" className="border-t bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <FadeIn>
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Scores that mean something
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Raw percentages are hard to act on. Every result is converted
                  into the Competency-Based Curriculum bands, so a single glance
                  tells you whether a learner is exceeding, meeting,
                  approaching, or falling below expectation — in every subject,
                  every term.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/auth/login">
                    See it live
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={120}>
              <ul className="space-y-3">
                {BANDS.map((band) => (
                  <li
                    key={band.code}
                    className="flex items-center gap-4 rounded-2xl border bg-background p-4"
                  >
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white",
                        band.color,
                      )}
                    >
                      {band.code}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{band.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {band.range}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------- */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] opacity-10"
              />
              <TrendingUp className="mx-auto size-10 opacity-80" />
              <h2 className="relative mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to see how your learners are doing?
              </h2>
              <p className="relative mx-auto mt-3 max-w-md text-primary-foreground/80">
                Sign in to explore this year's results, trends, and grade
                distributions.
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="relative mt-8"
              >
                <Link href="/auth/login">
                  Sign in
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ------------------------------ Footer ------------------------------ */}
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Logo className="size-4" />
            <span>CBC AI</span>
          </div>
          <p>© {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
