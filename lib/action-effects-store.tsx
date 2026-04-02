"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ControlTowerHeroMetric } from "@/lib/control-tower-data";
import {
  CONTROL_TOWER_HERO_METRICS,
  CONTROL_TOWER_ALERTS,
  CONTROL_TOWER_ACTIONS,
  CONTROL_TOWER_SUMMARY,
} from "@/lib/control-tower-data";

// ── State types ──────────────────────────────────────────────────────────────

export type AlertResolutionType = "approved" | "conditional" | "rejected";
export type ApprovalActionType = "approved" | "rejected";

interface ActionEffectsState {
  resolvedAlerts: Record<string, AlertResolutionType>;
  approvedActions: Record<string, ApprovalActionType>;
  reachRedirectActive: boolean;
  demandReorderSubmitted: boolean;
  campaignApplied: boolean;
  appliedRecommendations: Record<string, boolean>;
}

interface AdjustedSummary {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  dataFreshness: string;
  unresolvedAlertCount: number;
  pendingApprovalCount: number;
}

interface ActionEffectsContextValue extends ActionEffectsState {
  resolveAlert: (id: string, type: AlertResolutionType) => void;
  approveAction: (id: string, type: ApprovalActionType) => void;
  activateReachRedirect: () => void;
  submitDemandReorder: () => void;
  applyCampaign: () => void;
  applyRecommendation: (id: string) => void;
  getAdjustedHeroMetrics: () => ControlTowerHeroMetric[];
  getAdjustedSummary: () => AdjustedSummary;
  getAdjustedDemandKpis: () => { forecastAccuracy: number; fillRate: number; pendingActions: number };
  getAdjustedCommercialKpis: () => Record<string, { value: string; adjusted: boolean }>;
  actionCount: number;
}

const ActionEffectsContext = createContext<ActionEffectsContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function ActionEffectsProvider({ children }: { children: React.ReactNode }) {
  const [resolvedAlerts, setResolvedAlerts] = useState<Record<string, AlertResolutionType>>({});
  const [approvedActions, setApprovedActions] = useState<Record<string, ApprovalActionType>>({});
  const [reachRedirectActive, setReachRedirectActive] = useState(false);
  const [demandReorderSubmitted, setDemandReorderSubmitted] = useState(false);
  const [campaignApplied, setCampaignApplied] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Record<string, boolean>>({});

  const resolveAlert = useCallback((id: string, type: AlertResolutionType) => {
    setResolvedAlerts((prev) => ({ ...prev, [id]: type }));
  }, []);

  const approveAction = useCallback((id: string, type: ApprovalActionType) => {
    setApprovedActions((prev) => ({ ...prev, [id]: type }));
  }, []);

  const activateReachRedirect = useCallback(() => setReachRedirectActive(true), []);
  const submitDemandReorder = useCallback(() => setDemandReorderSubmitted(true), []);
  const applyCampaign = useCallback(() => setCampaignApplied(true), []);

  const applyRecommendation = useCallback((id: string) => {
    setAppliedRecommendations((prev) => ({ ...prev, [id]: true }));
  }, []);

  // Count total actions taken for change detection
  const actionCount =
    Object.keys(resolvedAlerts).length +
    Object.keys(approvedActions).length +
    (reachRedirectActive ? 1 : 0) +
    (demandReorderSubmitted ? 1 : 0) +
    (campaignApplied ? 1 : 0) +
    Object.keys(appliedRecommendations).length;

  const getAdjustedHeroMetrics = useCallback((): ControlTowerHeroMetric[] => {
    const metrics = CONTROL_TOWER_HERO_METRICS.map((m) => ({ ...m }));

    // Compute deltas based on actions
    let forecastDelta = 0;
    let alertDelta = 0;
    let approvalDelta = 0;
    let dcInStockDelta = 0;
    let skuRiskDelta = 0;
    let onTimeDeliveryDelta = 0;

    // Alert resolutions
    if (resolvedAlerts["alert-demand-stockout"]) {
      skuRiskDelta -= 15;
      forecastDelta += 4;
    }
    if (resolvedAlerts["alert-coldchain-risk"]) {
      forecastDelta += 2;
    }
    if (resolvedAlerts["alert-lastmile-constraint"]) {
      onTimeDeliveryDelta += 6;
    }
    alertDelta -= Object.keys(resolvedAlerts).length;

    // Action approvals
    if (approvedActions["action-emergency-reorder"] === "approved") {
      skuRiskDelta -= 12;
      dcInStockDelta += 4;
    }
    if (approvedActions["action-coldchain-transport"] === "approved") {
      forecastDelta += 2;
    }
    if (approvedActions["action-demand-surge"] === "approved") {
      forecastDelta += 6;
    }
    if (approvedActions["action-lastmile-reroute"] === "approved") {
      onTimeDeliveryDelta += 5;
    }
    if (approvedActions["action-emergency-supplier"] === "approved") {
      dcInStockDelta += 3;
      skuRiskDelta -= 8;
    }
    approvalDelta -= Object.values(approvedActions).filter((v) => v === "approved" || v === "rejected").length;

    // Panel actions
    if (reachRedirectActive) {
      onTimeDeliveryDelta += 3;
    }
    if (demandReorderSubmitted) {
      skuRiskDelta -= 5;
      approvalDelta -= 1;
    }

    // AI recommendations
    if (appliedRecommendations["rec-suppress-fb"]) {
      forecastDelta += 1;
    }
    if (appliedRecommendations["rec-pdp"]) {
      dcInStockDelta += 1;
    }
    if (appliedRecommendations["rec-inventory"]) {
      dcInStockDelta += 3;
      skuRiskDelta -= 7;
    }

    // Apply deltas
    for (const m of metrics) {
      switch (m.id) {
        case "platform-health": {
          // Forecast Accuracy: base 72.3%
          const newVal = Math.min(92, 72.3 + forecastDelta);
          m.value = `${newVal.toFixed(1)}%`;
          m.detail = forecastDelta > 0 ? `Improved by storm-response actions (+${forecastDelta.toFixed(1)}pp)` : m.detail;
          if (newVal >= 80) m.status = "healthy";
          else if (newVal >= 75) m.status = "attention";
          if (forecastDelta > 0) m.sparkline = [...m.sparkline.slice(1), newVal];
          break;
        }
        case "active-alerts": {
          const base = 12;
          const newVal = Math.max(0, base + alertDelta);
          m.value = `${newVal}`;
          m.detail = alertDelta < 0 ? `${Math.abs(alertDelta)} alert(s) resolved by storm response team` : m.detail;
          if (newVal <= 3) m.status = "healthy";
          else if (newVal <= 6) m.status = "attention";
          if (alertDelta < 0) m.sparkline = [...m.sparkline.slice(1), newVal];
          break;
        }
        case "pending-actions": {
          const base = 8;
          const newVal = Math.max(0, base + approvalDelta);
          m.value = `${newVal}`;
          m.detail = approvalDelta < 0 ? `${Math.abs(approvalDelta)} approval(s) completed` : m.detail;
          if (newVal <= 2) m.status = "healthy";
          else if (newVal <= 5) m.status = "attention";
          if (approvalDelta < 0) m.sparkline = [...m.sparkline.slice(1), newVal];
          break;
        }
        case "udp-readiness": {
          // DC In-Stock Rate: base 84.6%
          const newVal = Math.min(98, 84.6 + dcInStockDelta);
          m.value = `${newVal.toFixed(1)}%`;
          m.detail = dcInStockDelta > 0 ? `Improved by emergency reorder and rebalance (+${dcInStockDelta.toFixed(1)}pp)` : m.detail;
          if (newVal >= 92) m.status = "healthy";
          else if (newVal >= 88) m.status = "attention";
          if (dcInStockDelta > 0) m.sparkline = [...m.sparkline.slice(1), newVal];
          break;
        }
        case "forecast-accuracy": {
          // SKUs at Risk: base 47
          const newVal = Math.max(0, 47 + skuRiskDelta);
          m.value = `${newVal}`;
          m.detail = skuRiskDelta < 0 ? `${Math.abs(skuRiskDelta)} SKUs moved out of risk zone` : m.detail;
          if (newVal <= 10) m.status = "healthy";
          else if (newVal <= 25) m.status = "attention";
          if (skuRiskDelta < 0) m.sparkline = [...m.sparkline.slice(1), newVal];
          break;
        }
        case "activation-readiness": {
          // On-Time Delivery: base 68.2%
          const newVal = Math.min(98, 68.2 + onTimeDeliveryDelta);
          m.value = `${newVal.toFixed(1)}%`;
          m.detail = onTimeDeliveryDelta > 0 ? `Improved by rerouting and redirect (+${onTimeDeliveryDelta.toFixed(1)}pp)` : m.detail;
          if (newVal >= 85) m.status = "healthy";
          else if (newVal >= 75) m.status = "attention";
          if (onTimeDeliveryDelta > 0) m.sparkline = [...m.sparkline.slice(1), newVal];
          break;
        }
      }
    }

    return metrics;
  }, [resolvedAlerts, approvedActions, reachRedirectActive, demandReorderSubmitted, appliedRecommendations]);

  const getAdjustedSummary = useCallback((): AdjustedSummary => {
    const resolvedCount = Object.keys(resolvedAlerts).length;
    const approvedCount = Object.keys(approvedActions).length;

    const totalAlerts = CONTROL_TOWER_SUMMARY.totalAlerts - resolvedCount;
    const criticalResolved = Object.entries(resolvedAlerts).filter(([id]) =>
      CONTROL_TOWER_ALERTS.find((a) => a.id === id && a.severity === "critical")
    ).length;
    const highResolved = Object.entries(resolvedAlerts).filter(([id]) =>
      CONTROL_TOWER_ALERTS.find((a) => a.id === id && a.severity === "high")
    ).length;

    return {
      totalAlerts: Math.max(0, totalAlerts),
      criticalAlerts: Math.max(0, CONTROL_TOWER_SUMMARY.criticalAlerts - criticalResolved),
      highAlerts: Math.max(0, CONTROL_TOWER_SUMMARY.highAlerts - highResolved),
      dataFreshness: actionCount > 0 ? "Updated just now" : CONTROL_TOWER_SUMMARY.dataFreshness,
      unresolvedAlertCount: CONTROL_TOWER_ALERTS.length - resolvedCount,
      pendingApprovalCount: CONTROL_TOWER_ACTIONS.length - approvedCount,
    };
  }, [resolvedAlerts, approvedActions, actionCount]);

  const getAdjustedDemandKpis = useCallback(() => {
    let forecastAccuracy = 72;
    let fillRate = 78;
    let pendingActions = CONTROL_TOWER_ACTIONS.length;

    if (approvedActions["action-demand-surge"] === "approved") forecastAccuracy += 8;
    if (resolvedAlerts["alert-demand-stockout"]) forecastAccuracy += 4;
    if (approvedActions["action-coldchain-transport"] === "approved") forecastAccuracy += 2;

    if (approvedActions["action-emergency-reorder"] === "approved") fillRate += 6;
    if (approvedActions["action-emergency-supplier"] === "approved") fillRate += 4;
    if (appliedRecommendations["rec-pdp"]) fillRate += 2;
    if (appliedRecommendations["rec-inventory"]) fillRate += 3;

    pendingActions -= Object.keys(approvedActions).length;
    if (demandReorderSubmitted) pendingActions -= 1;

    return {
      forecastAccuracy: Math.min(95, forecastAccuracy),
      fillRate: Math.min(98, fillRate),
      pendingActions: Math.max(0, pendingActions),
    };
  }, [approvedActions, resolvedAlerts, appliedRecommendations, demandReorderSubmitted]);

  const getAdjustedCommercialKpis = useCallback(() => {
    const kpis: Record<string, { value: string; adjusted: boolean }> = {};

    // Fill Rate
    let fillRate = 78.4;
    if (approvedActions["action-emergency-reorder"] === "approved") fillRate += 6;
    if (approvedActions["action-emergency-supplier"] === "approved") fillRate += 4;
    if (appliedRecommendations["rec-pdp"]) fillRate += 2;
    fillRate = Math.min(98, fillRate);
    kpis["Fill Rate"] = { value: `${fillRate.toFixed(1)}%`, adjusted: fillRate > 78.4 };

    // On-Time Delivery
    let otd = 68.2;
    if (resolvedAlerts["alert-lastmile-constraint"]) otd += 6;
    if (approvedActions["action-lastmile-reroute"] === "approved") otd += 5;
    if (reachRedirectActive) otd += 3;
    otd = Math.min(98, otd);
    kpis["On-Time Delivery"] = { value: `${otd.toFixed(1)}%`, adjusted: otd > 68.2 };

    // DC In-Stock Rate
    let dcInStock = 84.6;
    if (approvedActions["action-emergency-reorder"] === "approved") dcInStock += 4;
    if (approvedActions["action-emergency-supplier"] === "approved") dcInStock += 3;
    if (appliedRecommendations["rec-inventory"]) dcInStock += 3;
    dcInStock = Math.min(98, dcInStock);
    kpis["DC In-Stock Rate"] = { value: `${dcInStock.toFixed(1)}%`, adjusted: dcInStock > 84.6 };

    // SKUs at Risk
    let skus = 47;
    if (resolvedAlerts["alert-demand-stockout"]) skus -= 15;
    if (approvedActions["action-emergency-reorder"] === "approved") skus -= 12;
    if (approvedActions["action-emergency-supplier"] === "approved") skus -= 8;
    if (demandReorderSubmitted) skus -= 5;
    if (appliedRecommendations["rec-inventory"]) skus -= 7;
    skus = Math.max(0, skus);
    kpis["SKUs at Risk"] = { value: `${skus}`, adjusted: skus < 47 };

    // Revenue at Risk
    let revRisk = 2.4;
    if (resolvedAlerts["alert-demand-stockout"]) revRisk -= 0.8;
    if (approvedActions["action-emergency-reorder"] === "approved") revRisk -= 0.6;
    if (approvedActions["action-emergency-supplier"] === "approved") revRisk -= 0.4;
    if (reachRedirectActive) revRisk -= 0.15;
    if (demandReorderSubmitted) revRisk -= 0.15;
    revRisk = Math.max(0.1, revRisk);
    kpis["Revenue at Risk"] = { value: `$${revRisk.toFixed(1)}M`, adjusted: revRisk < 2.4 };

    return kpis;
  }, [resolvedAlerts, approvedActions, reachRedirectActive, demandReorderSubmitted, appliedRecommendations]);

  const value = useMemo<ActionEffectsContextValue>(
    () => ({
      resolvedAlerts,
      approvedActions,
      reachRedirectActive,
      demandReorderSubmitted,
      campaignApplied,
      appliedRecommendations,
      resolveAlert,
      approveAction,
      activateReachRedirect,
      submitDemandReorder,
      applyCampaign,
      applyRecommendation,
      getAdjustedHeroMetrics,
      getAdjustedSummary,
      getAdjustedDemandKpis,
      getAdjustedCommercialKpis,
      actionCount,
    }),
    [
      resolvedAlerts,
      approvedActions,
      reachRedirectActive,
      demandReorderSubmitted,
      campaignApplied,
      appliedRecommendations,
      resolveAlert,
      approveAction,
      activateReachRedirect,
      submitDemandReorder,
      applyCampaign,
      applyRecommendation,
      getAdjustedHeroMetrics,
      getAdjustedSummary,
      getAdjustedDemandKpis,
      getAdjustedCommercialKpis,
      actionCount,
    ]
  );

  return (
    <ActionEffectsContext.Provider value={value}>
      {children}
    </ActionEffectsContext.Provider>
  );
}

export function useActionEffects() {
  const ctx = useContext(ActionEffectsContext);
  if (!ctx) {
    throw new Error("useActionEffects must be used within an ActionEffectsProvider");
  }
  return ctx;
}
