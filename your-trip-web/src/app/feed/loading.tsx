import AppShell from "@/components/AppShell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg ${className}`} />;
}

function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 md:rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="h-2.5 w-16" />
      </div>
      <div className="px-4 pb-2 space-y-1.5">
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="px-4 py-3 flex items-center gap-5">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="px-4 pb-3 space-y-1">
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-3/4" />
      </div>
    </div>
  );
}

export default function FeedLoading() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-0 md:px-6 py-0 md:py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Stories skeleton */}
            <div className="bg-white dark:bg-slate-800 md:rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-4">
              <div className="flex gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <Skeleton className="h-2 w-12" />
                  </div>
                ))}
              </div>
            </div>
            {/* Posts skeleton */}
            {[...Array(2)].map((_, i) => <PostSkeleton key={i} />)}
          </div>
          {/* Right panel skeleton */}
          <div className="hidden lg:block w-72 flex-shrink-0 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <Skeleton className="h-4 w-24 mb-4" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center mb-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
