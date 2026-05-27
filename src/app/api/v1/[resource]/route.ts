import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const resources: Record<string, Array<Record<string, string | number | boolean>>> = {
  crm: [
    { id: "lead-1", name: "Nova Atlas", status: "qualified", amount: 42000 },
    { id: "lead-2", name: "Blue Market", status: "proposal", amount: 18000 }
  ],
  billing: [
    { id: "inv-1", number: "INV-2048", status: "paid", amount: 2490 },
    { id: "inv-2", number: "INV-2049", status: "pending", amount: 1490 }
  ],
  hr: [
    { id: "emp-1", name: "Lea Martin", role: "Admin", active: true }
  ],
  agenda: [
    { id: "evt-1", title: "Comite revenus", status: "confirmed" }
  ],
  marketing: [
    { id: "camp-1", name: "Launch Q3", leads: 184 }
  ],
  analytics: [
    { id: "metric-1", name: "MRR", value: 946000 }
  ],
  support: [
    { id: "ticket-1", title: "Erreur synchronisation", priority: "urgent" }
  ]
};

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const token = request.headers.get("authorization") ?? request.headers.get("x-api-key");
  if (!token) {
    return Response.json({ error: "Authorization Bearer ou x-api-key requis." }, { status: 401 });
  }

  const { resource } = await context.params;
  const data = resources[resource];
  if (!data) {
    return Response.json({ error: "Ressource API inconnue.", available: Object.keys(resources) }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(Number(searchParams.get("limit") ?? 25), 100);
  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const filtered = query ? data.filter((item) => JSON.stringify(item).toLowerCase().includes(query)) : data;

  return Response.json({
    object: "list",
    apiVersion: "v1",
    resource,
    pagination: { limit, total: filtered.length, hasMore: filtered.length > limit },
    data: filtered.slice(0, limit)
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const token = request.headers.get("authorization") ?? request.headers.get("x-api-key");
  if (!token) {
    return Response.json({ error: "Authorization Bearer ou x-api-key requis." }, { status: 401 });
  }

  const { resource } = await context.params;
  if (!resources[resource]) {
    return Response.json({ error: "Ressource API inconnue.", available: Object.keys(resources) }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  return Response.json({ object: resource, id: `${resource}-${crypto.randomUUID()}`, ...body }, { status: 201 });
}
