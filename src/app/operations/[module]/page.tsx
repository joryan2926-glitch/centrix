import { notFound } from "next/navigation";
import { OperationalModuleWorkspace } from "@/components/operations/OperationalModuleWorkspace";
import { getOperationalModule, operationalModules } from "@/data/operations";

export function generateStaticParams() {
  return Object.keys(operationalModules).map((module) => ({ module }));
}

export default async function OperationalModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const config = getOperationalModule(module);
  if (!config) notFound();
  return <OperationalModuleWorkspace config={config} />;
}
