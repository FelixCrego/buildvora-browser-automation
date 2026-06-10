import type { Metadata } from "next";
import InvestorsInteractive from "./InvestorsInteractive";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Investors | AI SaaS Portfolio Analytics",
  description:
    "Explore BuildVora investor analytics with scenario modeling, portfolio risk controls, sensitivity heatmaps, and capital allocation planning.",
  keywords: ["investor analytics", "AI SaaS portfolio", "capital allocation model", "risk management", "scenario analysis"],
  alternates: { canonical: "/investors" },
  openGraph: {
    title: "BuildVora Investors | Portfolio Analytics Workspace",
    description:
      "Investor-grade workspace for scenario planning, downside modeling, and portfolio construction across BuildVora products.",
    url: absoluteUrl("/investors"),
  },
  twitter: {
    title: "BuildVora Investors | Portfolio Analytics Workspace",
    description:
      "Investor-grade workspace for scenario planning, downside modeling, and portfolio construction across BuildVora products.",
  },
};

export default function InvestorsPage() {
  return <InvestorsInteractive />;
}
