import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function UsernamePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  }).catch(() => null);

  if (!user) notFound();
  redirect(`/profile/${user.id}`);
}
