import type { BillingDocument, BillingLine, BillingStatus, BillingTotals, FrenchVatRate } from "@/types/billing";

export function createBillingId(prefix = "doc") {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function calculateBillingTotals(lines: BillingLine[]): BillingTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const rates = new Map<FrenchVatRate, number>();

  lines.forEach((line) => {
    const base = line.quantity * line.unitPrice;
    const amount = base * (line.vatRate / 100);
    rates.set(line.vatRate, (rates.get(line.vatRate) ?? 0) + amount);
  });

  const vatByRate = Array.from(rates.entries())
    .map(([rate, amount]) => ({ rate, amount }))
    .sort((a, b) => a.rate - b.rate);
  const vatTotal = vatByRate.reduce((sum, item) => sum + item.amount, 0);

  return {
    subtotal,
    vatByRate,
    vatTotal,
    total: subtotal + vatTotal
  };
}

export function buildDocumentNumber(type: BillingDocument["type"], count: number) {
  const prefix = type === "quote" ? "DEV" : "INV";
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count + 1).padStart(3, "0")}`;
}

export function nextStatus(status: BillingStatus): BillingStatus {
  if (status === "paid") {
    return "pending";
  }

  return "paid";
}

export function statusLabel(status: BillingStatus) {
  const labels: Record<BillingStatus, string> = {
    draft: "Brouillon",
    pending: "En attente",
    paid: "Paye"
  };

  return labels[status];
}

export function createHistory(label: string, detail: string) {
  return {
    id: createBillingId("history"),
    at: new Date().toISOString(),
    label,
    detail
  };
}
