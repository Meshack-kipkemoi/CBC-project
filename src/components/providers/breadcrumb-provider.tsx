"use client";
import * as React from "react";

type BreadcrumbContext = {
  labels: Record<string, string>;
  setLabel: (href: string, label: string) => void;
  clearLabel: (href: string) => void;
};

const BreadcrumbContext = React.createContext<BreadcrumbContext | null>(null);

export function BreadcrumbProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [labels, setLabels] = React.useState<BreadcrumbContext["labels"]>({});

  const setLabel = React.useCallback((href: string, label: string) => {
    setLabels((prev) =>
      prev[href] === label ? prev : { ...prev, [href]: label },
    );
  }, []);

  const clearLabel = React.useCallback((href: string) => {
    setLabels((prev) => {
      if (!(href in prev)) return prev;
      const { [href]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const value = React.useMemo(
    () => ({ labels, setLabel, clearLabel }),
    [labels, setLabel, clearLabel],
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadCrumb() {
  const ctx = React.useContext(BreadcrumbContext);
  if (!ctx)
    throw new Error("useBreadCrumb must be used inside BreadcrumbProvider");

  return ctx;
}
