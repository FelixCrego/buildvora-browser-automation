import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Upcoming Projects | AI SaaS Product Roadmap",
  description:
    "Explore the BuildVora product roadmap with upcoming AI SaaS concepts across CRM, marketing automation, operations software, and investor analytics.",
  keywords: ["AI SaaS roadmap", "upcoming software projects", "product pipeline", "CRM and automation tools"],
  alternates: { canonical: "/upcoming-projects" },
  openGraph: {
    title: "BuildVora Roadmap | Upcoming AI SaaS Projects",
    description:
      "See upcoming AI SaaS concepts and roadmap priorities across operations, growth, and investor analytics.",
    url: absoluteUrl("/upcoming-projects"),
  },
  twitter: {
    title: "BuildVora Roadmap | Upcoming AI SaaS Projects",
    description:
      "See upcoming AI SaaS concepts and roadmap priorities across operations, growth, and investor analytics.",
  },
};

const upcomingProjects = [
  {
    name: "AI Portfolio CFO",
    category: "Finance Intelligence",
    stage: "Concept Validation",
    summary:
      "Financial control layer for founders managing multiple entities, with AI-assisted forecasting and budget variance alerts.",
  },
  {
    name: "Service Dispatch Copilot",
    category: "Field Operations",
    stage: "Design Sprint",
    summary:
      "AI scheduling and dispatch optimization for home service teams that need tighter route utilization and communication.",
  },
  {
    name: "Acquisition Offer Optimizer",
    category: "Real Estate Automation",
    stage: "Prototype",
    summary:
      "AI-driven offer strategy assistant that blends deal data, risk scores, and investor return targets.",
  },
  {
    name: "Outbound Campaign Engine",
    category: "B2B Growth",
    stage: "Planning",
    summary:
      "Multi-channel outbound planning, sequencing, and messaging system with AI-guided iteration loops.",
  },
  {
    name: "Vertical Knowledge Graph",
    category: "Data Infrastructure",
    stage: "Research",
    summary:
      "Shared intelligence layer to improve context transfer and decision quality across the BuildVora SaaS portfolio.",
  },
  {
    name: "AI Compliance Companion",
    category: "Risk and Governance",
    stage: "Backlog Prioritization",
    summary:
      "Policy-aware assistant for teams needing documentation flow, review reminders, and operational compliance tracking.",
  },
];

const suggestionTracks = [
  "AI-first recruiting and talent screening workflows",
  "Insurance and claims operations automation",
  "Construction and contractor scheduling intelligence",
  "Health and wellness business CRM optimization",
  "E-commerce merchandising and offer testing systems",
  "Hospitality operations and guest communication automation",
];

const projectQuotes = [
  {
    name: "Product Advisor",
    text: "A clear upcoming pipeline makes it easier for operators and partners to align early and shape product-market fit faster.",
  },
  {
    name: "Growth Operator",
    text: "The strongest roadmap sections are tied directly to repeat operational pain points and monetizable workflow gaps.",
  },
  {
    name: "Technical Partner",
    text: "Cross-product architecture planning now will compound velocity as the portfolio expands into new verticals.",
  },
];

export default function UpcomingProjectsPage() {
  return (
    <main className="bg-black text-slate-100">
      <section className="mesh-bg border-b border-slate-900">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:px-10 md:pb-20 md:pt-24">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-blue-300 hover:text-blue-200">
            Back To Home
          </Link>
          <p className="mt-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
            Upcoming Projects
          </p>
          <h1 className="editorial mt-4 text-4xl text-white md:text-6xl">BuildVora AI SaaS Product Roadmap</h1>
          <p className="mt-5 max-w-3xl text-slate-300">
            A transparent view of what we may ship next, why it matters, and where we see practical opportunities for
            CRM software, marketing automation, operations tooling, and investor analytics.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-6xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Upcoming Product Concepts</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {upcomingProjects.map((project) => (
              <article key={project.name} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300">{project.category}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{project.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{project.summary}</p>
                <p className="mt-4 inline-flex rounded-full border border-slate-700 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                  Stage: {project.stage}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#04070f] px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-6xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Project Suggestion Tracks</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Priority markets and workflow categories where new BuildVora products can create immediate value.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestionTracks.map((track) => (
              <article key={track} className="rounded-xl border border-slate-800 bg-black/50 p-4">
                <p className="text-sm text-slate-300">{track}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-6xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Quotes On Future Direction</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {projectQuotes.map((quote) => (
              <article key={quote.name} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm leading-relaxed text-slate-300">"{quote.text}"</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-blue-300">{quote.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-6xl rounded-3xl border border-blue-500/25 bg-slate-950/70 p-8">
          <h2 className="editorial text-3xl text-white md:text-4xl">Suggest A Project</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Have a market or workflow challenge we should build for? Share your idea and we'll evaluate fit for the upcoming roadmap.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:felix@felixcrego.com?subject=BuildVora%20Project%20Suggestion"
              className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Submit Suggestion
            </a>
            <Link
              href="/investors"
              className="inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              Investor Page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
