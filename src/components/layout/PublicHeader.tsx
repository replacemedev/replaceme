import { getNavSession } from "@/lib/auth/nav-session";
import { Header } from "./Header";

export async function PublicHeader() {
  const session = await getNavSession();
  return <Header session={session} />;
}
