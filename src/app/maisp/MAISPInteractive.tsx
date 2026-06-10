"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const industries = [
  {
    id: "real-estate",
    label: "Real Estate",
    multiplier: 1.16,
    useCases: ["Lead qualification automation", "Deal pipeline scoring", "Listing-to-close workflow orchestration"],
    kpis: ["Lead-to-appointment rate", "Days to close", "Follow-up SLA compliance"],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    multiplier: 1.22,
    useCases: ["Patient intake automation", "Care coordination copilots", "Revenue-cycle exception handling"],
    kpis: ["Intake completion rate", "Care response time", "Claim rework volume"],
  },
  {
    id: "agency",
    label: "Marketing Agency",
    multiplier: 1.1,
    useCases: ["Campaign reporting automation", "Content and creative workflow AI", "Client success signal dashboards"],
    kpis: ["Report turnaround time", "Campaign iteration speed", "Client retention velocity"],
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    multiplier: 1.18,
    useCases: ["Merchandising and pricing recommendations", "Support ticket deflection", "Inventory risk prediction"],
    kpis: ["Conversion rate", "Support resolution time", "Stockout risk rate"],
  },
  {
    id: "saas",
    label: "B2B SaaS",
    multiplier: 1.2,
    useCases: ["PLG funnel optimization", "Onboarding intelligence", "Expansion and churn signal modeling"],
    kpis: ["Activation rate", "Time-to-value", "Net revenue retention"],
  },
  {
    id: "home-services",
    label: "Home Services",
    multiplier: 1.08,
    useCases: ["Dispatch and routing automation", "Estimate-to-book optimization", "Field ops knowledge assistant"],
    kpis: ["Booked job rate", "Truck utilization", "Repeat service revenue"],
  },
] as const;

const companyProfiles = [
  { id: "owner-led", label: "Owner-Led Team", teamSize: "5-20", multiplier: 0.85, hourlyRate: 85 },
  { id: "growth", label: "Growth Team", teamSize: "20-75", multiplier: 1.2, hourlyRate: 105 },
  { id: "scale", label: "Scaling Company", teamSize: "75-250", multiplier: 1.65, hourlyRate: 125 },
  { id: "enterprise", label: "Enterprise Org", teamSize: "250+", multiplier: 2.25, hourlyRate: 145 },
] as const;

const revenueBands = [
  { id: "under-2m", label: "Under $2M ARR", multiplier: 0.82, costMultiplier: 0.82, arrMid: 1500000, tier: "under-10m" },
  { id: "2m-10m", label: "$2M-$10M ARR", multiplier: 1, costMultiplier: 1, arrMid: 6000000, tier: "under-10m" },
  { id: "10m-50m", label: "$10M-$50M ARR", multiplier: 1.26, costMultiplier: 1.24, arrMid: 30000000, tier: "over-10m" },
  { id: "50m-plus", label: "$50M+ ARR", multiplier: 1.52, costMultiplier: 1.48, arrMid: 75000000, tier: "over-10m" },
] as const;

const maturityStages = [
  { id: "exploring", label: "Exploring AI", readinessBonus: -6, liftMultiplier: 0.84, speedMultiplier: 1.16 },
  { id: "pilots", label: "Running Pilots", readinessBonus: 0, liftMultiplier: 1, speedMultiplier: 1 },
  { id: "production", label: "Production AI", readinessBonus: 8, liftMultiplier: 1.16, speedMultiplier: 0.86 },
] as const;

const urgencyWindows = [
  { id: "30", label: "Need impact in 30 days", targetDays: 30 },
  { id: "60", label: "Need impact in 60 days", targetDays: 60 },
  { id: "90", label: "Building a 90-day rollout", targetDays: 90 },
] as const;

const serviceTracks = [
  {
    id: "implement",
    title: "01 / Real-World Site Visits & Deep Audits",
    subtitle:
      "We don't just look at spreadsheets from a distance. We can come directly to your offices, shadow your team, and look under the hood of your complex systems to see how your business actually runs in real life.",
    multiplier: 1,
    costMultiplier: 1,
    speedBias: 1,
    features: ["On-site operations discovery", "Stakeholder interviews", "Workflow and systems audit"],
  },
  {
    id: "education",
    title: "02 / Patient, Human Team Education",
    subtitle:
      "Software is useless if your staff is afraid to use it. We gently educate and train your leadership and employees, breaking down AI into plain English. We ensure everyone feels confident, capable, and excited about the upgrades.",
    multiplier: 1.12,
    costMultiplier: 1.14,
    speedBias: 0.88,
    features: ["Leadership alignment workshops", "Role-based training", "Live implementation coaching"],
  },
  {
    id: "build",
    title: "03 / Building Your Perfect Stack (Zero Limitations)",
    subtitle:
      "Because your business has been around for 15+ years, standard cookie-cutter apps won't cut it. We build or integrate the exact tools your specific workflow demands. We can do anything. If your business needs it, we make it happen.",
    multiplier: 1.28,
    costMultiplier: 1.25,
    speedBias: 1.04,
    features: ["Custom tooling and integrations", "Legacy workflow modernization", "Department-specific stack design"],
  },
  {
    id: "manage",
    title: "04 / 100% Continuous Management",
    subtitle:
      "You don't need to hire an expensive internal IT team or an 'AI Prompt Engineer.' Think of us as your fractional AI department. We manage, monitor, fix, and optimize your systems 24/7 so they never stop producing profit.",
    multiplier: 1.34,
    costMultiplier: 1.28,
    speedBias: 0.98,
    features: ["Always-on system oversight", "Performance optimization loops", "Continuous uptime and reliability management"],
  },
] as const;

const goals = [
  { id: "lead-conversion", label: "Increase qualified lead conversion", weight: 7 },
  { id: "manual-work", label: "Reduce manual repetitive work", weight: 6 },
  { id: "onboarding", label: "Accelerate onboarding and delivery", weight: 5 },
  { id: "support", label: "Improve support speed and quality", weight: 6 },
  { id: "forecast", label: "Improve forecasting and decision accuracy", weight: 8 },
  { id: "retention", label: "Increase retention and expansion revenue", weight: 7 },
] as const;

const departments = [
  { id: "sales", label: "Sales", play: "Pipeline triage copilot", metric: "Faster stage progression" },
  { id: "marketing", label: "Marketing", play: "Campaign signal automation", metric: "Lower CAC volatility" },
  { id: "operations", label: "Operations", play: "SOP and queue automation", metric: "Reduced cycle time" },
  { id: "support", label: "Support", play: "AI response and routing layer", metric: "Lower first-response time" },
  { id: "finance", label: "Finance", play: "Forecasting and anomaly intelligence", metric: "Higher forecast confidence" },
  { id: "customer-success", label: "Customer Success", play: "Churn-risk intervention playbooks", metric: "Stronger net retention" },
] as const;

const painPoints = [
  { id: "slow-decisions", label: "Slow decisions due to scattered data", weight: 10, play: "Unified decision cockpit" },
  { id: "manual-reporting", label: "Manual reporting drains leadership time", weight: 8, play: "Automated executive reporting" },
  { id: "low-adoption", label: "Low team adoption of current AI tools", weight: 9, play: "Role-based enablement workflows" },
  { id: "handoff-friction", label: "Sales-to-ops handoff friction", weight: 7, play: "Cross-functional handoff automation" },
  { id: "quality-drift", label: "AI output quality is inconsistent", weight: 9, play: "Prompt and quality monitoring layer" },
  { id: "security-risk", label: "Security and governance concerns", weight: 8, play: "Governance and access-control framework" },
] as const;

const systems = [
  { id: "hubspot", label: "HubSpot" },
  { id: "salesforce", label: "Salesforce" },
  { id: "zoho", label: "Zoho" },
  { id: "google-workspace", label: "Google Workspace" },
  { id: "microsoft-365", label: "Microsoft 365" },
  { id: "slack", label: "Slack" },
  { id: "notion", label: "Notion" },
  { id: "quickbooks", label: "QuickBooks" },
  { id: "netsuite", label: "NetSuite" },
] as const;

const diagnosticQuestions = [
  {
    id: "dataCentralization",
    title: "Data Centralization",
    subtitle: "How structured and connected your operating data is today.",
    options: [
      { id: "scattered", label: "Scattered", points: 1 },
      { id: "messy-crm", label: "Messy CRM", points: 3 },
      { id: "api-ready", label: "API-Ready", points: 5 },
    ],
  },
  {
    id: "processDocumentation",
    title: "Process Documentation",
    subtitle: "How consistently your workflows are documented and repeatable.",
    options: [
      { id: "in-heads", label: "In heads", points: 1 },
      { id: "basic-sops", label: "Basic SOPs", points: 3 },
      { id: "strict-sops", label: "Strict SOPs", points: 5 },
    ],
  },
  {
    id: "aiAdoption",
    title: "AI Adoption",
    subtitle: "Current maturity of AI usage across your teams.",
    options: [
      { id: "none", label: "None", points: 1 },
      { id: "ad-hoc-chatgpt", label: "Ad-hoc ChatGPT", points: 3 },
      { id: "paid-or-custom", label: "Paid/Custom", points: 5 },
    ],
  },
] as const;

const bottleneckOptions = [
  { id: "lead-gen", label: "Lead Gen", tool: "Felix CRM", href: "/saas/felix-crm" },
  { id: "data-underwriting", label: "Data/Underwriting", tool: "Junior Underwriter", href: "/saas/junior-underwriter" },
  { id: "seo-content", label: "SEO/Content", tool: "LinkGrowth", href: "/saas/linkgrowth" },
] as const;

const companySizeBands = [
  { id: "1-10", label: "1-10 employees" },
  { id: "11-50", label: "11-50 employees" },
  { id: "51-200", label: "51-200 employees" },
  { id: "201-plus", label: "201+ employees" },
] as const;

const aiBudgetBands = [
  { id: "under-5k", label: "< $5k / month" },
  { id: "5k-15k", label: "$5k-$15k / month" },
  { id: "15k-50k", label: "$15k-$50k / month" },
  { id: "50k-plus", label: "$50k+ / month" },
] as const;

const timelineBands = [
  { id: "30-days", label: "30 days" },
  { id: "60-days", label: "60 days" },
  { id: "90-days", label: "90 days" },
] as const;

const governancePriorities = [
  {
    id: "closed-loop-data",
    label: "Closed-Loop Data Architecture",
    detail: "Isolate enterprise data flows from ingestion to inference with auditability at every layer.",
  },
  {
    id: "zero-day-ip",
    label: "Zero-Day IP Protection",
    detail: "Enforce policy boundaries to prevent proprietary leakage and unauthorized model context exposure.",
  },
  {
    id: "change-management",
    label: "Enterprise Change Management",
    detail: "Deploy executive adoption playbooks and functional rollout governance across departments.",
  },
  {
    id: "access-control",
    label: "Privilege-Tier Access Controls",
    detail: "Role-based model permissions, data segmentation, and policy-scoped output monitoring.",
  },
] as const;

type IndustryId = (typeof industries)[number]["id"];
type ProfileId = (typeof companyProfiles)[number]["id"];
type RevenueId = (typeof revenueBands)[number]["id"];
type MaturityId = (typeof maturityStages)[number]["id"];
type TrackId = (typeof serviceTracks)[number]["id"];
type UrgencyId = (typeof urgencyWindows)[number]["id"];
type GoalId = (typeof goals)[number]["id"];
type DepartmentId = (typeof departments)[number]["id"];
type PainPointId = (typeof painPoints)[number]["id"];
type SystemId = (typeof systems)[number]["id"];
type DiagnosticPoints = 1 | 3 | 5;
type BottleneckId = (typeof bottleneckOptions)[number]["id"];
type CompanySizeId = (typeof companySizeBands)[number]["id"];
type AiBudgetId = (typeof aiBudgetBands)[number]["id"];
type TimelineId = (typeof timelineBands)[number]["id"];
type GovernancePriorityId = (typeof governancePriorities)[number]["id"];
type LeadStatus = "idle" | "submitting" | "success" | "error";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const highImpactPilotSetup = 10000;
const highImpactPilotRetainer = 2500;
const calendarLink = "https://calendly.com/felixcrego/buildvora-ai-assessment";

export default function MAISPInteractive() {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeIndustry, setActiveIndustry] = useState<IndustryId>("real-estate");
  const [activeProfile, setActiveProfile] = useState<ProfileId>("growth");
  const [activeRevenue, setActiveRevenue] = useState<RevenueId>("2m-10m");
  const [activeMaturity, setActiveMaturity] = useState<MaturityId>("pilots");
  const [activeTrack, setActiveTrack] = useState<TrackId>("implement");
  const [activeUrgency, setActiveUrgency] = useState<UrgencyId>("60");

  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>(["lead-conversion", "manual-work", "forecast"]);
  const [selectedDepartments, setSelectedDepartments] = useState<DepartmentId[]>(["sales", "operations", "marketing"]);
  const [selectedPainPoints, setSelectedPainPoints] = useState<PainPointId[]>(["slow-decisions", "manual-reporting"]);
  const [selectedSystems, setSelectedSystems] = useState<SystemId[]>(["hubspot", "slack", "google-workspace"]);
  const [dataCentralizationScore, setDataCentralizationScore] = useState<DiagnosticPoints | null>(null);
  const [processDocumentationScore, setProcessDocumentationScore] = useState<DiagnosticPoints | null>(null);
  const [aiAdoptionScore, setAiAdoptionScore] = useState<DiagnosticPoints | null>(null);
  const [coreBottleneck, setCoreBottleneck] = useState<BottleneckId | null>(null);
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companySize, setCompanySize] = useState<CompanySizeId | null>(null);
  const [aiBudgetBand, setAiBudgetBand] = useState<AiBudgetId | null>(null);
  const [pilotTimeline, setPilotTimeline] = useState<TimelineId>("60-days");
  const [selectedGovernancePriorities, setSelectedGovernancePriorities] = useState<GovernancePriorityId[]>([
    "closed-loop-data",
    "zero-day-ip",
  ]);
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("idle");
  const [leadStatusMessage, setLeadStatusMessage] = useState("");

  const industry = useMemo(() => industries.find((item) => item.id === activeIndustry) ?? industries[0], [activeIndustry]);
  const profile = useMemo(() => companyProfiles.find((item) => item.id === activeProfile) ?? companyProfiles[0], [activeProfile]);
  const revenueBand = useMemo(() => revenueBands.find((item) => item.id === activeRevenue) ?? revenueBands[0], [activeRevenue]);
  const maturity = useMemo(() => maturityStages.find((item) => item.id === activeMaturity) ?? maturityStages[0], [activeMaturity]);
  const track = useMemo(() => serviceTracks.find((item) => item.id === activeTrack) ?? serviceTracks[0], [activeTrack]);
  const urgency = useMemo(() => urgencyWindows.find((item) => item.id === activeUrgency) ?? urgencyWindows[1], [activeUrgency]);

  const selectedDiagnosticPoints = [dataCentralizationScore, processDocumentationScore, aiAdoptionScore];
  const hasCompletedDiagnostic =
    selectedDiagnosticPoints.every((score) => score !== null) &&
    coreBottleneck !== null &&
    selectedGovernancePriorities.length > 0;
  const hasContactInfo =
    fullName.trim().length > 1 &&
    workEmail.trim().length > 4 &&
    companyName.trim().length > 1 &&
    roleTitle.trim().length > 1 &&
    companySize !== null &&
    aiBudgetBand !== null;
  const canSubmitLead = hasCompletedDiagnostic && hasContactInfo;

  const readinessIndex = useMemo(() => {
    const total = selectedDiagnosticPoints.reduce((sum, score) => sum + (score ?? 1), 0);
    return clamp(Math.round(((total - 3) / 12) * 100), 0, 100);
  }, [selectedDiagnosticPoints]);

  const painWeight = useMemo(
    () => selectedPainPoints.reduce((sum, id) => sum + (painPoints.find((item) => item.id === id)?.weight ?? 0), 0),
    [selectedPainPoints],
  );

  const goalWeight = useMemo(
    () => selectedGoals.reduce((sum, id) => sum + (goals.find((item) => item.id === id)?.weight ?? 0), 0),
    [selectedGoals],
  );

  const readinessScore = readinessIndex;

  const complexityIndex = useMemo(() => {
    const complexity = 26 + selectedSystems.length * 7 + selectedPainPoints.length * 8 + (100 - readinessScore) * 0.34;
    return clamp(Math.round(complexity), 22, 95);
  }, [readinessScore, selectedPainPoints.length, selectedSystems.length]);

  const monthlyHoursSaved = useMemo(() => {
    const base = 48 * industry.multiplier * profile.multiplier * revenueBand.multiplier * track.multiplier;
    const optimizationFactor = 0.76 + readinessScore / 190;
    const departmentFactor = 1 + selectedDepartments.length * 0.16;
    const demandFactor = 1 + goalWeight / 90;
    const dragFactor = 1 + painWeight / 130;
    const maturityFactor = maturity.liftMultiplier;
    return Math.round(base * optimizationFactor * departmentFactor * demandFactor * dragFactor * maturityFactor);
  }, [goalWeight, industry.multiplier, maturity.liftMultiplier, painWeight, profile.multiplier, readinessScore, revenueBand.multiplier, selectedDepartments.length, track.multiplier]);

  const annualSavings = Math.round(monthlyHoursSaved * 12 * profile.hourlyRate);
  const efficiencyLift = clamp(Math.round(monthlyHoursSaved * 0.36 + goalWeight * 1.8), 18, 320);
  const estimatedProgramCost = highImpactPilotSetup + highImpactPilotRetainer * 12;
  const roi12Months = Math.round(((annualSavings - estimatedProgramCost) / Math.max(estimatedProgramCost, 1)) * 100);
  const paybackMonths = Number((estimatedProgramCost / Math.max((annualSavings / 12), 1)).toFixed(1));
  const deliveryConfidence = clamp(Math.round(readinessScore * 0.55 + (100 - complexityIndex) * 0.45), 20, 97);
  const projectedMarginExpansionBps = clamp(Math.round((annualSavings / Math.max(revenueBand.arrMid, 1)) * 10000), 40, 980);
  const ebitdaMultiplierUpside = Number((1 + projectedMarginExpansionBps / 5000 + deliveryConfidence / 650).toFixed(2));
  const estimatedHoursDecoupled = monthlyHoursSaved * 12;
  const programEconomicsLabel =
    revenueBand.tier === "under-10m"
      ? "Phase 1 Diagnostic & Proof of Concept."
      : "Custom CapEx/OpEx Modeling Required based on Total Department Scope.";

  const recommendedUseCases = useMemo(() => {
    const playsFromPain = selectedPainPoints.map((id) => painPoints.find((item) => item.id === id)?.play ?? "");
    const combined = [...industry.useCases, ...playsFromPain].filter(Boolean);
    return Array.from(new Set(combined)).slice(0, 5);
  }, [industry.useCases, selectedPainPoints]);
  const highImpactUseCases = recommendedUseCases.slice(0, 3);
  const strategicScaleUseCases = recommendedUseCases.slice(3);
  const mappedBottleneck = useMemo(
    () => bottleneckOptions.find((item) => item.id === coreBottleneck) ?? null,
    [coreBottleneck],
  );
  const selectedCompanySize = useMemo(
    () => companySizeBands.find((item) => item.id === companySize) ?? null,
    [companySize],
  );
  const selectedBudgetBand = useMemo(
    () => aiBudgetBands.find((item) => item.id === aiBudgetBand) ?? null,
    [aiBudgetBand],
  );
  const selectedTimelineBand = useMemo(
    () => timelineBands.find((item) => item.id === pilotTimeline) ?? timelineBands[1],
    [pilotTimeline],
  );

  const departmentBlueprint = useMemo(
    () =>
      selectedDepartments
        .map((id) => departments.find((item) => item.id === id))
        .filter((item): item is (typeof departments)[number] => Boolean(item))
        .map((item, idx) => ({
          ...item,
          impact: clamp(Math.round(efficiencyLift * (0.35 + idx * 0.08)), 12, 180),
        })),
    [efficiencyLift, selectedDepartments],
  );

  const riskFlags = useMemo(() => {
    const flags: string[] = [];
    if (!selectedGovernancePriorities.includes("closed-loop-data")) flags.push("Closed-Loop Data Architecture is not selected. Add controlled data boundaries before scaling agent access.");
    if (!selectedGovernancePriorities.includes("zero-day-ip")) flags.push("Zero-Day IP Protection is missing. Implement policy-scoped context controls and confidential data firebreaks.");
    if (!selectedGovernancePriorities.includes("change-management")) flags.push("Enterprise Change Management is not yet prioritized. Add executive and department-level adoption governance.");
    if ((aiAdoptionScore ?? 1) <= 3) flags.push("Adoption risk remains elevated. Sequence enablement with role-based training and accountable executive sponsorship.");
    if (!flags.length) flags.push("Governance posture is strong. Proceed with phased deployment and board-level KPI monitoring.");
    return flags.slice(0, 3);
  }, [aiAdoptionScore, selectedGovernancePriorities]);

  const roadmap = useMemo(() => {
    const discoveryDays = clamp(Math.round(7 + (100 - readinessScore) / 6), 7, 22);
    const pilotDays = clamp(Math.round((18 + complexityIndex / 4) * track.speedBias * maturity.speedMultiplier), 14, 45);
    const rolloutDays = clamp(Math.round(16 + selectedDepartments.length * 6 + selectedSystems.length * 2), 18, 56);
    const stabilizeDays = clamp(Math.round(12 + selectedPainPoints.length * 4), 10, 36);

    return [
      {
        phase: "System Mapping & Financial Forecasting",
        days: discoveryDays,
        summary:
          "We baseline your current KPI leakage and project your new profit margins via on-site diagnostics or deep-dive stakeholder interviews.",
      },
      {
        phase: "On-Site Integration & Team Coaching",
        days: pilotDays,
        summary:
          "We launch a low-risk pilot in your highest-friction department and walk your team through it step-by-step.",
      },
      {
        phase: "Cross-Department Rollout",
        days: rolloutDays,
        summary: "Expand integrations, automate handoffs, and enforce operating SLAs across teams.",
      },
      {
        phase: "Reliability + Optimization",
        days: stabilizeDays,
        summary: "Monitor quality drift, optimize prompts, and lock quarterly efficiency scorecards.",
      },
    ];
  }, [complexityIndex, industry.label, maturity.speedMultiplier, readinessScore, selectedDepartments.length, selectedPainPoints.length, selectedSystems.length, track.speedBias, track.title]);

  const firstWaveTarget = useMemo(() => {
    const total = roadmap.reduce((sum, item) => sum + item.days, 0);
    return Math.max(total, urgency.targetDays);
  }, [roadmap, urgency.targetDays]);

  const diagnosticSelections: Record<(typeof diagnosticQuestions)[number]["id"], DiagnosticPoints | null> = {
    dataCentralization: dataCentralizationScore,
    processDocumentation: processDocumentationScore,
    aiAdoption: aiAdoptionScore,
  };

  const setDiagnosticScore = (questionId: (typeof diagnosticQuestions)[number]["id"], points: DiagnosticPoints) => {
    if (questionId === "dataCentralization") setDataCentralizationScore(points);
    if (questionId === "processDocumentation") setProcessDocumentationScore(points);
    if (questionId === "aiAdoption") setAiAdoptionScore(points);
  };

  const submitLeadAndGeneratePdf = async () => {
    if (!canSubmitLead) {
      setLeadStatus("error");
      setLeadStatusMessage("Complete contact details and all diagnostic questions before generating your report.");
      return;
    }

    const payload = {
      contact: {
        fullName: fullName.trim(),
        workEmail: workEmail.trim(),
        companyName: companyName.trim(),
        roleTitle: roleTitle.trim(),
        websiteUrl: websiteUrl.trim(),
        companySize: selectedCompanySize?.label ?? "Not selected",
        aiBudgetBand: selectedBudgetBand?.label ?? "Not selected",
        pilotTimeline: selectedTimelineBand.label,
      },
      profile: {
        industry: industry.label,
        companyProfile: profile.label,
        revenueBand: revenueBand.label,
        aiMaturity: maturity.label,
        maispTrack: track.title,
      },
      diagnostic: {
        readinessIndex: readinessScore,
        complexityIndex,
        deliveryConfidence,
        coreBottleneck: mappedBottleneck?.label ?? "Not selected",
        recommendedTool: mappedBottleneck?.tool ?? "Not selected",
        dataCentralizationScore,
        processDocumentationScore,
        aiAdoptionScore,
      },
      recommendations: {
        highImpactUseCases,
        strategicScaleUseCases: strategicScaleUseCases.length
          ? strategicScaleUseCases
          : ["Expand automations across adjacent teams and multi-system workflows."],
      },
      economics: {
        roi12Months,
        monthlyHoursSaved,
        annualSavings,
        paybackMonths,
        highImpactPilotSetup,
        highImpactPilotRetainer,
      },
    };

    try {
      setLeadStatus("submitting");
      setLeadStatusMessage("Submitting lead and generating your report...");
      const response = await fetch("/api/maisp-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok?: boolean; mode?: string; message?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Lead submission failed.");
      }

      setLeadStatus("success");
      setLeadStatusMessage(
        result.mode === "local_fallback"
          ? "Lead details captured in fallback mode. Configure LEAD_WEBHOOK_URL for direct CRM/webhook delivery."
          : "Lead captured successfully. Your strategy report is generating now.",
      );
      generateReportPdf();
    } catch (error) {
      setLeadStatus("error");
      setLeadStatusMessage(error instanceof Error ? error.message : "Lead submission failed.");
    }
  };

  const generateReportPdf = () => {
    const reportLines = [
      "BuildVora - Custom Board-Level Strategy Briefing",
      "-------------------------------------------------",
      `Contact: ${fullName || "Not provided"} | ${workEmail || "Not provided"}`,
      `Company: ${companyName || "Not provided"} | ${roleTitle || "Not provided"}`,
      `Website: ${websiteUrl || "Not provided"}`,
      `Company size: ${selectedCompanySize?.label ?? "Not selected"} | AI budget: ${selectedBudgetBand?.label ?? "Not selected"}`,
      `Target timeline: ${selectedTimelineBand.label}`,
      "",
      `Industry: ${industry.label}`,
      `Company profile: ${profile.label} (${profile.teamSize})`,
      `Revenue band: ${revenueBand.label}`,
      `AI maturity: ${maturity.label}`,
      `MAISP track: ${track.title}`,
      `Urgency window: ${urgency.label}`,
      `Core bottleneck: ${mappedBottleneck?.label ?? "Not selected"}`,
      `Recommended BuildVora tool: ${mappedBottleneck?.tool ?? "Not selected"}`,
      `Governance priorities: ${selectedGovernancePriorities.map((id) => governancePriorities.find((item) => item.id === id)?.label).filter(Boolean).join(", ") || "Not selected"}`,
      `Data centralization score: ${dataCentralizationScore ?? "Not selected"}`,
      `Process documentation score: ${processDocumentationScore ?? "Not selected"}`,
      `AI adoption score: ${aiAdoptionScore ?? "Not selected"}`,
      "",
      `Projected margin expansion: ${projectedMarginExpansionBps} bps`,
      `EBITDA multiplier upside: ${ebitdaMultiplierUpside}x`,
      `Estimated hours decoupled from headcount: ${estimatedHoursDecoupled}`,
      `12-month ROI: ${roi12Months}%`,
      `Payback period: ${paybackMonths} months`,
      `Estimated monthly hours saved: ${monthlyHoursSaved}`,
      `Projected annual savings: ${formatCurrency(annualSavings)}`,
      "",
      `Program economics model: ${programEconomicsLabel}`,
      "",
      "High Impact (0-30 Days):",
      ...highImpactUseCases.map((item) => `- ${item}`),
      "",
      "Strategic Scale (90+ Days):",
      ...(strategicScaleUseCases.length ? strategicScaleUseCases : ["- Expand automations across adjacent teams and workflows."]).map((item) =>
        item.startsWith("-") ? item : `- ${item}`,
      ),
      "",
      "",
      `Diagnostic Recommendation: ${
        readinessScore < 50
          ? "Data Centralization & SOP Alignment required before AI scale."
          : `Run a 30-Day High-Impact Pilot for ${mappedBottleneck?.label ?? "the selected bottleneck"}.`
      }`,
      "",
      "Security & Governance:",
      "Enterprise Guardrails: Zero-training privacy, SOC2-compliant protocols, and active hallucination monitoring.",
    ];

    const popup = window.open("", "_blank", "width=900,height=760");
    if (!popup) return;
    popup.document.write(
      `<html><head><title>BuildVora AI Strategy Report</title><style>
        body { font-family: 'JetBrains Mono', monospace; padding: 24px; background: #ffffff; color: #0f172a; }
        pre { white-space: pre-wrap; line-height: 1.45; font-size: 13px; }
      </style></head><body><pre>${reportLines.join("\n")}</pre></body></html>`,
    );
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const toggleItem = <T extends string>(
    value: T,
    list: T[],
    setList: Dispatch<SetStateAction<T[]>>,
    minCount: number,
  ) => {
    setList((prev) => {
      if (prev.includes(value)) {
        if (prev.length <= minCount) return prev;
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const wizardSteps = [
    { id: 1, label: "Step 1", title: "Enterprise Profile" },
    { id: 2, label: "Step 2", title: "Infrastructure & Data Readiness" },
    { id: 3, label: "Step 3", title: "Core Friction Points" },
    { id: 4, label: "Step 4", title: "Governance & Security" },
  ] as const;

  const stepCompletion = {
    1: Boolean(activeIndustry && activeProfile && activeRevenue),
    2: selectedSystems.length > 0 && selectedDiagnosticPoints.every((score) => score !== null),
    3: selectedGoals.length > 0 && selectedDepartments.length > 0 && selectedPainPoints.length > 0 && coreBottleneck !== null,
    4: selectedGovernancePriorities.length > 0,
  } as const;

  const canGoNext = wizardStep < 4 && stepCompletion[wizardStep];

  return (
    <main className="bg-black text-slate-100">
      <section className="mesh-bg relative isolate overflow-hidden border-b border-slate-900 px-6 pb-14 pt-20 md:px-10 md:pb-20 md:pt-24">
        <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-blue-500/22 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.03fr_0.97fr]">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <p className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
              MAISP Command Hub
            </p>
            <h1 className="editorial mt-5 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              Transform Your Operating Margins: Enterprise AI Architecture that decouples revenue growth from headcount.
            </h1>
            <p className="mt-5 max-w-3xl text-slate-300">
              BuildVora designs boardroom-grade AI architecture for leadership teams focused on EBITDA expansion, margin
              defense, and scalable enterprise execution.
            </p>
            <p className="mt-4 max-w-3xl text-slate-300">
              We quantify financial upside before deployment, stress-test governance risk before expansion, and deliver a
              phased architecture plan your board can approve with confidence.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-blue-500/30 bg-slate-950/75 px-4 py-3">
                <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">Readiness</p>
                <p className="tech mt-2 text-xl font-semibold text-white">{readinessScore}/100</p>
              </div>
              <div className="rounded-xl border border-blue-500/30 bg-slate-950/75 px-4 py-3">
                <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">Complexity</p>
                <p className="tech mt-2 text-xl font-semibold text-white">{complexityIndex}/100</p>
              </div>
              <div className="rounded-xl border border-blue-500/30 bg-slate-950/75 px-4 py-3">
                <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">12-Month ROI</p>
                <p className="tech mt-2 text-xl font-semibold text-white">{roi12Months}%</p>
              </div>
              <div className="rounded-xl border border-blue-500/30 bg-slate-950/75 px-4 py-3">
                <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">Payback</p>
                <p className="tech mt-2 text-xl font-semibold text-white">{paybackMonths} mo</p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-blue-300/55 bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-blue-400"
              >
                Book Personalized Business AI Assessment
              </a>
              <Link
                href="/case-studies"
                className="inline-flex rounded-full border border-white/30 bg-black/30 px-5 py-2 text-sm font-semibold text-slate-100 transition-all duration-300 ease-in-out hover:border-blue-300/55 hover:text-blue-200"
              >
                See Live Implementations
              </Link>
            </div>
            <p className="mt-3 inline-flex rounded-full border border-blue-300/45 bg-blue-500/12 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-blue-100">
              Performance Guarantee: 99.9% Model Accuracy &amp; Security Guardrails Included.
            </p>
            <p className="mt-4 max-w-3xl text-sm text-slate-300">
              Executive engagement model and investment framing are calibrated after strategic feasibility diagnostics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-3xl border border-blue-500/35 bg-slate-950/70 p-4 shadow-[0_0_70px_rgba(59,130,246,0.25)]"
          >
            <div className="relative h-[32rem] overflow-hidden rounded-2xl border border-slate-800 bg-[#030610]">
              <Image
                src="/images/maisp-hero-command-team.png"
                alt="MAISP command center with leadership team and Vora"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/62 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-blue-500/35 bg-black/60 p-4 backdrop-blur">
              <p className="tech text-[10px] uppercase tracking-[0.2em] text-blue-300">Human Partnership Promise</p>
              <p className="mt-2 text-sm text-slate-200">
                You run your business. We run the technology, training, and ongoing optimization behind your growth.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-black px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">
            We Analyze Your Friction. We Prove the ROI. You See the Results.
          </h2>
          <p className="mt-4 max-w-3xl text-slate-300">
            Before we build anything, we map the exact financial impact AI will have on your business.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-500/30 bg-slate-950/75 p-5">
              <p className="text-sm font-semibold text-white">Projected Dollar Savings</p>
              <p className="mt-2 text-sm text-slate-300">
                Exactly how much overhead and leakage we will eliminate from your current operating budget.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-slate-950/75 p-5">
              <p className="text-sm font-semibold text-white">Productivity Explosions</p>
              <p className="mt-2 text-sm text-slate-300">
                How many hours your current team will win back, allowing them to focus on high-value growth instead of
                manual, repetitive tasks.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-slate-950/75 p-5">
              <p className="text-sm font-semibold text-white">The Bottom-Line Effect</p>
              <p className="mt-2 text-sm text-slate-300">
                The clear, measurable impact on your net margins so you can see exactly how this investment protects and
                scales your profits.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#040812] px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-4xl"
          >
            Enterprise AI Feasibility Hub
          </motion.h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Progressive Executive Diagnostic</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {wizardSteps.map((step) => {
                    const isActive = wizardStep === step.id;
                    const isComplete = stepCompletion[step.id];
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setWizardStep(step.id)}
                        className={`rounded-xl border px-3 py-2 text-left transition-all duration-300 ease-in-out ${
                          isActive
                            ? "border-cyan-300 bg-cyan-500/20 text-cyan-100"
                            : isComplete
                              ? "border-emerald-300/70 bg-emerald-500/10 text-emerald-100"
                              : "border-slate-700 bg-black/35 text-slate-300 hover:border-blue-500/45"
                        }`}
                      >
                        <p className="text-[11px] uppercase tracking-[0.16em]">{step.label}</p>
                        <p className="mt-1 text-xs font-semibold">{step.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {wizardStep === 1 ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                  <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Step 1: Enterprise Profile</p>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Industry</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {industries.map((item) => {
                        const isActive = item.id === activeIndustry;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveIndustry(item.id)}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-blue-400 bg-blue-500/20 text-blue-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-blue-500/45"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Enterprise Size</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {companyProfiles.map((item) => {
                        const isActive = item.id === activeProfile;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveProfile(item.id)}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-cyan-300 bg-cyan-500/15 text-cyan-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-cyan-400/50"
                            }`}
                          >
                            {item.label} <span className="text-xs text-slate-400">({item.teamSize})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">ARR Band</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {revenueBands.map((item) => {
                        const isActive = item.id === activeRevenue;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveRevenue(item.id)}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-indigo-300 bg-indigo-500/15 text-indigo-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-indigo-400/50"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {wizardStep === 2 ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                  <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Step 2: Infrastructure &amp; Data Readiness</p>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current Infrastructure Stack</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {systems.map((system) => {
                        const isActive = selectedSystems.includes(system.id);
                        return (
                          <button
                            key={system.id}
                            type="button"
                            onClick={() => toggleItem(system.id, selectedSystems, setSelectedSystems, 1)}
                            className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-emerald-400 bg-emerald-500/18 text-emerald-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-emerald-500/45"
                            }`}
                          >
                            {system.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    {maturityStages.map((item) => {
                      const isActive = item.id === activeMaturity;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveMaturity(item.id)}
                          className={`rounded-xl border px-3 py-2 text-sm transition-all duration-300 ease-in-out ${
                            isActive
                              ? "border-emerald-300 bg-emerald-500/15 text-emerald-100"
                              : "border-slate-700 bg-black/35 text-slate-300 hover:border-emerald-400/50"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-3">
                    {diagnosticQuestions.map((question) => (
                      <div key={question.id} className="rounded-xl border border-slate-700 bg-black/25 p-3">
                        <p className="text-sm font-semibold text-white">{question.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{question.subtitle}</p>
                        <div className="mt-3 grid gap-2 md:grid-cols-3">
                          {question.options.map((option) => {
                            const isActive = diagnosticSelections[question.id] === option.points;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setDiagnosticScore(question.id, option.points)}
                                className={`rounded-lg border px-3 py-2 text-left transition-all duration-300 ease-in-out ${
                                  isActive
                                    ? "border-cyan-300 bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-white shadow-[0_0_28px_rgba(34,211,238,0.22)]"
                                    : "border-slate-700 bg-slate-900/65 text-slate-300 hover:border-blue-400/50 hover:text-slate-100"
                                }`}
                              >
                                <p className="text-sm font-semibold">{option.label}</p>
                                <p className="mt-1 font-mono text-xs text-blue-200">{option.points} pts</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {wizardStep === 3 ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                  <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Step 3: Core Friction Points</p>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Enterprise Priorities</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {goals.map((goal) => {
                        const isActive = selectedGoals.includes(goal.id);
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() => toggleItem(goal.id, selectedGoals, setSelectedGoals, 1)}
                            className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-blue-400 bg-blue-500/20 text-blue-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-blue-500/45"
                            }`}
                          >
                            {goal.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Departments In Scope</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {departments.map((dept) => {
                        const isActive = selectedDepartments.includes(dept.id);
                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => toggleItem(dept.id, selectedDepartments, setSelectedDepartments, 1)}
                            className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-cyan-400 bg-cyan-500/18 text-cyan-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-cyan-500/45"
                            }`}
                          >
                            {dept.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current Friction Map</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {painPoints.map((item) => {
                        const isActive = selectedPainPoints.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleItem(item.id, selectedPainPoints, setSelectedPainPoints, 1)}
                            className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-indigo-400 bg-indigo-500/18 text-indigo-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-indigo-500/45"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-700 bg-black/25 p-3">
                    <p className="text-sm font-semibold text-white">Primary Margin Constraint</p>
                    <p className="mt-1 text-xs text-slate-400">Select the highest-friction constraint impacting enterprise velocity.</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {bottleneckOptions.map((item) => {
                        const isActive = coreBottleneck === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCoreBottleneck(item.id)}
                            className={`rounded-lg border px-3 py-2 text-left transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-cyan-300 bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-white shadow-[0_0_28px_rgba(34,211,238,0.22)]"
                                : "border-slate-700 bg-slate-900/65 text-slate-300 hover:border-blue-400/50 hover:text-slate-100"
                            }`}
                          >
                            <p className="text-sm font-semibold">{item.label}</p>
                            <p className="mt-1 text-xs text-blue-200">Recommended: {item.tool}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {wizardStep === 4 ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                  <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Step 4: Governance &amp; Security</p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {governancePriorities.map((item) => {
                      const isActive = selectedGovernancePriorities.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleItem(item.id, selectedGovernancePriorities, setSelectedGovernancePriorities, 1)}
                          className={`rounded-xl border px-3 py-3 text-left transition-all duration-300 ease-in-out ${
                            isActive
                              ? "border-cyan-300 bg-cyan-500/18 text-cyan-100"
                              : "border-slate-700 bg-black/35 text-slate-300 hover:border-cyan-400/50"
                          }`}
                        >
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="mt-1 text-xs text-slate-300">{item.detail}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Enterprise Change Window</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      {urgencyWindows.map((item) => {
                        const isActive = item.id === activeUrgency;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveUrgency(item.id)}
                            className={`rounded-xl border px-3 py-2 text-sm transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-orange-300 bg-orange-500/15 text-orange-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-orange-400/50"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Architecture Partnership Model</p>
                    <div className="mt-2 grid gap-2">
                      {serviceTracks.map((item) => {
                        const isActive = item.id === activeTrack;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveTrack(item.id)}
                            className={`rounded-xl border px-4 py-3 text-left transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-blue-400 bg-blue-500/20 text-blue-100"
                                : "border-slate-700 bg-black/35 text-slate-300 hover:border-blue-500/45"
                            }`}
                          >
                            <p className="font-semibold">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-300">{item.subtitle}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-700 bg-black/35 p-4">
                    <p className="text-sm font-semibold text-white">Strategic Alignment Audit &amp; Secure Briefing Generation.</p>
                    <p className="mt-1 text-xs text-slate-400">Complete executive details to unlock your custom board-level strategy briefing.</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Executive Name"
                        className="rounded-lg border border-slate-700 bg-slate-900/65 px-3 py-2 text-sm text-slate-100 outline-none transition-all duration-300 ease-in-out focus:border-cyan-300/70"
                      />
                      <input
                        value={workEmail}
                        onChange={(event) => setWorkEmail(event.target.value)}
                        placeholder="Executive Email"
                        type="email"
                        className="rounded-lg border border-slate-700 bg-slate-900/65 px-3 py-2 text-sm text-slate-100 outline-none transition-all duration-300 ease-in-out focus:border-cyan-300/70"
                      />
                      <input
                        value={companyName}
                        onChange={(event) => setCompanyName(event.target.value)}
                        placeholder="Enterprise Name"
                        className="rounded-lg border border-slate-700 bg-slate-900/65 px-3 py-2 text-sm text-slate-100 outline-none transition-all duration-300 ease-in-out focus:border-cyan-300/70"
                      />
                      <input
                        value={roleTitle}
                        onChange={(event) => setRoleTitle(event.target.value)}
                        placeholder="Title"
                        className="rounded-lg border border-slate-700 bg-slate-900/65 px-3 py-2 text-sm text-slate-100 outline-none transition-all duration-300 ease-in-out focus:border-cyan-300/70"
                      />
                    </div>
                    <div className="mt-2">
                      <input
                        value={websiteUrl}
                        onChange={(event) => setWebsiteUrl(event.target.value)}
                        placeholder="Company Website (optional)"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/65 px-3 py-2 text-sm text-slate-100 outline-none transition-all duration-300 ease-in-out focus:border-cyan-300/70"
                      />
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {companySizeBands.map((item) => {
                        const isActive = companySize === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCompanySize(item.id)}
                            className={`rounded-lg border px-3 py-2 text-left text-xs transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-cyan-300 bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-white"
                                : "border-slate-700 bg-slate-900/65 text-slate-300 hover:border-blue-400/50"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-4">
                      {aiBudgetBands.map((item) => {
                        const isActive = aiBudgetBand === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setAiBudgetBand(item.id)}
                            className={`rounded-lg border px-3 py-2 text-left text-xs transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-cyan-300 bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-white"
                                : "border-slate-700 bg-slate-900/65 text-slate-300 hover:border-blue-400/50"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      {timelineBands.map((item) => {
                        const isActive = pilotTimeline === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPilotTimeline(item.id)}
                            className={`rounded-lg border px-3 py-2 text-left text-xs transition-all duration-300 ease-in-out ${
                              isActive
                                ? "border-cyan-300 bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-white"
                                : "border-slate-700 bg-slate-900/65 text-slate-300 hover:border-blue-400/50"
                            }`}
                          >
                            Pilot window: {item.label}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={submitLeadAndGeneratePdf}
                      disabled={!canSubmitLead || leadStatus === "submitting"}
                      className={`mt-4 inline-flex w-full items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-in-out ${
                        !canSubmitLead || leadStatus === "submitting"
                          ? "cursor-not-allowed border-slate-700 bg-slate-800/80 text-slate-300"
                          : "border-blue-300/55 bg-blue-500 hover:bg-blue-400"
                      }`}
                    >
                      {leadStatus === "submitting" ? "Generating..." : "Generate Custom Board-Level Strategy Briefing"}
                    </button>
                    {leadStatusMessage ? (
                      <p
                        className={`mt-3 text-xs ${
                          leadStatus === "error"
                            ? "text-rose-300"
                            : leadStatus === "success"
                              ? "text-emerald-300"
                              : "text-slate-300"
                        }`}
                      >
                        {leadStatusMessage}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3 | 4)))}
                  disabled={wizardStep === 1}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ease-in-out ${
                    wizardStep === 1
                      ? "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
                      : "border-slate-500/70 bg-black/40 text-slate-100 hover:border-cyan-300/60 hover:text-cyan-100"
                  }`}
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => (prev === 4 ? 4 : ((prev + 1) as 1 | 2 | 3 | 4)))}
                  disabled={!canGoNext}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ease-in-out ${
                    !canGoNext
                      ? "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
                      : "border-cyan-300/60 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
                  }`}
                >
                  Next Step
                </button>
              </div>
            </div>

            <motion.aside
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="lg:sticky lg:top-24"
            >
              <div className="rounded-3xl border border-cyan-300/60 bg-slate-900/80 p-5 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.16)]">
                <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Command Center Results</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{industry.label} - {track.title}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {profile.label} | {revenueBand.label} | {maturity.label}
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-cyan-300/40 bg-black/35 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Projected Margin Expansion (bps)</p>
                    <motion.p
                      key={`bps-${projectedMarginExpansionBps}`}
                      initial={{ opacity: 0, y: 6, rotateX: -40 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 font-mono text-4xl font-semibold text-white md:text-5xl"
                    >
                      {projectedMarginExpansionBps}
                    </motion.p>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/40 bg-black/35 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">EBITDA Multiplier Upside</p>
                    <motion.p
                      key={`ebitda-${ebitdaMultiplierUpside}`}
                      initial={{ opacity: 0, y: 6, rotateX: -40 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 font-mono text-4xl font-semibold text-white md:text-5xl"
                    >
                      {ebitdaMultiplierUpside}x
                    </motion.p>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/40 bg-black/35 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Estimated Hours Decoupled from Headcount</p>
                    <motion.p
                      key={`hours-${estimatedHoursDecoupled}`}
                      initial={{ opacity: 0, y: 6, rotateX: -40 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 font-mono text-3xl font-semibold text-white md:text-4xl"
                    >
                      {estimatedHoursDecoupled}
                    </motion.p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-700 bg-black/35 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Risk + Governance Priorities</p>
                  <div className="mt-3 space-y-2">
                    {riskFlags.map((risk) => (
                      <p key={risk} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
                        {risk}
                      </p>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-cyan-100">
                    Elevated controls include Closed-Loop Data Architecture, Zero-Day IP Protection, and Enterprise Change Management.
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-700 bg-black/35 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Boardroom Investment Framing</p>
                  <p className="mt-2 text-sm text-slate-200">{programEconomicsLabel}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Current 12-month upside model: {roi12Months}% ROI | Payback window: {paybackMonths} months.
                  </p>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-black px-6 py-14 md:px-10 md:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="editorial text-3xl text-white md:text-4xl">Your Board-Level Rollout Blueprint</h2>
            <p className="mt-4 text-slate-300">
              Built from your selected inputs, this plan balances speed, control, and measurable business impact.
            </p>

            <div className="mt-6 space-y-3">
              {roadmap.map((item, index) => {
                const width = clamp(Math.round((item.days / 60) * 100), 20, 100);
                return (
                  <div key={item.phase} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{index + 1}. {item.phase}</p>
                      <p className="tech text-[11px] uppercase tracking-[0.16em] text-blue-300">{item.days} days</p>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.45, delay: index * 0.06 }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300"
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
              <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Department Activation Plan</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {departmentBlueprint.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-700 bg-black/30 p-3">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.play}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-blue-300">
                      {item.metric} | Target <span className="tech">+{item.impact}%</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-500/30 bg-slate-950/75 p-5">
            <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Executive Governance Snapshot</p>
            <div className="mt-4 space-y-3">
              {riskFlags.map((risk) => (
                <p key={risk} className="rounded-xl border border-slate-700 bg-black/35 px-3 py-3 text-sm text-slate-200">
                  {risk}
                </p>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-black/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Program Economics</p>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <p>{programEconomicsLabel}</p>
                <p>Projected Annual Savings: <span className="tech">{formatCurrency(annualSavings)}</span></p>
                <p>Projected 12-Month ROI: <span className="tech">{roi12Months}%</span></p>
                <p>Projected Margin Expansion: <span className="tech">{projectedMarginExpansionBps} bps</span></p>
                <p>EBITDA Multiplier Upside: <span className="tech">{ebitdaMultiplierUpside}x</span></p>
              </div>
            </div>

            <Link
              href="/case-studies"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/35 bg-black/35 px-4 py-2 text-sm font-semibold text-slate-100 transition-all duration-300 ease-in-out hover:border-blue-300/55 hover:text-blue-200"
            >
              Compare Against Case Studies
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
