import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSaasBySlug, saasItems } from "@/lib/saasData";
import { absoluteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return saasItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getSaasBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.name} Case Study | AI SaaS Results`,
    description: `Case study for ${item.name}: challenge, implementation approach, AI leverage, and measurable operational outcomes.`,
    keywords: [item.name, "case study", "AI SaaS implementation", "marketing automation", "CRM software"],
    alternates: { canonical: `/case-studies/${item.slug}` },
    openGraph: {
      title: `${item.name} Case Study | BuildVora`,
      description: `How ${item.name} was deployed with operator-first AI workflows and measurable execution outcomes.`,
      url: absoluteUrl(`/case-studies/${item.slug}`),
    },
    twitter: {
      title: `${item.name} Case Study | BuildVora`,
      description: `How ${item.name} was deployed with operator-first AI workflows and measurable execution outcomes.`,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const item = getSaasBySlug(slug);
  if (!item) notFound();

  return (
    <main className="bg-black text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${item.name} Case Study`,
            description: `Case study for ${item.name}: challenge, implementation approach, and outcomes.`,
            author: {
              "@type": "Organization",
              name: "BuildVora",
            },
            publisher: {
              "@type": "Organization",
              name: "BuildVora",
            },
            mainEntityOfPage: absoluteUrl(`/case-studies/${item.slug}`),
          }),
        }}
      />
      <section className="mesh-bg border-b border-slate-900">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-18 md:px-10 md:pb-18 md:pt-22">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-blue-300 hover:text-blue-200">
            Back To Portfolio
          </Link>
          <p className="mt-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
            Case Study
          </p>
          <h1 className="editorial mt-4 text-4xl text-white md:text-6xl">{item.name}</h1>
          <p className="mt-3 text-lg text-slate-300">{item.caseStudy.companyType}</p>
          <p className="mt-5 max-w-3xl text-slate-400">
            A client-focused case study that outlines deployment strategy, AI usage, and business impact.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Open Live App
            </a>
            <Link
              href={`/saas/${item.slug}`}
              className="inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              View Product Details
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-6">
            <h2 className="text-xl font-semibold text-white">Challenge</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.caseStudy.challenge}</p>

            <h3 className="mt-7 text-lg font-semibold text-white">Implementation</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              {item.caseStudy.implementation.map((step) => (
                <li key={step} className="rounded-lg border border-slate-800 bg-black/40 p-3">
                  {step}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-6">
            <h2 className="text-xl font-semibold text-white">Outcomes</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {item.caseStudy.outcomes.map((outcome) => (
                <li key={outcome} className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                  {outcome}
                </li>
              ))}
            </ul>
            <h3 className="mt-7 text-lg font-semibold text-white">AI Leverage Highlights</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              {item.aiLeverage.map((point) => (
                <li key={point} className="rounded-lg border border-slate-800 bg-black/40 p-3">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#04070f] px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-6xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Screenshot Walkthrough</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="relative h-72">
                <Image
                  src={item.imageSrc ?? `/screenshots/${item.slug}.png`}
                  alt={`${item.name} interface`}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <p className="border-t border-slate-800 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                Control Layer
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="relative h-72">
                <Image
                  src={item.imageSrc ?? `/screenshots/${item.slug}.png`}
                  alt={`${item.name} workflow`}
                  fill
                  className="object-cover object-center"
                />
              </div>
              <p className="border-t border-slate-800 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                Workflow Layer
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-6xl rounded-3xl border border-blue-500/25 bg-slate-950/70 p-8">
          <h2 className="editorial text-3xl text-white md:text-4xl">Explore The Full SaaS Suite</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            BuildVora is not one product. It is a connected operating layer of specialized SaaS systems designed around real execution environments.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Back To Portfolio
            </Link>
            <Link
              href={`/saas/${item.slug}`}
              className="inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              Product Page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
