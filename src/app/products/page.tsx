import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { saasItems } from "@/lib/saasData";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products | CRM, SEO, Marketing and Ops Software",
  description:
    "Explore BuildVora AI SaaS products spanning CRM software, marketing automation, SEO platform workflows, investor analytics, and operations software.",
  keywords: ["AI SaaS products", "CRM software", "marketing automation", "SEO platform", "operations software"],
  alternates: { canonical: "/products" },
  openGraph: {
    title: "BuildVora Products | Operator-First AI SaaS Portfolio",
    description:
      "Browse practical AI SaaS products for CRM, growth, SEO, underwriting, and execution operations.",
    url: absoluteUrl("/products"),
  },
  twitter: {
    title: "BuildVora Products | Operator-First AI SaaS Portfolio",
    description:
      "Browse practical AI SaaS products for CRM, growth, SEO, underwriting, and execution operations.",
  },
};

export default function ProductsPage() {
  return (
    <main className="bg-black text-slate-100">
      <section className="mesh-bg border-b border-slate-900 px-6 pb-14 pt-20 md:px-10 md:pb-18 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
            Product Portfolio
          </p>
          <h1 className="editorial mt-5 text-4xl text-white md:text-6xl">AI SaaS Products Built For Daily Execution</h1>
          <p className="mt-5 max-w-3xl text-slate-300">
            BuildVora ships practical software for teams that need better workflows, cleaner signals, and faster decisions
            across sales, growth, marketing, and operations.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {saasItems.map((item) => (
            <article
              key={item.slug}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 transition hover:border-blue-500/45"
            >
              <div className="relative h-44 overflow-hidden border-b border-slate-800">
                <Image
                  src={item.imageSrc ?? `/screenshots/${item.slug}.png`}
                  alt={`${item.name} screenshot`}
                  fill
                  className="object-cover object-top"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-blue-400/40 bg-blue-500/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-200">
                  {item.category}
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-white">{item.name}</h2>
                <p className="mt-2 text-sm text-blue-300">{item.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/saas/${item.slug}`}
                    className="inline-flex rounded-full border border-blue-500/50 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/15"
                  >
                    Product Page
                  </Link>
                  <Link
                    href={`/case-studies/${item.slug}`}
                    className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/45 hover:text-blue-200"
                  >
                    Case Study
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
