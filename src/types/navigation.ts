import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  keywords?: readonly string[];
  favorite?: boolean;
  children?: readonly NavigationItem[];
};

export type NavigationGroup = {
  label: string;
  items: readonly NavigationItem[];
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
  tone?: "cyan" | "violet" | "emerald" | "rose";
};

export type BusinessModule = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: readonly Metric[];
  table: readonly string[];
  focus: readonly string[];
};
