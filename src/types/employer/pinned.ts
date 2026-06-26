export interface PinnedWorker {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  skills: string[];
  experienceYears: number;
  hourlyRate: number;
  isPinned: boolean;
  online: boolean;
  isVerified: boolean;
  contextJobId?: string;
}
