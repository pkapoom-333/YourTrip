import BottomNav from "@/components/BottomNav";
import { Heart, MessageCircle, Send, Bookmark, MapPin, Search, Bell, Plus, MoreHorizontal } from "lucide-react";

const stories = [
  { id: 0, name: "เพิ่มสตอรี่", color: "bg-[#F1F7FB]", initials: "+", isAdd: true },
  { id: 1, name: "free people", color: "bg-orange-400", initials: "FP" },
  { id: 2, name: "shy girl",    color: "bg-pink-400",   initials: "SG" },
  { id: 3, name: "wanderer",   color: "bg-emerald-400", initials: "W" },
  { id: 4, name: "travelmate", color: "bg-violet-400",  initials: "TM" },
  { id: 5, name: "adventurer", color: "bg-amber-400",   initials: "AV" },
];

const posts = [
  {
    id: 1,
    user: { name: "free people", color: "bg-orange-400", initials: "FP", location: "Doi Ang Khang, Chiang Mai" },
    title: "Mountain, sea and sun",
    caption: "ช่วงเช้าที่สวยงามบนยอดดอย อากาศเย็นสบาย ทิวทัศน์สุดสวย ❄️ ใครอยากสัมผัสธรรมชาติต้องมาที่นี่",
    img: "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=800&q=80",
    likes: 10200, comments: 534, shares: 128, saved: false, time: "2 ชั่วโมงที่แล้ว",
  },
  {
    id: 2,
    user: { name: "shy girl", color: "bg-pink-400", initials: "SG", location: "Bali, Indonesia" },
    title: "ดินแดนแห่งความฝัน 🌿",
    caption: "นาขั้นบันไดที่งดงามที่สุดในโลก สีเขียวสดชื่น น้ำใจของชาวบาหลีก็งดงามไม่แพ้กัน 🙏",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    likes: 8760, comments: 412, shares: 98, saved: false, time: "5 ชั่วโมงที่แล้ว",
  },
  {
    id: 3,
    user: { name: "wanderer", color: "bg-emerald-400", initials: "W", location: "Swiss Alps, Switzerland" },
    title: "หิมะขาวโพลน 🏔️",
    caption: "เส้นทาง hiking ที่ยากแต่คุ้มค่ามากๆ ยอดเขาสูง 4,000 เมตร อากาศบริสุทธิ์ ทุกก้าวคือความทรงจำที่ดีที่สุด",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    likes: 15400, comments: 867, shares: 234, saved: true, time: "8 ชั่วโมงที่แล้ว",
  },
  {
    id: 4,
    user: { name: "travelmate", color: "bg-violet-400", initials: "TM", location: "Santorini, Greece" },
    title: "เมืองสีขาว ทะเลสีฟ้า ☀️",
    caption: "Santorini ในแสงยามเย็น สวยเกินจินตนาการ ขอบคุณโลกใบนี้ที่มีสถานที่แบบนี้ให้เราได้มาเยือน 🌅",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    likes: 22100, comments: 1240, shares: 567, saved: false, time: "1 วันที่แล้ว",
  },
  {
    id: 5,
    user: { name: "adventurer", color: "bg-amber-400", initials: "AV", location: "Ha Long Bay, Vietnam" },
    title: "อ่าวฮาลองในหมอก 🚢",
    caption: "ตื่นเช้ามาเจอหมอกลอยบนน้ำ เรือประมงพื้นบ้าน เสียงนกร้อง ช่างเป็นเช้าที่สมบูรณ์แบบมาก",
    img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
    likes: 9830, comments: 445, shares: 156, saved: false, time: "2 วันที่แล้ว",
  },
];

function Avatar({ color, initials, size = "md" }: { color: string; initials: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${s} ${color} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

export default function FeedPage() {
  return (
    <div className="bg-[#F1F7FB] min-h-screen pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <span className="text-xl font-bold text-[#398AB9]">Your Trip</span>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F1F7FB] transition">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F1F7FB] transition relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4F4F] rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {/* Stories */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
            {stories.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`${s.isAdd ? "" : "p-[2px] bg-gradient-to-tr from-[#398AB9] to-[#1C658C]"} rounded-full`}>
                  <div className={`${s.isAdd ? "w-16 h-16 border-2 border-dashed border-[#398AB9]" : "w-16 h-16 border-2 border-white"} ${s.color} rounded-full flex items-center justify-center`}>
                    {s.isAdd
                      ? <Plus className="w-5 h-5 text-[#398AB9]" />
                      : <span className="text-white font-bold text-sm">{s.initials}</span>
                    }
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 w-16 text-center truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-3 pt-3 px-0">
          {posts.map((post) => (
            <article key={post.id} className="bg-white overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar color={post.user.color} initials={post.user.initials} size="md" />
                  <div>
                    <p className="font-semibold text-[#1F1F1F] text-sm">{post.user.name}</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#398AB9]" />
                      <span className="text-[#398AB9] text-[11px]">{post.user.location}</span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <p className="px-4 pb-2 font-semibold text-[#1F1F1F] text-sm">{post.title}</p>

              {/* Image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actions */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#FF4F4F] transition-colors group">
                    <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">{formatCount(post.likes)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#398AB9] transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs font-medium">{formatCount(post.comments)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#398AB9] transition-colors">
                    <Send className="w-5 h-5" />
                    <span className="text-xs font-medium">{formatCount(post.shares)}</span>
                  </button>
                </div>
                <button className={`${post.saved ? "text-[#398AB9]" : "text-gray-400"} hover:text-[#398AB9] transition-colors`}>
                  <Bookmark className={`w-5 h-5 ${post.saved ? "fill-[#398AB9]" : ""}`} />
                </button>
              </div>

              {/* Caption */}
              <div className="px-4 pb-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-[#1F1F1F] mr-1">{post.user.name}</span>
                  {post.caption}
                </p>
                <p className="text-[10px] text-gray-400 mt-2">{post.time}</p>
              </div>

              {/* Comment input */}
              <div className="border-t border-gray-50 px-4 py-2.5 flex items-center gap-3">
                <div className="w-7 h-7 bg-[#398AB9] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  Y
                </div>
                <input
                  type="text"
                  placeholder="แสดงความคิดเห็น..."
                  className="flex-1 text-xs text-gray-500 bg-transparent outline-none placeholder:text-gray-400"
                  readOnly
                />
                <button className="text-[#398AB9] text-xs font-semibold">ส่ง</button>
              </div>
            </article>
          ))}
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-4" />
      </div>

      <BottomNav />
    </div>
  );
}
