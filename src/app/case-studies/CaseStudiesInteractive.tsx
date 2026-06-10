"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { SaaSItem } from "@/lib/saasData";

type Props = {
  items: SaaSItem[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function CaseStudiesInteractive({ items }: Props) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug ?? "");

  const filteredItems = useMemo(
    () =>
      activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory),
    [activeCategory, items],
  );

  const activeItem = useMemo(
    () => filteredItems.find((item) => item.slug === activeSlug) ?? filteredItems[0],
    [filteredItems, activeSlug],
  );

  const totalOutcomes = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.caseStudy.outcomes.length, 0),
    [filteredItems],
  );

  return (
    <main className="bg-black text-slate-100">
      <section className="mesh-bg relative isolate overflow-hidden border-b border-slate-900 px-6 pb-14 pt-20 md:px-10 md:pb-18 md:pt-24">
        <div className="pointer-events-none absolute -right-24 top-6 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <p className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
            Case Studies
          </p>
          <h1 className="editorial mt-5 text-4xl text-white md:text-6xl">Execution Narratives That Prove The System</h1>
          <p className="mt-5 max-w-3xl text-slate-300">
            Explore AI SaaS implementation stories across CRM software, marketing automation, SEO platform systems, and
            operations software with direct visibility into practical outcomes.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Studies Available</p>
              <p className="mt-2 text-lg font-semibold text-white">{filteredItems.length}</p>
            </div>
            <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Outcome Signals</p>
              <p className="mt-2 text-lg font-semibold text-white">{totalOutcomes}</p>
            </div>
            <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Vertical Coverage</p>
              <p className="mt-2 text-lg font-semibold text-white">{categories.length - 1}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Case Study Navigator</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
                  activeCategory === category
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-black/35 text-slate-300 hover:border-blue-500/55 hover:text-blue-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-slate-800 bg-black/45 p-4">
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setActiveSlug(item.slug)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      activeItem?.slug === item.slug
                        ? "border-blue-500/60 bg-blue-500/12"
                        : "border-slate-800 bg-slate-950/65 hover:border-blue-500/45"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300">{item.category}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-300">{item.caseStudy.challenge}</p>
                  </button>
                ))}
              </div>
            </div>

            {activeItem ? (
              <motion.article
                key={activeItem.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-blue-500/30 bg-slate-950/72 p-6 shadow-[0_0_55px_rgba(59,130,246,0.16)]"
              >
                <div className="relative h-52 overflow-hidden rounded-xl border border-slate-800">
                  <Image
                    src={`/screenshots/${activeItem.slug}.png`}
                    alt={`${activeItem.name} case study preview`}
                    fill
                    className="object-cover object-top"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-blue-400/45 bg-blue-500/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-blue-200">
                    Spotlight
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-white">{activeItem.name}</h3>
                <p className="mt-3 text-sm text-slate-300">{activeItem.caseStudy.challenge}</p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-800 bg-black/45 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300">Implementation Steps</p>
                    <p className="mt-2 text-sm text-slate-200">{activeItem.caseStudy.implementation.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-black/45 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300">Outcome Signals</p>
                    <p className="mt-2 text-sm text-slate-200">{activeItem.caseStudy.outcomes.length}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-800 bg-black/45 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Top Outcomes</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                    {activeItem.caseStudy.outcomes.slice(0, 2).map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/case-studies/${activeItem.slug}`}
                    className="inline-flex rounded-full border border-blue-500/50 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/15"
                  >
                    Open Full Case Study
                  </Link>
                  <Link
                    href={`/saas/${activeItem.slug}`}
                    className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/45 hover:text-blue-200"
                  >
                    View Product
                  </Link>
                </div>
              </motion.article>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">All Case Studies</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {filteredItems.map((item, idx) => (
              <motion.article
                key={item.slug}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.16 }}
                variants={fadeUp}
                transition={{ duration: 0.35, delay: idx * 0.03 }}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300">{item.category}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{item.name}</h3>
                <p className="mt-3 text-sm text-slate-300">{item.caseStudy.challenge}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/case-studies/${item.slug}`}
                    className="inline-flex rounded-full border border-blue-500/50 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/15"
                  >
                    Read Case Study
                  </Link>
                  <Link
                    href={`/saas/${item.slug}`}
                    className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/45 hover:text-blue-200"
                  >
                    View Product
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
