import { ModulePage } from "@/components/saas/ModulePage";
import { pageCopy } from "@/data/modules";

export default function ClientsPage() {
  return <ModulePage {...pageCopy.clients} />;
}
