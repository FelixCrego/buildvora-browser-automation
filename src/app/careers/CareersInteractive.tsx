"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type RoleType = "Full-Time" | "Contract" | "Internship";

type Role = {
  id: string;
  title: string;
  team: "Engineering" | "AI & Data" | "Product" | "Growth" | "Operations";
  location: "Remote (US)" | "Remote (Global)" | "Hybrid (Miami)";
  type: RoleType;
  level: "Senior" | "Mid-Level" | "Lead";
  openings: number;
  summary: string;
  impact: string;
  stack: string[];
};

const roles: Role[] = [
  {
    id: "staff-product-engineer",
    title: "Staff Product Engineer",
    team: "Engineering",
    location: "Remote (US)",
    type: "Full-Time",
    level: "Lead",
    openings: 1,
    summary: "Own full-stack product surfaces across BuildVora's CRM and investor products.",
    impact: "Ship cross-product architecture decisions that reduce build time by 30%+.",
    stack: ["Next.js", "TypeScript", "Postgres", "Vercel", "Design Systems"],
  },
  {
    id: "ai-automation-engineer",
    title: "AI Automation Engineer",
    team: "AI & Data",
    location: "Remote (Global)",
    type: "Full-Time",
    level: "Senior",
    openings: 2,
    summary: "Design and productionize multi-step AI workflows for operations and growth use cases.",
    impact: "Create reusable automation primitives used by every SaaS property in the portfolio.",
    stack: ["Python", "LLM APIs", "Vector Search", "n8n", "Evaluation Pipelines"],
  },
  {
    id: "product-designer",
    title: "Senior Product Designer",
    team: "Product",
    location: "Remote (US)",
    type: "Full-Time",
    level: "Senior",
    openings: 1,
    summary: "Craft high-conversion product UX for operators, sales teams, and investor workflows.",
    impact: "Define a unified interface language across 10+ products without losing vertical specificity.",
    stack: ["Figma", "Design Tokens", "Interaction Design", "Usability Testing", "Prototyping"],
  },
  {
    id: "growth-systems-operator",
    title: "Growth Systems Operator",
    team: "Growth",
    location: "Remote (Global)",
    type: "Contract",
    level: "Mid-Level",
    openings: 2,
    summary: "Run experiments across outbound, content, and funnel optimization using our AI toolchain.",
    impact: "Increase qualified pipeline velocity across our internal and client-facing SaaS platforms.",
    stack: ["Lifecycle Marketing", "CRO", "Analytics", "SEO", "Automation"],
  },
  {
    id: "ops-program-manager",
    title: "Operations Program Manager",
    team: "Operations",
    location: "Hybrid (Miami)",
    type: "Full-Time",
    level: "Senior",
    openings: 1,
    summary: "Coordinate execution across engineering, GTM, and investor milestone delivery.",
    impact: "Drive on-time launches and portfolio-level operating cadence.",
    stack: ["Program Ops", "Roadmapping", "Stakeholder Management", "KPI Reporting", "Execution Rhythms"],
  },
  {
    id: "product-engineering-intern",
    title: "Product Engineering Intern",
    team: "Engineering",
    location: "Remote (US)",
    type: "Internship",
    level: "Mid-Level",
    openings: 1,
    summary: "Contribute to production features with mentorship from senior product engineers.",
    impact: "Ship meaningful user-facing work in your first month.",
    stack: ["React", "TypeScript", "API Integration", "QA", "Feature Delivery"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const cardIn = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1 },
};

const teams = ["All", ...new Set(roles.map((role) => role.team))];
const locations = ["All", ...new Set(roles.map((role) => role.location))];
const roleTypes = ["All", ...new Set(roles.map((role) => role.type))];

export default function CareersInteractive() {
  const [activeTeam, setActiveTeam] = useState<string>("All");
  const [activeLocation, setActiveLocation] = useState<string>("All");
  const [activeType, setActiveType] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) => {
        const teamMatch = activeTeam === "All" || role.team === activeTeam;
        const locationMatch = activeLocation === "All" || role.location === activeLocation;
        const typeMatch = activeType === "All" || role.type === activeType;
        const queryMatch =
          query.trim().length === 0 ||
          `${role.title} ${role.summary} ${role.stack.join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        return teamMatch && locationMatch && typeMatch && queryMatch;
      }),
    [activeLocation, activeTeam, activeType, query],
  );

  const totalOpenings = roles.reduce((sum, role) => sum + role.openings, 0);

  return (
    <main className="bg-black text-slate-100">
      <section className="mesh-bg relative isolate overflow-hidden border-b border-slate-900">
        <div className="pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full bg-blue-500/18 blur-3xl" />
        <div className="pointer-events-none absolute left-[14%] top-0 h-80 w-28 rotate-12 bg-cyan-400/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 pt-20 md:px-10 md:pb-20 md:pt-24 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <Link href="/" className="text-xs uppercase tracking-[0.2em] text-blue-300 hover:text-blue-200">
              Back To Home
            </Link>
            <p className="mt-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
              Careers Command Hub
            </p>
            <h1 className="editorial mt-4 text-4xl text-white md:text-6xl">Build AI Systems That Actually Ship</h1>
            <p className="mt-5 max-w-3xl text-slate-300">
              Join a high-output team building AI-native SaaS products across CRM, growth, automation, underwriting,
              and investor intelligence.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <MetricChip label="Open Roles" value={`${roles.length}`} />
              <MetricChip label="Openings" value={`${totalOpenings}`} />
              <MetricChip label="Remote-First" value="Yes" />
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={cardIn}
            className="rounded-3xl border border-blue-500/30 bg-slate-950/72 p-6 shadow-[0_0_65px_rgba(59,130,246,0.2)]"
          >
            <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Why Join BuildVora</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">Ship production code weekly, not quarterly.</li>
              <li className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">Work directly on products used by real operators.</li>
              <li className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">Own outcomes across product, AI, and business impact.</li>
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#02050d] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-4xl"
          >
            Open Roles Navigator
          </motion.h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Filter by team, location, and role type to find where you can contribute the most leverage.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/72 p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <label className="block rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
                <span className="tech text-[11px] uppercase tracking-[0.18em] text-blue-300">Search Roles</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Product engineer, AI workflows, design systems..."
                  className="mt-2 w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
              </label>
              <div className="rounded-xl border border-blue-500/35 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                Showing <span className="font-semibold text-white">{filteredRoles.length}</span> of {roles.length} roles
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <FilterPills label="Team" options={teams} value={activeTeam} onChange={setActiveTeam} />
              <FilterPills label="Location" options={locations} value={activeLocation} onChange={setActiveLocation} />
              <FilterPills label="Type" options={roleTypes} value={activeType} onChange={setActiveType} />
            </div>
          </div>

          <div className="mt-7 grid gap-5 xl:grid-cols-2">
            {filteredRoles.map((role, idx) => (
              <motion.article
                key={role.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                variants={cardIn}
                transition={{ duration: 0.35, delay: idx * 0.025 }}
                className="rounded-2xl border border-slate-800 bg-black/62 p-5 transition hover:border-blue-500/45 hover:shadow-[0_0_55px_rgba(59,130,246,0.14)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{role.title}</h3>
                    <p className="mt-1 text-sm text-blue-300">
                      {role.team} • {role.location}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {role.level}
                    </span>
                    <span className="rounded-full border border-blue-500/35 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-200">
                      {role.type}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">{role.summary}</p>
                <p className="mt-3 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
                  <span className="tech mr-2 text-[10px] uppercase tracking-[0.16em] text-blue-300">Impact</span>
                  {role.impact}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {role.stack.map((item) => (
                    <span
                      key={`${role.id}-${item}`}
                      className="rounded-full border border-slate-700 bg-slate-950/75 px-3 py-1 text-xs text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">{role.openings} opening(s)</p>
                  <a
                    href={`mailto:hello@felixcrego.com?subject=BuildVora%20Careers%20-%20${encodeURIComponent(role.title)}`}
                    className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
                  >
                    Apply To This Role
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#03060d] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/72 p-6">
            <h3 className="text-lg font-semibold text-white">Interview Flow</h3>
            <ol className="mt-4 space-y-2 text-sm text-slate-300">
              <li>1. Intro call with hiring lead</li>
              <li>2. Practical role-focused challenge</li>
              <li>3. Team systems and execution interview</li>
              <li>4. Final scope and ownership alignment</li>
            </ol>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/72 p-6">
            <h3 className="text-lg font-semibold text-white">What We Value</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Clear systems thinking</li>
              <li>Bias toward shipping</li>
              <li>Ownership of measurable outcomes</li>
              <li>Cross-functional communication strength</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/72 p-6">
            <h3 className="text-lg font-semibold text-white">Benefits Snapshot</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Remote-first collaboration</li>
              <li>Performance-based compensation growth</li>
              <li>High-autonomy role design</li>
              <li>Direct exposure to product + investor strategy</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-blue-500/25 bg-slate-950/70 p-8">
          <h2 className="editorial text-3xl text-white md:text-4xl">Don&apos;t See The Right Role?</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Send us your profile, what you build best, and where you can drive leverage. We hire for elite operators
            even before a formal listing opens.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:hello@felixcrego.com?subject=BuildVora%20Careers%20General%20Application"
              className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Submit General Application
            </a>
            <Link
              href="/investors"
              className="inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              View Investor Workspace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-black/45 p-3">
      <p className="tech text-[11px] uppercase tracking-[0.18em] text-blue-300">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={`${label}-${option}`}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-blue-400 bg-blue-500/20 text-blue-100"
                  : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-blue-500/40 hover:text-blue-200"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 backdrop-blur">
      <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

