import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CENTRIX - SaaS Operating OS",
    short_name: "CENTRIX",
    description: "Plateforme SaaS premium pour piloter CRM, finance, facturation, RH, marketing, IA et operations.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f6f8fb",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ],
    screenshots: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        form_factor: "wide"
      }
    ],
    shortcuts: [
      { name: "Dashboard", short_name: "Dashboard", url: "/dashboard" },
      { name: "CRM", short_name: "CRM", url: "/crm" },
      { name: "Facturation", short_name: "Factures", url: "/facturation" },
      { name: "IA Business", short_name: "IA", url: "/ia" },
      { name: "Recherche", short_name: "Search", url: "/dashboard?search=1" }
    ]
  };
}
