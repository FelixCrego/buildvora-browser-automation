import OpenAI from "openai";
import { BrowserAutomationError, ValidationError } from "./errors.js";
import { validateWorkflow } from "./schema.js";

function tryExtractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

export class OpenAIWorkflowBuilder {
  constructor(options = {}) {
    this.client =
      options.client ??
      new OpenAI({
        apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
      });
    this.model = options.model ?? "gpt-5.5";
  }

  async buildFromTranscript(input) {
    if (!input || typeof input !== "object") {
      throw new ValidationError("buildFromTranscript input is required.");
    }

    if (!input.transcript || input.transcript.trim().length < 20) {
      throw new ValidationError("transcript must contain enough detail to build a workflow.");
    }

    const instructions = [
      "You are building a production browser automation workflow draft.",
      "Return valid JSON only.",
      "Do not include markdown fences unless unavoidable.",
      "The JSON object must contain: name, objective, riskLevel, systems, approvals, and steps.",
      "Each step must contain: id, title, action, target, input, requiresApproval, verification.",
      "Use action values from: navigate, click, type, wait_for, assert_state, custom.",
    ].join(" ");

    const response = await this.client.responses.create({
      model: this.model,
      instructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Company: ${input.company ?? "Client Workspace"}\nTranscript: ${input.transcript}\nOutput JSON only.`,
            },
          ],
        },
      ],
    });

    const text = response.output_text?.trim();
    if (!text) {
      throw new BrowserAutomationError("OpenAI did not return workflow output.");
    }

    let parsed;
    try {
      parsed = JSON.parse(tryExtractJson(text));
    } catch (error) {
      throw new BrowserAutomationError("Failed to parse workflow JSON from OpenAI.", { cause: error });
    }

    const workflow = {
      name: parsed.name,
      objective: parsed.objective,
      riskLevel: parsed.riskLevel ?? "medium",
      systems: Array.isArray(parsed.systems) ? parsed.systems : [],
      approvals: Array.isArray(parsed.approvals) ? parsed.approvals : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      sourceTranscript: input.transcript,
      model: this.model,
      rawResponseId: response.id,
    };

    validateWorkflow(workflow);

    return {
      workflow,
      metadata: {
        responseId: response.id,
        model: this.model,
      },
    };
  }
}
