import AppShell from "@/components/AppShell";
import { getPublicCollections } from "@/server/actions/collections";
import CollectionsDiscoverClient from "./CollectionsDiscoverClient";

export const metadata = { title: "คอลเลกชันสาธารณะ – YourTrip" };

export default async function CollectionsDiscoverPage() {
  const { data: initial, nextCursor } = await getPublicCollections(20);
  return (
    <AppShell>
      <CollectionsDiscoverClient initial={initial} initialCursor={nextCursor} />
    </AppShell>
  );
}
