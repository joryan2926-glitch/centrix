export type InsightPriority = "low" | "medium" | "high" | "critical";
export type ReportStatus = "draft" | "scheduled" | "published" | "archived";
export type ModelStatus = "training" | "active" | "paused" | "failed";
export type ExportFormat = "pdf" | "excel" | "csv";

export type BusinessReport = {
  id: string;
  title: string;
  template: string;
  owner: string;
  status: ReportStatus;
  sharedWith: string[];
  generatedAt: string;
};

export type PredictiveMetric = {
  id: string;
  label: string;
  module: "finance" | "crm" | "marketing" | "rh" | "support" | "marketplace";
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  period: string;
};

export type AiInsight = {
  id: string;
  title: string;
  summary: string;
  recommendation: string;
  priority: InsightPriority;
  source: string;
  impactScore: number;
  createdAt: string;
};

export type BusinessScore = {
  id: string;
  entity: string;
  category: "company" | "client" | "sales" | "marketing" | "productivity";
  score: number;
  change: number;
  rank: number;
};

export type CompanyGoal = {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  owner: string;
  dueAt: string;
};

export type AnalyticsAlert = {
  id: string;
  title: string;
  detail: string;
  priority: InsightPriority;
  module: string;
  status: "open" | "acknowledged" | "resolved";
  createdAt: string;
};

export type PerformanceMetric = {
  id: string;
  module: string;
  label: string;
  value: number;
  benchmark: number;
  month: string;
};

export type PredictiveModel = {
  id: string;
  name: string;
  purpose: string;
  accuracy: number;
  status: ModelStatus;
  lastTrainedAt: string;
};

export type AnalyticsExport = {
  id: string;
  reportId: string;
  format: ExportFormat;
  requestedBy: string;
  status: "queued" | "ready" | "failed";
  createdAt: string;
};

export type BusinessIntelligenceData = {
  reports: BusinessReport[];
  predictiveMetrics: PredictiveMetric[];
  insights: AiInsight[];
  scores: BusinessScore[];
  goals: CompanyGoal[];
  alerts: AnalyticsAlert[];
  performanceMetrics: PerformanceMetric[];
  models: PredictiveModel[];
  exports: AnalyticsExport[];
};
