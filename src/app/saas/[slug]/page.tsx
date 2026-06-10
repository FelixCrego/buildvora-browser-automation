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
    title: `${item.name} | AI SaaS Product`,
    description: `${item.name} by BuildVora: ${item.summary}`.slice(0, 158),
    keywords: [item.name, item.category, "AI SaaS development", "CRM software", "operations software"],
    alternates: { canonical: `/saas/${item.slug}` },
    openGraph: {
      title: `${item.name} | BuildVora Product`,
      description: `${item.name}: ${item.tagline}`,
      url: absoluteUrl(`/saas/${item.slug}`),
    },
    twitter: {
      title: `${item.name} | BuildVora Product`,
      description: `${item.name}: ${item.tagline}`,
    },
  };
}

export default async function SaaSDetailPage({ params }: Props) {
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
            "@type": "SoftwareApplication",
            name: item.name,
            applicationCategory: item.category,
            operatingSystem: "Web",
            description: item.summary,
            url: absoluteUrl(`/saas/${item.slug}`),
            publisher: {
              "@type": "Organization",
              name: "BuildVora",
            },
          }),
        }}
      />
      <section className="mesh-bg border-b border-slate-900">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-18 md:px-10 md:pb-18 md:pt-22">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-blue-300 hover:text-blue-200">
            Back To Portfolio
          </Link>
          <p className="mt-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
            {item.category}
          </p>
          <h1 className="editorial mt-4 text-4xl text-white md:text-6xl">{item.name}</h1>
          <p className="mt-3 text-lg text-blue-300">{item.tagline}</p>
          <p className="mt-5 max-w-3xl text-slate-300">{item.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="neon-pulse blue-glow inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Open Live App
            </a>
            <Link
              href={`/case-studies/${item.slug}`}
              className="inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              Read Case Study
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-6xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Product Screens</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Live product screenshots showing dashboard structure, workflow controls, and operational visibility.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <ScreenshotPanel
              src={item.imageSrc ?? `/screenshots/${item.slug}.png`}
              altBase={item.name}
              label="Main Dashboard View"
              position="object-top"
            />
            <ScreenshotPanel
              src={item.imageSrc ?? `/screenshots/${item.slug}.png`}
              altBase={item.name}
              label="Workflow Focus"
              position="object-center"
            />
            <ScreenshotPanel
              src={item.imageSrc ?? `/screenshots/${item.slug}.png`}
              altBase={item.name}
              label="Execution Detail"
              position="object-bottom"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#04070f] px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-black/50 p-5">
            <h3 className="text-lg font-semibold text-white">How AI Is Leveraged</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {item.aiLeverage.map((point) => (
                <li key={point} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-black/50 p-5">
            <h3 className="text-lg font-semibold text-white">Core Features</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {item.coreFeatures.map((point) => (
                <li key={point} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-black/50 p-5">
            <h3 className="text-lg font-semibold text-white">Business Benefits</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {item.benefits.map((point) => (
                <li key={point} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-6xl rounded-3xl border border-blue-500/25 bg-slate-950/70 p-8">
          <h2 className="editorial text-3xl text-white md:text-4xl">Related Case Study</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            See how {item.name} is implemented in a production workflow, from challenge framing through measurable outcomes.
          </p>
          <Link
            href={`/case-studies/${item.slug}`}
            className="mt-6 inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
          >
            View {item.name} Case Study
          </Link>
        </div>
      </section>
    </main>
  );
}

function ScreenshotPanel({
  src,
  altBase,
  label,
  position,
}: {
  src: string;
  altBase: string;
  label: string;
  position: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
      <div className="relative h-64">
        <Image src={src} alt={`${altBase} screenshot`} fill className={`object-cover ${position}`} />
      </div>
      <p className="border-t border-slate-800 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
    </article>
  );
}
