import AppShell from "@/components/AppShell";

export default function CollectionsLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-gray-100 dark:bg-slate-700 rounded-lg w-32 animate-pulse" />
          <div className="h-9 bg-gray-100 dark:bg-slate-700 rounded-xl w-28 animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-slate-700" />
              <div className="p-3 space-y-2 bg-white dark:bg-slate-800">
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-gray-50 dark:bg-slate-700/60 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
