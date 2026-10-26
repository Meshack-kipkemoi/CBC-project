"use client";

import type { ReactNode } from "react";
import {
  Cake,
  CalendarDays,
  Clock,
  GraduationCap,
  History,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useStudentQuery, type StudentProfile } from "@/hooks/use-student";

type Enrollment = StudentProfile["student_enrollments"][number];
type Guardian = StudentProfile["parent_students"][number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// "2026-01-05" or "2026-01-05T08:00:00+00:00" -> "5 Jan 2026"
// (parsed as a local date, so there is no timezone shift)
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );

function ageFrom(dob: string) {
  const [y = 0, m = 1, d = 1] = dob.slice(0, 10).split("-").map(Number);
  const now = new Date();
  const hadBirthday =
    now.getMonth() + 1 > m || (now.getMonth() + 1 === m && now.getDate() >= d);
  return now.getFullYear() - y - (hadBirthday ? 0 : 1);
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const classLabel = (e?: Enrollment) =>
  e?.streams ? `${e.streams.grades?.name ?? "—"} · ${e.streams.name}` : "—";

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-semibold">{value}</p>
          {sub && (
            <p className="truncate text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  icon: Icon,
  title,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 not-last:border-b">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

function GuardianItem({ guardian }: { guardian: Guardian }) {
  const parent = guardian.parent;
  const verified = guardian.verification_status === "verified";

  return (
    <li className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
        {initials(parent?.full_name ?? "?")}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {parent?.full_name ?? "Unknown guardian"}
        </p>
        {parent?.phone ? (
          <a
            href={`tel:${parent.phone}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Phone className="size-3" />
            {parent.phone}
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">No phone number</p>
        )}
      </div>

      <Badge
        variant={verified ? "secondary" : "outline"}
        className="gap-1 capitalize"
      >
        {verified ? (
          <ShieldCheck className="size-3" />
        ) : (
          <Clock className="size-3" />
        )}
        {guardian.verification_status}
      </Badge>
    </li>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export function Profile({ id }: { id: string }) {
  const {
    data: student,
    isPending,
    isError,
    error,
    refetch,
  } = useStudentQuery(id, "profile");

  if (isPending) return <ProfileSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Enrollments arrive newest first, so the last one is where the student joined
  const enrollments = student.student_enrollments;
  const current = enrollments.find((e) => !e.end_date);
  const first = enrollments[enrollments.length - 1];
  const joinedOn = first?.start_date ?? student.created_at;

  // Verified guardians first
  const guardians = [...student.parent_students].sort(
    (a, b) =>
      Number(b.verification_status === "verified") -
      Number(a.verification_status === "verified"),
  );

  const teacher = current?.class_teacher;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="pt-14 bg-transparent shadow-none ring-0">
        <CardContent className="flex flex-col gap-4 sm:flex-row items-center rounded-xl bg-card border-2 dark:border-foreground/50 pt-8 pb-4 sm:py-4">
          <div className="-mt-16 rounded-[calc(var(--radius)*3.5)] p-0.5 bg-linear-to-b from-border dark:from-foreground/50 from-50% to-transparent to-50%">
            <div className=" flex size-14 items-center justify-center rounded-[inherit]  bg-primary text-xl font-semibold text-primary-foreground">
              {initials(student.full_name)}
            </div>
          </div>

          <h1 className="truncate text-xl font-semibold tracking-tight flex-1">
            {student.full_name}&nbsp;
            <span className="text-sm text-muted-foreground">
              ({student.admission_number})
            </span>
          </h1>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={student.status === "active" ? "default" : "secondary"}
              className="capitalize"
            >
              {student.status}
            </Badge>
            <Badge variant="outline">
              {current ? classLabel(current) : "Not currently enrolled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key facts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={GraduationCap}
          label="Current class"
          value={classLabel(current)}
          sub={
            current?.academic_years?.name
              ? `Academic year ${current.academic_years.name}`
              : undefined
          }
        />
        <StatTile
          icon={UserRound}
          label="Class teacher"
          value={teacher?.full_name ?? "Not assigned"}
          sub={teacher?.phone ?? undefined}
        />
        <StatTile
          icon={CalendarDays}
          label="Year joined"
          value={joinedOn.slice(0, 4)}
          sub={
            first?.streams?.grades?.name
              ? `Joined in ${first.streams.grades.name}`
              : undefined
          }
        />
        <StatTile
          icon={Cake}
          label="Age"
          value={
            student.date_of_birth
              ? `${ageFrom(student.date_of_birth)} years`
              : "—"
          }
          sub={
            student.date_of_birth
              ? formatDate(student.date_of_birth)
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {/* Personal details */}
          <Section icon={UserRound} title="Personal details">
            <dl>
              <InfoRow label="Full name">{student.full_name}</InfoRow>
              <InfoRow label="Admission number">
                {student.admission_number}
              </InfoRow>
              <InfoRow label="Date of birth">
                {student.date_of_birth
                  ? formatDate(student.date_of_birth)
                  : "—"}
              </InfoRow>
              <InfoRow label="Admitted on">{formatDate(joinedOn)}</InfoRow>
              <InfoRow label="Status">
                <span className="capitalize">{student.status}</span>
              </InfoRow>
            </dl>
          </Section>

          {/* Enrollment history */}
          <Section icon={History} title="Enrollment history">
            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No enrollment history yet.
              </p>
            ) : (
              <ol className="relative ml-2 space-y-6 border-l pl-6">
                {enrollments.map((enrollment) => {
                  const isCurrent = !enrollment.end_date;

                  return (
                    <li key={enrollment.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-background",
                          isCurrent
                            ? "bg-primary ring-4 ring-primary/20"
                            : "bg-muted-foreground/40",
                        )}
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">
                          {classLabel(enrollment)}
                        </p>
                        {isCurrent && <Badge>Current</Badge>}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {enrollment.academic_years?.name} ·{" "}
                        {formatDate(enrollment.start_date)} –{" "}
                        {enrollment.end_date
                          ? formatDate(enrollment.end_date)
                          : "Present"}
                      </p>

                      {enrollment.class_teacher && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <UserRound className="size-3" />
                          Class teacher: {enrollment.class_teacher.full_name}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
        </div>

        {/* Guardians */}
        <Section
          icon={Users}
          title="Parents & guardians"
          className="self-start lg:col-span-2"
        >
          {guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No parent or guardian is linked to this student.
            </p>
          ) : (
            <ul className="space-y-3">
              {guardians.map((guardian) => (
                <GuardianItem
                  key={guardian.parent?.id ?? guardian.verification_status}
                  guardian={guardian}
                />
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
