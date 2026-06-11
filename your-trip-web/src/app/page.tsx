import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Compass, ChevronDown, Star, CheckCircle, Shield } from "lucide-react";
import type { Metadata } from "next";
import { getPlaces } from "@/server/actions/places";
import { getVerifiedGuides } from "@/server/actions/profile";
import { Avatar } from "@/components/shared/Avatar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export const metadata: Metadata = {
  title: "Your Trip — สังคมนักเดินทาง | ค้นพบ แบ่งปัน วางแผน",
  description:
    "แพลตฟอร์มสังคมสำหรับนักเดินทาง ค้นพบสถานที่ใหม่ แบ่งปันประสบการณ์ วางแผนทริป และหาเพื่อนร่วมทาง",
  alternates: { canonical: SITE_URL },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Your Trip",
  url: SITE_URL,
  description: "แพลตฟอร์มสังคมสำหรับนักเดินทาง ค้นพบสถานที่ใหม่ แบ่งปันประสบการณ์ วางแผนทริป",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/explore?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const destinations = [
  { name: "เชียงใหม่, ไทย",        tag: "วัฒนธรรม & ธรรมชาติ", from: "from-emerald-400",  to: "to-teal-600",    emoji: "🏔️", href: "/explore/เชียงใหม่" },
  { name: "บาหลี, อินโดนีเซีย",    tag: "เกาะสวรรค์",           from: "from-orange-400",  to: "to-rose-500",    emoji: "🌴", href: "/explore?q=บาหลี" },
  { name: "ภูเก็ต, ไทย",           tag: "ทะเล & หาดทราย",       from: "from-sky-400",     to: "to-blue-600",    emoji: "🏖️", href: "/explore/ภูเก็ต" },
  { name: "กรุงเทพฯ, ไทย",         tag: "City & Street Food",   from: "from-cyan-400",    to: "to-emerald-600", emoji: "🏙️", href: "/explore/กรุงเทพมหานคร" },
];

const features = [
  { icon: "✈️", title: "วางแผนทริป",        desc: "สร้าง itinerary รายวัน ติดตามงบประมาณ และจัดการทริปได้ในที่เดียว" },
  { icon: "📸", title: "แชร์ประสบการณ์",    desc: "โพสต์รูปสวย เพิ่มแท็ก บอกสถานที่ และสร้างแรงบันดาลใจให้ชุมชน" },
  { icon: "🗺️", title: "ค้นพบสถานที่",     desc: "ข้อมูลครบ: เวลาเปิด ราคา การเดินทาง รีวิวจริงจากนักเดินทาง" },
  { icon: "👥", title: "หาเพื่อนร่วมทริป", desc: "Travel Buddy Matching — เจอคนที่อยากไปที่เดียวกับคุณ" },
  { icon: "⭐", title: "รีวิวที่เชื่อถือได้", desc: "รีวิวจากชุมชนจริง ไม่ใช่โฆษณา — ตัดสินใจได้มั่นใจขึ้น" },
  { icon: "📱", title: "ใช้ได้ทุกอุปกรณ์", desc: "PWA ติดตั้งลงมือถือได้เหมือนแอป ใช้งานง่ายทั้ง iOS และ Android" },
];

const testimonials = [
  {
    name: "มินตรา พลเยี่ยม", role: "Solo Traveler", avatar: "มต", bg: "bg-pink-400",
    text: "ใช้ Your Trip วางแผนทริปเดี่ยวครั้งแรกไปเชียงใหม่ ข้อมูลสถานที่ครบมาก ช่วยได้เยอะมากๆ แนะนำเลย!",
    rating: 5, trips: 12,
  },
  {
    name: "ณัฐพล วงค์ใจ", role: "Adventure Seeker", avatar: "ณว", bg: "bg-emerald-500",
    text: "หาเพื่อนร่วมทริปผ่าน Travel Buddy ได้เพื่อนดีมาก ทริปดอยอ่างขางครั้งนั้นเป็นทริปที่ดีที่สุดในชีวิต",
    rating: 5, trips: 47,
  },
  {
    name: "ภาณุวัฒน์ รัตนชาติ", role: "Digital Nomad", avatar: "ภว", bg: "bg-violet-500",
    text: "ฟีเจอร์ itinerary builder ช่วยได้มากตอนวางแผน 2 สัปดาห์ในบาหลี Track งบได้ real-time เลย",
    rating: 5, trips: 35,
  },
];

const steps = [
  { n: "01", title: "สมัครฟรี",       desc: "สร้างบัญชีด้วย Google ใช้เวลาไม่ถึง 1 นาที" },
  { n: "02", title: "ค้นพบสถานที่",   desc: "Browse สถานที่กว่า 50,000 แห่ง พร้อมรีวิวจากชุมชน" },
  { n: "03", title: "วางแผนและไป!",   desc: "สร้าง itinerary หาเพื่อนร่วมทริป แล้วออกเดินทาง" },
];

const MOCK_GUIDES = [
  { id: "g1", name: "ณัฐพล วงค์ใจ", username: "natthapol_guide", avatarUrl: null, bio: "ไกด์เชียงใหม่มืออาชีพ 8 ปี เชี่ยวชาญวัฒนธรรมล้านนา + ป่าเขา", location: "เชียงใหม่", tripsCount: 47 },
  { id: "g2", name: "ภาณุวัฒน์ รัตนชาติ", username: "phanuwat_guide", avatarUrl: null, bio: "ไกด์กรุงเทพฯ ย่านเก่า ตลาด วัด ชุมชน 5 ปีประสบการณ์", location: "กรุงเทพฯ", tripsCount: 35 },
  { id: "g3", name: "มินตรา พลเยี่ยม", username: "mintra_guide", avatarUrl: null, bio: "ไกด์ภาคใต้ ทะเล เกาะ ดำน้ำ ขนมจีน และอาหารใต้แท้", location: "สุราษฎร์ธานี", tripsCount: 28 },
];

export default async function LandingPage() {
  const { data: featuredPlaces } = await getPlaces({ featured: true, take: 4 });
  const { data: verifiedGuides } = await getVerifiedGuides(3);
  // Fallback if DB is empty
  const displayDestinations = featuredPlaces.length >= 4
    ? featuredPlaces
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* ─── HERO ─── */}
      <section className="relative h-screen min-h-[600px] bg-gradient-to-br from-[#0f2942] via-[#1C658C] to-[#398AB9]">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-12">
          <span className="text-2xl font-bold text-white">Your Trip</span>
          <div className="flex gap-3">
            <Link href="/login"
              className="text-white text-sm font-medium bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/25 hover:bg-white/25 transition">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register"
              className="text-white text-sm font-bold bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full border border-white/30 hover:bg-white/30 transition">
              สมัครฟรี
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          {/* Live badge */}
          <div className="flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-white/80 text-xs font-medium">234 คนกำลังวางแผนทริปอยู่ตอนนี้</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
            โลกใบนี้<br />
            <span className="text-[#7EC8E3]">รอคุณอยู่</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
            ค้นพบสถานที่สวยงาม แบ่งปันประสบการณ์<br className="hidden md:block" />
            และสร้างแรงบันดาลใจให้นักเดินทางทั่วโลก
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm">
            <Link href="/register" className="flex-1">
              <button className="w-full bg-white text-[#1C658C] font-bold py-4 rounded-2xl transition shadow-lg text-sm hover:bg-white/90">
                เริ่มต้นเดินทาง →
              </button>
            </Link>
            <Link href="/feed" className="flex-1">
              <button className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium py-4 rounded-2xl border border-white/25 transition text-sm">
                ดูชุมชน
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-14 text-center">
            {[
              { v: "10K+", l: "นักเดินทาง" },
              { v: "50K+", l: "สถานที่" },
              { v: "100K+", l: "รีวิว" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-bold text-white">{s.v}</p>
                <p className="text-white/50 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <ChevronDown className="text-white/40 w-6 h-6" />
        </div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section className="px-6 py-20 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#398AB9]" />
            <span className="text-[#398AB9] text-xs font-semibold uppercase tracking-widest">Trending Now</span>
          </div>
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] dark:text-white">จุดหมายยอดนิยม</h2>
            <Link href="/trending/places" className="text-sm text-[#398AB9] font-semibold hover:underline flex items-center gap-1">
              ดูอันดับทั้งหมด 🔥
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayDestinations
              ? displayDestinations.map((p, i) => (
                  <Link key={p.id} href={`/place/${p.slug}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-md hover:shadow-xl transition-all hover:-translate-y-1 block">
                    {p.coverImage ? (
                      <Image src={p.coverImage} alt={p.name} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority={i === 0} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-[#398AB9] to-[#1C658C] flex items-center justify-center">
                        <span className="text-5xl">🗺️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="inline-block text-[10px] font-semibold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full mb-2">
                        {p.province ?? p.category}
                      </span>
                      <p className="text-white font-semibold text-sm leading-tight">{p.name}</p>
                    </div>
                  </Link>
                ))
              : destinations.map((d) => (
                  <Link key={d.name} href={d.href}
                    className={`group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-md hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-b ${d.from} ${d.to} flex flex-col items-center justify-center block`}>
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {d.emoji}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="inline-block text-[10px] font-semibold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full mb-2">
                        {d.tag}
                      </span>
                      <p className="text-white font-semibold text-sm leading-tight">{d.name}</p>
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-[#F1F7FB] dark:bg-slate-800 px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#398AB9]" />
            <span className="text-[#398AB9] text-xs font-semibold uppercase tracking-widest">Community</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] dark:text-white mb-4">
            ร่วมเป็นส่วนหนึ่ง<br />ของชุมชนนักเดินทาง
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mb-12 max-w-md mx-auto leading-relaxed">
            แบ่งปันเส้นทาง บันทึกทริป และเชื่อมต่อกับนักเดินทางที่มีใจรักการผจญภัยเหมือนกัน
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-12">
            {features.map((f) => (
              <div key={f.title}
                className="bg-white dark:bg-slate-700/50 rounded-2xl p-6 text-left shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-[#1F1F1F] dark:text-slate-100 text-base mb-1.5">{f.title}</h3>
                <p className="text-gray-400 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <Link href="/register">
            <button className="bg-[#398AB9] hover:bg-[#1C658C] text-white font-bold py-4 px-12 rounded-2xl transition shadow-lg shadow-[#398AB9]/30">
              เข้าร่วมชุมชนฟรี →
            </button>
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-6 py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[#398AB9] text-xs font-semibold uppercase tracking-widest">How it works</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] dark:text-white mt-2 mb-12">เริ่มต้นได้ง่ายมาก</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-px bg-[#398AB9]/20" />
                )}
                <div className="w-16 h-16 bg-[#398AB9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-[#398AB9]">{s.n}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 dark:text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI TRIP PLANNER HIGHLIGHT ─── */}
      <section className="px-6 py-20 bg-gradient-to-br from-[#0f2942] to-[#1C658C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 60% 40%, white 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-4">
                <span className="text-sm">✨</span>
                <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">AI-Powered</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                ให้ AI ช่วย<br />วางแผนทริปให้คุณ
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                บอกจุดหมาย วันที่ และงบประมาณ — AI จะสร้าง itinerary รายวันพร้อมสถานที่แนะนำ
                ร้านอาหาร และเส้นทางที่เหมาะกับสไตล์การเดินทางของคุณโดยเฉพาะ
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "สร้าง itinerary รายวันอัตโนมัติ",
                  "แนะนำสถานที่ตามสไตล์คุณ",
                  "ปรับแผนได้ตามต้องการ",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#7EC8E3]/20 border border-[#7EC8E3]/40 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-[#7EC8E3]" />
                    </div>
                    <span className="text-white/80 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/trips/ai-plan"
                className="inline-flex items-center gap-2 bg-white text-[#1C658C] font-bold px-6 py-3 rounded-2xl hover:bg-white/90 transition shadow-lg text-sm">
                ✨ ลอง AI วางแผนให้ฟรี
              </Link>
            </div>

            {/* Visual mockup */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-white/40 text-[10px] ml-2">AI Trip Planner</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { day: "วันที่ 1", icon: "🏔️", place: "ดอยอินทนนท์", time: "08:00 - 12:00" },
                  { day: "วันที่ 1", icon: "🍜", place: "ข้าวซอยแม่สาย", time: "12:30 - 13:30" },
                  { day: "วันที่ 1", icon: "🏛️", place: "วัดพระธาตุดอยสุเทพ", time: "14:00 - 16:00" },
                  { day: "วันที่ 2", icon: "☕", place: "คาเฟ่ริมน้ำปิง", time: "09:00 - 10:30" },
                  { day: "วันที่ 2", icon: "🌸", place: "ตลาดวโรรส", time: "11:00 - 12:30" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${i === 0 ? "bg-[#7EC8E3]/20 border border-[#7EC8E3]/30" : "bg-white/5"}`}>
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{item.place}</p>
                      <p className="text-white/40 text-[10px]">{item.time}</p>
                    </div>
                    <span className="text-[9px] text-white/30 flex-shrink-0">{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="text-[10px] text-white/30">✨ สร้างโดย AI · แก้ไขได้ตามใจ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-6 py-20 bg-[#F8FAFC] dark:bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#398AB9] text-xs font-semibold uppercase tracking-widest">Reviews</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] dark:text-white mt-2">นักเดินทางพูดถึงเรา</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white dark:bg-slate-700/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-600">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50 dark:border-slate-600">
                  <div className={`w-10 h-10 ${t.bg} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{t.role} · {t.trips} ทริป</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED GUIDES ─── */}
      {(() => {
        const guides = verifiedGuides.length >= 1 ? verifiedGuides : MOCK_GUIDES;
        return (
          <section className="px-6 py-20 bg-white dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-500 text-xs font-semibold uppercase tracking-widest">Verified Guides</span>
                </div>
                <Link href="/buddy" className="text-xs text-[#398AB9] font-medium hover:underline">ดูทั้งหมด →</Link>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] dark:text-white mb-2">มัคคุเทศก์ที่ผ่านการรับรอง</h2>
              <p className="text-gray-400 dark:text-slate-500 text-sm mb-10">ไกด์ที่ได้รับการตรวจสอบและรับรองโดย Your Trip — ท่องเที่ยวมั่นใจ ปลอดภัย</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {guides.map((g) => (
                  <Link key={g.id} href={`/profile/${g.id}`}
                    className="group flex flex-col items-center text-center bg-[#FAFBFC] dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <div className="relative mb-3">
                      <Avatar src={g.avatarUrl} name={g.name ?? "G"} className="w-16 h-16 text-xl" />
                      <span className="absolute -bottom-1 -right-1 text-base leading-none">🏅</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">{g.name}</p>
                    {g.username && <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">@{g.username}</p>}
                    {g.location && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500 mb-2">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        <span>{g.location}</span>
                      </div>
                    )}
                    {g.bio && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">{g.bio}</p>
                    )}
                    <div className="mt-auto flex items-center gap-1 text-[10px] text-[#398AB9] font-semibold bg-[#398AB9]/10 px-2.5 py-1 rounded-full">
                      <span>{g.tripsCount} ทริป</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center">
                <Link href="/guide/apply"
                  className="inline-flex items-center gap-2 border border-amber-400 text-amber-600 dark:text-amber-400 dark:border-amber-500 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition">
                  <Shield className="w-4 h-4" />
                  สมัครเป็นมัคคุเทศก์
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ─── CTA STRIP ─── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-[#1C658C] via-[#398AB9] to-[#5BA3C9]">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative z-10 text-center px-6">
          <p className="text-white/70 text-sm uppercase tracking-widest mb-3">Your next adventure awaits</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ทริปต่อไปของคุณ<br />เริ่มที่นี่
          </h2>
          <Link href="/register">
            <button className="bg-white text-[#1C658C] font-bold py-4 px-10 rounded-2xl hover:bg-white/90 transition shadow-xl text-sm">
              สร้างบัญชีฟรี
            </button>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#1F1F1F] text-white/50 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <p className="text-[#398AB9] font-bold text-xl mb-3">Your Trip</p>
              <p className="text-sm text-white/40 leading-relaxed">
                สังคมแห่งการท่องเที่ยว<br />ค้นพบ แบ่งปัน วางแผน
              </p>
            </div>
            <div>
              <p className="text-white/70 font-semibold text-sm mb-3">สำรวจ</p>
              <div className="space-y-2">
                {[["สถานที่", "/explore"], ["สถานที่ยอดนิยม 🔥", "/trending/places"], ["คาเฟ่แนะนำ", "/explore?cat=cafe"]].map(([l, h]) => (
                  <Link key={l} href={h} className="block text-sm text-white/40 hover:text-white/70 transition">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/70 font-semibold text-sm mb-3">ชุมชน</p>
              <div className="space-y-2">
                {[["Feed", "/feed"], ["Travel Buddy", "/buddy"], ["สร้างทริป", "/trips/new"]].map(([l, h]) => (
                  <Link key={l} href={h} className="block text-sm text-white/40 hover:text-white/70 transition">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/70 font-semibold text-sm mb-3">บัญชี</p>
              <div className="space-y-2">
                {[["เข้าสู่ระบบ", "/login"], ["สมัครสมาชิก", "/register"], ["ช่วยเหลือ", "/settings"]].map(([l, h]) => (
                  <Link key={l} href={h} className="block text-sm text-white/40 hover:text-white/70 transition">{l}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-white/30">© 2026 Your Trip. All rights reserved.</p>
            <p className="text-xs text-white/30">Made with ❤️ สำหรับนักเดินทางไทย</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
