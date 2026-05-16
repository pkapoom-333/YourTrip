"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  Users, MapPin, Calendar, Search, Filter,
  Heart, X, Star, MessageCircle, ChevronRight,
  Globe, Camera, Compass,
} from "lucide-react";
import {
  getDiscoverBuddies,
  getIncomingRequests,
  getMatchedBuddies,
  sendBuddyRequest,
  acceptBuddyRequest,
  declineBuddyRequest,
  type BuddyProfileItem,
  type BuddyRequestItem,
} from "@/server/actions/buddy";

interface BuddyProfile {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string | null;
  age: number;
  location: string;
  bio: string;
  destination: string;
  travelDate: string;
  travelStyle: string[];
  interests: string[];
  tripCount: number;
  rating: number;
  isVerified: boolean;
  mutualFriends?: number;
  photos: string[];
}

const MOCK_BUDDIES: BuddyProfile[] = [
  {
    id: "b1",
    name: "สิริมา กันทา",
    avatar: "สก",
    age: 26,
    location: "กรุงเทพฯ",
    bio: "ชอบเที่ยวธรรมชาติ ไม่ชอบนักท่องเที่ยวเยอะ ชอบตื่นเช้าไปดูพระอาทิตย์ขึ้น ☀️",
    destination: "เชียงใหม่",
    travelDate: "15–18 มิ.ย. 2026",
    travelStyle: ["ธรรมชาติ", "ถ่ายรูป", "ท่องเที่ยวช้าๆ"],
    interests: ["Hiking", "Photography", "Coffee"],
    tripCount: 23,
    rating: 4.9,
    isVerified: true,
    mutualFriends: 3,
    photos: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&h=200&fit=crop",
    ],
  },
  {
    id: "b2",
    name: "ณัฐพล วงค์ใจ",
    avatar: "ณว",
    age: 29,
    location: "เชียงใหม่",
    bio: "คนเชียงใหม่โดยกำเนิด รู้จักสถานที่ลับๆ เยอะมาก พาเที่ยวได้เลย 🏔️",
    destination: "ดอยอ่างขาง",
    travelDate: "20–22 มิ.ย. 2026",
    travelStyle: ["ไกด์ท้องถิ่น", "Off-the-beaten-path", "Budget"],
    interests: ["Local food", "Motorbike", "Culture"],
    tripCount: 47,
    rating: 4.8,
    isVerified: true,
    mutualFriends: 1,
    photos: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop",
    ],
  },
  {
    id: "b3",
    name: "มินตรา พลเยี่ยม",
    avatar: "มต",
    age: 24,
    location: "ขอนแก่น",
    bio: "Solo traveler ที่อยากหา buddy ไปด้วยกัน เที่ยวแบบ backpack สบายๆ 🎒",
    destination: "ภูเก็ต",
    travelDate: "1–7 ก.ค. 2026",
    travelStyle: ["Backpacker", "ชายหาด", "Party"],
    interests: ["Diving", "Nightlife", "Local market"],
    tripCount: 12,
    rating: 4.7,
    isVerified: false,
    photos: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=200&h=200&fit=crop",
    ],
  },
  {
    id: "b4",
    name: "ภาณุวัฒน์ รัตนชาติ",
    avatar: "ภว",
    age: 32,
    location: "กรุงเทพฯ",
    bio: "ทำงาน remote ได้ ชอบนั่งคาเฟ่ทำงาน ถ้าไปด้วยกันต้องยอมรับว่าฉันทำงานบ้างนะ 💻",
    destination: "บาหลี",
    travelDate: "10–17 ก.ค. 2026",
    travelStyle: ["Digital Nomad", "Luxury", "วัฒนธรรม"],
    interests: ["Yoga", "Temple", "Fine dining"],
    tripCount: 35,
    rating: 4.6,
    isVerified: true,
    photos: [
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=200&h=200&fit=crop",
    ],
  },
];

const destinations = ["ทั้งหมด", "เชียงใหม่", "ภูเก็ต", "บาหลี", "ญี่ปุ่น", "กรุงเทพฯ"];
const styles = ["ธรรมชาติ", "ชายหาด", "วัฒนธรรม", "Backpacker", "Luxury", "ถ่ายรูป"];

// Map DB BuddyProfileItem → local BuddyProfile
function mapDbToBuddy(u: BuddyProfileItem): BuddyProfile {
  const initials = (u.name ?? "ผ")
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2);
  return {
    id: u.id,
    name: u.name ?? "ผู้ใช้",
    avatar: initials,
    avatarUrl: u.avatarUrl ?? null,
    age: 0,
    location: u.location ?? "ไม่ระบุ",
    bio: u.bio ?? "",
    destination: u.destination ?? "ไม่ระบุ",
    travelDate: "",
    travelStyle: [],
    interests: [],
    tripCount: u.tripCount,
    rating: 0,
    isVerified: u.isVerified,
    photos: [],
  };
}

export default function BuddyPage() {
  const [search, setSearch] = useState("");
  const [destFilter, setDestFilter] = useState("ทั้งหมด");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"discover" | "requests" | "matched">("discover");
  const [showFilter, setShowFilter] = useState(false);
  const [discoverList, setDiscoverList] = useState<BuddyProfile[]>(MOCK_BUDDIES);
  const [requests, setRequests] = useState<BuddyRequestItem[]>([]);
  const [matched, setMatched] = useState<BuddyRequestItem[]>([]);

  // Load real data from DB
  useEffect(() => {
    getDiscoverBuddies(30).then(({ data }) => {
      if (data.length > 0) setDiscoverList(data.map(mapDbToBuddy));
    });
    getIncomingRequests().then(({ data }) => setRequests(data));
    getMatchedBuddies().then(({ data }) => setMatched(data));
  }, []);

  const visible = discoverList.filter((b) => {
    if (passed.has(b.id)) return false;
    if (destFilter !== "ทั้งหมด" && !b.destination.includes(destFilter)) return false;
    if (search && !b.name.includes(search) && !b.destination.includes(search)) return false;
    return true;
  });

  const matchedBuddies = discoverList.filter((b) => liked.has(b.id));

  function like(id: string) {
    setLiked((prev) => new Set([...prev, id]));
    sendBuddyRequest(id).catch(() => {});
  }
  function pass(id: string) {
    setPassed((prev) => new Set([...prev, id]));
  }

  function handleAccept(requestId: string) {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    acceptBuddyRequest(requestId).then(() => {
      getMatchedBuddies().then(({ data }) => setMatched(data));
    }).catch(() => {});
  }

  function handleDecline(requestId: string) {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    declineBuddyRequest(requestId).catch(() => {});
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Travel Buddy</h1>
              <p className="text-xs text-gray-400 mt-0.5">ค้นหาเพื่อนร่วมทริปในฝัน</p>
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-200 transition"
            >
              <Filter className="w-3.5 h-3.5" />
              กรอง
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {([
              { key: "discover", label: "ค้นหา", icon: Compass },
              { key: "requests", label: requests.length > 0 ? `คำขอ (${requests.length})` : "คำขอ", icon: Users },
              { key: "matched", label: `จับคู่ (${matched.length + matchedBuddies.length})`, icon: Heart },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === key
                    ? "bg-[#398AB9] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="bg-white border-b border-gray-100 px-4 py-4">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ หรือ ปลายทาง"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
              />
            </div>
            {/* Destination chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {destinations.map((d) => (
                <button
                  key={d}
                  onClick={() => setDestFilter(d)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    destFilter === d
                      ? "bg-[#398AB9] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DISCOVER tab */}
        {activeTab === "discover" && (
          <div className="px-4 py-4 space-y-4">
            {visible.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">ไม่พบ Buddy</p>
                <p className="text-gray-400 text-xs mt-1">ลองเปลี่ยนตัวกรองดู</p>
              </div>
            ) : (
              visible.map((buddy) => (
                <BuddyCard
                  key={buddy.id}
                  buddy={buddy}
                  isLiked={liked.has(buddy.id)}
                  onLike={() => like(buddy.id)}
                  onPass={() => pass(buddy.id)}
                />
              ))
            )}
          </div>
        )}

        {/* REQUESTS tab */}
        {activeTab === "requests" && (
          <div className="px-4 py-4 space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">ไม่มีคำขอใหม่</p>
                <p className="text-gray-400 text-xs mt-1">เมื่อมีคนส่งคำขอจะแสดงที่นี่</p>
              </div>
            ) : (
              requests.map((req) => {
                const initials = (req.from.name ?? "ผ").split(" ").map((w) => w.charAt(0)).join("").slice(0, 2);
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {req.from.avatarUrl ? (
                        <img src={req.from.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-violet-400 flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 text-sm">{req.from.name ?? "ผู้ใช้"}</p>
                          {req.from.isVerified && (
                            <span className="text-[10px] bg-[#398AB9]/10 text-[#398AB9] px-1.5 py-0.5 rounded-full">✓</span>
                          )}
                        </div>
                        {req.destination && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {req.destination}
                          </div>
                        )}
                      </div>
                    </div>
                    {req.message && (
                      <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-xl px-3 py-2 italic">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="flex-1 py-2 rounded-xl bg-[#398AB9] text-white text-sm font-bold hover:bg-[#1C658C] transition"
                      >
                        รับคำขอ
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MATCHED tab */}
        {activeTab === "matched" && (
          <div className="px-4 py-4 space-y-3">
            {/* Optimistic liked (local) + real DB matched */}
            {matchedBuddies.length === 0 && matched.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">ยังไม่มี Buddy</p>
                <p className="text-gray-400 text-xs mt-1">กด ❤️ หรือส่งคำขอใน Discover</p>
              </div>
            ) : (
              <>
                {/* DB accepted matches */}
                {matched.map((m) => {
                  const initials = (m.from.name ?? "ผ").split(" ").map((w) => w.charAt(0)).join("").slice(0, 2);
                  return (
                    <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                      {m.from.avatarUrl ? (
                        <img src={m.from.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#398AB9] flex items-center justify-center text-white font-bold">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{m.from.name ?? "ผู้ใช้"}</p>
                        {m.destination && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {m.destination}
                          </div>
                        )}
                      </div>
                      <button className="flex items-center gap-1 text-xs text-[#398AB9] font-medium hover:text-[#1C658C] transition">
                        <MessageCircle className="w-4 h-4" />
                        แชท
                      </button>
                    </div>
                  );
                })}
                {/* Optimistic local likes (pending send) */}
                {matchedBuddies.map((buddy) => (
                  <div key={buddy.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 opacity-70">
                    {buddy.avatarUrl ? (
                      <img src={buddy.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#398AB9] flex items-center justify-center text-white font-bold">
                        {buddy.avatar}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{buddy.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">รอการตอบรับ...</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function BuddyCard({
  buddy,
  isLiked,
  onLike,
  onPass,
}: {
  buddy: BuddyProfile;
  isLiked: boolean;
  onLike: () => void;
  onPass: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Photo grid */}
      {buddy.photos.length > 0 && (
        <div className={`grid gap-0.5 ${buddy.photos.length >= 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {buddy.photos.map((p, i) => (
            <div key={i} className={`${buddy.photos.length === 1 ? "aspect-[4/3]" : "aspect-square"} overflow-hidden`}>
              <img src={p} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        {/* Name row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            {buddy.avatarUrl ? (
              <img src={buddy.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#398AB9] flex items-center justify-center text-white font-bold text-sm">
                {buddy.avatar}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-gray-900">{buddy.name}</p>
              <span className="text-gray-400 text-sm">• {buddy.age}</span>
              {buddy.isVerified && (
                <span className="text-[10px] bg-[#398AB9]/10 text-[#398AB9] px-1.5 py-0.5 rounded-full font-medium">
                  ✓ ยืนยัน
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
              <Globe className="w-3 h-3" />
              <span>{buddy.location}</span>
              <span>·</span>
              <Camera className="w-3 h-3" />
              <span>{buddy.tripCount} ทริป</span>
              <span>·</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-gray-600">{buddy.rating}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className={`text-sm text-gray-600 leading-relaxed mb-3 ${!expanded ? "line-clamp-2" : ""}`}>
          {buddy.bio}
        </p>

        {/* Destination */}
        <div className="flex items-center gap-3 bg-[#398AB9]/5 rounded-xl px-3 py-2.5 mb-3">
          <MapPin className="w-4 h-4 text-[#398AB9] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">ปลายทาง</p>
            <p className="text-sm font-semibold text-gray-800">{buddy.destination}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {buddy.travelDate}
          </div>
        </div>

        {/* Style tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {buddy.travelStyle.map((s) => (
            <span key={s} className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
              {s}
            </span>
          ))}
          {buddy.mutualFriends && (
            <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">
              👥 {buddy.mutualFriends} คนรู้จัก
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onPass}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center flex-1 h-12 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition text-sm gap-1.5"
          >
            ดูโปรไฟล์
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLike}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition ${
              isLiked
                ? "bg-red-500 text-white shadow-md shadow-red-200"
                : "bg-red-50 text-red-400 hover:bg-red-500 hover:text-white"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Request button (shown after like) */}
        {isLiked && (
          <button className="mt-2 w-full py-3 rounded-2xl bg-[#398AB9] text-white text-sm font-bold hover:bg-[#1C658C] transition flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            ส่งคำขอร่วมทริป
          </button>
        )}
      </div>
    </div>
  );
}
