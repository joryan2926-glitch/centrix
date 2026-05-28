import {
  BarChart3,
  BadgeDollarSign,
  BellRing,
  Bot,
  BrainCircuit,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  FileSignature,
  FileSpreadsheet,
  FolderOpen,
  Gavel,
  GitBranch,
  Home,
  LineChart,
  Megaphone,
  MessagesSquare,
  PanelsTopLeft,
  Repeat2,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  Users,
  WandSparkles,
  WalletCards
} from "lucide-react";
import type { NavigationGroup, NavigationItem } from "@/types/navigation";

export const navigationGroups: readonly NavigationGroup[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Vue globale", href: "/dashboard", icon: Home, badge: "Live", favorite: true, keywords: ["home", "dashboard", "kpi", "activite"] },
      { label: "KPI & analytics", href: "/analytics", icon: BarChart3, favorite: true, keywords: ["reporting", "statistiques", "business intelligence"] },
      { label: "Onboarding", href: "/onboarding", icon: Rocket }
    ]
  },
  {
    label: "Business",
    items: [
      { label: "CRM", href: "/crm", icon: BriefcaseBusiness, favorite: true, keywords: ["pipeline", "prospects", "leads", "clients"] },
      { label: "Clients", href: "/clients", icon: Users, favorite: true, keywords: ["portail", "contacts", "comptes"] },
      { label: "Ventes", href: "/sales", icon: BadgeDollarSign, keywords: ["pipeline", "deals", "revenus"] },
      { label: "Facturation", href: "/facturation", icon: CreditCard, favorite: true, keywords: ["devis", "factures", "paiement", "stripe"] },
      { label: "Comptabilite", href: "/comptabilite", icon: FileSpreadsheet, keywords: ["tva", "depenses", "revenus"] },
      { label: "Banque & Finance", href: "/finance", icon: ChartNoAxesCombined },
      { label: "Previsionnel", href: "/predictive-ai", icon: BrainCircuit }
    ]
  },
  {
    label: "Equipe",
    items: [
      { label: "RH", href: "/rh", icon: WalletCards },
      { label: "Salaires", href: "/rh", icon: CreditCard },
      { label: "Agenda", href: "/agenda", icon: CalendarDays },
      { label: "Projets", href: "/projects", icon: PanelsTopLeft },
      { label: "Collaboration", href: "/notifications", icon: MessagesSquare }
    ]
  },
  {
    label: "Marketing",
    items: [
      { label: "Marketing digital", href: "/marketing-digital", icon: Megaphone },
      { label: "Reseaux sociaux", href: "/reseaux-sociaux", icon: LineChart },
      { label: "Campagnes", href: "/marketing", icon: BarChart3 },
      { label: "Automatisations", href: "/automatisations", icon: Repeat2 },
      { label: "Workflows", href: "/workflows", icon: GitBranch }
    ]
  },
  {
    label: "IA CENTRIX",
    items: [
      { label: "Assistant IA", href: "/ia", icon: Bot, badge: "AI", favorite: true, keywords: ["chatgpt", "assistant", "generation"] },
      { label: "Generation contenu", href: "/ia-business", icon: WandSparkles },
      { label: "Analyse business", href: "/business-intelligence", icon: BrainCircuit },
      { label: "Recommandations IA", href: "/analytics-ia", icon: Sparkles },
      { label: "IA financiere", href: "/finance", icon: ChartNoAxesCombined }
    ]
  },
  {
    label: "Entreprise",
    items: [
      { label: "Creation entreprise", href: "/entreprise", icon: Building2 },
      { label: "Juridique", href: "/juridique", icon: Gavel },
      { label: "Documents", href: "/documents", icon: FolderOpen },
      { label: "Signatures", href: "/documents-cloud", icon: FileSignature },
      { label: "Marketplace", href: "/marketplace", icon: Store },
      { label: "Academy", href: "/centrix-academy", icon: UserRound }
    ]
  },
  {
    label: "Systeme",
    items: [
      { label: "Profil", href: "/profile", icon: UserRound },
      { label: "Parametres", href: "/settings", icon: Settings },
      { label: "Notifications", href: "/notifications", icon: BellRing },
      { label: "API", href: "/api-management", icon: GitBranch },
      { label: "Integrations", href: "/integrations", icon: Repeat2 },
      { label: "Cybersecurite", href: "/security", icon: ShieldCheck },
      { label: "Billing SaaS", href: "/billing", icon: BadgeDollarSign }
    ]
  }
] as const;

export const navigation: readonly NavigationItem[] = navigationGroups.flatMap((group) => group.items);
export const favoriteNavigation = navigation.filter((item) => item.favorite);
