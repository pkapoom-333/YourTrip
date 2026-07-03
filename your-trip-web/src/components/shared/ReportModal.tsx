"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { reportPost } from "@/server/actions/posts";
import { useToast } from "@/components/shared/Toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

const REPORT_REASONS = [
  "เนื้อหาไม่เหมาะสม",
  "สแปมหรือโฆษณา",
  "ข้อมูลเท็จหรือทำให้เข้าใจผิด",
  "ความรุนแรงหรือภาพน่ากลัว",
  "ละเมิดความเป็นส่วนตัว",
  "เนื้อหาที่แสดงถึงการเกลียดชัง",
  "อื่นๆ",
];

export function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
  const toast = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  async function handleReport() {
    if (!selected || loading) return;
    setLoading(true);
    const res = await reportPost(postId, selected) as { ok?: boolean; error?: string };
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      setDone(true);
    }
  }

  function handleClose() {
    setSelected(null);
    setDone(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full sm:w-auto sm:min-w-[380px] sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {done ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">รับทราบรายงานแล้ว</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">ขอบคุณที่แจ้งให้เราทราบ ทีมงานจะตรวจสอบภายใน 24 ชั่วโมง</p>
            <button onClick={handleClose}
              className="mt-5 px-6 py-2.5 bg-[#398AB9] text-white text-sm font-bold rounded-2xl hover:bg-[#1C658C] transition">
              ปิด
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#FF4F4F]" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">รายงานโพสต์</h3>
              </div>
              <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="px-5 py-3">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">เลือกเหตุผลที่ต้องการรายงาน</p>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((reason) => (
                  <button key={reason}
                    onClick={() => setSelected(reason)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition ${
                      selected === reason
                        ? "bg-[#FF4F4F]/10 text-[#FF4F4F] font-semibold border border-[#FF4F4F]/30"
                        : "bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 border border-transparent"
                    }`}>
                    {reason}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5 pt-2">
              <button
                onClick={handleReport}
                disabled={!selected || loading}
                className="w-full py-3 rounded-2xl bg-[#FF4F4F] text-white text-sm font-bold disabled:opacity-40 hover:bg-red-600 transition">
                {loading ? "กำลังส่ง…" : "ส่งรายงาน"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
