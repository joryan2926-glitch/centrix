export type FrenchVatRate = 0 | 2.1 | 5.5 | 10 | 20;

export type BillingStatus = "draft" | "pending" | "paid";

export type BillingLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: FrenchVatRate;
};

export type BillingDocument = {
  id: string;
  number: string;
  type: "quote" | "invoice";
  status: BillingStatus;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  lines: BillingLine[];
  history: BillingHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type BillingHistoryEntry = {
  id: string;
  at: string;
  label: string;
  detail: string;
};

export type BillingTotals = {
  subtotal: number;
  vatByRate: Array<{
    rate: FrenchVatRate;
    amount: number;
  }>;
  vatTotal: number;
  total: number;
};
