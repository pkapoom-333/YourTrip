import AppShell from "@/components/AppShell";
import { ShieldCheck } from "lucide-react";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl ${className}`} />;
}

export default function AdminGuidesLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#398AB9]/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#398AB9]/40" />
          </div>
          <div className="space-y-1.5">
            <Sk className="h-6 w-36" />
            <Sk className="h-4 w-28" />
          </div>
        </div>

        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <Sk className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Sk className="h-4 w-40" />
                  <Sk className="h-3 w-28" />
                </div>
                <div className="flex gap-2">
                  <Sk className="h-8 w-20 rounded-xl" />
                  <Sk className="h-8 w-20 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
