"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const formatSegment = (segment: string) =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function AppBreadcrumb() {
  const pathname = usePathname(); // e.g., "/dashboard/account/settings"
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "account", "settings"]
  const router = useRouter();
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

            return (
              <React.Fragment key={href}>
                {index !== 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{formatSegment(segment)}</Link>
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
