"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Persist state in localStorage with SSR safety.
 * Uses initialValue for SSR/first render, then syncs from localStorage
 * via useEffect to avoid hydration mismatch (React 19 strict).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Always start with initialValue — avoids SSR vs client mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // After mount, read the real value from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // localStorage unavailable or parse error — keep initialValue
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sync to localStorage on change (skip the very first render value)
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // localStorage full or disabled — silently ignore
    }
  }, [key, storedValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) =>
        typeof value === "function" ? (value as (prev: T) => T)(prev) : value
      );
    },
    []
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
