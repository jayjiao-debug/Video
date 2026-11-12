// dump_beats.mjs <out.cjs>: bundles dump_beats.ts with esbuild (the repo's node_modules) for node. A copy of
// scripts/hongmen/sound/dump_beats.mjs for src/videos/wanbi. One addition to a plain bundle: each segment file
// (shots/segA.ts, shots/segA_ov.ts ...) keeps the frames of ITS picture in a private table (segA_ov: `export const
// T = {...}`). The sound must follow those, not a copy of their formulas, so while bundling (in memory only: the
// repo's files are not touched) each seg file gets one line appended that exports its tables. dump_beats.ts writes
// their numbers out as PIC.<segment letter>.<name>.
// A table = a top-level `[export] const <ONE CAPITAL LETTER> = {` or `= (() => {`.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url)), REPO = resolve(HERE, "../../..");
const esbuild = createRequire(resolve(REPO, "package.json"))("esbuild");
const picTables = {
  name: "pic-tables",
  setup(b) {
    b.onLoad({ filter: /[\\/]src[\\/]videos[\\/]wanbi[\\/]shots[\\/]seg[A-Z](_ov)?\.ts$/ }, (a) => {
      const src = readFileSync(a.path, "utf8");
      const names = [...src.matchAll(/^(?:export )?const ([A-Z]) = (?:\{|\(\(\) => \{)/gm)].map((m) => m[1]);
      return { contents: src + `\nexport const __SOUND_LOCAL = { ${names.join(", ")} };\n`, loader: "ts", resolveDir: dirname(a.path) };
    });
  },
};
// The segment files build textures when they are loaded (document.createElement("canvas") ...). node has no document:
// give it one that swallows every call (the beat tables are arithmetic on the caption times: nothing drawn is read).
const HOLE = `(() => { const hole = () => new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === "then" ? undefined : hole(), apply: () => hole(), construct: () => hole(), set: () => true, has: () => true });
  for (const k of ["document", "Image", "OffscreenCanvas"]) if (typeof globalThis[k] === "undefined") { try { globalThis[k] = hole(); } catch (e) {} } })();`;
// WANBI_LANG=en (build.sh --lang en): the English film's beats. The kit's env.ts is given the input prop {lang:"en"}
// while bundling (in memory only). Wanbi's picture keeps the Chinese frames in English (lang.ts), so today the two
// dumps differ only in the quotes; the switch is here so a later English re-timing reaches the sound by itself.
const lang = process.env.WANBI_LANG && process.env.WANBI_LANG !== "zh" ? process.env.WANBI_LANG : null;
const langProp = {
  name: "lang-prop",
  setup(b) {
    b.onLoad({ filter: /[\\/]src[\\/]kit[\\/]film[\\/]env\.ts$/ }, (a) => {
      const src = readFileSync(a.path, "utf8"), out = src.replace("getInputProps() ?? {}", JSON.stringify({ lang }));
      if (out === src) throw new Error("dump_beats: src/kit/film/env.ts no longer reads getInputProps() ?? {}: cannot set lang");
      return { contents: out, loader: "ts", resolveDir: dirname(a.path) };
    });
  },
};
await esbuild.build({ banner: { js: HOLE }, entryPoints: [resolve(HERE, "dump_beats.ts")], bundle: true, platform: "node", format: "cjs", logLevel: "warning", outfile: process.argv[2], plugins: lang ? [picTables, langProp] : [picTables] });
