import type { FinanceData, FinanceFilters, FinanceTransaction, FinanceTransactionType } from "@/types/comptabilite";

export function calculateVat(amountExcludingTax: number, vatRate: number) {
  return Math.round(amountExcludingTax * (vatRate / 100) * 100) / 100;
}

export function getSignedAmount(transaction: FinanceTransaction) {
  if (transaction.type === "expense") return -transaction.amountIncludingTax;
  if (transaction.type === "transfer") return 0;
  return transaction.amountIncludingTax;
}

export function filterTransactions(transactions: FinanceTransaction[], filters: FinanceFilters) {
  const query = filters.query.trim().toLowerCase();

  return transactions.filter((transaction) => {
    const matchesQuery =
      !query ||
      [
        transaction.label,
        transaction.counterparty,
        transaction.category,
        transaction.status,
        transaction.type,
        ...transaction.tags
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesType = filters.type === "all" || transaction.type === filters.type;
    const matchesStatus = filters.status === "all" || transaction.status === filters.status;
    const matchesCategory = filters.category === "all" || transaction.category === filters.category;

    return matchesQuery && matchesType && matchesStatus && matchesCategory;
  });
}

export function getFinanceDashboard(data: FinanceData) {
  const validated = data.transactions.filter((transaction) => transaction.status === "validated");
  const revenue = validated
    .filter((transaction) => transaction.type === "revenue")
    .reduce((sum, transaction) => sum + transaction.amountExcludingTax, 0);
  const expenses = validated
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amountExcludingTax, 0);
  const collectedVat = validated
    .filter((transaction) => transaction.type === "revenue")
    .reduce((sum, transaction) => sum + transaction.vatAmount, 0);
  const deductibleVat = validated
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.vatAmount, 0);
  const cash = data.bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const unpaid = data.transactions.filter((transaction) => transaction.status === "pending").length;

  return {
    revenue,
    netProfit: revenue - expenses,
    cash,
    monthlyExpenses: expenses,
    vatDue: collectedVat - deductibleVat,
    unpaid,
    cashflow: revenue - expenses,
    collectedVat,
    deductibleVat
  };
}

export function getExpenseBreakdown(data: FinanceData) {
  const totals = new Map<string, number>();

  data.transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amountExcludingTax));

  return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
}

export function buildTransaction(input: {
  label: string;
  counterparty: string;
  type: FinanceTransactionType;
  amountExcludingTax: number;
  vatRate: number;
  category: FinanceTransaction["category"];
  companyId: string;
  bankAccountId: string | null;
}): FinanceTransaction {
  const now = new Date().toISOString();
  const vatAmount = calculateVat(input.amountExcludingTax, input.vatRate);

  return {
    id: `tx-${crypto.randomUUID()}`,
    companyId: input.companyId,
    bankAccountId: input.bankAccountId,
    type: input.type,
    status: "pending",
    date: now.slice(0, 10),
    label: input.label,
    counterparty: input.counterparty,
    category: input.category,
    tags: ["Import manuel"],
    amountExcludingTax: input.amountExcludingTax,
    vatRate: input.vatRate,
    vatAmount,
    amountIncludingTax: input.amountExcludingTax + vatAmount,
    attachmentUrl: null,
    history: [{ at: now, label: "Transaction creee manuellement" }],
    createdAt: now,
    updatedAt: now
  };
}
