import AppShell from "@/components/AppShell";

export default function TripDetailLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-52 bg-gray-200 dark:bg-slate-700" />
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full w-full" />
        </div>
        <div className="flex gap-2 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-xl flex-shrink-0" />
          ))}
        </div>
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
