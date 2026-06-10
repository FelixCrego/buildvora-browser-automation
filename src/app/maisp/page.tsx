import type { Metadata } from "next";
import MAISPInteractive from "./MAISPInteractive";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "MAISP | Managed AI Service Provider Hub",
  description:
    "Interactive BuildVora MAISP hub for business AI implementation, managed maintenance, and operational efficiency optimization.",
  keywords: [
    "managed AI service provider",
    "business AI assessment",
    "AI implementation services",
    "AI maintenance services",
    "AI efficiency consulting",
    "enterprise AI operations",
  ],
  alternates: { canonical: "/maisp" },
  openGraph: {
    title: "BuildVora MAISP | Managed AI Implementation + Efficiency Hub",
    description:
      "Assess readiness, model efficiency upside, and plan a managed AI rollout with BuildVora's interactive MAISP hub.",
    url: absoluteUrl("/maisp"),
  },
  twitter: {
    title: "BuildVora MAISP | Managed AI Implementation + Efficiency Hub",
    description:
      "Assess readiness, model efficiency upside, and plan a managed AI rollout with BuildVora's interactive MAISP hub.",
  },
};

export default function MAISPPage() {
  return <MAISPInteractive />;
}

