import { Building2, MapPin } from "lucide-react";

interface SchoolContextBannerProps {
  schoolName?: string | null;
  code?: string | null;
  location?: string | null;
  county?: string | null;
}

export function SchoolContextBanner({
  schoolName,
  code,
  location,
  county,
}: SchoolContextBannerProps) {
  const displaySchool = schoolName || "Configured CBC Institution";
  const displayLocation =
    [location, county].filter(Boolean).join(", ") || "Location Not Set";

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-xs">
      <div className="flex items-center gap-2.5">
        <Building2 className="h-4 w-4 text-emerald-500" />
        <span className="font-semibold text-foreground">{displaySchool}</span>
        {code && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Code: {code}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="h-4 w-4 text-emerald-500" />
        <span>{displayLocation}</span>
      </div>
    </div>
  );
}
