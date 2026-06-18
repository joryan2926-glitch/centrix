import {
  Activity,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  BellRing,
  BookOpen,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  CheckSquare,
  CircleHelp,
  ClipboardCheck,
  Cloud,
  Code2,
  Contact,
  CreditCard,
  FileSignature,
  FileSpreadsheet,
  FolderOpen,
  GanttChart,
  Gavel,
  GitBranch,
  GraduationCap,
  HandCoins,
  Headphones,
  Home,
  KeyRound,
  Landmark,
  LineChart,
  LockKeyhole,
  Mail,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Network,
  PackageCheck,
  PanelsTopLeft,
  ReceiptText,
  Repeat2,
  Rocket,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  UserCog,
  UserRound,
  Users,
  UsersRound,
  WalletCards,
  Workflow
} from "lucide-react";
import type { NavigationGroup, NavigationItem } from "@/types/navigation";

export const navigationGroups: readonly NavigationGroup[] = [
  {
    defaultOpen: true,
    icon: Home,
    label: "Tableau de bord",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home, moduleKey: "dashboard", favorite: true, keywords: ["dashboard", "kpi", "activite"] },
      { label: "Activite recente", href: "/operations/activities", icon: Activity, moduleKey: "dashboard" },
      { label: "Notifications", href: "/notifications", icon: BellRing, moduleKey: "notifications" }
    ]
  },
  {
    defaultOpen: true,
    icon: Contact,
    label: "Relation client",
    items: [
      { label: "CRM", href: "/crm", icon: BriefcaseBusiness, moduleKey: "crm", favorite: true },
      { label: "Clients", href: "/clients", icon: Contact, moduleKey: "clients", favorite: true },
      { label: "Prospects", href: "/operations/prospects", icon: Target, moduleKey: "prospects" },
      { label: "Support client", href: "/support", icon: Headphones, moduleKey: "support" },
      { label: "Portail client", href: "/client-portal", icon: MessageCircle, moduleKey: "clients" },
      { label: "SAV", href: "/operations/sav", icon: PackageCheck, moduleKey: "support" },
      { label: "Centre d'aide", href: "/operations/faq", icon: CircleHelp, moduleKey: "help-center" }
    ]
  },
  {
    defaultOpen: true,
    icon: BadgeDollarSign,
    label: "Finance",
    items: [
      { label: "Devis", href: "/operations/quotes", icon: ScrollText, moduleKey: "quotes" },
      { label: "Factures", href: "/facturation", icon: ReceiptText, moduleKey: "billing", favorite: true },
      { label: "Paiements", href: "/billing", icon: CreditCard, moduleKey: "payments" },
      { label: "Comptabilite", href: "/comptabilite", icon: FileSpreadsheet, moduleKey: "finance" },
      { label: "Banque & Tresorerie", href: "/finance", icon: Landmark, moduleKey: "finance" },
      { label: "Tresorerie", href: "/operations/treasury", icon: Banknote, moduleKey: "treasury" },
      { label: "Financement", href: "/operations/funding", icon: HandCoins, moduleKey: "legal" },
      { label: "Previsionnel", href: "/predictive-ai", icon: ChartNoAxesCombined, moduleKey: "analytics" }
    ]
  },
  {
    icon: PanelsTopLeft,
    label: "Operations",
    items: [
      { label: "Projets", href: "/projects", icon: PanelsTopLeft, moduleKey: "projects" },
      { label: "Taches", href: "/tasks", icon: CheckSquare, moduleKey: "tasks" },
      { label: "Gantt", href: "/operations/gantt", icon: GanttChart, moduleKey: "projects" },
      { label: "Agenda", href: "/agenda", icon: CalendarDays, moduleKey: "agenda" },
      { label: "Reservations", href: "/reservations", icon: CalendarDays, moduleKey: "agenda" },
      { label: "Documents & Cloud", href: "/documents", icon: Cloud, moduleKey: "documents" },
      { label: "Collaboration equipe", href: "/operations/collaboration", icon: Network, moduleKey: "projects" },
      { label: "Messagerie interne", href: "/operations/messaging", icon: MessagesSquare, moduleKey: "projects" }
    ]
  },
  {
    icon: Megaphone,
    label: "Marketing",
    items: [
      { label: "Marketing digital", href: "/marketing-digital", icon: Megaphone, moduleKey: "marketing" },
      { label: "Campagnes email", href: "/operations/emailing", icon: Mail, moduleKey: "emailing" },
      { label: "Reseaux sociaux", href: "/reseaux-sociaux", icon: LineChart, moduleKey: "social" },
      { label: "Campagnes publicitaires", href: "/operations/advertising", icon: Target, moduleKey: "marketing" },
      { label: "Automatisations", href: "/automatisations", icon: Repeat2, moduleKey: "automations" },
      { label: "Workflows", href: "/workflows", icon: Workflow, moduleKey: "workflows" }
    ]
  },
  {
    icon: Bot,
    label: "Intelligence artificielle",
    items: [
      { label: "Assistant IA", href: "/ia", icon: Bot, moduleKey: "ai", badge: "AI", favorite: true },
      { label: "Business Intelligence", href: "/business-intelligence", icon: BrainCircuit, moduleKey: "analytics" },
      { label: "Analytics & KPI", href: "/analytics", icon: BarChart3, moduleKey: "analytics", favorite: true },
      { label: "Rapports", href: "/analytics-ia", icon: Sparkles, moduleKey: "reports" },
      { label: "Analyse financiere", href: "/operations/financial-analysis", icon: ChartNoAxesCombined, moduleKey: "finance" },
      { label: "Generation de contenu", href: "/operations/content-generation", icon: Sparkles, moduleKey: "ai" },
      { label: "Chat avec les donnees", href: "/operations/data-chat", icon: MessagesSquare, moduleKey: "ai" }
    ]
  },
  {
    icon: UsersRound,
    label: "Ressources humaines",
    items: [
      { label: "Employes", href: "/hr", icon: UsersRound, moduleKey: "hr" },
      { label: "RH", href: "/rh", icon: Users, moduleKey: "hr" },
      { label: "Recrutement", href: "/operations/recruitment", icon: UserRound, moduleKey: "recruiting" },
      { label: "Paie & Salaires", href: "/operations/salaries", icon: WalletCards, moduleKey: "hr" },
      { label: "Conges", href: "/operations/leave", icon: CalendarDays, moduleKey: "hr" },
      { label: "Notes de frais", href: "/operations/expenses", icon: CreditCard, moduleKey: "hr" }
    ]
  },
  {
    icon: Store,
    label: "Reseau & services",
    items: [
      { label: "Communaute", href: "/community", icon: MessagesSquare, moduleKey: "academy" },
      { label: "Marketplace", href: "/marketplace", icon: Store, moduleKey: "marketplace" },
      { label: "Partenaires", href: "/services", icon: HandCoins, moduleKey: "marketplace" },
      { label: "Prestataires", href: "/providers", icon: ShoppingBag, moduleKey: "marketplace" },
      { label: "Experts", href: "/operations/experts", icon: GraduationCap, moduleKey: "marketplace" },
      { label: "Reseau professionnel", href: "/operations/consultants", icon: BriefcaseBusiness, moduleKey: "marketplace" }
    ]
  },
  {
    icon: GraduationCap,
    label: "CENTRIX Academy",
    items: [
      { label: "Formations", href: "/formations", icon: GraduationCap, moduleKey: "academy" },
      { label: "Guides", href: "/operations/resources", icon: BookOpen, moduleKey: "academy" },
      { label: "Tutoriels", href: "/centrix-academy", icon: BookOpen, moduleKey: "academy" },
      { label: "Formateurs", href: "/operations/trainers", icon: UserRound, moduleKey: "academy" }
    ]
  },
  {
    icon: Settings,
    label: "Parametres",
    items: [
      { label: "Portail entreprise", href: "/workspace-admin", icon: ShieldCheck, moduleKey: "settings" },
      { label: "Parametres", href: "/settings", icon: Settings, moduleKey: "settings" },
      { label: "Entreprise", href: "/entreprise", icon: Building2, moduleKey: "legal" },
      { label: "Juridique", href: "/juridique", icon: Gavel, moduleKey: "legal" },
      { label: "Contrats", href: "/operations/contracts", icon: FileSignature, moduleKey: "legal" },
      { label: "Documents legaux", href: "/documents-cloud", icon: FolderOpen, moduleKey: "documents" },
      { label: "Utilisateurs", href: "/operations/users", icon: Users, moduleKey: "settings" },
      { label: "Roles", href: "/operations/roles", icon: UserCog, moduleKey: "settings" },
      { label: "Permissions", href: "/permissions", icon: Scale, moduleKey: "settings" },
      { label: "Abonnement", href: "/subscriptions", icon: BadgeDollarSign, moduleKey: "billing" },
      { label: "API & Integrations", href: "/integrations", icon: GitBranch, moduleKey: "integrations" },
      { label: "API", href: "/api-management", icon: Code2, moduleKey: "api" },
      { label: "Cybersecurite", href: "/security", icon: ShieldCheck, moduleKey: "security" },
      { label: "Connexions", href: "/operations/connections", icon: KeyRound, moduleKey: "security" },
      { label: "Journal d'audit", href: "/operations/audit", icon: ClipboardCheck, moduleKey: "security" },
      { label: "Gestion des acces", href: "/operations/access", icon: LockKeyhole, moduleKey: "security" }
    ]
  },
  {
    enterpriseOnly: true,
    icon: Building2,
    label: "Enterprise",
    items: [
      { label: "Portail CENTRIX", href: "/admin", icon: ShieldCheck, moduleKey: "administration" },
      { label: "Multi-entreprises", href: "/multi-entreprises", icon: Building2, moduleKey: "multi-company" },
      { label: "Multi-filiales", href: "/entreprises", icon: Building2, moduleKey: "multi-company" },
      { label: "Franchises", href: "/franchises", icon: Network, moduleKey: "franchises" },
      { label: "White Label", href: "/platform-settings", icon: Rocket, moduleKey: "white-label" }
    ]
  }
] as const;

export const navigation: readonly NavigationItem[] = navigationGroups.flatMap((group) => group.items);
export const favoriteNavigation = navigation.filter((item) => item.favorite);
