export interface CuttingDashboardSummary {
  activeLays: number;
  activeLaysChange: number;
  bundlesGenerated: number;
  bundlesPendingQc: number;
  avgWastage: number;
  avgWastageChange: number;
  overdueCuts: number;
}

export interface MarkerEfficiency {
  styleNo: string;
  efficiency: number;   // 0–100
}

export interface CutStatusCount {
  approved: number;
  checked: number;
  draft: number;
  overdue: number;
}

export interface CuttingJob {
  jobNo: string;
  styleNo: string;
  lays: number;
  plies: number;
  bundles: number;
  status: 'Approved' | 'Checked' | 'Draft' | 'Overdue';
  cutDate: string;
  markerEfficiency: number;
}

export interface WastageByDay {
  date: string;   // 'Mon', 'Tue' …
  wastage: number;
}

export interface CuttingDashboardData {
  summary: CuttingDashboardSummary;
  markerEfficiencies: MarkerEfficiency[];
  cutStatus: CutStatusCount;
  recentJobs: CuttingJob[];
  wastageByDay: WastageByDay[];
}