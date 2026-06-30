import { prisma } from "@/lib/prisma";
import { MessageSquare, Users } from "lucide-react";

export const metadata = { title: "Admin — ข้อความ" };

export default async function AdminMessagesPage() {
  const [totalConversations, totalMessages] = await Promise.all([
    prisma.conversation.count().catch(() => 0),
    prisma.message.count().catch(() => 0),
  ]);

  const recentConversations = await prisma.conversation.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
  }).catch(() => []);

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ข้อความ</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">ภาพรวมระบบ chat</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalConversations.toLocaleString()}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">การสนทนา</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalMessages.toLocaleString()}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">ข้อความทั้งหมด</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">การสนทนาล่าสุด</h2>
        </div>
        {recentConversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400 dark:text-slate-500">ยังไม่มีการสนทนา</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {recentConversations.map((conv) => {
              const names = conv.participants.map((p) => p.user.name ?? "Unknown").join(", ");
              const lastMsg = conv.messages[0];
              return (
                <div key={conv.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#398AB9]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-[#398AB9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{names}</div>
                    {lastMsg && (
                      <div className="text-xs text-gray-400 dark:text-slate-500 truncate">{lastMsg.content}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                    {new Date(conv.createdAt).toLocaleDateString("th-TH")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
