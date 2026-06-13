import { ConsoleShell } from "@/components/browser-automation-console";
import { canAccessAdmin, getWorkspaceSession } from "@/lib/browserAutomationAuth";
import { redirect } from "next/navigation";

const navLinks = [
  { href: "/admin/browser-automation", label: "Dashboard", hint: "Queue pressure, incidents, worker health, and commercial posture." },
  { href: "/admin/browser-automation/accounts", label: "Accounts", hint: "Tenant status, plan controls, concurrency, and renewal posture." },
  { href: "/admin/browser-automation/workflows", label: "Workflows", hint: "Drafts, published versions, approval policies, and release state." },
  { href: "/admin/browser-automation/runs", label: "Runs", hint: "Queue lanes, run states, retry controls, and worker assignment." },
  { href: "/admin/browser-automation/approvals", label: "Approvals", hint: "Approval backlog, expiring gates, and role-based release pressure." },
  { href: "/admin/browser-automation/credits", label: "Credits", hint: "Ledger events, holds, debits, refunds, and overage posture." },
  { href: "/admin/browser-automation/economics", label: "Economics", hint: "Run margin, account unit economics, and pricing guardrails." },
  { href: "/admin/browser-automation/connections", label: "Connections", hint: "Credential health, rotation windows, and environment scope." },
  { href: "/admin/browser-automation/workers", label: "Workers", hint: "Worker runtime health, queue depth, and browser pool status." },
  { href: "/admin/browser-automation/diagnostics", label: "Diagnostics", hint: "Launch readiness, environment posture, and live health." },
  { href: "/admin/browser-automation/audit", label: "Audit", hint: "Configuration changes, approvals, incidents, and operator actions." },
];

export default async function BrowserAutomationAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getWorkspaceSession();

  if (!session) {
    redirect("/portal/client/login");
  }

  if (!canAccessAdmin(session)) {
    redirect("/portal");
  }

  return (
    <ConsoleShell
      eyebrow="Internal Operations Surface"
      title="Browser Automation Control Plane"
      summary="Operations backend for tenant controls, workflow lifecycle, queue execution, approval governance, worker health, and credits-based billing across Codex-backed browser automation."
      navTitle="BuildVora Admin"
      navLinks={navLinks}
    >
      {children}
    </ConsoleShell>
  );
}
