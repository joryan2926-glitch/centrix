export type FinanceTransactionType = "revenue" | "expense" | "transfer";
export type FinanceTransactionStatus = "validated" | "pending" | "rejected";
export type FinanceCategoryKey =
  | "marketing"
  | "salaries"
  | "equipment"
  | "taxes"
  | "subscriptions"
  | "suppliers"
  | "other";

export type FinanceCompany = {
  id: string;
  name: string;
  legalName: string;
  vatNumber: string;
  iban: string;
  currency: "EUR";
  logoUrl: string;
  fiscalYearStart: string;
  vatRate: number;
};

export type FinanceTransaction = {
  id: string;
  companyId: string;
  bankAccountId: string | null;
  type: FinanceTransactionType;
  status: FinanceTransactionStatus;
  date: string;
  label: string;
  counterparty: string;
  category: FinanceCategoryKey;
  tags: string[];
  amountExcludingTax: number;
  vatRate: number;
  vatAmount: number;
  amountIncludingTax: number;
  attachmentUrl: string | null;
  history: Array<{ at: string; label: string }>;
  createdAt: string;
  updatedAt: string;
};

export type BankAccount = {
  id: string;
  companyId: string;
  bankName: string;
  label: string;
  iban: string;
  balance: number;
  lastSyncAt: string;
};

export type AccountingEntry = {
  id: string;
  companyId: string;
  transactionId: string;
  account: string;
  debit: number;
  credit: number;
  label: string;
  date: string;
};

export type TaxRecord = {
  id: string;
  companyId: string;
  period: string;
  collectedVat: number;
  deductibleVat: number;
  vatDue: number;
  status: "draft" | "ready" | "filed";
};

export type FinancialReport = {
  id: string;
  companyId: string;
  month: string;
  revenue: number;
  expenses: number;
  cashflow: number;
  netProfit: number;
};

export type AccountingCategory = {
  id: FinanceCategoryKey;
  label: string;
  account: string;
  kind: "income" | "expense" | "transfer";
};

export type FinanceData = {
  companies: FinanceCompany[];
  transactions: FinanceTransaction[];
  bankAccounts: BankAccount[];
  accountingEntries: AccountingEntry[];
  taxRecords: TaxRecord[];
  financialReports: FinancialReport[];
  categories: AccountingCategory[];
};

export type FinanceFilters = {
  query: string;
  type: "all" | FinanceTransactionType;
  status: "all" | FinanceTransactionStatus;
  category: "all" | FinanceCategoryKey;
};
