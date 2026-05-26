import type { Metric } from "@/types/navigation";

export const quickStats: readonly Metric[] = [
  { label: "MRR", value: "84.2K EUR", delta: "+18.4%", tone: "cyan" },
  { label: "Pipeline", value: "312K EUR", delta: "+32 deals", tone: "violet" },
  { label: "Cashflow", value: "41.8K EUR", delta: "+9.7%", tone: "emerald" },
  { label: "SLA clients", value: "98.6%", delta: "premium", tone: "rose" }
] as const;

export const pipeline = [
  { company: "NovaCore", stage: "Proposal", value: "68K EUR", progress: "78%" },
  { company: "Blue Atlas", stage: "Discovery", value: "24K EUR", progress: "42%" },
  { company: "Orion Cloud", stage: "Legal", value: "96K EUR", progress: "86%" }
] as const;

export const liveAutomations = [
  "Sync CRM vers facturation",
  "Scoring leads IA",
  "Alerte churn premium",
  "Resume comite hebdo"
] as const;
