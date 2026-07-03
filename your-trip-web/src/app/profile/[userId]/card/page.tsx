import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/server/actions/profile";
import ProfileCardClient from "./ProfileCardClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params;
  const { data: profile } = await getProfile(userId);
  if (!profile) return { title: "โปรไฟล์" };
  return {
    title: `${profile.name ?? profile.username} — Your Trip`,
    description: profile.bio ?? `ดูโปรไฟล์นักเดินทางของ ${profile.name} บน Your Trip`,
    openGraph: {
      title: `${profile.name ?? profile.username} — Your Trip`,
      description: profile.bio ?? `นักเดินทางบน Your Trip`,
      url: `${BASE_URL}/profile/${userId}/card`,
      type: "profile",
      ...(profile.avatarUrl && { images: [{ url: profile.avatarUrl, width: 400, height: 400, alt: profile.name ?? "" }] }),
    },
    twitter: {
      card: "summary",
      title: `${profile.name ?? profile.username} — Your Trip`,
      description: profile.bio ?? `นักเดินทางบน Your Trip`,
      ...(profile.avatarUrl && { images: [profile.avatarUrl] }),
    },
  };
}

export default async function ProfileCardPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { data: profile } = await getProfile(userId);
  if (!profile) notFound();
  return <ProfileCardClient profile={profile} userId={userId} />;
}
