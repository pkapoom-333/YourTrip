"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Search, Plus, X } from "lucide-react";
import type { ConversationItem } from "@/server/actions/messages";
import { getOrCreateConversation, searchUsersForDM } from "@/server/actions/messages";

interface SearchUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface Props {
  initialConversations: ConversationItem[];
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = diff / 3600000;
  if (hours < 1) return `${Math.floor(diff / 60000)} นาที`;
  if (hours < 24) return `${Math.floor(hours)} ชม.`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function getInitials(name: string | null, username: string | null): string {
  const str = name ?? username ?? "?";
  return str.slice(0, 2).toUpperCase();
}

export default function MessagesClient({ initialConversations }: Props) {
  const router = useRouter();
  const [conversations] = useState<ConversationItem[]>(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDM, setShowNewDM] = useState(false);
  const [dmQuery, setDmQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null!);

  // Debounced user search for new DM
  useEffect(() => {
    if (!dmQuery.trim()) {
      setSearchResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await searchUsersForDM(dmQuery);
      setSearchResults(data);
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [dmQuery]);

  async function startDM(userId: string) {
    if (starting) return;
    setStarting(true);
    const { data, error } = await getOrCreateConversation(userId);
    setStarting(false);
    if (data) {
      setShowNewDM(false);
      router.push(`/messages/${data.conversationId}`);
    } else {
      console.error(error);
    }
  }

  // Filter existing conversations by query
  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const name = (c.otherUser.name ?? c.otherUser.username ?? "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="max-w-xl mx-auto md:mx-0 md:max-w-none">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 z-10">
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">ข้อความ</h1>
            {totalUnread > 0 && (
              <span className="text-[11px] font-bold bg-[#398AB9] text-white px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={() => { setShowNewDM(true); setDmQuery(""); setSearchResults([]); }}
            className="p-2 rounded-xl bg-[#398AB9]/10 text-[#398AB9] hover:bg-[#398AB9]/20 transition"
            title="สนทนาใหม่"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาการสนทนา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#398AB9] transition"
            />
          </div>
        </div>
      </div>

      {/* New DM modal */}
      {showNewDM && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">สนทนาใหม่</h2>
              <button
                onClick={() => setShowNewDM(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาผู้ใช้..."
                  value={dmQuery}
                  onChange={(e) => setDmQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#398AB9] transition text-gray-800 dark:text-slate-100"
                />
              </div>

              {searching && (
                <p className="text-xs text-center text-gray-400 dark:text-slate-500 py-4">กำลังค้นหา...</p>
              )}

              {!searching && dmQuery && searchResults.length === 0 && (
                <p className="text-xs text-center text-gray-400 dark:text-slate-500 py-4">ไม่พบผู้ใช้</p>
              )}

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startDM(u.id)}
                    disabled={starting}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition text-left disabled:opacity-50"
                  >
                    {u.avatarUrl ? (
                      <Image
                        src={u.avatarUrl}
                        alt={u.name ?? ""}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#398AB9] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(u.name, u.username)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {u.name ?? u.username ?? "ผู้ใช้"}
                      </p>
                      {u.username && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">@{u.username}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation list */}
      <div className="divide-y divide-gray-50 dark:divide-slate-800">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-500 gap-3">
            <MessageSquare className="w-12 h-12 opacity-30" />
            {conversations.length === 0 ? (
              <>
                <p className="text-sm font-medium">ยังไม่มีการสนทนา</p>
                <p className="text-xs">เริ่มการสนทนาเรื่องการท่องเที่ยว!</p>
                <button
                  onClick={() => { setShowNewDM(true); setDmQuery(""); }}
                  className="mt-2 px-4 py-2 bg-[#398AB9] text-white text-sm font-medium rounded-xl hover:bg-[#1C658C] transition"
                >
                  เริ่มสนทนาใหม่
                </button>
              </>
            ) : (
              <p className="text-sm">ไม่พบการสนทนา</p>
            )}
          </div>
        )}

        {filtered.map((convo) => {
          const { otherUser, lastMessage, unreadCount } = convo;
          const displayName = otherUser.name ?? otherUser.username ?? "ผู้ใช้";
          const initials = getInitials(otherUser.name, otherUser.username);
          const preview = lastMessage?.content ?? "เริ่มต้นการสนทนา";
          const truncated = preview.length > 40 ? preview.slice(0, 40) + "…" : preview;

          return (
            <Link
              key={convo.id}
              href={`/messages/${convo.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {otherUser.avatarUrl ? (
                  <Image
                    src={otherUser.avatarUrl}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#398AB9] flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#398AB9] rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-sm truncate ${unreadCount > 0 ? "font-semibold text-gray-900 dark:text-slate-100" : "font-medium text-gray-700 dark:text-slate-200"}`}>
                    {displayName}
                  </p>
                  {lastMessage && (
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 flex-shrink-0 ml-2">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate ${unreadCount > 0 ? "text-gray-700 dark:text-slate-300 font-medium" : "text-gray-400 dark:text-slate-500"}`}>
                  {truncated}
                </p>
              </div>

              {/* Unread badge */}
              {unreadCount > 0 && (
                <span className="ml-1 min-w-[20px] h-5 bg-[#398AB9] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
