import { notFound } from "next/navigation";
import { OperationalModuleWorkspace } from "@/components/operations/OperationalModuleWorkspace";
import { getOperationalModule } from "@/data/operations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OperationalModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const config = getOperationalModule(module);
  if (!config) notFound();
  return <OperationalModuleWorkspace config={config} />;
}
