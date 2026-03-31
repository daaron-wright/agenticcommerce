"use client";

const CHAT_HISTORY_KEYS = ["kyn-chat-history", "omnis-chat-history"];
const PERSONA_PREFIXES = ["kyn-chat-persona", "omnis-chat-persona"];
const LOCAL_UI_KEYS = ["kyn_completed_dags", "omnis_completed_dags"];

function removeSessionKey(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function removeLocalKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function clearSessionStorageByPrefix(prefix: string) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      if (key === prefix || key.startsWith(`${prefix}:`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
}

export function clearClientCookies() {
  if (typeof document === "undefined") return;

  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [rawName] = cookie.split("=");
    const name = rawName?.trim();
    if (!name) continue;

    document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

export async function clearClientCaches() {
  if (typeof window === "undefined") return;
  if (!("caches" in window)) return;

  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch {
    // ignore
  }
}

export function clearClientSessionStorage() {
  CHAT_HISTORY_KEYS.forEach((key) => {
    removeSessionKey(key);
    clearSessionStorageByPrefix(key);
  });

  PERSONA_PREFIXES.forEach((prefix) => {
    clearSessionStorageByPrefix(prefix);
  });
}

export function clearClientUiLocalStorage() {
  LOCAL_UI_KEYS.forEach(removeLocalKey);
}

export function clearClientSessionState() {
  clearClientSessionStorage();
  clearClientUiLocalStorage();
  clearClientCookies();
}
