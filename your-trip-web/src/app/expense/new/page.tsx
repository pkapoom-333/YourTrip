import AppShell from "@/components/AppShell";
import NewExpenseGroupClient from "./NewExpenseGroupClient";

export const metadata = { title: "สร้างกลุ่มหาร — YourTrip" };

export default function NewExpenseGroupPage() {
  return (
    <AppShell>
      <NewExpenseGroupClient />
    </AppShell>
  );
}
