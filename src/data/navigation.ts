import {
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  Home,
  Megaphone,
  Repeat2,
  Users,
  WalletCards
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const navigation: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "CRM", href: "/crm", icon: BriefcaseBusiness },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Facturation", href: "/facturation", icon: CreditCard },
  { label: "Comptabilite", href: "/comptabilite", icon: FileSpreadsheet },
  { label: "RH", href: "/rh", icon: WalletCards },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Automatisations", href: "/automatisations", icon: Repeat2 },
  { label: "IA Business", href: "/ia-business", icon: Bot }
] as const;
