import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ExploreClient from "./ExploreClient";
import { getPlaces } from "@/server/actions/places";

export const metadata: Metadata = {
  title: "สำรวจสถานที่ | Your Trip",
  description: "ค้นพบสถานที่ท่องเที่ยว ร้านอาหาร คาเฟ่ พร้อมรีวิวจากชุมชนนักเดินทางจริง",
};
import type { PlaceListItem } from "@/server/actions/places";
import { getSavedPlaceIds } from "@/server/actions/savedPlaces";

// Mock data fallback (shown when DB not configured yet)
const MOCK_PLACES: PlaceListItem[] = [
  { id: "1", slug: "doi-ang-khang", name: "ดอยอ่างขาง", nameEn: "Doi Ang Khang", category: "attraction", region: "north", province: "เชียงใหม่", country: "TH", priceRange: 1, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: true, coverImage: "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=600&q=80", rating: 4.8, reviewCount: 2840 },
  { id: "2", slug: "bali-ubud-terraces", name: "นาขั้นบันไดบาหลี", nameEn: "Tegallalang Rice Terraces", category: "attraction", region: "international", province: "บาหลี", country: "ID", priceRange: 2, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: true, coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80", rating: 4.9, reviewCount: 5120 },
  { id: "3", slug: "swiss-alps", name: "Swiss Alps", nameEn: "Swiss Alps", category: "attraction", region: "international", province: "สวิตเซอร์แลนด์", country: "CH", priceRange: 4, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: true, coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80", rating: 4.9, reviewCount: 8760 },
  { id: "4", slug: "santorini", name: "ซานโตรีนี", nameEn: "Santorini", category: "attraction", region: "international", province: "กรีซ", country: "GR", priceRange: 4, hasWifi: false, hasParking: false, isAccessible: false, isFeatured: true, coverImage: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80", rating: 4.8, reviewCount: 12400 },
  { id: "5", slug: "phuket-phi-phi", name: "หมู่เกาะพีพี", nameEn: "Phi Phi Islands", category: "attraction", region: "south", province: "กระบี่", country: "TH", priceRange: 3, hasWifi: false, hasParking: false, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?auto=format&fit=crop&w=600&q=80", rating: 4.7, reviewCount: 6800 },
  { id: "6", slug: "halong-bay", name: "ฮาลองเบย์", nameEn: "Halong Bay", category: "attraction", region: "international", province: "เวียดนาม", country: "VN", priceRange: 3, hasWifi: false, hasParking: false, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80", rating: 4.7, reviewCount: 6890 },
  { id: "7", slug: "chiang-rai-white-temple", name: "วัดร่องขุ่น", nameEn: "White Temple", category: "attraction", region: "north", province: "เชียงราย", country: "TH", priceRange: 1, hasWifi: true, hasParking: true, isAccessible: true, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80", rating: 4.6, reviewCount: 3200 },
  { id: "8", slug: "khao-yai", name: "เขาใหญ่", nameEn: "Khao Yai", category: "attraction", region: "central", province: "นครราชสีมา", country: "TH", priceRange: 2, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=600&q=80", rating: 4.7, reviewCount: 4100 },
  { id: "9", slug: "bangkok-grand-palace", name: "พระบรมมหาราชวัง", nameEn: "Grand Palace", category: "attraction", region: "central", province: "กรุงเทพมหานคร", country: "TH", priceRange: 2, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80", rating: 4.6, reviewCount: 8200 },
  { id: "10", slug: "doi-inthanon", name: "ดอยอินทนนท์", nameEn: "Doi Inthanon", category: "attraction", region: "north", province: "เชียงใหม่", country: "TH", priceRange: 2, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: true, coverImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80", rating: 4.8, reviewCount: 5600 },
  { id: "11", slug: "nimman-coffee-chiangmai", name: "Ristr8to Lab", nameEn: "Ristr8to Lab", category: "cafe", region: "north", province: "เชียงใหม่", country: "TH", priceRange: 2, hasWifi: true, hasParking: true, isAccessible: true, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80", rating: 4.7, reviewCount: 1240 },
  { id: "12", slug: "phu-kradueng", name: "ภูกระดึง", nameEn: "Phu Kradueng", category: "attraction", region: "central", province: "เลย", country: "TH", priceRange: 2, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", rating: 4.7, reviewCount: 2900 },
  { id: "13", slug: "chatuchak-market", name: "ตลาดนัดจตุจักร", nameEn: "Chatuchak Market", category: "attraction", region: "central", province: "กรุงเทพมหานคร", country: "TH", priceRange: 1, hasWifi: false, hasParking: true, isAccessible: true, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1598803596490-9d8e5ea5f36c?auto=format&fit=crop&w=600&q=80", rating: 4.3, reviewCount: 15600 },
  { id: "14", slug: "diving-koh-tao", name: "ดำน้ำเกาะเต่า", nameEn: "Koh Tao Diving", category: "activity", region: "south", province: "สุราษฎร์ธานี", country: "TH", priceRange: 3, hasWifi: false, hasParking: false, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80", rating: 4.8, reviewCount: 3400 },
  { id: "15", slug: "mekong-sunset", name: "ชมพระอาทิตย์ตกแม่น้ำโขง", nameEn: "Mekong Sunset", category: "attraction", region: "central", province: "หนองคาย", country: "TH", priceRange: 1, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80", rating: 4.6, reviewCount: 1200 },
  { id: "16", slug: "samui-chaweng", name: "หาดเฉวง เกาะสมุย", nameEn: "Chaweng Beach Samui", category: "attraction", region: "south", province: "สุราษฎร์ธานี", country: "TH", priceRange: 2, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80", rating: 4.5, reviewCount: 2100 },
  { id: "17", slug: "ayutthaya", name: "อยุธยา", nameEn: "Ayutthaya", category: "attraction", region: "central", province: "พระนครศรีอยุธยา", country: "TH", priceRange: 2, hasWifi: false, hasParking: true, isAccessible: false, isFeatured: false, coverImage: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=600&q=80", rating: 4.7, reviewCount: 8200 },
];

export default async function ExplorePage() {
  const [{ data: dbPlaces }, savedIds] = await Promise.all([
    getPlaces({ take: 50 }),
    getSavedPlaceIds(),
  ]);
  const places = dbPlaces.length > 0 ? dbPlaces : MOCK_PLACES;

  return (
    <AppShell>
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <span className="text-lg font-bold text-[#398AB9]">สำรวจ</span>
      </header>
      <ExploreClient initialPlaces={places} initialSaved={savedIds} />
    </AppShell>
  );
}
