import type { SalesData, SalesLead, SalesStage } from "@/types/sales";

export const stageLabels: Record<SalesStage, string> = {
  new_lead: "Nouveau lead",
  contacted: "Contacte",
  qualified: "Qualifie",
  proposal: "Proposition",
  negotiation: "Negociation",
  won: "Gagne",
  lost: "Perdu"
};

export function getSalesDashboard(data: SalesData) {
  const won = data.opportunities.filter((opportunity) => opportunity.status === "won");
  const pipelineValue = data.opportunities.reduce((sum, opportunity) => sum + opportunity.amount, 0);
  const weighted = data.opportunities.reduce((sum, opportunity) => sum + opportunity.amount * (opportunity.probability / 100), 0);
  const targets = data.targets.reduce((sum, target) => sum + target.targetAmount, 0);
  const currentTargets = data.targets.reduce((sum, target) => sum + target.currentAmount, 0);
  return {
    revenue: won.reduce((sum, opportunity) => sum + opportunity.amount, 0) || currentTargets,
    activeLeads: data.leads.filter((lead) => !["won", "lost"].includes(lead.stage)).length,
    conversionRate: data.leads.length ? Math.round((data.leads.filter((lead) => lead.stage === "won").length / data.leads.length) * 100) : 0,
    closedSales: won.length,
    pipelineValue,
    targetProgress: targets ? Math.round((currentTargets / targets) * 100) : 0,
    activeSellers: data.teams.filter((seller) => seller.active).length,
    monthlyRevenue: Math.round(weighted)
  };
}

export function createLead(): SalesLead {
  return {
    id: `lead-${Date.now()}`,
    name: "Nouveau prospect",
    company: "Entreprise",
    email: "prospect@centrix.app",
    phone: "+33 6 00 00 00 00",
    sector: "SaaS",
    source: "Inbound",
    potentialValue: 24000,
    score: 70,
    priority: "medium",
    tags: ["nouveau"],
    ownerId: "seller-1",
    stage: "new_lead",
    createdAt: new Date().toISOString()
  };
}
