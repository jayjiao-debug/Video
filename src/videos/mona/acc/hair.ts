// HAIR AND VEIL of 采访蒙娜丽莎的一天 (look test, 23 Nov 2026). On the panel: dark hair parted in the middle and drawn
// smooth to both sides under a fine dark gauze veil, whose hem crosses the top of her forehead as one thin line; from
// the temples the hair falls loose beside her face in fine ringlets to her chest. Built the way the Romeo film's
// sculpted hair is (romeo/acc/hair.ts: a SOLID that wraps the head, its edge tucked into the skin), in this film's own
// folder; the rig is only used.
//   veilHair(o)   the crown: the Romeo film's shell SHAPE (its ShellO and shellPoint) with her own paint: hair combed
//                 from the middle parting down both sides, no shine ring (the gauze dulls it), and along the front edge
//                 a band of "skin seen through the gauze" between the veil's hem (the shell's edge, a fine line) and
//                 her real hairline. name "veilHair"
//   ringlets(o)   three loose ringlets a side from the temple to the chest, over a dark fall of veil. On the head, so
//                 they frame the face from every side. name "ringlets"
// Head units: the head's radius = 1; x = the person's left, y = up, z = the face side, from the head's centre.
import * as THREE from "three";
import type { Acc, PartKit } from "../../group/kit/rig3d";
import { shade } from "../../group/kit/rigacc/shapes";
import { meshOf } from "../../wanbi/acc/envoy";
import { hairlineY, shellPoint, type ShellO } from "../../romeo/acc/hair";
import { lockGeo } from "../../romeo/acc/backhair";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const sm = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (i: number, s: number) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ------------------------------------------------------------------------------------------------------- the crown
export type VeilO = { shell: ShellO; /** the skin's colour (the gauze band lets it through) */ skin: string; /** the band's height at the face (deg up the head) */ gauze?: number; /** the gauze's tint over the skin, 0..1 */ tint?: number };
/** (the Romeo shell's map heights: v = 0 at EL0 .. 1 at the crown) */
const EL0 = -72, NC = 360, NR = 44;
const vOf = (elDeg: number) => clamp((elDeg - EL0) / (90 - EL0), 0, 1);
const shellGeo = (b: PartKit, o: ShellO) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), ROWS = NR + 3, lip = o.edge ?? 0.018;
  for (let j = 0; j <= NC; j++) {
    const aDeg = -180 + (360 * j) / NC, a = rad(aDeg), u = j / NC, el0 = Math.asin(clamp(hairlineY(o, aDeg), -0.97, 0.97));
    const put = (el: number, r: number) => { const ce = Math.cos(el); b.toM(v.set(r * ce * Math.sin(a), r * Math.sin(el), r * ce * Math.cos(a))); pos.push(v.x, v.y, v.z); uv.push(u, vOf((el * 180) / Math.PI)); };
    // the edge tucks into the skin, then its fine lip (the veil's hem), then up over the dome to the crown
    put(el0 - rad(4), 0.93); put(el0, 0.995); put(el0, 1 + lip);
    for (let i = 1; i <= NR; i++) { const el = el0 + (Math.PI / 2 - el0) * (i / NR), p = shellPoint(o, aDeg, el); b.toM(v.copy(p)); pos.push(v.x, v.y, v.z); uv.push(u, vOf((el * 180) / Math.PI)); }
  }
  for (let j = 0; j < NC; j++) for (let i = 0; i < ROWS - 1; i++) { const A0 = j * ROWS + i, B0 = (j + 1) * ROWS + i; idx.push(A0, B0, A0 + 1, B0, B0 + 1, A0 + 1); }
  const g = meshOf(pos, uv, idx), P = g.attributes.position, N = g.attributes.normal;
  let s = 0;
  for (let i = 0; i < P.count; i += 7) s += P.getX(i) * N.getX(i) + P.getY(i) * N.getY(i) + P.getZ(i) * N.getZ(i);
  if (s >= 0) return g;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  return meshOf(pos, uv, idx);
};
const veilMap = (b: PartKit, O: VeilO, key: string) => b.tex(2048, 1024, (g) => {
  const o = O.shell, W = 2048, H = 1024, X = (aDeg: number) => ((aDeg + 180) / 360) * W, Y = (elDeg: number) => H * (1 - vOf(elDeg));
  const light = o.light ?? shade(o.col, 1.4), deep = o.deep ?? shade(o.col, 0.6), elOf = (a: number) => (Math.asin(clamp(hairlineY(o, a), -0.97, 0.97)) * 180) / Math.PI;
  g.fillStyle = o.col; g.fillRect(0, 0, W, H); g.lineCap = "round";
  // the hair, combed from the middle parting down and back on both sides: long fine strands
  for (let i = 0; i < 150; i++) {
    const s = i % 2 ? 1 : -1, h1 = hash(i, 1), h2 = hash(i, 2), h3 = hash(i, 3), el = lerp(40, 89, h1), a1 = s * lerp(55, 150, h2), e1 = lerp(-20, 30, h3);
    g.strokeStyle = hash(i, 4) < 0.55 ? light : deep; g.globalAlpha = 0.14 + 0.2 * hash(i, 5); g.lineWidth = 2 + 3.5 * hash(i, 6);
    g.beginPath(); g.moveTo(X(s * 1.2), Y(el)); g.bezierCurveTo(X(s * 18), Y(el + 1), X(a1 * 0.6), Y(lerp(el, e1, 0.35)), X(a1), Y(e1)); g.stroke();
  }
  // round the back: strands straight down
  for (let i = 0; i < 80; i++) {
    const a = 100 + 160 * hash(i, 11), x = X(a > 180 ? a - 360 : a), y0 = Y(lerp(20, 70, hash(i, 12))), y1 = Y(lerp(-70, -10, hash(i, 13)));
    g.strokeStyle = hash(i, 14) < 0.5 ? light : deep; g.globalAlpha = 0.12 + 0.16 * hash(i, 15); g.lineWidth = 2 + 3 * hash(i, 16);
    g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (hash(i, 17) - 0.5) * 30, (y0 + y1) / 2, x + (hash(i, 18) - 0.5) * 16, y1); g.stroke();
  }
  // a soft sheen on each side of the parting (no ring: the gauze dulls it)
  for (const s of [-1, 1]) {
    const gr = g.createRadialGradient(X(s * 30), Y(60), 0, X(s * 30), Y(60), W * 0.085);
    gr.addColorStop(0, light); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = 0.34; g.fillStyle = gr; g.fillRect(X(s * 30) - W * 0.1, Y(60) - H * 0.2, W * 0.2, H * 0.4);
  }
  // the parting: a pale line of scalp between two dark ones, from the hairline over the crown to the back
  g.globalAlpha = 0.75; g.strokeStyle = deep; g.lineWidth = 9; g.beginPath(); g.moveTo(X(0), Y(elOf(0))); g.lineTo(X(0), Y(90)); g.stroke();
  g.globalAlpha = 0.6; g.strokeStyle = shade(O.skin, 0.72); g.lineWidth = 2.6; g.beginPath(); g.moveTo(X(0), Y(elOf(0) + 5)); g.lineTo(X(0), Y(84)); g.stroke();
  // the gauze over all of it: a dull dark veil
  g.globalAlpha = 0.2; g.fillStyle = "#17110d"; g.fillRect(0, 0, W, H);
  // THE VEIL'S FRONT: between its hem (the shell's edge, a fine line) and her hairline the skin shows through the gauze
  const gz = O.gauze ?? 0, band = (a: number) => gz * (1 - 0.5 * sm((Math.abs(a) - 45) / 50)) * (1 - sm((Math.abs(a) - 104) / 22));
  // (her hairline: one smooth curve, dipping a little at the parting)
  const line = (a: number) => elOf(a) + band(a) - 1.3 * Math.exp(-((a / 6) ** 2));
  const skinG = shade(O.skin, 1 - 0.3 * (O.tint ?? 0.6));
  if (gz > 0) {
  g.globalAlpha = 1; g.fillStyle = skinG;
  g.beginPath(); g.moveTo(X(-128), Y(elOf(-128) - 6));
  for (let a = -128; a <= 128; a += 1) g.lineTo(X(a), Y(elOf(a) - 6));
  for (let a = 128; a >= -128; a -= 1) g.lineTo(X(a), Y(line(a)));
  g.closePath(); g.fill();
  // the gauze's own fine weave: two faint lines along the band
  g.strokeStyle = shade(O.skin, 0.62); g.lineWidth = 1.6; g.globalAlpha = 0.35;
  for (const q of [0.4, 0.75]) { g.beginPath(); for (let a = -110; a <= 110; a += 2) { const y = Y(elOf(a) + band(a) * q); if (a === -110) g.moveTo(X(a), y); else g.lineTo(X(a), y); } g.stroke(); }
  // the hairline: a soft dark edge (two passes: a wide faint one over the band, the hair's own edge)
  for (const [lw, al, dy] of [[9, 0.28, -0.9], [4, 0.9, 0.2]] as number[][]) {
    g.strokeStyle = o.col; g.lineWidth = lw; g.globalAlpha = al;
    g.beginPath(); for (let a = -116; a <= 116; a += 1) { const y = Y(line(a) + dy); if (a === -116) g.moveTo(X(a), y); else g.lineTo(X(a), y); } g.stroke();
  }
  }
  g.globalAlpha = 1;
}, key);
/** HER HAIR UNDER THE VEIL (see the head of this file). The shell tells the rig it is a hat (shell.hat), so the look's
 *  own painted fringe is cut away under it. */
export const veilHair = (O: VeilO): Acc => {
  const o = O.shell, key = ["monaVeil6", JSON.stringify(O)].join("|");
  return {
    name: "veilHair", slots: o.hat ? ["hat", "crown"] : [], key, noHairProps: true,
    ...(o.hat ? { hat: { rim: o.hat, hair: "cut" as const, shade: false } } : {}),
    build(b) { b.solid("head", shellGeo(b, o), { col: "#ffffff", map: veilMap(b, O, key), paint: o.paint ?? "hair", ink: 0.0062 }); },
  };
};

// ------------------------------------------------------------------------------------------------------- the ringlets
/** a loose ringlet along the curve p0 -> p1 -> p2 (head units): a round lock whose middle line winds round the curve
 *  (`turns` coils, `amp` wide at its foot, nothing at the root), r0 thick at the root and r1 near the tip, where it
 *  comes to a point. wind = which way it winds (+1 / -1); ph = where on the coil it starts. Closed at both ends. */
const ringletGeo = (b: PartKit, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, r0: number, r1: number, turns: number, amp: number, wind: number, ph: number) => {
  const NS = 120, NCd = 16, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), c = V(), T = V(), N0 = V(), B = V();
  const at = (t: number) => { const s = 1 - t; return c.set(0, 0, 0).addScaledVector(p0, s * s).addScaledVector(p1, 2 * s * t).addScaledVector(p2, t * t); };
  const mid = (t: number) => {
    const s = 1 - t;
    T.set(0, 0, 0).addScaledVector(p0, -2 * s).addScaledVector(p1, 2 * s - 2 * t).addScaledVector(p2, 2 * t).normalize();
    N0.set(1, 0, 0).addScaledVector(T, -T.x).normalize(); B.crossVectors(T, N0);
    const a = amp * sm(t / 0.3) * (1 - 0.5 * sm((t - 0.9) / 0.1)), phi = wind * (2 * Math.PI * turns * Math.pow(t, 0.92)) + ph;
    return at(t).addScaledVector(N0, a * Math.cos(phi)).addScaledVector(B, a * 0.75 * Math.sin(phi));
  };
  b.toM(v.copy(mid(0))); pos.push(v.x, v.y, v.z); uv.push(0.5, 0);
  for (let i = 1; i < NS; i++) {
    const t = i / NS, s = 1 - t;
    const R0 = lerp(r1, r0, Math.pow(s, 0.7)) * Math.pow(Math.sin(Math.min(1, t / 0.06) * (Math.PI / 2)), 0.6) * Math.pow(Math.sin(Math.min(1, s / 0.1) * (Math.PI / 2)), 0.7);
    const m = mid(t).clone();
    for (let j = 0; j <= NCd; j++) {
      const th = (j / NCd) * Math.PI * 2;
      b.toM(v.copy(m).addScaledVector(N0, R0 * Math.cos(th)).addScaledVector(B, R0 * 0.8 * Math.sin(th)));
      pos.push(v.x, v.y, v.z); uv.push(j / NCd, t);
    }
  }
  b.toM(v.copy(mid(1))); pos.push(v.x, v.y, v.z); uv.push(0.5, 1);
  const Rr = (i: number, j: number) => 1 + (i - 1) * (NCd + 1) + j, end = 1 + (NS - 1) * (NCd + 1);
  for (let j = 0; j < NCd; j++) { idx.push(0, Rr(1, j + 1), Rr(1, j)); idx.push(end, Rr(NS - 1, j), Rr(NS - 1, j + 1)); }
  for (let i = 1; i < NS - 1; i++) for (let j = 0; j < NCd; j++) idx.push(Rr(i, j), Rr(i, j + 1), Rr(i + 1, j), Rr(i, j + 1), Rr(i + 1, j + 1), Rr(i + 1, j));
  const g = meshOf(pos, uv, idx), P = g.attributes.position, N = g.attributes.normal, mi = Rr(NS >> 1, 0), mm = b.toM(mid(0.5).clone());
  if ((P.getX(mi) - mm.x) * N.getX(mi) + (P.getY(mi) - mm.y) * N.getY(mi) + (P.getZ(mi) - mm.z) * N.getZ(mi) < 0) {
    for (let i = 0; i < idx.length; i += 3) { const t2 = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t2; }
    return meshOf(pos, uv, idx);
  }
  return g;
};
/** a ringlet's paint: fine strands that wind with it, a light on the crest of every coil */
const ringletMap = (b: PartKit, col: string, light: string, deep: string, turns: number, key: string) => b.tex(128, 1024, (g) => {
  const W = 128, H = 1024;
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  for (let k = 0; k < turns * 2 + 2; k++) {
    const y = ((k + 0.5) / (turns * 2)) * H, gr = g.createLinearGradient(0, y - H / (turns * 5), 0, y + H / (turns * 5));
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, k % 2 ? light : deep); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = k % 2 ? 0.55 : 0.5; g.fillStyle = gr; g.fillRect(0, y - H / (turns * 5), W, (2 * H) / (turns * 5));
  }
  g.lineCap = "round";
  for (let i = 0; i < 26; i++) {
    const x = W * hash(i, 31);
    g.strokeStyle = hash(i, 32) < 0.5 ? light : deep; g.globalAlpha = 0.16 + 0.2 * hash(i, 33); g.lineWidth = 2 + 2.5 * hash(i, 34);
    g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 14, H * 0.3, x - 14, H * 0.7, x + 6, H); g.stroke();
  }
  g.globalAlpha = 1;
}, key);
export type RingletO = { col: string; light?: string; deep?: string; veil?: string | false; /** how far below the head's middle the longest ends (head units) */ len?: number; size?: number };
/** HER RINGLETS (see the head of this file) */
export const ringlets = (o: RingletO): Acc => {
  const light = o.light ?? shade(o.col, 1.5), deep = o.deep ?? shade(o.col, 0.6), len = o.len ?? 1.85, k = o.size ?? 1, veil = o.veil === undefined ? shade(o.col, 0.62) : o.veil;
  const key = ["monaRinglets5", o.col, light, deep, veil, len, k].join("|");
  return {
    name: "ringlets", slots: [], key,
    build(b) {
      for (const s of [-1, 1]) {
        // the veil's dark fall behind them: one broad soft lock from behind the temple to the shoulder (it closes the
        // gap between the ringlets and gives the head one outline)
        if (veil) {
          const geo = lockGeo((v) => b.toM(v), V(s * 0.9, 0.5, -0.02), V(s * 1.08, -0.4, 0.0), V(s * 0.8, -len * 0.98, 0.12), V(0, 0, 1), 0.6 * k, 0.2 * k, 0.5, 0.75);
          b.solid("head", geo, { col: veil, paint: "hair", ink: 0.0075 });
        }
        // three ringlets: at the cheek (the longest light on it), beside it, and behind (shorter)
        const spec: [THREE.Vector3, THREE.Vector3, THREE.Vector3, number, number, number, number][] = [
          [V(s * 0.87, 0.46, 0.2), V(s * 1.06, -0.4, 0.26), V(s * 0.76, -len, 0.34), 0.14, 4.6, 0.07, 0.3],
          [V(s * 0.93, 0.38, 0.06), V(s * 1.13, -0.5, 0.18), V(s * 0.86, -len * 0.95, 0.32), 0.15, 4.0, 0.075, 2.1],
          [V(s * 0.9, 0.32, -0.2), V(s * 1.14, -0.5, -0.1), V(s * 0.98, -len * 0.82, 0.04), 0.14, 3.4, 0.07, 4.0],
        ];
        spec.forEach(([p0, p1, p2, r, turns, amp, ph], i) => {
          const map = ringletMap(b, o.col, light, deep, turns, `${key}|${turns}`);
          b.solid("head", ringletGeo(b, p0, p1, p2, r * k, 0.05 * k, turns, amp * k, s * (i % 2 ? -1 : 1), ph + (s > 0 ? 0 : 1.3)), { col: "#ffffff", map, paint: "hair", ink: 0.007 });
        });
      }
    },
  };
};
