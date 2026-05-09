"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import {
  MapPin, Star, Clock, Phone, Globe, ChevronLeft,
  ChevronRight, Heart, Share2, Bookmark, Camera,
  Car, Bike, Bus, Navigation, AlertTriangle,
  ParkingSquare, Wifi, Wind, Leaf, Accessibility,
  MessageCircle, MoreHorizontal, ThumbsUp, ChevronDown,
} from "lucide-react";

/* ── mock data ─────────────────────────────────────────── */
const places: Record<string, PlaceData> = {
  "doi-ang-khang": {
    name: "ดอยอ่างขาง",
    category: "สถานที่เที่ยว",
    categoryEn: "Nature & Scenic",
    location: "อำเภออางขาง, เชียงใหม่",
    rating: 4.8,
    reviewCount: 2840,
    priceRange: "฿฿",
    priceNote: "ค่าเข้าชม 50฿ / คัน",
    isOpen: true,
    openUntil: "18:00",
    phone: "053-450-107",
    website: "doiangkhang.com",
    description: "ดอยอ่างขาง เป็นดอยที่อยู่บนเทือกเขาแดนลาวในอำเภออางขาง จังหวัดเชียงใหม่ ความสูงจากระดับน้ำทะเลประมาณ 1,400-1,928 เมตร อากาศหนาวเย็นตลอดปี โดยเฉพาะช่วงฤดูหนาว อุณหภูมิอาจลดลงต่ำกว่า 0°C สถานีเกษตรหลวงอ่างขางเป็นสถานที่ท่องเที่ยวสำคัญ ภายในมีสวนดอกไม้นานาชนิด เช่น กุหลาบ บีโกเนีย และไม้ดอกเมืองหนาวอีกมากมาย",
    descriptionEn: "Doi Ang Khang is a mountain in Ang Khang District, Chiang Mai Province, with elevation of 1,400–1,928 m. Known for cool weather year-round and beautiful flower gardens at the Royal Agricultural Station.",
    hours: [
      { day: "จันทร์–ศุกร์", time: "06:00–18:00" },
      { day: "เสาร์–อาทิตย์", time: "06:00–18:00" },
    ],
    images: [
      "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80",
    ],
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30552.07!2d99.0356!3d19.4954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d86ef9e8be1d15%3A0x9a17e2aeefd4ca75!2z4Lio4Liy4Lij4LiH4LiI4Lin4Lix4LiH!5e0!3m2!1sth!2sth!4v1600000000000",
    transport: {
      car: "จากเชียงใหม่ใช้เส้นทาง 107 (เชียงใหม่–ฝาง) ถึงอำเภอฝาง แล้วเลี้ยวซ้ายเข้าทาง 1249 ขึ้นดอยอ่างขาง ระยะทางประมาณ 153 กม. ใช้เวลาประมาณ 3 ชั่วโมง",
      motorcycle: "ถนนเป็นทางคดเคี้ยวและชัน แนะนำให้ใช้รถยนต์ขับเคลื่อน 4 ล้อ ไม่แนะนำมอเตอร์ไซค์สำหรับผู้ขับขี่ไม่ชำนาญ",
      bus: "นั่งรถทัวร์จากอาเขตเชียงใหม่ไปฝาง แล้วต่อสองแถวหรือรถท้องถิ่นขึ้นดอย (มีบริการไม่บ่อย แนะนำเช่ารถ)",
      songthaew: "สองแถวท้องถิ่นจากตัวอำเภอฝาง ราคาประมาณ 80–120 บาท/คน (ขึ้นอยู่กับจำนวนผู้โดยสาร)",
    },
    caution: [
      "ถนนขึ้นดอยคดเคี้ยวและชัน ควรขับรถช้าๆ และระวังรถสวนทาง",
      "ช่วงฤดูหนาว (พ.ย.–ก.พ.) อากาศหนาวมาก ควรเตรียมเสื้อกันหนาวหนาๆ",
      "ห้ามนำสุนัขหรือสัตว์เลี้ยงเข้าพื้นที่สถานีเกษตรหลวง",
      "ควรเติมน้ำมันให้เต็มก่อนขึ้นดอย เพราะสถานีบริการน้ำมันมีน้อย",
    ],
    parking: {
      available: true,
      spaces: "มีลานจอดรถกว้างขวาง รองรับรถยนต์และรถบัสทัวร์",
      fee: "ฟรี (รวมอยู่ในค่าเข้าชม)",
    },
    facilities: { wifi: false, ac: false, vegetarian: true, accessibility: false },
    tags: ["เที่ยวเหนือ", "ธรรมชาติ", "ดอกไม้", "อากาศเย็น"],
    nearby: [
      { name: "ดอยอินทนนท์", category: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=400&q=70", slug: "doi-inthanon" },
      { name: "น้ำตกแม่กลาง", category: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&q=70", slug: "mae-klang" },
      { name: "ร้านอาหารบนดอย", category: "ร้านอาหาร", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=70", slug: "mountain-restaurant" },
    ],
  },
  "bali-terraces": {
    name: "นาขั้นบันไดบาหลี",
    category: "สถานที่เที่ยว",
    categoryEn: "Cultural & Heritage",
    location: "อูบุด, บาหลี, อินโดนีเซีย",
    rating: 4.9,
    reviewCount: 5120,
    priceRange: "฿฿",
    priceNote: "เข้าชมฟรี / ค่าไกด์ประมาณ 200,000 IDR",
    isOpen: true,
    openUntil: "17:00",
    phone: "+62-361-971-716",
    website: "baliwisata.com",
    description: "นาขั้นบันได Tegalalang เป็นหนึ่งในภาพที่โด่งดังที่สุดของบาหลี ตั้งอยู่ห่างจากอูบุดไปทางเหนือประมาณ 10 กม. ทุ่งนาขั้นบันไดที่สวยงามนี้ได้รับการขึ้นทะเบียนเป็นมรดกโลกของยูเนสโก ชาวบาหลีใช้ระบบชลประทานดั้งเดิมที่เรียกว่า 'Subak' ในการจัดการน้ำ ซึ่งมีอายุกว่า 1,000 ปี",
    descriptionEn: "Tegalalang Rice Terraces near Ubud is one of Bali's most iconic landscapes. A UNESCO World Heritage Site featuring traditional Subak irrigation system over 1,000 years old.",
    hours: [
      { day: "ทุกวัน", time: "08:00–17:00" },
    ],
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80",
    ],
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.5!2d115.2776!3d-8.4313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23d4b44aaa667%3A0x2b2b2b2b2b2b2b2b!2sTegalalang!5e0!3m2!1sth!2sth!4v1600000000000",
    transport: {
      car: "เช่ารถหรือใช้บริการ driver จากอูบุด ระยะทางประมาณ 10 กม. ใช้เวลาประมาณ 20 นาที",
      motorcycle: "เช่ามอเตอร์ไซค์ในอูบุดราคาประมาณ 60,000–80,000 IDR/วัน เส้นทางง่าย ไม่มีทางชัน",
      bus: "ไม่มีบริการรถสาธารณะโดยตรง แนะนำใช้บริการ Grab หรือ Gojek",
      songthaew: "ใช้ Grab/Gojek จากอูบุด ราคาประมาณ 30,000–50,000 IDR",
    },
    caution: [
      "ระวังพ่อค้าแม่ค้าที่อาจเรียกเก็บค่าเดินเข้าพื้นที่ (ไม่ใช่ค่าเข้าชมทางการ)",
      "สวมเสื้อผ้าที่เหมาะสม อาจต้องคลุมสะโพกเมื่อเข้าพื้นที่ศักดิ์สิทธิ์",
      "ช่วงเช้าตรู่ (06:00–08:00) แสงสวยที่สุดและนักท่องเที่ยวน้อย",
      "ระวังลื่นบนคันนาในช่วงฝนตก",
    ],
    parking: {
      available: true,
      spaces: "มีลานจอดรถเล็กๆ ใกล้ทางเข้า",
      fee: "ประมาณ 5,000–10,000 IDR",
    },
    facilities: { wifi: true, ac: false, vegetarian: true, accessibility: false },
    tags: ["บาหลี", "ต่างประเทศ", "UNESCO", "นาขั้นบันได"],
    nearby: [
      { name: "Sacred Monkey Forest", category: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1549477123-6b0a3fcfc15f?auto=format&fit=crop&w=400&q=70", slug: "monkey-forest" },
      { name: "Tirta Empul Temple", category: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=400&q=70", slug: "tirta-empul" },
      { name: "Locavore Restaurant", category: "ร้านอาหาร", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=70", slug: "locavore" },
    ],
  },
};

/* ── types ─────────────────────────────────────────────── */
interface PlaceData {
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
}

const reviews = [
  { id: 1, user: "free people", bg: "bg-orange-400", initials: "FP", rating: 5, time: "2 วันที่แล้ว",
    text: "สวยมากๆ อากาศดีเย็นสบาย ดอกไม้บานสวยงาม แนะนำให้ไปช่วงเช้าตรู่จะได้เห็นหมอกด้วย ❄️",
    likes: 24, photos: 3 },
  { id: 2, user: "wanderer", bg: "bg-emerald-400", initials: "W", rating: 5, time: "1 สัปดาห์ที่แล้ว",
    text: "มาแล้วต้องมาอีก ทิวทัศน์สุดสวย การขับรถขึ้นดอยเป็นประสบการณ์ที่น่าตื่นเต้น ระวังหมอกนะครับ",
    likes: 18, photos: 5 },
  { id: 3, user: "shy girl", bg: "bg-pink-400", initials: "SG", rating: 4, time: "2 สัปดาห์ที่แล้ว",
    text: "ชอบมากค่ะ แต่ถนนขึ้นดอยค่อนข้างน่ากลัวนิดนึง เตรียมเสื้อกันหนาวหนาๆ ไปด้วยนะคะ",
    likes: 31, photos: 2 },
];

/* ── sub-components ────────────────────────────────────── */
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
      active ? "bg-[#398AB9]/10 text-[#398AB9]" : "bg-gray-100 text-gray-400 line-through"
    }`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

function TransportTab({ icon: Icon, label, content }: { icon: React.ElementType; label: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)}
      className="w-full text-left border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-[#398AB9]" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="px-4 pb-3 pt-1 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
        </div>
      )}
    </button>
  );
}

/* ── main page ─────────────────────────────────────────── */
export default function PlacePage({ params }: { params: { slug: string } }) {
  const place = places[params.slug] ?? places["doi-ang-khang"];
  const [imgIndex, setImgIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const prev = () => setImgIndex((i) => (i - 1 + place.images.length) % place.images.length);
  const next = () => setImgIndex((i) => (i + 1) % place.images.length);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* ── Hero Carousel ── */}
        <div className="relative aspect-[16/9] md:aspect-[2/1] overflow-hidden bg-gray-900 md:mt-6 md:mx-6 md:rounded-2xl">
          <img src={place.images[imgIndex]} alt={place.name}
            className="w-full h-full object-cover transition-opacity duration-500" />

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
            <Link href="/feed"
              className="w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition">
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setSaved(!saved)}
                className="w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition">
                <Bookmark className={`w-5 h-5 ${saved ? "fill-white text-white" : "text-white"}`} />
              </button>
              <button className="w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition">
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* carousel controls */}
          {place.images.length > 1 && (
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
                {place.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={`rounded-full transition-all ${i === imgIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
                ))}
              </div>
            </>
          )}

          {/* photo count */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
            <Camera className="w-3.5 h-3.5" />
            {imgIndex + 1}/{place.images.length}
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
                <h1 className="text-2xl font-bold text-gray-900">{place.name}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#398AB9] flex-shrink-0" />
                  <span className="text-sm text-gray-500">{place.location}</span>
                </div>
              </div>
              <button onClick={() => setLiked(!liked)}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition ${liked ? "text-[#FF4F4F]" : "text-gray-400"}`}>
                <Heart className={`w-6 h-6 ${liked ? "fill-[#FF4F4F]" : ""}`} />
              </button>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <StarRating rating={place.rating} size="lg" />
                <span className="text-lg font-bold text-gray-900">{place.rating}</span>
                <span className="text-sm text-gray-400">({place.reviewCount.toLocaleString()} รีวิว)</span>
              </div>
            </div>

            {/* Price + contact */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-bold text-[#398AB9]">{place.priceRange}</span>
                <span className="text-gray-400">{place.priceNote}</span>
              </div>
              <a href={`tel:${place.phone}`}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#398AB9] transition">
                <Phone className="w-3.5 h-3.5" />
                {place.phone}
              </a>
              <a href={`https://${place.website}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#398AB9] transition">
                <Globe className="w-3.5 h-3.5" />
                {place.website}
              </a>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {place.tags.map((t) => (
                <span key={t} className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Description ── */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">เกี่ยวกับสถานที่</h2>
            <div className={`relative ${!expanded ? "max-h-[90px] overflow-hidden" : ""}`}>
              <p className="text-sm text-gray-600 leading-relaxed">{place.description}</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2 italic">{place.descriptionEn}</p>
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
              )}
            </div>
            <button onClick={() => setExpanded(!expanded)}
              className="text-xs text-[#398AB9] font-medium mt-1 hover:underline">
              {expanded ? "แสดงน้อยลง" : "อ่านเพิ่มเติม"}
            </button>
          </section>

          {/* ── Opening Hours ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#398AB9]" />
              <h2 className="text-base font-semibold text-gray-900">เวลาทำการ</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {place.hours.map((h, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                  i < place.hours.length - 1 ? "border-b border-gray-50" : ""
                }`}>
                  <span className="text-gray-600">{h.day}</span>
                  <span className="font-medium text-gray-900">{h.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Facilities ── */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">สิ่งอำนวยความสะดวก</h2>
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
              <h2 className="text-base font-semibold text-gray-900">ที่ตั้ง</h2>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <iframe
                src={place.mapEmbed}
                className="w-full h-56 md:h-72"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="map"
              />
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.location)}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-sm text-[#398AB9] hover:underline font-medium">
              <MapPin className="w-3.5 h-3.5" />
              เปิดใน Google Maps
            </a>
          </section>

          {/* ── How to Get There ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-4 h-4 text-[#398AB9]" />
              <h2 className="text-base font-semibold text-gray-900">การเดินทาง</h2>
            </div>
            <div className="space-y-2">
              <TransportTab icon={Car} label="รถยนต์" content={place.transport.car} />
              <TransportTab icon={Bike} label="มอเตอร์ไซค์" content={place.transport.motorcycle} />
              <TransportTab icon={Bus} label="รถโดยสาร" content={place.transport.bus} />
              <TransportTab icon={Navigation} label="สองแถว / รถท้องถิ่น" content={place.transport.songthaew} />
            </div>
          </section>

          {/* ── Parking ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ParkingSquare className="w-4 h-4 text-[#398AB9]" />
              <h2 className="text-base font-semibold text-gray-900">ที่จอดรถ</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  place.parking.available ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                }`}>
                  {place.parking.available ? "มีที่จอดรถ" : "ไม่มีที่จอดรถ"}
                </span>
              </div>
              <p className="text-sm text-gray-600">{place.parking.spaces}</p>
              <p className="text-sm text-gray-500">ค่าบริการ: <span className="font-medium text-gray-700">{place.parking.fee}</span></p>
            </div>
          </section>

          {/* ── Caution / Tips ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-semibold text-gray-900">คำเตือนและเคล็ดลับ</h2>
            </div>
            <div className="space-y-2">
              {place.caution.map((c, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <span className="text-amber-500 font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Community Reviews ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#398AB9]" />
                <h2 className="text-base font-semibold text-gray-900">รีวิวจากชุมชน</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-gray-900">{place.rating}</span>
                <span className="text-xs text-gray-400">({place.reviewCount.toLocaleString()})</span>
              </div>
            </div>

            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 ${r.bg} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {r.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.user}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating rating={r.rating} />
                          <span className="text-[10px] text-gray-400">{r.time}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-50 rounded-full">
                      <MoreHorizontal className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mt-2">{r.text}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#398AB9] transition">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{r.likes}</span>
                    </button>
                    {r.photos > 0 && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Camera className="w-3.5 h-3.5" />
                        {r.photos} รูป
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition font-medium">
              ดูรีวิวทั้งหมด ({place.reviewCount.toLocaleString()})
            </button>
          </section>

          {/* ── Nearby Places ── */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">สถานที่ใกล้เคียง</h2>
            <div className="grid grid-cols-3 gap-3">
              {place.nearby.map((n) => (
                <Link key={n.slug} href={`/place/${n.slug}`}
                  className="group rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition">
                  <div className="aspect-square overflow-hidden">
                    <img src={n.img} alt={n.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-800 truncate">{n.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </AppShell>
  );
}
