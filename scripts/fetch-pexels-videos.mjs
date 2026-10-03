/**
 * Downloads the Pexels videos listed in scripts/media-sources.json into
 * public/media, picking the ~720p MP4 of each so the site stays light.
 * Also saves each video's cover frame as <name>-poster.jpg.
 *
 * Needs a free Pexels API key (https://www.pexels.com/api/) in .env.local:
 *   PEXELS_API_KEY=your-key
 *
 * Usage: npm run media:fetch          (skips files that already exist)
 *        npm run media:fetch -- --force
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "media");
const force = process.argv.includes("--force");
const TARGET_WIDTH = 1280;

function readKey() {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY;
  const envFile = join(root, ".env.local");
  if (!existsSync(envFile)) return undefined;
  const line = readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith("PEXELS_API_KEY="));
  return line
    ?.split("=")
    .slice(1)
    .join("=")
    .trim()
    .replace(/^["']|["']$/g, "");
}

// Closest MP4 to 1280px wide, preferring sizes between 960 and 1920.
function pickFile(files) {
  const mp4s = files.filter(
    (f) => f.file_type === "video/mp4" && f.width && f.link,
  );
  const score = (f) =>
    Math.abs(f.width - TARGET_WIDTH) +
    (f.width < 960 || f.width > 1920 ? 10_000 : 0);
  return mp4s.sort((a, b) => score(a) - score(b))[0];
}

async function download(url, path) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
}

const key = readKey();
if (!key) {
  console.error(
    "Missing PEXELS_API_KEY. Get a free key at https://www.pexels.com/api/ and add\n" +
      "PEXELS_API_KEY=your-key to .env.local, then run this again.",
  );
  process.exit(1);
}

const { videos } = JSON.parse(
  readFileSync(join(root, "scripts", "media-sources.json"), "utf8"),
);
mkdirSync(outDir, { recursive: true });

let failed = 0;
for (const video of videos) {
  const target = join(outDir, video.out);
  const poster = target.replace(/\.mp4$/, "-poster.jpg");
  if (!force && existsSync(target)) {
    console.log(`= ${video.out} already exists (use --force to replace)`);
    continue;
  }
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/videos/${video.pexelsId}`,
      {
        headers: { Authorization: key },
      },
    );
    if (!res.ok) throw new Error(`Pexels API answered ${res.status}`);
    const data = await res.json();
    const file = pickFile(data.video_files ?? []);
    if (!file) throw new Error("no suitable MP4 found");
    await download(file.link, target);
    if (data.image) await download(data.image, poster);
    console.log(
      `✓ ${video.out}  ${file.width}×${file.height}  by ${data.user?.name ?? "unknown"} — ${data.url ?? video.page}`,
    );
  } catch (error) {
    failed++;
    console.error(`✗ ${video.out}: ${error.message}`);
  }
}
process.exit(failed ? 1 : 0);
