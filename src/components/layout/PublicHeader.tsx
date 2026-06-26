import { getNavSession } from "@/lib/auth/nav-session";
import { Header } from "./Header";

/**
 * All `(public)` routes share the marketing header shell.
 * Landing-page section nav is shown only on `/`; other public pages show brand + auth actions.
 */
export async function PublicHeader() {
  const session = await getNavSession();
  return <Header session={session} />;
}
