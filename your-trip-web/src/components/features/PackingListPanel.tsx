
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  Package, Plus, X, Check, ChevronDown, ChevronUp,
  Shirt, FileText, Smartphone, Droplets, ShoppingBag
} from "lucide-react";
import {
  getPackingList, initPackingList, addPackingItem,
  togglePackingItem, deletePackingItem, PackingItemData
} from "@/server/actions/trips";

const CATEGORIES: Array<{ id: string; label: string; icon: typeof Package; color: string }> = [
  { id: "documents", label: "เอกสาร", icon: FileText, color: "text-blue-500" },
  { id: "electronics", label: "อิเล็กทรอนิกส์", icon: Smartphone, color: "text-purple-500" },
  { id: "clothing", label: "เสื้อผ้า", icon: Shirt, color: "text-pink-500" },
  { id: "toiletries", label: "ของใช้ส่วนตัว", icon: Droplets, color: "text-teal-500" },
  { id: "other", label: "อื่นๆ", icon: ShoppingBag, color: "text-orange-500" },
];

interface Props { tripId: string }

export default function PackingListPanel({ tripId }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PackingItemData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("other");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    await initPackingList(tripId);
    const { data } = await getPackingList(tripId);
    setItems(data);
    setLoaded(true);
  }

  function toggle() {
    if (!open && !loaded) load();
    setOpen((v) => !v);
  }

  function handleToggle(item: PackingItemData) {
    const newVal = !item.isPacked;
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isPacked: newVal } : i));
    startTransition(async () => { await togglePackingItem(item.id, newVal); });
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => { await deletePackingItem(id); });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const optimistic: PackingItemData = {
      id: `tmp-${Date.now()}`, name: newName.trim(),
      category: newCat, isPacked: false, order: items.length,
    };
    setItems((prev) => [...prev, optimistic]);
    const name = newName.trim();
    const cat = newCat;
    setNewName("");
    startTransition(async () => {
      const { data } = await addPackingItem(tripId, name, cat);
      if (data) {
        setItems((prev) => prev.map((i) => i.id === optimistic.id ? data : i));
      }
    });
  }

  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.id),
  })).filter((c) => c.items.length > 0);

  const packedCount = items.filter((i) => i.isPacked).length;
  const totalCount = items.length;
  const pct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <button onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
        <div className="flex items-center gap-2.5">
          <Package className="w-4 h-4 text-[#398AB9]" />
          <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">รายการของที่ต้องแพ็ค</span>
          {loaded && totalCount > 0 && (
            <span className="text-xs bg-[#398AB9]/10 text-[#398AB9] px-2 py-0.5 rounded-full font-medium">
              {packedCount}/{totalCount}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>แพ็คแล้ว {packedCount} จาก {totalCount} รายการ</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#398AB9] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {pct === 100 && (
                <p className="text-xs text-green-500 mt-1 font-medium">🎉 แพ็คครบแล้ว พร้อมเดินทาง!</p>
              )}
            </div>
          )}

          {/* Items by category */}
          {byCategory.map(({ id, label, icon: Icon, color, items: catItems }) => (
            <div key={id} className="mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Icon className={`w-3 h-3 ${color}`} /> {label}
              </p>
              <div className="space-y-1">
                {catItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 group">
                    <button onClick={() => handleToggle(item)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        item.isPacked
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300 dark:border-slate-600 hover:border-[#398AB9]"
                      }`}>
                      {item.isPacked && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`text-sm flex-1 ${item.isPacked ? "line-through text-gray-400 dark:text-slate-500" : "text-gray-700 dark:text-slate-200"}`}>
                      {item.name}
                    </span>
                    <button onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add new item */}
          <form onSubmit={handleAdd} className="mt-4 flex gap-2">
            <select value={newCat} onChange={(e) => setNewCat(e.target.value)}
              className="text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 focus:outline-none flex-shrink-0">
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input ref={inputRef} value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="เพิ่มของ..."
              className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:bg-slate-700 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#398AB9]/40 min-w-0" />
            <button type="submit" disabled={pending || !newName.trim()}
              className="flex-shrink-0 w-8 h-8 bg-[#398AB9] text-white rounded-lg flex items-center justify-center hover:bg-[#1C658C] disabled:opacity-50">
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
