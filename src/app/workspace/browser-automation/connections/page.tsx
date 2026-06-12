import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";
import { getAccountBySlug, getAccountConnections, getPrimaryWorkspaceAccount } from "@/lib/browserAutomationPortal";

function statusTone(status: string) {
  if (status === "healthy") return "green" as const;
  if (status === "needs_attention") return "amber" as const;
  if (status === "disconnected") return "red" as const;
  return "slate" as const;
}

export default async function BrowserAutomationConnectionsPage() {
  const session = await getWorkspaceSession();
  const account = session ? getAccountBySlug(session.accountSlug) ?? getPrimaryWorkspaceAccount() : getPrimaryWorkspaceAccount();
  const connections = getAccountConnections(account.slug);

  return (
    <div className="grid gap-6">
      <Panel title="Connections and Credentials" kicker="Execution dependencies">
        <div className="grid gap-4">
          {connections.map((connection) => (
            <article key={connection.id} className="rounded-[1.6rem] border border-white/10 bg-white/4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{connection.provider}</p>
                  <p className="mt-1 text-sm text-slate-400">{connection.label}</p>
                </div>
                <StatusPill tone={statusTone(connection.status)}>{connection.status.replace(/_/g, " ")}</StatusPill>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Scope</p>
                  <p className="mt-1">{connection.scope}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Last verified</p>
                  <p className="mt-1">{connection.lastVerifiedAt}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/18"
                >
                  Re-verify Connection
                </button>
                <button
                  type="button"
                  className="inline-flex rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/24"
                >
                  Rotate Secret
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
