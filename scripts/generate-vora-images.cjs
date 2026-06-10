const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function generateImage({ prompt, size, output }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
      output_format: 'png',
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Image API error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const first = data?.data?.[0];
  const b64 = first?.b64_json;
  const imageUrl = first?.url;
  fs.mkdirSync(path.dirname(output), { recursive: true });

  if (b64) {
    fs.writeFileSync(output, Buffer.from(b64, 'base64'));
    console.log(`saved ${output}`);
    return;
  }

  if (imageUrl) {
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error(`Failed image download: ${imageResp.status}`);
    const arr = await imageResp.arrayBuffer();
    fs.writeFileSync(output, Buffer.from(arr));
    console.log(`saved ${output}`);
    return;
  }

  throw new Error(`No image payload returned. Keys: ${Object.keys(first || {}).join(',')}`);
}

async function main() {
  loadEnv(path.resolve(process.cwd(), '.env.local'));

  const jobs = [
    {
      output: path.resolve(process.cwd(), 'public/vora-generated/vora-hero-standalone.png'),
      size: '1024x1536',
      prompt:
        'Create a premium hero portrait of Vora, an AI digital operator mascot for a SaaS brand. Full body, standing confident, centered, high-end dark studio background with subtle slate gradients, electric blue rim lighting (#3b82f6), clean cinematic realism, sharp details, modern suit with subtle futuristic accents, no text, no logos, no watermark.',
    },
    {
      output: path.resolve(process.cwd(), 'public/vora-generated/vora-transition-command.png'),
      size: '1536x1024',
      prompt:
        'Create a widescreen scene featuring Vora presenting a holographic SaaS command dashboard. Composition suited for website transition section, Vora on right side with dynamic pose and hand gesture, dark black and slate environment with vivid blue neon UI glow (#3b82f6), professional cinematic style, no text, no watermark.',
    },
    {
      output: path.resolve(process.cwd(), 'public/vora-generated/vora-transition-investor.png'),
      size: '1536x1024',
      prompt:
        'Create a widescreen investor-themed scene with Vora reviewing growth charts and portfolio projections on floating glass screens. Sleek modern environment, black and slate palette with high-intensity blue highlights (#3b82f6), strong depth and contrast, premium SaaS visual style, no text, no watermark.',
    },
  ];

  for (const job of jobs) {
    await generateImage(job);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
