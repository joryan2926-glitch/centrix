import { GET as getMistralHealth } from "@/app/api/mistral/health/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = getMistralHealth;
