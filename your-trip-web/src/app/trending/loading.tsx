export default function TrendingLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center md:pl-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#398AB9]/20 border-t-[#398AB9] animate-spin" />
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      </div>
    </div>
  );
}
