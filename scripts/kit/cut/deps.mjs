#!/usr/bin/env node
// deps.mjs <out.json> [--pic-entry <entry.ts>]
// What the cut's manifest hashes (scripts/hongmen/cut/README.md): for each segment A..E and each layer, the hash of
// EVERY source file that segment's frames are built from, found by esbuild's own import graph:
//   pic.<seg>  = the import graph of the picture entry (src/videos/hongmen/preview/film_cut.ts) with the OTHER four
//                segments left out, minus src/videos/hongmen/hud/ (DOM only)
//   ov.<seg>   = the import graph of src/videos/hongmen/Film.tsx with the other four segments left out, plus
//                src/Root.tsx and src/index.ts (the composition's size and length)
// So an edit in shots/segB.ts (or a file only segB imports) re-renders segment B only; an edit in world.ts, people.ts,
// sets/*, acc/*, the rig kit ... re-renders everything; a new file is covered the moment something imports it; files
// nobody imports (notes, other people's previews) never count. node_modules is not hashed.
// A segment whose graph cannot be built (a file is broken mid-edit) gets { error }: its chunks wait for a later pass.
// Also written: total / fps / segs (evaluated from story.ts), the ink module Film.tsx imports and the one the picture
// entry imports (make_cut.sh keeps them the same), and the hash of Film.tsx's post section (chain_check).
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, relative, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url)), REPO = resolve(process.env.HM_CUT_REPO || resolve(HERE, "../../.."));   // HM_CUT_REPO: a frozen copy of the tree
const esbuild = createRequire(resolve(REPO, "package.json"))("esbuild");
const args = process.argv.slice(2);
const OUT = args[0];
if (!OUT) { console.error("usage: deps.mjs <out.json> [--pic-entry entry.ts]"); process.exit(2); }
const pi = args.indexOf("--pic-entry");
if (!process.env.KIT_CONFIG) { console.error("deps.mjs: no film config ($KIT_CONFIG = the film's kit.json; make_cut.sh sets it)"); process.exit(2); }
const CFG = JSON.parse(readFileSync(process.env.KIT_CONFIG, "utf8")), ENT = CFG.entries;
const FILM = resolve(REPO, CFG.dir);
const PIC_ENTRY = resolve(pi >= 0 ? args[pi + 1] : join(FILM, ENT.pic));
const OV_ENTRY = join(FILM, ENT.overlay);
/** the segment files as the entries import them: "shots/seg{SEG}" -> /shots\/seg([A-Za-z0-9]+)$/ */
const SEG_RE = new RegExp(ENT.segFile.replace(/\.tsx?$/, "").replace(/[.*+?^${}()|[\]\\/]/g, "\\$&").replace("\\{SEG\\}", "([A-Za-z0-9]+)") + "$");
let SEGS = [];
const sha = (s) => createHash("sha256").update(s).digest("hex");

/** leaves out the other four segments, but only where the ENTRY imports them (a segment that imports a sibling for
 *  a replay keeps that import, and then depends on it) */
const only = (seg, entry) => ({
  name: "one-segment",
  setup(b) {
    b.onResolve({ filter: SEG_RE }, (a) => {
      const s = a.path.match(SEG_RE)[1];
      if (s === seg || resolve(a.importer) !== entry) return null;
      return { path: a.path, namespace: "left-out" };
    });
    b.onLoad({ filter: /.*/, namespace: "left-out" }, () => ({ contents: "export const SEG = null;", loader: "js" }));
  },
});

async function graph(entry, seg, drop, extra = []) {
  try {
    const r = await esbuild.build({
      entryPoints: [entry], bundle: true, write: false, metafile: true, format: "iife", logLevel: "silent", outdir: "/tmp/_unused",
      define: { "process.env.NODE_ENV": '"production"' }, nodePaths: [join(REPO, "node_modules")], plugins: [only(seg, entry)],
      loader: { ".png": "empty", ".jpg": "empty", ".svg": "empty", ".ttf": "empty", ".woff2": "empty", ".css": "empty" },
    });
    const files = Object.keys(r.metafile.inputs)
      .filter((p) => !p.includes("node_modules") && !p.includes(":"))          // (namespaced = our left-out stubs)
      .map((p) => resolve(p)).concat(extra.map((p) => resolve(REPO, p)))
      .filter((p) => !drop.some((d) => p.startsWith(d)));
    const uniq = [...new Set(files)].sort();
    const h = createHash("sha256");
    for (const p of uniq) { h.update(relative(REPO, p)); h.update("\0"); h.update(sha(readFileSync(p))); h.update("\n"); }
    return { hash: h.digest("hex").slice(0, 20), files: uniq.map((p) => relative(REPO, p)) };
  } catch (e) {
    const msg = (e.errors && e.errors.length ? e.errors.map((x) => `${x.location ? x.location.file + ":" + x.location.line + " " : ""}${x.text}`).join(" | ") : String(e.message ?? e)).slice(0, 500);
    return { error: msg };
  }
}

// ---- the film's length and segments, from story.ts (bundled for node into the output's folder, never into the repo)
function timeline() {
  const dir = dirname(resolve(OUT)); mkdirSync(dir, { recursive: true });
  const js = join(dir, ".cut_timeline.cjs");
  const HOLE = `(() => { const hole = () => new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === "then" ? undefined : hole(), apply: () => hole(), construct: () => hole(), set: () => true, has: () => true });
  for (const k of ["document", "Image", "OffscreenCanvas"]) if (typeof globalThis[k] === "undefined") { try { globalThis[k] = hole(); } catch (e) {} } })();`;
  esbuild.buildSync({
    stdin: { contents: `import { TOTAL, FPS, SEGMENTS } from ${JSON.stringify(join(FILM, (CFG.story ?? "story.ts").replace(/\.tsx?$/, "")))};\nprocess.stdout.write("CUT_TIMELINE " + JSON.stringify({ total: TOTAL, fps: FPS, segs: SEGMENTS.map((s) => ({ id: s.id, from: s.from, to: s.to })) }) + "\\n");`, resolveDir: FILM, loader: "ts" },
    banner: { js: HOLE }, bundle: true, platform: "node", format: "cjs", logLevel: "silent", outfile: js, nodePaths: [join(REPO, "node_modules")],
  });
  const out = execFileSync("node", [js], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const line = out.split("\n").find((l) => l.startsWith("CUT_TIMELINE "));
  return JSON.parse(line.slice("CUT_TIMELINE ".length));
}

// ---- which modules give the film its ink pass (InkPass, noInkFallback), and which does the picture entry use
const inkOf = (file) => {
  const src = readFileSync(file, "utf8"), out = {};
  for (const name of ["InkPass", "noInkFallback"]) {
    const m = src.match(new RegExp(`^import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*["']([^"']+)["']`, "m"));
    out[name] = m ? relative(REPO, resolve(dirname(file), m[1])) : null;
  }
  return out;
};
// ---- Film.tsx's post section: everything between the "post defaults" rule and the FirstKick comment
const chainOf = () => {
  const s = readFileSync(OV_ENTRY, "utf8");
  const a = s.indexOf("post defaults"), b = s.indexOf("first frame of the page");
  if (a < 0 || b < 0) return { sha: null };
  const body = s.slice(a, b).split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//") && !l.startsWith("*") && !l.startsWith("/*")).join("\n");
  return { sha: sha(body).slice(0, 16) };
};

const res = { at: new Date().toISOString(), picEntry: relative(REPO, PIC_ENTRY), pic: {}, ov: {} };
try { Object.assign(res, timeline()); } catch (e) { res.timelineError = String(e.message ?? e).slice(0, 500); }
SEGS = (res.segs ?? []).map((g) => g.id);
const HUD = (CFG.domOnly ?? []).map((d) => join(FILM, d));
for (const s of SEGS) {
  res.pic[s] = await graph(PIC_ENTRY, s, HUD);
  res.ov[s] = await graph(OV_ENTRY, s, [], ["src/Root.tsx", "src/index.ts"]);
}
const fi = inkOf(OV_ENTRY), ci = inkOf(PIC_ENTRY);
res.ink = { film: fi, cut: ci, same: !!fi.InkPass && fi.InkPass === ci.InkPass && fi.noInkFallback === ci.noInkFallback };
res.chain = chainOf();
const known = join(REPO, CFG.chainSha ?? "-");
res.chain.expected = existsSync(known) ? readFileSync(known, "utf8").trim().split(/\s+/)[0] : null;
res.chain.ok = res.chain.sha !== null && res.chain.sha === res.chain.expected;
// DOM effects that read the picture under them cannot be reproduced by laying a separate overlay over the picture
const blend = new Set();
for (const s of SEGS) for (const f of res.ov[s].files ?? []) {
  if (/\.(tsx?|jsx?)$/.test(f) && /mixBlendMode|mix-blend-mode|backdropFilter|backdrop-filter/.test(readFileSync(resolve(REPO, f), "utf8"))) blend.add(f);
}
res.blend = [...blend];
writeFileSync(OUT, JSON.stringify(res, null, 1));
const brief = (o) => SEGS.map((s) => `${s}:${o[s].error ? "ERROR" : o[s].hash.slice(0, 8) + "/" + o[s].files.length}`).join(" ");
console.log(`deps: ${res.total ?? "?"} frames | pic ${brief(res.pic)} | ov ${brief(res.ov)} | ink ${res.ink.same ? "same" : "DIFFERENT"} | chain ${res.chain.ok ? "ok" : "CHANGED"}`);
for (const l of ["pic", "ov"]) for (const s of SEGS) if (res[l][s].error) console.log(`deps: ${l}.${s} cannot be built: ${res[l][s].error}`);
