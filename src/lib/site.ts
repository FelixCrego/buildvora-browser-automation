export const siteConfig = {
  name: "BuildVora",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://buildvora.ai",
  ogImage: "/logos/buildvora-logo-transparent.png",
  description:
    "BuildVora is an operator-first AI SaaS development portfolio spanning CRM software, marketing automation, SEO platforms, investor analytics, and operations software.",
};

export function absoluteUrl(path: string = ""): string {
  if (!path) return siteConfig.url;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

