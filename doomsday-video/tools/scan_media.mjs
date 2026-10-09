// Scans public/media for stills and writes src/data/media.json ({ key: filename }).
// Name files after the scene's media key, e.g. public/media/doom.jpg, thor.png, teaser-1.webp.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, extname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "media");
const out = join(root, "src", "data", "media.json");

const map = {};
for (const file of readdirSync(dir)) {
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(extname(file).toLowerCase())) {
    map[basename(file, extname(file))] = file;
  }
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(map, null, 2) + "\n");
console.log(`media.json: ${Object.keys(map).length} image(s) ->`, Object.keys(map).join(", ") || "(none)");
