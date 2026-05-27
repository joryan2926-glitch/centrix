"use client";

import dynamic from "next/dynamic";
import {
  Banknote,
  Building2,
  Calculator,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  Landmark,
  Plus,
  ReceiptText,
  Save,
  Search,
  TrendingUp,
  WalletCards
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatFinanceCurrency, formatFinanceDate } from "@/lib/comptabilite/format";
import { buildTransaction, filterTransactions, getFinanceDashboard } from "@/services/comptabilite/calculations";
import { useFinanceData } from "@/hooks/comptabilite/useFinanceData";
import type { FinanceCategoryKey, FinanceFilters, FinanceTransactionType } from "@/types/comptabilite";
import { FinanceKpiCard } from "@/ui/comptabilite/FinanceKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import { TransactionsTable } from "@/components/comptabilite/TransactionsTable";

const FinanceCharts = dynamic(() => import("@/components/comptabilite/FinanceCharts").then((module) => module.FinanceCharts), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const views = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "transactions", label: "Transactions", icon: ReceiptText },
  { id: "accounting", label: "Comptabilite", icon: FileSpreadsheet },
  { id: "banking", label: "Banque", icon: Landmark },
  { id: "billing", label: "Facturation", icon: WalletCards },
  { id: "settings", label: "Societes", icon: Building2 }
] as const;

type View = (typeof views)[number]["id"];

type Draft = {
  label: string;
  counterparty: string;
  type: FinanceTransactionType;
  amount: number;
  vatRate: number;
  category: FinanceCategoryKey;
};

const emptyDraft: Draft = {
  label: "Nouvelle transaction",
  counterparty: "Fournisseur",
  type: "expense",
  amount: 1200,
  vatRate: 20,
  category: "suppliers"
};

export function ComptabiliteWorkspace() {
  const { data, loading, mode, toast, mutate, sync } = useFinanceData();
  const [view, setView] = useState<View>("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FinanceFilters>({ query: "", type: "all", status: "all", category: "all" });

  const dashboard = useMemo(() => getFinanceDashboard(data), [data]);
  const transactions = useMemo(() => filterTransactions(data.transactions, filters), [data.transactions, filters]);
  const company = data.companies[0];
  const pageSize = 7;
  const pageCount = Math.max(1, Math.ceil(transactions.length / pageSize));

  function createTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const transaction = buildTransaction({
      label: draft.label,
      counterparty: draft.counterparty,
      type: draft.type,
      amountExcludingTax: Number(draft.amount),
      vatRate: Number(draft.vatRate),
      category: draft.category,
      companyId: company?.id ?? "company-centrix",
      bankAccountId: data.bankAccounts[0]?.id ?? null
    });

    mutate(
      (current) => ({ ...current, transactions: [transaction, ...current.transactions] }),
      { title: "Transaction importee", detail: `${transaction.label} est ajoutee en attente.` }
    );
    setModalOpen(false);
  }

  function validateTransaction(id: string) {
    mutate(
      (current) => ({
        ...current,
        transactions: current.transactions.map((transaction) =>
          transaction.id === id
            ? {
                ...transaction,
                status: "validated",
                updatedAt: new Date().toISOString(),
                history: [{ at: new Date().toISOString(), label: "Transaction validee" }, ...transaction.history]
              }
            : transaction
        )
      }),
      { title: "Transaction validee", detail: "Le journal comptable est pret a etre exporte." }
    );
  }

  function deleteTransaction(id: string) {
    mutate(
      (current) => ({ ...current, transactions: current.transactions.filter((transaction) => transaction.id !== id) }),
      { title: "Transaction supprimee", detail: "La ligne a ete retiree du journal." }
    );
  }

  function exportAccounting() {
    const rows = [
      ["Date", "Libelle", "Type", "Categorie", "HT", "TVA", "TTC", "Statut"],
      ...transactions.map((transaction) => [
        transaction.date,
        transaction.label,
        transaction.type,
        transaction.category,
        transaction.amountExcludingTax,
        transaction.vatAmount,
        transaction.amountIncludingTax,
        transaction.status
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "centrix-export-comptable.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-28" />
          ))}
        </section>
        <Skeleton className="h-[520px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
            <Calculator size={14} />
            Finance OS
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-5xl">Comptabilite & Finance</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Pilotage financier, banque, TVA, transactions, journal comptable, rapports et multi-societes dans une experience fintech premium.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setModalOpen(true)} variant="primary">
            <Plus size={17} />
            Import manuel
          </Button>
          <Button onClick={exportAccounting}>
            <Download size={17} />
            Export
          </Button>
          <Button onClick={sync}>
            <Save size={17} />
            {mode === "supabase" ? "Sync Supabase" : "Sauver local"}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceKpiCard icon={<CircleDollarSign size={19} />} label="Chiffre d'affaires" value={formatFinanceCurrency(dashboard.revenue)} detail="CA valide HT" />
        <FinanceKpiCard icon={<TrendingUp size={19} />} label="Benefice net" value={formatFinanceCurrency(dashboard.netProfit)} detail="Resultat simplifie" />
        <FinanceKpiCard icon={<Banknote size={19} />} label="Tresorerie" value={formatFinanceCurrency(dashboard.cash)} detail="Multi-comptes" />
        <FinanceKpiCard icon={<ReceiptText size={19} />} label="TVA a payer" value={formatFinanceCurrency(dashboard.vatDue)} detail="Collectee - deductible" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[220px_1fr]">
        <Card className="h-fit p-3">
          <nav className="space-y-1">
            {views.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex h-11 w-full items-center gap-3 rounded-[8px] px-3 text-sm font-medium transition-all duration-200 ${
                    view === item.id ? "bg-white/12 text-white shadow-glow" : "text-slate-400 hover:bg-white/8 hover:text-white"
                  }`}
                  onClick={() => setView(item.id)}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-4 rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Entreprise</p>
            <p className="mt-1 text-sm text-slate-300">{company?.legalName ?? "CENTRIX SAS"}</p>
            <p className="mt-2 text-xs text-slate-500">{mode === "supabase" ? "Realtime actif" : "Mode local"}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_150px_150px_170px]">
              <label className="flex h-11 items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400">
                <Search size={17} />
                <input
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  placeholder="Recherche dynamique transaction, fournisseur, tag..."
                  value={filters.query}
                  onChange={(event) => {
                    setFilters((current) => ({ ...current, query: event.target.value }));
                    setPage(1);
                  }}
                />
              </label>
              <Select value={filters.type} onChange={(value) => setFilters((current) => ({ ...current, type: value as FinanceFilters["type"] }))} options={["all", "revenue", "expense", "transfer"]} />
              <Select value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value as FinanceFilters["status"] }))} options={["all", "validated", "pending", "rejected"]} />
              <Select value={filters.category} onChange={(value) => setFilters((current) => ({ ...current, category: value as FinanceFilters["category"] }))} options={["all", ...data.categories.map((category) => category.id)]} />
            </div>
          </Card>

          {view === "dashboard" ? <FinanceCharts data={data} /> : null}
          {view === "transactions" ? (
            <div className="space-y-3">
              {transactions.length ? (
                <TransactionsTable transactions={transactions} page={page} pageSize={pageSize} onDelete={deleteTransaction} onValidate={validateTransaction} />
              ) : (
                <EmptyState icon={<ReceiptText size={18} />} title="Aucune transaction" detail="Importez une transaction ou ajustez les filtres." />
              )}
              <div className="flex justify-end gap-2">
                <Button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Precedent</Button>
                <Button disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Suivant</Button>
              </div>
            </div>
          ) : null}
          {view === "accounting" ? <AccountingView data={data} dashboard={dashboard} /> : null}
          {view === "banking" ? <BankingView data={data} /> : null}
          {view === "billing" ? <BillingConnectedView dashboard={dashboard} unpaid={dashboard.unpaid} /> : null}
          {view === "settings" ? <SettingsView data={data} /> : null}
        </div>
      </section>

      <TransactionModal draft={draft} open={modalOpen} setDraft={setDraft} onClose={() => setModalOpen(false)} onSubmit={createTransaction} />
    </div>
  );
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <select className="h-11 rounded-[8px] border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function AccountingView({ data, dashboard }: { data: ReturnType<typeof useFinanceData>["data"]; dashboard: ReturnType<typeof getFinanceDashboard> }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-base font-semibold text-white">Resume fiscal TVA</h2>
        <div className="mt-5 space-y-3 text-sm">
          <Line label="TVA collectee" value={formatFinanceCurrency(dashboard.collectedVat)} />
          <Line label="TVA deductible" value={formatFinanceCurrency(dashboard.deductibleVat)} />
          <Line label="TVA a payer" value={formatFinanceCurrency(dashboard.vatDue)} strong />
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-base font-semibold text-white">Compte de resultat simplifie</h2>
        <div className="mt-5 space-y-3 text-sm">
          <Line label="Produits" value={formatFinanceCurrency(dashboard.revenue)} />
          <Line label="Charges" value={formatFinanceCurrency(dashboard.monthlyExpenses)} />
          <Line label="Resultat net" value={formatFinanceCurrency(dashboard.netProfit)} strong />
        </div>
      </Card>
      <Card className="xl:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr><th className="px-5 py-4">Date</th><th>Compte</th><th>Libelle</th><th>Debit</th><th>Credit</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              {data.accountingEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.045]">
                  <td className="px-5 py-4">{formatFinanceDate(entry.date)}</td>
                  <td>{entry.account}</td>
                  <td>{entry.label}</td>
                  <td>{formatFinanceCurrency(entry.debit)}</td>
                  <td>{formatFinanceCurrency(entry.credit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function BankingView({ data }: { data: ReturnType<typeof useFinanceData>["data"] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {data.bankAccounts.map((account) => (
        <Card key={account.id} className="p-5" interactive>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{account.label}</h3>
              <p className="mt-1 text-sm text-slate-400">{account.bankName}</p>
            </div>
            <Badge tone="cyan">CSV pret</Badge>
          </div>
          <p className="mt-5 text-3xl font-semibold text-white">{formatFinanceCurrency(account.balance)}</p>
          <p className="mt-3 text-sm text-slate-500">{account.iban}</p>
          <p className="mt-2 text-xs text-slate-500">Derniere sync {formatFinanceDate(account.lastSyncAt)}</p>
        </Card>
      ))}
    </div>
  );
}

function BillingConnectedView({ dashboard, unpaid }: { dashboard: ReturnType<typeof getFinanceDashboard>; unpaid: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FinanceKpiCard icon={<ReceiptText size={19} />} label="Paiements suivis" value={formatFinanceCurrency(dashboard.revenue)} detail="Facturation connectee" />
      <FinanceKpiCard icon={<WalletCards size={19} />} label="Impayes" value={String(unpaid)} detail="Transactions en attente" />
      <FinanceKpiCard icon={<TrendingUp size={19} />} label="Cashflow facture" value={formatFinanceCurrency(dashboard.cashflow)} detail="Revenus - depenses" />
    </div>
  );
}

function SettingsView({ data }: { data: ReturnType<typeof useFinanceData>["data"] }) {
  const company = data.companies[0];
  if (!company) return <EmptyState icon={<Building2 size={18} />} title="Aucune societe" detail="Ajoutez une societe pour demarrer." />;

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-white">Parametres multi-societes</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Info label="Societe" value={company.legalName} />
        <Info label="TVA intracommunautaire" value={company.vatNumber} />
        <Info label="IBAN" value={company.iban} />
        <Info label="Devise" value={company.currency} />
        <Info label="TVA par defaut" value={`${company.vatRate}%`} />
        <Info label="Exercice" value={company.fiscalYearStart} />
      </div>
    </Card>
  );
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-slate-400">{label}</span><strong className={strong ? "text-cyan-100" : "text-white"}>{value}</strong></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></div>;
}

function TransactionModal({ open, draft, setDraft, onSubmit, onClose }: { open: boolean; draft: Draft; setDraft: (draft: Draft) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return (
    <Modal open={open} title="Import manuel transaction" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Libelle" value={draft.label} onChange={(value) => setDraft({ ...draft, label: value })} />
          <Input label="Tiers" value={draft.counterparty} onChange={(value) => setDraft({ ...draft, counterparty: value })} />
          <Select value={draft.type} onChange={(value) => setDraft({ ...draft, type: value as FinanceTransactionType })} options={["revenue", "expense", "transfer"]} />
          <Select value={draft.category} onChange={(value) => setDraft({ ...draft, category: value as FinanceCategoryKey })} options={["marketing", "salaries", "equipment", "taxes", "subscriptions", "suppliers", "other"]} />
          <Input label="Montant HT" type="number" value={String(draft.amount)} onChange={(value) => setDraft({ ...draft, amount: Number(value) })} />
          <Input label="TVA %" type="number" value={String(draft.vatRate)} onChange={(value) => setDraft({ ...draft, vatRate: Number(value) })} />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} type="button" variant="ghost">Annuler</Button>
          <Button type="submit" variant="primary">Importer</Button>
        </div>
      </form>
    </Modal>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs text-slate-500">{label}</span>
      <input className="h-10 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-cyan-200/50" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
