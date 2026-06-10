import type { Metadata } from "next";
import CareersInteractive from "./CareersInteractive";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers | AI SaaS Product and Engineering Roles",
  description:
    "Join BuildVora to build practical AI SaaS products across CRM software, marketing automation, investor analytics, and operations tooling.",
  keywords: ["AI SaaS careers", "product engineering jobs", "LLM automation roles", "remote SaaS jobs"],
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "BuildVora Careers | Build AI SaaS That Ships",
    description:
      "Explore open roles in engineering, AI systems, product, growth, and operations at BuildVora.",
    url: absoluteUrl("/careers"),
  },
  twitter: {
    title: "BuildVora Careers | Build AI SaaS That Ships",
    description:
      "Explore open roles in engineering, AI systems, product, growth, and operations at BuildVora.",
  },
};

export default function CareersPage() {
  return <CareersInteractive />;
}
