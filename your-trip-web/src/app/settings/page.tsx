"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import {
  User, Bell, Lock, Globe, Smartphone,
  Moon, ChevronRight, LogOut, Trash2,
  Shield, Eye, HelpCircle, Info, Camera,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        enabled ? "bg-[#398AB9]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          enabled ? "left-5.5 translate-x-0.5" : "left-0.5"
        }`}
        style={{ left: enabled ? "22px" : "2px" }}
      />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 mb-2">
        {title}
      </h2>
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
        {children}
      </div>
    </div>
  );
}

function RowLink({
  icon: Icon,
  iconBg,
  label,
  description,
  href,
  danger,
  onClick,
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  description?: string;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const cls = "flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition border-b border-gray-50 dark:border-slate-700 last:border-0 w-full text-left";
  const inner = (
    <>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-red-500" : "text-gray-800 dark:text-slate-200"}`}>{label}</p>
        {description && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{description}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
    </>
  );
  if (onClick) {
    return <button onClick={onClick} className={cls}>{inner}</button>;
  }
  return <a href={href ?? "#"} className={cls}>{inner}</a>;
}

function RowToggle({
  icon: Icon,
  iconBg,
  label,
  description,
  value,
  onChange,
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-slate-700 last:border-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{label}</p>
        {description && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{description}</p>}
      </div>
      <Toggle enabled={value} onChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [notifLike, setNotifLike] = useLocalStorage("settings_notif_like", true);
  const [notifComment, setNotifComment] = useLocalStorage("settings_notif_comment", true);
  const [notifFollow, setNotifFollow] = useLocalStorage("settings_notif_follow", true);
  const [notifBuddy, setNotifBuddy] = useLocalStorage("settings_notif_buddy", true);
  const [notifPush, setNotifPush] = useLocalStorage("settings_notif_push", true);
  const [privateAccount, setPrivateAccount] = useLocalStorage("settings_private", false);
  const [darkMode, setDarkMode] = useLocalStorage("settings_dark_mode", false);

  function handleDarkMode(v: boolean) {
    setDarkMode(v);
    document.documentElement.classList.toggle("dark", v);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Your Trip User";
  const username = user?.email?.split("@")[0] ?? "yourtrip_user";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6 px-0">ตั้งค่า</h1>

        {/* Profile preview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-[#398AB9] rounded-full flex items-center justify-center text-white text-xl font-bold">
              YT
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full flex items-center justify-center shadow-sm">
              <Camera className="w-3 h-3 text-gray-500 dark:text-slate-400" />
            </button>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-slate-100">{displayName}</p>
            <p className="text-sm text-gray-400 dark:text-slate-500">@{username}</p>
          </div>
          <a
            href="/profile/edit"
            className="text-sm text-[#398AB9] font-medium hover:text-[#1C658C] transition"
          >
            แก้ไข
          </a>
        </div>

        {/* Account */}
        <Section title="บัญชี">
          <RowLink icon={User} iconBg="bg-[#398AB9]" label="แก้ไขโปรไฟล์" description="ชื่อ, Bio, ลิงก์" href="/profile/edit" />
          <RowLink icon={Lock} iconBg="bg-slate-500" label="เปลี่ยนรหัสผ่าน" />
          <RowLink icon={Globe} iconBg="bg-emerald-500" label="ภาษา" description="ภาษาไทย" />
          <RowLink icon={Shield} iconBg="bg-amber-500" label="สมัครเป็นมัคคุเทศก์" description="รับ badge 🏅 และเพิ่มรายได้จากการท่องเที่ยว" href="/guide/apply" />
        </Section>

        {/* Privacy */}
        <Section title="ความเป็นส่วนตัว">
          <RowToggle
            icon={Eye}
            iconBg="bg-violet-500"
            label="บัญชีส่วนตัว"
            description="เฉพาะผู้ที่ติดตามจะเห็นโพสต์ของคุณ"
            value={privateAccount}
            onChange={setPrivateAccount}
          />
          <RowLink icon={Shield} iconBg="bg-orange-500" label="คำขอติดตาม" description="จัดการคนที่ต้องการติดตามคุณ" />
          <RowLink icon={User} iconBg="bg-gray-400" label="บล็อกผู้ใช้" description="รายชื่อที่ถูกบล็อก" href="/settings/blocked" />
        </Section>

        {/* Notifications */}
        <Section title="การแจ้งเตือน">
          <RowToggle
            icon={Bell}
            iconBg="bg-amber-500"
            label="Push Notification"
            description="แจ้งเตือนผ่านอุปกรณ์"
            value={notifPush}
            onChange={setNotifPush}
          />
          <RowToggle
            icon={Bell}
            iconBg="bg-red-400"
            label="ถูกใจ"
            value={notifLike}
            onChange={setNotifLike}
          />
          <RowToggle
            icon={Bell}
            iconBg="bg-[#398AB9]"
            label="ความคิดเห็น"
            value={notifComment}
            onChange={setNotifComment}
          />
          <RowToggle
            icon={Bell}
            iconBg="bg-emerald-500"
            label="ผู้ติดตามใหม่"
            value={notifFollow}
            onChange={setNotifFollow}
          />
          <RowToggle
            icon={Bell}
            iconBg="bg-violet-500"
            label="คำขอร่วมทริป"
            value={notifBuddy}
            onChange={setNotifBuddy}
          />
        </Section>

        {/* Display */}
        <Section title="การแสดงผล">
          <RowToggle
            icon={Moon}
            iconBg="bg-slate-700"
            label="Dark Mode"
            description="ธีมสีเข้ม"
            value={darkMode}
            onChange={handleDarkMode}
          />
          <RowLink icon={Smartphone} iconBg="bg-[#398AB9]" label="ติดตั้งแอป (PWA)" description="บันทึกลงหน้าจอหลัก" />
        </Section>

        {/* Support */}
        <Section title="ช่วยเหลือ">
          <RowLink icon={HelpCircle} iconBg="bg-sky-500" label="ศูนย์ช่วยเหลือ" />
          <RowLink icon={Info} iconBg="bg-gray-400" label="เกี่ยวกับ YourTrip" description="v1.0.0" />
        </Section>

        {/* Danger */}
        <Section title="บัญชี">
          <RowLink
            icon={LogOut}
            iconBg="bg-orange-500"
            label="ออกจากระบบ"
            danger
            onClick={handleSignOut}
          />
          <RowLink
            icon={Trash2}
            iconBg="bg-red-500"
            label="ลบบัญชี"
            description="ลบข้อมูลทั้งหมดอย่างถาวร"
            danger
          />
        </Section>
      </div>
    </AppShell>
  );
}
