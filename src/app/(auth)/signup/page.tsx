import { redirect } from "next/navigation";
import { parseGuestCallbackUrl } from "@/lib/auth/safe-callback-url";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign Up | Replaceme",
  description: "Create your Replaceme account.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = parseGuestCallbackUrl(params.callbackUrl);

  if (callbackUrl) {
    redirect(`/signup/worker?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  redirect("/signup/worker");
}
