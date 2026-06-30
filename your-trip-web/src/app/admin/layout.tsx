import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./AdminSidebar";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "pakpoomtee24@gmail.com").split(",").map((e) => e.trim());

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <AdminSidebar />
      <main className="flex-1 ml-0 md:ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
