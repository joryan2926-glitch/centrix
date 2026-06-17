"use client";

import { ArrowUpRight, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { PlanCode } from "@/lib/auth/plan-catalog";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";

type PaidPlanCode = Exclude<PlanCode, "free">;

const priceIds: Record<PaidPlanCode, string> = {
  starter: "price_1TiQlX1KedcFY0WPn6DtDsYn",
  premium: "price_1TiQn41KedcFY0WPHEP8zv9b",
  business: "price_1TiQoP1KedcFY0WPqZGlq0DE",
  enterprise: "price_1TiQpM1KedcFY0WPYQ9A1f2R"
};

export function UpgradeRequired({ moduleKey, requiredPlan }: { moduleKey: string; requiredPlan: PaidPlanCode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceIds[requiredPlan], successUrl: "/billing?checkout=success" })
      });
      const payload = await response.json() as { error?: string; url?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error ?? "Stripe Checkout indisponible.");
      window.location.href = payload.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Mise à niveau impossible.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-9rem)] place-items-center">
      <Card className="max-w-xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-blue-50 text-blue-600">
          <ShieldCheck size={30} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-blue-600">{moduleKey}</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Cette fonctionnalité nécessite le plan {requiredPlan.toUpperCase()}</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">Passez au plan requis pour débloquer ce module pour votre workspace.</p>
        {error ? <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}
        <Button className="mt-6" disabled={loading} onClick={upgrade} variant="primary">
          {loading ? <Loader2 className="animate-spin" size={17} /> : <ArrowUpRight size={17} />}
          Mettre à niveau
        </Button>
      </Card>
    </main>
  );
}
