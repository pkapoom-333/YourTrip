// Canonical interest vocabulary — used by User.interests, Post.tags, Trip.tags
// so that interest-based ranking (feed + trips) can match consistently.

export const INTEREST_LIST = [
  { key: "beach", label: "ทะเล", emoji: "🏖️", category: "nature" },
  { key: "mountain", label: "ภูเขา", emoji: "⛰️", category: "nature" },
  { key: "waterfall", label: "น้ำตก", emoji: "💧", category: "nature" },
  { key: "temple", label: "วัด/ศาสนา", emoji: "🛕", category: "culture" },
  { key: "food", label: "อาหาร", emoji: "🍜", category: "food" },
  { key: "cafe", label: "คาเฟ่", emoji: "☕", category: "food" },
  { key: "adventure", label: "ผจญภัย", emoji: "🧗", category: "activity" },
  { key: "city", label: "เมือง/ช้อปปิ้ง", emoji: "🏙️", category: "urban" },
  { key: "island", label: "เกาะ", emoji: "🏝️", category: "nature" },
  { key: "history", label: "ประวัติศาสตร์", emoji: "🏛️", category: "culture" },
  { key: "nature", label: "ธรรมชาติ", emoji: "🌿", category: "nature" },
  { key: "nightlife", label: "ไลฟ์สไตล์กลางคืน", emoji: "🌙", category: "urban" },
  { key: "family", label: "ครอบครัว", emoji: "👨‍👩‍👧", category: "activity" },
  { key: "budget", label: "เที่ยวประหยัด", emoji: "💰", category: "style" },
  { key: "luxury", label: "เที่ยวหรูหรา", emoji: "✨", category: "style" },
] as const;

export type InterestKey = (typeof INTEREST_LIST)[number]["key"];

export function getInterestLabel(key: string): string | undefined {
  return INTEREST_LIST.find((i) => i.key === key)?.label;
}

export function isValidInterestKey(key: string): key is InterestKey {
  return INTEREST_LIST.some((i) => i.key === key);
}
