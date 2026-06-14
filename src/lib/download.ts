"use client";

function triggerDownload(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadTextFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  triggerDownload(filename, content, type);
}

export function downloadJsonFile(filename: string, data: unknown) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
}

export function downloadCsvFile(filename: string, rows: Array<Array<string | number | boolean | null | undefined>>) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll("\"", "\"\"")}"`).join(";"))
    .join("\n");

  downloadTextFile(filename, csv, "text/csv;charset=utf-8");
}
