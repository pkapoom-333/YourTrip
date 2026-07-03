"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">😕</div>
      <h2 className="text-xl font-semibold text-gray-800">เกิดข้อผิดพลาด</h2>
      <p className="text-sm text-gray-500">{error.message || "กรุณาลองใหม่อีกครั้ง"}</p>
      <button
        onClick={reset}
        className="mt-2 rounded-xl bg-[#398AB9] px-6 py-2 text-sm font-medium text-white hover:bg-[#1C658C]"
      >
        ลองใหม่
      </button>
    </div>
  );
}
