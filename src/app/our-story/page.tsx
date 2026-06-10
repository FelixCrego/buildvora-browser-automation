import type { Metadata } from "next";
import OurStoryInteractive from "./OurStoryInteractive";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Story | Operator-First AI SaaS Company",
  description:
    "Learn how BuildVora became an operator-first AI SaaS company focused on practical CRM software, marketing automation, and execution systems.",
  keywords: ["about BuildVora", "AI SaaS company", "operator-first software", "CRM and automation systems"],
  alternates: { canonical: "/our-story" },
  openGraph: {
    title: "BuildVora Our Story | Practical AI SaaS for Operators",
    description:
      "Mission, operating model, and product philosophy behind BuildVora's execution-first AI SaaS portfolio.",
    url: absoluteUrl("/our-story"),
  },
  twitter: {
    title: "BuildVora Our Story | Practical AI SaaS for Operators",
    description:
      "Mission, operating model, and product philosophy behind BuildVora's execution-first AI SaaS portfolio.",
  },
};

export default function OurStoryPage() {
  return <OurStoryInteractive />;
}
