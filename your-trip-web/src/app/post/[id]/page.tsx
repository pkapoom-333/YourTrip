import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getPostById, getRelatedPosts } from "@/server/actions/posts";
import { createClient } from "@/lib/supabase/server";
import PostDetailClient from "./PostDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const { data: post } = await getPostById(id);
  if (!post) return { title: "โพสต์ | Your Trip" };

  const title = `${post.user.name ?? "นักเดินทาง"} — Your Trip`;
  const description = post.content.slice(0, 160) || "ดูโพสต์บน Your Trip";
  const image = post.images[0];

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/post/${id}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/post/${id}`,
      type: "article",
      ...(image && { images: [{ url: image, width: 1200, height: 1200, alt: title }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: post }, { data: { user: me } }] = await Promise.all([
    getPostById(id),
    createClient().then((s) => s.auth.getUser()).catch(() => ({ data: { user: null } })),
  ]);

  if (!post) notFound();

  const { data: related } = await getRelatedPosts(id, post.tags ?? []);

  return (
    <PostDetailClient post={post} meId={me?.id} related={related} />
  );
}
