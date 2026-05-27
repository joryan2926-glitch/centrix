export function formatEnterpriseCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function formatEnterpriseNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatEnterpriseDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
