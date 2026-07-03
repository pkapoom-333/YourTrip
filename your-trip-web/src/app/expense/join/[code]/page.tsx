import { getGroupByInviteCode } from "@/server/actions/expense";
import { createClient as createServerClient } from "@/lib/supabase/server";
import JoinGroupClient from "./JoinGroupClient";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  const group = await getGroupByInviteCode(code).catch(() => null);
  return { title: group ? `เข้าร่วม ${group.name} — YourTrip` : "เข้าร่วมกลุ่ม — YourTrip" };
}

export default async function JoinGroupPage({ params }: Props) {
  const { code } = await params;
  const [group, supabase] = await Promise.all([
    getGroupByInviteCode(code).catch(() => null),
    createServerClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const currentUserName = (user?.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <JoinGroupClient
      code={code}
      group={group}
      currentUserName={currentUserName}
    />
  );
}
