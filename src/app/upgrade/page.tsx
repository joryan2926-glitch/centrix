import { UpgradeRequired } from "@/components/billing/UpgradeRequired";
import { getRequiredPlanForModule, type PlanCode } from "@/lib/auth/plan-catalog";

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ module?: string; plan?: string }> }) {
  const params = await searchParams;
  const moduleKey = params.module ?? "module";
  const requestedPlan = params.plan as PlanCode | undefined;
  const requiredPlan = requestedPlan && ["starter", "premium", "business", "enterprise"].includes(requestedPlan)
    ? requestedPlan
    : getRequiredPlanForModule(moduleKey);
  return <UpgradeRequired moduleKey={moduleKey} requiredPlan={requiredPlan} />;
}
