"use client";

import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./shared/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
