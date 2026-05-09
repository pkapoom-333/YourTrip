import AppShell from "@/components/AppShell";
import Link from "next/link";
import {
  Heart, MessageCircle, Send, Bookmark,
  MapPin, Search, Bell, MoreHorizontal, TrendingUp,
} from "lucide-react";

const stories = [
  { id: 0, name: "เพิ่มสตอรี่", bg: "bg-gray-100", initials: "+", isAdd: true },
  { id: 1, name: "free people",  bg: "bg-orange-400",  initials: "FP" },
  { id: 2, name: "shy girl",     bg: "bg-pink-400",    initials: "SG" },
  { id: 3, name: "wanderer",     bg: "bg-emerald-400", initials: "W"  },
  { id: 4, name: "travelmate",   bg: "bg-violet-400",  initials: "TM" },
  { id: 5, name: "adventurer",   bg: "bg-amber-400",   initials: "AV" },
  { id: 6, name: "nomad",        bg: "bg-sky-400",     initials: "N"  },
];

const posts = [
  {
    id: 1, slug: "doi-ang-khang",
    user: { name: "free people", bg: "bg-orange-400", initials: "FP", location: "ดอยอ่างขาง, เชียงใหม่" },
    title: "Mountain, sea and sun",
    caption: "ช่วงเช้าที่สวยงามบนยอดดอย อากาศเย็นสบาย ทิวทัศน์สุดสวย ❄️ ใครอยากสัมผัสธรรมชาติต้องมาที่นี่",
    img: "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=800&q=80",
    likes: 10200, comments: 534, shares: 128, saved: false, time: "2 ชั่วโมงที่แล้ว",
    tags: ["เที่ยวเหนือ", "ธรรมชาติ"],
  },
  {
    id: 2, slug: "bali-terraces",
    user: { name: "shy girl", bg: "bg-pink-400", initials: "SG", location: "บาหลี, อินโดนีเซีย" },
    title: "ดินแดนแห่งความฝัน 🌿",
    caption: "นาขั้นบันไดที่งดงามที่สุดในโลก สีเขียวสดชื่น น้ำใจของชาวบาหลีงดงามไม่แพ้กัน 🙏",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    likes: 8760, comments: 412, shares: 98, saved: true, time: "5 ชั่วโมงที่แล้ว",
    tags: ["บาหลี", "ต่างประเทศ"],
  },
  {
    id: 3, slug: "swiss-alps",
    user: { name: "wanderer", bg: "bg-emerald-400", initials: "W", location: "Swiss Alps, Switzerland" },
    title: "หิมะขาวโพลน 🏔️",
    caption: "Hiking ที่ยากแต่คุ้มค่า ยอดเขา 4,000 เมตร อากาศบริสุทธิ์ ทุกก้าวคือความทรงจำที่ดีที่สุด",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    likes: 15400, comments: 867, shares: 234, saved: false, time: "8 ชั่วโมงที่แล้ว",
    tags: ["Hiking", "ยุโรป"],
  },
  {
    id: 4, slug: "santorini",
    user: { name: "travelmate", bg: "bg-violet-400", initials: "TM", location: "ซานโตรีนี, กรีซ" },
    title: "เมืองสีขาว ทะเลสีฟ้า ☀️",
    caption: "Santorini ในแสงยามเย็น สวยเกินจินตนาการ ขอบคุณโลกใบนี้ที่มีสถานที่แบบนี้ 🌅",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    likes: 22100, comments: 1240, shares: 567, saved: false, time: "1 วันที่แล้ว",
    tags: ["ยุโรป", "โรแมนติก"],
  },
];

const trending = [
  { label: "เชียงใหม่", count: "2.4K โพสต์" },
  { label: "บาหลี", count: "1.8K โพสต์" },
  { label: "โตเกียว", count: "3.1K โพสต์" },
  { label: "ภูเก็ต", count: "1.5K โพสต์" },
];

function Avatar({ bg, initials, size = "md" }: { bg: string; initials: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" }[size];
  return (
    <div className={`${s} ${bg} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  );
}

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

export default function FeedPage() {
  return (
    <AppShell>
      {/* ─── TOP BAR (mobile only) ─── */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-[#398AB9]">Your Trip</span>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4F4F] rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-0 md:px-6 py-0 md:py-6">
        <div className="flex gap-6">
          {/* ─── MAIN FEED ─── */}
          <div className="flex-1 min-w-0">

            {/* Desktop page title */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900">หน้าหลัก</h1>
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#398AB9] transition">
                <Bell className="w-4 h-4" />
                การแจ้งเตือน
              </button>
            </div>

            {/* Stories */}
            <div className="bg-white md:rounded-2xl border border-gray-100 px-4 py-4 mb-3">
              <div className="flex gap-4 overflow-x-auto scrollbar-none">
                {stories.map((s) => (
                  <button key={s.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={s.isAdd ? "" : "p-[2px] rounded-full bg-gradient-to-tr from-[#398AB9] to-[#1C658C]"}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 border-white ${
                        s.isAdd ? "bg-gray-100 border-dashed border-2 border-gray-300" : s.bg
                      }`}>
                        <span className={`font-bold text-sm ${s.isAdd ? "text-gray-400" : "text-white"}`}>
                          {s.initials}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 w-14 text-center truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-3">
              {posts.map((post) => (
                <article key={post.id} className="bg-white md:rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar bg={post.user.bg} initials={post.user.initials} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{post.user.name}</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#398AB9]" />
                          <span className="text-[11px] text-[#398AB9]">{post.user.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{post.time}</span>
                      <button className="p-1 hover:bg-gray-50 rounded-full">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Title + tags */}
                  <div className="px-4 pb-2">
                    <p className="font-semibold text-gray-900 text-sm">{post.title}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {post.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Image */}
                  <Link href={`/place/${post.slug}`}>
                    <div className="aspect-[4/3] overflow-hidden cursor-pointer">
                      <img src={post.img} alt={post.title}
                        className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#FF4F4F] transition-colors group">
                        <Heart className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-gray-600">{fmt(post.likes)}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#398AB9] transition-colors">
                        <MessageCircle className="w-[18px] h-[18px]" />
                        <span className="text-xs text-gray-600">{fmt(post.comments)}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#398AB9] transition-colors">
                        <Send className="w-[18px] h-[18px]" />
                        <span className="text-xs text-gray-600">{fmt(post.shares)}</span>
                      </button>
                    </div>
                    <button className={post.saved ? "text-[#398AB9]" : "text-gray-400 hover:text-[#398AB9] transition-colors"}>
                      <Bookmark className={`w-[18px] h-[18px] ${post.saved ? "fill-[#398AB9]" : ""}`} />
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-800 mr-1">{post.user.name}</span>
                      {post.caption}
                    </p>
                  </div>

                  {/* Comment input */}
                  <div className="border-t border-gray-50 px-4 py-2.5 flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#398AB9] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      YT
                    </div>
                    <input type="text" placeholder="แสดงความคิดเห็น..."
                      className="flex-1 text-xs text-gray-500 bg-transparent outline-none placeholder:text-gray-400" readOnly />
                    <button className="text-[#398AB9] text-xs font-semibold hover:text-[#1C658C]">ส่ง</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* ─── RIGHT PANEL (desktop only) ─── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            {/* Trending */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#398AB9]" />
                <h3 className="text-sm font-semibold text-gray-900">กำลังฮิต</h3>
              </div>
              <div className="space-y-3">
                {trending.map((t, i) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-800">#{t.label}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested places */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">สถานที่แนะนำ</h3>
              <div className="space-y-3">
                {[
                  { name: "ดอยอินทนนท์", cat: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=200&q=70" },
                  { name: "ฮาลองเบย์", cat: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=200&q=70" },
                  { name: "Cafe Amazon", cat: "คาเฟ่", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=70" },
                ].map((p) => (
                  <Link key={p.name} href={`/place/${p.name}`}
                    className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-xl transition">
                    <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.cat}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
