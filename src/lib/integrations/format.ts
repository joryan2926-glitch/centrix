export function formatIntegrationDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function formatIntegrationNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatResponseTime(ms: number) {
  return `${new Intl.NumberFormat("fr-FR").format(ms)} ms`;
}
