"use client";

import { useState } from "react";
import { Megaphone, Send, Users, CheckCircle } from "lucide-react";
import { broadcastNotification } from "@/server/actions/admin";

const PRESET_MESSAGES = [
  { title: "📣 ประกาศจากทีม YourTrip", body: "มีการอัปเดตใหม่! ดูฟีเจอร์ล่าสุดได้เลย" },
  { title: "🗺️ สถานที่ใหม่มาแล้ว!", body: "เพิ่งเพิ่มสถานที่ท่องเที่ยวใหม่ มาดูกันเลย" },
  { title: "🎉 โปรโมชัน", body: "ฟีเจอร์ Travel Buddy พร้อมแล้ว! หาเพื่อนเดินทางได้เลย" },
  { title: "🔔 แจ้งเตือนระบบ", body: "ระบบมีการบำรุงรักษาในคืนนี้ 01:00–02:00 น." },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "ผู้ใช้ทั้งหมด" },
  { value: "new", label: "ผู้ใช้ใหม่ (ลงทะเบียนใน 7 วัน)" },
  { value: "active", label: "ผู้ใช้ที่มีโพสต์ (Active)" },
];

export default function BroadcastClient() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "new" | "active">("all");
  const [actionUrl, setActionUrl] = useState("/feed");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent?: number; error?: string } | null>(null);

  async function handleSend() {
    if (!title.trim() || !body.trim()) return;
    if (!confirm(`ส่งการแจ้งเตือนถึง ${AUDIENCE_OPTIONS.find((a) => a.value === audience)?.label}?\n\n"${title}"\n${body}`)) return;

    setSending(true);
    setResult(null);
    try {
      const res = await broadcastNotification({ title, body, audience, actionUrl });
      setResult(res);
      if (res.sent) { setTitle(""); setBody(""); }
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#398AB9]/10 rounded-xl flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-[#398AB9]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Broadcast</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">ส่งการแจ้งเตือนถึงผู้ใช้</p>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">ข้อความสำเร็จรูป</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_MESSAGES.map((p, i) => (
            <button
              key={i}
              onClick={() => { setTitle(p.title); setBody(p.body); }}
              className="text-left p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-[#398AB9] hover:bg-[#398AB9]/5 transition-colors"
            >
              <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 mb-0.5 truncate">{p.title}</p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 line-clamp-2">{p.body}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 block">ผู้รับ</label>
          <div className="flex gap-2 flex-wrap">
            {AUDIENCE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setAudience(value as "all" | "new" | "active")}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                  audience === value
                    ? "border-[#398AB9] bg-[#398AB9]/10 text-[#398AB9]"
                    : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-300"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 block">หัวข้อ</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="หัวข้อการแจ้งเตือน"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-[#398AB9] text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 block">ข้อความ</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="เนื้อหาการแจ้งเตือน"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-[#398AB9] resize-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 block">ลิงก์ปลายทาง (URL)</label>
          <input
            value={actionUrl}
            onChange={(e) => setActionUrl(e.target.value)}
            placeholder="/feed"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-[#398AB9] text-gray-900 dark:text-white"
          />
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-700">
            <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-slate-500 mb-1.5">Preview</p>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-[#398AB9] rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">YT</div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{title || "หัวข้อ"}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{body || "ข้อความ"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
            result.error
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          }`}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {result.error ? `เกิดข้อผิดพลาด: ${result.error}` : `ส่งสำเร็จ ${result.sent} การแจ้งเตือน`}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!title.trim() || !body.trim() || sending}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#398AB9] text-white font-semibold hover:bg-[#1C658C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {sending ? "กำลังส่ง..." : "ส่งการแจ้งเตือน"}
        </button>
      </div>
    </div>
  );
}
