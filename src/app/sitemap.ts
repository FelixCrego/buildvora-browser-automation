import type { MetadataRoute } from "next";
import { saasItems } from "@/lib/saasData";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/products",
    "/platform",
    "/maisp",
    "/case-studies",
    "/investors",
    "/careers",
    "/our-story",
    "/upcoming-projects",
  ];

  const staticEntries = staticRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const saasEntries = saasItems.map((item) => ({
    url: `${siteConfig.url}/saas/${item.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const caseStudyEntries = saasItems.map((item) => ({
    url: `${siteConfig.url}/case-studies/${item.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...saasEntries, ...caseStudyEntries];
}
