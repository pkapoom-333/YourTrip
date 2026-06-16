// Route segment config — force dynamic so Next.js never statically prerenders this page
export const dynamic = "force-dynamic";

import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
