import type { AuthScreenConfig } from "@/types/page-content";

export const AUTH_STATIC_COPY = {
  login: {
    headline: "Sign in",
    description: "Access your professional dashboard.",
    signupPrompt: "Don't have an account?",
    signupLinkLabel: "Sign up",
    testimonialQuote:
      "ReplaceMe helped us hire a senior developer in under two weeks — no agency fees, direct communication from day one.",
    testimonialName: "Maria Santos",
    testimonialRole: "HR Director, TechScale PH",
  },
  forgotPassword: {
    headline: "Reset password",
    description: "Enter your email and we'll send you a secure reset link.",
    testimonialQuote:
      "The reset flow was fast and secure. I was back in my account within minutes.",
    testimonialName: "James Rivera",
    testimonialRole: "Operations Lead",
  },
  signup: {
    headline: "Create your account",
    description: "Join the premier professional marketplace.",
    signupPrompt: "Already have an account?",
    signupLinkLabel: "Sign in",
    headlineMarketing: "Hire top talent. Land dream roles.",
    descriptionMarketing:
      "Connect directly with verified Filipino professionals and global employers — without middlemen.",
  },
  updatePassword: {
    headline: "Set a new password",
    description: "Choose a strong password for your account.",
    testimonialQuote:
      "Account security matters. ReplaceMe makes it straightforward to keep your credentials safe.",
    testimonialName: "Ana Delgado",
    testimonialRole: "Freelance Designer",
  },
} as const satisfies Record<string, AuthScreenConfig & Record<string, string>>;

export function getAuthStaticContent(
  key: keyof typeof AUTH_STATIC_COPY
): AuthScreenConfig {
  const copy = AUTH_STATIC_COPY[key];
  return {
    headline: copy.headline,
    description: copy.description,
    signupPrompt: "signupPrompt" in copy ? copy.signupPrompt : undefined,
    signupLinkLabel: "signupLinkLabel" in copy ? copy.signupLinkLabel : undefined,
    testimonialQuote: "testimonialQuote" in copy ? copy.testimonialQuote : undefined,
    testimonialName: "testimonialName" in copy ? copy.testimonialName : undefined,
    testimonialRole: "testimonialRole" in copy ? copy.testimonialRole : undefined,
  };
}
