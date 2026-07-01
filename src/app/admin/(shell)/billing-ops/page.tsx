import { redirect } from "next/navigation";

export default function AdminBillingOpsRedirect() {
  redirect("/admin/billing?tab=ops");
}
