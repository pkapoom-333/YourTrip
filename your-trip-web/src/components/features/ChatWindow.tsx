"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead } from "@/server/actions/messages";
import type { MessageItem } from "@/server/actions/messages";
import { Phone, Video, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OtherUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  username: string | null;
}

interface Props {
  conversationId: string;
  initialMessages: MessageItem[];
  otherUser: OtherUser;
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

function shouldShowDate(prev: MessageItem | undefined, cur: MessageItem): boolean {
  if (!prev) return true;
  const a = new Date(prev.createdAt).toDateString();
  const b = new Date(cur.createdAt).toDateString();
  return a !== b;
}

export default function ChatWindow({ conversationId, initialMessages, otherUser }: Props) {
  const { user } = useUser();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  // Initial scroll — instant
  useEffect(() => {
    scrollToBottom("instant");
  }, [scrollToBottom]);

  // Smooth scroll on new messages
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, scrollToBottom]);

  // Mark as read on mount
  useEffect(() => {
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const raw = payload.new as {
            id: string;
            conversationId: string;
            senderId: string;
            content: string;
            type: string;
            mediaUrl: string | null;
            createdAt: string;
          };

          // Own messages are already handled optimistically
          if (raw.senderId === user.id) return;

          const newMsg: MessageItem = {
            id: raw.id,
            senderId: raw.senderId,
            content: raw.content,
            type: raw.type,
            mediaUrl: raw.mediaUrl,
            createdAt: new Date(raw.createdAt),
            sender: {
              id: otherUser.id,
              name: otherUser.name,
              avatarUrl: otherUser.avatarUrl,
            },
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Mark read when we receive a message while window is open
          markConversationRead(conversationId).catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, otherUser]);

  async function handleSend() {
    if (!input.trim() || sending || !user) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimistic: MessageItem = {
      id: tempId,
      senderId: user.id,
      content,
      type: "text",
      mediaUrl: null,
      createdAt: new Date(),
      sender: {
        id: user.id,
        name: (user.user_metadata?.full_name as string | null) ?? null,
        avatarUrl: (user.user_metadata?.avatar_url as string | null) ?? null,
      },
    };
    setMessages((prev) => [...prev, optimistic]);

    const { data, error } = await sendMessage(conversationId, content);
    setSending(false);

    if (data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
    } else {
      // Rollback optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      console.error("Send failed:", error);
    }

    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function openVoiceCall() {
    window.open(
      `https://meet.jit.si/yourtrip-${conversationId}#config.startWithAudioOnly=true&config.startWithVideoMuted=true`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openVideoCall() {
    window.open(
      `https://meet.jit.si/yourtrip-${conversationId}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const displayName = otherUser.name ?? otherUser.username ?? "ผู้ใช้";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-[100dvh] md:h-screen bg-[#F8FAFC] dark:bg-slate-900">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 shadow-sm flex-shrink-0">
        <Link
          href="/messages"
          className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          {otherUser.avatarUrl ? (
            <Image
              src={otherUser.avatarUrl}
              alt={displayName}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#398AB9] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
              {displayName}
            </p>
            {otherUser.username && (
              <p className="text-xs text-gray-400 dark:text-slate-500">@{otherUser.username}</p>
            )}
          </div>
        </Link>

        <button
          onClick={openVoiceCall}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-[#398AB9] dark:hover:text-[#398AB9] transition"
          title="โทรด้วยเสียง"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={openVideoCall}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-[#398AB9] dark:hover:text-[#398AB9] transition"
          title="วิดีโอคอล"
        >
          <Video className="w-5 h-5" />
        </button>
      </div>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-slate-500 gap-2">
            {otherUser.avatarUrl ? (
              <Image
                src={otherUser.avatarUrl}
                alt={displayName}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover mb-1"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#398AB9]/20 flex items-center justify-center text-[#398AB9] text-xl font-bold mb-1">
                {initials}
              </div>
            )}
            <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{displayName}</p>
            <p className="text-xs">เริ่มต้นการสนทนาเรื่องการท่องเที่ยว! ✈️</p>
          </div>
        )}

        <div className="space-y-1">
          {messages.map((msg, idx) => {
            const isOwn = msg.senderId === user?.id;
            const prev = messages[idx - 1];
            const showDate = shouldShowDate(prev, msg);
            const isTemp = msg.id.startsWith("temp-");

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-3 py-0.5 rounded-full">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Other user avatar */}
                  {!isOwn && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-slate-300 flex-shrink-0">
                      {(msg.sender.name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                        isOwn
                          ? `bg-[#398AB9] text-white rounded-br-sm ${isTemp ? "opacity-70" : ""}`
                          : "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 border border-gray-100 dark:border-slate-600 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl px-4 py-2.5 text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#398AB9] transition"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-[#398AB9] text-white flex items-center justify-center hover:bg-[#1C658C] transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
