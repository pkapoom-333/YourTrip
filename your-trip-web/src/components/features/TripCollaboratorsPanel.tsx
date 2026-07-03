
"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Users, Plus, X, UserCheck, Shield } from "lucide-react";
import {
  getTripCollaborators,
  addTripCollaborator,
  removeTripCollaborator,
  TripCollaboratorItem,
} from "@/server/actions/trips";
import { searchUsersForDM } from "@/server/actions/messages";
import { useToast } from "@/components/shared/Toast";

interface Props {
  tripId: string;
  isOwner: boolean;
}

export default function TripCollaboratorsPanel({ tripId, isOwner }: Props) {
  const [open, setOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<TripCollaboratorItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string | null; username: string | null; avatarUrl: string | null }>>([]);
  const [pending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { success, error } = useToast();

  async function load() {
    if (loaded) return;
    const { data } = await getTripCollaborators(tripId);
    setCollaborators(data);
    setLoaded(true);
  }

  function toggle() {
    if (!open) load();
    setOpen((v) => !v);
  }

  function searchUsers(q: string) {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) { setSuggestions([]); return; }
    timerRef.current = setTimeout(async () => {
      const { data } = await searchUsersForDM(q);
      setSuggestions(data.filter((u) => !collaborators.find((c) => c.user.id === u.id)));
    }, 300);
  }

  function add(userId: string) {
    startTransition(async () => {
      const res = await addTripCollaborator(tripId, userId);
      if (!res.ok) { error(res.error ?? "เกิดข้อผิดพลาด"); return; }
      const { data } = await getTripCollaborators(tripId);
      setCollaborators(data);
      setQuery("");
      setSuggestions([]);
      success("เพิ่มผู้ร่วมแก้ไขแล้ว ✅");
    });
  }

  function remove(userId: string) {
    startTransition(async () => {
      await removeTripCollaborator(tripId, userId);
      setCollaborators((prev) => prev.filter((c) => c.user.id !== userId));
      success("นำออกแล้ว");
    });
  }

  return (
    <div className="mt-4">
      <button
        onClick={toggle}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-[#398AB9] transition-colors"
      >
        <Users className="w-4 h-4" />
        ผู้ร่วมแก้ไข {loaded && collaborators.length > 0 ? `(${collaborators.length})` : ""}
      </button>

      {open && (
        <div className="mt-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-3">
          {/* Collaborator list */}
          {collaborators.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-slate-500">ยังไม่มีผู้ร่วมแก้ไข</p>
          )}
          {collaborators.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                {c.user.avatarUrl
                  ? <Image src={c.user.avatarUrl} alt="" width={32} height={32} className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-[#398AB9] text-white text-xs font-bold">{(c.user.name ?? "U")[0]}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">{c.user.name ?? "ผู้ใช้"}</p>
                <p className="text-[10px] text-gray-400">{c.role === "editor" ? "✏️ แก้ไขได้" : "👁️ ดูเท่านั้น"}</p>
              </div>
              {isOwner && (
                <button onClick={() => remove(c.user.id)} disabled={pending}
                  className="text-gray-300 hover:text-red-400 transition p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Add collaborator (owner only) */}
          {isOwner && (
            <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="ค้นหาผู้ใช้เพื่อเพิ่ม..."
                  className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-transparent dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#398AB9]/40"
                />
                <Plus className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
              {suggestions.length > 0 && (
                <ul className="mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg overflow-hidden">
                  {suggestions.map((u) => (
                    <li key={u.id}>
                      <button onClick={() => add(u.id)} disabled={pending}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#398AB9] flex items-center justify-center text-white text-xs flex-shrink-0">
                          {(u.name ?? "U")[0]}
                        </div>
                        <span className="text-gray-700 dark:text-slate-200">{u.name ?? u.username ?? "ผู้ใช้"}</span>
                        {u.username && <span className="text-xs text-gray-400">@{u.username}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
