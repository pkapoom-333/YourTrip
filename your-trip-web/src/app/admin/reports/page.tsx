import { getAdminReports } from "@/server/actions/admin";
import AdminReportsClient from "./AdminReportsClient";

export const metadata = { title: "Admin — รายงาน" };

export default async function AdminReportsPage() {
  const reports = await getAdminReports();
  return <AdminReportsClient initialReports={reports} />;
}
