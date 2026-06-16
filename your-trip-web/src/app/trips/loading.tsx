import AppShell from "@/components/AppShell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg ${className}`} />;
}

export default function TripsLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 text-center">
              <Skeleton className="h-5 w-5 mx-auto mb-1 rounded" />
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
              <Skeleton className="h-2.5 w-16 mx-auto" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
