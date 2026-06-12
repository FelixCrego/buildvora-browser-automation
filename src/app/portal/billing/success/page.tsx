import BrowserAutomationBillingActivation from "@/components/browser-automation-billing-activation";

export default async function BrowserAutomationBillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const planId = typeof params.plan === "string" ? params.plan : "operator";
  const token = typeof params.token === "string" ? params.token : null;
  const subscriptionId = typeof params.subscription_id === "string" ? params.subscription_id : null;
  const demo = params.demo === "1";

  return (
    <main className="min-h-screen bg-[#fbfbfd] px-6 py-16 text-slate-950 md:px-10 md:py-24">
      <div className="mx-auto max-w-3xl">
        <BrowserAutomationBillingActivation planId={planId} token={token} subscriptionId={subscriptionId} demo={demo} />
      </div>
    </main>
  );
}
