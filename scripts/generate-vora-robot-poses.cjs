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

async function editImage({ inputPath, prompt, size, output }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  const buffer = fs.readFileSync(inputPath);
  const blob = new Blob([buffer], { type: 'image/png' });
  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('size', size);
  form.append('output_format', 'png');
  form.append('image', blob, 'vora-base.png');

  const resp = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Image edit error ${resp.status}: ${text}`);
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

  throw new Error('No image payload returned');
}

async function main() {
  loadEnv(path.resolve(process.cwd(), '.env.local'));

  const input = path.resolve(process.cwd(), 'public/vora-avatar.png');
  const outDir = path.resolve(process.cwd(), 'public/vora-robot-poses');

  const baseStyle =
    'Keep the exact same robot character identity, proportions, face visor style, hoodie with V logo, materials, and neon blue lighting from the source image. Maintain deep black background with subtle slate gradients and Vora Blue glow (#3b82f6).';

  const jobs = [
    {
      output: path.join(outDir, 'vora-pose-wave.png'),
      prompt: `${baseStyle} Full body pose, friendly wave with right hand, standing centered, polished 3D render.`
    },
    {
      output: path.join(outDir, 'vora-pose-point.png'),
      prompt: `${baseStyle} Full body pose pointing upward with one hand like presenting an idea, confident posture, polished 3D render.`
    },
    {
      output: path.join(outDir, 'vora-pose-arms-crossed.png'),
      prompt: `${baseStyle} Full body pose with arms crossed, confident stance, polished 3D render.`
    },
    {
      output: path.join(outDir, 'vora-pose-hologram.png'),
      prompt: `${baseStyle} Full body pose presenting a floating blue hologram panel with one hand, dynamic posture, polished 3D render.`
    }
  ];

  for (const job of jobs) {
    await editImage({ inputPath: input, prompt: job.prompt, size: '1024x1024', output: job.output });
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
