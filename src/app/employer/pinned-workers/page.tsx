import { redirect } from "next/navigation";

/** Alias route — canonical page lives at `/employer/pinned`. */
export default function PinnedWorkersAliasPage() {
  redirect("/employer/pinned");
}
