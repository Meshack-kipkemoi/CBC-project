import { useId } from "react";
import { cn } from "@/lib/utils";

export function GeminiLogo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("shrink-0 size-12", className)}
    >
      <defs>
        <linearGradient
          id={`g-${id}`}
          x1="2"
          y1="2"
          x2="22"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="0.55" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>

      <path
        fill={`url(#g-${id})`}
        d="M12 1.5c.5 5.6 4.9 10 10.5 10.5-5.6.5-10 4.9-10.5 10.5C11.5 16.9 7.1 12.5 1.5 12 7.1 11.5 11.5 7.1 12 1.5Z"
      />
    </svg>
  );
}
