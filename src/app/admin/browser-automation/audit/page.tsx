import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getAuditEvents } from "@/lib/browserAutomationPortal";

function tone(severity: string) {
  if (severity === "info") return "blue" as const;
  if (severity === "warning") return "amber" as const;
  return "red" as const;
}

export default function AdminAuditPage() {
  const events = getAuditEvents();

  return (
    <Panel title="Audit log" kicker="Operator and system history">
      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{event.event}</p>
                <p className="mt-1 text-sm text-slate-500">{event.actor} · {event.createdAt}</p>
              </div>
              <StatusPill tone={tone(event.severity)}>{event.severity}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{event.detail}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{event.target}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
