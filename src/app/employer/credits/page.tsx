import { redirect } from "next/navigation";

export const metadata = { title: "Credits" };

/** Credits-based unlocks are deprecated — redirect to subscription settings. */
export default function EmployerCreditsPage() {
  redirect("/employer/settings/account");
}
