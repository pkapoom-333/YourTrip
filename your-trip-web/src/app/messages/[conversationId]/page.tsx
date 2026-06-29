import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import ChatWindow from "@/components/features/ChatWindow";
import { getConversationInfo, getMessages } from "@/server/actions/messages";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { conversationId } = await params;
  const { data } = await getConversationInfo(conversationId);
  const name = data?.otherUser.name ?? data?.otherUser.username ?? "ข้อความ";
  return { title: name };
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  const [{ data: info }, { data: messages }] = await Promise.all([
    getConversationInfo(conversationId),
    getMessages(conversationId),
  ]);

  if (!info) notFound();

  return (
    <AppShell>
      <ChatWindow
        conversationId={conversationId}
        initialMessages={messages}
        otherUser={info.otherUser}
      />
    </AppShell>
  );
}
