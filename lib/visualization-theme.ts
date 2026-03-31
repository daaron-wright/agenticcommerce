import type { CSSProperties } from "react";

export const visualizationPalette = {
  ink: "#1f2937",
  slate: "#475569",
  steel: "#64748b",
  mist: "#94a3b8",
  cloud: "#cbd5e1",
  grid: "#e2e8f0",
  axis: "#64748b",
  cursor: "#cbd5e1",
  teal: "#3f7f89",
  mint: "#92c6c0",
  coral: "#f28c82",
  sand: "#d6b37a",
  sky: "#8a9bcf",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
  fillStrong: "rgba(63, 127, 137, 0.14)",
  fillMuted: "rgba(148, 163, 184, 0.16)",
} as const;

export const visualizationTick = {
  fontSize: 10,
  fill: visualizationPalette.axis,
} as const;

export const visualizationSmallTick = {
  fontSize: 9,
  fill: visualizationPalette.axis,
} as const;

export const visualizationGrid = {
  stroke: visualizationPalette.grid,
  strokeDasharray: "3 3",
} as const;

export const visualizationLegendStyle = {
  fontSize: 11,
  paddingTop: 8,
  color: visualizationPalette.axis,
} as const;

export const visualizationTooltipStyle: CSSProperties = {
  borderRadius: "14px",
  border: `1px solid ${visualizationPalette.grid}`,
  backgroundColor: "#ffffff",
  boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
  fontSize: 11,
  color: visualizationPalette.ink,
};

export const visualizationCardClass =
  "rounded-2xl border-slate-200 bg-white shadow-none";

export const visualizationChartFrameClass =
  "rounded-xl border border-slate-100 bg-slate-50/60 p-3";
