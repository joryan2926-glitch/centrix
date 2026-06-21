"use client";

import { CreditCard, Download, FileDown, History, Plus, ReceiptText, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { frenchVatRates } from "@/data/billing";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import {
  buildDocumentNumber,
  calculateBillingTotals,
  createBillingId,
  createHistory,
  formatCurrency,
  formatDate,
  nextStatus,
  statusLabel
} from "@/services/billing";
import { exportBillingCsv, generateBillingPdf } from "@/services/billingExport";
import { deleteBillingDocument, loadBillingDocuments, saveBillingDocuments, syncBillingDocuments } from "@/services/supabaseBilling";
import type { BillingDocument, BillingLine, BillingStatus, FrenchVatRate } from "@/types/billing";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";

const emptyLine = (): BillingLine => ({
  id: createBillingId("line"),
  description: "Nouvelle prestation",
  quantity: 1,
  unitPrice: 1200,
  vatRate: 20
});

function statusTone(status: BillingStatus) {
  if (status === "paid") {
    return "emerald";
  }

  if (status === "pending") {
    return "cyan";
  }

  return "violet";
}

export function BillingWorkspace() {
  const { loading: supabaseLoading, user } = useSupabaseContext();
  const [documents, setDocuments] = useState<BillingDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [syncState, setSyncState] = useState("Local");
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    if (supabaseLoading) return;
    loadBillingDocuments().then((items) => {
      setDocuments(items);
      setSelectedId(items[0]?.id ?? "");
    });
  }, [supabaseLoading, user?.id]);

  const selected = useMemo(
    () => documents.find((document) => document.id === selectedId) ?? documents[0],
    [documents, selectedId]
  );

  const totals = useMemo(() => calculateBillingTotals(selected?.lines ?? []), [selected]);
  const pendingAmount = useMemo(
    () =>
      documents
        .filter((document) => document.status === "pending")
        .reduce((sum, document) => sum + calculateBillingTotals(document.lines).total, 0),
    [documents]
  );
  const paidAmount = useMemo(
    () =>
      documents
        .filter((document) => document.status === "paid")
        .reduce((sum, document) => sum + calculateBillingTotals(document.lines).total, 0),
    [documents]
  );

  function updateDocument(updater: (document: BillingDocument) => BillingDocument) {
    if (!selected) {
      return;
    }

    setDocuments((current) => {
      const next = current.map((document) =>
        document.id === selected.id
          ? {
              ...updater(document),
              updatedAt: new Date().toISOString()
            }
          : document
      );
      saveBillingDocuments(next);
      syncBillingDocuments(next).then((result) => setSyncState(result.mode === "supabase" ? "Supabase synchronise" : "error" in result && result.error ? `Erreur: ${result.error}` : "Sauvegarde locale"));
      return next;
    });
  }

  function createQuote() {
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 30);

    const document: BillingDocument = {
      id: createBillingId("quote"),
      number: buildDocumentNumber("quote", documents.length),
      type: "quote",
      status: "draft",
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      issueDate: now.toISOString().slice(0, 10),
      dueDate: due.toISOString().slice(0, 10),
      notes: "",
      lines: [emptyLine()],
      history: [createHistory("Devis cree", "Nouveau devis ajoute dans CENTRIX.")],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setDocuments((current) => {
      const next = [document, ...current];
      saveBillingDocuments(next);
      syncBillingDocuments(next).then((result) => setSyncState(result.mode === "supabase" ? "Supabase synchronise" : "error" in result && result.error ? `Erreur: ${result.error}` : "Sauvegarde locale"));
      return next;
    });
    setSelectedId(document.id);
  }

  function updateLine(lineId: string, patch: Partial<BillingLine>) {
    updateDocument((document) => ({
      ...document,
      lines: document.lines.map((line) => (line.id === lineId ? { ...line, ...patch } : line))
    }));
  }

  function removeLine(lineId: string) {
    updateDocument((document) => ({
      ...document,
      lines: document.lines.filter((line) => line.id !== lineId)
    }));
  }

  function addLine() {
    updateDocument((document) => ({
      ...document,
      lines: [...document.lines, emptyLine()]
    }));
  }

  function toggleStatus() {
    updateDocument((document) => {
      const status = nextStatus(document.status);

      return {
        ...document,
        status,
        history: [
          createHistory(status === "paid" ? "Paiement confirme" : "Statut en attente", `Statut modifie vers ${statusLabel(status)}.`),
          ...document.history
        ]
      };
    });
  }

  function convertQuoteToInvoice() {
    if (!selected || selected.type !== "quote") return;
    const now = new Date().toISOString();
    const invoice: BillingDocument = {
      ...selected,
      createdAt: now,
      history: [createHistory("Facture creee", `Conversion depuis le devis ${selected.number}.`), ...selected.history],
      id: createBillingId("invoice"),
      number: buildDocumentNumber("invoice", documents.length),
      status: "pending",
      type: "invoice",
      updatedAt: now
    };
    setDocuments((current) => {
      const next = current.map((document) => document.id === selected.id ? { ...document, status: "paid" as const, history: [createHistory("Converti en facture", `Facture ${invoice.number} generee.`), ...document.history], updatedAt: now } : document);
      const withInvoice = [invoice, ...next];
      saveBillingDocuments(withInvoice);
      syncBillingDocuments(withInvoice).then((result) => setSyncState(result.mode === "supabase" ? "Supabase synchronise" : "error" in result && result.error ? `Erreur: ${result.error}` : "Sauvegarde locale"));
      return withInvoice;
    });
    setSelectedId(invoice.id);
  }

  async function removeSelectedDocument() {
    if (!selected || !window.confirm(`Supprimer ${selected.number} ?`)) return;
    const result = await deleteBillingDocument(selected);
    setDocuments((current) => {
      const next = current.filter((document) => document.id !== selected.id);
      saveBillingDocuments(next);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
    setSyncState(result.mode === "supabase" ? "Supabase synchronise" : result.error ? `Erreur: ${result.error}` : "Sauvegarde locale");
  }

  async function payWithStripe() {
    if (!selected || selected.type !== "invoice") return;
    setStripeLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        body: JSON.stringify({
          amount: totals.total,
          customerEmail: selected.clientEmail,
          invoiceId: selected.id,
          invoiceNumber: selected.number,
          mode: "payment"
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Stripe Checkout indisponible.");
      window.location.href = payload.url;
    } catch (error) {
      setSyncState(error instanceof Error ? `Stripe: ${error.message}` : "Stripe indisponible");
    } finally {
      setStripeLoading(false);
    }
  }

  async function sync() {
    const result = await syncBillingDocuments(documents);
    setSyncState(result.mode === "supabase" ? "Supabase synchronise" : "error" in result && result.error ? `Erreur: ${result.error}` : "Sauvegarde locale");
  }

  if (!selected) {
    return (
      <div className="mx-auto max-w-7xl animate-fade-in">
        <Button onClick={createQuote} variant="primary">
          <Plus size={17} />
          Creer un devis
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
            <ReceiptText size={14} />
            Facturation operationnelle
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-5xl">Facturation</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Creez des devis, calculez la TVA francaise, exportez vos donnees, generez des PDF et synchronisez les documents avec Supabase.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={createQuote} variant="primary">
            <Plus size={17} />
            Nouveau devis
          </Button>
          <Button onClick={() => exportBillingCsv(documents)}>
            <Download size={17} />
            Export CSV
          </Button>
          <Button onClick={sync}>
            <Save size={17} />
            Sauver
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5" interactive>
          <p className="text-sm text-slate-400">En attente</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(pendingAmount)}</p>
        </Card>
        <Card className="p-5" interactive>
          <p className="text-sm text-slate-400">Paye</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(paidAmount)}</p>
        </Card>
        <Card className="p-5" interactive>
          <p className="text-sm text-slate-400">Sauvegarde</p>
          <p className="mt-3 text-2xl font-semibold text-white">{syncState}</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Documents</h2>
            <Badge tone="cyan">{documents.length}</Badge>
          </div>
          <div className="space-y-2">
            {documents.map((document) => {
              const documentTotals = calculateBillingTotals(document.lines);

              return (
                <button
                  key={document.id}
                  className={`w-full rounded-[8px] border p-3 text-left transition-all duration-200 ${
                    document.id === selected.id
                      ? "border-cyan-200/40 bg-cyan-300/10"
                      : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                  }`}
                  onClick={() => setSelectedId(document.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-white">{document.number}</span>
                    <Badge tone={statusTone(document.status)}>{statusLabel(document.status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{document.clientName}</p>
                  <p className="mt-2 text-sm font-semibold text-cyan-100">{formatCurrency(documentTotals.total)}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold text-white">{selected.number}</h2>
                  <Badge tone={statusTone(selected.status)}>{statusLabel(selected.status)}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Emis le {formatDate(selected.issueDate)} · Echeance {formatDate(selected.dueDate)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={toggleStatus}>
                  <Send size={17} />
                  {selected.status === "paid" ? "Marquer en attente" : "Marquer paye"}
                </Button>
                {selected.type === "quote" ? (
                  <Button onClick={convertQuoteToInvoice}>
                    <ReceiptText size={17} />
                    Convertir facture
                  </Button>
                ) : (
                  <Button disabled={stripeLoading || selected.status === "paid"} onClick={payWithStripe} variant="primary">
                    <CreditCard size={17} />
                    Payer Stripe
                  </Button>
                )}
                <Button onClick={() => generateBillingPdf(selected)}>
                  <FileDown size={17} />
                  PDF
                </Button>
                <Button onClick={removeSelectedDocument} variant="ghost">
                  <Trash2 size={17} />
                  Supprimer
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-400">Client</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-cyan-200/50"
                  value={selected.clientName}
                  onChange={(event) => updateDocument((document) => ({ ...document, clientName: event.target.value }))}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-400">Email</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-cyan-200/50"
                  value={selected.clientEmail}
                  onChange={(event) => updateDocument((document) => ({ ...document, clientEmail: event.target.value }))}
                />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm text-slate-400">Adresse</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-cyan-200/50"
                  value={selected.clientAddress}
                  onChange={(event) => updateDocument((document) => ({ ...document, clientAddress: event.target.value }))}
                />
              </label>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-base font-semibold text-white">Lignes du devis</h2>
              <Button onClick={addLine}>
                <Plus size={17} />
                Ligne
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Description</th>
                    <th className="px-5 py-4 font-medium">Qté</th>
                    <th className="px-5 py-4 font-medium">Prix HT</th>
                    <th className="px-5 py-4 font-medium">TVA</th>
                    <th className="px-5 py-4 font-medium">Total HT</th>
                    <th className="px-5 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-300">
                  {selected.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-5 py-4">
                        <input
                          className="h-10 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-white outline-none focus:border-cyan-200/50"
                          value={line.description}
                          onChange={(event) => updateLine(line.id, { description: event.target.value })}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <input
                          className="h-10 w-20 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-white outline-none focus:border-cyan-200/50"
                          min={0}
                          type="number"
                          value={line.quantity}
                          onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) })}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <input
                          className="h-10 w-28 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-white outline-none focus:border-cyan-200/50"
                          min={0}
                          type="number"
                          value={line.unitPrice}
                          onChange={(event) => updateLine(line.id, { unitPrice: Number(event.target.value) })}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <select
                          className="h-10 rounded-[8px] border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-200/50"
                          value={line.vatRate}
                          onChange={(event) => updateLine(line.id, { vatRate: Number(event.target.value) as FrenchVatRate })}
                        >
                          {frenchVatRates.map((rate) => (
                            <option key={rate} value={rate}>
                              {rate}%
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">{formatCurrency(line.quantity * line.unitPrice)}</td>
                      <td className="px-5 py-4">
                        <Button className="h-10 w-10 px-0" onClick={() => removeLine(line.id)} variant="ghost">
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <Card className="p-5">
              <h2 className="text-base font-semibold text-white">Historique client</h2>
              <div className="mt-5 space-y-3">
                {selected.history.map((entry) => (
                  <div key={entry.id} className="flex gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                    <History size={18} className="mt-0.5 text-cyan-200" />
                    <div>
                      <p className="text-sm font-medium text-white">{entry.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(entry.at)}</p>
                      <p className="mt-2 text-sm text-slate-300">{entry.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-base font-semibold text-white">Totaux TVA francaise</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Total HT</span>
                  <strong className="text-white">{formatCurrency(totals.subtotal)}</strong>
                </div>
                {totals.vatByRate.map((vat) => (
                  <div key={vat.rate} className="flex justify-between text-slate-300">
                    <span>TVA {vat.rate}%</span>
                    <strong className="text-white">{formatCurrency(vat.amount)}</strong>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-200">Total TTC</span>
                    <strong className="text-cyan-100">{formatCurrency(totals.total)}</strong>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </section>
    </div>
  );
}
