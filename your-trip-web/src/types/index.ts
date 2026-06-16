/* ── Auth ─────────────────────────────────────────────── */
export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: Date;
}

/* ── Place ────────────────────────────────────────────── */
export type PriceRange = "฿" | "฿฿" | "฿฿฿" | "฿฿฿฿";
export type PlaceCategory = "nature" | "food" | "cafe" | "hotel" | "activity";
export type PlaceStatus = "ACTIVE" | "CLOSED" | "PENDING";

export interface PlaceHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface PlaceTransport {
  car?: string;
  motorcycle?: string;
  bus?: string;
  songthaew?: string;
}

export interface PlaceParking {
  available: boolean;
  spaces?: string;
  fee?: string;
}

export interface PlaceFacilities {
  wifi: boolean;
  ac: boolean;
  vegetarian: boolean;
  accessibility: boolean;
}

export interface PlaceImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  category: PlaceCategory;
  location: string;
  region: string;
  lat?: number;
  lng?: number;
  rating: number;
  reviewCount: number;
  priceRange: PriceRange;
  priceNote?: string;
  isOpen: boolean;
  openUntil?: string;
  phone?: string;
  website?: string;
  description: string;
  descriptionEn?: string;
  hours: PlaceHours[];
  images: PlaceImage[];
  transport: PlaceTransport;
  parking: PlaceParking;
  facilities: PlaceFacilities;
  caution: string[];
  tags: string[];
  status: PlaceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NearbyPlace {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  image: string;
  rating: number;
  distance?: number;
}

/* ── Review ───────────────────────────────────────────── */
export interface Review {
  id: string;
  placeId: string;
  userId: string;
  user: Pick<User, "id" | "name" | "avatar">;
  rating: number;
  text: string;
  photos: string[];
  likes: number;
  createdAt: Date;
}

/* ── Post / Feed ──────────────────────────────────────── */
export interface Post {
  id: string;
  userId: string;
  user: Pick<User, "id" | "name" | "avatar">;
  content: string;
  images: string[];
  location?: string;
  placeId?: string;
  place?: Pick<Place, "id" | "slug" | "name">;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: Pick<User, "id" | "name" | "avatar">;
  text: string;
  likes: number;
  createdAt: Date;
}

/* ── Trip ─────────────────────────────────────────────── */
export type TripStatus = "PLANNING" | "ONGOING" | "COMPLETED";
export type TripVisibility = "PUBLIC" | "PRIVATE";

export interface ItineraryItem {
  id: string;
  tripId: string;
  day: number;
  title: string;
  time?: string;
  location?: string;
  notes?: string;
  placeId?: string;
  order: number;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  description?: string;
  coverImage?: string;
  visibility: TripVisibility;
  status: TripStatus;
  members: Pick<User, "id" | "name" | "avatar">[];
  itinerary: ItineraryItem[];
  placeCount: number;
  createdAt: Date;
}

/* ── Travel Buddy ─────────────────────────────────────── */
export type BuddyStatus = "OPEN" | "MATCHED" | "CLOSED";
export type MatchStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface BuddyRequest {
  id: string;
  userId: string;
  user: Pick<User, "id" | "name" | "avatar" | "location">;
  destination: string;
  startDate: Date;
  endDate: Date;
  description: string;
  budget?: number;
  status: BuddyStatus;
  matchCount: number;
  createdAt: Date;
}

/* ── Notification ─────────────────────────────────────── */
export type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "BUDDY_REQUEST" | "BUDDY_ACCEPTED";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  fromUser: Pick<User, "id" | "name" | "avatar">;
  postId?: string;
  tripId?: string;
  buddyId?: string;
  read: boolean;
  createdAt: Date;
}

/* ── API Response ─────────────────────────────────────── */
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

/* ── UI ───────────────────────────────────────────────── */
export interface SelectOption {
  value: string;
  label: string;
}

export type TabItem<T extends string = string> = {
  key: T;
  label: string;
  icon?: React.ElementType;
};
