import Link from "next/link";
import { StatusPill } from "@/components/browser-automation-console";

export type WizardStep = {
  id: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  status: "complete" | "active" | "locked";
};

function tone(status: WizardStep["status"]) {
  if (status === "complete") return "green" as const;
  if (status === "active") return "blue" as const;
  return "amber" as const;
}

export default function BrowserAutomationOnboardingWizard({
  steps,
}: {
  steps: WizardStep[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
      {steps.map((step, index) => (
        <article
          key={step.id}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Step {index + 1}</p>
            <StatusPill tone={tone(step.status)}>{step.status}</StatusPill>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-950">{step.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.detail}</p>
          <Link
            href={step.href}
            className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-[#0071e3]"
          >
            {step.cta}
          </Link>
        </article>
      ))}
    </div>
  );
}
