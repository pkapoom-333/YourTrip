import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-5xl">🔍</div>
      <h2 className="text-xl font-semibold text-gray-800">ไม่พบรายการค่าใช้จ่ายนี้</h2>
      <p className="text-sm text-gray-500">อาจถูกลบหรือ URL ไม่ถูกต้อง</p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-[#398AB9] px-6 py-2 text-sm font-medium text-white hover:bg-[#1C658C]"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
