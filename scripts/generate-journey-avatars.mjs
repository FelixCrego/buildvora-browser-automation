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

const outDir = path.resolve("public", "vora-robot-poses");
fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  {
    file: "vora-journey-cyan.png",
    prompt:
      "A full-body cute 3D robot mascot wearing a hoodie with a glowing V emblem, hand raised in a confident welcome pose, cyan and aqua clothing accents, dark transparent background, centered composition, professional website mascot style, high detail, no text",
  },
  {
    file: "vora-journey-blue.png",
    prompt:
      "A full-body cute 3D robot mascot wearing a hoodie with a glowing V emblem, arms crossed confident pose, cobalt and electric blue clothing accents, dark transparent background, centered composition, professional website mascot style, high detail, no text",
  },
  {
    file: "vora-journey-violet.png",
    prompt:
      "A full-body cute 3D robot mascot wearing a hoodie with a glowing V emblem, pointing forward dynamic pose, violet and purple clothing accents, dark transparent background, centered composition, professional website mascot style, high detail, no text",
  },
];

async function generateOne(job) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      size: "1024x1024",
      background: "transparent",
      quality: "high",
      output_format: "png",
      prompt: job.prompt,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Image generation failed for ${job.file}: ${body.slice(0, 900)}`);
  }

  const result = await response.json();
  const b64 = result?.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image data returned for ${job.file}`);
  const buffer = Buffer.from(b64, "base64");
  fs.writeFileSync(path.join(outDir, job.file), buffer);
  console.log(`generated ${job.file}`);
}

for (const job of jobs) {
  await generateOne(job);
}

console.log("done");

