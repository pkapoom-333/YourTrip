"use client";

export default function AdminGuidesError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-gray-500 dark:text-slate-400">ไม่สามารถโหลดข้อมูลได้</p>
      <button onClick={reset} className="px-4 py-2 bg-[#398AB9] text-white rounded-xl text-sm">
        ลองใหม่
      </button>
    </div>
  );
}
