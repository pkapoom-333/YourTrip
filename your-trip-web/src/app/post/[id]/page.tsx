"use server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getPostById } from "@/server/actions/posts";
import { PostDetailClient } from "./PostDetailClient";

interface Props { params: Promise<{ id: string }> }

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: post } = await getPostById(id);
  if (!post) return { title: "ไม่พบโพสต์ | YourTrip" };
  const snippet = post.content.length > 80 ? post.content.slice(0, 80) + "…" : post.content;
  const authorName = post.user.name ?? "นักเดินทาง";

  const ogParams = new URLSearchParams({
    title: authorName,
    subtitle: snippet,
    type: "post",
    ...(post.images[0] ? { image: post.images[0] } : {}),
  });
  const ogImage = `${BASE_URL}/api/og?${ogParams.toString()}`;

  return {
    title: `${authorName} — ${snippet} | YourTrip`,
    description: snippet,
    openGraph: {
      title: `${authorName} โพสต์บน Your Trip`,
      description: snippet,
      url: `${BASE_URL}/post/${id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: snippet }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${authorName} โพสต์บน Your Trip`,
      description: snippet,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const { data: post } = await getPostById(id);
  if (!post) notFound();
  return (
    <AppShell>
      <PostDetailClient post={post} />
    </AppShell>
  );
}
