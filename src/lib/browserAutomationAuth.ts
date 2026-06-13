import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getBrowserAutomationAccounts } from "@/lib/browserAutomationPortal";
import type { BrowserAutomationAccount, PlanType } from "@/lib/browserAutomationSeed";

export type BillingStatus = "inactive" | "trialing" | "active" | "past_due";

export type BrowserAutomationSession = {
  email: string;
  workspaceCode: string;
  accountSlug: string;
  accountName: string | null;
  planType: PlanType | null;
  planName: string | null;
  billingStatus: BillingStatus;
  billingPlan: string | null;
  billingProvider: "paypal" | "demo" | "coupon" | "trial";
  billingReferenceId: string | null;
  availableCredits: number | null;
  monthlyCredits: number | null;
  concurrencyLimit: number | null;
  canPublish: boolean | null;
  trialExpiresAt: string | null;
  trialCreditsTotal: number | null;
  trialCreditsRemaining: number | null;
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
  accountName: "buildvora_ba_account_name",
  planType: "buildvora_ba_plan_type",
  planName: "buildvora_ba_plan_name",
  availableCredits: "buildvora_ba_available_credits",
  monthlyCredits: "buildvora_ba_monthly_credits",
  concurrencyLimit: "buildvora_ba_concurrency_limit",
  canPublish: "buildvora_ba_can_publish",
  trialExpiresAt: "buildvora_ba_trial_expires_at",
  trialCreditsTotal: "buildvora_ba_trial_credits_total",
  trialCreditsRemaining: "buildvora_ba_trial_credits_remaining",
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
  accountSlug?: string;
  accountName?: string | null;
  planType?: PlanType | null;
  planName?: string | null;
  billingStatus?: BillingStatus;
  billingPlan?: string | null;
  billingProvider?: "paypal" | "demo" | "coupon" | "trial";
  billingReferenceId?: string | null;
  availableCredits?: number | null;
  monthlyCredits?: number | null;
  concurrencyLimit?: number | null;
  canPublish?: boolean | null;
  trialExpiresAt?: string | null;
  trialCreditsTotal?: number | null;
  trialCreditsRemaining?: number | null;
}) {
  return {
    email: input.email.trim().toLowerCase(),
    workspaceCode: normalizeWorkspaceCode(input.workspaceCode),
    accountSlug: input.accountSlug ?? resolveAccountSlug(input.workspaceCode),
    accountName: input.accountName ?? null,
    planType: input.planType ?? null,
    planName: input.planName ?? null,
    billingStatus: input.billingStatus ?? "inactive",
    billingPlan: input.billingPlan ?? null,
    billingProvider: input.billingProvider ?? "demo",
    billingReferenceId: input.billingReferenceId ?? null,
    availableCredits: input.availableCredits ?? null,
    monthlyCredits: input.monthlyCredits ?? null,
    concurrencyLimit: input.concurrencyLimit ?? null,
    canPublish: input.canPublish ?? null,
    trialExpiresAt: input.trialExpiresAt ?? null,
    trialCreditsTotal: input.trialCreditsTotal ?? null,
    trialCreditsRemaining: input.trialCreditsRemaining ?? null,
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

  const account = getBrowserAutomationAccounts().find((item) => item.slug === accountSlug);
  const accountBillingStatus = account?.billingStatus;
  const accountPlan = account?.planType;
  const accountProvider = account?.planType === "trial" ? "trial" : undefined;
  const cookieNumber = (name: string) => {
    const value = cookieStore.get(name)?.value;
    const parsed = value ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : null;
  };
  const cookieBoolean = (name: string) => {
    const value = cookieStore.get(name)?.value;
    return value === "1" ? true : value === "0" ? false : null;
  };

  return {
    email,
    workspaceCode,
    accountSlug,
    accountName: account?.name ?? cookieStore.get(SESSION_COOKIE_NAMES.accountName)?.value ?? null,
    planType: account?.planType ?? (cookieStore.get(SESSION_COOKIE_NAMES.planType)?.value as PlanType | undefined) ?? null,
    planName: account?.planName ?? cookieStore.get(SESSION_COOKIE_NAMES.planName)?.value ?? null,
    signedInAt,
    billingStatus: accountBillingStatus ?? (cookieStore.get(SESSION_COOKIE_NAMES.billingStatus)?.value as BillingStatus | undefined) ?? "inactive",
    billingPlan: accountPlan ?? cookieStore.get(SESSION_COOKIE_NAMES.billingPlan)?.value ?? null,
    billingProvider: accountProvider ?? (cookieStore.get(SESSION_COOKIE_NAMES.billingProvider)?.value as "paypal" | "demo" | "coupon" | "trial" | undefined) ?? "demo",
    billingReferenceId:
      cookieStore.get(SESSION_COOKIE_NAMES.billingReferenceId)?.value ??
      cookieStore.get("buildvora_ba_stripe_customer_id")?.value ??
      null,
    availableCredits: account?.availableCredits ?? cookieNumber(SESSION_COOKIE_NAMES.availableCredits),
    monthlyCredits: account?.monthlyCredits ?? cookieNumber(SESSION_COOKIE_NAMES.monthlyCredits),
    concurrencyLimit: account?.concurrencyLimit ?? cookieNumber(SESSION_COOKIE_NAMES.concurrencyLimit),
    canPublish: account?.canPublish ?? cookieBoolean(SESSION_COOKIE_NAMES.canPublish),
    trialExpiresAt: account?.trialExpiresAt ?? cookieStore.get(SESSION_COOKIE_NAMES.trialExpiresAt)?.value ?? null,
    trialCreditsTotal: account?.trialCreditsTotal ?? cookieNumber(SESSION_COOKIE_NAMES.trialCreditsTotal),
    trialCreditsRemaining: account?.trialCreditsRemaining ?? cookieNumber(SESSION_COOKIE_NAMES.trialCreditsRemaining),
  } satisfies BrowserAutomationSession;
}

export function applyWorkspaceAccountCookies(
  response: NextResponse,
  account: Pick<
    BrowserAutomationAccount,
    | "name"
    | "planType"
    | "planName"
    | "availableCredits"
    | "monthlyCredits"
    | "concurrencyLimit"
    | "canPublish"
    | "trialExpiresAt"
    | "trialCreditsTotal"
    | "trialCreditsRemaining"
  >,
) {
  response.cookies.set(SESSION_COOKIE_NAMES.accountName, account.name, { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.planType, account.planType, { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.planName, account.planName, { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.availableCredits, String(account.availableCredits), { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.monthlyCredits, String(account.monthlyCredits), { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.concurrencyLimit, String(account.concurrencyLimit), { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.canPublish, account.canPublish ? "1" : "0", { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.trialExpiresAt, account.trialExpiresAt ?? "", { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.trialCreditsTotal, String(account.trialCreditsTotal), { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set(SESSION_COOKIE_NAMES.trialCreditsRemaining, String(account.trialCreditsRemaining), { httpOnly: true, sameSite: "lax", path: "/" });
}
