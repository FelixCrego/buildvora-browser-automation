import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(".env.local");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is missing.");
  process.exit(1);
}

const prompt = `
You are rewriting website copy for BuildVora (an operator-first AI SaaS portfolio).
Return strict JSON only with this exact shape:
{
  "home":{"title":"","description":"","h1":"","lead":""},
  "products":{"title":"","description":"","h1":"","lead":""},
  "platform":{"title":"","description":"","h1":"","lead":""},
  "caseStudies":{"title":"","description":"","h1":"","lead":""},
  "investors":{"title":"","description":"","h1":"","lead":""},
  "careers":{"title":"","description":"","h1":"","lead":""},
  "ourStory":{"title":"","description":"","h1":"","lead":""},
  "upcoming":{"title":"","description":"","h1":"","lead":""},
  "saasTemplate":{"titlePattern":"","descriptionTemplate":""},
  "caseStudyTemplate":{"titlePattern":"","descriptionTemplate":""}
}
Rules:
- Keep tone human, conversational, credible, practical, and execution-first.
- Keep brand as BuildVora only.
- Blend keywords naturally: AI SaaS development, CRM software, marketing automation, SEO platform, operations software, investor analytics.
- Avoid hype and unverifiable claims.
- Titles should be concise and SEO-ready.
- Meta descriptions should generally target 140-160 characters.
`;

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    input: prompt,
    temperature: 0.5,
  }),
});

if (!response.ok) {
  const errorBody = await response.text();
  console.error("OpenAI request failed:", errorBody.slice(0, 1200));
  process.exit(1);
}

const result = await response.json();
let text = (result.output_text || "").trim();
if (!text) {
  const parts = [];
  for (const item of result.output || []) {
    for (const contentItem of item.content || []) {
      if (typeof contentItem.text === "string") parts.push(contentItem.text);
    }
  }
  text = parts.join("\n").trim();
}

text = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
const outputPath = path.resolve("scripts/seo-copy.json");
fs.writeFileSync(outputPath, text, "utf8");
console.log(`SEO copy written to ${outputPath}`);

