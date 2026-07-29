import { redirect } from "next/navigation";

export const metadata = {
  title: "Pinned Workers | Replaceme",
};

export default function PinnedPage() {
  redirect("/employer/messages");
}
