import Link from "next/link";
import { MapPin, Users, Compass, ChevronDown } from "lucide-react";

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
  { icon: "✈️", title: "บันทึกทริป", desc: "วางแผนและบันทึกเส้นทางการเดินทางทุกทริปของคุณ" },
  { icon: "📸", title: "แชร์ภาพสวย", desc: "แบ่งปันภาพถ่ายและประสบการณ์ที่น่าจดจำ" },
  { icon: "🗺️", title: "ค้นพบที่ใหม่", desc: "ค้นหาสถานที่ท่องเที่ยวจากคำแนะนำของชุมชน" },
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-7 text-left shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-[#1F1F1F] text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
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
      <footer className="bg-[#1F1F1F] text-white/50 text-center py-10 text-sm">
        <p className="text-[#398AB9] font-bold text-xl mb-2">Your Trip</p>
        <p>สังคมแห่งการท่องเที่ยว • © 2026</p>
      </footer>
    </div>
  );
}
