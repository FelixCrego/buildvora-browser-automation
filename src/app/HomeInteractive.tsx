"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { saasItems } from "@/lib/saasData";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

const fadeCard = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
};

const platformPillars = [
  {
    title: "BUILD",
    text: "High-speed R&D lab developing custom AI solutions.",
  },
  {
    title: "SELL",
    text: "12+ Battle-tested SaaS platforms powering real-world operators.",
  },
  {
    title: "MANAGE / MAISP",
    text: "Full-cycle AI orchestration. We don't just sell tools; we run the intelligence engine for you.",
  },
];

const lifecycle = [
  "Market workflow analysis",
  "Data and automation architecture",
  "AI assistance layer implementation",
  "Dashboard and operator UX delivery",
  "Production release and iteration",
];

const quotes = [
  {
    name: "Operations Lead, Multi-Brand Team",
    text: "BuildVora shortened our reporting and execution loops immediately. We now act on weekly signals instead of monthly guesswork.",
  },
  {
    name: "Founder, Growth Agency",
    text: "The CRM and SEO systems feel built by people who understand delivery pressure. AI suggestions are practical and deployable.",
  },
  {
    name: "Acquisitions Manager, Real Estate",
    text: "Underwriting and pipeline clarity improved fast. The tools helped us standardize decisions across a growing team.",
  },
];

const featured = saasItems.slice(0, 3);
const growthAcquisitionSuiteSlugs = new Set([
  "felix-crm",
  "linkgrowth",
  "felix-marketing-hub",
  "real-estate-investor-marketing-hub",
  "social-content-hub",
  "carrot-seoai",
  "backlink-prospector",
  "clawdio-click",
]);
const growthAcquisitionSuite = saasItems.filter((item) => growthAcquisitionSuiteSlugs.has(item.slug));
const operationsAnalysisSuite = saasItems.filter((item) => !growthAcquisitionSuiteSlugs.has(item.slug));

const voraMoments = [
  {
    frontHeadline: "Architect & Integrate",
    title: "Custom Workflow Architecture",
    text: "We map your operational bottlenecks and deploy the exact AI agents your team needs directly into your existing data and systems.",
    image: "/vora-robot-poses/vora-journey-cyan.png",
    pose: "/vora-robot-poses/vora-journey-cyan.png",
    focusLabel: "MAISP Phase 01",
    proof: "Workflow design embedded into your existing systems",
    details: ["System Mapping", "Custom Data Ingestion", "Legacy Integration"],
    ctaLabel: "See Platform Architecture",
    ctaHref: "/platform",
  },
  {
    frontHeadline: "Monitor & Optimize",
    title: "Active Drift Management",
    text: "AI models update and prompts degrade over time. We actively monitor, tune, and upgrade your AI ecosystem so your operations never break.",
    image: "/vora-robot-poses/vora-journey-blue.png",
    pose: "/vora-robot-poses/vora-journey-blue.png",
    focusLabel: "MAISP Phase 02",
    proof: "Continuous tuning and model reliability management",
    details: ["Drift Protection", "Weekly Tuning", "Hallucination Rate: <0.1%"],
    ctaLabel: "View MAISP Operations",
    ctaHref: "/maisp",
  },
  {
    frontHeadline: "Secure & Govern",
    title: "Enterprise-Grade Governance",
    text: "Get the speed of autonomous AI with the safety of human oversight. We enforce strict data privacy guardrails and provide human-in-the-loop verification.",
    image: "/vora-robot-poses/vora-journey-violet.png",
    pose: "/vora-robot-poses/vora-journey-violet.png",
    focusLabel: "MAISP Phase 03",
    proof: "Enterprise controls with human-in-the-loop oversight",
    details: ["Zero-Training Privacy", "Compliance Ready", "Output Audits"],
    ctaLabel: "Review Governance Model",
    ctaHref: "/investors",
  },
];

const voraPoseCycle = [
  "/vora-robot-poses/vora-pose-wave.png",
  "/vora-robot-poses/vora-pose-point.png",
  "/vora-robot-poses/vora-pose-arms-crossed.png",
  "/vora-robot-poses/vora-pose-hologram.png",
];

type VoraSuitVariant = {
  id: string;
  tint: string;
  glow: string;
  filter: string;
};

type JourneyTheme = {
  border: string;
  glow: string;
  backGradient: string;
  surface: string;
  chip: string;
  proof: string;
  avatar: VoraSuitVariant;
};

const voraSuitVariants: VoraSuitVariant[] = [
  {
    id: "cobalt",
    tint: "rgba(59, 130, 246, 0.5)",
    glow: "rgba(96, 165, 250, 0.32)",
    filter: "hue-rotate(0deg) saturate(1.06) contrast(1.04)",
  },
  {
    id: "emerald",
    tint: "rgba(16, 185, 129, 0.42)",
    glow: "rgba(52, 211, 153, 0.28)",
    filter: "hue-rotate(32deg) saturate(1.1) contrast(1.03)",
  },
  {
    id: "amber",
    tint: "rgba(245, 158, 11, 0.4)",
    glow: "rgba(251, 191, 36, 0.25)",
    filter: "hue-rotate(58deg) saturate(1.08) contrast(1.03)",
  },
  {
    id: "rose",
    tint: "rgba(244, 63, 94, 0.38)",
    glow: "rgba(251, 113, 133, 0.24)",
    filter: "hue-rotate(-22deg) saturate(1.1) contrast(1.03)",
  },
];

const journeyThemes: JourneyTheme[] = [
  {
    border: "border-cyan-400/45",
    glow: "hover:shadow-[0_0_45px_rgba(34,211,238,0.22)]",
    backGradient: "bg-[linear-gradient(145deg,rgba(18,83,118,0.9),rgba(11,36,62,0.96))]",
    surface: "bg-[radial-gradient(circle_at_40%_30%,rgba(34,211,238,0.32),rgba(14,26,44,0.55)_55%,rgba(10,18,32,0.78)_100%)]",
    chip: "border-cyan-300/55 bg-cyan-300/22 text-cyan-50",
    proof: "border-cyan-300/45 bg-cyan-400/18 text-cyan-50",
    avatar: {
      id: "aqua",
      tint: "rgba(34, 211, 238, 0.28)",
      glow: "rgba(103, 232, 249, 0.2)",
      filter: "hue-rotate(0deg) saturate(1.02) brightness(1.02) contrast(1.03)",
    },
  },
  {
    border: "border-blue-400/45",
    glow: "hover:shadow-[0_0_45px_rgba(59,130,246,0.22)]",
    backGradient: "bg-[linear-gradient(145deg,rgba(20,58,132,0.9),rgba(13,30,68,0.96))]",
    surface: "bg-[radial-gradient(circle_at_50%_26%,rgba(59,130,246,0.34),rgba(15,30,62,0.58)_56%,rgba(10,17,32,0.8)_100%)]",
    chip: "border-blue-300/55 bg-blue-400/22 text-blue-50",
    proof: "border-blue-300/45 bg-blue-400/18 text-blue-50",
    avatar: {
      id: "cobalt-intense",
      tint: "rgba(59, 130, 246, 0.3)",
      glow: "rgba(96, 165, 250, 0.2)",
      filter: "hue-rotate(0deg) saturate(1.02) brightness(1.02) contrast(1.03)",
    },
  },
  {
    border: "border-violet-400/45",
    glow: "hover:shadow-[0_0_45px_rgba(167,139,250,0.22)]",
    backGradient: "bg-[linear-gradient(145deg,rgba(91,33,182,0.88),rgba(44,18,87,0.95))]",
    surface: "bg-[radial-gradient(circle_at_47%_26%,rgba(167,139,250,0.34),rgba(34,18,65,0.6)_56%,rgba(14,10,30,0.82)_100%)]",
    chip: "border-violet-300/55 bg-violet-400/22 text-violet-50",
    proof: "border-violet-300/45 bg-violet-400/18 text-violet-50",
    avatar: {
      id: "violet",
      tint: "rgba(167, 139, 250, 0.3)",
      glow: "rgba(196, 181, 253, 0.2)",
      filter: "hue-rotate(0deg) saturate(1.02) brightness(1.02) contrast(1.03)",
    },
  },
];

const journeyKpis = [
  ["System Mapping", "Custom Data Ingestion", "Legacy Integration"],
  ["Drift Protection", "Weekly Tuning", "Hallucination Rate: <0.1%"],
  ["Zero-Training Privacy", "Compliance Ready", "Output Audits"],
];

function getVoraSuitVariant(pose: string): VoraSuitVariant {
  const poseIndex = voraPoseCycle.indexOf(pose);
  const safeIndex = poseIndex === -1 ? 0 : poseIndex;
  return voraSuitVariants[safeIndex % voraSuitVariants.length];
}

type LaunchPhase = "Awareness" | "Consideration" | "Decision";
type LaunchStageFilter = "All" | LaunchPhase;

type LaunchTrack = {
  id: string;
  label: string;
  title: string;
  summary: string;
  phase: LaunchPhase;
  focus: string;
  deliverables: string[];
};

const launchTracks: LaunchTrack[] = [
  {
    id: "lead-capture-engine",
    label: "Track A",
    title: "Lead Capture Engine",
    summary: "High-intent landing flows, segmented offers, and qualification prompts that convert traffic into pipeline.",
    phase: "Awareness",
    focus: "Turn anonymous visitors into qualified leads with persona-matched entry points and stronger first-touch offers.",
    deliverables: ["Persona-specific hero variants", "Lead magnet + CTA split-test matrix", "Instant qualification form with CRM sync"],
  },
  {
    id: "authority-nurture-system",
    label: "Track B",
    title: "Authority + Nurture System",
    summary: "Trust-building content sequences and objection-handling flows that move prospects toward sales calls.",
    phase: "Consideration",
    focus: "Increase buyer confidence with conversational proof, strategic follow-up timing, and stage-based messaging.",
    deliverables: ["7-day nurture automation", "Case-study proof sequence", "Objection-response message bank"],
  },
  {
    id: "conversion-closing-pipeline",
    label: "Track C",
    title: "Conversion + Closing Pipeline",
    summary: "Sales-ready booking architecture built to increase show-up rates and turn calls into new clients.",
    phase: "Decision",
    focus: "Reduce friction from click to booked call with a tighter qualification handoff and high-conviction offer framing.",
    deliverables: ["Calendar funnel optimization", "No-show recovery sequence", "Call-to-close conversion scorecard"],
  },
];

const launchStageFilters: LaunchStageFilter[] = ["All", "Awareness", "Consideration", "Decision"];
const launchTimelinePhases: { quarter: string; label: string; phase: LaunchPhase }[] = [
  { quarter: "Stage 1", label: "Attract + Capture Demand", phase: "Awareness" },
  { quarter: "Stage 2", label: "Nurture + Build Trust", phase: "Consideration" },
  { quarter: "Stage 3", label: "Book + Close Clients", phase: "Decision" },
];

const heroProofMetrics = [
  { label: "Live Products", value: "12+" },
  { label: "AI Confidence", value: "92.4%" },
  { label: "Q3 Active Builds", value: "3" },
];

export default function HomePage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const journeyRef = useRef<HTMLElement | null>(null);
  const platformRef = useRef<HTMLElement | null>(null);
  const productsRef = useRef<HTMLElement | null>(null);
  const quotesRef = useRef<HTMLElement | null>(null);
  const caseStudiesRef = useRef<HTMLElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const platformVideoRef = useRef<HTMLVideoElement | null>(null);

  const [tick, setTick] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [flippedJourneyCards, setFlippedJourneyCards] = useState<Record<number, boolean>>({});
  const [hoveredJourneyCard, setHoveredJourneyCard] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const heroGlow = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const refs = [heroRef, journeyRef, platformRef, productsRef, quotesRef, caseStudiesRef];
    const onScroll = () => {
      const center = window.innerHeight / 2;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      refs.forEach((sectionRef, index) => {
        const element = sectionRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(center - sectionCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      setActiveSection(bestIndex);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const tryPlay = (video: HTMLVideoElement | null) => {
      if (!video) return;
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {
          // Ignore autoplay promise rejections; poster remains as visual fallback.
        });
      }
    };

    const replayAll = () => {
      tryPlay(heroVideoRef.current);
      tryPlay(platformVideoRef.current);
    };

    replayAll();
    window.addEventListener("pageshow", replayAll);
    document.addEventListener("visibilitychange", replayAll);
    return () => {
      window.removeEventListener("pageshow", replayAll);
      document.removeEventListener("visibilitychange", replayAll);
    };
  }, []);

  const displayPoseIndex = (activeSection + tick) % voraPoseCycle.length;
  const briefingPose = voraPoseCycle[(displayPoseIndex + 1) % voraPoseCycle.length];
  const launchPose = voraPoseCycle[(displayPoseIndex + 2) % voraPoseCycle.length];
  const toggleJourneyCard = (idx: number) =>
    setFlippedJourneyCards((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <main className="bg-black text-slate-100">
      <section ref={heroRef} className="relative isolate min-h-[92vh] overflow-hidden border-b border-slate-900 bg-black">
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY, scale: heroScale, opacity: heroGlow }}>
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/vora-scenes/hero-command.svg"
            onCanPlay={() => {
              void heroVideoRef.current?.play().catch(() => undefined);
            }}
            className="h-full w-full object-cover object-[68%_center] brightness-[0.88] saturate-[1.2] contrast-[1.08] md:w-[122%] md:max-w-none md:object-right md:translate-x-14 lg:w-[116%] lg:translate-x-18"
          >
            <source src="/videos/vora-hero-latest.mp4" type="video/mp4" />
            <source src="/videos/vora-cinematic.webm" type="video/webm" />
            <source src="/videos/vora-cinematic.mp4" type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/68 via-black/34 to-transparent md:from-black/82 md:via-black/38" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_36%,rgba(59,130,246,0.34),transparent_43%),radial-gradient(circle_at_75%_38%,rgba(16,185,129,0.14),transparent_46%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_42%,rgba(0,0,0,0.36)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-14 cinematic-letterbox" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 cinematic-letterbox" />
          <div className="pointer-events-none absolute inset-0 cinematic-grain opacity-12" />
          <div className="pointer-events-none absolute inset-0 cinematic-scanline opacity-8" />
          <div className="pointer-events-none absolute inset-0 cinematic-beam" />
        </motion.div>

        <div className="relative z-20 mx-auto flex min-h-[92vh] max-w-7xl items-end px-6 pb-14 pt-36 md:px-10 md:pb-18 md:pt-40">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="w-full -translate-x-1 -translate-y-4 md:max-w-4xl md:-translate-x-3 md:-translate-y-8 lg:max-w-[52%] lg:-translate-x-5 lg:-translate-y-10"
          >
            <motion.p
              variants={fadeUp}
              className="tech mb-6 inline-flex rounded-full border border-blue-300/35 bg-blue-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-blue-200"
            >
              Operator-First AI SaaS Development
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="editorial text-[clamp(2.1rem,6.5vw,5.4rem)] font-extrabold leading-[1.01] tracking-tight text-white"
            >
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                AI Operating System
              </span>{" "}
              for <span className="text-blue-400">Growth Teams</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-3xl text-[1.05rem] leading-relaxed text-slate-200">
              BuildVora is a Full-Stack AI Lab and Managed Service Provider. We build, deploy, and manage 12+ production-hardened SaaS platforms to automate the last 30% of your business operations.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="/maisp"
                className="neon-pulse blue-glow inline-flex rounded-full border border-blue-400 bg-blue-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Book AI Assessment
              </a>
              <Link
                href="#products"
                className="inline-flex rounded-full border border-white/25 bg-black/35 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-300/55 hover:text-blue-200"
              >
                Explore SaaS Ecosystem
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-4 inline-flex rounded-full border border-blue-300/45 bg-blue-500/12 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-blue-100">
              Performance Guarantee: 99.9% Model Accuracy &amp; Security Guardrails Included.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 grid gap-3 sm:grid-cols-3">
              {heroProofMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-white/10 bg-black/35 px-3 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">{metric.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{metric.value}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section ref={journeyRef} className="relative border-b border-slate-900 bg-[#1a2f4a] px-6 py-14 md:px-10 md:py-18">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(186,230,253,0.28),transparent_42%),radial-gradient(circle_at_82%_24%,rgba(216,180,254,0.22),transparent_44%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#254771]/46 via-transparent to-[#112338]/55" />
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-5xl"
          >
            Vora Across The BuildVora Journey
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mt-8 grid gap-5 lg:grid-cols-3"
          >
            {voraMoments.map((moment, idx) => (
              (() => {
                const theme = journeyThemes[idx % journeyThemes.length];
                return (
              <motion.article
                key={moment.title}
                variants={fadeCard}
                transition={{ duration: 0.45, delay: idx * 0.03 }}
                onMouseEnter={() => setHoveredJourneyCard(idx)}
                onMouseLeave={() => setHoveredJourneyCard((prev) => (prev === idx ? null : prev))}
                className={`group relative h-[31rem] overflow-hidden rounded-2xl border bg-[#13263f] shadow-[0_0_28px_rgba(59,130,246,0.13)] transition ${theme.border} ${theme.glow} [perspective:1200px]`}
              >
                <motion.div
                  animate={{ rotateY: hoveredJourneyCard === idx || flippedJourneyCards[idx] ? 180 : 0 }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                  className="relative h-full w-full [transform-style:preserve-3d]"
                >
                  <div className="absolute inset-0 flex h-full w-full flex-col [backface-visibility:hidden]">
                    <div className={`relative h-72 border-b border-slate-600/80 ${theme.surface}`}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`moment-${idx}-${moment.pose}`}
                          initial={{ opacity: 0.25, scale: 1.03 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.45, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <VoraAvatarImage
                            src={moment.pose}
                            alt={`${moment.frontHeadline} visual`}
                            fit="cover"
                            variant={theme.avatar}
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/14 via-transparent to-transparent" />
                      <button
                        type="button"
                        onClick={() => toggleJourneyCard(idx)}
                        className="absolute right-3 top-3 rounded-full border border-blue-300/60 bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-blue-50"
                      >
                        Flip Card
                      </button>
                      <div className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${theme.chip}`}>
                        {moment.focusLabel}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-semibold text-white">{moment.frontHeadline}</h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {journeyKpis[idx].map((kpi) => (
                          <span
                            key={`${moment.title}-${kpi}`}
                            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] ${theme.chip}`}
                          >
                            {kpi}
                          </span>
                        ))}
                      </div>
                      <p className={`mt-4 rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.16em] ${theme.proof}`}>
                        {moment.proof}
                      </p>
                      <p className="mt-auto pt-4 text-[11px] uppercase tracking-[0.18em] text-blue-300">
                        Hover To Flip | Tap On Mobile
                      </p>
                    </div>
                  </div>

                  <div className={`absolute inset-0 flex h-full w-full flex-col rounded-2xl border p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] ${theme.border} ${theme.backGradient}`}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white">{moment.title}</h3>
                      <button
                        type="button"
                        onClick={() => toggleJourneyCard(idx)}
                        className="rounded-full border border-blue-300/60 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-blue-50"
                      >
                        Back
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-100">{moment.text}</p>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-200">
                      {moment.details.map((detail) => (
                        <li key={detail} className="font-mono text-[12px] leading-relaxed">
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-5">
                      <Link
                        href={moment.ctaHref}
                        className="inline-flex rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_25px_rgba(255,255,255,0.12)]"
                      >
                        {moment.ctaLabel}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </motion.article>
                );
              })()
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-b border-slate-900 bg-[#060b15]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="relative min-h-screen overflow-hidden"
        >
          <Image
            src="/images/vora-cinematic-leadgen-wide.png"
            alt="BuildVora intelligence layer with Vora system agent orchestrating client acquisition workflows."
            fill
            sizes="100vw"
            className="object-cover object-center brightness-[1.12] saturate-[1.08] contrast-[1.02]"
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/62 via-black/24 to-black/8" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_36%,rgba(59,130,246,0.26),transparent_46%)]" />
          <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-14 pt-24 md:px-10 md:pb-20">
            <div className="max-w-2xl">
              <p className="tech text-xs uppercase tracking-[0.2em] text-blue-200">Vora Intelligence Layer</p>
              <h2 className="editorial mt-3 text-3xl text-white md:text-5xl">Where Strategy Converts Into Qualified Pipeline</h2>
              <p className="mt-4 text-slate-200">
                Vora operates as an autonomous system agent coordinating lead capture, follow-up velocity, and conversion priorities so your homepage supports revenue-generating operational workflow.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:felix@felixcrego.com?subject=BuildVora%20Lead%20Generation%20Blueprint"
                  className="inline-flex rounded-full border border-blue-300/55 bg-blue-500/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-50 transition hover:bg-blue-500/50"
                >
                  Get Lead Gen Blueprint
                </a>
                <Link
                  href="/case-studies"
                  className="inline-flex rounded-full border border-white/35 bg-black/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-blue-300/60 hover:text-blue-200"
                >
                  View Client Wins
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section ref={platformRef} id="platform" className="border-b border-slate-900 bg-[#03060d] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="editorial text-3xl text-white md:text-5xl"
            >
              BuildVora Platform Advantage
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="mt-4 max-w-2xl text-slate-400"
            >
              A portfolio designed for operators who need performance movement, team clarity, and faster decision cycles.
            </motion.p>

            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {platformPillars.map((pillar, idx) => (
                <motion.article
                  key={pillar.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="rounded-2xl border border-slate-800 bg-black/50 p-5"
                >
                  <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{pillar.text}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-black/45 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Delivery Lifecycle</p>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                {lifecycle.map((step, idx) => (
                  <div key={step} className="rounded-xl border border-slate-800 bg-slate-950/65 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Step {idx + 1}</p>
                    <p className="mt-2 text-sm text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-950/70 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Vora System Agent</p>
              <span className="rounded-full border border-blue-500/45 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-200">
                Live Motion
              </span>
            </div>
            <div className="relative h-[24rem] overflow-hidden rounded-2xl border border-slate-800 bg-[#050b17]">
              <video
                ref={platformVideoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster="/vora-scenes/hero-command.svg"
                onCanPlay={() => {
                  void platformVideoRef.current?.play().catch(() => undefined);
                }}
                className="absolute inset-0 h-full w-full object-cover brightness-[0.72] saturate-[1.08] contrast-[1.06]"
              >
                <source src="/videos/vora-platform-do.mp4" type="video/mp4" />
                <source src="/videos/vora-cinematic.webm" type="video/webm" />
                <source src="/videos/vora-cinematic.mp4" type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-blue-500/30 bg-black/55 p-3 backdrop-blur">
                <p className="text-sm text-slate-200">
                  Vora functions as an autonomous operator connecting intelligence layers and operational workflows across every BuildVora software experience.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={productsRef} id="products" className="border-b border-slate-900 bg-black px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <h2 className="editorial text-3xl text-white md:text-5xl">Product Portfolio</h2>
            <p className="mt-4 max-w-2xl text-slate-400">
              Live SaaS platforms across sales, growth, content, underwriting, and operations. MAISP INTEGRATED: Every tool is monitored for drift, accuracy, and security by our managed services team.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="mt-10"
          >
            <div className="mb-10">
              <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Growth & Acquisition Suite</p>
              <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {growthAcquisitionSuite.map((item, index) => (
                  <motion.article
                    key={item.slug}
                    variants={fadeCard}
                    transition={{ duration: 0.45, delay: index * 0.02 }}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
                  >
                    <div className="relative h-44 overflow-hidden border-b border-slate-800">
                      <Image
                        src={`/screenshots/${item.slug}.png`}
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
                      <h3 className="text-xl font-semibold text-white">{item.name}</h3>
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
                          className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500 hover:text-blue-300"
                        >
                          Case Study
                        </Link>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                        >
                          Live App
                        </a>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <div>
              <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Operations & Analysis Suite</p>
              <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {operationsAnalysisSuite.map((item, index) => (
                  <motion.article
                    key={item.slug}
                    variants={fadeCard}
                    transition={{ duration: 0.45, delay: index * 0.02 }}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
                  >
                    <div className="relative h-44 overflow-hidden border-b border-slate-800">
                      <Image
                        src={`/screenshots/${item.slug}.png`}
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
                      <h3 className="text-xl font-semibold text-white">{item.name}</h3>
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
                          className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500 hover:text-blue-300"
                        >
                          Case Study
                        </Link>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                        >
                          Live App
                        </a>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <BriefingLayerSection image={briefingPose} variant={getVoraSuitVariant(briefingPose)} />

      <section ref={quotesRef} id="quotes" className="border-b border-slate-900 bg-[#04070f] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-5xl"
          >
            Client and Operator Quotes
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.18 }}
            variants={staggerContainer}
            className="mt-8 grid gap-5 md:grid-cols-3"
          >
            {quotes.map((quote) => (
              <motion.article key={quote.name} variants={fadeCard} className="rounded-2xl border border-slate-800 bg-black/50 p-5">
                <p className="text-sm leading-relaxed text-slate-300">"{quote.text}"</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-blue-300">{quote.name}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section ref={caseStudiesRef} id="case-studies" className="border-b border-slate-900 bg-[#04070f] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-5xl"
          >
            Featured Case Studies
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-4 max-w-2xl text-slate-400"
          >
            Product-specific case studies with challenge context, implementation strategy, and operational outcomes.
          </motion.p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {featured.map((item) => (
              <article key={`featured-${item.slug}`} className="rounded-2xl border border-slate-800 bg-black/50 p-5">
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm text-blue-300">{item.caseStudy.companyType}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{item.caseStudy.challenge}</p>
                <Link
                  href={`/case-studies/${item.slug}`}
                  className="mt-5 inline-flex rounded-full border border-blue-500/50 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/15"
                >
                  Read Case Study
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {saasItems.map((item) => (
              <Link
                key={`case-${item.slug}`}
                href={`/case-studies/${item.slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-black/50 px-4 py-3 text-sm text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200"
              >
                <span>{item.name}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-300">view</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LaunchModeSection image={launchPose} variant={getVoraSuitVariant(launchPose)} />

      <section className="bg-black px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-blue-500/25 bg-slate-950/70 p-8">
            <h2 className="editorial text-3xl text-white">Investor Opportunity</h2>
            <p className="mt-3 text-slate-300">
              Review our portfolio traction and the MAISP roadmap for Q3 2026.
            </p>
            <Link
              href="/investors"
              className="mt-6 inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Visit Investor Page
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
            <h2 className="editorial text-3xl text-white">Upcoming Projects</h2>
            <p className="mt-3 text-slate-300">
              Explore pipeline projects, upcoming launch concepts, and product suggestions sourced from operator demand.
            </p>
            <Link
              href="/upcoming-projects"
              className="mt-6 inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              View Upcoming Page
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

function VoraEyeOverlay({ expression }: { expression: number }) {
  const expressionKey = expression % 3;
  return (
    <AnimatePresence mode="wait">
      {expressionKey === 0 && (
        <motion.div
          key="smile"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 flex items-center justify-center gap-8"
        >
          <span className="block h-6 w-12 rounded-b-full border-b-4 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
          <span className="block h-6 w-12 rounded-b-full border-b-4 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
        </motion.div>
      )}
      {expressionKey === 1 && (
        <motion.div
          key="blink"
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center gap-8"
        >
          <span className="block h-1 w-12 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
          <span className="block h-1 w-12 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
        </motion.div>
      )}
      {expressionKey === 2 && (
        <motion.div
          key="focus"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 flex items-center justify-center gap-10"
        >
          <span className="block h-5 w-5 rounded-full bg-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.95)]" />
          <span className="block h-5 w-5 rounded-full bg-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.95)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VoraAvatarImage({
  src,
  alt,
  fit = "cover",
  priority = false,
  variant,
}: {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  priority?: boolean;
  variant: VoraSuitVariant;
}) {
  const fitClass = fit === "contain" ? "object-contain object-bottom" : "object-cover object-[center_30%] scale-[1.04]";

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={fitClass}
        style={{ filter: variant.filter }}
      />
      <div
        className="pointer-events-none absolute inset-x-[10%] bottom-[5%] top-[30%] rounded-[40%] opacity-90 mix-blend-color"
        style={{ background: `radial-gradient(circle at 50% 20%, ${variant.tint} 0%, ${variant.tint} 48%, transparent 84%)` }}
      />
      <div
        className="pointer-events-none absolute inset-x-[12%] bottom-[0%] top-[34%] rounded-[42%] opacity-78 blur-[16px] mix-blend-screen"
        style={{ background: `radial-gradient(circle at 50% 24%, ${variant.glow} 0%, ${variant.glow} 56%, transparent 84%)` }}
      />
      <div
        className="pointer-events-none absolute inset-x-[8%] bottom-[0%] top-[42%] opacity-70 mix-blend-soft-light"
        style={{ background: `linear-gradient(180deg, transparent 0%, ${variant.tint} 34%, ${variant.tint} 100%)` }}
      />
    </>
  );
}

function BriefingLayerSection({ image, variant }: { image: string; variant: VoraSuitVariant }) {
  const briefingRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: briefingRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [52, -52]);

  return (
    <section ref={briefingRef} className="relative overflow-hidden border-b border-slate-900 bg-[#02050d] px-6 py-16 md:px-10 md:py-20">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />
      <div className="pointer-events-none absolute -right-14 top-8 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
        >
          <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Vora Briefing Layer</p>
          <h3 className="editorial mt-3 text-3xl text-white md:text-4xl">Portfolio Intelligence Before Every Decision</h3>
          <p className="mt-4 max-w-2xl text-slate-300">
            Vora compiles cross-product usage, revenue movement, and operator bottlenecks into a structured briefing so teams can prioritize the next highest-impact action.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Signal Coverage</p>
              <p className="mt-2 text-xl font-semibold text-white">12 Products</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">AI Confidence</p>
              <p className="mt-2 text-xl font-semibold text-white">92.4%</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Action Queue</p>
              <p className="mt-2 text-xl font-semibold text-white">27 Live</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-3xl border border-blue-500/45 bg-slate-950/70 p-4 shadow-[0_0_70px_rgba(59,130,246,0.25)]"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[88%] w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/18 blur-3xl" />
          <motion.div className="relative h-[28rem] overflow-hidden rounded-2xl border border-slate-800 md:h-[34rem]" style={{ y: imageY }}>
            <VoraAvatarImage src={image} alt="Vora briefing layer" fit="cover" variant={variant} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

            <div className="hologram-flicker absolute left-3 top-3 z-20 w-48 rounded-xl border border-blue-400/50 bg-black/45 p-3 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Briefing Feed</p>
              <div className="mt-2 space-y-2">
                <div className="h-1 w-28 rounded bg-blue-300/70" />
                <div className="h-1 w-36 rounded bg-blue-300/55" />
                <div className="h-1 w-24 rounded bg-blue-300/50" />
                <div className="h-1 w-32 rounded bg-blue-300/45" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 z-20 grid gap-2 rounded-2xl border border-slate-700 bg-black/55 p-3 backdrop-blur sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300">MRR Trend</p>
                <p className="mt-1 text-sm text-white">+18.6%</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300">Retention Health</p>
                <p className="mt-1 text-sm text-white">Strong</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300">Critical Alerts</p>
                <p className="mt-1 text-sm text-white">2 Open</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function LaunchModeSection({ image, variant }: { image: string; variant: VoraSuitVariant }) {
  const launchRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: launchRef,
    offset: ["start end", "end start"],
  });
  const timelineY = useTransform(scrollYProgress, [0, 1], [36, -36]);
  const panelY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const [activeStage, setActiveStage] = useState<LaunchStageFilter>("All");
  const [expandedTrackId, setExpandedTrackId] = useState(launchTracks[0]?.id ?? "");

  const filteredTracks =
    activeStage === "All"
      ? launchTracks
      : launchTracks.filter((track) => track.phase === activeStage);

  useEffect(() => {
    if (!filteredTracks.some((track) => track.id === expandedTrackId)) {
      setExpandedTrackId(filteredTracks[0]?.id ?? "");
    }
  }, [activeStage, expandedTrackId, filteredTracks]);

  return (
    <section ref={launchRef} className="relative overflow-hidden border-b border-slate-900 bg-[#02050d] px-6 py-16 md:px-10 md:py-20">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-35" />
      <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-blue-500/16 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Vora Acquisition Mode</p>
          <h3 className="editorial mt-3 text-3xl text-white md:text-4xl">Client Acquisition Engine Built For Lead Flow</h3>
          <p className="mt-4 max-w-3xl text-slate-300">
            This section now maps your buyer journey from first click to closed client so the homepage does more than look good: it captures demand, builds trust, and drives booked calls.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            style={{ y: timelineY }}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-slate-800 bg-black/55 p-5"
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {launchStageFilters.map((stage) => {
                const isActive = activeStage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setActiveStage(stage)}
                    className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition ${
                      isActive
                        ? "border-blue-400 bg-blue-500/25 text-blue-100"
                        : "border-slate-700 bg-slate-950/55 text-slate-300 hover:border-blue-500/45 hover:text-blue-200"
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
            <p className="mb-4 text-xs text-slate-400">
              Showing {filteredTracks.length} active {filteredTracks.length === 1 ? "track" : "tracks"} for{" "}
              <span className="text-blue-200">{activeStage}</span>.
            </p>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredTracks.map((track, idx) => {
                const isExpanded = expandedTrackId === track.id;
                const isHighlighted = track.phase === "Decision";
                return (
                  <motion.article
                    key={track.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                    className={`overflow-hidden rounded-2xl border p-4 ${
                      isExpanded || isHighlighted
                        ? "border-blue-500/35 bg-slate-950/75"
                        : "border-slate-700 bg-slate-950/70"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedTrackId((prev) => (prev === track.id ? "" : track.id))}
                      className="w-full text-left"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">{track.label}</p>
                        <span className="rounded-full border border-blue-500/35 bg-blue-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-blue-200">
                          {track.phase}
                        </span>
                      </div>
                      <h4 className="mt-2 text-base font-semibold text-white">{track.title}</h4>
                      <p className="mt-2 text-sm text-slate-300">{track.summary}</p>
                      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-blue-200">
                        {isExpanded ? "Collapse details" : "Expand details"}
                      </p>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key={`${track.id}-details`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 border-t border-slate-800 pt-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300">Current Focus</p>
                            <p className="mt-2 text-sm text-slate-300">{track.focus}</p>
                            <div className="mt-3 space-y-2">
                              {track.deliverables.map((deliverable) => (
                                <p key={deliverable} className="rounded-lg border border-slate-800 bg-black/35 px-3 py-2 text-xs text-slate-200">
                                  {deliverable}
                                </p>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Buyer Journey Timeline</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {launchTimelinePhases.map((phase) => {
                  const isDimmed = activeStage !== "All" && activeStage !== phase.phase;
                  return (
                    <span
                      key={`${phase.quarter}-${phase.phase}`}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        isDimmed
                          ? "border-slate-700 bg-slate-950/60 text-slate-400"
                          : "border-blue-500/40 bg-blue-500/15 text-blue-200"
                      }`}
                    >
                      {phase.quarter} {phase.label}
                    </span>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a
                  href="mailto:felix@felixcrego.com?subject=BuildVora%20Client%20Acquisition%20Strategy%20Call"
                  className="rounded-xl border border-blue-400/45 bg-blue-500/20 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-blue-100 transition hover:bg-blue-500/30"
                >
                  Book Strategy Call
                </a>
                <a
                  href="mailto:felix@felixcrego.com?subject=Send%20BuildVora%20Acquisition%20Audit"
                  className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-blue-400/40 hover:text-blue-100"
                >
                  Request Acquisition Audit
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{ y: panelY }}
            initial={{ opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-3xl border border-blue-500/45 bg-slate-950/70 p-4 shadow-[0_0_70px_rgba(59,130,246,0.25)]"
          >
            <div className="pointer-events-none absolute inset-x-8 top-10 h-32 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative h-[28rem] overflow-hidden rounded-2xl border border-slate-800 md:h-[34rem]">
              <VoraAvatarImage src={image} alt="Vora launch mode visual" fit="cover" variant={variant} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <motion.div
                animate={{ opacity: [0.45, 0.95, 0.45] }}
                transition={{ duration: 2.3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute right-3 top-3 z-20 w-44 rounded-xl border border-blue-400/45 bg-black/45 p-3 backdrop-blur"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Growth Milestones</p>
                <div className="mt-2 space-y-2 text-[11px] text-slate-200">
                  <p>Week 1: Capture Funnel Live</p>
                  <p>Week 2: Nurture System Active</p>
                  <p>Week 3: Closing Pipeline Optimized</p>
                </div>
              </motion.div>
              <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-slate-700 bg-black/55 p-3 backdrop-blur">
                <p className="text-sm text-slate-200">
                  Vora acquisition mode aligns content, offer positioning, and conversion mechanics so every page contributes to qualified lead generation.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
