import { createHash } from "crypto";
import { connectorError, getConnectorContext, logConnectorDelivery } from "@/lib/integrations/connectors";

export const runtime = "nodejs";

type GoogleEvent = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  status?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email?: string }>;
};

function googleMeetingId(workspaceId: string, eventId: string) {
  const hex = createHash("sha256").update(`${workspaceId}:${eventId}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function POST() {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);

  const { data: sessionData } = await context.supabase.auth.getSession();
  const providerToken = sessionData.session?.provider_token;
  if (!providerToken) return connectorError("Reconnectez Google avec l'autorisation Calendar.", 409);

  const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const query = new URLSearchParams({ singleEvents: "true", orderBy: "startTime", timeMin, timeMax, maxResults: "500" });
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, {
    headers: { Authorization: `Bearer ${providerToken}` },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({})) as { items?: GoogleEvent[]; error?: { message?: string } };
  if (!response.ok) {
    await logConnectorDelivery(context, "google_calendar", "calendar.sync", "failed", context.email, null);
    return connectorError(payload.error?.message ?? "Synchronisation Google Calendar impossible.", response.status);
  }

  const rows = (payload.items ?? [])
    .filter((event) => event.id && (event.start?.dateTime || event.start?.date) && (event.end?.dateTime || event.end?.date))
    .map((event) => ({
      id: googleMeetingId(context.workspaceId, String(event.id)),
      workspace_id: context.workspaceId,
      created_by: context.userId,
      title: event.summary ?? "Evenement Google Calendar",
      description: event.description ?? "",
      location: event.location ?? "",
      video_url: event.htmlLink ?? "",
      starts_at: event.start?.dateTime ?? `${event.start?.date}T00:00:00.000Z`,
      ends_at: event.end?.dateTime ?? `${event.end?.date}T00:00:00.000Z`,
      status: event.status === "cancelled" ? "cancelled" : "confirmed",
      participants: (event.attendees ?? []).map((attendee) => attendee.email).filter(Boolean),
      metadata: { external_provider: "google_calendar", external_id: event.id }
    }));

  const { error } = rows.length ? await context.supabase.from("meetings").upsert(rows, { onConflict: "id" }) : { error: null };
  await logConnectorDelivery(context, "google_calendar", "calendar.sync", error ? "failed" : "delivered", context.email, null, { imported: rows.length });
  if (error) return connectorError(error.message, 500);
  return Response.json({ ok: true, imported: rows.length });
}
