import {
  Code2,
  Megaphone,
  Palette,
  Headphones,
  type LucideIcon,
} from "lucide-react";

export interface LandingSkillCategory {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  skills: string[];
}

/** Platform skill taxonomy for marketing — category labels, not worker profiles. */
export const LANDING_SKILL_CATEGORIES: LandingSkillCategory[] = [
  {
    id: "tech",
    label: "Software & Engineering",
    description: "Full-stack, mobile, cloud, and QA specialists for product teams.",
    icon: Code2,
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "AWS",
      "Mobile",
      "DevOps",
      "QA Automation",
    ],
  },
  {
    id: "creative",
    label: "Design & Creative",
    description: "UI/UX, brand systems, and production assets for global brands.",
    icon: Palette,
    skills: [
      "UI/UX",
      "Figma",
      "Brand Design",
      "Motion",
      "Illustration",
      "Video Editing",
    ],
  },
  {
    id: "marketing",
    label: "Growth & Marketing",
    description: "SEO, paid media, content, and analytics for revenue teams.",
    icon: Megaphone,
    skills: [
      "SEO",
      "Paid Social",
      "Content Strategy",
      "Email",
      "Analytics",
      "CRO",
    ],
  },
  {
    id: "ops",
    label: "Operations & Support",
    description: "Executive assistants, support leads, and PMs for daily operations.",
    icon: Headphones,
    skills: [
      "Virtual Assistant",
      "Customer Support",
      "Project Management",
      "Bookkeeping",
      "Data Entry",
    ],
  },
];

export const LANDING_SKILL_MARQUEE_ROW = LANDING_SKILL_CATEGORIES.flatMap(
  (cat) => cat.skills.map((skill) => ({ skill, category: cat.label }))
);
