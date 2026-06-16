"use client";

import { Paperclip, Pencil, Trash2 } from "lucide-react";
import { formatFinanceCurrency, formatFinanceDate } from "@/lib/comptabilite/format";
import { downloadJsonFile } from "@/lib/download";
import type { FinanceTransaction } from "@/types/comptabilite";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";

const statusTone = {
  validated: "emerald",
  pending: "cyan",
  rejected: "rose"
} as const;

export function TransactionsTable({
  transactions,
  page,
  pageSize,
  onDelete,
  onEdit,
  onValidate
}: {
  transactions: FinanceTransaction[];
  page: number;
  pageSize: number;
  onDelete: (id: string) => void;
  onEdit: (transaction: FinanceTransaction) => void;
  onValidate: (id: string) => void;
}) {
  const visible = transactions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Date</th>
              <th className="px-5 py-4 font-medium">Libelle</th>
              <th className="px-5 py-4 font-medium">Type</th>
              <th className="px-5 py-4 font-medium">Categorie</th>
              <th className="px-5 py-4 font-medium">HT</th>
              <th className="px-5 py-4 font-medium">TVA</th>
              <th className="px-5 py-4 font-medium">TTC</th>
              <th className="px-5 py-4 font-medium">Statut</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {visible.map((transaction) => (
              <tr key={transaction.id} className="transition-colors hover:bg-white/[0.045]">
                <td className="px-5 py-4">{formatFinanceDate(transaction.date)}</td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-white">{transaction.label}</div>
                  <div className="mt-1 text-xs text-slate-500">{transaction.counterparty}</div>
                </td>
                <td className="px-5 py-4">{transaction.type}</td>
                <td className="px-5 py-4">{transaction.category}</td>
                <td className="px-5 py-4">{formatFinanceCurrency(transaction.amountExcludingTax)}</td>
                <td className="px-5 py-4">{formatFinanceCurrency(transaction.vatAmount)}</td>
                <td className="px-5 py-4 font-semibold text-white">{formatFinanceCurrency(transaction.amountIncludingTax)}</td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone[transaction.status]}>{transaction.status}</Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <Button className="h-9 px-3" onClick={() => onValidate(transaction.id)} variant="ghost">
                      Valider
                    </Button>
                    <Button aria-label="Modifier" className="h-9 w-9 px-0" onClick={() => onEdit(transaction)} variant="ghost">
                      <Pencil size={15} />
                    </Button>
                    <Button aria-label="Télécharger le justificatif" className="h-9 w-9 px-0" onClick={() => downloadJsonFile(`justificatif-${transaction.id}.json`, transaction)} variant="ghost">
                      <Paperclip size={15} />
                    </Button>
                    <Button className="h-9 w-9 px-0" onClick={() => onDelete(transaction.id)} variant="ghost">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
