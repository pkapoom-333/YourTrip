import AppShell from "@/components/AppShell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg ${className}`} />;
}

export default function BuddyLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="border-b border-gray-100 dark:border-slate-700 px-4 py-4">
          <Skeleton className="h-7 w-40 mb-1" />
          <Skeleton className="h-3 w-48 mb-3" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="px-4 py-4 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="grid grid-cols-2">
                <Skeleton className="aspect-square rounded-none" />
                <Skeleton className="aspect-square rounded-none" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-12 rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="flex-1 h-12 rounded-2xl" />
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
