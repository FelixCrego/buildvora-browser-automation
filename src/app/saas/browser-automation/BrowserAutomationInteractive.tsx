"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

type Audience = {
  value: string;
  label: string;
  headline: string;
  summary: string;
  systems: string;
  volume: string;
  guardrails: string;
};

const audiences: Audience[] = [
  {
    value: "legal",
    label: "For legal teams",
    headline: "Browser workflows that respect review, timing, and client trust.",
    summary: "Built for intake, portal work, follow-up, document collection, and the repetitive browser tasks high-cost legal teams should not be doing by hand.",
    systems: "Intake portal, Gmail, Clio, CRM",
    volume: "180 workflow actions per week",
    guardrails: "Approval before submissions, edits, or outbound communication.",
  },
  {
    value: "healthcare",
    label: "For healthcare teams",
    headline: "Administrative browser work, handled with more control.",
    summary: "Designed for scheduling, payer portals, follow-up, and operational browser tasks where consistency matters and mistakes create downstream friction.",
    systems: "Scheduling platform, Gmail, payer portal, CRM",
    volume: "320 workflow actions per week",
    guardrails: "Approval before patient-facing messaging or sensitive account changes.",
  },
  {
    value: "finance",
    label: "For finance teams",
    headline: "Fast execution with human control still intact.",
    summary: "Structured for monitoring, dashboard checks, alert prep, and repeated browser work where speed matters but trust still has to stay in the loop.",
    systems: "Broker dashboard, research portal, Gmail, internal tracker",
    volume: "500 workflow actions per week",
    guardrails: "No irreversible action without explicit operator approval.",
  },
];

const principles = [
  {
    title: "Real browser execution",
    text: "The work happens inside the same browser surfaces your team already uses.",
  },
  {
    title: "Human approval where it matters",
    text: "Sensitive steps can pause before messages, submissions, edits, or account changes.",
  },
  {
    title: "Verification after action",
    text: "The system checks for the resulting state, not just whether a click happened.",
  },
];

const detailRows = [
  {
    title: "Private by default",
    text: "Positioned for firms that value calm, controlled execution over loud automation promises.",
  },
  {
    title: "Designed for expensive labor",
    text: "Best fit when high-value people are spending time on repetitive browser work.",
  },
  {
    title: "Built for multiple niches",
    text: "Works across law, healthcare, finance, operations, and other browser-heavy teams.",
  },
  {
    title: "Deployed like infrastructure",
    text: "The offer is closer to an operating layer than a lightweight plug-in or gimmick tool.",
  },
];

const faqs = [
  {
    question: "What kind of workflows fit best?",
    answer:
      "Repeated browser tasks with clear business value: intake, dashboard checks, inbox handling, portal updates, and multi-step administrative execution.",
  },
  {
    question: "Can approvals be required before sensitive actions?",
    answer:
      "Yes. Approval checkpoints can be inserted wherever your team needs a human in the loop.",
  },
  {
    question: "Is this only for one industry?",
    answer:
      "No. The page is being positioned to appeal to lawyers, doctors, traders, operators, and other teams with valuable browser-based work.",
  },
];

function SectionLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        secondary
          ? "inline-flex rounded-full bg-[#f5f5f7] px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-[#ebebef]"
          : "inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0077ed]"
      }
    >
      {children}
    </a>
  );
}

export default function BrowserAutomationInteractive() {
  const [audienceType, setAudienceType] = useState(audiences[0].value);
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [systems, setSystems] = useState(audiences[0].systems);
  const [volume, setVolume] = useState(audiences[0].volume);
  const [guardrails, setGuardrails] = useState(audiences[0].guardrails);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedAudience = audiences.find((item) => item.value === audienceType) ?? audiences[0];

  const promptPack = useMemo(
    () => `You are helping me scope a browser automation workflow for BuildVora.

Audience: ${selectedAudience.label}
Company: ${company || "[company]"}
Contact: ${contactName || "[contact name]"}
Primary business objective: ${goal || "[describe the business result]"}
Systems involved: ${systems || "[systems]"}
Expected weekly volume: ${volume || "[volume]"}
Guardrails and approvals: ${guardrails || "[guardrails]"}

Return:
1. The browser workflow in sequence.
2. Required inputs and access.
3. Human approval checkpoints.
4. Verification checks after each critical step.
5. Failure risks and fallback handling.
6. The cleanest rollout path.`,
    [company, contactName, goal, guardrails, selectedAudience.label, systems, volume],
  );

  const handleAudienceChange = (audience: Audience) => {
    setAudienceType(audience.value);
    setSystems(audience.systems);
    setVolume(audience.volume);
    setGuardrails(audience.guardrails);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptPack);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setStatus("Clipboard access failed. You can still copy the prompt manually.");
    }
  };

  const handleDownload = () => {
    setStatus(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/automation-brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company,
            contactName,
            email,
            automationType: audienceType,
            selectedPlan: selectedAudience.label,
            goal,
            systems,
            volume,
            guardrails,
            promptPack,
          }),
        });

        if (!response.ok) {
          const error = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(error?.message ?? "The automation brief could not be generated.");
        }

        const blob = await response.blob();
        const disposition = response.headers.get("content-disposition");
        const filenameMatch = disposition?.match(/filename=\"?([^\"]+)\"?/i);
        const filename = filenameMatch?.[1] ?? "buildvora-automation-brief.json";
        const blobUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(blobUrl);
        setStatus("Architecture brief downloaded.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unexpected error generating the automation brief.");
      }
    });
  };

  return (
    <main className="bg-white text-slate-950">
      <section className="bg-white px-6 pb-18 pt-16 md:px-10 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-medium text-[#0071e3]">BuildVora Browser Automation</p>
          <h1 className="editorial mx-auto mt-4 max-w-5xl text-[clamp(3.2rem,7vw,6.6rem)] leading-[0.94] tracking-[-0.04em] text-slate-950">
            Browser work.
            <span className="block text-slate-500">Handled with more control.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-[1.2rem] leading-relaxed text-slate-600 md:text-[1.4rem]">
            For firms where trust, speed, and accuracy matter. Built for lawyers, doctors, traders, and teams with
            expensive browser-based work.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <SectionLink href="#brief">Request architecture brief</SectionLink>
            <SectionLink href="#proof" secondary>
              See how it works
            </SectionLink>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#f5f5f7] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6">
          <div className="overflow-hidden rounded-[2rem] bg-black">
            <div className="flex items-center gap-2 px-5 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>
            <div className="relative aspect-[1.8/1]">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover object-center"
              >
                <source src="/videos/browser-automation-hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] px-6 py-18 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="editorial text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98] tracking-[-0.04em] text-slate-950">
            Clean enough to feel premium.
            <span className="block text-slate-500">Structured enough to feel credible.</span>
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
          {audiences.map((audience) => {
            const isActive = selectedAudience.value === audience.value;
            return (
              <button
                key={audience.value}
                type="button"
                onClick={() => handleAudienceChange(audience)}
                className={`rounded-[2rem] p-8 text-left transition ${
                  isActive
                    ? "bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                    : "bg-transparent hover:bg-white hover:shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
                }`}
              >
                <p className="text-sm font-medium text-[#0071e3]">{audience.label}</p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{audience.headline}</h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">{audience.summary}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section id="proof" className="bg-white px-6 py-18 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="editorial text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98] tracking-[-0.04em] text-slate-950">
              Real browser proof.
              <span className="block text-slate-500">No decorative fiction.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
              The work is shown inside actual browser surfaces, because that creates more trust than generic product art.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[2.5rem] bg-[#f5f5f7] p-4 md:p-5">
              <div className="relative aspect-[1.18/1] overflow-hidden rounded-[2rem] bg-black">
                <Image
                  src="/browser-automation-stills/still-05.jpg"
                  alt="Controlled browser execution"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-8">
              {principles.map((item) => (
                <div key={item.title}>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{item.title}</h3>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-18 text-white md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="editorial text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.98] tracking-[-0.04em] text-white">
              Built for work where mistakes are expensive.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/68">
              This is not a consumer gadget and it should not feel like one. It should feel quiet, capable, and under control.
            </p>
          </div>

          <div className="mt-14 divide-y divide-white/12">
            {detailRows.map((row) => (
              <div key={row.title} className="grid gap-4 py-8 md:grid-cols-[0.72fr_1fr] md:items-start">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{row.title}</h3>
                <p className="max-w-2xl text-base leading-relaxed text-white/68">{row.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="brief" className="bg-[#fbfbfd] px-6 py-18 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="editorial text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98] tracking-[-0.04em] text-slate-950">
              Scope the workflow.
              <span className="block text-slate-500">Leave with something useful.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2.5rem] bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Company
                  <input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Contact name
                  <input
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]"
                  />
                </label>
              </div>

              <label className="mt-4 block text-sm text-slate-600">
                Work email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]"
                />
              </label>

              <label className="mt-4 block text-sm text-slate-600">
                Primary business objective
                <textarea
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  rows={4}
                  placeholder="Describe the browser-heavy workflow and the result you want."
                  className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]"
                />
              </label>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Systems involved
                  <input
                    value={systems}
                    onChange={(event) => setSystems(event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Expected volume
                  <input
                    value={volume}
                    onChange={(event) => setVolume(event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]"
                  />
                </label>
              </div>

              <label className="mt-4 block text-sm text-slate-600">
                Guardrails and approvals
                <textarea
                  value={guardrails}
                  onChange={(event) => setGuardrails(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]"
                />
              </label>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0077ed]"
                >
                  {copyState === "copied" ? "Prompt copied" : "Copy ChatGPT prompt"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDownload}
                  className="inline-flex rounded-full bg-[#f5f5f7] px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-[#ebebef] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? "Generating..." : "Download architecture brief"}
                </button>
                <a
                  href="https://chatgpt.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-[#f5f5f7] px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-[#ebebef]"
                >
                  Open ChatGPT
                </a>
              </div>

              {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
            </div>

            <div className="rounded-[2.5rem] bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
              <p className="text-sm font-medium text-[#0071e3]">{selectedAudience.label}</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{selectedAudience.headline}</h3>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{selectedAudience.summary}</p>

              <div className="mt-8 space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-950">Systems</p>
                  <p className="mt-2 text-base text-slate-600">{systems}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Expected volume</p>
                  <p className="mt-2 text-base text-slate-600">{volume}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Guardrails</p>
                  <p className="mt-2 text-base text-slate-600">{guardrails}</p>
                </div>
              </div>

              <pre className="mt-8 overflow-x-auto rounded-[1.75rem] bg-[#f5f5f7] p-5 text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                {promptPack}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-18 text-white md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <p className="text-sm font-medium text-[#2997ff]">Signed client product</p>
              <h2 className="editorial mt-4 text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.98] tracking-[-0.04em] text-white">
                After the brief, the product becomes a workspace.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/68">
                The file is the intake artifact. The real deliverable is a provisioned client workspace with runnable workflows,
                approvals, evidence, connections, and credits-based execution.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/workspace/browser-automation"
                className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:border-[#2997ff]/40 hover:bg-[#2997ff]/10"
              >
                <p className="text-sm font-medium text-[#2997ff]">Client workspace</p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Run provisioned automation</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/68">
                  Launch workflows, release approvals, track credit burn, and review execution evidence.
                </p>
              </Link>
              <Link
                href="/admin/browser-automation"
                className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:border-white/22 hover:bg-white/10"
              >
                <p className="text-sm font-medium text-white/74">BuildVora admin</p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Monitor accounts and runs</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/68">
                  Internal control plane for provisioning, approval pressure, connection health, and billing posture.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-18 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="editorial text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.98] tracking-[-0.04em] text-slate-950">
            A cleaner page.
            <span className="block text-slate-500">A stronger signal.</span>
          </h2>
          <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-[2rem] bg-[#f5f5f7] p-6">
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={handleDownload}
              className="inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Generating..." : "Download architecture brief"}
            </button>
            <Link
              href="/maisp"
              className="inline-flex rounded-full bg-[#f5f5f7] px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-[#ebebef]"
            >
              Request managed deployment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
