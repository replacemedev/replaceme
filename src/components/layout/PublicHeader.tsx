import { getNavSession } from "@/lib/auth/nav-session";
import { Header } from "./Header";

/**
 * All `(public)` routes share the same marketing header as the landing page.
 * Session only affects the right-side actions (Sign In vs profile dropdown).
 */
export async function PublicHeader() {
  const session = await getNavSession();
  return <Header session={session} />;
}
