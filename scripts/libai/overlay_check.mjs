// node scripts/libai/overlay_check.mjs : runs src/videos/libai/overlay_check.ts (bundled with esbuild)
import { build } from "esbuild";
import { mkdtempSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import os from "os";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const tmp = join(mkdtempSync(join(os.tmpdir(), "libai-oc-")), "oc.mjs");
await build({ stdin: { contents: `export { runCheck } from "./src/videos/libai/overlay_check";`, resolveDir: ROOT, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: tmp, logLevel: "error", jsx: "automatic", loader: { ".ttf": "empty", ".png": "empty" } });
const { runCheck } = await import(pathToFileURL(tmp).href);
const faults = runCheck();
console.log(faults.length ? faults.map((x) => `OVERLAY ${x.what} @${x.f}: ${x.why}`).join("\n") : "OVERLAY ok (checkOverlays = [])");
