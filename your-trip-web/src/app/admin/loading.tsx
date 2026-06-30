export default function AdminLoading() {
  return (
    <div className="p-4 pt-16 md:pt-6 max-w-5xl mx-auto">
      <div className="h-8 w-40 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 h-28 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
