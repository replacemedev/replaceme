/**
 * Hardcoded marketing copy for auth screens.
 * Decoupled from Admin CMS — factual product copy only (no fabricated testimonials).
 */

export const SIGNUP_PAGE = {
  headline: "Create your account",
  description: "Join the premier professional marketplace.",
  signInPrompt: "Already have an account?",
  signInLinkLabel: "Sign in",
} as const;

export const SIGNUP_WORKER_PAGE = {
  headline: "Create your worker account",
  description: "Build your profile and apply to remote roles from verified employers.",
  crossRolePrompt: "Looking to hire?",
  crossRoleLinkLabel: "Create an Employer account",
  submitLabel: "Create Worker Account",
} as const;

export const SIGNUP_EMPLOYER_PAGE = {
  headline: "Create your employer account",
  description: "Post jobs, review applicants, and hire Filipino talent directly.",
  crossRolePrompt: "Looking for work?",
  crossRoleLinkLabel: "Sign up as a Worker",
  submitLabel: "Create Employer Account",
} as const;

export const SIGNIN_PAGE = {
  login: {
    headline: "Sign in",
    description: "Access your professional dashboard.",
    signUpPrompt: "Don't have an account?",
    signUpLinkLabel: "Create one",
  },
  forgotPassword: {
    headline: "Reset password",
    description: "Enter your email and we'll send you a secure reset link.",
  },
} as const;

export const SIGNUP_MARKETING = {
  headline: "Where talent meets opportunity",
  description:
    "A curated marketplace for professionals who value direct relationships, transparent hiring, and work that fits their skills.",
  valueProps: [
    {
      title: "Verified marketplace",
      description: "Profiles and employers are reviewed before they go live.",
    },
    {
      title: "Role-based workspaces",
      description: "Separate dashboards for workers and employers.",
    },
    {
      title: "Direct hire, no middlemen",
      description: "Connect and negotiate without agency markups.",
    },
  ],
  trustBadges: ["Secure messaging", "Profile verification", "Direct hiring"],
} as const;

export const SIGNIN_MARKETING = {
  headline: "Welcome back",
  description:
    "Your applications, conversations, and profile organized in one professional workspace.",
  highlights: [
    {
      title: "Stay in the loop",
      description: "Track application status and employer responses in real time.",
    },
    {
      title: "Message with confidence",
      description: "Built-in threads keep every conversation tied to the right role.",
    },
    {
      title: "One profile, every role",
      description: "Update your credentials once and apply across the platform.",
    },
  ],
} as const;
