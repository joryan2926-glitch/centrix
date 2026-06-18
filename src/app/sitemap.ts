import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://app-centrix.fr";

const publicRoutes = [
  "",
  "/login",
  "/register",
  "/forgot-password",
  "/mentions-legales",
  "/conditions-utilisation",
  "/conditions-vente",
  "/confidentialite",
  "/cookies"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    changeFrequency: route === "" ? "weekly" : "monthly",
    lastModified: now,
    priority: route === "" ? 1 : 0.6,
    url: new URL(route || "/", appUrl).toString()
  }));
}
