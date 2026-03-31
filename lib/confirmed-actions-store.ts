"use client";

import type { NBAActionId } from "@/components/cdp/chat/chat-data";

const CONFIRMED_ACTIONS_KEY = "omnis_confirmed_actions";

export interface ConfirmedActionRecord {
  id: string;
  title: string;
  action: string;
  segment: string;
  confidence: number;
  expectedLift: string;
  requestedBy: string;
  requestedAt: string;
  approvedAt: string;
  actionId: NBAActionId;
  events: string[];
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readStore(): ConfirmedActionRecord[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(CONFIRMED_ACTIONS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is ConfirmedActionRecord => {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        Array.isArray(item.events)
      );
    });
  } catch {
    return [];
  }
}

function writeStore(records: ConfirmedActionRecord[]) {
  if (!isBrowser()) return;
  localStorage.setItem(CONFIRMED_ACTIONS_KEY, JSON.stringify(records));
}

export function getConfirmedActions(): ConfirmedActionRecord[] {
  return readStore().sort(
    (a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime()
  );
}

export function addConfirmedAction(record: ConfirmedActionRecord): void {
  const current = readStore();
  const next = [record, ...current.filter((item) => item.id !== record.id)];
  writeStore(next);
}

export function clearConfirmedActions(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(CONFIRMED_ACTIONS_KEY);
}
