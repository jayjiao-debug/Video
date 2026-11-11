#!/usr/bin/env node
// Renders a rig3d preview entry (src/videos/group/preview/rig3d_*.ts) in headless Chromium.
//   node scripts/rig3d/render.mjs <entry.ts> <out.png | outdir> [options]
//     (no --frames / --pick)   one still: the entry must end in still mode (window.__done); <out> is a .png
//     --frames N               frames 0..N-1 into <outdir>/f0000.png ...   (the entry must pass `frames` to rigLab)
//     --pick 0,20,40           only those frames (same entry kind as --frames)
//     --size WxH               overrides the entry's own w / h
//     --opts '<json>'          merged over the entry's rigLab options (objects merge key by key), e.g.
//                              --opts '{"turn":{"a0":30,"a1":30}}'
//     --timeout S              seconds to wait for the page (default 300)
// Prints the page's "QA:" lines and errors. Exit code 1 on a page error.
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2), pos = [], opt = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) opt[args[i].slice(2)] = args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[++i] : "1";
  else pos.push(args[i]);
}
if (pos.length < 2) { console.error("usage: render.mjs <entry.ts> <out.png | outdir> [--frames N | --pick a,b] [--size WxH] [--opts json] [--timeout s]"); process.exit(2); }
const entry = resolve(pos[0]), out = resolve(pos[1]);
const over = opt.opts ? JSON.parse(opt.opts) : {};
if (opt.size) { const [w, h] = opt.size.split("x").map(Number); over.w = w; over.h = h; }
const frames = opt.pick ? opt.pick.split(",").map(Number) : opt.frames ? Array.from({ length: +opt.frames }, (_, i) => i) : null;
if (frames && over.frames === undefined && opt.frames) over.frames = +opt.frames;
const timeout = 1000 * +(opt.timeout ?? 300);

const tmp = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), "rig3d."));
let failed = false;
try {
  await require(join(root, "node_modules/esbuild")).build({
    entryPoints: [entry], bundle: true, format: "iife", outfile: join(tmp, "app.js"), logLevel: "error",
    define: { "process.env.NODE_ENV": '"production"' }, nodePaths: [join(root, "node_modules")],
  });
  writeFileSync(join(tmp, "index.html"), '<!doctype html><html><head><meta charset="utf-8"></head><body><script src="app.js"></script></body></html>');
  const { chromium } = require("playwright");
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: over.w ?? 1080, height: over.h ?? 1920 } });
  page.on("console", (m) => { if (m.type() === "error" || m.text().startsWith("QA")) console.log("console:", m.text()); });
  page.on("pageerror", (e) => { failed = true; console.log("pageerror:", e.message); });
  const hash = Object.keys(over).length ? "#" + encodeURIComponent(JSON.stringify(over)) : "";
  await page.goto("file://" + join(tmp, "index.html") + hash, { timeout });
  if (frames) {
    await page.waitForFunction(() => window.__ready === true || window.__failed === true, null, { timeout });
    mkdirSync(out, { recursive: true });
    const c = await page.$("canvas");
    for (const i of frames) { await page.evaluate((k) => window.__frame(k), i); await c.screenshot({ path: join(out, "f" + String(i).padStart(4, "0") + ".png") }); }
    console.log(`wrote ${frames.length} frames to ${out}`);
  } else {
    await page.waitForFunction(() => window.__done === true || window.__failed === true, null, { timeout });
    mkdirSync(dirname(out), { recursive: true });
    await (await page.$("canvas")).screenshot({ path: out });
    console.log("wrote " + out);
  }
  await browser.close();
} catch (e) { failed = true; console.log("render failed:", e.message); }
rmSync(tmp, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
