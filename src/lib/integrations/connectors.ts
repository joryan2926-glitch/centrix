import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type ConnectorContext = {
  supabase: SupabaseClient;
  userId: string;
  email: string | null;
  workspaceId: string;
};

export async function getConnectorContext(): Promise<ConnectorContext | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).maybeSingle();
  if (!profile?.workspace_id) return null;

  return { supabase, userId: user.id, email: user.email ?? null, workspaceId: String(profile.workspace_id) };
}

export async function logConnectorDelivery(
  context: ConnectorContext,
  provider: string,
  action: string,
  status: "pending" | "delivered" | "failed",
  recipient: string | null,
  externalId: string | null,
  metadata: Record<string, unknown> = {}
) {
  await context.supabase.from("integration_deliveries").insert({
    workspace_id: context.workspaceId,
    created_by: context.userId,
    provider,
    action,
    status,
    recipient,
    external_id: externalId,
    metadata
  });
}

export function connectorError(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
