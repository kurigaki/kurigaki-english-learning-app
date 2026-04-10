"use client";

import { useEffect, useState } from "react";
import type { ContentFlag } from "@/data/words/types";

const STORAGE_KEY = "content_filter_enabled";
const CHANGE_EVENT = "content-filter-change";

export function getContentFilterEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setContentFilterEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function filterSensitiveWords<T extends { contentFlags?: ContentFlag[] }>(
  words: T[],
  enabled: boolean,
): T[] {
  if (!enabled) return words;
  return words.filter((w) => !w.contentFlags || w.contentFlags.length === 0);
}

export function useContentFilterEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(getContentFilterEnabled());
    const handler = () => setEnabled(getContentFilterEnabled());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return enabled;
}
