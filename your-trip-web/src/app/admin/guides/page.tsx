import { ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getGuideApplications } from "@/server/actions/admin";
import GuideReviewClient from "./GuideReviewClient";

export const metadata = { title: "Admin — Guide Applications" };

export default async function AdminGuidesPage() {
  let pending: Awaited<ReturnType<typeof getGuideApplications>>["pending"] = [];
  let approved: Awaited<ReturnType<typeof getGuideApplications>>["approved"] = [];
  try {
    ({ pending, approved } = await getGuideApplications());
  } catch {
    pending = [];
    approved = [];
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#398AB9]/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#398AB9]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">คำขอเป็นไกด์</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {pending.length} รายการรอการอนุมัติ
            </p>
          </div>
        </div>

        <GuideReviewClient initialPending={pending} initialApproved={approved} />
      </div>
    </AppShell>
  );
}
