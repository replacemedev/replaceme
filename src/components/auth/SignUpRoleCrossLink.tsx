import Link from "next/link";
import { AUTH_LINK } from "@/lib/auth/ui-tokens";

interface SignUpRoleCrossLinkProps {
  prompt: string;
  linkLabel: string;
  href: string;
}

export function SignUpRoleCrossLink({
  prompt,
  linkLabel,
  href,
}: SignUpRoleCrossLinkProps) {
  return (
    <p className="mb-4 text-center text-sm font-body-base text-slate-600 leading-relaxed lg:text-left">
      {prompt}{" "}
      <Link href={href} className={AUTH_LINK}>
        {linkLabel}
      </Link>
    </p>
  );
}
