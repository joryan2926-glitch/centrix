import type { ReactNode } from "react";
import { Card } from "@/ui/Card";

type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  title?: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
};

export function DataTable<T>({ title, columns, rows, getRowKey }: DataTableProps<T>) {
  return (
    <Card>
      {title ? <div className="border-b border-slate-200 bg-white px-6 py-5 text-base font-black tracking-[-0.02em] text-slate-950">{title}</div> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs uppercase tracking-[0.14em] text-slate-600">
            <tr>{columns.map((column) => <th key={String(column.key)} className="px-6 py-4 font-black">{column.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="transition-colors duration-200 hover:bg-blue-50/80">
                {columns.map((column) => <td key={String(column.key)} className="px-6 py-4">{column.render ? column.render(row) : String(row[column.key as keyof T] ?? "")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
