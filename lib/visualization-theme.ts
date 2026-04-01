import type { CSSProperties } from "react";

export const visualizationPalette = {
  ink: "#3d3c3c",
  slate: "#6d6d6d",
  steel: "#898888",
  mist: "#a8a5a6",
  cloud: "#dcdad8",
  grid: "#f0eeec",
  axis: "#6d6d6d",
  cursor: "#dcdad8",
  teal: "#29707a",
  mint: "#8ecfd9",
  coral: "#ff6b57",
  sand: "#d6b37a",
  sky: "#3797a4",
  success: "#00af41",
  warning: "#f59e0b",
  danger: "#ff462d",
  fillStrong: "rgba(41, 112, 122, 0.14)",
  fillMuted: "rgba(61, 60, 60, 0.08)",
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
  "rounded-2xl border-stone-200 bg-white shadow-none";

export const visualizationChartFrameClass =
  "rounded-xl border border-stone-100 bg-stone-50/60 p-3";
