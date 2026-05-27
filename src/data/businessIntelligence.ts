import type { BusinessIntelligenceData } from "@/types/business-intelligence";

export const businessIntelligenceFallbackData: BusinessIntelligenceData = {
  reports: [
    { id: "rep-1", title: "Executive Revenue Forecast", template: "Direction", owner: "Nadia Belkacem", status: "published", sharedWith: ["Finance", "CEO"], generatedAt: "2026-05-27T07:00:00.000Z" },
    { id: "rep-2", title: "Churn & Retention Intelligence", template: "Customer Success", owner: "Thomas Leroy", status: "scheduled", sharedWith: ["CRM", "Support"], generatedAt: "2026-05-26T16:00:00.000Z" },
    { id: "rep-3", title: "Marketing ROI Predictif", template: "Growth", owner: "Sarah Cohen", status: "draft", sharedWith: ["Marketing"], generatedAt: "2026-05-25T10:30:00.000Z" }
  ],
  predictiveMetrics: [
    { id: "pm-1", label: "Revenus predictifs", module: "finance", currentValue: 84200, predictedValue: 104600, confidence: 91, trend: "up", period: "30 jours" },
    { id: "pm-2", label: "Churn clients", module: "crm", currentValue: 4.8, predictedValue: 3.6, confidence: 86, trend: "down", period: "90 jours" },
    { id: "pm-3", label: "ROI marketing", module: "marketing", currentValue: 3.2, predictedValue: 4.1, confidence: 82, trend: "up", period: "60 jours" },
    { id: "pm-4", label: "Cashflow predictif", module: "finance", currentValue: 41800, predictedValue: 56200, confidence: 88, trend: "up", period: "45 jours" },
    { id: "pm-5", label: "Tickets support", module: "support", currentValue: 142, predictedValue: 118, confidence: 79, trend: "down", period: "14 jours" }
  ],
  insights: [
    { id: "ins-1", title: "Expansion comptes premium", summary: "Les clients CRM actifs ont 27% plus de probabilite d'upgrader si une campagne IA est declenchee sous 10 jours.", recommendation: "Activer un playbook expansion sur NovaCore, Blue Atlas et Orion Cloud.", priority: "high", source: "CRM + Billing", impactScore: 89, createdAt: "2026-05-27T06:45:00.000Z" },
    { id: "ins-2", title: "Anomalie depenses ads", summary: "Le CPA LinkedIn augmente de 18% alors que la conversion baisse sur deux segments.", recommendation: "Reallouer 12K EUR vers SEO et partenariats pendant 14 jours.", priority: "medium", source: "Marketing", impactScore: 73, createdAt: "2026-05-26T18:15:00.000Z" },
    { id: "ins-3", title: "Risque churn support", summary: "Deux comptes avec tickets urgents ouverts depassent le seuil de risque relationnel.", recommendation: "Planifier un appel CSM et offrir une resolution prioritaire.", priority: "critical", source: "Support + CRM", impactScore: 94, createdAt: "2026-05-26T09:20:00.000Z" }
  ],
  scores: [
    { id: "score-1", entity: "CENTRIX Global", category: "company", score: 92, change: 6, rank: 1 },
    { id: "score-2", entity: "Equipe Sales", category: "sales", score: 87, change: 4, rank: 2 },
    { id: "score-3", entity: "Campagne IA Business", category: "marketing", score: 81, change: 9, rank: 3 },
    { id: "score-4", entity: "Client NovaCore", category: "client", score: 96, change: 3, rank: 1 }
  ],
  goals: [
    { id: "goal-1", title: "MRR 100K EUR", target: 100000, current: 84200, unit: "EUR", owner: "Finance", dueAt: "2026-06-30T22:00:00.000Z" },
    { id: "goal-2", title: "Churn sous 4%", target: 4, current: 4.8, unit: "%", owner: "Customer Success", dueAt: "2026-07-15T22:00:00.000Z" },
    { id: "goal-3", title: "Pipeline 400K EUR", target: 400000, current: 312000, unit: "EUR", owner: "Sales", dueAt: "2026-06-20T22:00:00.000Z" }
  ],
  alerts: [
    { id: "alert-bi-1", title: "Objectif MRR en avance", detail: "La prediction indique 104.6K EUR avec 91% de confiance.", priority: "high", module: "Finance", status: "open", createdAt: "2026-05-27T07:15:00.000Z" },
    { id: "alert-bi-2", title: "Risque churn detecte", detail: "Deux clients premium combinent faible usage et tickets urgents.", priority: "critical", module: "CRM", status: "acknowledged", createdAt: "2026-05-26T20:00:00.000Z" },
    { id: "alert-bi-3", title: "Performance support positive", detail: "Le volume prevu baisse de 16.9% sur 14 jours.", priority: "medium", module: "Support", status: "open", createdAt: "2026-05-26T11:00:00.000Z" }
  ],
  performanceMetrics: [
    { id: "perf-1", module: "CRM", label: "Conversion deals", value: 68, benchmark: 56, month: "Jan" },
    { id: "perf-2", module: "CRM", label: "Conversion deals", value: 71, benchmark: 58, month: "Fev" },
    { id: "perf-3", module: "Finance", label: "Cashflow", value: 76, benchmark: 62, month: "Mar" },
    { id: "perf-4", module: "Marketing", label: "ROI", value: 82, benchmark: 65, month: "Avr" },
    { id: "perf-5", module: "Support", label: "SLA", value: 91, benchmark: 78, month: "Mai" },
    { id: "perf-6", module: "Marketplace", label: "GMV", value: 74, benchmark: 60, month: "Juin" }
  ],
  models: [
    { id: "model-1", name: "Revenue Forecast v3", purpose: "Prevision CA et cashflow", accuracy: 91, status: "active", lastTrainedAt: "2026-05-26T02:00:00.000Z" },
    { id: "model-2", name: "Churn Detector", purpose: "Prediction risque clients", accuracy: 86, status: "active", lastTrainedAt: "2026-05-25T02:00:00.000Z" },
    { id: "model-3", name: "Marketing ROI Optimizer", purpose: "Allocation budget campagnes", accuracy: 82, status: "training", lastTrainedAt: "2026-05-27T05:00:00.000Z" }
  ],
  exports: [
    { id: "export-1", reportId: "rep-1", format: "pdf", requestedBy: "Nadia Belkacem", status: "ready", createdAt: "2026-05-27T07:05:00.000Z" },
    { id: "export-2", reportId: "rep-2", format: "excel", requestedBy: "Thomas Leroy", status: "queued", createdAt: "2026-05-26T16:15:00.000Z" }
  ]
};
