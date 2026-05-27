export function formatSecurityDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function formatSecurityPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatLatency(value: number) {
  return `${Math.round(value)} ms`;
}
