import { NextResponse, type NextRequest } from "next/server";
import { createModuleEvent } from "@/services/saas-core/actions";
import type { CentrixModuleKey, EventSeverity } from "@/types/saas-core";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const event = await createModuleEvent({
    module: body.module as CentrixModuleKey,
    entityType: String(body.entityType ?? "event"),
    entityId: body.entityId ? String(body.entityId) : null,
    title: String(body.title ?? "Evenement CENTRIX"),
    detail: String(body.detail ?? ""),
    severity: (body.severity as EventSeverity) ?? "info",
    metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {}
  });

  return NextResponse.json({ event });
}
