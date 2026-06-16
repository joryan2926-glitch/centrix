import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { dispatchSocialPost } from "@/lib/social/publisher";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Non autorise." }, { status: 401 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return Response.json({ error: "Supabase admin non configure." }, { status: 503 });

  const { data: posts, error } = await admin
    .from("marketing_posts")
    .select("id, accountIds, content, hashtags, mediaUrls, workspace_id")
    .eq("status", "scheduled")
    .lte("scheduledAt", new Date().toISOString())
    .limit(25);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results = await Promise.allSettled((posts ?? []).map((post) => dispatchSocialPost(admin, post)));
  return Response.json({
    checked: results.length,
    published: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length
  });
}
