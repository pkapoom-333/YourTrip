"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinGroupByInviteCode } from "@/server/actions/expense";
import { Users, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Member {
  id: string;
  name: string;
  color: string;
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  members: Member[];
  createdBy: { name: string | null };
}

interface Props {
  code: string;
  group: Group | null;
  currentUserName: string;
}

export default function JoinGroupClient({ code, group, currentUserName }: Props) {
  const router = useRouter();
  const [memberName, setMemberName] = useState(currentUserName || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (!group) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">ไม่พบกลุ่มนี้</h1>
          <p className="text-sm text-gray-500 mb-6">ลิงก์อาจหมดอายุหรือถูกยกเลิกแล้ว</p>
          <button
            onClick={() => router.push("/expense")}
            className="px-5 py-2.5 bg-[#398AB9] text-white rounded-xl text-sm font-medium"
          >
            ไปหน้าหารค่าใช้จ่าย
          </button>
        </div>
      </div>
    );
  }

  function handleJoin() {
    if (!memberName.trim()) { setError("กรุณาใส่ชื่อของคุณ"); return; }
    setError("");
    startTransition(async () => {
      try {
        const { groupId } = await joinGroupByInviteCode(code, memberName.trim());
        router.push(`/expense/${groupId}`);
      } catch (e) {
        setError(String(e));
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Group Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 text-center shadow-sm">
          <div className="text-5xl mb-3">{group.emoji}</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-gray-500 mb-3">{group.description}</p>
          )}
          <p className="text-xs text-gray-400">
            สร้างโดย {group.createdBy.name ?? "ไม่ระบุชื่อ"} · {group.members.length} คน
          </p>

          {/* Members avatars */}
          {group.members.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-3">
              {group.members.slice(0, 6).map((m) => (
                <div
                  key={m.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: m.color }}
                  title={m.name}
                >
                  {m.name.slice(0, 1).toUpperCase()}
                </div>
              ))}
              {group.members.length > 6 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                  +{group.members.length - 6}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Join Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#398AB9]" />
            <h2 className="text-sm font-semibold text-gray-800">เข้าร่วมกลุ่ม</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">ชื่อที่จะแสดงในกลุ่ม</label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30 focus:border-[#398AB9]"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <button
              onClick={handleJoin}
              disabled={isPending}
              className="w-full py-2.5 bg-[#398AB9] text-white rounded-xl text-sm font-medium hover:bg-[#1C658C] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> กำลังเข้าร่วม...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> เข้าร่วมกลุ่ม</>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          คุณจะเห็นค่าใช้จ่ายและสามารถบันทึกค่าใช้จ่ายได้หลังเข้าร่วม
        </p>
      </div>
    </div>
  );
}
