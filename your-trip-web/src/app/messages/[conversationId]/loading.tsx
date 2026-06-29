export default function ChatLoading() {
  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] dark:bg-slate-900">
      {/* Top bar skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />
        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />
      </div>
      {/* Messages skeleton */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {[80, 60, 90, 50, 70].map((w, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div
              className="h-9 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse"
              style={{ width: `${w}%`, maxWidth: "280px" }}
            />
          </div>
        ))}
      </div>
      {/* Input skeleton */}
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        <div className="h-10 w-full bg-gray-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
