import type { FinanceData } from "@/types/comptabilite";

export const financeFallbackData: FinanceData = {
  companies: [
    {
      id: "company-centrix",
      name: "CENTRIX",
      legalName: "CENTRIX SAS",
      vatNumber: "FR12889900123",
      iban: "FR76 3000 4000 5000 0001 2345 678",
      currency: "EUR",
      logoUrl: "",
      fiscalYearStart: "2026-01-01",
      vatRate: 20
    }
  ],
  categories: [
    { id: "marketing", label: "Marketing", account: "623", kind: "expense" },
    { id: "salaries", label: "Salaires", account: "641", kind: "expense" },
    { id: "equipment", label: "Materiel", account: "2183", kind: "expense" },
    { id: "taxes", label: "Impots", account: "445", kind: "expense" },
    { id: "subscriptions", label: "Abonnements", account: "613", kind: "expense" },
    { id: "suppliers", label: "Fournisseurs", account: "401", kind: "expense" },
    { id: "other", label: "Autres", account: "658", kind: "expense" }
  ],
  bankAccounts: [
    {
      id: "bank-qonto-main",
      companyId: "company-centrix",
      bankName: "Qonto",
      label: "Compte principal",
      iban: "FR76 3000 4000 5000 0001 2345 678",
      balance: 142800,
      lastSyncAt: "2026-05-26T12:00:00.000Z"
    },
    {
      id: "bank-stripe",
      companyId: "company-centrix",
      bankName: "Stripe Treasury",
      label: "Paiements SaaS",
      iban: "FR76 3000 4000 5000 0009 8765 432",
      balance: 41800,
      lastSyncAt: "2026-05-26T11:00:00.000Z"
    }
  ],
  transactions: [
    {
      id: "tx-001",
      companyId: "company-centrix",
      bankAccountId: "bank-stripe",
      type: "revenue",
      status: "validated",
      date: "2026-05-24",
      label: "Abonnements SaaS Enterprise",
      counterparty: "NovaCore",
      category: "other",
      tags: ["MRR", "SaaS"],
      amountExcludingTax: 68000,
      vatRate: 20,
      vatAmount: 13600,
      amountIncludingTax: 81600,
      attachmentUrl: "#",
      history: [{ at: "2026-05-24T09:00:00.000Z", label: "Import Stripe valide" }],
      createdAt: "2026-05-24T09:00:00.000Z",
      updatedAt: "2026-05-24T09:00:00.000Z"
    },
    {
      id: "tx-002",
      companyId: "company-centrix",
      bankAccountId: "bank-qonto-main",
      type: "expense",
      status: "pending",
      date: "2026-05-22",
      label: "Campagne LinkedIn Ads",
      counterparty: "LinkedIn",
      category: "marketing",
      tags: ["Acquisition"],
      amountExcludingTax: 8400,
      vatRate: 20,
      vatAmount: 1680,
      amountIncludingTax: 10080,
      attachmentUrl: null,
      history: [{ at: "2026-05-22T09:00:00.000Z", label: "En attente justificatif" }],
      createdAt: "2026-05-22T09:00:00.000Z",
      updatedAt: "2026-05-22T09:00:00.000Z"
    },
    {
      id: "tx-003",
      companyId: "company-centrix",
      bankAccountId: "bank-qonto-main",
      type: "expense",
      status: "validated",
      date: "2026-05-20",
      label: "Paie equipe mai",
      counterparty: "Equipe CENTRIX",
      category: "salaries",
      tags: ["Payroll"],
      amountExcludingTax: 39000,
      vatRate: 0,
      vatAmount: 0,
      amountIncludingTax: 39000,
      attachmentUrl: "#",
      history: [{ at: "2026-05-20T09:00:00.000Z", label: "OD paie validee" }],
      createdAt: "2026-05-20T09:00:00.000Z",
      updatedAt: "2026-05-20T09:00:00.000Z"
    }
  ],
  accountingEntries: [
    { id: "entry-001", companyId: "company-centrix", transactionId: "tx-001", account: "706", debit: 0, credit: 68000, label: "Vente SaaS", date: "2026-05-24" },
    { id: "entry-002", companyId: "company-centrix", transactionId: "tx-002", account: "623", debit: 8400, credit: 0, label: "Marketing", date: "2026-05-22" },
    { id: "entry-003", companyId: "company-centrix", transactionId: "tx-003", account: "641", debit: 39000, credit: 0, label: "Salaires", date: "2026-05-20" }
  ],
  taxRecords: [
    { id: "tax-2026-05", companyId: "company-centrix", period: "2026-05", collectedVat: 13600, deductibleVat: 1680, vatDue: 11920, status: "ready" }
  ],
  financialReports: [
    { id: "rep-jan", companyId: "company-centrix", month: "Jan", revenue: 42000, expenses: 28000, cashflow: 14000, netProfit: 9600 },
    { id: "rep-fev", companyId: "company-centrix", month: "Fev", revenue: 48000, expenses: 30000, cashflow: 18000, netProfit: 12400 },
    { id: "rep-mar", companyId: "company-centrix", month: "Mar", revenue: 51000, expenses: 34000, cashflow: 17000, netProfit: 11900 },
    { id: "rep-avr", companyId: "company-centrix", month: "Avr", revenue: 63000, expenses: 36000, cashflow: 27000, netProfit: 19200 },
    { id: "rep-mai", companyId: "company-centrix", month: "Mai", revenue: 84000, expenses: 47400, cashflow: 36600, netProfit: 26100 }
  ]
};
