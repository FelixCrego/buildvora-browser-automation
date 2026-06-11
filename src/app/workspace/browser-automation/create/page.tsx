import VoiceAutomationBuilder from "@/components/voice-automation-builder";
import { Panel } from "@/components/browser-automation-console";

export default function BrowserAutomationCreatePage() {
  return (
    <div className="grid gap-6">
      <Panel title="Voice Builder" kicker="Create new automation scope">
        <VoiceAutomationBuilder />
      </Panel>
    </div>
  );
}
