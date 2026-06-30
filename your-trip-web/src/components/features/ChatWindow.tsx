"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead } from "@/server/actions/messages";
import type { MessageItem } from "@/server/actions/messages";
import { Phone, Video, Send, ArrowLeft, ImageIcon, Smile, Check, CheckCheck } from "lucide-react";
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

// Quick emoji reactions
const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "วันนี้";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "เมื่อวาน";
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function shouldShowDate(prev: MessageItem | undefined, cur: MessageItem): boolean {
  if (!prev) return true;
  return new Date(prev.createdAt).toDateString() !== new Date(cur.createdAt).toDateString();
}

export default function ChatWindow({ conversationId, initialMessages, otherUser }: Props) {
  const { user } = useUser();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherLastRead, setOtherLastRead] = useState<Date | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => { scrollToBottom("instant"); }, [scrollToBottom]);
  useEffect(() => { scrollToBottom("smooth"); }, [messages, scrollToBottom]);

  useEffect(() => {
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId]);

  // ── Supabase Realtime: new messages ──
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversationId=eq.${conversationId}`,
      }, (payload: { new: Record<string, unknown> }) => {
        const raw = payload.new as {
          id: string; conversationId: string; senderId: string;
          content: string; type: string; mediaUrl: string | null; createdAt: string;
        };
        if (raw.senderId === user.id) return;
        const newMsg: MessageItem = {
          id: raw.id, senderId: raw.senderId, content: raw.content,
          type: raw.type, mediaUrl: raw.mediaUrl, createdAt: new Date(raw.createdAt),
          sender: { id: otherUser.id, name: otherUser.name, avatarUrl: otherUser.avatarUrl },
        };
        setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        markConversationRead(conversationId).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user?.id, otherUser]);

  // ── Supabase Presence: online status + typing ──
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    const presenceChannel = supabase.channel(`presence:${conversationId}`, {
      config: { presence: { key: user.id } }
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const otherOnline = Object.keys(state).some((k) => k === otherUser.id);
        setIsOnline(otherOnline);

        // Check typing
        const otherState = state[otherUser.id] as Array<{ typing?: boolean }> | undefined;
        setIsTyping(otherState?.[0]?.typing === true);
      })
      .on("presence", { event: "join" }, ({ key }: { key: string }) => {
        if (key === otherUser.id) setIsOnline(true);
      })
      .on("presence", { event: "leave" }, ({ key }: { key: string }) => {
        if (key === otherUser.id) { setIsOnline(false); setIsTyping(false); }
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ online: true, typing: false });
        }
      });

    return () => { supabase.removeChannel(presenceChannel); };
  }, [conversationId, user?.id, otherUser.id]);

  // ── Read receipts: poll other user's lastReadAt ──
  useEffect(() => {
    const supabase = createClient();
    const fetchReadAt = async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("lastReadAt")
        .eq("conversationId", conversationId)
        .eq("userId", otherUser.id)
        .single();
      if (data?.lastReadAt) setOtherLastRead(new Date(data.lastReadAt));
    };
    fetchReadAt();

    const channel = supabase.channel(`read:${conversationId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "conversation_participants",
        filter: `conversationId=eq.${conversationId}`,
      }, (payload: { new: Record<string, unknown> }) => {
        if (payload.new.userId === otherUser.id && payload.new.lastReadAt) {
          setOtherLastRead(new Date(payload.new.lastReadAt as string));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, otherUser.id]);

  // ── Handlers ──
  async function handleSend() {
    if (!input.trim() || sending || !user) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimistic: MessageItem = {
      id: tempId, senderId: user.id, content, type: "text", mediaUrl: null,
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
      setMessages((prev) => prev.map((m) => m.id === tempId ? data : m));
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      console.error("Send failed:", error);
    }
    inputRef.current?.focus();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "chat");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = (await res.json()) as { url?: string; error?: string };

      if (result.url) {
        const tempId = `temp-img-${Date.now()}`;
        const optimistic: MessageItem = {
          id: tempId, senderId: user.id, content: "รูปภาพ", type: "image",
          mediaUrl: result.url, createdAt: new Date(),
          sender: {
            id: user.id,
            name: (user.user_metadata?.full_name as string | null) ?? null,
            avatarUrl: (user.user_metadata?.avatar_url as string | null) ?? null,
          },
        };
        setMessages((prev) => [...prev, optimistic]);
        const { data } = await sendMessage(conversationId, "รูปภาพ", "image", result.url);
        if (data) setMessages((prev) => prev.map((m) => m.id === tempId ? data : m));
        else setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    // Broadcast typing status
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {}, 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function addReaction(msgId: string, emoji: string) {
    setReactions((prev) => {
      const existing = prev[msgId] ?? [];
      const has = existing.includes(emoji);
      return { ...prev, [msgId]: has ? existing.filter((e) => e !== emoji) : [...existing, emoji] };
    });
    setHoveredMsg(null);
  }

  function openVoiceCall() {
    window.open(`https://meet.jit.si/yourtrip-${conversationId}#config.startWithAudioOnly=true&config.startWithVideoMuted=true`, "_blank", "noopener,noreferrer");
  }
  function openVideoCall() {
    window.open(`https://meet.jit.si/yourtrip-${conversationId}`, "_blank", "noopener,noreferrer");
  }

  const displayName = otherUser.name ?? otherUser.username ?? "ผู้ใช้";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Last own message sent (for read receipt)
  const lastOwnMsg = [...messages].reverse().find((m) => m.senderId === user?.id && !m.id.startsWith("temp-"));
  const isLastOwnMsgRead = lastOwnMsg && otherLastRead && new Date(lastOwnMsg.createdAt) <= otherLastRead;

  return (
    <div className="flex flex-col h-[100dvh] md:h-screen bg-[#F8FAFC] dark:bg-slate-900">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 shadow-sm flex-shrink-0">
        <Link href="/messages" className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            {otherUser.avatarUrl ? (
              <Image src={otherUser.avatarUrl} alt={displayName} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#398AB9] flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
            {/* Online dot */}
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${isOnline ? "bg-green-400" : "bg-gray-300 dark:bg-slate-600"}`} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {isTyping ? "กำลังพิมพ์..." : isOnline ? "ออนไลน์" : "ออฟไลน์"}
            </p>
          </div>
        </Link>

        <button onClick={openVoiceCall} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-[#398AB9] transition" title="โทรด้วยเสียง">
          <Phone className="w-5 h-5" />
        </button>
        <button onClick={openVideoCall} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-[#398AB9] transition" title="วิดีโอคอล">
          <Video className="w-5 h-5" />
        </button>
      </div>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4" onClick={() => { setHoveredMsg(null); setShowEmojiPicker(false); }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-slate-500 gap-2">
            {otherUser.avatarUrl ? (
              <Image src={otherUser.avatarUrl} alt={displayName} width={56} height={56} className="w-14 h-14 rounded-full object-cover mb-1" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#398AB9]/20 flex items-center justify-center text-[#398AB9] text-xl font-bold mb-1">{initials}</div>
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
            const msgReactions = reactions[msg.id] ?? [];
            const isLastOwn = msg.id === lastOwnMsg?.id;

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-3 py-0.5 rounded-full">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div
                  className={`group relative flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  onMouseEnter={() => setHoveredMsg(msg.id)}
                  onMouseLeave={() => setHoveredMsg(null)}
                >
                  {/* Other user avatar */}
                  {!isOwn && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-slate-300 flex-shrink-0">
                      {(msg.sender.name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
                    {/* Message bubble */}
                    {msg.type === "image" && msg.mediaUrl ? (
                      <div className={`rounded-2xl overflow-hidden ${isTemp ? "opacity-70" : ""} ${isOwn ? "rounded-br-sm" : "rounded-bl-sm"}`}>
                        <Image
                          src={msg.mediaUrl}
                          alt="รูปภาพ"
                          width={240}
                          height={240}
                          className="max-w-[240px] object-cover cursor-pointer hover:opacity-90 transition"
                          onClick={() => window.open(msg.mediaUrl ?? "", "_blank")}
                        />
                      </div>
                    ) : (
                      <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                        isOwn
                          ? `bg-[#398AB9] text-white rounded-br-sm ${isTemp ? "opacity-70" : ""}`
                          : "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 border border-gray-100 dark:border-slate-600 rounded-bl-sm"
                      }`}>
                        {msg.content}
                      </div>
                    )}

                    {/* Reactions */}
                    {msgReactions.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap">
                        {msgReactions.map((r, i) => (
                          <button key={i} onClick={() => addReaction(msg.id, r)}
                            className="text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full px-1.5 py-0.5 hover:bg-gray-50 shadow-sm">
                            {r}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Time + read receipt */}
                    <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">{formatTime(msg.createdAt)}</span>
                      {isOwn && isLastOwn && (
                        isLastOwnMsgRead
                          ? <CheckCheck className="w-3 h-3 text-[#398AB9]" />
                          : <Check className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Quick react button on hover */}
                  {hoveredMsg === msg.id && !isTemp && (
                    <div className={`absolute ${isOwn ? "right-full mr-1" : "left-full ml-1"} bottom-4 flex gap-0.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl px-2 py-1 shadow-md z-10`}>
                      {QUICK_EMOJIS.map((e) => (
                        <button key={e} onClick={(ev) => { ev.stopPropagation(); addReaction(msg.id, e); }}
                          className="text-base hover:scale-125 transition-transform">
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
              {displayName.slice(0, 1)}
            </div>
            <div className="bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── Input bar ── */}
      <div className="px-3 py-2.5 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex-shrink-0">
        {uploadingImage && (
          <div className="text-xs text-gray-400 dark:text-slate-500 text-center mb-1 animate-pulse">กำลังอัปโหลดรูปภาพ...</div>
        )}
        <div className="flex items-center gap-2">
          {/* Image upload */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-[#398AB9] transition disabled:opacity-40 flex-shrink-0"
            title="ส่งรูปภาพ"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Emoji picker toggle */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setShowEmojiPicker((v) => !v); }}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-[#398AB9] transition"
            >
              <Smile className="w-5 h-5" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl shadow-xl p-2 flex gap-1 z-20" onClick={(e) => e.stopPropagation()}>
                {["😊","😂","❤️","🔥","👍","🙏","😍","😭","😅","✈️","🏖️","🍕"].map((e) => (
                  <button key={e} onClick={() => { setInput((v) => v + e); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                    className="text-xl hover:scale-125 transition-transform p-0.5">
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
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
