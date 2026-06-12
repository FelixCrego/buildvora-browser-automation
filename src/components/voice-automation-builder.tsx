"use client";

import { useMemo, useState, useTransition } from "react";

type VoiceBuilderResult = {
  automationName: string;
  summary: string;
  systems: string[];
  approvals: string[];
  recommendedPlan: string;
  estimatedCreditsPerRun: string;
  rolloutPath: string[];
};

type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
  }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export default function VoiceAutomationBuilder() {
  const [transcript, setTranscript] = useState("");
  const [company, setCompany] = useState("Harbor Legal Group");
  const [mode, setMode] = useState<"voice" | "typed">("voice");
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<VoiceBuilderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const speechSupported = useMemo(
    () => typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    [],
  );

  const startListening = () => {
    setError(null);

    if (!speechSupported) {
      setError("Speech recognition is not available in this browser. Use typed mode instead.");
      return;
    }

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Recognition) {
      setError("Speech recognition is not available in this browser. Use typed mode instead.");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((item) => item[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setTranscript((current) => [current, text].filter(Boolean).join(" ").trim());
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice capture failed. Try again or switch to typed mode.");
    };
    recognition.start();
    setIsListening(true);
  };

  const handleGenerate = () => {
    setError(null);

    if (company.trim().length < 2) {
      setError("Enter the client or workspace name before building the automation scope.");
      return;
    }

    if (transcript.trim().length < 20) {
      setError("Add more workflow detail so the automation scope can be built accurately.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/browser-automation/voice-builder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company,
            transcript,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          message?: string;
          result?: VoiceBuilderResult;
        };

        if (!response.ok || !payload.result) {
          throw new Error(payload.message ?? "Voice builder response was invalid.");
        }

        setResult(payload.result);
      } catch (builderError) {
        setError(builderError instanceof Error ? builderError.message : "Unexpected voice builder error.");
      }
    });
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-[#f5f5f7] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Voice Activated Intake</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Describe the automation in plain speech.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Say what the browser work is, what systems are involved, what approvals matter, and what result the operator needs.
            </p>
          </div>
          <div className="flex rounded-full border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setMode("voice")}
              className={`rounded-full px-4 py-2 text-sm transition ${mode === "voice" ? "bg-[#0071e3] text-white" : "text-slate-500"}`}
            >
              Voice
            </button>
            <button
              type="button"
              onClick={() => setMode("typed")}
              className={`rounded-full px-4 py-2 text-sm transition ${mode === "typed" ? "bg-[#0071e3] text-white" : "text-slate-500"}`}
            >
              Typed
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
          <label className="text-sm text-slate-600">
            Client account
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#0071e3]"
            />
          </label>
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Suggested prompt</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Example: "Open our intake portal, review new submissions, enrich them with Clio matter details, pause before any client email, then push approved cases into our CRM."
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-950">Transcript</p>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={6}
            placeholder={mode === "voice" ? "Capture a voice transcript, then refine it here if needed." : "Type the workflow you want automated."}
            className="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]"
          />
          <div className="mt-4 rounded-[1.25rem] bg-[#f5f5f7] p-4">
            <p className="text-sm font-semibold text-slate-950">Launch posture</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Building an automation scope uses 5 credits. The workspace shows the estimated run class before launch, and production publishing stays locked during the free trial.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {mode === "voice" ? (
              <button
                type="button"
                onClick={startListening}
                className="inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0077ed]"
              >
                {isListening ? "Listening..." : "Start Voice Capture"}
              </button>
            ) : null}
            <button
              type="button"
              disabled={isPending}
              onClick={handleGenerate}
              className="inline-flex rounded-full bg-[#f5f5f7] px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-[#ebebef] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Building Scope..." : "Build Automation Scope"}
            </button>
          </div>
          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        </div>
      </div>

      {result ? (
        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
            <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Generated Automation</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{result.automationName}</h3>
            <p className="mt-4 text-base leading-relaxed text-slate-600">{result.summary}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.2rem] border border-slate-200 bg-[#f5f5f7] p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Systems</p>
                <p className="mt-2 text-sm text-slate-700">{result.systems.join(", ")}</p>
              </div>
              <div className="rounded-[1.2rem] border border-slate-200 bg-[#f5f9ff] p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Credits Per Run</p>
                <p className="mt-2 text-sm text-[#0071e3]">{result.estimatedCreditsPerRun}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold text-slate-950">Recommended plan</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{result.recommendedPlan}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold text-slate-950">Approval gates</p>
              <div className="mt-3 grid gap-3">
                {result.approvals.map((item) => (
                  <div key={item} className="rounded-[1rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold text-slate-950">Rollout path</p>
              <div className="mt-3 grid gap-3">
                {result.rolloutPath.map((item) => (
                  <div key={item} className="rounded-[1rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
