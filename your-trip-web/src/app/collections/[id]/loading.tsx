import AppShell from "@/components/AppShell";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl ${className}`} />;
}

export default function CollectionDetailLoading() {
  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back link */}
        <Sk className="h-4 w-24 mb-4 rounded-full" />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sk className="w-9 h-9 rounded-xl flex-shrink-0" />
            <Sk className="h-7 flex-1" />
            <Sk className="h-7 w-16 rounded-lg flex-shrink-0" />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Sk className="h-4 w-20 rounded-full" />
            <Sk className="h-4 w-20 rounded-full" />
            <Sk className="h-4 w-16 rounded-full" />
          </div>
        </div>

        {/* Place list */}
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <Sk className="w-20 h-20 rounded-none flex-shrink-0" />
              <div className="flex-1 py-3 space-y-2">
                <Sk className="h-4 w-3/4" />
                <Sk className="h-3 w-1/2" />
                <Sk className="h-3 w-16 rounded-full" />
              </div>
              <div className="flex items-center pr-3">
                <Sk className="w-8 h-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
