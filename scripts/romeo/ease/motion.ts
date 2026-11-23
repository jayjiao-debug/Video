// THE FILM'S MOTION, MEASURED (no rendering): every figure's head, hands, shoulders, elbows, feet and state on every
// frame, the props that show and the camera. run.sh bundles and runs it:
//   node motion.js <out.json> [--raw] [from] [to]      --raw = without the hand easing (shots/ease.ts), to find the jumps
// Positions are the rig's own (the solve's world); a figure laid down or carried by a shot (shots/kit.ts lieDown,
// carry) is marked `carried`: only its head is where the picture shows it.
import * as THREE from "three";
import * as fs from "node:fs";
import hooks from "../../../src/videos/romeo/kit.world";
const H: any = hooks, SEGS: any[] = H.segments;
const argv = process.argv.slice(2).filter((a) => a !== "--raw");
if (process.argv.includes("--raw")) (globalThis as any).__ROMEO_RAW = true;
const camera = new THREE.PerspectiveCamera(40, H.W / H.H, 0.03, 600);
const w: any = H.makeWorld((globalThis as any).__mk(), camera);
const out: any[] = [], a = Number(argv[1] ?? 0), b = Number(argv[2] ?? SEGS[SEGS.length - 1].to);
let cur: any = null;
const v = new THREE.Vector3(), q = new THREE.Vector3(), fw = new THREE.Vector3(), inv = new THREE.Matrix4();
const r3 = (p: THREE.Vector3) => [+p.x.toFixed(4), +p.y.toFixed(4), +p.z.toFixed(4)];
const scr = (p: THREE.Vector3) => { q.copy(p).project(camera); const front = p.clone().sub(camera.position).dot(fw) > 0; const x = (q.x * 0.5 + 0.5) * H.W, y = (0.5 - q.y * 0.5) * H.H; return [Math.round(x), Math.round(y), front && x > -20 && x < H.W + 20 && y > -20 && y < H.H + 20 ? 1 : 0]; };
for (let f = a; f <= b; f++) {
  const s = SEGS.find((g) => f >= g.from && f <= g.to)!;
  if (s !== cur) { cur?.exit?.(w); s.enter?.(w); cur = s; }
  w.beginFrame(f); const P = s.pose(w, f); w.endFrame(P); w.root.updateMatrixWorld(true);
  camera.updateMatrixWorld(); camera.updateProjectionMatrix(); camera.getWorldDirection(fw);
  const figs: any = {};
  for (const [rig, name] of H.rigNames(w) as Map<any, string>) {
    const r: any = rig; if (!r.group?.visible) continue;
    const st = r.state, hu = r.faceU.uHead.value; v.set(hu.x, hu.y, hu.z);
    const d = v.distanceTo(camera.position); q.copy(v).project(camera);
    const px = (q.x * 0.5 + 0.5) * H.W, py = (0.5 - q.y * 0.5) * H.H, front = v.clone().sub(camera.position).dot(fw) > 0;
    const R = (hu.w / (d * Math.tan((camera.fov * Math.PI) / 360))) * (H.H / 2);
    const on = front && px > -R && px < H.W + R && py > -R && py < H.H + R;
    const hw = [r.handWorld(0), r.handWorld(1)];
    inv.copy(r.torsoM).invert();
    figs[name] = { head: r3(v), hands: hw.map(r3), ht: hw.map((p: THREE.Vector3) => r3(p.clone().applyMatrix4(inv))), hs: hw.map(scr), shl: [r3(r.dim.sh[0]), r3(r.dim.sh[1])], arm: +(r.dim.upper + r.dim.fore).toFixed(4),
      elbow: [r3(r.out.elbow[0]), r3(r.out.elbow[1])], et: [0, 1].map((i) => r3(r.out.elbow[i].clone().applyMatrix4(inv))), feet: [r3(r.footWorld(0)), r3(r.footWorld(1))],
      torso: r3(new THREE.Vector3().setFromMatrixPosition(r.torsoM)), yaw: +r.out.bodyYaw.toFixed(3), at: r3(st.at), facing: +(+st.facing).toFixed(3), seat: st.seat ? 1 : 0, carried: r.group.matrixAutoUpdate ? 0 : 1,
      kind: st.pose?.kind, wt: [st.hands?.[0] ? 1 : 0, st.hands?.[1] ? 1 : 0], scr: [Math.round(px), Math.round(py), Math.round(R)], on, expr: typeof st.expr === "string" ? st.expr : undefined, blink: st.blink };
  }
  const props: any = {};
  for (const o of w.props.group.children as any[]) if (o.visible) { o.getWorldPosition(v); props[o.name || `p${o.id}`] = r3(v); }
  out.push({ f, seg: s.id, cam: r3(camera.position), fov: +camera.fov.toFixed(2), figs, props });
}
fs.writeFileSync(argv[0], JSON.stringify(out));
console.log("frames", out.length);
