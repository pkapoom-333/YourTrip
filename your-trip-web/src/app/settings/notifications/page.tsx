"use client";

import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { ChevronLeft, Bell, BellOff, BellRing, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}
function Toggle({ enabled, onChange, disabled }: ToggleProps) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed ${
        enabled ? "bg-[#398AB9]" : "bg-gray-200 dark:bg-slate-600"
      }`}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
        style={{ left: enabled ? "22px" : "2px" }}
      />
    </button>
  );
}

function SettingRow({ icon: Icon, label, sub, children }: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[#398AB9]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#398AB9]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{label}</p>
          {sub && <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 leading-relaxed">{sub}</p>}
        </div>
      </div>
      <div className="ml-3 flex-shrink-0">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1 px-1">{title}</p>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 divide-y divide-gray-50 dark:divide-slate-700">
        {children}
      </div>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const { isSupported, permission, isSubscribed, subscribing, subscribe, unsubscribe } = usePushNotifications();

  // In-app notification preferences (persisted locally)
  const [notifNewFollower, setNotifNewFollower] = useLocalStorage("notif_new_follower", true);
  const [notifLike, setNotifLike] = useLocalStorage("notif_like", true);
  const [notifComment, setNotifComment] = useLocalStorage("notif_comment", true);
  const [notifTripReminder, setNotifTripReminder] = useLocalStorage("notif_trip_reminder", true);
  const [notifNewPlace, setNotifNewPlace] = useLocalStorage("notif_new_place", false);
  const [notifWeekly, setNotifWeekly] = useLocalStorage("notif_weekly_digest", true);

  // Status pill
  const StatusBadge = () => {
    if (!isSupported) return (
      <span className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
        <XCircle className="w-3.5 h-3.5" /> ไม่รองรับ
      </span>
    );
    if (permission === "denied") return (
      <span className="flex items-center gap-1.5 text-[11px] text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">
        <BellOff className="w-3.5 h-3.5" /> ถูกบล็อก
      </span>
    );
    if (isSubscribed) return (
      <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" /> เปิดแล้ว
      </span>
    );
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
        <BellRing className="w-3.5 h-3.5" /> ยังไม่เปิด
      </span>
    );
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/settings"
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">การแจ้งเตือน</h1>
            <p className="text-xs text-gray-400 dark:text-slate-500">จัดการ push notification และการแจ้งเตือนใน app</p>
          </div>
          <StatusBadge />
        </div>

        {/* Push Notifications */}
        <Section title="Push Notification">
          <div className="py-4">
            {!isSupported ? (
              <div className="flex items-center gap-3 py-2">
                <BellOff className="w-5 h-5 text-gray-300" />
                <p className="text-sm text-gray-400">เบราว์เซอร์นี้ไม่รองรับ push notification</p>
              </div>
            ) : permission === "denied" ? (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <BellOff className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">การแจ้งเตือนถูกบล็อก</p>
                    <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-1">
                      เปิดการตั้งค่าเบราว์เซอร์และอนุญาต notification จาก your-trip แล้วรีโหลดหน้า
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#398AB9]/10 flex items-center justify-center">
                    {isSubscribed ? <Bell className="w-5 h-5 text-[#398AB9]" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {isSubscribed ? "รับการแจ้งเตือน" : "เปิดรับการแจ้งเตือน"}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                      {isSubscribed ? "คลิกเพื่อยกเลิก" : "รับแจ้งเตือนทันทีบนอุปกรณ์นี้"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={isSubscribed ? () => void unsubscribe() : () => void subscribe()}
                  disabled={subscribing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60 ${
                    isSubscribed
                      ? "bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100"
                      : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
                  }`}
                >
                  {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : isSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  {subscribing ? "..." : isSubscribed ? "ปิด" : "เปิด"}
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* Social notifications */}
        <Section title="ปฏิสัมพันธ์ทางสังคม">
          <SettingRow icon={Bell} label="ผู้ติดตามใหม่" sub="เมื่อมีคนติดตามคุณ">
            <Toggle enabled={notifNewFollower} onChange={setNotifNewFollower} />
          </SettingRow>
          <SettingRow icon={Bell} label="ถูกใจโพสต์" sub="เมื่อมีคนกด Like โพสต์ของคุณ">
            <Toggle enabled={notifLike} onChange={setNotifLike} />
          </SettingRow>
          <SettingRow icon={Bell} label="ความคิดเห็นใหม่" sub="เมื่อมีคนแสดงความคิดเห็นในโพสต์ของคุณ">
            <Toggle enabled={notifComment} onChange={setNotifComment} />
          </SettingRow>
        </Section>

        {/* Trip & Discover */}
        <Section title="การเดินทาง">
          <SettingRow icon={Bell} label="เตือนก่อนทริป" sub="แจ้งเตือน 3 วันก่อนวันเดินทาง">
            <Toggle enabled={notifTripReminder} onChange={setNotifTripReminder} />
          </SettingRow>
          <SettingRow icon={Bell} label="สถานที่ใหม่ใกล้คุณ" sub="เมื่อมีสถานที่ใหม่น่าสนใจในพื้นที่ของคุณ">
            <Toggle enabled={notifNewPlace} onChange={setNotifNewPlace} />
          </SettingRow>
        </Section>

        {/* Digest */}
        <Section title="สรุปรายสัปดาห์">
          <SettingRow icon={Bell} label="สรุปกิจกรรมทุกสัปดาห์" sub="รับบทสรุปโพสต์และทริปในชุมชนทุกวันจันทร์">
            <Toggle enabled={notifWeekly} onChange={setNotifWeekly} />
          </SettingRow>
        </Section>

        {/* Note */}
        <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center mt-2 px-4 leading-relaxed">
          การตั้งค่าบางอย่างจะมีผลเมื่อเปิดใช้งาน push notification แล้ว<br />
          การแจ้งเตือนจาก app สามารถปิดในการตั้งค่าเบราว์เซอร์หรืออุปกรณ์
        </p>
      </div>
    </AppShell>
  );
}
