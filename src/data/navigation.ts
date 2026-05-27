import {
  BarChart3,
  BadgeDollarSign,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  FileSpreadsheet,
  FolderOpen,
  Gavel,
  Home,
  LineChart,
  Megaphone,
  MessagesSquare,
  Repeat2,
  Settings,
  Store,
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
  { label: "Finance", href: "/finance", icon: ChartNoAxesCombined },
  { label: "RH", href: "/rh", icon: WalletCards },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Reseaux Sociaux", href: "/reseaux-sociaux", icon: LineChart },
  { label: "Automatisations", href: "/automatisations", icon: Repeat2 },
  { label: "IA Business", href: "/ia", icon: Bot },
  { label: "Documents Cloud", href: "/documents", icon: FolderOpen },
  { label: "Juridique", href: "/juridique", icon: Gavel },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Support", href: "/support", icon: MessagesSquare },
  { label: "Parametres", href: "/settings", icon: Settings },
  { label: "Billing SaaS", href: "/billing", icon: BadgeDollarSign }
] as const;
