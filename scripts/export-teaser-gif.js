const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "static", "images", "fig1_teaser.gif");
const workDir = path.join(root, ".teaser-export");
const framesDir = path.join(workDir, "frames");
const captureHtml = path.join(workDir, "capture.html");

const width = 1083;
const height = 356;
const fps = 20;
const durationSeconds = 5.4;
const frameCount = Math.ceil(durationSeconds * fps);

const chromeCandidates = [
  process.env.CHROME,
  path.join(process.env.ProgramFiles || "", "Google", "Chrome", "Application", "chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Google", "Chrome", "Application", "chrome.exe"),
  path.join(process.env.ProgramFiles || "", "Microsoft", "Edge", "Application", "msedge.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft", "Edge", "Application", "msedge.exe"),
].filter(Boolean);

const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));

if (!chromePath) {
  throw new Error("Could not find Chrome or Edge. Set CHROME to your browser executable path.");
}

const toFileUrl = (filePath) =>
  `file:///${path.resolve(filePath).replace(/\\/g, "/").replace(/ /g, "%20")}`;

fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

fs.writeFileSync(
  captureHtml,
  `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      overflow: hidden;
      background: white;
    }
    .fig1-build {
      position: relative;
      display: block;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      isolation: isolate;
      background: white;
    }
    .fig1-build > img.fig1-build-piece {
      position: absolute;
      display: block;
      width: var(--fig1-width) !important;
      height: var(--fig1-height) !important;
      max-width: none !important;
      opacity: 0;
      object-fit: fill;
      transform: translate(var(--fig1-from-x, 0), var(--fig1-from-y, 0)) scale(0.985);
      transform-origin: center;
      animation: fig1-slide-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards paused;
      animation-delay: calc(var(--fig1-delay, 0s) - var(--capture-time));
      will-change: opacity, transform, clip-path;
    }
    .fig1-input {
      left: 0;
      top: 0;
      --fig1-width: 15.78%;
      --fig1-height: 88.48%;
      --fig1-delay: 0.05s;
      --fig1-from-x: -0.7rem;
    }
    .fig1-tokenizer {
      left: 13.56%;
      top: 11.8%;
      --fig1-width: 11.04%;
      --fig1-height: 64.8%;
      z-index: 2;
      --fig1-delay: 0.75s;
      --fig1-from-x: -0.55rem;
    }
    .fig1-tokens {
      left: 22.35%;
      top: 11.8%;
      --fig1-width: 10.16%;
      --fig1-height: 64.6%;
      z-index: 3;
      --fig1-delay: 1.45s;
      --fig1-from-y: 0.55rem;
    }
    .fig1-llm {
      left: 29.41%;
      top: 11.8%;
      --fig1-width: 11.14%;
      --fig1-height: 64.78%;
      z-index: 4;
      --fig1-delay: 2.15s;
      --fig1-from-x: 0.55rem;
    }
    .fig1-model-box {
      left: 19.85%;
      top: 0;
      --fig1-width: 21.63%;
      --fig1-height: 88.48%;
      z-index: 1;
      --fig1-delay: 2.85s;
      --fig1-from-y: -0.55rem;
    }
    .fig1-output {
      left: 38.41%;
      top: 0;
      --fig1-width: 61.74%;
      --fig1-height: 88.48%;
      z-index: 5;
      --fig1-delay: 3.55s;
      --fig1-from-x: 0.7rem;
    }
    .fig1-claims {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 11.52%;
      z-index: 10;
      font-family: "Times New Roman", serif;
      font-size: clamp(0.68rem, 1.85vw, 1.22rem);
      font-weight: 700;
      line-height: 1.15;
    }
    .fig1-claim {
      position: absolute;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 0.28em;
      white-space: nowrap;
      opacity: 0;
      transform: translateY(0.45rem);
      animation: fig1-claim-in 0.45s ease-out forwards paused;
      animation-delay: calc(var(--fig1-claim-delay, 0s) - var(--capture-time));
    }
    .fig1-claim:nth-child(1) {
      left: 5.7%;
      width: 31%;
      --fig1-claim-delay: 4.15s;
    }
    .fig1-claim:nth-child(2) {
      left: 39.9%;
      width: 29%;
      --fig1-claim-delay: 4.35s;
    }
    .fig1-claim:nth-child(3) {
      left: 68.2%;
      width: 31%;
      --fig1-claim-delay: 4.55s;
    }
    .fig1-check {
      display: inline-flex;
      width: 1.25em;
      height: 1.25em;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      border-radius: 999px;
      background: #3fb34f;
      color: #fff;
      font-family: Arial, sans-serif;
      font-size: 0.78em;
      font-weight: 700;
      line-height: 1;
    }
    @keyframes fig1-slide-in {
      0% {
        opacity: 0;
        clip-path: inset(0 8% 0 0);
        transform: translate(var(--fig1-from-x, 0), var(--fig1-from-y, 0)) scale(0.985);
      }
      70% { opacity: 1; }
      100% {
        opacity: 1;
        clip-path: inset(0 0 0 0);
        transform: translate(0, 0) scale(1);
      }
    }
    @keyframes fig1-claim-in {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</head>
<body>
  <div class="fig1-build" style="--capture-time: 0s">
    <img src="${toFileUrl(path.join(root, "static", "images", "fig1_pt1.svg"))}" class="fig1-build-piece fig1-input" alt="">
    <img src="${toFileUrl(path.join(root, "static", "images", "fig1_pt2.svg"))}" class="fig1-build-piece fig1-tokenizer" alt="">
    <img src="${toFileUrl(path.join(root, "static", "images", "fig1_pt3.svg"))}" class="fig1-build-piece fig1-tokens" alt="">
    <img src="${toFileUrl(path.join(root, "static", "images", "fig1_pt4.svg"))}" class="fig1-build-piece fig1-llm" alt="">
    <img src="${toFileUrl(path.join(root, "static", "images", "fig1_pt5.svg"))}" class="fig1-build-piece fig1-model-box" alt="">
    <img src="${toFileUrl(path.join(root, "static", "images", "fig1_pt6.svg"))}" class="fig1-build-piece fig1-output" alt="">
    <div class="fig1-claims" aria-hidden="true">
      <div class="fig1-claim"><span class="fig1-check">&#10003;</span><span>End-to-End Scene Graph Prediction</span></div>
      <div class="fig1-claim"><span class="fig1-check">&#10003;</span><span>Supports Different 3D Inputs</span></div>
      <div class="fig1-claim"><span class="fig1-check">&#10003;</span><span>No Proprietary Models</span></div>
    </div>
  </div>
  <script>
    const t = Number(new URLSearchParams(location.search).get("t") || 0);
    document.querySelector(".fig1-build").style.setProperty("--capture-time", t + "s");
  </script>
</body>
</html>`,
  "utf8"
);

for (let index = 0; index < frameCount; index += 1) {
  const time = index / fps;
  const frame = path.join(framesDir, `frame-${String(index).padStart(4, "0")}.png`);
  execFileSync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    `--user-data-dir=${path.join(os.tmpdir(), `teaser-gif-chrome-${process.pid}-${index}`)}`,
    `--window-size=${width},${height}`,
    `--screenshot=${frame}`,
    `${toFileUrl(captureHtml)}?t=${time.toFixed(3)}`,
  ]);
  process.stdout.write(`Rendered frame ${index + 1}/${frameCount}\r`);
}

process.stdout.write("\nEncoding GIF...\n");

const palette = path.join(workDir, "palette.png");
const framePattern = path.join(framesDir, "frame-%04d.png");

execFileSync("ffmpeg", [
  "-y",
  "-framerate",
  String(fps),
  "-i",
  framePattern,
  "-vf",
  "palettegen=stats_mode=diff",
  palette,
], { stdio: "inherit" });

execFileSync("ffmpeg", [
  "-y",
  "-framerate",
  String(fps),
  "-i",
  framePattern,
  "-i",
  palette,
  "-lavfi",
  "paletteuse=dither=bayer:bayer_scale=3",
  "-loop",
  "0",
  outPath,
], { stdio: "inherit" });

console.log(`Wrote ${path.relative(root, outPath)}`);
