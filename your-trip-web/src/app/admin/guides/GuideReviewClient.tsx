"use client";

import { useState } from "react";
import { Check, X, ShieldCheck, User, FileText, Users } from "lucide-react";
import { approveGuide, rejectGuide, type GuideApplicant } from "@/server/actions/admin";

function GuideRow({
  applicant,
  onApprove,
  onReject,
  isPending,
}: {
  applicant: GuideApplicant;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isPending: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const initials = (applicant.name ?? applicant.username ?? "U").charAt(0).toUpperCase();

  async function handleApprove() {
    setLoading(true);
    await approveGuide(applicant.id);
    onApprove?.(applicant.id);
    setLoading(false);
  }

  async function handleReject() {
    setLoading(true);
    await rejectGuide(applicant.id);
    onReject?.(applicant.id);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-5 py-4">
      {/* Avatar */}
      {applicant.avatarUrl ? (
        <img src={applicant.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 bg-[#398AB9] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
            {applicant.name ?? "ไม่มีชื่อ"}
          </p>
          {applicant.isVerifiedGuide && (
            <ShieldCheck className="w-4 h-4 text-[#398AB9] flex-shrink-0" />
          )}
        </div>
        {applicant.username && (
          <p className="text-xs text-gray-400 dark:text-slate-500">@{applicant.username}</p>
        )}
        {applicant.bio && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{applicant.bio}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
            <Users className="w-3 h-3" />
            {applicant.followerCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
            <FileText className="w-3 h-3" />
            {applicant.postCount} โพสต์
          </span>
          {applicant.email && (
            <span className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{applicant.email}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {isPending ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition"
          >
            <X className="w-3.5 h-3.5" />
            ปฏิเสธ
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#398AB9] text-white text-xs font-semibold hover:bg-[#1C658C] disabled:opacity-40 transition"
          >
            <Check className="w-3.5 h-3.5" />
            อนุมัติ
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-semibold flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          อนุมัติแล้ว
        </div>
      )}
    </div>
  );
}

export default function GuideReviewClient({
  initialPending,
  initialApproved,
}: {
  initialPending: GuideApplicant[];
  initialApproved: GuideApplicant[];
}) {
  const [pending, setPending] = useState(initialPending);
  const [approved, setApproved] = useState(initialApproved);
  const [tab, setTab] = useState<"pending" | "approved">("pending");

  function handleApprove(id: string) {
    const applicant = pending.find((u) => u.id === id);
    if (applicant) {
      setPending((prev) => prev.filter((u) => u.id !== id));
      setApproved((prev) => [{ ...applicant, isVerifiedGuide: true }, ...prev]);
    }
  }

  function handleReject(id: string) {
    setPending((prev) => prev.filter((u) => u.id !== id));
  }

  const tabs = [
    { key: "pending" as const, label: "รอการอนุมัติ", count: pending.length },
    { key: "approved" as const, label: "อนุมัติแล้ว", count: approved.length },
  ];

  const list = tab === "pending" ? pending : approved;

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-slate-700 mb-6">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === key
                ? "border-[#398AB9] text-[#398AB9]"
                : "border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600"
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                tab === key
                  ? "bg-[#398AB9] text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-slate-500">
          <User className="w-10 h-10 opacity-30" />
          <p className="text-sm">
            {tab === "pending" ? "ไม่มีคำขอรอการอนุมัติ" : "ยังไม่มีไกด์ที่อนุมัติ"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((applicant) => (
            <GuideRow
              key={applicant.id}
              applicant={applicant}
              isPending={tab === "pending"}
              onApprove={tab === "pending" ? handleApprove : undefined}
              onReject={tab === "pending" ? handleReject : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
