import AppShell from "@/components/AppShell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg ${className}`} />;
}

export default function ExploreLoading() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <Skeleton className="h-10 w-full mb-4 rounded-xl" />
        <div className="flex gap-2 mb-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="p-3 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
                <div className="flex gap-1 pt-0.5">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
