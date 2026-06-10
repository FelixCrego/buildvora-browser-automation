"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { saasItems } from "@/lib/saasData";

type RiskBand = "Low" | "Medium" | "High";
type AllocationModel = "Balanced" | "Growth Tilt" | "Defensive";

type InvestorProjectData = {
  baselineArr: number;
  stage: "Early Revenue" | "Scaling" | "Expansion";
  riskBand: RiskBand;
  riskFactors: string[];
};

type ScenarioPreset = "Conservative" | "Base" | "Aggressive";

type ScenarioState = {
  totalCapital: number;
  horizonYears: number;
  growthRate: number;
  exitMultiple: number;
  reservePct: number;
  allocations: number[];
  riskScores: number[];
  activePreset: ScenarioPreset;
  allocationModel: AllocationModel;
};

type SavedScenario = {
  id: string;
  name: string;
  createdAt: string;
  state: ScenarioState;
};

const STORAGE_KEY = "buildvora_investor_saved_scenarios_v1";

const projectMeta: Record<string, InvestorProjectData> = {
  aipm: {
    baselineArr: 320000,
    stage: "Scaling",
    riskBand: "Medium",
    riskFactors: ["Enterprise sales cycle length", "Integration complexity", "Retention consistency"],
  },
  "felix-crm": {
    baselineArr: 410000,
    stage: "Scaling",
    riskBand: "Medium",
    riskFactors: ["Competitive CRM market", "Lead quality dependence", "Onboarding friction"],
  },
  linkgrowth: {
    baselineArr: 240000,
    stage: "Early Revenue",
    riskBand: "High",
    riskFactors: ["Search ecosystem volatility", "Outreach deliverability", "Agency adoption variance"],
  },
  "real-estate-crm": {
    baselineArr: 380000,
    stage: "Scaling",
    riskBand: "Medium",
    riskFactors: ["Regional market cycles", "Team adoption discipline", "Pipeline seasonality"],
  },
  "bluepeak-plumbing-crm": {
    baselineArr: 185000,
    stage: "Early Revenue",
    riskBand: "Medium",
    riskFactors: ["Field team operational discipline", "Dispatch workflow complexity", "SMB churn risk"],
  },
  "felix-marketing-hub": {
    baselineArr: 360000,
    stage: "Scaling",
    riskBand: "Medium",
    riskFactors: ["Creative performance variance", "Attribution complexity", "Workflow switching costs"],
  },
  "real-estate-investor-marketing-hub": {
    baselineArr: 215000,
    stage: "Early Revenue",
    riskBand: "High",
    riskFactors: ["Niche acquisition economics", "Campaign fatigue", "Data consistency across channels"],
  },
  "junior-underwriter": {
    baselineArr: 255000,
    stage: "Early Revenue",
    riskBand: "High",
    riskFactors: ["Model trust in underwriting teams", "Data quality variance", "Decision accountability concerns"],
  },
  "backlink-prospector": {
    baselineArr: 170000,
    stage: "Early Revenue",
    riskBand: "High",
    riskFactors: ["Prospecting quality drift", "Outreach platform policy shifts", "Execution consistency"],
  },
  "social-content-hub": {
    baselineArr: 290000,
    stage: "Scaling",
    riskBand: "Medium",
    riskFactors: ["Content market saturation", "Creative quality control", "Multi-channel ops complexity"],
  },
  "carrot-seoai": {
    baselineArr: 345000,
    stage: "Scaling",
    riskBand: "Medium",
    riskFactors: ["SERP algorithm changes", "Content execution quality", "Ranking volatility"],
  },
  "clawdio-click": {
    baselineArr: 270000,
    stage: "Early Revenue",
    riskBand: "High",
    riskFactors: ["Paid channel variance", "Creative fatigue risk", "Attribution reliability"],
  },
};

const riskDefaults: Record<RiskBand, number> = {
  Low: 35,
  Medium: 52,
  High: 68,
};

const stageExecutionFactor: Record<InvestorProjectData["stage"], number> = {
  "Early Revenue": 0.9,
  Scaling: 1.0,
  Expansion: 1.12,
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const fadeCard = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1 },
};

const presetConfig: Record<
  ScenarioPreset,
  {
    growthRate: number;
    exitMultiple: number;
    reservePct: number;
    horizonYears: number;
    totalCapital: number;
    stageWeight: Record<InvestorProjectData["stage"], number>;
    riskShift: number;
    probability: number;
  }
> = {
  Conservative: {
    growthRate: 24,
    exitMultiple: 5.3,
    reservePct: 22,
    horizonYears: 5,
    totalCapital: 1_600_000,
    stageWeight: { "Early Revenue": 0.82, Scaling: 1.05, Expansion: 1.2 },
    riskShift: +8,
    probability: 0.3,
  },
  Base: {
    growthRate: 34,
    exitMultiple: 6.5,
    reservePct: 14,
    horizonYears: 5,
    totalCapital: 2_000_000,
    stageWeight: { "Early Revenue": 0.95, Scaling: 1.08, Expansion: 1.22 },
    riskShift: 0,
    probability: 0.5,
  },
  Aggressive: {
    growthRate: 48,
    exitMultiple: 8.1,
    reservePct: 8,
    horizonYears: 6,
    totalCapital: 2_800_000,
    stageWeight: { "Early Revenue": 1.24, Scaling: 1.08, Expansion: 0.9 },
    riskShift: -7,
    probability: 0.2,
  },
};

const tractionKpis = [
  { metric: "ARR (Current)", value: "$3.6M", note: "Portfolio-level modeled run-rate" },
  { metric: "Net Revenue Retention", value: "118%", note: "Weighted by active product contracts" },
  { metric: "Gross Revenue Churn", value: "3.2% / qtr", note: "Trailing four-quarter blended" },
  { metric: "CAC Payback", value: "7.1 months", note: "Across paid + outbound channels" },
  { metric: "Pipeline Coverage", value: "3.4x", note: "Next-2-quarter target coverage" },
  { metric: "Operating Margin Path", value: "42% @ scale", note: "Model assumes shared infra leverage" },
];

const riskRegister = [
  {
    risk: "Concentration in early-revenue products",
    mitigation: "Cap single-position exposure to 18%; enforce staged tranche deployment.",
    owner: "Investment Committee",
    status: "Active",
  },
  {
    risk: "Paid channel volatility",
    mitigation: "Rebalance budget weekly by signal quality and CAC drift thresholds.",
    owner: "Growth Ops Lead",
    status: "Mitigated",
  },
  {
    risk: "Cross-product execution bandwidth",
    mitigation: "Prioritize launches via execution score gates and shared-release calendar.",
    owner: "Platform PM",
    status: "Active",
  },
  {
    risk: "AI output quality inconsistency",
    mitigation: "Human verification for high-impact decision recommendations.",
    owner: "AI Systems Lead",
    status: "Controlled",
  },
];

const useOfFunds = [
  { bucket: "Product and Engineering", pct: 38 },
  { bucket: "Go-To-Market Acceleration", pct: 29 },
  { bucket: "Data and AI Infrastructure", pct: 17 },
  { bucket: "Operations and Enablement", pct: 10 },
  { bucket: "Compliance and Contingency", pct: 6 },
];

const dataRoomAssets = [
  { name: "Portfolio KPI Workbook", type: "Metrics", status: "Ready", href: "mailto:felix@felixcrego.com?subject=BuildVora%20KPI%20Workbook" },
  { name: "Product Architecture Brief", type: "Technical", status: "Ready", href: "mailto:felix@felixcrego.com?subject=BuildVora%20Architecture%20Brief" },
  { name: "Customer Cohort and Retention Deck", type: "Commercial", status: "Ready", href: "mailto:felix@felixcrego.com?subject=BuildVora%20Retention%20Deck" },
  { name: "Governance and Terms Summary", type: "Legal", status: "In Review", href: "mailto:felix@felixcrego.com?subject=BuildVora%20Governance%20Summary" },
];

function encodeScenario(state: ScenarioState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

function decodeScenario(input: string): ScenarioState | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(input))));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ScenarioState;
  } catch {
    return null;
  }
}

export default function InvestorsInteractive() {
  const projects = useMemo(
    () =>
      saasItems.map((item) => ({
        ...item,
        investor: projectMeta[item.slug] ?? {
          baselineArr: 150000,
          stage: "Early Revenue" as const,
          riskBand: "High" as const,
          riskFactors: ["Product-market fit timing", "Go-to-market consistency", "Execution bandwidth"],
        },
      })),
    [],
  );

  const [totalCapital, setTotalCapital] = useState(2_000_000);
  const [horizonYears, setHorizonYears] = useState(5);
  const [growthRate, setGrowthRate] = useState(34);
  const [exitMultiple, setExitMultiple] = useState(6.5);
  const [reservePct, setReservePct] = useState(14);
  const [activePreset, setActivePreset] = useState<ScenarioPreset>("Base");
  const [allocationModel, setAllocationModel] = useState<AllocationModel>("Balanced");

  const initialAllocation = Math.round(totalCapital / projects.length);
  const [allocations, setAllocations] = useState<number[]>(projects.map(() => initialAllocation));
  const [riskScores, setRiskScores] = useState<number[]>(
    projects.map((project) => riskDefaults[project.investor.riskBand]),
  );
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  const buildPresetAllocations = (preset: ScenarioPreset) => {
    const config = presetConfig[preset];
    const projectWeights = projects.map((project) => config.stageWeight[project.investor.stage] ?? 1);
    const weightTotal = projectWeights.reduce((sum, value) => sum + value, 0);
    const builtAllocations = projects.map((_, idx) =>
      Math.round((config.totalCapital * projectWeights[idx]) / (weightTotal || 1)),
    );
    const builtRiskScores = projects.map((project) => {
      const base = riskDefaults[project.investor.riskBand] + config.riskShift;
      return Math.max(20, Math.min(85, base));
    });
    return { builtAllocations, builtRiskScores };
  };

  const applyPreset = (preset: ScenarioPreset) => {
    const config = presetConfig[preset];
    const { builtAllocations, builtRiskScores } = buildPresetAllocations(preset);
    setActivePreset(preset);
    setAllocationModel("Balanced");
    setGrowthRate(config.growthRate);
    setExitMultiple(config.exitMultiple);
    setReservePct(config.reservePct);
    setHorizonYears(config.horizonYears);
    setTotalCapital(config.totalCapital);
    setAllocations(builtAllocations);
    setRiskScores(builtRiskScores);
  };

  const applyAllocationModel = (model: AllocationModel) => {
    setAllocationModel(model);
    const deployable = Math.round(totalCapital * (1 - reservePct / 100));
    const weights = projects.map((project) => {
      if (model === "Balanced") return 1;
      if (model === "Growth Tilt") {
        return project.investor.stage === "Early Revenue" ? 1.35 : project.investor.stage === "Scaling" ? 1.05 : 0.75;
      }
      return project.investor.stage === "Scaling" ? 1.25 : project.investor.stage === "Expansion" ? 1.15 : 0.75;
    });
    const weightTotal = weights.reduce((sum, value) => sum + value, 0) || 1;
    setAllocations(weights.map((weight) => Math.round((deployable * weight) / weightTotal)));
  };

  const captureScenarioState = (): ScenarioState => ({
    totalCapital,
    horizonYears,
    growthRate,
    exitMultiple,
    reservePct,
    allocations,
    riskScores,
    activePreset,
    allocationModel,
  });

  const applyScenarioState = (state: ScenarioState) => {
    setTotalCapital(state.totalCapital);
    setHorizonYears(state.horizonYears);
    setGrowthRate(state.growthRate);
    setExitMultiple(state.exitMultiple);
    setReservePct(state.reservePct);
    setAllocations(state.allocations);
    setRiskScores(state.riskScores);
    setActivePreset(state.activePreset);
    setAllocationModel(state.allocationModel);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedScenario[];
        if (Array.isArray(parsed)) setSavedScenarios(parsed);
      }
    } catch {
      // ignore invalid storage payload
    }

    const params = new URLSearchParams(window.location.search);
    const scenarioParam = params.get("scenario");
    if (scenarioParam) {
      const decoded = decodeScenario(scenarioParam);
      if (decoded) applyScenarioState(decoded);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  const saveScenario = () => {
    const name = window.prompt("Scenario name", `Scenario ${savedScenarios.length + 1}`) || `Scenario ${savedScenarios.length + 1}`;
    const state = captureScenarioState();
    const next: SavedScenario = {
      id: `${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      state,
    };
    setSavedScenarios((prev) => [next, ...prev].slice(0, 12));
  };

  const deleteScenario = (id: string) => {
    setSavedScenarios((prev) => prev.filter((item) => item.id !== id));
  };

  const shareScenario = async () => {
    const state = captureScenarioState();
    const encoded = encodeScenario(state);
    const url = `${window.location.origin}${window.location.pathname}?scenario=${encodeURIComponent(encoded)}`;
    try {
      await navigator.clipboard.writeText(url);
      window.alert("Share link copied.");
    } catch {
      window.prompt("Copy share link", url);
    }
  };

  const downloadIcMemo = () => {
    const lines = [
      "BuildVora Investment Committee Memo",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "Scenario",
      `Preset: ${activePreset}`,
      `Allocation Model: ${allocationModel}`,
      `Total Capital: ${currency.format(totalCapital)}`,
      `Reserve: ${reservePct}%`,
      `Growth: ${growthRate}%`,
      `Exit Multiple: ${number.format(exitMultiple)}x`,
      `Horizon: ${horizonYears} years`,
      "",
      `Deployable Capital: ${currency.format(Math.round(totalCapital * (1 - reservePct / 100)))}`,
      `Allocated Capital: ${currency.format(allocations.reduce((sum, v) => sum + v, 0))}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buildvora-ic-memo.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const runPortfolioModel = (
    localGrowthRate: number,
    localExitMultiple: number,
    localReservePct: number,
    localHorizonYears: number,
    localTotalCapital: number,
    localAllocations: number[],
    localRiskScores: number[],
  ) => {
    const localDeployableCapital = Math.round(localTotalCapital * (1 - localReservePct / 100));
    const localAllocatedTotal = localAllocations.reduce((sum, value) => sum + value, 0);

    const localProjectModels = projects.map((project, idx) => {
      const allocation = localAllocations[idx] ?? 0;
      const riskScore = localRiskScores[idx] ?? riskDefaults[project.investor.riskBand];
      const riskHaircut = Math.max(0.35, 1 - riskScore / 130);
      const annualGrowth = (localGrowthRate / 100) * stageExecutionFactor[project.investor.stage];
      const projectedArr =
        project.investor.baselineArr * Math.pow(1 + annualGrowth * riskHaircut, localHorizonYears);
      const allocationUpside =
        allocation * Math.pow(1 + annualGrowth * riskHaircut, localHorizonYears) * (1 + localExitMultiple / 14);
      const projectedValue = projectedArr * localExitMultiple + allocationUpside * 0.35;
      const moic = allocation > 0 ? projectedValue / allocation : 0;
      return { ...project, allocation, riskScore, projectedArr, projectedValue, moic };
    });

    const portfolioValue = localProjectModels.reduce((sum, project) => sum + project.projectedValue, 0);
    const portfolioArr = localProjectModels.reduce((sum, project) => sum + project.projectedArr, 0);
    const portfolioMoic = localAllocatedTotal > 0 ? portfolioValue / localAllocatedTotal : 0;
    const avgRisk = localRiskScores.reduce((sum, score) => sum + score, 0) / (localRiskScores.length || 1);
    return {
      localDeployableCapital,
      localAllocatedTotal,
      portfolioValue,
      portfolioArr,
      portfolioMoic,
      avgRisk,
      localProjectModels,
    };
  };

  const currentModel = runPortfolioModel(
    growthRate,
    exitMultiple,
    reservePct,
    horizonYears,
    totalCapital,
    allocations,
    riskScores,
  );

  const {
    localDeployableCapital: deployableCapital,
    localAllocatedTotal: allocatedTotal,
    portfolioValue,
    portfolioArr,
    portfolioMoic,
    avgRisk: avgRiskScore,
    localProjectModels: projectModels,
  } = currentModel;

  const portfolioProfit = portfolioValue - allocatedTotal;

  const riskBandCounts = projectModels.reduce(
    (acc, project) => {
      acc[project.investor.riskBand] += 1;
      return acc;
    },
    { Low: 0, Medium: 0, High: 0 } as Record<RiskBand, number>,
  );

  const topAllocatedProjects = [...projectModels].sort((a, b) => b.allocation - a.allocation).slice(0, 5);
  const maxPositionPct = allocatedTotal > 0 ? (topAllocatedProjects[0]?.allocation / allocatedTotal) * 100 : 0;
  const concentrationLimit = 18;
  const concentrationAlerts = topAllocatedProjects.filter(
    (project) => allocatedTotal > 0 && (project.allocation / allocatedTotal) * 100 > concentrationLimit,
  );

  const allocationUtilization = deployableCapital > 0 ? (allocatedTotal / deployableCapital) * 100 : 0;
  const utilizationBarWidth = Math.max(0, Math.min(100, allocationUtilization));
  const highRiskExposurePct =
    allocatedTotal > 0
      ? (projectModels
          .filter((project) => project.investor.riskBand === "High")
          .reduce((sum, project) => sum + project.allocation, 0) /
          allocatedTotal) *
        100
      : 0;
  const totalRiskProjects = projectModels.length || 1;
  const riskDistribution = (["High", "Medium", "Low"] as RiskBand[]).map((band) => ({
    band,
    count: riskBandCounts[band],
    pct: (riskBandCounts[band] / totalRiskProjects) * 100,
  }));

  const allocationHealth =
    allocatedTotal > deployableCapital
      ? "Overallocated"
      : allocatedTotal < deployableCapital * 0.9
        ? "Underallocated"
        : "Balanced";

  const healthTone =
    allocationHealth === "Balanced"
      ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10"
      : allocationHealth === "Overallocated"
        ? "text-rose-300 border-rose-500/40 bg-rose-500/10"
        : "text-amber-300 border-amber-500/40 bg-amber-500/10";

  const riskTone = (riskBand: RiskBand) =>
    riskBand === "Low"
      ? "border-emerald-500/45 bg-emerald-500/12 text-emerald-200"
      : riskBand === "Medium"
        ? "border-amber-500/45 bg-amber-500/12 text-amber-200"
        : "border-rose-500/45 bg-rose-500/12 text-rose-200";

  const scenarioMatrix = (Object.keys(presetConfig) as ScenarioPreset[]).map((preset) => {
    const config = presetConfig[preset];
    const { builtAllocations, builtRiskScores } = buildPresetAllocations(preset);
    const result = runPortfolioModel(
      config.growthRate,
      config.exitMultiple,
      config.reservePct,
      config.horizonYears,
      config.totalCapital,
      builtAllocations,
      builtRiskScores,
    );
    return {
      preset,
      probability: config.probability,
      moic: result.portfolioMoic,
      value: result.portfolioValue,
      arr: result.portfolioArr,
      risk: result.avgRisk,
    };
  });

  const weightedExpectedValue = scenarioMatrix.reduce(
    (sum, scenario) => sum + scenario.value * scenario.probability,
    0,
  );

  const growthSteps = [20, 30, 40, 50];
  const exitSteps = [5.0, 6.5, 8.0, 9.5];
  const sensitivityGrid = growthSteps.map((g) =>
    exitSteps.map((e) => {
      const result = runPortfolioModel(g, e, reservePct, horizonYears, totalCapital, allocations, riskScores);
      return result.portfolioMoic;
    }),
  );
  const moicMin = Math.min(...sensitivityGrid.flat());
  const moicMax = Math.max(...sensitivityGrid.flat());

  const getMoicCellClass = (value: number) => {
    const ratio = (value - moicMin) / ((moicMax - moicMin) || 1);
    if (ratio > 0.74) return "bg-emerald-500/30 border-emerald-400/45 text-emerald-100";
    if (ratio > 0.5) return "bg-blue-500/25 border-blue-400/45 text-blue-100";
    if (ratio > 0.3) return "bg-amber-500/20 border-amber-400/45 text-amber-100";
    return "bg-rose-500/20 border-rose-400/45 text-rose-100";
  };

  return (
    <main className="bg-black text-slate-100">
      <section className="mesh-bg relative isolate overflow-hidden border-b border-slate-900">
        <div className="pointer-events-none absolute -right-20 top-6 h-72 w-72 rounded-full bg-blue-500/18 blur-3xl" />
        <div className="pointer-events-none absolute left-[28%] top-0 h-80 w-32 rotate-12 bg-cyan-400/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 pt-20 md:px-10 md:pb-20 md:pt-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Link href="/" className="text-xs uppercase tracking-[0.2em] text-blue-300 hover:text-blue-200">
              Back To Home
            </Link>
            <p className="mt-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
              Investor Decision Workspace
            </p>
            <h1 className="editorial mt-4 text-4xl text-white md:text-6xl">Capital Intelligence Console</h1>
            <p className="mt-5 max-w-4xl text-slate-300">
              Stress-test deployment strategy in real time. Switch market posture, inspect risk concentration, and
              see portfolio-level impact before a single dollar is committed.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Deployable</p>
                <p className="mt-2 text-lg font-semibold text-white">{currency.format(deployableCapital)}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Projected Value</p>
                <p className="mt-2 text-lg font-semibold text-white">{currency.format(portfolioValue)}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Estimated MOIC</p>
                <p className="mt-2 text-lg font-semibold text-white">{number.format(portfolioMoic)}x</p>
              </div>
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeCard}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-blue-500/30 bg-slate-950/72 p-5 shadow-[0_0_70px_rgba(59,130,246,0.22)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">Investor Signal Feed</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(presetConfig) as ScenarioPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
                      activePreset === preset
                        ? "border-blue-400 bg-blue-500/20 text-blue-100"
                        : "border-slate-700 bg-black/35 text-slate-300 hover:border-blue-500/55 hover:text-blue-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Scenario Controls</p>
                  <div className="flex gap-2">
                    <button onClick={saveScenario} className="rounded-full border border-slate-700 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-200 hover:border-blue-500/55 hover:text-blue-200">Save</button>
                    <button onClick={shareScenario} className="rounded-full border border-slate-700 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-200 hover:border-blue-500/55 hover:text-blue-200">Share</button>
                    <button onClick={downloadIcMemo} className="rounded-full border border-slate-700 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-200 hover:border-blue-500/55 hover:text-blue-200">IC Memo</button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-300">Last data update: May 8, 2026</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Portfolio ARR Runway</p>
                <p className="mt-1 text-sm text-slate-100">{currency.format(portfolioArr)}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Allocation Utilization</p>
                  <span className="text-xs text-blue-200">{number.format(allocationUtilization)}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    className={`h-full ${
                      allocationHealth === "Balanced"
                        ? "bg-emerald-400"
                        : allocationHealth === "Overallocated"
                          ? "bg-rose-400"
                          : "bg-amber-300"
                    }`}
                    animate={{ width: `${utilizationBarWidth}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 22 }}
                  />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.17em] text-slate-300">{allocationHealth}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Risk Distribution</p>
                  <span className="text-xs text-slate-200">{number.format(avgRiskScore)}/100 Avg</span>
                </div>
                <div className="mt-3 space-y-2">
                  {riskDistribution.map((entry) => (
                    <div key={entry.band}>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.17em] text-slate-300">
                        <span>{entry.band}</span>
                        <span>
                          {entry.count} ({number.format(entry.pct)}%)
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                          className={
                            entry.band === "High"
                              ? "h-full bg-rose-400"
                              : entry.band === "Medium"
                                ? "h-full bg-amber-300"
                                : "h-full bg-emerald-400"
                          }
                          animate={{ width: `${entry.pct}%` }}
                          transition={{ duration: 0.45 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Capital Concentration</p>
                  <span className="text-xs text-slate-200">{number.format(maxPositionPct)}% Max Position</span>
                </div>
                <div className="mt-2 text-xs text-slate-300">Policy limit: {concentrationLimit}% per project</div>
                {concentrationAlerts.length > 0 ? (
                  <div className="mt-2 rounded-lg border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    Alert: {concentrationAlerts.map((item) => item.name).join(", ")} exceed concentration policy.
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                    Concentration is within policy threshold.
                  </div>
                )}
                <div className="mt-3 space-y-2">
                  {topAllocatedProjects.slice(0, 3).map((project) => (
                    <div key={`hero-${project.slug}`}>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.17em] text-slate-300">
                        <span className="truncate pr-2">{project.name}</span>
                        <span>{number.format((project.allocation / (allocatedTotal || 1)) * 100)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                          className="h-full bg-blue-400"
                          animate={{ width: `${(project.allocation / (allocatedTotal || 1)) * 100}%` }}
                          transition={{ duration: 0.45 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#01040b] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Verified Traction Snapshot</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/90">
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Source Note</th>
                </tr>
              </thead>
              <tbody>
                {tractionKpis.map((row) => (
                  <tr key={row.metric} className="border-t border-slate-800 bg-black/45">
                    <td className="px-4 py-3 text-slate-100">{row.metric}</td>
                    <td className="px-4 py-3 font-semibold text-blue-200">{row.value}</td>
                    <td className="px-4 py-3 text-slate-300">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#02050d] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="editorial text-3xl text-white md:text-4xl"
          >
            Portfolio Outcome Simulator
          </motion.h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["Balanced", "Growth Tilt", "Defensive"] as AllocationModel[]).map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => applyAllocationModel(model)}
                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
                  allocationModel === model
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-black/35 text-slate-300 hover:border-blue-500/55 hover:text-blue-200"
                }`}
              >
                {model}
              </button>
            ))}
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.18 }}
              variants={fadeCard}
              className="rounded-2xl border border-slate-800 bg-slate-950/75 p-6 shadow-[0_0_55px_rgba(15,23,42,0.55)]"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <RangeControl label="Total Capital" min={500000} max={10000000} step={50000} value={totalCapital} formatter={(v) => currency.format(v)} onChange={setTotalCapital} />
                <RangeControl label="Reserve Buffer" min={0} max={40} step={1} value={reservePct} formatter={(v) => `${v}%`} onChange={setReservePct} />
                <RangeControl label="Investment Horizon" min={1} max={8} step={1} value={horizonYears} formatter={(v) => `${v} years`} onChange={setHorizonYears} />
                <RangeControl label="Growth Assumption" min={12} max={80} step={1} value={growthRate} formatter={(v) => `${v}%`} onChange={setGrowthRate} />
                <RangeControl label="Exit Multiple" min={3} max={12} step={0.1} value={exitMultiple} formatter={(v) => `${number.format(v)}x ARR`} onChange={setExitMultiple} />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.18 }}
              variants={fadeCard}
              className="rounded-2xl border border-blue-500/30 bg-black/60 p-6 shadow-[0_0_60px_rgba(59,130,246,0.2)]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Scenario Summary</p>
              <div className="mt-4 grid gap-3">
                <SummaryRow label="Deployable Capital" value={currency.format(deployableCapital)} />
                <SummaryRow label="Allocated Capital" value={currency.format(allocatedTotal)} />
                <SummaryRow label="Projected Portfolio ARR" value={currency.format(portfolioArr)} />
                <SummaryRow label="Projected Portfolio Value" value={currency.format(portfolioValue)} />
                <SummaryRow label="Potential Profit" value={currency.format(portfolioProfit)} />
                <SummaryRow label="Estimated MOIC" value={`${number.format(portfolioMoic)}x`} />
              </div>
              <div className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${healthTone}`}>
                Allocation Status: {allocationHealth}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#02040a] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Scenario Matrix (Weighted)</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/90">
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-3">Scenario</th>
                  <th className="px-4 py-3">Probability</th>
                  <th className="px-4 py-3">Projected Value</th>
                  <th className="px-4 py-3">Projected ARR</th>
                  <th className="px-4 py-3">MOIC</th>
                  <th className="px-4 py-3">Avg Risk</th>
                </tr>
              </thead>
              <tbody>
                {scenarioMatrix.map((row) => (
                  <tr key={row.preset} className="border-t border-slate-800 bg-black/45">
                    <td className="px-4 py-3 text-slate-100">{row.preset}</td>
                    <td className="px-4 py-3 text-slate-200">{number.format(row.probability * 100)}%</td>
                    <td className="px-4 py-3 text-blue-200">{currency.format(row.value)}</td>
                    <td className="px-4 py-3 text-slate-200">{currency.format(row.arr)}</td>
                    <td className="px-4 py-3 font-semibold text-white">{number.format(row.moic)}x</td>
                    <td className="px-4 py-3 text-slate-300">{number.format(row.risk)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Probability-weighted expected value: {currency.format(weightedExpectedValue)}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#03060f] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Sensitivity Heatmap (Growth x Exit)</h2>
          <p className="mt-3 text-slate-300">
            Cell values show MOIC under different growth and exit multiple assumptions.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[720px] border-separate border-spacing-2 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-slate-400">Growth \ Exit</th>
                  {exitSteps.map((exit) => (
                    <th key={`exit-${exit}`} className="px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                      {number.format(exit)}x
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {growthSteps.map((growth, rowIdx) => (
                  <tr key={`growth-${growth}`}>
                    <td className="px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">{growth}%</td>
                    {exitSteps.map((exit, colIdx) => {
                      const moic = sensitivityGrid[rowIdx][colIdx];
                      return (
                        <td key={`moic-${growth}-${exit}`} className={`rounded border px-3 py-2 ${getMoicCellClass(moic)}`}>
                          {number.format(moic)}x
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#04070f] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="editorial text-3xl text-white md:text-4xl">Per-Project Investment Calculator</h2>
          <p className="mt-4 max-w-3xl text-slate-300">
            Set allocation and risk score for each project to model capital efficiency and expected return under your
            current portfolio assumptions.
          </p>

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {projectModels.map((project, idx) => (
              <motion.article
                key={project.slug}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.12 }}
                variants={fadeCard}
                transition={{ duration: 0.35, delay: idx * 0.02 }}
                className="rounded-2xl border border-slate-800 bg-black/62 p-5 transition hover:border-blue-500/45 hover:shadow-[0_0_55px_rgba(59,130,246,0.16)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                    <p className="mt-1 text-sm text-blue-300">{project.category}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {project.investor.stage}
                    </div>
                    <div className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${riskTone(project.investor.riskBand)}`}>
                      {project.investor.riskBand} Risk
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <RangeControl
                    label="Capital Allocation"
                    min={0}
                    max={totalCapital}
                    step={25000}
                    value={project.allocation}
                    formatter={(v) => currency.format(v)}
                    onChange={(value) => setAllocations((prev) => prev.map((n, i) => (i === idx ? value : n)))}
                  />
                  <RangeControl
                    label="Risk Score"
                    min={20}
                    max={85}
                    step={1}
                    value={project.riskScore}
                    formatter={(v) => `${v}/100`}
                    onChange={(value) => setRiskScores((prev) => prev.map((n, i) => (i === idx ? value : n)))}
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <SummaryMini label="Baseline ARR" value={currency.format(project.investor.baselineArr)} />
                  <SummaryMini label="Projected ARR" value={currency.format(project.projectedArr)} />
                  <SummaryMini label="Projected Value" value={currency.format(project.projectedValue)} />
                  <SummaryMini label="Potential Profit" value={currency.format(project.projectedValue - project.allocation)} />
                  <SummaryMini label="MOIC" value={`${number.format(project.moic)}x`} />
                  <SummaryMini label="Risk Band" value={project.investor.riskBand} />
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Risk Factors</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                    {project.investor.riskFactors.map((factor) => (
                      <li key={`${project.slug}-${factor}`}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#02040a] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h3 className="text-lg font-semibold text-white">Risk Register and Mitigation Tracking</h3>
            <div className="mt-4 space-y-3">
              {riskRegister.map((row) => (
                <div key={row.risk} className="rounded-xl border border-slate-800 bg-black/45 p-3">
                  <p className="text-sm font-semibold text-white">{row.risk}</p>
                  <p className="mt-1 text-sm text-slate-300">{row.mitigation}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-blue-300">
                    Owner: {row.owner} | Status: {row.status}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h3 className="text-lg font-semibold text-white">Deal Mechanics and Use of Funds</h3>
            <div className="mt-4 rounded-xl border border-slate-800 bg-black/45 p-4 text-sm text-slate-200">
              <p>Target check size: {currency.format(500000)} to {currency.format(2_500_000)}</p>
              <p className="mt-1">Deployment cadence: tranche-based at milestone checkpoints</p>
              <p className="mt-1">Governance: quarterly IC review + monthly KPI integrity audits</p>
            </div>
            <div className="mt-4 space-y-3">
              {useOfFunds.map((item) => (
                <div key={item.bucket} className="rounded-xl border border-slate-800 bg-black/45 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-200">
                    <span>{item.bucket}</span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-blue-400" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-[#03060d] px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h3 className="text-lg font-semibold text-white">Saved Scenarios</h3>
            <div className="mt-4 space-y-2">
              {savedScenarios.length === 0 ? (
                <p className="text-sm text-slate-400">No saved scenarios yet.</p>
              ) : (
                savedScenarios.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-800 bg-black/45 p-3">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => applyScenarioState(item.state)}
                        className="rounded-full border border-blue-500/45 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-blue-200"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteScenario(item.id)}
                        className="rounded-full border border-rose-500/45 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-rose-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h3 className="text-lg font-semibold text-white">Data Room Bridge</h3>
            <div className="mt-4 space-y-2">
              {dataRoomAssets.map((asset) => (
                <a key={asset.name} href={asset.href} className="block rounded-lg border border-slate-800 bg-black/45 p-3 hover:border-blue-500/45">
                  <p className="text-sm font-semibold text-white">{asset.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {asset.type} | {asset.status}
                  </p>
                </a>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h3 className="text-lg font-semibold text-white">Investment Committee Pack</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>Thesis and market context summary</li>
              <li>Risk register with mitigations and owners</li>
              <li>Scenario comparison and sensitivity tables</li>
              <li>Milestone-based tranche recommendation</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={downloadIcMemo}
                className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-4 py-2 text-xs font-semibold text-white"
              >
                Download One-Page Memo
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-blue-500 hover:text-blue-300"
              >
                Print Brief
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-blue-500/25 bg-slate-950/70 p-8">
          <h2 className="editorial text-3xl text-white md:text-4xl">Start Investor Conversation</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            We can walk through assumptions, risk allocations, governance, and tranche structures with your team.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:felix@felixcrego.com?subject=BuildVora%20Investor%20Inquiry"
              className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Investor Contact
            </a>
            <Link
              href="/upcoming-projects"
              className="inline-flex rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:text-blue-300"
            >
              View Upcoming Projects
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function RangeControl({
  label,
  min,
  max,
  step,
  value,
  formatter,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  formatter: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block rounded-xl border border-slate-800 bg-black/55 p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <span className="tech text-[11px] uppercase tracking-[0.18em] text-blue-300">{label}</span>
        <span className="text-sm text-slate-100">{formatter(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-blue-500"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/72 px-3 py-2">
      <p className="tech text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function SummaryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/62 px-3 py-2">
      <p className="tech text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

