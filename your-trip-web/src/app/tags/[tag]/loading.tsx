import AppShell from "@/components/AppShell";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl ${className}`} />;
}

export default function TagLoading() {
  return (
    <AppShell>
      <div className="max-w-lg mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-black text-[#398AB9]/30">#</span>
            <Sk className="h-7 w-36" />
          </div>
          <Sk className="h-4 w-24 mt-1 rounded-full" />
        </div>

        {/* Post grid skeleton — 2-col masonry-style */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <Sk className={`w-full ${i % 3 === 0 ? "h-52" : "h-40"} rounded-none`} />
              <div className="p-3 space-y-2">
                <Sk className="h-3.5 w-3/4" />
                <Sk className="h-3 w-1/2" />
                <div className="flex gap-3 pt-1">
                  <Sk className="h-3 w-12 rounded-full" />
                  <Sk className="h-3 w-12 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
