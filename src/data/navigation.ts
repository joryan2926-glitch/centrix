import {
  Activity, BadgeDollarSign, Banknote, BarChart3, BellRing, BookOpen, Bot, BrainCircuit, BriefcaseBusiness,
  Building2, CalendarDays, ChartNoAxesCombined, CheckSquare, CircleHelp, ClipboardCheck, Clock3, Cloud,
  Code2, Contact, CreditCard, FileSignature, FileSpreadsheet, FolderOpen, GanttChart, Gavel, GitBranch,
  GraduationCap, HandCoins, Headphones, History, Home, KeyRound, Landmark, LineChart, LockKeyhole,
  Mail, Megaphone, MessageCircle, MessagesSquare, Network, PackageCheck, PanelsTopLeft, ReceiptText,
  Repeat2, Rocket, Scale, ScrollText, Settings, ShieldCheck, ShoppingBag, Sparkles, Store, Target,
  UserCog, UserRound, Users, UsersRound, WandSparkles, WalletCards, Workflow
} from "lucide-react";
import type { NavigationGroup, NavigationItem } from "@/types/navigation";

export const navigationGroups: readonly NavigationGroup[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Vue globale", href: "/dashboard", icon: Home, badge: "Live", favorite: true, keywords: ["dashboard", "kpi", "activite"] },
      { label: "KPI & Analytics", href: "/analytics", icon: BarChart3, favorite: true },
      { label: "Activites recentes", href: "/operations/activities", icon: Activity },
      { label: "Alertes", href: "/operations/alerts", icon: BellRing },
      { label: "Centre de notifications", href: "/notifications", icon: MessagesSquare }
    ]
  },
  {
    label: "Business",
    items: [
      { label: "CRM", href: "/crm", icon: BriefcaseBusiness, favorite: true },
      { label: "Prospects", href: "/operations/prospects", icon: Target },
      { label: "Clients", href: "/clients", icon: Contact, favorite: true },
      { label: "Ventes", href: "/sales", icon: BadgeDollarSign },
      { label: "Devis", href: "/operations/quotes", icon: ScrollText },
      { label: "Facturation", href: "/facturation", icon: ReceiptText, favorite: true },
      { label: "Comptabilite", href: "/comptabilite", icon: FileSpreadsheet },
      { label: "Banque", href: "/finance", icon: Landmark },
      { label: "Tresorerie", href: "/operations/treasury", icon: Banknote },
      { label: "Previsionnel", href: "/predictive-ai", icon: ChartNoAxesCombined },
      { label: "Contrats", href: "/operations/contracts", icon: FileSignature },
      { label: "Documents", href: "/documents", icon: FolderOpen }
    ]
  },
  {
    label: "Entreprise",
    items: [
      { label: "Creation d'entreprise", href: "/entreprise", icon: Building2 },
      { label: "Business plan", href: "/operations/business-plan", icon: Rocket },
      { label: "Financement", href: "/operations/funding", icon: HandCoins },
      { label: "Juridique", href: "/juridique", icon: Gavel },
      { label: "Conformite", href: "/operations/compliance", icon: ClipboardCheck },
      { label: "Formalites administratives", href: "/operations/formalities", icon: ScrollText },
      { label: "Registre des documents", href: "/documents-cloud", icon: Cloud }
    ]
  },
  {
    label: "Equipe",
    items: [
      { label: "RH", href: "/rh", icon: UsersRound },
      { label: "Recrutement", href: "/operations/recruitment", icon: UserRound },
      { label: "Salaires", href: "/operations/salaries", icon: WalletCards },
      { label: "Conges", href: "/operations/leave", icon: CalendarDays },
      { label: "Notes de frais", href: "/operations/expenses", icon: CreditCard },
      { label: "Agenda", href: "/agenda", icon: CalendarDays },
      { label: "Gestion du temps", href: "/operations/time", icon: Clock3 },
      { label: "Gestion de projets", href: "/projects", icon: PanelsTopLeft },
      { label: "Taches", href: "/operations/tasks", icon: CheckSquare },
      { label: "Kanban", href: "/tasks", icon: PanelsTopLeft },
      { label: "Gantt", href: "/operations/gantt", icon: GanttChart },
      { label: "Collaboration", href: "/operations/collaboration", icon: Network },
      { label: "Messagerie interne", href: "/operations/messaging", icon: MessageCircle }
    ]
  },
  {
    label: "Marketing",
    items: [
      { label: "Marketing digital", href: "/marketing-digital", icon: Megaphone },
      { label: "Reseaux sociaux", href: "/reseaux-sociaux", icon: LineChart },
      { label: "Emailing", href: "/operations/emailing", icon: Mail },
      { label: "SMS Marketing", href: "/operations/sms", icon: MessageCircle },
      { label: "Campagnes publicitaires", href: "/operations/advertising", icon: Target },
      { label: "Automatisations", href: "/automatisations", icon: Repeat2 },
      { label: "Workflows", href: "/workflows", icon: Workflow }
    ]
  },
  {
    label: "IA CENTRIX",
    items: [
      { label: "Assistant IA", href: "/ia", icon: Bot, badge: "AI", favorite: true },
      { label: "Generation de contenu", href: "/operations/content-generation", icon: WandSparkles },
      { label: "Analyse business", href: "/business-intelligence", icon: BrainCircuit },
      { label: "Analyse financiere", href: "/operations/financial-analysis", icon: ChartNoAxesCombined },
      { label: "Recommandations IA", href: "/analytics-ia", icon: Sparkles },
      { label: "Generateur de documents", href: "/operations/document-generator", icon: FileSignature },
      { label: "Chat avec les donnees", href: "/operations/data-chat", icon: MessagesSquare }
    ]
  },
  {
    label: "Support Client",
    items: [
      { label: "Tickets", href: "/support", icon: Headphones },
      { label: "SAV", href: "/operations/sav", icon: PackageCheck },
      { label: "Chat", href: "/client-portal", icon: MessageCircle },
      { label: "Centre d'aide", href: "/support", icon: CircleHelp },
      { label: "FAQ", href: "/operations/faq", icon: BookOpen }
    ]
  },
  {
    label: "Ecosysteme",
    items: [
      { label: "Marketplace", href: "/marketplace", icon: Store },
      { label: "Prestataires", href: "/providers", icon: ShoppingBag },
      { label: "Experts", href: "/operations/experts", icon: GraduationCap },
      { label: "Formateurs", href: "/operations/trainers", icon: UserRound },
      { label: "Consultants", href: "/operations/consultants", icon: BriefcaseBusiness },
      { label: "Services partenaires", href: "/services", icon: HandCoins },
      { label: "Academy", href: "/centrix-academy", icon: GraduationCap },
      { label: "Formations", href: "/formations", icon: BookOpen },
      { label: "Bibliotheque ressources", href: "/operations/resources", icon: FolderOpen }
    ]
  },
  {
    label: "Cybersecurite",
    items: [
      { label: "Centre de securite", href: "/security", icon: ShieldCheck },
      { label: "Connexions", href: "/operations/connections", icon: KeyRound },
      { label: "Journal d'audit", href: "/operations/audit", icon: History },
      { label: "Gestion des acces", href: "/operations/access", icon: LockKeyhole },
      { label: "Double authentification", href: "/cybersecurity", icon: ShieldCheck }
    ]
  },
  {
    label: "Administration",
    items: [
      { label: "Parametres", href: "/settings", icon: Settings },
      { label: "Utilisateurs", href: "/operations/users", icon: Users },
      { label: "Roles", href: "/operations/roles", icon: UserCog },
      { label: "Permissions", href: "/operations/permissions", icon: Scale },
      { label: "Facturation abonnement", href: "/billing", icon: BadgeDollarSign },
      { label: "Integrations", href: "/integrations", icon: GitBranch },
      { label: "API", href: "/api-management", icon: Code2 }
    ]
  }
] as const;

export const navigation: readonly NavigationItem[] = navigationGroups.flatMap((group) => group.items);
export const favoriteNavigation = navigation.filter((item) => item.favorite);
