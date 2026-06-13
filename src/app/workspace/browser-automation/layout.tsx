import { ConsoleShell } from "@/components/browser-automation-console";
import { getWorkspaceSession, hasWorkspaceAccess } from "@/lib/browserAutomationAuth";
import { resolveWorkspaceAccount } from "@/lib/browserAutomationPortal";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navLinks = [
  {
    href: "/workspace/browser-automation",
    label: "Workspace Overview",
    hint: "Credits, active workflows, recent runs, and approval posture.",
  },
  {
    href: "/workspace/browser-automation/create",
    label: "Voice Builder",
    hint: "Talk through the workflow you want and convert it into a scoped automation plan.",
  },
  {
    href: "/portal/billing",
    label: "Billing",
    hint: "Manage the paywall, workspace plan, and credit top-ups.",
  },
  {
    href: "/workspace/browser-automation/approvals",
    label: "Approval Inbox",
    hint: "Sensitive actions that need release before the workflow continues.",
  },
  {
    href: "/workspace/browser-automation/connections",
    label: "Connections",
    hint: "Credential health and system access required for automation runs.",
  },
  {
    href: "/workspace/browser-automation/workflows/case-intake-routing",
    label: "Workflow Detail",
    hint: "Launch a provisioned workflow and review runtime guardrails.",
  },
];

export default function BrowserAutomationWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>;
}

async function WorkspaceLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getWorkspaceSession();

  if (!session) {
    redirect("/portal/client/login");
  }

  if (!hasWorkspaceAccess(session)) {
    redirect("/portal/billing");
  }

  const account = await resolveWorkspaceAccount(session);

  return (
    <ConsoleShell
      eyebrow="Signed Client Workspace"
      title={`${account.name} Automation Workspace`}
      summary="Provisioned browser automation workspace for launching approved workflows, tracking credit burn, reviewing run evidence, and releasing human checkpoints when trust policy requires it."
      navTitle="Client Workspace"
      navLinks={navLinks}
    >
      {children}
    </ConsoleShell>
  );
}
