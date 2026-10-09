// Renders one still per scene (near the end of each scene, when everything is on screen)
// into out/preview/ for a quick visual check. Usage: node tools/preview_frames.mjs [sceneId ...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const timeline = JSON.parse(readFileSync(join(root, "src/data/timeline.json"), "utf8"));
const only = process.argv.slice(2);
// Use a locally installed Chrome when REMOTION_BROWSER is set (e.g. sandboxes without internet).
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const outDir = join(root, "out/preview");
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: join(root, "src/index.ts"), publicDir: join(root, "public") });
const composition = await selectComposition({ serveUrl, id: "Doomsday", inputProps: { showCaptions: false }, browserExecutable });

for (const scene of timeline.scenes) {
  if (only.length && !only.includes(scene.id)) continue;
  const frame = scene.from + Math.max(0, scene.durationInFrames - 24);
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: join(outDir, `${String(scene.from).padStart(6, "0")}-${scene.id}.jpg`),
    imageFormat: "jpeg",
    jpegQuality: 80,
    inputProps: { showCaptions: false },
    browserExecutable,
  });
  console.log("rendered", scene.id, frame);
}
