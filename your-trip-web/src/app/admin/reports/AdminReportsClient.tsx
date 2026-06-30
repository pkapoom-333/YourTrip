"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, Trash2, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import type { AdminReport } from "@/server/actions/admin";
import { dismissReport, deleteReportedPost } from "@/server/actions/admin";

const REASON_LABELS: Record<string, string> = {
  spam: "สแปม",
  inappropriate: "เนื้อหาไม่เหมาะสม",
  harassment: "คุกคาม",
  violence: "ความรุนแรง",
  misinformation: "ข้อมูลเท็จ",
  other: "อื่นๆ",
};

interface Props {
  initialReports: AdminReport[];
}

export default function AdminReportsClient({ initialReports }: Props) {
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [isPending, startTransition] = useTransition();

  const handleDismiss = async (reportId: string) => {
    startTransition(async () => {
      await dismissReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    });
  };

  const handleDelete = async (reportId: string, postId: string) => {
    if (!confirm("ลบโพสต์นี้? ไม่สามารถกู้คืนได้")) return;
    startTransition(async () => {
      await deleteReportedPost(reportId, postId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    });
  };

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">รายงาน</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {reports.length} รายการรอตรวจสอบ
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-12 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="font-medium text-gray-700 dark:text-slate-300">ไม่มีรายงานที่รอตรวจสอบ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flag className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {REASON_LABELS[report.reason] ?? report.reason}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                    รายงานโดย: <span className="font-medium">{report.reporter.name ?? report.reporter.email ?? "Unknown"}</span>
                  </p>
                  {report.note && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 italic">"{report.note}"</p>
                  )}

                  {/* Reported Post */}
                  <div className="mt-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-slate-400">โพสต์ที่ถูกรายงาน</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-2">{report.post.content}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      โดย: {report.post.userName ?? "Unknown"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href={`/post/${report.post.id}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      ดูโพสต์
                    </a>
                    <button
                      onClick={() => handleDismiss(report.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-400 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      ยกเลิกรายงาน
                    </button>
                    <button
                      onClick={() => handleDelete(report.id, report.post.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      ลบโพสต์
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
