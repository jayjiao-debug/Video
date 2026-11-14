// Dumps the picture's sound events (src/videos/libai/sound_events.ts) as JSON for build.py.
//   node scripts/libai/sound/events.mjs [/home/user/libai_work/sound/events.json]
import { build } from "esbuild";
import { writeFileSync, mkdtempSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import os from "os";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const out = process.argv[2] ?? "/home/user/libai_work/sound/events.json";
const tmp = join(mkdtempSync(join(os.tmpdir(), "libai-ev-")), "ev.mjs");
await build({ stdin: { contents: `export { soundEvents } from "./src/videos/libai/sound_events";`, resolveDir: ROOT, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: tmp, logLevel: "error", jsx: "automatic", loader: { ".ttf": "empty", ".png": "empty", ".jpg": "empty" } });
const { soundEvents } = await import(pathToFileURL(tmp).href);
writeFileSync(out, JSON.stringify(soundEvents(), null, 1));
console.log("events ->", out);
