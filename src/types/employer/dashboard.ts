export type DashboardStats = {
  activeJobPosts: number;
  totalApplicants: number;
  hiredWorkers: number;
  unreadMessages: number;
};

export type JobPost = {
  id: string;
  title: string;
  type: string; // e.g. "Remote"
  status: "Active" | "Closed" | "Draft";
  applicantsCount: number;
  postedAt: string; // relative string e.g. "Posted 2 days ago"
};

export type Message = {
  id: string;
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: string; // e.g. "10:42 AM", "Yesterday"
  isUnread: boolean;
};

export type WorkerProfile = {
  id: string;
  name: string;
  initials: string;
  role: string; // e.g. "Senior UI Designer"
  skills?: string[]; // e.g. ["Figma", "UI/UX"]
  status?: "ACTIVE" | "INACTIVE";
};

export type BillingUsageItem = {
  used: number;
  total: number;
};

export type BillingPlan = {
  name: string; // e.g. "Essential Plan"
  price: string; // e.g. "$30/mo"
  status: "ACTIVE" | "PAST_DUE" | "CANCELED";
  usage: {
    candidateUnlocks: BillingUsageItem;
    jobPosts: BillingUsageItem;
  };
};
