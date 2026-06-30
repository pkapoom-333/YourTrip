"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Plus, MapPin, Star, Eye, EyeOff, Trash2, Edit, CheckCircle,
} from "lucide-react";
import type { AdminPlace } from "@/server/actions/admin";
import { deletePlace, togglePlacePublished, togglePlaceFeatured } from "@/server/actions/admin";

const CATEGORY_LABELS: Record<string, string> = {
  attraction: "สถานที่ท่องเที่ยว",
  restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่",
  hotel: "ที่พัก",
  activity: "กิจกรรม",
};

interface Props {
  initialPlaces: AdminPlace[];
  total: number;
  initialSearch: string;
  initialPage: number;
}

export default function AdminPlacesClient({ initialPlaces, total, initialSearch, initialPage }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (q: string) => {
    setSearch(q);
    startTransition(() => {
      router.push(`/admin/places?q=${encodeURIComponent(q)}&page=1`);
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบสถานที่ "${name}"? ไม่สามารถกู้คืนได้`)) return;
    startTransition(async () => {
      await deletePlace(id);
      router.refresh();
    });
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    startTransition(async () => {
      await togglePlacePublished(id, !current);
      router.refresh();
    });
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    startTransition(async () => {
      await togglePlaceFeatured(id, !current);
      router.refresh();
    });
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">สถานที่</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">ทั้งหมด {total.toLocaleString()} สถานที่</p>
        </div>
        <Link
          href="/admin/places/new"
          className="flex items-center gap-2 bg-[#398AB9] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1C658C] transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสถานที่
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="ค้นหาชื่อ, จังหวัด..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#398AB9]"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">สถานที่</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">ประเภท</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">รีวิว</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">สถานะ</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {initialPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{place.name}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">{place.province ?? place.region}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                      {CATEGORY_LABELS[place.category] ?? place.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{place.reviewCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        place.isPublished
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
                      }`}>
                        {place.isPublished ? "เผยแพร่" : "ซ่อน"}
                      </span>
                      {place.isFeatured && (
                        <span className="text-xs bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                          แนะนำ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleFeatured(place.id, place.isFeatured)}
                        title={place.isFeatured ? "ยกเลิกแนะนำ" : "แนะนำ"}
                        className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${place.isFeatured ? "fill-amber-400" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(place.id, place.isPublished)}
                        title={place.isPublished ? "ซ่อน" : "เผยแพร่"}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {place.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <Link
                        href={`/admin/places/${place.id}/edit`}
                        className="p-1.5 rounded-lg text-[#398AB9] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(place.id, place.name)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700">
            <span className="text-xs text-gray-500 dark:text-slate-400">หน้า {initialPage} จาก {totalPages}</span>
            <div className="flex gap-2">
              {initialPage > 1 && (
                <button
                  onClick={() => router.push(`/admin/places?q=${search}&page=${initialPage - 1}`)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  ก่อนหน้า
                </button>
              )}
              {initialPage < totalPages && (
                <button
                  onClick={() => router.push(`/admin/places?q=${search}&page=${initialPage + 1}`)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#398AB9] text-white hover:bg-[#1C658C]"
                >
                  ถัดไป
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
