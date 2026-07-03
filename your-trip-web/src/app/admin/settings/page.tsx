import { getSiteConfigs } from "@/server/actions/admin";
import AdminSettingsClient from "./AdminSettingsClient";

export const metadata = { title: "Admin — ตั้งค่าระบบ" };

export default async function AdminSettingsPage() {
  const configs = await getSiteConfigs();
  return <AdminSettingsClient configs={configs} />;
}
