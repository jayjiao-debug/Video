// node scripts/export_glb.mjs <outdir> <frames>  (COMP, B env as for stills) -> <outdir>/<comp>_f<frame>.glb
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const [outdir, frames] = process.argv.slice(2); fs.mkdirSync(outdir, { recursive: true });
const comp = process.env.COMP || "BtCannon", PORT = 8765;
const srv = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method !== "POST") { res.end(); return; }
  const f = new URL(req.url, "http://x").searchParams.get("f"), parts = [];
  req.on("data", (d) => parts.push(d)); req.on("end", () => { const b = Buffer.concat(parts); fs.writeFileSync(path.join(outdir, `${comp}_f${f}.glb`), b); console.log("got glb", f, b.length); res.end("ok"); });
}).listen(PORT);
const browserExecutable = process.env.B, chromiumOptions = { gl: process.env.GL || "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: comp, chromiumOptions, browserExecutable });
for (const f of frames.split(",").map(Number)) {
  await renderStill({ composition, serveUrl, frame: f, output: path.join(outdir, `${comp}_f${f}.jpg`), imageFormat: "jpeg", scale: 0.5, chromiumOptions, browserExecutable,
    inputProps: { exportGlb: `http://localhost:${PORT}/up`, nopost: true }, timeoutInMilliseconds: 300000, onBrowserLog: (l) => { if (l.type === "error" || /glb/i.test(l.text)) console.log(`[${l.type}]`, l.text.slice(0, 400)); } });
  console.log("frame", f, "done");
}
srv.close();
