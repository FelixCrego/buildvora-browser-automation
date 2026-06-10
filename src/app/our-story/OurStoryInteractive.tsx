"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const principles = [
  {
    title: "Mission",
    text: "Build operator-grade SaaS systems that connect acquisition, execution, and revenue operations into one measurable growth engine.",
  },
  {
    title: "Vision",
    text: "Become the most trusted AI-native software ecosystem for growth-focused teams that need practical outcomes, not tool sprawl.",
  },
  {
    title: "Operating Belief",
    text: "Marketing, software, SEO, AI workflows, and CRM operations perform best when engineered as one integrated system.",
  },
];

const evolution = [
  {
    phase: "Phase 1",
    title: "Operator Groundwork",
    text: "Started with delivery pressure from real growth teams and mapped where execution broke between strategy and operations.",
  },
  {
    phase: "Phase 2",
    title: "Systemization",
    text: "Built repeatable CRM, SEO, and workflow software patterns designed for day-to-day team ownership.",
  },
  {
    phase: "Phase 3",
    title: "Portfolio Expansion",
    text: "Launched multiple focused SaaS products under one architecture and execution standard.",
  },
  {
    phase: "Phase 4",
    title: "AI Execution Layer",
    text: "Integrated AI as a practical decision layer for scoring, prioritization, and operational acceleration.",
  },
];

const operatingSystem = [
  {
    title: "Acquisition Intelligence",
    text: "Track source performance, lead quality, and follow-up velocity in one signal layer.",
  },
  {
    title: "Execution Infrastructure",
    text: "Convert strategy into trackable workflows with role-level accountability and clear outputs.",
  },
  {
    title: "Revenue Operations",
    text: "Connect pipeline health, conversion quality, and retention feedback loops across products.",
  },
  {
    title: "AI Decision Support",
    text: "Use AI to summarize risk, surface next actions, and speed high-stakes operator decisions.",
  },
];

const focusViews = {
  Operators: {
    label: "Operator View",
    points: [
      "Reduce execution drift between teams",
      "Shorten the time from insight to action",
      "Build workflows teams can actually sustain",
    ],
  },
  Investors: {
    label: "Investor View",
    points: [
      "Evaluate portfolio-level operating leverage",
      "Understand risk concentration by product stage",
      "Model capital deployment against execution maturity",
    ],
  },
  Talent: {
    label: "Talent View",
    points: [
      "Join a systems-first, product-native environment",
      "Build software tied directly to business outcomes",
      "Ship practical AI features with real user feedback loops",
    ],
  },
} as const;

type FocusViewKey = keyof typeof focusViews;

const proofTiles = [
  { label: "Live SaaS Products", value: "12" },
  { label: "Core Vertical Systems", value: "6+" },
  { label: "Execution Standard", value: "AI-Native" },
];

const timelineMoments = [
  {
    id: "01",
    year: "Foundation",
    title: "Execution Problems First",
    narrative:
      "The starting point was not branding. It was operational friction observed in real growth and delivery teams.",
    emphasis: "Mapped where speed, accountability, and handoffs broke down most often.",
  },
  {
    id: "02",
    year: "System Build",
    title: "Repeatable Product Patterns",
    narrative:
      "BuildVora standardized how CRM workflows, SEO execution, and growth operations are translated into software.",
    emphasis: "Created a product blueprint that can be reused without genericizing outcomes.",
  },
  {
    id: "03",
    year: "Portfolio Scale",
    title: "Multi-Product Architecture",
    narrative:
      "The system evolved from one-off tools to a portfolio model with shared infrastructure and specialized vertical products.",
    emphasis: "Scaled breadth without sacrificing operator-grade UX and execution depth.",
  },
  {
    id: "04",
    year: "Intelligence Layer",
    title: "AI As Execution Multiplier",
    narrative:
      "AI was introduced as a practical layer for prioritization, risk flagging, and faster team decision velocity.",
    emphasis: "Focused AI on decisions and action, not novelty.",
  },
];

const executionSignals = [
  { label: "Operator Workflow Coverage", value: 89, tone: "bg-blue-400" },
  { label: "Cross-Product System Reuse", value: 76, tone: "bg-cyan-300" },
  { label: "Automation Readiness", value: 84, tone: "bg-emerald-400" },
  { label: "Decision Velocity Impact", value: 91, tone: "bg-indigo-400" },
];

const manifesto = [
  {
    title: "Build For Operators",
    text: "Every interface must help someone execute a decision faster under pressure.",
  },
  {
    title: "Engineer For Longevity",
    text: "Shortcuts that create future operational debt are not acceptable tradeoffs.",
  },
  {
    title: "Ship With Accountability",
    text: "If an improvement cannot be measured in real usage, it is not finished.",
  },
];

export default function OurStoryInteractive() {
  const [activeView, setActiveView] = useState<FocusViewKey>("Operators");
  const [activeMoment, setActiveMoment] = useState(0);

  const activeFocus = useMemo(() => focusViews[activeView], [activeView]);
  const activeTimelineMoment = timelineMoments[activeMoment];

  return (
    <main className="bg-black text-slate-100">
      <section className="mesh-bg relative isolate overflow-hidden border-b border-slate-900">
        <div className="pointer-events-none absolute -right-24 top-4 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-[35%] top-0 h-80 w-36 rotate-12 bg-cyan-400/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 pt-20 md:px-10 md:pb-20 md:pt-24 lg:grid-cols-[1.04fr_0.96fr]">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.p
              variants={fadeUp}
              className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200"
            >
              Our Story
            </motion.p>
            <motion.h1 variants={fadeUp} className="editorial mt-5 text-4xl text-white md:text-6xl">
              From Operator Pain To Platform System
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 max-w-3xl text-slate-300">
              BuildVora was created to solve one recurring issue: strategy, software, and operations were disconnected.
              We built an integrated portfolio so execution is measurable, accountable, and scalable.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 max-w-3xl text-slate-300">
              The standard is practical: every product must improve real operating decisions, not just add another
              dashboard.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-7 grid gap-3 sm:grid-cols-3">
              {proofTiles.map((tile) => (
                <div key={tile.label} className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">{tile.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{tile.value}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-blue-500/35 bg-slate-950/70 p-4 shadow-[0_0_70px_rgba(59,130,246,0.24)]"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#050910]">
              <Image
                src="/felix/felix-vora-our-story-cinematic.png"
                alt="Felix Crego with Vora avatar"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-blue-500/30 bg-black/60 p-4 backdrop-blur">
              <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">Founder Perspective</p>
              <p className="mt-2 text-sm text-slate-200">
                Build software that helps teams make faster, better decisions under real operational pressure.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-4xl"
          >
            Mission, Vision, and Standard
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="mt-7 grid gap-5 md:grid-cols-3"
          >
            {principles.map((item) => (
              <motion.article key={item.title} variants={fadeUp} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300">{item.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#04070f] px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-4xl"
          >
            BuildVora Evolution
          </motion.h2>
          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {evolution.map((step, idx) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
                className="rounded-2xl border border-slate-800 bg-black/50 p-5"
              >
                <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">{step.phase}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="editorial text-3xl text-white md:text-4xl"
            >
              The Operating Model
            </motion.h2>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {operatingSystem.map((item, idx) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.42, delay: idx * 0.04 }}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                >
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.text}</p>
                </motion.article>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="rounded-2xl border border-blue-500/30 bg-slate-950/70 p-6 shadow-[0_0_60px_rgba(59,130,246,0.18)]"
          >
            <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Audience Lens</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(focusViews) as FocusViewKey[]).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
                    activeView === view
                      ? "border-blue-400 bg-blue-500/20 text-blue-100"
                      : "border-slate-700 bg-black/35 text-slate-300 hover:border-blue-500/55 hover:text-blue-200"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-black/45 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{activeFocus.label}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {activeFocus.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#030712] px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-4xl"
          >
            Narrative Timeline
          </motion.h2>
          <p className="mt-4 max-w-3xl text-slate-300">
            Explore the key strategic shifts that turned BuildVora from execution insight into a scalable platform model.
          </p>

          <div className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-800 bg-black/50 p-4">
              <div className="space-y-2">
                {timelineMoments.map((moment, idx) => (
                  <button
                    key={moment.id}
                    type="button"
                    onClick={() => setActiveMoment(idx)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      activeMoment === idx
                        ? "border-blue-500/60 bg-blue-500/16"
                        : "border-slate-800 bg-slate-950/60 hover:border-blue-500/45"
                    }`}
                  >
                    <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">{moment.year}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{moment.title}</p>
                  </button>
                ))}
              </div>
            </div>

            <motion.article
              key={activeTimelineMoment.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-blue-500/30 bg-slate-950/70 p-6 shadow-[0_0_55px_rgba(59,130,246,0.15)]"
            >
              <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">
                Chapter {activeTimelineMoment.id}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{activeTimelineMoment.title}</h3>
              <p className="mt-4 text-slate-300">{activeTimelineMoment.narrative}</p>
              <div className="mt-5 rounded-xl border border-slate-800 bg-black/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Strategic Emphasis</p>
                <p className="mt-2 text-sm text-slate-200">{activeTimelineMoment.emphasis}</p>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="editorial text-3xl text-white md:text-4xl"
            >
              Execution Proof Layer
            </motion.h2>
            <p className="mt-4 max-w-3xl text-slate-300">
              The platform is designed around measurable execution standards across product, operations, and AI adoption.
            </p>

            <div className="mt-7 space-y-4">
              {executionSignals.map((signal, idx) => (
                <motion.div
                  key={signal.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className="rounded-xl border border-slate-800 bg-slate-950/72 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-200">{signal.label}</p>
                    <span className="tech text-xs uppercase tracking-[0.18em] text-blue-300">{signal.value}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${signal.value}%` }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.7, delay: idx * 0.05 }}
                      className={`h-full ${signal.tone}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl border border-blue-500/30 bg-black/55 p-6 shadow-[0_0_55px_rgba(59,130,246,0.14)]"
          >
            <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">BuildVora Manifesto</p>
            <div className="mt-4 space-y-4">
              {manifesto.map((item) => (
                <article key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.text}</p>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-7xl rounded-3xl border border-blue-500/30 bg-slate-950/70 p-8">
          <h2 className="editorial text-3xl text-white md:text-4xl">Build With The Standard</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            If you are evaluating the platform as an operator, investor, or team member, we can walk through the
            product architecture and execution model in detail.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/investors"
              className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Investor Overview
            </Link>
            <Link
              href="/careers"
              className="inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              Careers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
