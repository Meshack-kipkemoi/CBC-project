import * as React from "react"

import { cn } from "@/lib/utils"

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export const Logo = React.forwardRef<SVGSVGElement, LogoProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M4.95455 22H2L10.5455 2H13.4545L22 22H19.0455L12.0909 5.16406H11.9091L4.95455 22Z" />
      <path d="M14 14C14 15.1046 13.1046 16 12 16C10.8954 16 10 15.1046 10 14C10 12.8954 10.8954 12 12 12C13.1046 12 14 12.8954 14 14Z" />
    </svg>
  )
)

Logo.displayName = "LogoIcon"
