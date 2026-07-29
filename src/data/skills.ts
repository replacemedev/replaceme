export const PRIORITY_SKILLS = [
  "Virtual Assistant",
  "Video Editor",
  "Graphic Designer",
  "Social Media Manager",
  "Customer Support",
  "Web Developer",
  "Appointment Setter",
  "Copywriter",
  "Data Entry",
  "Marketing Specialist",
  "Sales Representative",
  "Bookkeeper",
  "E-commerce Manager",
  "Project Manager",
  "UI/UX Designer",
  "Shopify Developer",
  "WordPress Developer",
  "SEO Specialist",
  "Google Ads Specialist",
  "Executive Assistant",
] as const;

export const ALL_SKILLS = [
  // Video Editing
  "Adobe Premiere Pro", "Final Cut Pro", "DaVinci Resolve", "CapCut", "After Effects",
  "Motion Graphics", "Colour Grading", "Audio Editing", "YouTube Editing", "Short Form Content",
  "Long Form Content", "TikTok Editing", "Instagram Reels", "YouTube Shorts", "Video Production",
  // Design
  "Adobe Photoshop", "Adobe Illustrator", "Figma", "Canva", "UI Design", "UX Design",
  "Logo Design", "Branding", "Social Media Design", "Print Design", "Packaging Design", "Web Design",
  // Social Media
  "Social Media", "Instagram", "TikTok", "Facebook", "LinkedIn", "X (Twitter)", "Pinterest",
  "YouTube", "Community Management", "Content Planning", "Influencer Outreach", "Social Media Strategy",
  // Marketing
  "Marketing", "SEO", "Google Ads", "Meta Ads", "TikTok Ads", "Email Marketing", "Copywriting",
  "Content Marketing", "Lead Generation", "Sales Funnels", "Marketing Strategy", "Analytics", "Google Analytics",
  // Virtual Assistance
  "Virtual Assistance", "Email Management", "Calendar Management", "Appointment Setting",
  "Customer Service", "Live Chat Support", "CRM Management", "Internet Research",
  "Travel Planning", "Document Management",
  // Sales
  "Sales", "Cold Calling", "Cold Email", "Lead Qualification", "Closing", "CRM",
  "Appointment Booking", "Customer Success", "Account Management",
  // Development
  "Development", "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular",
  "Node.js", "Express.js", "Python", "Java", "PHP", "C#", "Go", "SQL", "PostgreSQL", "MySQL",
  "MongoDB", "Firebase", "Supabase", "REST APIs", "GraphQL", "Git", "GitHub", "Docker", "AWS", "Vercel",
  // E-commerce
  "E-commerce", "Shopify", "WooCommerce", "Amazon", "Etsy", "eBay", "Product Listing",
  "Inventory Management", "Order Fulfilment", "Product Research",
  // Finance
  "Finance", "Bookkeeping", "Xero", "QuickBooks", "Payroll", "Invoicing", "Excel", "Financial Reporting",
  // HR
  "HR", "Recruitment", "Talent Acquisition", "Resume Screening", "Interviewing",
  "Employee Onboarding", "HR Administration",
  // AI
  "AI", "ChatGPT", "Claude", "Gemini", "Midjourney", "Stable Diffusion", "Cursor",
  "AI Automation", "Prompt Engineering",
  // Languages
  "Languages", "English", "Spanish", "French", "German", "Arabic", "Hindi",
  "Tagalog", "Mandarin", "Japanese", "Korean",
  // General Software
  "Microsoft Excel", "Microsoft Word", "Microsoft PowerPoint", "Google Docs", "Google Sheets",
  "Google Drive", "Notion", "Slack", "Trello", "Asana", "ClickUp", "Monday.com", "Airtable", "Zoom",
] as const;

// Combine priority skills first, then remaining skills (deduped)
const prioritySet = new Set(PRIORITY_SKILLS as readonly string[]);
export const ORDERED_SKILLS: string[] = [
  ...PRIORITY_SKILLS,
  ...ALL_SKILLS.filter(s => !prioritySet.has(s)),
];

export type Skill = (typeof ALL_SKILLS)[number] | (typeof PRIORITY_SKILLS)[number];
