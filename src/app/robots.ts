import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://app-centrix.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/register",
          "/forgot-password",
          "/mentions-legales",
          "/conditions-utilisation",
          "/conditions-vente",
          "/confidentialite",
          "/cookies"
        ],
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard",
          "/crm",
          "/clients",
          "/facturation",
          "/comptabilite",
          "/finance",
          "/projects",
          "/tasks",
          "/agenda",
          "/documents",
          "/rh",
          "/marketing",
          "/reseaux-sociaux",
          "/workflows",
          "/support",
          "/marketplace",
          "/centrix-academy",
          "/business-intelligence",
          "/notifications",
          "/settings",
          "/integrations",
          "/security",
          "/billing",
          "/client-portal",
          "/entreprise",
          "/juridique",
          "/profile",
          "/upgrade",
          "/onboarding"
        ]
      }
    ],
    sitemap: new URL("/sitemap.xml", appUrl).toString()
  };
}
