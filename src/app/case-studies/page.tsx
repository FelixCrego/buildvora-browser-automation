import type { Metadata } from "next";
import { saasItems } from "@/lib/saasData";
import CaseStudiesInteractive from "./CaseStudiesInteractive";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Case Studies | AI SaaS Implementation Results",
  description:
    "Read BuildVora case studies covering CRM software, marketing automation, SEO platform execution, and measurable operations outcomes.",
  keywords: ["AI SaaS case studies", "CRM implementation", "marketing automation results", "operations software outcomes"],
  alternates: { canonical: "/case-studies" },
  openGraph: {
    title: "BuildVora Case Studies | Real-World AI SaaS Execution",
    description:
      "Detailed implementation stories showing how BuildVora products improve execution quality and decision speed.",
    url: absoluteUrl("/case-studies"),
  },
  twitter: {
    title: "BuildVora Case Studies | Real-World AI SaaS Execution",
    description:
      "Detailed implementation stories showing how BuildVora products improve execution quality and decision speed.",
  },
};

export default function CaseStudiesIndexPage() {
  return <CaseStudiesInteractive items={saasItems} />;
}
