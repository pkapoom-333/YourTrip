import AppShell from "@/components/AppShell";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl ${className}`} />;
}

export default function TrendingPlacesLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl opacity-30">🔥</span>
            <Sk className="h-7 w-36" />
          </div>
          <Sk className="h-4 w-56 mt-1 rounded-full" />
        </div>

        {/* Place card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <Sk className="w-full h-32 rounded-none" />
              <div className="p-3 space-y-2">
                <Sk className="h-4 w-3/4" />
                <Sk className="h-3 w-1/2" />
                <div className="flex gap-2 pt-0.5">
                  <Sk className="h-3 w-10 rounded-full" />
                  <Sk className="h-3 w-14 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
