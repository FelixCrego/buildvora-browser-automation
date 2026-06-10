import type { Metadata } from "next";
import PlatformInteractive from "./PlatformInteractive";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Platform | AI SaaS Development Architecture",
  description:
    "Learn how BuildVora's AI SaaS development platform connects CRM software, marketing automation, SEO workflows, and operations software.",
  keywords: ["AI SaaS development platform", "software architecture", "operations software", "workflow automation"],
  alternates: { canonical: "/platform" },
  openGraph: {
    title: "BuildVora Platform | Operator-First AI SaaS Architecture",
    description:
      "See the architecture, controls, and governance model behind BuildVora's production AI SaaS portfolio.",
    url: absoluteUrl("/platform"),
  },
  twitter: {
    title: "BuildVora Platform | Operator-First AI SaaS Architecture",
    description:
      "See the architecture, controls, and governance model behind BuildVora's production AI SaaS portfolio.",
  },
};

export default function PlatformPage() {
  return <PlatformInteractive />;
}
