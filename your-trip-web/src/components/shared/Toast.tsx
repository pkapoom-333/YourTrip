"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */
type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

/* ── Context ──────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

/* ── Hook ─────────────────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback — return no-ops when used outside provider
    const noop = () => {};
    return { toast: noop, success: noop, error: noop, info: noop, warning: noop } as ToastContextValue;
  }
  return ctx;
}

/* ── Provider ─────────────────────────────────────────────────── */
const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: "bg-white dark:bg-slate-800", icon: "text-emerald-500", border: "border-emerald-100 dark:border-emerald-800" },
  error:   { bg: "bg-white dark:bg-slate-800", icon: "text-[#FF4F4F]",   border: "border-red-100 dark:border-red-800" },
  info:    { bg: "bg-white dark:bg-slate-800", icon: "text-[#398AB9]",    border: "border-blue-100 dark:border-blue-800" },
  warning: { bg: "bg-white dark:bg-slate-800", icon: "text-amber-500",    border: "border-amber-100 dark:border-amber-800" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timerMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timerMap.current.get(id);
    if (t) { clearTimeout(t); timerMap.current.delete(id); }
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // max 5
    const timer = setTimeout(() => dismiss(id), 3500);
    timerMap.current.set(id, timer);
  }, [dismiss]);

  const ctx: ToastContextValue = {
    toast,
    success: (m) => toast(m, "success"),
    error:   (m) => toast(m, "error"),
    info:    (m) => toast(m, "info"),
    warning: (m) => toast(m, "warning"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container — fixed bottom-center on mobile, bottom-right on desktop */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[9999] flex flex-col gap-2 w-[calc(100vw-2rem)] md:w-80 max-w-sm pointer-events-none"
      >
        {toasts.map((t) => {
          const c = COLORS[t.type];
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 ${c.bg} border ${c.border} rounded-2xl px-4 py-3 shadow-lg shadow-black/5 pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-200`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.icon}`} />
              <p className="text-sm text-gray-800 dark:text-slate-200 flex-1 leading-relaxed">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-gray-300 dark:text-slate-500 hover:text-gray-500 dark:hover:text-slate-300 transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
