import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getBrowserAutomationConnections } from "@/lib/browserAutomationPortal";

function tone(status: string) {
  if (status === "healthy") return "green" as const;
  if (status === "needs_attention") return "amber" as const;
  return "red" as const;
}

export default function AdminConnectionsPage() {
  const connections = getBrowserAutomationConnections();

  return (
    <Panel title="Connections and credentials" kicker="Vault and rotation controls">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
        <div className="grid grid-cols-[0.8fr_0.9fr_0.9fr_0.7fr_0.8fr_0.8fr_0.8fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
          <span>Account</span>
          <span>Provider</span>
          <span>Label</span>
          <span>Status</span>
          <span>Environment</span>
          <span>Rotation</span>
          <span>Verified</span>
        </div>
        {connections.map((connection) => (
          <div key={connection.id} className="grid grid-cols-[0.8fr_0.9fr_0.9fr_0.7fr_0.8fr_0.8fr_0.8fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            <div>{connection.accountSlug}</div>
            <div>{connection.provider}</div>
            <div>{connection.label}</div>
            <div className="self-center"><StatusPill tone={tone(connection.status)}>{connection.status.replace(/_/g, " ")}</StatusPill></div>
            <div>{connection.environment}</div>
            <div>{connection.rotationWindow}</div>
            <div>{connection.lastVerifiedAt}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
