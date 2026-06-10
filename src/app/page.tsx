import type { Metadata } from "next";
import HomeInteractive from "./HomeInteractive";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI SaaS Development for CRM, SEO and Operations",
  description:
    "BuildVora builds practical AI SaaS systems for CRM software, marketing automation, SEO platform workflows, investor analytics, and operations software.",
  keywords: [
    "AI SaaS development",
    "CRM software",
    "marketing automation",
    "SEO platform",
    "operations software",
    "investor analytics",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "BuildVora | AI SaaS Development for Operators",
    description:
      "Operator-first AI SaaS portfolio covering CRM, SEO, marketing automation, and execution software.",
    url: absoluteUrl("/"),
  },
  twitter: {
    title: "BuildVora | AI SaaS Development for Operators",
    description:
      "Operator-first AI SaaS portfolio covering CRM, SEO, marketing automation, and execution software.",
  },
};

export default function HomePage() {
  return <HomeInteractive />;
}

