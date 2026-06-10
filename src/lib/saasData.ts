export type SaaSItem = {
  slug: string;
  name: string;
  url: string;
  category: string;
  imageSrc?: string;
  tagline: string;
  summary: string;
  aiLeverage: string[];
  coreFeatures: string[];
  benefits: string[];
  caseStudy: {
    companyType: string;
    challenge: string;
    implementation: string[];
    outcomes: string[];
  };
};

export const saasItems: SaaSItem[] = [
  {
    slug: "browser-automation",
    name: "BuildVora Browser Automation",
    url: "/saas/browser-automation#trial",
    category: "Browser Automation OS",
    imageSrc: "/screenshots/browser-automation.svg",
    tagline: "Four-layer AI browser automation for revenue, ops, and research workflows.",
    summary:
      "BuildVora Browser Automation gives teams a robust automation layer for browser-based work across LinkedIn, Gmail, Amazon, Robinhood, CRM portals, and other multi-step operator workflows.",
    aiLeverage: [
      "Planner AI translates business goals into deterministic browser task graphs",
      "Execution AI handles dynamic page interaction, retries, and fallback navigation",
      "Verification AI checks outputs, state changes, and success criteria before completion",
      "Optimization AI learns from runs, tunes selectors, and improves future automations with credit-aware efficiency",
    ],
    coreFeatures: [
      "Multi-site browser automation templates with guarded execution flows",
      "Credits-based orchestration for trial, sandbox, and production usage",
      "Automation request builder with ChatGPT-assisted scope definition",
    ],
    benefits: [
      "Reduces manual browser work across prospecting, inbox handling, order research, and trading workflows",
      "Improves accuracy through layered verification before outputs are finalized",
      "Turns custom automation requests into structured downloadable run files for client deployment",
    ],
    caseStudy: {
      companyType: "Revenue and operations teams managing browser-heavy workflows",
      challenge:
        "Teams were losing hours every week to repetitive browser tasks across fragmented platforms with inconsistent execution quality.",
      implementation: [
        "Mapped cross-site automation intents into reusable browser workflow blueprints",
        "Added four AI layers for planning, execution, verification, and optimization",
        "Introduced credits-based usage, free-trial gating, and downloadable automation specs for client handoff",
      ],
      outcomes: [
        "Manual browser operations compressed into reusable automation runs",
        "Higher confidence in outputs through pre-completion verification checks",
        "Faster path from idea to deployable automation specification",
      ],
    },
  },
  {
    slug: "aipm",
    name: "AIPM",
    url: "https://aipm-ruddy-two.vercel.app/dashboard",
    category: "Project Intelligence",
    tagline: "AI-powered project execution and delivery control.",
    summary:
      "AIPM centralizes project visibility, risk monitoring, and operational updates so leadership can move faster with fewer blind spots.",
    aiLeverage: [
      "Automated project status summarization across teams",
      "Risk pattern detection from task and timeline movement",
      "Prioritized action recommendations for PM leads",
    ],
    coreFeatures: [
      "Executive dashboard with delivery signals",
      "Task, timeline, and dependency tracking",
      "Automated alerts and recap generation",
    ],
    benefits: [
      "Improves project predictability",
      "Reduces meeting overhead through AI recaps",
      "Accelerates stakeholder decision cycles",
    ],
    caseStudy: {
      companyType: "Multi-team product and services operator",
      challenge:
        "Project reporting was fragmented across tools and leadership had delayed insight into execution risk.",
      implementation: [
        "Connected project streams and normalized status signals",
        "Enabled AI-generated weekly rollups for each pod",
        "Configured risk alerts for timeline slip and blocked dependencies",
      ],
      outcomes: [
        "Leadership review prep time reduced by 60%",
        "High-risk initiatives surfaced earlier in each sprint cycle",
        "Cross-team accountability improved through shared visibility",
      ],
    },
  },
  {
    slug: "felix-crm",
    name: "Felix CRM",
    url: "https://felix-crm-xi.vercel.app/dashboard",
    category: "Sales CRM",
    tagline: "Pipeline clarity and follow-up velocity at scale.",
    summary:
      "Felix CRM helps teams manage leads, opportunities, and communication while AI assists with qualification and next-best actions.",
    aiLeverage: [
      "Lead quality scoring and urgency ranking",
      "Follow-up sequence drafting and personalization",
      "Deal risk analysis based on engagement behavior",
    ],
    coreFeatures: [
      "Pipeline board and stage management",
      "Account and contact history timelines",
      "Task automation for reps and managers",
    ],
    benefits: [
      "Increases follow-up consistency",
      "Improves pipeline hygiene",
      "Helps reps prioritize high-probability opportunities",
    ],
    caseStudy: {
      companyType: "Growth-focused inbound and outbound sales team",
      challenge:
        "Reps were missing follow-ups and the team lacked a reliable view of deal momentum.",
      implementation: [
        "Rolled out unified pipeline stages and activity scoring",
        "Enabled AI-generated follow-up suggestions by stage",
        "Set alerting on stalled opportunities",
      ],
      outcomes: [
        "Follow-up SLA compliance increased significantly",
        "Average stage velocity improved across core funnel stages",
        "Managers gained cleaner forecast visibility",
      ],
    },
  },
  {
    slug: "linkgrowth",
    name: "LinkGrowth AI",
    url: "https://linkgrowth-ai-saas.vercel.app/",
    category: "SEO & Authority Growth",
    tagline: "AI-assisted link strategy and outreach execution.",
    summary:
      "LinkGrowth AI supports teams with prospecting, outreach planning, and performance tracking for sustainable organic authority.",
    aiLeverage: [
      "Prospect relevance scoring based on niche signals",
      "Outreach angle generation for each target domain",
      "Campaign performance summaries and iteration suggestions",
    ],
    coreFeatures: [
      "Domain prospecting and qualification workspace",
      "Outreach campaign tracking",
      "Link growth analytics and reporting",
    ],
    benefits: [
      "Speeds up quality link prospecting",
      "Improves outreach personalization",
      "Keeps campaign iteration data-driven",
    ],
    caseStudy: {
      companyType: "SEO agency managing multiple client campaigns",
      challenge:
        "Manual prospecting was slow and campaign quality varied by strategist.",
      implementation: [
        "Standardized scoring model for prospect quality",
        "Used AI outreach angles per campaign segment",
        "Built weekly campaign review loops from analytics output",
      ],
      outcomes: [
        "Prospecting throughput increased with better consistency",
        "Response quality improved through tailored messaging",
        "Client reporting became clearer and faster to produce",
      ],
    },
  },
  {
    slug: "real-estate-crm",
    name: "Real Estate CRM",
    url: "https://real-estate-crm-two-pi.vercel.app/dashboard",
    category: "Real Estate Operations",
    tagline: "Lead-to-close command center for real estate teams.",
    summary:
      "A dedicated real estate workflow system for lead intake, deal progression, and communication tracking with AI-assisted follow-up.",
    aiLeverage: [
      "Lead intent scoring from inquiry behavior",
      "Conversation and call note summarization",
      "Recommended next action per opportunity",
    ],
    coreFeatures: [
      "Real estate lead pipeline views",
      "Contact management and communication logs",
      "Task and appointment coordination",
    ],
    benefits: [
      "Improves close-rate focus",
      "Reduces lead leakage",
      "Keeps teams consistent across fast-moving deal cycles",
    ],
    caseStudy: {
      companyType: "Local investor and acquisition team",
      challenge:
        "Leads from multiple channels were difficult to prioritize and deals slowed in mid-funnel.",
      implementation: [
        "Centralized all lead sources into one workflow",
        "Activated AI stage-based follow-up suggestions",
        "Configured manager alerts for aging opportunities",
      ],
      outcomes: [
        "Faster lead triage and cleaner pipeline prioritization",
        "Improved conversion through consistent follow-up",
        "Shorter time-to-action for high-intent opportunities",
      ],
    },
  },
  {
    slug: "bluepeak-plumbing-crm",
    name: "BluePeak Plumbing CRM",
    url: "https://bluepeak-plumbing-crm.vercel.app/dashboard",
    category: "Field Service CRM",
    tagline: "Service lead and job pipeline for plumbing operators.",
    summary:
      "BluePeak CRM helps home-service teams track inbound demand, dispatch progress, and customer communication with AI assistance.",
    aiLeverage: [
      "Job urgency classification from intake context",
      "Automated service recap drafts for customers",
      "Follow-up prompts for unresolved service opportunities",
    ],
    coreFeatures: [
      "Service request and job status board",
      "Customer and property history tracking",
      "Operational task assignment and reminders",
    ],
    benefits: [
      "Improves response consistency for inbound requests",
      "Raises customer communication quality",
      "Supports tighter scheduling execution",
    ],
    caseStudy: {
      companyType: "Regional plumbing and maintenance provider",
      challenge:
        "Service requests were handled inconsistently and communication gaps impacted repeat business.",
      implementation: [
        "Unified intake, job status, and customer records",
        "Enabled AI recap generation after each service interaction",
        "Configured reminders for open estimates and follow-ups",
      ],
      outcomes: [
        "Operational handoffs became more reliable",
        "Customer follow-up completion improved",
        "Teams gained a clearer daily dispatch picture",
      ],
    },
  },
  {
    slug: "felix-marketing-hub",
    name: "Felix Marketing Hub",
    url: "https://felix-marketing-hub.vercel.app/login",
    category: "Marketing OS",
    tagline: "Campaign planning, content production, and analytics in one workspace.",
    summary:
      "Felix Marketing Hub organizes campaign execution and creative output while AI helps generate and optimize content velocity.",
    aiLeverage: [
      "Campaign brief generation from goals and audience data",
      "Creative copy expansion for multi-channel variants",
      "Performance recap summaries with optimization cues",
    ],
    coreFeatures: [
      "Campaign and content calendar management",
      "Asset and messaging workflow tracking",
      "Marketing KPI dashboards",
    ],
    benefits: [
      "Improves output consistency across channels",
      "Accelerates campaign ideation and testing",
      "Aligns creative and performance teams",
    ],
    caseStudy: {
      companyType: "In-house growth team managing multiple brands",
      challenge:
        "Content planning lived in disconnected tools and campaign retros were too slow.",
      implementation: [
        "Moved campaign lifecycle into a unified workspace",
        "Used AI for first-draft copy and channel adaptations",
        "Automated KPI recap creation after each campaign window",
      ],
      outcomes: [
        "Faster launch cycles for new campaigns",
        "Higher testing volume without additional headcount",
        "Better alignment between strategy and production",
      ],
    },
  },
  {
    slug: "real-estate-investor-marketing-hub",
    name: "Real Estate Investor Marketing Hub",
    url: "https://real-estate-investor-marketing-hub.vercel.app/",
    category: "Investor Marketing Platform",
    tagline: "Acquisition marketing system for real estate investors.",
    summary:
      "Purpose-built marketing workspace for investor audiences, combining channel strategy, content production, and lead-gen optimization.",
    aiLeverage: [
      "Property-owner persona driven messaging generation",
      "Lead magnet and ad angle ideation",
      "Campaign signal summaries for offer-market fit tuning",
    ],
    coreFeatures: [
      "Investor campaign dashboards",
      "Audience and channel planning boards",
      "Content and funnel tracking tools",
    ],
    benefits: [
      "Improves campaign relevance for seller segments",
      "Supports faster testing of acquisition angles",
      "Connects marketing activity to pipeline outcomes",
    ],
    caseStudy: {
      companyType: "Real estate investment marketing team",
      challenge:
        "Acquisition campaigns lacked consistent testing structure and messaging depth.",
      implementation: [
        "Structured campaigns by seller persona and funnel stage",
        "Used AI to generate variant messaging across channels",
        "Set recurring performance review routines with AI recaps",
      ],
      outcomes: [
        "Stronger clarity on winning acquisition angles",
        "More predictable creative testing cadence",
        "Improved efficiency in campaign analysis",
      ],
    },
  },
  {
    slug: "junior-underwriter",
    name: "Junior Underwriter",
    url: "https://junior-underwriter.vercel.app/",
    category: "Underwriting Intelligence",
    tagline: "Faster risk review and deal-screening workflows.",
    summary:
      "Junior Underwriter helps teams evaluate opportunities with structured data intake, decision support, and AI risk interpretation.",
    aiLeverage: [
      "Risk signal extraction from deal and property inputs",
      "Narrative underwriting summaries",
      "Scenario-driven recommendation prompts",
    ],
    coreFeatures: [
      "Underwriting data intake workflow",
      "Deal scoring and comparison views",
      "Review notes and decision logs",
    ],
    benefits: [
      "Speeds up first-pass deal analysis",
      "Makes review quality more consistent",
      "Improves transparency in go/no-go decisions",
    ],
    caseStudy: {
      companyType: "Acquisitions and underwriting desk",
      challenge:
        "Manual underwriting reviews were slow and hard to standardize across analysts.",
      implementation: [
        "Created repeatable intake templates for each deal type",
        "Enabled AI summary outputs for every submission",
        "Added score-driven review checkpoints for analysts",
      ],
      outcomes: [
        "Faster turnaround on early-stage opportunity screening",
        "More consistent recommendation quality",
        "Clearer documentation for investment committees",
      ],
    },
  },
  {
    slug: "backlink-prospector",
    name: "Backlink Prospector",
    url: "https://backlink-prospector.vercel.app/login",
    category: "SEO Prospecting",
    tagline: "Prospecting engine for high-value backlink opportunities.",
    summary:
      "Backlink Prospector is focused on opportunity discovery, qualification, and outreach preparation for link campaigns.",
    aiLeverage: [
      "Intent and topical relevance scoring for prospects",
      "Outreach subject and angle suggestion",
      "Campaign gap analysis by segment",
    ],
    coreFeatures: [
      "Prospect database and filters",
      "Opportunity scoring pipeline",
      "Outreach prep and tracking workflows",
    ],
    benefits: [
      "Eliminates low-value outreach targets",
      "Increases team focus on high-impact domains",
      "Improves repeatability of link prospecting operations",
    ],
    caseStudy: {
      companyType: "SaaS growth and SEO content team",
      challenge:
        "Link-building outreach was broad but inefficient with weak prioritization logic.",
      implementation: [
        "Introduced scoring layers for relevance and authority",
        "Segmented campaigns by intent and topic cluster",
        "Leveraged AI for outreach framing and prep",
      ],
      outcomes: [
        "Higher-quality outreach lists with fewer wasted touches",
        "Better consistency in weekly prospecting output",
        "Faster iteration on underperforming segments",
      ],
    },
  },
  {
    slug: "social-content-hub",
    name: "Social Content Hub",
    url: "https://social-content-hub.vercel.app/",
    category: "Social Media Engine",
    tagline: "Plan, generate, and ship social content with AI speed.",
    summary:
      "Social Content Hub helps teams execute consistent social publishing with structured planning and AI-assisted content creation.",
    aiLeverage: [
      "Topic and hook generation aligned to audience goals",
      "Caption and script drafting by platform format",
      "Performance-driven iteration prompts",
    ],
    coreFeatures: [
      "Content pipeline and calendar",
      "Channel-specific draft management",
      "Publishing workflow visibility",
    ],
    benefits: [
      "Increases publishing consistency",
      "Reduces creative bottlenecks",
      "Improves testing volume across social channels",
    ],
    caseStudy: {
      companyType: "Founder-led brand and small content team",
      challenge:
        "Content production was inconsistent and ideas did not convert into scheduled output.",
      implementation: [
        "Built weekly ideation-to-scheduling workflow",
        "Used AI draft generation for first-pass creative",
        "Introduced channel-by-channel publishing cadence rules",
      ],
      outcomes: [
        "Higher posting consistency week over week",
        "Reduced production time per content cycle",
        "More systematic experimentation with social formats",
      ],
    },
  },
  {
    slug: "carrot-seoai",
    name: "Carrot SEO AI",
    url: "https://carrot-seoai.vercel.app/",
    category: "SEO Intelligence Platform",
    tagline: "AI-guided content and technical SEO execution.",
    summary:
      "Carrot SEO AI helps teams prioritize and execute SEO initiatives across on-page, content, and structural optimization work.",
    aiLeverage: [
      "Keyword and intent clustering recommendations",
      "On-page optimization prompts and rewrites",
      "Action-priority suggestions from SEO audit signals",
    ],
    coreFeatures: [
      "SEO opportunity dashboard",
      "Content optimization workflows",
      "Technical issue and priority tracking",
    ],
    benefits: [
      "Improves SEO execution focus",
      "Speeds up optimization workflows",
      "Helps teams connect actions to ranking outcomes",
    ],
    caseStudy: {
      companyType: "Content-led SaaS growth organization",
      challenge:
        "SEO backlog was large and teams struggled to prioritize efforts by impact.",
      implementation: [
        "Centralized opportunities into one AI-guided queue",
        "Applied optimization playbooks to target pages",
        "Created weekly SEO sprint reviews with AI recaps",
      ],
      outcomes: [
        "Clearer prioritization of high-impact SEO tasks",
        "Faster turnaround on optimization cycles",
        "Stronger operating rhythm between SEO and content teams",
      ],
    },
  },
  {
    slug: "clawdio-click",
    name: "Clawdio.Click",
    url: "https://clawdio.click",
    category: "Ad Intelligence Platform",
    tagline: "Performance marketing command center for paid acquisition.",
    summary:
      "Clawdio.Click gives operators a focused workspace to monitor campaign performance, optimize paid spend, and accelerate decision speed across channels.",
    aiLeverage: [
      "Campaign performance anomaly detection and alerting",
      "Budget allocation suggestions by channel and intent segment",
      "Creative and audience optimization prompts from live signal data",
    ],
    coreFeatures: [
      "Cross-channel paid performance dashboard",
      "Budget pacing and variance monitoring",
      "Creative test and audience decision workspace",
    ],
    benefits: [
      "Improves paid media visibility for fast decisions",
      "Reduces wasted spend from delayed optimization",
      "Creates a repeatable process for campaign iteration",
    ],
    caseStudy: {
      companyType: "Performance marketing and demand generation team",
      challenge:
        "Campaign data was scattered and optimization decisions were delayed across paid channels.",
      implementation: [
        "Unified paid channel performance into one operating dashboard",
        "Introduced AI recommendations for budget shifts and creative tests",
        "Set weekly review loops for pacing, CAC trends, and conversion quality",
      ],
      outcomes: [
        "Faster reaction time to underperforming campaigns",
        "Clearer budget deployment priorities by channel",
        "Higher consistency in optimization execution across the team",
      ],
    },
  },
];

export function getSaasBySlug(slug: string): SaaSItem | undefined {
  return saasItems.find((item) => item.slug === slug);
}
