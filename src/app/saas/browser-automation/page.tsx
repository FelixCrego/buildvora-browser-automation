import type { Metadata } from "next";
import BrowserAutomationInteractive from "./BrowserAutomationInteractive";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "BuildVora Browser Automation",
  description:
    "Clean, controlled browser automation for legal, healthcare, finance, and other teams with high-value operational work.",
  keywords: [
    "browser automation",
    "workflow automation for law firms",
    "healthcare operations automation",
    "financial operations automation",
    "LinkedIn automation",
    "Gmail automation",
    "AI automation platform",
  ],
  alternates: { canonical: "/saas/browser-automation" },
  openGraph: {
    title: "BuildVora Browser Automation",
    description:
      "Clean, controlled browser automation for high-value teams.",
    url: absoluteUrl("/saas/browser-automation"),
  },
  twitter: {
    title: "BuildVora Browser Automation",
    description:
      "Clean, controlled browser automation for high-value teams.",
  },
};

export default function BrowserAutomationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "BuildVora Browser Automation",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Clean, controlled browser automation for legal, healthcare, finance, and operational teams.",
            url: absoluteUrl("/saas/browser-automation"),
            publisher: {
              "@type": "Organization",
              name: "BuildVora",
            },
          }),
        }}
      />
      <BrowserAutomationInteractive />
    </>
  );
}
