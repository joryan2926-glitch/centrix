import type { AiInsight, BusinessIntelligenceData, InsightPriority } from "@/types/business-intelligence";

export const priorityLabels: Record<InsightPriority, string> = {
  low: "faible",
  medium: "moyen",
  high: "eleve",
  critical: "critique"
};

export function priorityTone(priority: InsightPriority): "cyan" | "violet" | "emerald" | "rose" {
  if (priority === "critical") return "rose";
  if (priority === "high") return "violet";
  if (priority === "medium") return "cyan";
  return "emerald";
}

export function getBiDashboard(data: BusinessIntelligenceData) {
  const revenue = data.predictiveMetrics.find((metric) => metric.label === "Revenus predictifs");
  const churn = data.predictiveMetrics.find((metric) => metric.label === "Churn clients");
  const cashflow = data.predictiveMetrics.find((metric) => metric.label === "Cashflow predictif");
  const roi = data.predictiveMetrics.find((metric) => metric.label === "ROI marketing");
  const scoring = data.scores.find((score) => score.category === "company");
  const sales = data.performanceMetrics.filter((metric) => metric.module === "CRM");
  const salesAverage = sales.length ? sales.reduce((sum, metric) => sum + metric.value, 0) / sales.length : 0;

  return {
    predictiveRevenue: revenue?.predictedValue ?? 0,
    estimatedGrowth: revenue ? ((revenue.predictedValue - revenue.currentValue) / revenue.currentValue) * 100 : 0,
    churn: churn?.predictedValue ?? 0,
    teamPerformance: data.performanceMetrics.length ? data.performanceMetrics.reduce((sum, metric) => sum + metric.value, 0) / data.performanceMetrics.length : 0,
    businessScore: scoring?.score ?? 0,
    predictiveCashflow: cashflow?.predictedValue ?? 0,
    marketingRoi: roi?.predictedValue ?? 0,
    salesPerformance: salesAverage,
    openAlerts: data.alerts.filter((alert) => alert.status !== "resolved").length,
    activeModels: data.models.filter((model) => model.status === "active").length
  };
}

export function createInsight(): AiInsight {
  return {
    id: `ins-${Date.now()}`,
    title: "Insight IA genere",
    summary: "CENTRIX a detecte une opportunite de croissance sur les segments premium.",
    recommendation: "Prioriser les comptes a forte adoption et automatiser une sequence commerciale.",
    priority: "high",
    source: "IA Analytics",
    impactScore: 84,
    createdAt: new Date().toISOString()
  };
}
