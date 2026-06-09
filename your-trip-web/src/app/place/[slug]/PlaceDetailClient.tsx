"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Star, Clock, Phone, Globe, ChevronLeft,
  ChevronRight, Heart, Share2, Bookmark, Camera,
  Car, Bike, Bus, Navigation, AlertTriangle,
  ParkingSquare, Wifi, Wind, Leaf, Accessibility,
  MessageCircle, MoreHorizontal, ThumbsUp, ChevronDown, PenLine,
} from "lucide-react";
import { createReview } from "@/server/actions/places";
import { toggleSavePlace } from "@/server/actions/savedPlaces";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";

/* ── types ────────────────────────────────────────────────── */
export interface PlaceData {
  id?: string;
  name: string; category: string; categoryEn: string; location: string;
  rating: number; reviewCount: number; priceRange: string; priceNote: string;
  isOpen: boolean; openUntil: string; phone: string; website: string;
  description: string; descriptionEn: string;
  hours: { day: string; time: string }[];
  images: string[];
  mapEmbed: string;
  transport: { car: string; motorcycle: string; bus: string; songthaew: string };
  caution: string[];
  parking: { available: boolean; spaces: string; fee: string };
  facilities: { wifi: boolean; ac: boolean; vegetarian: boolean; accessibility: boolean };
  tags: string[];
  nearby: { name: string; category: string; img: string; slug: string }[];
  reviews: {
    id: string | number; user: string; bg: string; initials: string;
    rating: number; time: string; text: string; likes: number; photos: number;
    avatarUrl?: string | null;
  }[];
}

/* ── sub-components ───────────────────────────────────────── */
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${s} ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

function FacilityBadge({ icon: Icon, label, active }: { icon: React.ElementType; label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      active ? "bg-[#398AB9]/10 text-[#398AB9]" : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 line-through"
    }`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

function TransportTab({ icon: Icon, label, content }: { icon: React.ElementType; label: string; content: string }) {
  const [open, setOpen] = useState(false);
  if (!content || content === "—") return null;
  return (
    <button onClick={() => setOpen(!open)}
      className="w-full text-left border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-[#398AB9]" />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="px-4 pb-3 pt-1 bg-gray-50 dark:bg-slate-700/40 border-t border-gray-100 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{content}</p>
        </div>
      )}
    </button>
  );
}

/* ── main component ───────────────────────────────────────── */
export default function PlaceDetailClient({ place, slug, initialSaved = false }: { place: PlaceData; slug: string; initialSaved?: boolean }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [saved, setSaved] = useState(initialSaved);
  const { success, error: toastError, info } = useToast();
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: place.name, text: `${place.name} — ${place.location}`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      info("คัดลอกลิงก์แล้ว ✓");
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!place.id) return;
    setReviewSubmitting(true);
    if (!place.id.startsWith("mock")) {
      await createReview({ placeId: place.id, rating: reviewRating, content: reviewText });
    }
    setReviewSubmitting(false);
    setReviewDone(true);
    setShowReviewForm(false);
    setReviewText("");
  }

  const safeImages = place.images.length > 0 ? place.images : [
    "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=1200&q=80"
  ];

  const prev = () => setImgIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setImgIndex((i) => (i + 1) % safeImages.length);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* ── Hero Carousel ── */}
        <div className="relative aspect-[16/9] md:aspect-[2/1] overflow-hidden bg-gray-900 md:mt-6 md:mx-6 md:rounded-2xl">
          <Image src={safeImages[imgIndex]} alt={place.name} fill priority
            className="object-cover transition-opacity duration-500"
            sizes="(max-width: 768px) 100vw, 896px" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
            <Link href="/explore"
              className="w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition">
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={async () => {
                  if (!place.id || place.id.startsWith("mock")) return;
                  const next = !saved;
                  setSaved(next);
                  try {
                    await toggleSavePlace(place.id!);
                    if (next) success("เพิ่มใน Wishlist แล้ว ✓");
                  } catch { setSaved((s) => !s); toastError("ไม่สามารถบันทึกได้"); }
                }}
                className="w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition">
                <Bookmark className={`w-5 h-5 ${saved ? "fill-white text-white" : "text-white"}`} />
              </button>
              <button
                onClick={handleShare}
                className="relative w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition"
                title="แชร์">
                <Share2 className="w-5 h-5 text-white" />
                {shareCopied && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium bg-gray-900 text-white px-2 py-1 rounded-lg">
                    คัดลอก URL แล้ว ✓
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* carousel controls */}
          {safeImages.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {safeImages.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={`rounded-full transition-all ${i === imgIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
            <Camera className="w-3.5 h-3.5" />
            {imgIndex + 1}/{safeImages.length}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-4 md:px-6 pb-8 space-y-6 mt-4">

          {/* Name & meta */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-[#398AB9] bg-[#398AB9]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    {place.category}
                  </span>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                    place.isOpen ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                  }`}>
                    {place.isOpen ? `เปิดอยู่ · ถึง ${place.openUntil}` : "ปิดแล้ว"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{place.name}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#398AB9] flex-shrink-0" />
                  <span className="text-sm text-gray-500 dark:text-slate-400">{place.location}</span>
                </div>
              </div>
              <button onClick={() => setLiked(!liked)}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition ${liked ? "text-[#FF4F4F]" : "text-gray-400"}`}>
                <Heart className={`w-6 h-6 ${liked ? "fill-[#FF4F4F]" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <StarRating rating={place.rating} size="lg" />
                <span className="text-lg font-bold text-gray-900 dark:text-slate-100">{place.rating}</span>
                <span className="text-sm text-gray-400 dark:text-slate-500">({place.reviewCount.toLocaleString()} รีวิว)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-bold text-[#398AB9]">{place.priceRange}</span>
                <span className="text-gray-400">{place.priceNote}</span>
              </div>
              {place.phone && (
                <a href={`tel:${place.phone}`}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#398AB9] transition">
                  <Phone className="w-3.5 h-3.5" />
                  {place.phone}
                </a>
              )}
              {place.website && (
                <a href={place.website.startsWith("http") ? place.website : `https://${place.website}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#398AB9] transition">
                  <Globe className="w-3.5 h-3.5" />
                  {place.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            {place.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {place.tags.map((t) => (
                  <span key={t} className="text-[11px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Description ── */}
          {place.description && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-2">เกี่ยวกับสถานที่</h2>
              <div className={`relative ${!expanded ? "max-h-[90px] overflow-hidden" : ""}`}>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{place.description}</p>
                {place.descriptionEn && (
                  <p className="text-sm text-gray-400 leading-relaxed mt-2 italic">{place.descriptionEn}</p>
                )}
                {!expanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F8FAFC] dark:from-slate-900 to-transparent" />
                )}
              </div>
              <button onClick={() => setExpanded(!expanded)}
                className="text-xs text-[#398AB9] font-medium mt-1 hover:underline">
                {expanded ? "แสดงน้อยลง" : "อ่านเพิ่มเติม"}
              </button>
            </section>
          )}

          {/* ── Opening Hours ── */}
          {place.hours.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#398AB9]" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">เวลาทำการ</h2>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {place.hours.map((h, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                    i < place.hours.length - 1 ? "border-b border-gray-50 dark:border-slate-700" : ""
                  }`}>
                    <span className="text-gray-600 dark:text-slate-400">{h.day}</span>
                    <span className="font-medium text-gray-900 dark:text-slate-200">{h.time}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Facilities ── */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-3">สิ่งอำนวยความสะดวก</h2>
            <div className="flex flex-wrap gap-2">
              <FacilityBadge icon={Wifi} label="Wi-Fi" active={place.facilities.wifi} />
              <FacilityBadge icon={Wind} label="แอร์" active={place.facilities.ac} />
              <FacilityBadge icon={Leaf} label="อาหารมังสวิรัติ" active={place.facilities.vegetarian} />
              <FacilityBadge icon={Accessibility} label="ผู้พิการเข้าถึงได้" active={place.facilities.accessibility} />
            </div>
          </section>

          {/* ── Location / Map ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-[#398AB9]" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">ที่ตั้ง</h2>
            </div>
            {place.mapEmbed ? (
              <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                <iframe
                  src={place.mapEmbed}
                  className="w-full h-56 md:h-72"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="map"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 h-40 flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">
                <MapPin className="w-4 h-4 mr-2" /> {place.location}
              </div>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.location)}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-sm text-[#398AB9] hover:underline font-medium">
              <MapPin className="w-3.5 h-3.5" />
              เปิดใน Google Maps
            </a>
          </section>

          {/* ── How to Get There ── */}
          {(place.transport.car || place.transport.motorcycle || place.transport.bus) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4 text-[#398AB9]" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">การเดินทาง</h2>
              </div>
              <div className="space-y-2">
                <TransportTab icon={Car} label="รถยนต์" content={place.transport.car} />
                <TransportTab icon={Bike} label="มอเตอร์ไซค์" content={place.transport.motorcycle} />
                <TransportTab icon={Bus} label="รถโดยสาร" content={place.transport.bus} />
                <TransportTab icon={Navigation} label="สองแถว / รถท้องถิ่น" content={place.transport.songthaew} />
              </div>
            </section>
          )}

          {/* ── Parking ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ParkingSquare className="w-4 h-4 text-[#398AB9]" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">ที่จอดรถ</h2>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  place.parking.available ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                }`}>
                  {place.parking.available ? "มีที่จอดรถ" : "ไม่มีที่จอดรถ"}
                </span>
              </div>
              {place.parking.spaces && <p className="text-sm text-gray-600 dark:text-slate-300">{place.parking.spaces}</p>}
              <p className="text-sm text-gray-500 dark:text-slate-400">ค่าบริการ: <span className="font-medium text-gray-700 dark:text-slate-300">{place.parking.fee}</span></p>
            </div>
          </section>

          {/* ── Caution / Tips ── */}
          {place.caution.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">คำเตือนและเคล็ดลับ</h2>
              </div>
              <div className="space-y-2">
                {place.caution.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl px-4 py-3">
                    <span className="text-amber-500 font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{c}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Community Reviews ── */}
          {place.reviews.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#398AB9]" />
                  <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">รีวิวจากชุมชน</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{place.rating}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">({place.reviewCount.toLocaleString()})</span>
                </div>
              </div>

              <div className="space-y-3">
                {place.reviews.map((r) => (
                  <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Avatar src={r.avatarUrl} name={r.user} className="w-9 h-9 text-xs" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{r.user}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={r.rating} />
                            <span className="text-[10px] text-gray-400 dark:text-slate-500">{r.time}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full">
                        <MoreHorizontal className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                      </button>
                    </div>
                    {r.text && <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed mt-2">{r.text}</p>}
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 hover:text-[#398AB9] transition">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{r.likes}</span>
                      </button>
                      {r.photos > 0 && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                          <Camera className="w-3.5 h-3.5" />
                          {r.photos} รูป
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium">
                ดูรีวิวทั้งหมด ({place.reviewCount.toLocaleString()})
              </button>

              {/* Write review */}
              {!reviewDone && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full mt-2 py-2.5 bg-[#398AB9] text-white rounded-xl text-sm font-bold hover:bg-[#1C658C] transition flex items-center justify-center gap-2"
                >
                  <PenLine className="w-4 h-4" />
                  เขียนรีวิว
                </button>
              )}
              {reviewDone && (
                <p className="text-center text-sm text-emerald-600 font-medium mt-2">✓ ขอบคุณสำหรับรีวิวของคุณ!</p>
              )}

              {/* Review form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mt-3 bg-[#398AB9]/5 dark:bg-[#398AB9]/10 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">เขียนรีวิว</p>
                  {/* Star picker */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)}>
                        <Star className={`w-6 h-6 ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">{reviewRating}/5</span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="เล่าประสบการณ์ของคุณ..."
                    rows={3}
                    className="w-full text-sm text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:border-[#398AB9] resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex-1 py-2 bg-[#398AB9] text-white rounded-xl text-sm font-bold hover:bg-[#1C658C] transition disabled:opacity-60"
                    >
                      {reviewSubmitting ? "กำลังส่ง..." : "ส่งรีวิว"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* ── Nearby Places ── */}
          {place.nearby.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-3">สถานที่ใกล้เคียง</h2>
              <div className="grid grid-cols-3 gap-3">
                {place.nearby.map((n) => (
                  <Link key={n.slug} href={`/place/${n.slug}`}
                    className="group rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition">
                    <div className="aspect-square overflow-hidden">
                      <img src={n.img} alt={n.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">{n.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{n.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </AppShell>
  );
}
