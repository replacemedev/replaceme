export type EmploymentType = "full-time" | "part-time" | "contract";
export type ContractStatus = "active" | "paused" | "terminated";

export interface HiredWorker {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  employmentType: EmploymentType;
  startDate: string;
  hourlyRate: number;
  weeklyHours: number;
  status: ContractStatus;
  online: boolean; // Dynamic status indicator
}

export interface HiredStats {
  totalActive: number;
  monthlyPayroll: number;
  averageTenure: number; // in months
}
