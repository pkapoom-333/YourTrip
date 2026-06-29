export default function MessagesLoading() {
  return (
    <div className="max-w-xl mx-auto">
      {/* Header skeleton */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 dark:border-slate-700">
        <div className="h-7 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse mb-3" />
        <div className="h-9 w-full bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
      {/* Conversation rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-gray-50 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-48 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-3 w-10 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
