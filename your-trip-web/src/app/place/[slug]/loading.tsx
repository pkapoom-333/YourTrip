import AppShell from "@/components/AppShell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

export default function PlaceLoading() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <Skeleton className="aspect-[16/9] md:aspect-[2/1] w-full md:mt-6 md:mx-6 rounded-none md:rounded-2xl" />

        <div className="px-4 md:px-6 pb-8 space-y-6 mt-4">
          {/* Name & meta */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between px-4 py-2.5 border-b border-gray-50">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-56 md:h-72 w-full rounded-xl" />
          </div>

          {/* Transport */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
