import { getAdminAnalytics } from "@/server/actions/admin";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalytics();
  return <AnalyticsClient data={analytics} />;
}
