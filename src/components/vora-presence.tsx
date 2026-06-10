"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const poses = [
  "/vora-robot-poses/vora-pose-wave.png",
  "/vora-robot-poses/vora-pose-point.png",
  "/vora-robot-poses/vora-pose-arms-crossed.png",
  "/vora-robot-poses/vora-pose-hologram.png",
];

const voraByPage: Record<
  string,
  {
    label: string;
    message: string;
    ctaLabel: string;
    ctaHref: string;
    pose: number;
    ring: string;
  }
> = {
  "/": {
    label: "Home Navigator",
    message: "Scroll to move from intelligence layer into products, platform signals, and proof.",
    ctaLabel: "Investor Overview",
    ctaHref: "/investors",
    pose: 2,
    ring: "border-blue-500/40 shadow-[0_0_42px_rgba(59,130,246,0.26)]",
  },
  "/our-story": {
    label: "Story Guide",
    message: "Open the timeline and manifesto blocks to see how BuildVora evolved.",
    ctaLabel: "Investor Lens",
    ctaHref: "/investors",
    pose: 0,
    ring: "border-blue-400/45 shadow-[0_0_42px_rgba(59,130,246,0.3)]",
  },
  "/investors": {
    label: "Capital Assistant",
    message: "Switch scenario presets to stress-test capital deployment in real time.",
    ctaLabel: "SaaS Portfolio",
    ctaHref: "/#products",
    pose: 3,
    ring: "border-cyan-300/40 shadow-[0_0_42px_rgba(34,211,238,0.25)]",
  },
  "/careers": {
    label: "Careers Navigator",
    message: "Explore the roles aligned with product execution and AI-native delivery.",
    ctaLabel: "Our Story",
    ctaHref: "/our-story",
    pose: 1,
    ring: "border-indigo-300/40 shadow-[0_0_42px_rgba(129,140,248,0.26)]",
  },
  "/products": {
    label: "Product Navigator",
    message: "Compare category fit, workflow depth, and outcome profile across the full portfolio.",
    ctaLabel: "Case Studies",
    ctaHref: "/case-studies",
    pose: 1,
    ring: "border-cyan-300/40 shadow-[0_0_42px_rgba(34,211,238,0.25)]",
  },
  "/platform": {
    label: "Platform Guide",
    message: "Use this page to understand shared architecture, lifecycle standards, and execution consistency.",
    ctaLabel: "Products",
    ctaHref: "/products",
    pose: 0,
    ring: "border-blue-400/40 shadow-[0_0_42px_rgba(59,130,246,0.28)]",
  },
  "/maisp": {
    label: "MAISP Guide",
    message: "Tune the assessment controls to model readiness, implementation velocity, and efficiency upside.",
    ctaLabel: "Case Studies",
    ctaHref: "/case-studies",
    pose: 3,
    ring: "border-cyan-300/40 shadow-[0_0_42px_rgba(34,211,238,0.27)]",
  },
  "/case-studies": {
    label: "Case Study Index",
    message: "Select a product story and evaluate the implementation pattern and measurable impact.",
    ctaLabel: "Products",
    ctaHref: "/products",
    pose: 3,
    ring: "border-indigo-300/40 shadow-[0_0_40px_rgba(129,140,248,0.24)]",
  },
};

export default function VoraPresence() {
  const pathname = usePathname();
  const [poseIndex, setPoseIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [activeSectionTitle, setActiveSectionTitle] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setPoseIndex((prev) => (prev + 1) % poses.length);
    }, 2300);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getSectionTitle = (section: Element) => {
      const heading = section.querySelector("h1, h2, h3");
      return heading?.textContent?.trim() ?? "";
    };

    const onScroll = () => {
      const sections = Array.from(document.querySelectorAll("main section"));
      if (!sections.length) {
        const fallbackHeading = document.querySelector("main h1, main h2, main h3");
        setActiveSectionTitle(fallbackHeading?.textContent?.trim() ?? "");
        return;
      }

      const center = window.innerHeight * 0.45;
      let bestTitle = "";
      let bestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(center - sectionCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestTitle = getSectionTitle(section);
        }
      });

      setActiveSectionTitle(bestTitle);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const resolvePageProfile = () => {
    if (voraByPage[pathname]) return voraByPage[pathname];
    if (pathname.startsWith("/saas/")) {
      return {
        label: "Product Guide",
        message: "Review category fit, workflow depth, and measurable operating benefits for this product.",
        ctaLabel: "All Products",
        ctaHref: "/#products",
        pose: 1,
        ring: "border-cyan-300/40 shadow-[0_0_40px_rgba(34,211,238,0.23)]",
      };
    }
    if (pathname === "/case-studies" || pathname.startsWith("/case-studies/")) {
      return {
        label: "Case Study Lens",
        message: "Map implementation steps to outcomes and evaluate repeatability across related verticals.",
        ctaLabel: "Portfolio",
        ctaHref: "/#products",
        pose: 0,
        ring: "border-indigo-300/40 shadow-[0_0_40px_rgba(129,140,248,0.24)]",
      };
    }
    if (pathname === "/upcoming-projects") {
      return {
        label: "Launch Scout",
        message: "Track which concepts are nearest to validation and where execution leverage is strongest.",
        ctaLabel: "Careers",
        ctaHref: "/careers",
        pose: 3,
        ring: "border-emerald-300/40 shadow-[0_0_40px_rgba(52,211,153,0.22)]",
      };
    }
    return {
      label: "System Agent Signal",
      message: "I am active across this page to keep BuildVora's operational workflow connected.",
      ctaLabel: "Our Story",
      ctaHref: "/our-story",
      pose: 2,
      ring: "border-blue-500/35 shadow-[0_0_35px_rgba(59,130,246,0.24)]",
    };
  };

  const current = resolvePageProfile() ?? {
    label: "System Agent Signal",
    message: "I am active across this page to keep BuildVora's operational workflow connected.",
    ctaLabel: "Our Story",
    ctaHref: "/our-story",
    pose: 2,
    ring: "border-blue-500/35 shadow-[0_0_35px_rgba(59,130,246,0.24)]",
  };

  const getSectionGuidance = (sectionTitle: string) => {
    const title = sectionTitle.toLowerCase();
    if (!title) return current.message;

    if (pathname === "/") {
      if (title.includes("build fast") || title.includes("signal") || title.includes("scale")) return "This hero frames the platform thesis; use it as the decision anchor for everything below.";
      if (title.includes("launch mode")) return "These tracks show near-term build momentum and where product expansion is focused.";
      if (title.includes("platform advantage")) return "This section explains the operating leverage behind the portfolio, not just features.";
      if (title.includes("product portfolio")) return "Review breadth here, then open any product page for depth and execution specifics.";
      if (title.includes("voice") || title.includes("operators")) return "These proof points reflect how teams experience the system in real operating contexts.";
    }

    if (pathname === "/our-story") {
      if (title.includes("mission") || title.includes("vision")) return "This is the philosophy layer. Match it to product decisions, not just brand language.";
      if (title.includes("evolution") || title.includes("timeline")) return "Use this section to understand how BuildVora scaled from execution systems to platform architecture.";
      if (title.includes("operating model")) return "This is the core framework: acquisition signals, execution infrastructure, revenue ops, and AI decision support.";
      if (title.includes("execution proof")) return "These signals show where the system is strongest and where future leverage compounds.";
      if (title.includes("build with")) return "This is the action point. Move from strategy into investor, team, or execution conversations.";
    }

    if (pathname === "/investors") {
      if (title.includes("investor lab") || title.includes("capital intelligence")) return "Start here: set your thesis with presets, then evaluate utilization and concentration signals.";
      if (title.includes("outcome simulator")) return "Adjust capital, horizon, and multiple assumptions to stress-test your expected portfolio profile.";
      if (title.includes("investment calculator")) return "Tune per-project allocation and risk to identify where upside is strongest versus risk load.";
      if (title.includes("capital strategy") || title.includes("diligence")) return "Use these blocks as your diligence checklist before committing additional deployment.";
    }

    if (pathname === "/careers") {
      if (title.includes("roles") || title.includes("openings")) return "Focus on roles closest to system execution and measurable product outcomes.";
      if (title.includes("culture") || title.includes("principles")) return "This section explains how teams operate under delivery pressure, not just values on paper.";
      if (title.includes("process")) return "Expect a build-first evaluation process with practical scenario thinking.";
    }

    if (pathname === "/platform") {
      if (title.includes("system control")) return "Use this control plane to inspect how each architecture layer contributes to execution speed.";
      if (title.includes("execution loop")) return "This sequence is the core operator cadence from signal intake to compounding improvements.";
      if (title.includes("operating mode")) return "Switch modes to see how priorities shift between acquisition, conversion, and scale.";
      if (title.includes("reliability") || title.includes("governance")) return "These standards keep quality stable as products and teams scale.";
      if (title.includes("integration blueprint")) return "This is the stack contract that keeps every product aligned under one system architecture.";
    }

    if (pathname === "/maisp") {
      if (title.includes("managed ai")) return "This hero defines the MAISP operating promise: implementation, maintenance, and measurable efficiency.";
      if (title.includes("configure your business context")) return "Set your exact business profile to move from generic advice to a tailored AI operating strategy.";
      if (title.includes("personalized assessment output")) return "These outputs are dynamic. Change systems, maturity, or pain points to model realistic execution scenarios.";
      if (title.includes("rollout blueprint")) return "Use this roadmap to align owners, timelines, and KPI targets before implementation starts.";
    }

    if (pathname.startsWith("/saas/")) {
      if (title.includes("overview") || title.includes("product")) return "Start with product positioning, then move into workflow and feature execution depth.";
      if (title.includes("ai") || title.includes("leverage")) return "Validate that AI here improves operator decisions and execution speed.";
      if (title.includes("benefits") || title.includes("impact")) return "Tie these outcomes directly to team KPIs before evaluating expansion fit.";
    }

    if (pathname === "/case-studies" || pathname.startsWith("/case-studies/")) {
      if (title.includes("challenge")) return "Use this to understand the pre-implementation constraint clearly.";
      if (title.includes("implementation")) return "These steps are the repeatability pattern to test across other verticals.";
      if (title.includes("outcomes")) return "Prioritize measurable outcomes that show true operating delta.";
      if (title.includes("navigator") || title.includes("all case studies")) return "Use filters and spotlight to compare patterns before opening full case studies.";
    }

    return `Active section: ${sectionTitle}`;
  };

  const sectionMessage = getSectionGuidance(activeSectionTitle);
  const activePose = poses[(current.pose + poseIndex) % poses.length];

  return (
    <div className="pointer-events-none fixed bottom-4 right-3 z-40 md:bottom-7 md:right-6">
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [0, -1.2, 1.1, 0] }}
        transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="pointer-events-auto flex items-end gap-3"
      >
        {expanded && (
          <div className="max-w-[12rem] rounded-2xl border border-slate-700 bg-black/78 p-3 backdrop-blur md:max-w-[16rem]">
            <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">{current.label}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">{sectionMessage}</p>
            {activeSectionTitle ? (
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">Now Viewing: {activeSectionTitle}</p>
            ) : null}
            <Link
              href={current.ctaHref}
              className="mt-3 inline-flex rounded-full border border-blue-500/45 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-blue-200 transition hover:border-blue-300 hover:text-blue-100"
            >
              {current.ctaLabel}
            </Link>
          </div>
        )}

        <div className={`relative h-24 w-24 rounded-2xl border bg-slate-950/78 p-1 md:h-28 md:w-28 ${current.ring}`}>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="absolute -left-2 -top-2 z-10 rounded-full border border-blue-500/40 bg-black/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-blue-200"
          >
            {expanded ? "Hide" : "Show"}
          </button>
          <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-700 bg-black/55">
            <Image src={activePose} alt="Vora presence" fill sizes="112px" className="object-cover object-top" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
