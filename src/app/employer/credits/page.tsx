import { redirect } from "next/navigation";

export const metadata = { title: "Credits | Replaceme" };

/** Credits-based unlocks are deprecated — redirect to subscription settings. */
export default function EmployerCreditsPage() {
  redirect("/employer/settings/account");
}
