import { ConsoleShell } from "@/components/browser-automation-console";

const navLinks = [
  {
    href: "/admin/browser-automation",
    label: "Control Plane",
    hint: "Accounts, queued runs, approvals, and credit posture.",
  },
  {
    href: "/admin/browser-automation/accounts/harbor-legal-group",
    label: "Harbor Legal Group",
    hint: "Inspect one customer account from onboarding through run history.",
  },
];

export default function BrowserAutomationAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConsoleShell
      eyebrow="Internal Operations Surface"
      title="Browser Automation Control Plane"
      summary="Internal admin workspace for provisioning client workflows, monitoring queued runs, handling approval pressure, and protecting margin across Codex-backed browser execution."
      navTitle="BuildVora Admin"
      navLinks={navLinks}
    >
      {children}
    </ConsoleShell>
  );
}
