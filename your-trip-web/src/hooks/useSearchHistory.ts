"use client";

import { useState, useCallback, useEffect } from "react";

const MAX = 8;

export function useSearchHistory(key: string) {
  const storageKey = `yt_search_${key}`;
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setHistory(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
  }, [storageKey]);

  const add = useCallback((term: string) => {
    if (!term.trim()) return;
    setHistory((prev) => {
      const next = [term, ...prev.filter((t) => t !== term)].slice(0, MAX);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [storageKey]);

  const remove = useCallback((term: string) => {
    setHistory((prev) => {
      const next = prev.filter((t) => t !== term);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [storageKey]);

  const clear = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }, [storageKey]);

  return { history, add, remove, clear };
}
