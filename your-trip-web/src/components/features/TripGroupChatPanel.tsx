"use client";

/**
 * TripGroupChatPanel — Group chat embedded in trips/[id] chat tab.
 * Creates the group conversation automatically if it doesn't exist.
 * Uses server actions: createTripGroupChat / getTripGroupChat / getMessages / sendMessage
 */

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Loader2, Users } from "lucide-react";
import {
  createTripGroupChat,
  getTripGroupChat,
  getMessages,
  sendMessage,
  markConversationRead,
} from "@/server/actions/messages";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

interface MessageItem {
  id: string;
  content: string;
  type: string;
  mediaUrl: string | null;
  createdAt: Date | string;
  sender: { id: string; name: string | null; avatarUrl: string | null };
}

interface Props {
  tripId: string;
  tripTitle: string;
}

function formatTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "วันนี้";
  if (d.toDateString() === yesterday.toDateString()) return "เมื่อวาน";
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export default function TripGroupChatPanel({ tripId, tripTitle }: Props) {
  const { user } = useUser();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load or create group chat
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const existing = await getTripGroupChat(tripId);
        if (existing.data) {
          setConversationId(existing.data.id);
          setParticipantCount(existing.data.participantCount ?? 0);
          const msgs = await getMessages(existing.data.id);
          setMessages(msgs.data as MessageItem[]);
          await markConversationRead(existing.data.id);
        }
      } catch { /* no conversation yet */ }
      setLoading(false);
    }
    init();
  }, [tripId]);

  // Realtime — subscribe to new messages in this conversation
  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();
    // Mock client won't have channel — guard
    if (!("channel" in supabase)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase as any)
      .channel(`trip-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            // Don't add if already present
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Replace matching optimistic message from the same sender
            const withoutOpt = prev.filter(
              (m) => !(m.id.startsWith("opt-") && m.sender.id === (newMsg.senderId as string))
            );
            return [
              ...withoutOpt,
              {
                id: newMsg.id as string,
                content: newMsg.content as string,
                type: (newMsg.type as string) ?? "text",
                mediaUrl: (newMsg.mediaUrl as string | null) ?? null,
                createdAt: newMsg.createdAt as string,
                sender: { id: newMsg.senderId as string, name: null, avatarUrl: null },
              },
            ];
          });
        }
      )
      .subscribe();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => { (supabase as any).removeChannel(channel); };
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleCreateChat() {
    setCreating(true);
    try {
      const res = await createTripGroupChat(tripId);
      if (res.data) {
        setConversationId(res.data.conversationId);
        setParticipantCount(1);
        setMessages([]);
      }
    } catch {}
    setCreating(false);
  }

  async function handleSend() {
    if (!input.trim() || !conversationId || sending) return;
    const text = input.trim();
    setInput("");

    // Optimistic
    const optimistic: MessageItem = {
      id: `opt-${Date.now()}`,
      content: text,
      type: "text",
      mediaUrl: null,
      createdAt: new Date(),
      sender: {
        id: user?.id ?? "",
        name: user?.user_metadata?.name ?? "คุณ",
        avatarUrl: user?.user_metadata?.avatarUrl ?? null,
      },
    };
    setMessages((prev) => [...prev, optimistic]);

    setSending(true);
    try {
      const res = await sendMessage(conversationId, text);
      if (res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? (res.data as MessageItem) : m))
        );
      }
    } catch {
      // revert on error
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date
  const grouped: { date: string; msgs: MessageItem[] }[] = [];
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last?.date === d) last.msgs.push(msg);
    else grouped.push({ date: d, msgs: [msg] });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-6 h-6 text-[#398AB9] animate-spin" />
        <p className="text-xs text-gray-400">กำลังโหลดแชท...</p>
      </div>
    );
  }

  // No conversation yet — show create CTA
  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-4">
        <div className="w-16 h-16 bg-[#398AB9]/10 dark:bg-[#398AB9]/20 rounded-2xl flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-[#398AB9]" />
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-slate-200 mb-1">สร้างกรุ๊ปแชทสำหรับทริปนี้</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            สมาชิกทุกคนในทริปจะเข้าร่วมห้องแชทนี้โดยอัตโนมัติ
          </p>
        </div>
        <button
          onClick={handleCreateChat}
          disabled={creating}
          className="flex items-center gap-2 bg-[#398AB9] hover:bg-[#1C658C] text-white text-sm font-semibold px-6 py-3 rounded-2xl transition disabled:opacity-60"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
          {creating ? "กำลังสร้าง..." : "สร้างกรุ๊ปแชท"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[480px] md:h-[520px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
        <MessageCircle className="w-4 h-4 text-[#398AB9]" />
        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 flex-1 truncate">
          {tripTitle}
        </span>
        {participantCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
            <Users className="w-3.5 h-3.5" />
            {participantCount}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-gray-50/50 dark:bg-slate-900/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <span className="text-3xl">👋</span>
            <p className="text-sm text-gray-400 dark:text-slate-500">ยังไม่มีข้อความ — เริ่มสนทนาได้เลย!</p>
          </div>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-2 py-2 my-1">
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium px-2">{date}</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            </div>

            {msgs.map((msg, i) => {
              const isMe = msg.sender.id === user?.id;
              const prevMsg = i > 0 ? msgs[i - 1] : null;
              const showAvatar = !isMe && (prevMsg?.sender.id !== msg.sender.id || !prevMsg);

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 mb-0.5 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {/* Avatar placeholder for alignment */}
                  {!isMe && (
                    <div className="w-7 h-7 flex-shrink-0">
                      {showAvatar && (
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-[#398AB9] flex items-center justify-center text-white text-[10px] font-bold">
                          {msg.sender.avatarUrl ? (
                            <img
                              src={msg.sender.avatarUrl}
                              alt={msg.sender.name ?? ""}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            (msg.sender.name ?? "?").charAt(0).toUpperCase()
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {showAvatar && !isMe && (
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1 mb-0.5">
                        {msg.sender.name ?? "ผู้ใช้"}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-[#398AB9] text-white rounded-br-sm"
                          : "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-sm border border-gray-100 dark:border-slate-600"
                      } ${msg.id.startsWith("opt-") ? "opacity-70" : ""}`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-gray-300 dark:text-slate-600 mt-0.5 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-3 py-2.5 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ข้อความ..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 px-3 py-2 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 focus:outline-none focus:border-[#398AB9] max-h-24 overflow-y-auto"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-9 h-9 bg-[#398AB9] hover:bg-[#1C658C] disabled:bg-gray-200 dark:disabled:bg-slate-700 text-white disabled:text-gray-400 rounded-full flex items-center justify-center transition flex-shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
