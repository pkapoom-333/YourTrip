import AppShell from "@/components/AppShell";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl ${className}`} />;
}

export default function FollowingLoading() {
  return (
    <AppShell>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full" />
        <Sk className="h-5 w-36" />
      </header>
      <div className="max-w-lg mx-auto w-full divide-y divide-gray-50 dark:divide-slate-700">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Sk className="w-11 h-11 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-4 w-32" />
              <Sk className="h-3 w-24" />
            </div>
            <Sk className="h-8 w-20 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
