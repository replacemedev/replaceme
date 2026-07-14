/**
 * Hardcoded marketing copy for auth screens.
 * Decoupled from Admin CMS — illustrative mockup content only (no photos).
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
  testimonial: {
    quote:
      "Replaceme cut our time-to-hire in half. We found skilled operators without wading through recruiter noise.",
    name: "Sarah J.",
    role: "Operations Manager · Logistics",
    initials: "SJ",
  },
  trustBadges: ["Secure messaging", "Profile verification", "Enterprise-ready"],
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
  testimonial: {
    quote:
      "The dashboard is calm and focused. I always know what's pending and what needs my attention.",
    name: "Marcus T.",
    role: "Senior Technician",
    initials: "MT",
  },
} as const;
