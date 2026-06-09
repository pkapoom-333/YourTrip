"use client";

import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/** Syncs the `dark` class on <html> with the settings_dark_mode localStorage value. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode] = useLocalStorage("settings_dark_mode", false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return <>{children}</>;
}
