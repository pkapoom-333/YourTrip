"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Check, X, Eye, Clock, ExternalLink, Loader2 } from "lucide-react";

interface PlaceSubmission {
  id: string;
  name: string;
  name_en: string | null;
  category: string;
  province: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  google_maps_url: string | null;
  submitter_note: string | null;
  submitted_by: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธ",
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<PlaceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selected, setSelected] = useState<PlaceSubmission | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const query = supabase
      .from("place_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query.eq("status", filter);

    query.then(({ data, error }: { data: PlaceSubmission[] | null; error: unknown }) => {
      if (!error) setSubmissions(data ?? []);
      setLoading(false);
    });
  }, [filter]);

  async function updateStatus(id: string, status: "approved" | "rejected", note?: string) {
    setProcessing(id);
    const { error } = await supabase
      .from("place_submissions")
      .update({ status, admin_note: note ?? null, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setSubmissions((s) => s.map((sub) => sub.id === id ? { ...sub, status } : sub));
      setSelected(null);
    }
    setProcessing(null);
  }

  const catLabel = (c: string) =>
    c === "attraction" ? "สถานที่เที่ยว" : c === "cafe" ? "คาเฟ่" : c === "restaurant" ? "ร้านอาหาร" : c === "hotel" ? "ที่พัก" : c;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-6 h-6 text-[#398AB9]" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">สถานที่ที่แนะนำ</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f
                ? "bg-[#398AB9] text-white"
                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            {f === "all" ? "ทั้งหมด" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#398AB9]" />
        </div>
      )}

      {!loading && submissions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>ไม่มีรายการ</p>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">{sub.name}</h3>
                    {sub.name_en && <span className="text-xs text-gray-400 dark:text-slate-500">({sub.name_en})</span>}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[sub.status]}`}>
                      {STATUS_LABELS[sub.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500 dark:text-slate-400">
                    <span>{catLabel(sub.category)}</span>
                    <span>·</span>
                    <span>{sub.province}</span>
                    {sub.address && <><span>·</span><span className="truncate max-w-[200px]">{sub.address}</span></>}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(sub.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setSelected(sub === selected ? null : sub)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#398AB9] hover:bg-[#398AB9]/10 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                  {sub.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(sub.id, "approved")}
                        disabled={processing === sub.id}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                      >
                        {processing === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => updateStatus(sub.id, "rejected")}
                        disabled={processing === sub.id}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Detail expand */}
              {selected?.id === sub.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 space-y-3 text-sm">
                  {sub.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">คำอธิบาย</p>
                      <p className="text-gray-700 dark:text-slate-300">{sub.description}</p>
                    </div>
                  )}
                  {sub.phone && (
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">โทร:</span>
                      <span className="text-gray-700 dark:text-slate-300">{sub.phone}</span>
                    </div>
                  )}
                  {sub.website && (
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">เว็บ:</span>
                      <a href={sub.website} target="_blank" rel="noopener noreferrer"
                        className="text-[#398AB9] hover:underline flex items-center gap-1 text-xs">
                        {sub.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {sub.google_maps_url && (
                    <a href={sub.google_maps_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#398AB9] hover:underline">
                      <MapPin className="w-3.5 h-3.5" />
                      ดูบน Google Maps
                    </a>
                  )}
                  {sub.submitter_note && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                      <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">หมายเหตุจากผู้แนะนำ</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-300">{sub.submitter_note}</p>
                    </div>
                  )}
                  {sub.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => updateStatus(sub.id, "approved")}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> อนุมัติ
                      </button>
                      <button
                        onClick={() => updateStatus(sub.id, "rejected")}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
