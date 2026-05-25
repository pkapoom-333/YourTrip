import Link from "next/link";
import { MapPin, Users, Compass, ChevronDown, Star, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Trip — สังคมนักเดินทาง | ค้นพบ แบ่งปัน วางแผน",
  description:
    "แพลตฟอร์มสังคมสำหรับนักเดินทาง ค้นพบสถานที่ใหม่ แบ่งปันประสบการณ์ วางแผนทริป และหาเพื่อนร่วมทาง",
};

const destinations = [
  {
    name: "เชียงใหม่, ไทย",
    tag: "วัฒนธรรม & ธรรมชาติ",
    img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "บาหลี, อินโดนีเซีย",
    tag: "เกาะสวรรค์",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "ซานโตรีนี, กรีซ",
    tag: "โรแมนติก",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "ฮาลองเบย์, เวียดนาม",
    tag: "มหัศจรรย์โลก",
    img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
  },
];

const features = [
  { icon: "✈️", title: "วางแผนทริป", desc: "สร้าง itinerary รายวัน ติดตามงบประมาณ และจัดการทริปได้ในที่เดียว" },
  { icon: "📸", title: "แชร์ประสบการณ์", desc: "โพสต์รูปสวย เพิ่มแท็ก บอกสถานที่ และสร้างแรงบันดาลใจให้ชุมชน" },
  { icon: "🗺️", title: "ค้นพบสถานที่", desc: "ข้อมูลครบ: เวลาเปิด ราคา การเดินทาง รีวิวจริงจากนักเดินทาง" },
  { icon: "👥", title: "หาเพื่อนร่วมทริป", desc: "Travel Buddy Matching — เจอคนที่อยากไปที่เดียวกับคุณ" },
  { icon: "⭐", title: "รีวิวที่เชื่อถือได้", desc: "รีวิวจากชุมชนจริง ไม่ใช่โฆษณา — ตัดสินใจได้มั่นใจขึ้น" },
  { icon: "📱", title: "ใช้ได้ทุกอุปกรณ์", desc: "PWA ติดตั้งลงมือถือได้เหมือนแอป ใช้งานง่ายทั้ง iOS และ Android" },
];

const testimonials = [
  {
    name: "มินตรา พลเยี่ยม",
    role: "Solo Traveler",
    avatar: "มต",
    bg: "bg-pink-400",
    text: "ใช้ Your Trip วางแผนทริปเดี่ยวครั้งแรกไปเชียงใหม่ ข้อมูลสถานที่ครบมาก ช่วยได้เยอะมากๆ แนะนำเลย!",
    rating: 5,
    trips: 12,
  },
  {
    name: "ณัฐพล วงค์ใจ",
    role: "Adventure Seeker",
    avatar: "ณว",
    bg: "bg-emerald-500",
    text: "หาเพื่อนร่วมทริปผ่าน Travel Buddy ได้เพื่อนดีมาก ทริปดอยอ่างขางครั้งนั้นเป็นทริปที่ดีที่สุดในชีวิต",
    rating: 5,
    trips: 47,
  },
  {
    name: "ภาณุวัฒน์ รัตนชาติ",
    role: "Digital Nomad",
    avatar: "ภว",
    bg: "bg-violet-500",
    text: "ฟีเจอร์ itinerary builder ช่วยได้มากตอนวางแผน 2 สัปดาห์ในบาหลี Track งบได้ real-time เลย",
    rating: 5,
    trips: 35,
  },
];

const steps = [
  { n: "01", title: "สมัครฟรี", desc: "สร้างบัญชีด้วย Google ใช้เวลาไม่ถึง 1 นาที" },
  { n: "02", title: "ค้นพบสถานที่", desc: "Browse สถานที่กว่า 50,000 แห่ง พร้อมรีวิวจากชุมชน" },
  { n: "03", title: "วางแผนและไป!", desc: "สร้าง itinerary หาเพื่อนร่วมทริป แล้วออกเดินทาง" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── HERO ─── */}
      <section className="relative h-screen min-h-[600px]">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/85" />

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-12">
          <span className="text-2xl font-bold text-[#398AB9] drop-shadow-lg">
            Your Trip
          </span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="text-white text-sm font-medium bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 hover:bg-white/25 transition"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="text-white text-sm font-bold bg-[#398AB9] px-5 py-2 rounded-full hover:bg-[#1C658C] transition shadow"
            >
              สมัครฟรี
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-[#398AB9]" />
            <span className="text-white/70 text-xs tracking-[0.2em] uppercase">Travel Community</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
            โลกใบนี้<br />
            <span className="text-[#398AB9]">รอคุณอยู่</span>
          </h1>

          <p className="text-white/75 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
            ค้นพบสถานที่สวยงาม แบ่งปันประสบการณ์<br className="hidden md:block" />
            และสร้างแรงบันดาลใจให้นักเดินทางทั่วโลก
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm">
            <Link href="/register" className="flex-1">
              <button className="w-full bg-[#398AB9] hover:bg-[#1C658C] text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-[#398AB9]/40 text-sm">
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
                <p className="text-white/55 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <ChevronDown className="text-white/50 w-6 h-6" />
        </div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#398AB9]" />
            <span className="text-[#398AB9] text-xs font-semibold uppercase tracking-widest">
              Trending Now
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] mb-10">
            จุดหมายยอดนิยม
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((d) => (
              <div
                key={d.name}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={d.img}
                  alt={d.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block text-[10px] font-semibold text-white bg-[#398AB9]/80 backdrop-blur-sm px-2 py-0.5 rounded-full mb-2">
                    {d.tag}
                  </span>
                  <p className="text-white font-semibold text-sm leading-tight">{d.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES / COMMUNITY ─── */}
      <section className="bg-[#F1F7FB] px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#398AB9]" />
            <span className="text-[#398AB9] text-xs font-semibold uppercase tracking-widest">
              Community
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] mb-4">
            ร่วมเป็นส่วนหนึ่ง<br />ของชุมชนนักเดินทาง
          </h2>
          <p className="text-gray-500 mb-12 max-w-md mx-auto leading-relaxed">
            แบ่งปันเส้นทาง บันทึกทริป และเชื่อมต่อกับนักเดินทางที่มีใจรักการผจญภัยเหมือนกัน
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-12">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 text-left shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-[#1F1F1F] text-base mb-1.5">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
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
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[#398AB9] text-xs font-semibold uppercase tracking-widest">How it works</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] mt-2 mb-12">
            เริ่มต้นได้ง่ายมาก
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-px bg-[#398AB9]/20" />
                )}
                <div className="w-16 h-16 bg-[#398AB9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-[#398AB9]">{s.n}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-6 py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#398AB9] text-xs font-semibold uppercase tracking-widest">Reviews</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] mt-2">
              นักเดินทางพูดถึงเรา
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className={`w-10 h-10 ${t.bg} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.trips} ทริป</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INSPIRATION STRIP ─── */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[#1C658C]/80" />
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
                สังคมแห่งการท่องเที่ยว<br />
                ค้นพบ แบ่งปัน วางแผน
              </p>
            </div>
            <div>
              <p className="text-white/70 font-semibold text-sm mb-3">สำรวจ</p>
              <div className="space-y-2">
                {[["สถานที่", "/explore"], ["ทริปยอดนิยม", "/explore"], ["คาเฟ่แนะนำ", "/explore?cat=cafe"]].map(([l, h]) => (
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
