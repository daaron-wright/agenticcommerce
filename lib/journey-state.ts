"use client";

export type JourneyState =
  | "discovery"
  | "onboarding"
  | "profile_complete"
  | "identity_linked"
  | "consent_requested"
  | "consent_granted"
  | "first_action"
  | "first_campaign"
  | "insight_review"
  | "nba_review"
  | "case_opened"
  | "case_resolved"
  | "audit_review"
  | "optimization"
  | "retention_focus";

const STORAGE_KEY = "cdp_journey_state";

type JourneyStateMap = Record<string, JourneyState>;

const defaultMockState: JourneyStateMap = {
  super_admin: "optimization",
  data_admin: "identity_linked",
  marketing_admin: "first_campaign",
  service_agent: "case_opened",
};

export function getUserJourneyState(userId: string): JourneyState {
  if (typeof window === "undefined") {
    return defaultMockState[userId] ?? "discovery";
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMockState[userId] ?? "discovery";
    const parsed = JSON.parse(raw) as JourneyStateMap;
    return parsed[userId] ?? defaultMockState[userId] ?? "discovery";
  } catch {
    return defaultMockState[userId] ?? "discovery";
  }
}

export function setUserJourneyState(userId: string, state: JourneyState): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as JourneyStateMap) : {};
    parsed[userId] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // no-op for mock storage failures
  }
}
