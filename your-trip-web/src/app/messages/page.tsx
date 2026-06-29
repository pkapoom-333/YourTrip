import AppShell from "@/components/AppShell";
import MessagesClient from "@/components/features/MessagesClient";
import { getConversations } from "@/server/actions/messages";

export const metadata = { title: "ข้อความ" };

export default async function MessagesPage() {
  const { data: conversations } = await getConversations();

  return (
    <AppShell>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900">
        <MessagesClient initialConversations={conversations} />
      </div>
    </AppShell>
  );
}
