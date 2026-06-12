import { cookies } from "next/headers";
import { getBrowserAutomationAccounts } from "@/lib/browserAutomationPortal";

export type BillingStatus = "inactive" | "trialing" | "active";

export type BrowserAutomationSession = {
  email: string;
  workspaceCode: string;
  accountSlug: string;
  billingStatus: BillingStatus;
  billingPlan: string | null;
  billingProvider: "paypal" | "demo";
  billingReferenceId: string | null;
  signedInAt: string;
};

export const SESSION_COOKIE_NAMES = {
  email: "buildvora_ba_email",
  workspaceCode: "buildvora_ba_workspace_code",
  accountSlug: "buildvora_ba_account_slug",
  billingStatus: "buildvora_ba_billing_status",
  billingPlan: "buildvora_ba_billing_plan",
  billingProvider: "buildvora_ba_billing_provider",
  billingReferenceId: "buildvora_ba_billing_reference_id",
  signedInAt: "buildvora_ba_signed_in_at",
} as const;

function normalizeWorkspaceCode(workspaceCode: string) {
  return workspaceCode.trim().toUpperCase();
}

function resolveAccountSlug(workspaceCode: string) {
  const accounts = getBrowserAutomationAccounts();
  const normalizedCode = normalizeWorkspaceCode(workspaceCode);

  if (normalizedCode.startsWith("NSC")) {
    return accounts.find((account) => account.slug === "northshore-clinics")?.slug ?? accounts[0]?.slug ?? "harbor-legal-group";
  }

  return accounts.find((account) => account.slug === "harbor-legal-group")?.slug ?? accounts[0]?.slug ?? "harbor-legal-group";
}

export function buildWorkspaceSession(input: {
  email: string;
  workspaceCode: string;
  billingStatus?: BillingStatus;
  billingPlan?: string | null;
  billingProvider?: "paypal" | "demo";
  billingReferenceId?: string | null;
}) {
  return {
    email: input.email.trim().toLowerCase(),
    workspaceCode: normalizeWorkspaceCode(input.workspaceCode),
    accountSlug: resolveAccountSlug(input.workspaceCode),
    billingStatus: input.billingStatus ?? "inactive",
    billingPlan: input.billingPlan ?? null,
    billingProvider: input.billingProvider ?? "demo",
    billingReferenceId: input.billingReferenceId ?? null,
    signedInAt: new Date().toISOString(),
  } satisfies BrowserAutomationSession;
}

export function hasWorkspaceAccess(session: BrowserAutomationSession | null) {
  return session?.billingStatus === "active" || session?.billingStatus === "trialing";
}

export async function getWorkspaceSession() {
  const cookieStore = await cookies();
  const email = cookieStore.get(SESSION_COOKIE_NAMES.email)?.value;
  const workspaceCode = cookieStore.get(SESSION_COOKIE_NAMES.workspaceCode)?.value;
  const accountSlug = cookieStore.get(SESSION_COOKIE_NAMES.accountSlug)?.value;
  const signedInAt = cookieStore.get(SESSION_COOKIE_NAMES.signedInAt)?.value;

  if (!email || !workspaceCode || !accountSlug || !signedInAt) {
    return null;
  }

  return {
    email,
    workspaceCode,
    accountSlug,
    signedInAt,
    billingStatus: (cookieStore.get(SESSION_COOKIE_NAMES.billingStatus)?.value as BillingStatus | undefined) ?? "inactive",
    billingPlan: cookieStore.get(SESSION_COOKIE_NAMES.billingPlan)?.value ?? null,
    billingProvider: (cookieStore.get(SESSION_COOKIE_NAMES.billingProvider)?.value as "paypal" | "demo" | undefined) ?? "demo",
    billingReferenceId:
      cookieStore.get(SESSION_COOKIE_NAMES.billingReferenceId)?.value ??
      cookieStore.get("buildvora_ba_stripe_customer_id")?.value ??
      null,
  } satisfies BrowserAutomationSession;
}
