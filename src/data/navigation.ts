import {
  Banknote,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleHelp,
  Contact,
  FileSignature,
  Home,
  Landmark,
  LineChart,
  Mail,
  Megaphone,
  ReceiptText,
  ScrollText,
  Settings,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import type { NavigationGroup, NavigationItem } from "@/types/navigation";

export const navigationGroups: readonly NavigationGroup[] = [
  {
    defaultOpen: true,
    icon: Home,
    label: "Tableau de bord",
    items: [
      { label: "Vue globale", href: "/dashboard", icon: Home, moduleKey: "dashboard", favorite: true, keywords: ["dashboard", "kpi", "activite", "croissance"] }
    ]
  },
  {
    defaultOpen: true,
    icon: Contact,
    label: "CRM",
    items: [
      { label: "Pipeline commercial", href: "/crm", icon: BriefcaseBusiness, moduleKey: "crm", favorite: true, keywords: ["pipeline", "ventes", "opportunites"] },
      { label: "Prospects", href: "/operations/prospects", icon: Target, moduleKey: "prospects", favorite: true },
      { label: "Clients", href: "/clients", icon: Contact, moduleKey: "clients", favorite: true }
    ]
  },
  {
    defaultOpen: true,
    icon: ReceiptText,
    label: "Ventes",
    items: [
      { label: "Devis", href: "/operations/quotes", icon: ScrollText, moduleKey: "quotes" },
      { label: "Factures", href: "/facturation", icon: ReceiptText, moduleKey: "billing", favorite: true },
      { label: "Signature electronique", href: "/integrations", icon: FileSignature, moduleKey: "integrations" }
    ]
  },
  {
    defaultOpen: true,
    icon: Landmark,
    label: "Banque",
    items: [
      { label: "Comptes bancaires", href: "/finance", icon: Landmark, moduleKey: "finance", favorite: true, keywords: ["bridge", "banque", "soldes"] },
      { label: "Tresorerie", href: "/operations/treasury", icon: Banknote, moduleKey: "treasury" }
    ]
  },
  {
    icon: LineChart,
    label: "Reseaux sociaux",
    items: [
      { label: "Publications", href: "/reseaux-sociaux", icon: LineChart, moduleKey: "social", favorite: true },
      { label: "Calendrier editorial", href: "/social-media", icon: CalendarDays, moduleKey: "social" },
      { label: "Statistiques", href: "/marketing", icon: Sparkles, moduleKey: "marketing" }
    ]
  },
  {
    icon: Megaphone,
    label: "Marketing",
    items: [
      { label: "Campagnes", href: "/marketing-digital", icon: Megaphone, moduleKey: "marketing" },
      { label: "Campagnes email", href: "/operations/emailing", icon: Mail, moduleKey: "emailing" },
      { label: "Acquisition prospects", href: "/operations/advertising", icon: Target, moduleKey: "marketing" }
    ]
  },
  {
    icon: Bot,
    label: "IA Business",
    items: [
      { label: "Conseiller IA", href: "/ia", icon: Bot, moduleKey: "ai", badge: "AI", favorite: true },
      { label: "Recommandations", href: "/business-intelligence", icon: Sparkles, moduleKey: "analytics" }
    ]
  },
  {
    icon: Building2,
    label: "Entreprise",
    items: [
      { label: "Parametres entreprise", href: "/workspace-admin", icon: Building2, moduleKey: "settings" },
      { label: "Collaborateurs", href: "/operations/users", icon: Users, moduleKey: "settings" },
      { label: "Parametres", href: "/settings", icon: Settings, moduleKey: "settings" }
    ]
  },
  {
    icon: CircleHelp,
    label: "Support",
    items: [
      { label: "Support", href: "/support", icon: CircleHelp, moduleKey: "support" },
      { label: "Centre d'aide", href: "/operations/faq", icon: CircleHelp, moduleKey: "help-center" }
    ]
  }
] as const;

export const navigation: readonly NavigationItem[] = navigationGroups.flatMap((group) => group.items);
export const favoriteNavigation = navigation.filter((item) => item.favorite);
