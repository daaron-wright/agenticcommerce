"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BreadcrumbSegment } from "@/lib/dashboard-ia";

export interface PageBreadcrumbOverride {
  replaceCurrent?: boolean;
  items: BreadcrumbSegment[];
}

interface PageBreadcrumbContextValue {
  override: PageBreadcrumbOverride | null;
  setOverride: (override: PageBreadcrumbOverride | null) => void;
}

const PageBreadcrumbContext = createContext<PageBreadcrumbContextValue | null>(null);

export function PageBreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<PageBreadcrumbOverride | null>(null);

  const value = useMemo(
    () => ({
      override,
      setOverride,
    }),
    [override],
  );

  return <PageBreadcrumbContext.Provider value={value}>{children}</PageBreadcrumbContext.Provider>;
}

export function usePageBreadcrumbState() {
  const context = useContext(PageBreadcrumbContext);
  if (!context) {
    throw new Error("usePageBreadcrumbState must be used within a PageBreadcrumbProvider");
  }

  return context;
}

export function usePageBreadcrumbs(override: PageBreadcrumbOverride | null) {
  const { setOverride } = usePageBreadcrumbState();

  useEffect(() => {
    setOverride(override);

    return () => {
      setOverride(null);
    };
  }, [override, setOverride]);
}
