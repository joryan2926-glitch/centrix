import { ModulePage } from "@/components/saas/ModulePage";
import { pageCopy } from "@/data/modules";

export default function MarketingPage() {
  return <ModulePage {...pageCopy.marketing} />;
}
