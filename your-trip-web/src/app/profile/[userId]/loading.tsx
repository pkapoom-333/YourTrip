import AppShell from "@/components/AppShell";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg ${className ?? ""}`} />;
}

export default function PublicProfileLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 md:px-6 pt-4 pb-5">
          <div className="flex items-center justify-between mb-4">
            <Sk className="w-20 h-20 rounded-full" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <Sk className="h-6 w-10 mx-auto mb-1" />
                  <Sk className="h-2.5 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <Sk className="h-4 w-32" />
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-full" />
          </div>
          <div className="flex gap-2">
            <Sk className="flex-1 h-10 rounded-xl" />
            <Sk className="w-10 h-10 rounded-xl" />
          </div>
        </div>
        <div className="flex bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 flex justify-center py-3">
              <Sk className="h-4 w-12" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-slate-700">
          {[...Array(9)].map((_, i) => (
            <Sk key={i} className="aspect-square rounded-none" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
