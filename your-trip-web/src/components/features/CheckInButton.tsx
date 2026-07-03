
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { MapPin, Check, Users, X, ChevronDown, ChevronUp } from "lucide-react";
import { checkInToPlace, getPlaceCheckIns } from "@/server/actions/places";
import { useToast } from "@/components/shared/Toast";

function timeAgo(date: Date): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "เมื่อกี้";
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}

interface Props {
  placeId: string;
  initialHasCheckedIn: boolean;
  initialTotalCheckIns: number;
}

export default function CheckInButton({ placeId, initialHasCheckedIn, initialTotalCheckIns }: Props) {
  const [hasCheckedIn, setHasCheckedIn] = useState(initialHasCheckedIn);
  const [totalCheckIns, setTotalCheckIns] = useState(initialTotalCheckIns);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [showList, setShowList] = useState(false);
  const [checkIns, setCheckIns] = useState<Array<{ id: string; note: string | null; createdAt: Date; user: { id: string; name: string | null; avatarUrl: string | null } }>>([]);
  const [listLoaded, setListLoaded] = useState(false);
  const [pending, startTransition] = useTransition();
  const { success, error } = useToast();

  function handleCheckIn() {
    if (hasCheckedIn) { setShowModal(true); return; }
    setShowModal(true);
  }

  function submitCheckIn() {
    startTransition(async () => {
      const res = await checkInToPlace(placeId, note);
      if (!res.ok) { error(res.error ?? "เกิดข้อผิดพลาด"); return; }
      setHasCheckedIn(true);
      setTotalCheckIns(res.checkInCount ?? totalCheckIns + 1);
      setNote("");
      setShowModal(false);
      success("เช็คอินสำเร็จ! 📍");
    });
  }

  async function loadList() {
    if (listLoaded) { setShowList((v) => !v); return; }
    const { data } = await getPlaceCheckIns(placeId, 20);
    setCheckIns(data);
    setListLoaded(true);
    setShowList(true);
  }

  return (
    <div>
      {/* Check-in button */}
      <button
        onClick={handleCheckIn}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          hasCheckedIn
            ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700"
            : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
        }`}
      >
        {hasCheckedIn ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
        {hasCheckedIn ? "เช็คอินแล้ว" : "เช็คอิน"}
      </button>

      {/* Total count + show list */}
      {totalCheckIns > 0 && (
        <button onClick={loadList}
          className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 hover:text-[#398AB9] transition-colors">
          <Users className="w-3.5 h-3.5" />
          {totalCheckIns.toLocaleString()} คนเคยเช็คอินที่นี่
          {showList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}

      {/* Recent check-ins list */}
      {showList && checkIns.length > 0 && (
        <div className="mt-3 space-y-2.5">
          {checkIns.map((ci) => (
            <div key={ci.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                {ci.user.avatarUrl
                  ? <Image src={ci.user.avatarUrl} alt="" width={28} height={28} className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-[#398AB9] text-white text-[10px] font-bold">{(ci.user.name ?? "U")[0]}</div>
                }
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700 dark:text-slate-200">{ci.user.name ?? "ผู้ใช้"}</p>
                {ci.note && <p className="text-xs text-gray-500 dark:text-slate-400 italic">&ldquo;{ci.note}&rdquo;</p>}
                <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(ci.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Check-in modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-slate-100">
                {hasCheckedIn ? "เช็คอินแล้ว ✓" : "เช็คอินที่นี่"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {hasCheckedIn ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">คุณเช็คอินที่นี่แล้ว</p>
                <p className="text-xs text-gray-400 mt-1">มีคนเช็คอิน {totalCheckIns.toLocaleString()} ครั้ง</p>
                <button onClick={() => setShowModal(false)}
                  className="mt-4 w-full py-2 bg-gray-100 dark:bg-slate-700 rounded-xl text-sm text-gray-600 dark:text-slate-300">
                  ปิด
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">แชร์ว่าคุณมาอยู่ที่นี่ตอนนี้</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เพิ่มความรู้สึก... (ไม่บังคับ)"
                  rows={2}
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm resize-none dark:bg-slate-700 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30 mb-4"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-500 dark:text-slate-400">
                    ยกเลิก
                  </button>
                  <button onClick={submitCheckIn} disabled={pending}
                    className="flex-1 py-2.5 rounded-xl bg-[#398AB9] text-white text-sm font-semibold hover:bg-[#1C658C] disabled:opacity-60 flex items-center justify-center gap-1.5">
                    {pending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MapPin className="w-4 h-4" />}
                    เช็คอิน
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
