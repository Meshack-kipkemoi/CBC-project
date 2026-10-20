"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useBreadCrumb } from "@/components/providers/breadcrumb-provider";
import { Skeleton } from "@/components/ui/skeleton";

const formatSegment = (segment: string) =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function BreadcrumbLabel({
  href,
  label,
}: {
  href?: string;
  label: string;
}) {
  const pathname = usePathname();
  const target = href ?? pathname;
  const { setLabel, clearLabel } = useBreadCrumb();

  React.useEffect(() => {
    setLabel(target, label);

    return () => clearLabel(target);
  }, [target, label, setLabel, clearLabel]);

  return null;
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "account", "settings"]
  const router = useRouter();
  const { labels } = useBreadCrumb();

  if (segments[0] === "dashboard" && segments.length === 1) return null;
  return (
    <div className="flex items-center gap-4">
      {segments.length > 1 && (
        <Button
          variant={"outline"}
          className="cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      )}
      <Breadcrumb>
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;

            const label = labels[href];
            const content =
              label ??
              (UUID.test(segment) ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                formatSegment(segment)
              ));

            return (
              <React.Fragment key={href}>
                {index !== 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{content}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{formatSegment(content)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
