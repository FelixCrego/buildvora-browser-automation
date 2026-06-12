"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/browser-automation-console";
import {
  ConnectionInlineActions,
  RunInlineActions,
  WorkerInlineActions,
} from "@/components/browser-automation-inline-actions";
import type {
  BrowserAutomationConnection,
  BrowserAutomationRun,
  WorkerNode,
} from "@/lib/browserAutomationPortal";

function tone(status: string) {
  if (status === "completed" || status === "healthy" || status === "active") return "green" as const;
  if (status === "running") return "blue" as const;
  if (
    status === "awaiting_approval" ||
    status === "pending" ||
    status === "paused" ||
    status === "degraded" ||
    status === "needs_attention"
  ) {
    return "amber" as const;
  }
  if (status === "failed" || status === "offline" || status === "disconnected" || status === "critical") {
    return "red" as const;
  }
  return "slate" as const;
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "In progress";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function LiveRefreshControls() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      router.refresh();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [autoRefresh, router]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
        disabled={isPending}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Refreshing" : "Refresh"}
      </button>
      <button
        type="button"
        onClick={() => setAutoRefresh((current) => !current)}
        className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
          autoRefresh
            ? "border-[#0071e3]/20 bg-[#f2f8ff] text-[#0071e3]"
            : "border-slate-200 bg-white text-slate-700 hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
        }`}
      >
        Auto-refresh {autoRefresh ? "On" : "Off"}
      </button>
    </div>
  );
}

export function PortalRunOpsTable({ runs }: { runs: BrowserAutomationRun[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [lane, setLane] = useState("all");

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesQuery =
        !query ||
        [run.id, run.workflowSlug, run.requestedBy, run.summary]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesStatus = status === "all" || run.status === status;
      const matchesLane = lane === "all" || run.queueLane === lane;
      return matchesQuery && matchesStatus && matchesLane;
    });
  }, [lane, query, runs, status]);

  return (
    <div className="rounded-[1.4rem] border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#f8fafc] px-4 py-3">
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search run, workflow, operator"
            className="min-w-[220px] flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0071e3]/30"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0071e3]/30"
          >
            <option value="all">All statuses</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="awaiting_approval">Awaiting approval</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={lane}
            onChange={(event) => setLane(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0071e3]/30"
          >
            <option value="all">All lanes</option>
            <option value="priority">Priority</option>
            <option value="standard">Standard</option>
            <option value="nightly">Nightly</option>
          </select>
        </div>
        <LiveRefreshControls />
      </div>

      <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.48fr_0.48fr_0.9fr] gap-3 bg-[#f5f5f7] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        <span>Run</span>
        <span>Status</span>
        <span>Requested</span>
        <span>Credits</span>
        <span>Lane</span>
        <span>Actions</span>
      </div>
      {filteredRuns.length === 0 ? (
        <div className="px-4 py-8 text-sm text-slate-500">No runs match the current filters.</div>
      ) : (
        filteredRuns.map((run) => (
          <div key={run.id} className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.48fr_0.48fr_0.9fr] gap-3 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
            <div className="min-w-0">
              <p className="font-semibold text-slate-950">{run.id}</p>
              <p className="mt-1 truncate text-xs uppercase tracking-[0.14em] text-slate-500">{run.workflowSlug}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{run.summary}</p>
            </div>
            <div className="self-center">
              <StatusPill tone={tone(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
            </div>
            <div className="self-center">
              <p className="text-slate-950">{run.requestedBy}</p>
              <p className="mt-1 text-xs text-slate-500">{formatTimestamp(run.startedAt)}</p>
            </div>
            <div className="self-center text-slate-950">{run.actualCredits}</div>
            <div className="self-center uppercase tracking-[0.14em] text-slate-500">{run.queueLane}</div>
            <div className="self-center">
              <RunInlineActions runId={run.id} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function PortalConnectionOpsPanel({ connections }: { connections: BrowserAutomationConnection[] }) {
  const [filter, setFilter] = useState("all");

  const filteredConnections = useMemo(() => {
    return connections.filter((connection) => filter === "all" || connection.status === filter);
  }, [connections, filter]);

  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">Connection blockers</p>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-900 outline-none transition focus:border-[#0071e3]/30"
        >
          <option value="all">All</option>
          <option value="needs_attention">Needs attention</option>
          <option value="disconnected">Disconnected</option>
          <option value="healthy">Healthy</option>
        </select>
      </div>
      <div className="mt-4 grid gap-3">
        {filteredConnections.map((connection) => (
          <div key={connection.id} className="rounded-[1rem] bg-white px-4 py-3 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{connection.provider}</p>
                <p className="mt-1 text-xs text-slate-500">{connection.label}</p>
              </div>
              <StatusPill tone={tone(connection.status)}>{connection.status.replace(/_/g, " ")}</StatusPill>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{connection.environment}</span>
              <span>{connection.rotationWindow}</span>
            </div>
            <div className="mt-3">
              <ConnectionInlineActions connectionId={connection.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalWorkerOpsTable({ workers }: { workers: WorkerNode[] }) {
  const [filter, setFilter] = useState("all");

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => filter === "all" || worker.status === filter);
  }, [filter, workers]);

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-[#f8fafc] px-4 py-3">
        <p className="text-sm font-semibold text-slate-950">Worker fleet</p>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-900 outline-none transition focus:border-[#0071e3]/30"
        >
          <option value="all">All statuses</option>
          <option value="healthy">Healthy</option>
          <option value="degraded">Degraded</option>
          <option value="offline">Offline</option>
        </select>
      </div>
      <div className="grid grid-cols-[0.92fr_0.58fr_0.46fr_0.46fr_0.82fr] gap-3 bg-[#f5f5f7] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        <span>Worker</span>
        <span>Status</span>
        <span>Active</span>
        <span>Queue</span>
        <span>Actions</span>
      </div>
      {filteredWorkers.map((worker) => (
        <div key={worker.id} className="grid grid-cols-[0.92fr_0.58fr_0.46fr_0.46fr_0.82fr] gap-3 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          <div>
            <p className="font-semibold text-slate-950">{worker.label}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{worker.region} / {worker.runtime}</p>
            <p className="mt-1 text-xs text-slate-500">{formatTimestamp(worker.lastHeartbeatAt)}</p>
          </div>
          <div className="self-center">
            <StatusPill tone={tone(worker.status)}>{worker.status}</StatusPill>
          </div>
          <div className="self-center text-slate-950">{worker.activeRuns}</div>
          <div className="self-center text-slate-950">{worker.queueDepth}</div>
          <div className="self-center">
            <WorkerInlineActions workerId={worker.id} status={worker.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
