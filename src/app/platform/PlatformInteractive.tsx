"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const layers = [
  {
    id: "signal",
    name: "Signal Layer",
    subtitle: "Capture what matters, ignore what does not.",
    purpose:
      "Unifies growth, sales, and operational event streams into one structured signal system teams can action immediately.",
    capabilities: [
      "Source and campaign signal normalization",
      "Lead quality and stage-velocity telemetry",
      "Risk and anomaly detection for execution drift",
    ],
    benchmark: "92% signal clarity in weekly operator reviews",
  },
  {
    id: "workflow",
    name: "Workflow Layer",
    subtitle: "Convert decisions into repeatable execution loops.",
    purpose:
      "Turns strategy into role-level workflows with ownership, SLA visibility, and cross-team handoff integrity.",
    capabilities: [
      "Role-specific task orchestration",
      "Queue priority automation and reminders",
      "Cross-team dependency and SLA monitoring",
    ],
    benchmark: "37% faster median cycle completion across active systems",
  },
  {
    id: "intelligence",
    name: "Intelligence Layer",
    subtitle: "AI focused on decisions, not novelty.",
    purpose:
      "Adds AI where it directly impacts operator judgment and speed: summaries, priority scoring, and next-best-action guidance.",
    capabilities: [
      "Decision-ready AI recaps for managers",
      "Stage-aware recommendation prompts",
      "Scenario planning support for allocation choices",
    ],
    benchmark: "61% reduction in decision-prep friction for team leads",
  },
  {
    id: "portfolio",
    name: "Portfolio Layer",
    subtitle: "Scale products without losing standards.",
    purpose:
      "Enforces shared architecture patterns so each specialized SaaS product can move faster with consistent execution quality.",
    capabilities: [
      "Reusable product primitives and standards",
      "Shared KPI model across vertical products",
      "Expansion planning across validated workflows",
    ],
    benchmark: "12 live systems under one operating standard",
  },
];

const executionLoop = [
  {
    title: "Observe",
    text: "Capture multi-channel performance and ops movement as structured signal data.",
  },
  {
    title: "Diagnose",
    text: "Surface bottlenecks, risk clusters, and growth constraints across the workflow.",
  },
  {
    title: "Prioritize",
    text: "Score next actions by urgency, impact, and execution feasibility.",
  },
  {
    title: "Execute",
    text: "Deploy with role-level accountability and transparent handoff logic.",
  },
  {
    title: "Compound",
    text: "Feed outcomes back into the system to improve speed and decision quality over time.",
  },
];

const domainCards = [
  {
    name: "CRM + Pipeline Ops",
    signal: "Follow-up velocity, stage movement, close-risk confidence",
  },
  {
    name: "SEO + Growth Engine",
    signal: "Authority lift, content execution rhythm, conversion-linked traffic quality",
  },
  {
    name: "Marketing + Campaign Ops",
    signal: "Creative iteration speed, CAC stability, channel pacing accuracy",
  },
  {
    name: "Underwriting + Decisioning",
    signal: "Risk score consistency, review throughput, deal-quality confidence",
  },
];

const operatingModes = [
  {
    id: "acquire",
    title: "Acquire Mode",
    thesis: "Maximize qualified demand flow while preserving conversion discipline.",
    targets: [
      { label: "Lead Signal Quality", value: 88, tone: "bg-cyan-300" },
      { label: "Pipeline Throughput", value: 82, tone: "bg-blue-400" },
      { label: "Channel Pacing Accuracy", value: 79, tone: "bg-indigo-400" },
    ],
    controls: [
      "Campaign anomaly detection and auto-priority routing",
      "Lead scoring re-calibration by stage conversion reality",
      "Weekly source performance digest with action queue output",
    ],
  },
  {
    id: "convert",
    title: "Convert Mode",
    thesis: "Turn intent into revenue with tighter handoffs and response precision.",
    targets: [
      { label: "Response SLA Compliance", value: 91, tone: "bg-emerald-400" },
      { label: "Stage Advancement Rate", value: 84, tone: "bg-blue-400" },
      { label: "Close-Risk Clarity", value: 86, tone: "bg-cyan-300" },
    ],
    controls: [
      "Deal-friction diagnostics at each funnel stage",
      "AI follow-up recommendation streams for reps and managers",
      "Escalation alerts for aging opportunities",
    ],
  },
  {
    id: "compound",
    title: "Compound Mode",
    thesis: "Scale execution learning across products without introducing operational drag.",
    targets: [
      { label: "Cross-Product Reuse", value: 77, tone: "bg-indigo-400" },
      { label: "Decision Loop Speed", value: 89, tone: "bg-cyan-300" },
      { label: "Execution Consistency", value: 87, tone: "bg-emerald-400" },
    ],
    controls: [
      "Shared KPI schema and normalized operating definitions",
      "Portfolio-level risk and opportunity heatmaps",
      "Reusable workflow primitives for rapid product expansion",
    ],
  },
];

const governance = [
  {
    title: "Signal Integrity",
    standard: "All operator dashboards must trace back to normalized source definitions.",
    checkpoint: "No unclassified metric may enter the executive decision layer.",
  },
  {
    title: "Decision Accountability",
    standard: "Every high-impact recommendation must include context, confidence, and next action owner.",
    checkpoint: "Critical actions require role-level acknowledgment within SLA windows.",
  },
  {
    title: "Release Reliability",
    standard: "Feature rollouts are staged with quality gates and observability hooks.",
    checkpoint: "Regression risk above threshold triggers automatic rollback eligibility.",
  },
  {
    title: "AI Safety Envelope",
    standard: "AI assistance is scoped to decision support, never silent autonomous execution.",
    checkpoint: "High-risk outputs require human verification before workflow commitment.",
  },
];

const integrationBlueprint = [
  {
    layer: "Data Fabric",
    detail: "Unified event schema across CRM, marketing, SEO, and underwriting systems.",
  },
  {
    layer: "Orchestration Fabric",
    detail: "Workflow engine that maps role ownership, dependencies, and SLA timelines.",
  },
  {
    layer: "Intelligence Fabric",
    detail: "AI services for summaries, scoring, prioritization, and scenario interpretation.",
  },
  {
    layer: "Experience Fabric",
    detail: "Operator-facing interfaces tuned for fast action under real production pressure.",
  },
];

export default function PlatformInteractive() {
  const [activeLayer, setActiveLayer] = useState(layers[0].id);
  const [activeMode, setActiveMode] = useState(operatingModes[0].id);

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === activeLayer) ?? layers[0],
    [activeLayer],
  );
  const selectedMode = useMemo(
    () => operatingModes.find((mode) => mode.id === activeMode) ?? operatingModes[0],
    [activeMode],
  );

  return (
    <main className="bg-black text-slate-100">
      <section className="mesh-bg relative isolate overflow-hidden border-b border-slate-900 px-6 pb-14 pt-20 md:px-10 md:pb-18 md:pt-24">
        <div className="pointer-events-none absolute -right-24 top-6 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <p className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
              BuildVora Platform
            </p>
            <h1 className="editorial mt-5 text-4xl text-white md:text-6xl">AI SaaS Architecture For Real Execution</h1>
            <p className="mt-5 max-w-3xl text-slate-300">
              BuildVora connects CRM software, marketing automation, SEO platform workflows, and operations software
              into one execution-first system built for daily operator decisions.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Live Products</p>
                <p className="mt-2 text-lg font-semibold text-white">12</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Core Layers</p>
                <p className="mt-2 text-lg font-semibold text-white">4</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Execution Loop</p>
                <p className="mt-2 text-lg font-semibold text-white">Continuous</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-950/70 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Platform Motion</p>
              <span className="rounded-full border border-blue-500/45 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-200">
                Live
              </span>
            </div>
            <div className="relative h-[24rem] overflow-hidden rounded-2xl border border-slate-800 bg-[#050b17]">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster="/vora-scenes/hero-command.svg"
                className="absolute inset-0 h-full w-full object-cover brightness-[0.72] saturate-[1.08] contrast-[1.06]"
              >
                <source src="/videos/vora-platform-do.mp4" type="video/mp4" />
                <source src="/videos/vora-cinematic.webm" type="video/webm" />
                <source src="/videos/vora-cinematic.mp4" type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-blue-500/30 bg-black/55 p-3 backdrop-blur">
                <p className="text-sm text-slate-200">
                  Platform consistency is the multiplier: every product learns from shared execution intelligence.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">System Control Plane</h2>
          <p className="mt-4 max-w-3xl text-slate-300">
            Select each architecture layer to see how BuildVora translates data into execution velocity.
          </p>

          <div className="mt-7 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-2xl border border-slate-800 bg-black/45 p-4">
              <div className="space-y-2">
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setActiveLayer(layer.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      activeLayer === layer.id
                        ? "border-blue-500/60 bg-blue-500/14"
                        : "border-slate-800 bg-slate-950/60 hover:border-blue-500/45"
                    }`}
                  >
                    <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">{layer.name}</p>
                    <p className="mt-1 text-sm text-slate-200">{layer.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>

            <motion.article
              key={selectedLayer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-blue-500/30 bg-slate-950/72 p-6 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
            >
              <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">{selectedLayer.name}</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{selectedLayer.subtitle}</h3>
              <p className="mt-4 text-slate-300">{selectedLayer.purpose}</p>
              <div className="mt-5 rounded-xl border border-slate-800 bg-black/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Capabilities</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                  {selectedLayer.capabilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                Benchmark: {selectedLayer.benchmark}
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#03060e] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Execution Loop</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-5">
            {executionLoop.map((step, idx) => (
              <article key={step.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Step {idx + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Operating Mode Simulator</h2>
          <p className="mt-4 max-w-3xl text-slate-300">
            Switch the platform posture to see how priorities and control mechanisms shift by growth objective.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {operatingModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
                  activeMode === mode.id
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-black/40 text-slate-300 hover:border-blue-500/55 hover:text-blue-200"
                }`}
              >
                {mode.title}
              </button>
            ))}
          </div>

          <motion.div
            key={selectedMode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 grid gap-6 rounded-2xl border border-blue-500/30 bg-slate-950/72 p-6 lg:grid-cols-[1.02fr_0.98fr]"
          >
            <div>
              <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">{selectedMode.title}</p>
              <p className="mt-3 text-slate-200">{selectedMode.thesis}</p>
              <div className="mt-5 rounded-xl border border-slate-800 bg-black/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Control Set</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                  {selectedMode.controls.map((control) => (
                    <li key={control}>{control}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              {selectedMode.targets.map((target) => (
                <div key={target.label} className="rounded-xl border border-slate-800 bg-black/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-200">{target.label}</p>
                    <p className="tech text-xs uppercase tracking-[0.18em] text-blue-300">{target.value}%</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${target.value}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${target.tone}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#02050c] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="editorial text-3xl text-white md:text-4xl">Reliability and Governance</h2>
            <p className="mt-4 max-w-3xl text-slate-300">
              The platform enforces explicit standards so execution quality scales with product breadth.
            </p>
            <div className="mt-6 space-y-4">
              {governance.map((item) => (
                <article key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/72 p-4">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.standard}</p>
                  <p className="mt-3 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
                    Checkpoint: {item.checkpoint}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-black/45 p-6">
            <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Integration Blueprint</p>
            <div className="mt-5 space-y-3">
              {integrationBlueprint.map((item, idx) => (
                <article key={item.layer} className="rounded-xl border border-slate-800 bg-slate-950/65 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Layer {idx + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{item.layer}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Domain Integration Matrix</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {domainCards.map((card) => (
              <article key={card.name} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <h3 className="text-xl font-semibold text-white">{card.name}</h3>
                <p className="mt-3 text-sm text-slate-300">{card.signal}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Explore Products
            </Link>
            <Link
              href="/case-studies"
              className="inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              Review Case Studies
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
