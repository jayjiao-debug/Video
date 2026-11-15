// bundles a TS entry (default newton_equiv.tsx) with esbuild for node into a temp file and runs it:
//   node scripts/kit/day/proof/run.mjs [entry.tsx]
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// module-level canvases (the films' painted textures) need a document: a stub whose 2D context absorbs every call (the
// checks never read a texture; both sides get the same stub)
const STUB = `(() => { const absorb = () => new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === "length" ? 0 : absorb(), apply: () => absorb(), set: () => true, construct: () => absorb() });
  const canvas = () => ({ width: 1, height: 1, style: {}, getContext: () => absorb(), toDataURL: () => "", addEventListener() {} });
  globalThis.document = { createElement: canvas, createElementNS: canvas, fonts: { add() {}, ready: Promise.resolve() } };
  globalThis.OffscreenCanvas = function () { return canvas(); }; })();`;
const here = dirname(fileURLToPath(import.meta.url));
const out = join(mkdtempSync(join(tmpdir(), "dayproof-")), "proof.cjs");
await build({ entryPoints: [process.argv[2] ?? join(here, "newton_equiv.tsx")], bundle: true, platform: "node", format: "cjs", outfile: out, jsx: "automatic", logLevel: "warning", banner: { js: STUB }, loader: { ".png": "empty", ".jpg": "empty", ".woff2": "empty", ".mp3": "empty", ".wav": "empty" } });
execFileSync(process.execPath, [out], { stdio: "inherit" });
