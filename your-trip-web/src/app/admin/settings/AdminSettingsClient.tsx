"use client";

import { useState, useTransition } from "react";
import { bulkUpsertSiteConfig } from "@/server/actions/admin";
import {
  Settings, Globe, Shield, Image, Users, Mail, Share2,
  AlertTriangle, CheckCircle, Save, Loader2,
} from "lucide-react";

interface Props {
  configs: Record<string, string>;
}

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "textarea" | "email";
  placeholder?: string;
  hint?: string;
}

interface Section {
  title: string;
  icon: React.ElementType;
  fields: FieldDef[];
}

const SECTIONS: Section[] = [
  {
    title: "ข้อมูลเว็บไซต์",
    icon: Globe,
    fields: [
      { key: "siteName", label: "ชื่อเว็บไซต์", type: "text", placeholder: "Your Trip" },
      { key: "siteDescription", label: "คำอธิบายเว็บไซต์", type: "textarea", placeholder: "สังคมแห่งการท่องเที่ยว" },
      { key: "contactEmail", label: "อีเมลติดต่อ", type: "email", placeholder: "contact@yourtrip.co" },
    ],
  },
  {
    title: "โซเชียลมีเดีย",
    icon: Share2,
    fields: [
      { key: "socialInstagram", label: "Instagram", type: "text", placeholder: "@yourtrip" },
      { key: "socialFacebook", label: "Facebook", type: "text", placeholder: "fb.com/yourtrip" },
      { key: "socialTwitter", label: "Twitter / X", type: "text", placeholder: "@yourtrip" },
    ],
  },
  {
    title: "การจัดการเนื้อหา",
    icon: Shield,
    fields: [
      {
        key: "autoHideReportThreshold",
        label: "ซ่อนโพสต์อัตโนมัติเมื่อถูกรายงาน (ครั้ง)",
        type: "number",
        hint: "โพสต์ที่ถูกรายงานตามจำนวนที่กำหนดจะถูกซ่อนจากสาธารณะโดยอัตโนมัติ",
      },
      {
        key: "maxFeaturedPlaces",
        label: "จำนวนสถานที่แนะนำสูงสุด",
        type: "number",
        hint: "จำนวนสถานที่ที่แสดงใน Featured section",
      },
      {
        key: "postsPerPage",
        label: "จำนวนโพสต์ต่อหน้า",
        type: "number",
      },
    ],
  },
  {
    title: "การอัปโหลดรูปภาพ",
    icon: Image,
    fields: [
      {
        key: "maxImageSizeMB",
        label: "ขนาดไฟล์รูปภาพสูงสุด (MB)",
        type: "number",
      },
      {
        key: "allowedImageTypes",
        label: "ประเภทไฟล์ที่อนุญาต",
        type: "text",
        placeholder: "image/jpeg,image/png,image/webp",
        hint: "คั่นด้วย comma",
      },
    ],
  },
  {
    title: "การสมัครสมาชิก",
    icon: Users,
    fields: [
      {
        key: "allowNewRegistrations",
        label: "เปิดรับสมาชิกใหม่",
        type: "boolean",
        hint: "ปิดการสมัครเมื่อต้องการจำกัดจำนวนผู้ใช้",
      },
      {
        key: "guideApplicationOpen",
        label: "เปิดรับสมัคร Travel Guide",
        type: "boolean",
      },
    ],
  },
  {
    title: "โหมดปิดปรับปรุง",
    icon: AlertTriangle,
    fields: [
      {
        key: "maintenanceMode",
        label: "เปิดโหมดปิดปรับปรุง",
        type: "boolean",
        hint: "ผู้ใช้ทั่วไปจะเห็นหน้าแจ้งปิดปรับปรุงแทน",
      },
      {
        key: "maintenanceMessage",
        label: "ข้อความปิดปรับปรุง",
        type: "textarea",
        placeholder: "ขณะนี้ระบบอยู่ระหว่างการปรับปรุง กรุณากลับมาใหม่ภายหลัง",
      },
    ],
  },
];

export default function AdminSettingsClient({ configs }: Props) {
  const [values, setValues] = useState<Record<string, string>>({ ...configs });
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function handleToggle(key: string) {
    const next = values[key] === "true" ? "false" : "true";
    handleChange(key, next);
  }

  function handleSave() {
    startTransition(async () => {
      await bulkUpsertSiteConfig(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ตั้งค่าระบบ</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">จัดการการตั้งค่าทั่วไปของเว็บไซต์</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-[#398AB9] text-white rounded-xl text-sm font-medium hover:bg-[#1C658C] transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? "กำลังบันทึก..." : saved ? "บันทึกแล้ว!" : "บันทึก"}
        </button>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          บันทึกการตั้งค่าเรียบร้อยแล้ว
        </div>
      )}

      {/* Maintenance Mode Warning */}
      {values["maintenanceMode"] === "true" && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><strong>โหมดปิดปรับปรุงเปิดอยู่</strong> — ผู้ใช้ทั่วไปไม่สามารถเข้าถึงเว็บไซต์ได้ในขณะนี้</span>
        </div>
      )}

      {/* Sections */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <section.icon className="w-4 h-4 text-[#398AB9]" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{section.title}</h2>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {section.fields.map((field) => (
              <div key={field.key} className="px-5 py-4">
                {field.type === "boolean" ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{field.label}</p>
                      {field.hint && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{field.hint}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggle(field.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        values[field.key] === "true"
                          ? "bg-[#398AB9]"
                          : "bg-gray-200 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          values[field.key] === "true" ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ) : field.type === "textarea" ? (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 dark:text-slate-200">{field.label}</label>
                    {field.hint && (
                      <p className="text-xs text-gray-400 dark:text-slate-500">{field.hint}</p>
                    )}
                    <textarea
                      value={values[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30 focus:border-[#398AB9] resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 dark:text-slate-200">{field.label}</label>
                    {field.hint && (
                      <p className="text-xs text-gray-400 dark:text-slate-500">{field.hint}</p>
                    )}
                    <input
                      type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                      value={values[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30 focus:border-[#398AB9]"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button (bottom) */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#398AB9] text-white rounded-xl text-sm font-medium hover:bg-[#1C658C] transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </div>
  );
}
