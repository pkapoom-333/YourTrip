import AppShell from "@/components/AppShell";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg ${className ?? ""}`} />;
}

export default function ProvinceLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#1C658C] to-[#398AB9] px-6 pt-10 pb-8">
          <Sk className="h-4 w-24 mb-4 bg-white/20 rounded-full" />
          <Sk className="h-8 w-48 mb-2 bg-white/20" />
          <Sk className="h-3 w-32 mb-4 bg-white/20 rounded-full" />
          <Sk className="h-10 w-40 bg-white/20 rounded-xl" />
        </div>
        <div className="px-4 py-6 space-y-8">
          {[0, 1].map((s) => (
            <div key={s}>
              <Sk className="h-5 w-32 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <Sk className="aspect-[4/3] rounded-none" />
                    <div className="p-3 space-y-1.5">
                      <Sk className="h-3 w-3/4" />
                      <Sk className="h-2.5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
