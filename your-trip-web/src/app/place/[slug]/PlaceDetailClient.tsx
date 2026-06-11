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
  Plus, X, CalendarDays, BookMarked, Maximize2,
} from "lucide-react";
import { createReview } from "@/server/actions/places";
import { toggleSavePlace } from "@/server/actions/savedPlaces";
import { getUserTrips, addItineraryItem } from "@/server/actions/trips";
import { getUserCollections, addToCollection, type CollectionListItem } from "@/server/actions/collections";
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
  const [addTripOpen, setAddTripOpen] = useState(false);
  const [tripsList, setTripsList] = useState<Array<{ id: string; title: string; destination: string; days: number }>>([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [addColOpen, setAddColOpen] = useState(false);
  const [colList, setColList] = useState<CollectionListItem[]>([]);
  const [selectedColId, setSelectedColId] = useState("");
  const [colLoading, setColLoading] = useState(false);
  const [addingToCol, setAddingToCol] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reviewSort, setReviewSort] = useState<"newest" | "highest" | "lowest" | "helpful">("helpful");

  async function openAddToCollection() {
    setAddColOpen(true);
    if (colList.length > 0) return;
    setColLoading(true);
    const { data } = await getUserCollections();
    setColList(data);
    if (data.length > 0) setSelectedColId(data[0].id);
    setColLoading(false);
  }

  async function handleAddToCollection() {
    if (!selectedColId || !place.id) return;
    setAddingToCol(true);
    const result = await addToCollection(selectedColId, place.id);
    setAddingToCol(false);
    if (!result.error) {
      success(`เพิ่ม "${place.name}" ในคอลเลกชันแล้ว ✓`);
      setAddColOpen(false);
    } else {
      toastError(result.error);
    }
  }

  async function openAddToTrip() {
    setAddTripOpen(true);
    if (tripsList.length > 0) return;
    setTripsLoading(true);
    const { data } = await getUserTrips();
    const mapped = data.map((t) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      days: t.days.length,
    }));
    setTripsList(mapped);
    if (mapped.length > 0) setSelectedTripId(mapped[0].id);
    setTripsLoading(false);
  }

  async function handleAddToTrip() {
    if (!selectedTripId || !place.name) return;
    setAddingItem(true);
    const result = await addItineraryItem(selectedTripId, {
      day: selectedDay,
      title: place.name,
      location: place.location,
      placeId: place.id && !place.id.startsWith("mock") ? place.id : undefined,
    });
    setAddingItem(false);
    if (result.data) {
      success(`เพิ่ม "${place.name}" ในทริปแล้ว ✓`);
      setAddTripOpen(false);
    } else {
      toastError("ไม่สามารถเพิ่มได้ กรุณาลองใหม่");
    }
  }

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

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={() => { setLightboxIndex(imgIndex); setLightboxOpen(true); }}
              className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full hover:bg-black/60 transition"
              title="ดูรูปขนาดเต็ม"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              <Camera className="w-3.5 h-3.5" />
              {imgIndex + 1}/{safeImages.length}
            </div>
          </div>
        </div>

        {/* ── Photo Lightbox ── */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {lightboxIndex + 1} / {safeImages.length}
            </div>

            {/* Image */}
            <div
              className="relative w-full h-full max-w-5xl mx-auto px-12"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={safeImages[lightboxIndex]}
                alt={`${place.name} รูปที่ ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Prev / Next */}
            {safeImages.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + safeImages.length) % safeImages.length); }}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % safeImages.length); }}
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Thumbnail strip */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-none">
                  {safeImages.map((src, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                      className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition ${
                        i === lightboxIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                      }`}
                    >
                      <Image src={src} alt="" fill className="object-cover" sizes="56px" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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
                <div className="flex items-center gap-2">
                  <select
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value as typeof reviewSort)}
                    className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="helpful">เป็นประโยชน์</option>
                    <option value="newest">ล่าสุด</option>
                    <option value="highest">คะแนนสูงสุด</option>
                    <option value="lowest">คะแนนต่ำสุด</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{place.rating}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">({place.reviewCount.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[...place.reviews].sort((a, b) => {
                  if (reviewSort === "newest") return new Date(b.time).getTime() - new Date(a.time).getTime();
                  if (reviewSort === "highest") return b.rating - a.rating;
                  if (reviewSort === "lowest") return a.rating - b.rating;
                  return b.likes - a.likes; // helpful
                }).map((r) => (
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

          {/* ── Share Buttons ── */}
          <section className="py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400 mr-1">แชร์ไปยัง:</span>
              {[
                { label: "LINE", emoji: "💬", href: (url: string, text: string) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
                { label: "Facebook", emoji: "📘", href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
                { label: "X", emoji: "🐦", href: (url: string, text: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600" },
              ].map(({ label, emoji, href, color }) => {
                const url = typeof window !== "undefined" ? window.location.href : "";
                const text = `${place.name} — ${place.location} | YourTrip`;
                return (
                  <a key={label}
                    href={href(url, text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition hover:opacity-80 ${color}`}
                  >
                    <span>{emoji}</span>
                    {label}
                  </a>
                );
              })}
            </div>
          </section>

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

      {/* ── FABs (Add to Trip + Add to Collection) ── */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-30 flex flex-col items-end gap-2">
        <button
          onClick={openAddToCollection}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 transition-all active:scale-95"
        >
          <BookMarked className="w-4 h-4 text-[#398AB9]" />
          บันทึกในคอลเลกชัน
        </button>
        <button
          onClick={openAddToTrip}
          className="flex items-center gap-2 bg-[#398AB9] hover:bg-[#1C658C] text-white text-sm font-bold px-4 py-3 rounded-2xl shadow-lg shadow-[#398AB9]/40 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          เพิ่มในทริป
        </button>
      </div>

      {/* ── Add to Trip Modal ── */}
      {addTripOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddTripOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm mx-0 sm:mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">เพิ่มในทริป</h3>
              <button onClick={() => setAddTripOpen(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 truncate">📍 {place.name}</p>

            {tripsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#398AB9] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tripsList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">ยังไม่มีทริป</p>
                <a href="/trips/new" className="text-sm text-[#398AB9] font-medium hover:underline">
                  สร้างทริปใหม่ →
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">เลือกทริป</label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => {
                      setSelectedTripId(e.target.value);
                      setSelectedDay(1);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-[#398AB9]"
                  >
                    {tripsList.map((t) => (
                      <option key={t.id} value={t.id}>{t.title} — {t.destination}</option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const trip = tripsList.find((t) => t.id === selectedTripId);
                  const numDays = trip?.days ?? 1;
                  return (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">
                        <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
                        วันที่
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: Math.min(numDays, 14) }, (_, i) => i + 1).map((d) => (
                          <button key={d} type="button" onClick={() => setSelectedDay(d)}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                              selectedDay === d
                                ? "bg-[#398AB9] text-white"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                            }`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={handleAddToTrip}
                  disabled={addingItem}
                  className="w-full py-3.5 rounded-2xl bg-[#398AB9] hover:bg-[#1C658C] text-white font-bold text-sm transition disabled:opacity-50 shadow-md shadow-[#398AB9]/30"
                >
                  {addingItem ? "กำลังเพิ่ม..." : "เพิ่มในทริป ✓"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add to Collection Modal ── */}
      {addColOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddColOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm mx-0 sm:mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">บันทึกในคอลเลกชัน</h3>
              <button onClick={() => setAddColOpen(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 truncate">📍 {place.name}</p>

            {colLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#398AB9] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : colList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">ยังไม่มีคอลเลกชัน</p>
                <a href="/collections" className="text-sm text-[#398AB9] font-medium hover:underline">สร้างคอลเลกชัน →</a>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">คอลเลกชัน</label>
                  <select
                    value={selectedColId}
                    onChange={(e) => setSelectedColId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#398AB9]/40"
                  >
                    {colList.map((c) => (
                      <option key={c.id} value={c.id}>{c.emoji ?? "📍"} {c.title} ({c.placeCount} สถานที่)</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddToCollection}
                  disabled={addingToCol}
                  className="w-full py-3.5 rounded-2xl bg-[#398AB9] hover:bg-[#1C658C] text-white font-bold text-sm transition disabled:opacity-50 shadow-md shadow-[#398AB9]/30"
                >
                  {addingToCol ? "กำลังเพิ่ม..." : "บันทึกในคอลเลกชัน ✓"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
