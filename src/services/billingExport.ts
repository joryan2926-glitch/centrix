import { calculateBillingTotals, formatCurrency, formatDate } from "@/services/billing";
import type { BillingDocument } from "@/types/billing";

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportBillingCsv(documents: BillingDocument[]) {
  const rows = [
    ["Numero", "Type", "Statut", "Client", "Email", "Emission", "Echeance", "HT", "TVA", "TTC"],
    ...documents.map((document) => {
      const totals = calculateBillingTotals(document.lines);

      return [
        document.number,
        document.type,
        document.status,
        document.clientName,
        document.clientEmail,
        document.issueDate,
        document.dueDate,
        totals.subtotal.toFixed(2),
        totals.vatTotal.toFixed(2),
        totals.total.toFixed(2)
      ];
    })
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(";")).join("\n");
  downloadBlob("centrix-facturation.csv", csv, "text/csv;charset=utf-8");
}

export function generateBillingPdf(document: BillingDocument) {
  const totals = calculateBillingTotals(document.lines);
  const vatRows = totals.vatByRate
    .map((vat) => `<p>TVA ${vat.rate}%: <strong>${formatCurrency(vat.amount)}</strong></p>`)
    .join("");
  const lineRows = document.lines
    .map(
      (line) => `
        <tr>
          <td>${line.description}</td>
          <td>${line.quantity}</td>
          <td>${formatCurrency(line.unitPrice)}</td>
          <td>${line.vatRate}%</td>
          <td>${formatCurrency(line.quantity * line.unitPrice)}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${document.number}</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; margin: 40px; color: #111827; }
          header { display: flex; justify-content: space-between; gap: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
          h1 { margin: 0; font-size: 30px; }
          .brand { letter-spacing: 0.14em; font-weight: 800; color: #4f46e5; }
          .muted { color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin-top: 32px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; }
          .totals { margin-left: auto; margin-top: 28px; width: 320px; }
          .total { font-size: 22px; font-weight: 800; }
          @media print { button { display: none; } body { margin: 28px; } }
        </style>
      </head>
      <body>
        <header>
          <div>
            <div class="brand">CENTRIX</div>
            <h1>${document.type === "quote" ? "Devis" : "Facture"} ${document.number}</h1>
            <p class="muted">Emission: ${formatDate(document.issueDate)} | Echeance: ${formatDate(document.dueDate)}</p>
          </div>
          <div>
            <strong>${document.clientName}</strong>
            <p>${document.clientEmail}</p>
            <p>${document.clientAddress}</p>
          </div>
        </header>
        <table>
          <thead>
            <tr><th>Description</th><th>Qté</th><th>Prix unitaire</th><th>TVA</th><th>Total HT</th></tr>
          </thead>
          <tbody>${lineRows}</tbody>
        </table>
        <section class="totals">
          <p>Total HT: <strong>${formatCurrency(totals.subtotal)}</strong></p>
          ${vatRows}
          <p class="total">Total TTC: ${formatCurrency(totals.total)}</p>
        </section>
        <p class="muted">${document.notes}</p>
        <button onclick="window.print()">Generer le PDF</button>
        <script>window.addEventListener("load", () => window.print());</script>
      </body>
    </html>
  `;

  const pdfWindow = window.open("", "_blank", "width=960,height=720");
  pdfWindow?.document.write(html);
  pdfWindow?.document.close();
}
