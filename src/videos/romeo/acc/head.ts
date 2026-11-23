// HEADS of 采访罗密欧与朱丽叶 (design stage): hats and hair in 3D for the rig3d figures of group/kit (imported, never
// edited). Head units: the head's radius = 1; x = the person's left, y = up, z = the face side. Nothing 3D sits in
// front of the face below the brows (the kit's "face" rule): side tresses hang 68 degrees or more round from it.
//   beret(o)       ROMEO: a big soft velvet cap slouched to his right, a gold band, a jewelled brooch and one long
//                  curling feather. name "beret" (hide: ["beret"] = bare-headed: the tomb).
//   curls(o)       ROMEO: loose locks that stick out under the cap at the temples and the nape (and a cowlick on a
//                  bare head). name "curls"
//   julietCap(o)   JULIET: the cap named after her: a small gold net cap on the back of the crown, pearls at the net's
//                  knots and along its rim. name "julietCap"
//   tresses(o)     JULIET: two long tresses that hang from behind the temples down in front of the shoulders, each
//                  bound with a ribbon near its end. name "tresses"
//   hairRoll(o)    JULIET: a soft roll of her own hair over the head from ear to ear, in front of the cap. name "hairRoll"
//   tonsure(o)     THE FRIAR: the shaved crown: a dome of bare skin with the ring of hair left round it. name "tonsure"
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { hoop, shade } from "../../group/kit/rigacc/shapes";
import { lathe, leafGeo, meshOf, weld } from "../../wanbi/acc/envoy";
import { shellPoint, type ShellO } from "./hair";
import { lockGeo } from "./backhair";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;

// ------------------------------------------------------------------------------------------------------- Romeo
/** ROMEO'S CAP (see the head of this file). col = the velvet, band = the band round its foot, plume = the feather,
 *  gem = the brooch's stone. size = the crown's spread (1 = 1.18 head radii) */
export const beret = (o: { col?: string; band?: string; plume?: string; gem?: string; size?: number; r0?: number; base?: number; tilt?: [number, number] } = {}): Acc => {
  const col = o.col ?? "#24468f", band = o.band ?? "#e2b03a", plume = o.plume ?? "#f6f1e4", gem = o.gem ?? "#c4202e", k = o.size ?? 1, tl = o.tilt ?? [-13, -5];
  return {
    name: "beret", slots: ["hat", "crown"], key: ["rjBeret", col, band, plume, gem, k, o.r0 ?? "", o.base ?? "", tl.join(",")].join("|"), hat: { rim: 44, hair: "keep", shade: false },
    build(b) {
      // (v3: r0 / base lift it onto the sculpted hair, tilt sets it back off his fringe)
      b.tilt(tl[0], tl[1]);
      const R = b.R, r0 = o.r0 ?? 0.74, kr = r0 / 0.74, base = o.base ?? 0.62, hb = 0.17, rx = 1.18 * k, ry = 0.36, t0 = -Math.acos(r0 / rx), cy = base + hb - ry * Math.sin(t0);
      // the band (a short upright wall), then the soft crown bulging out over it and closing on top
      const prof: [number, number][] = [[r0 * 0.96, base - 0.32], [r0, base + hb]];
      for (let i = 1; i < 14; i++) { const t = t0 + ((Math.PI / 2 - t0) * i) / 14; prof.push([rx * Math.cos(t), cy + ry * Math.sin(t)]); }
      prof.push([0, cy + ry * 0.94]);
      const hat = lathe(b.toM, prof, 56), vAt = hat.userData.vAt as number[];
      const map = b.tex(64, 512, (g) => {
        const Y = (v: number) => 512 * (1 - v);
        g.fillStyle = col; g.fillRect(0, 0, 64, 512);
        // soft gathers radiating over the crown
        g.fillStyle = shade(col, 0.82); for (let x = 4; x < 64; x += 16) g.fillRect(x, 0, 2.2, Y(vAt[3]));
        g.fillStyle = shade(col, 1.25); for (let x = 12; x < 64; x += 16) g.fillRect(x, Y(vAt[9]), 1.6, Y(vAt[3]) - Y(vAt[9]));
        // the band
        g.fillStyle = band; g.fillRect(0, Y(vAt[1]), 64, 512);
        g.fillStyle = shade(band, 0.55); g.fillRect(0, Y(vAt[1]) - 3, 64, 5);
      }, `rjBeret|${col}|${band}`);
      b.solid("head", hat, { map, ink: 0.0085 });
      // the feather: from the brooch at his left temple up, back and over the cap in one long curl
      const fmap = b.tex(256, 256, (g) => {
        g.fillStyle = plume; g.fillRect(0, 0, 256, 256);
        g.strokeStyle = shade(plume, 0.82); g.lineWidth = 6; g.lineCap = "round";
        for (const x of [64, 192]) for (let i = 1; i < 11; i++) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x, 256 - i * 23); g.lineTo(x + s * 52, 256 - i * 23 - 20); g.stroke(); }
        g.fillStyle = shade(plume, 0.62); for (const x of [64, 192]) g.fillRect(x - 4, 0, 8, 256);
      }, `rjPlume|${plume}`);
      b.solid("head", leafGeo(b.toM, V(0.66 * kr, base + 0.1, 0.34 * kr), V(1.7, 2.2, 0.1), V(0.1, 2.05, -1.25), 0.6, 0.2, 0.55), { map: fmap, ink: 0.0075 });
      // the brooch: a gold boss with a red stone in it
      b.put(b.solid("head", new THREE.SphereGeometry(0.15 * R, 16, 12), { col: band, ink: b.INK * 0.7 }), 0.7 * kr, base + 0.1, 0.4 * kr);
      b.put(b.solid("head", new THREE.SphereGeometry(0.085 * R, 12, 10), { col: gem, ink: b.INK * 0.5 }), 0.745 * kr, base + 0.1, 0.49 * kr);
    },
  };
};
/** ROMEO'S CAP ON THE SCULPTED HAIR (v3b, 23 Nov: the owner, "romeo v3 with hat but no clipping of hairs"). The cap
 *  above is a lathe: a round band. The sculpted hair is not round (a forelock, locks, a fuller back), so a round band
 *  either sank into it (the hair came through the gold band: v3) or stood off it. This one is FITTED: the band runs
 *  round the hair shell `on` (hair.ts shellPoint) at a constant height in the cap's own tilted frame, so it lies ON the
 *  hair everywhere, over the forelock and the locks; the soft crown starts from the band's top edge and puffs out
 *  round it, closing over the hair. Nothing of the hair can come through: under the band is the band, above it is
 *  the crown. tilt = [toward his left, toward the face] (deg); foot / top = the band's lower / upper edge as
 *  elevations in the cap's frame (deg); size = the puff's spread (1 = 1.3 times the band's widest) */
export const beretOn = (o: { on: ShellO; tilt?: [number, number]; foot?: number; top?: number; size?: number; col?: string; band?: string; plume?: string; gem?: string }): Acc => {
  const col = o.col ?? "#24468f", band = o.band ?? "#e2b03a", plume = o.plume ?? "#f6f1e4", gem = o.gem ?? "#c4202e", k = o.size ?? 1;
  const tl = o.tilt ?? [12, -16], eF = rad(o.foot ?? 30), eT = rad(o.top ?? 41);
  return {
    name: "beret", slots: ["hat", "crown"], hat: { rim: 44, hair: "keep", shade: false },
    key: ["rjBeretOn", JSON.stringify(o.on), col, band, plume, gem, k, tl.join(","), eF, eT].join("|"),
    build(b) {
      const Q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(tl[1]), 0, rad(-tl[0]), "XYZ")), Qi = Q.clone().invert();
      const SEG = 72, NCb = 12, TH = 0.045;
      // the hair's surface along a direction given in the cap's frame (phi round from the face, + = his left; e = up)
      const onHair = (phi: number, e: number, out = 0) => {
        const d = V(Math.cos(e) * Math.sin(phi), Math.sin(e), Math.cos(e) * Math.cos(phi)).applyQuaternion(Q);
        const el = Math.asin(Math.max(-1, Math.min(1, d.y))), az = (Math.atan2(d.x, d.z) * 180) / Math.PI;
        const p = shellPoint(o.on, az, el);
        return p.addScaledVector(p.clone().normalize(), out);
      };
      const loft = (rows: THREE.Vector3[][], mTest: number) => {
        // rows[i][k]: column i round the cap (the last = the first when close), k along it
        const n = rows[0].length, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V();
        rows.forEach((r, i) => r.forEach((p, kk) => { b.toM(v.copy(p)); pos.push(v.x, v.y, v.z); uv.push(i / (rows.length - 1), kk / (n - 1)); }));
        for (let i = 0; i < rows.length - 1; i++) for (let kk = 0; kk < n - 1; kk++) { const A = i * n + kk, B = A + 1, C = A + n, D = C + 1; idx.push(A, C, B, B, C, D); }
        let g = meshOf(pos, uv, idx);
        // outward faces (the ink hull needs them): the normal at row mTest of the first column against the head's middle
        const m = mTest, P = g.attributes.position, N = g.attributes.normal, ax = b.toM(V(0, 0, 0));
        if ((P.getX(m) - ax.x) * N.getX(m) + (P.getY(m) - ax.y) * N.getY(m) + (P.getZ(m) - ax.z) * N.getZ(m) < 0) {
          for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
          g = meshOf(pos, uv, idx);
        }
        return g;
      };
      // THE BAND: a rounded strip lying on the hair from `foot` to `top` (its inner half under the hair's surface). It lies
      // on the hair's OUTER ENVELOPE, not on every notch and lock tip: the radius at each place is the most the hair
      // reaches round it (8 deg each way, a little above and below), evened out round the band, so it runs smooth
      // and bridges the gaps between locks (on the hair itself it took their points: a crown of gold teeth)
      const dirOf = (phi: number, e: number) => V(Math.cos(e) * Math.sin(phi), Math.sin(e), Math.cos(e) * Math.cos(phi)).applyQuaternion(Q);
      const env = (e: number) => {
        const raw: number[] = [];
        for (let i = 0; i < SEG; i++) {
          const phi = (2 * Math.PI * i) / SEG;
          let m = 1.03;
          for (let dp = -8; dp <= 8; dp += 4) for (let de = -3; de <= 3; de += 3) m = Math.max(m, onHair(phi + rad(dp), e + rad(de)).length());
          raw.push(m);
        }
        return raw.map((_, i) => { let t = 0; for (let j = -3; j <= 3; j++) t += raw[(i + j + SEG) % SEG]; return t / 7; }).map((v, i) => Math.max(v, raw[i]));
      };
      const envF = env(eF), envT = env(eT);
      const onEnv = (i: number, e: number, rr: number[]) => dirOf((2 * Math.PI * (i % SEG)) / SEG, e).multiplyScalar(rr[i % SEG]);
      const bandRows: THREE.Vector3[][] = [], topEdge: THREE.Vector3[] = [];
      for (let i = 0; i <= SEG; i++) {
        const F = onEnv(i, eF, envF), T = onEnv(i, eT, envT), C = F.clone().add(T).multiplyScalar(0.5);
        const U = T.clone().sub(F).multiplyScalar(0.5), Rd = C.clone().normalize(), col: THREE.Vector3[] = [];
        for (let j = 0; j <= NCb; j++) { const th = (2 * Math.PI * j) / NCb; col.push(C.clone().addScaledVector(U, Math.cos(th)).addScaledVector(Rd, TH * Math.sin(th))); }
        bandRows.push(col); topEdge.push(T.clone().addScaledVector(T.clone().normalize(), 0.02));
      }
      const bandMap = b.tex(16, 64, (g) => { g.fillStyle = band; g.fillRect(0, 0, 16, 64); g.fillStyle = shade(band, 0.62); g.fillRect(0, 30, 16, 4); }, `rjBandOn|${band}`);
      b.solid("head", loft(bandRows, NCb / 4), { map: bandMap, ink: 0.0075 });
      // THE CROWN: from the band's top edge out round an ellipse (rx across, ry up) and closed over the top; each
      // column starts where its own band ends and the puff evens out toward the top
      const starts = topEdge.map((p) => p.clone().applyQuaternion(Qi)), h0 = starts.map((p) => Math.hypot(p.x, p.z)), y0 = starts.map((p) => p.y);
      const rx = 1.3 * k * Math.max(...h0), ry = 0.36, NK = 14;
      const t0s = h0.map((h) => -Math.acos(Math.min(0.995, h / rx))), cys = t0s.map((t, i) => y0[i] - ry * Math.sin(t)), cyM = cys.reduce((a, c) => a + c, 0) / cys.length;
      const crownRows = starts.map((s0, i) => {
        const ph = Math.atan2(s0.x, s0.z), out: THREE.Vector3[] = [topEdge[i].clone()];
        for (let kk = 1; kk <= NK; kk++) {
          const u = kk / NK, t = t0s[i] + (Math.PI / 2 - t0s[i]) * u, w = u * u * (3 - 2 * u), h = rx * Math.cos(t), y = cys[i] + (cyM - cys[i]) * w + ry * Math.sin(t) * (kk === NK ? 0.94 : 1);
          out.push(V(h * Math.sin(ph), y, h * Math.cos(ph)).applyQuaternion(Q));
        }
        return out;
      });
      const map = b.tex(64, 256, (g) => {
        g.fillStyle = col; g.fillRect(0, 0, 64, 256);
        g.fillStyle = shade(col, 0.82); for (let x = 4; x < 64; x += 16) g.fillRect(x, 70, 2.2, 186);
        g.fillStyle = shade(col, 1.25); for (let x = 12; x < 64; x += 16) g.fillRect(x, 40, 1.6, 120);
      }, `rjBeretOnCrown|${col}`);
      b.solid("head", loft(crownRows, NK >> 1), { map, ink: 0.0085 });
      // the brooch on the band at his left temple, and the feather from it up, back and over the crown in one curl
      const bp = (() => { const i = Math.round(SEG / 6), C = onEnv(i, eF, envF).add(onEnv(i, eT, envT)).multiplyScalar(0.5); return C.addScaledVector(C.clone().normalize(), TH + 0.05); })();
      const R = b.R, hq = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(Q);
      b.put(b.solid("head", new THREE.SphereGeometry(0.15 * R, 16, 12), { col: band, ink: b.INK * 0.7 }), bp.x, bp.y, bp.z);
      const gp = bp.clone().addScaledVector(bp.clone().normalize(), 0.09);
      b.put(b.solid("head", new THREE.SphereGeometry(0.085 * R, 12, 10), { col: gem, ink: b.INK * 0.5 }), gp.x, gp.y, gp.z);
      const fmap = b.tex(256, 256, (g) => {
        g.fillStyle = plume; g.fillRect(0, 0, 256, 256);
        g.strokeStyle = shade(plume, 0.82); g.lineWidth = 6; g.lineCap = "round";
        for (const x of [64, 192]) for (let i = 1; i < 11; i++) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x, 256 - i * 23); g.lineTo(x + s * 52, 256 - i * 23 - 20); g.stroke(); }
        g.fillStyle = shade(plume, 0.62); for (const x of [64, 192]) g.fillRect(x - 4, 0, 8, 256);
      }, `rjPlume|${plume}`);
      b.solid("head", leafGeo(b.toM, bp.clone(), hq(1.7, cyM + 1.25, 0.1), hq(0.1, cyM + 1.1, -1.25), 0.6, 0.2, 0.55), { map: fmap, ink: 0.0075 });
    },
  };
};
/** ROMEO'S LOCKS (see the head of this file): n pairs of locks at the temples and the nape; cowlick = one more that
 *  stands up at the back of the crown (for the bare head) */
export const curls = (o: { col?: string; cowlick?: boolean } = {}): Acc => ({
  name: "curls", slots: [], key: ["rjCurls", o.col ?? "", !!o.cowlick].join("|"),
  build(b) {
    const col = o.col ?? b.look.hairCol;
    const lock = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep = 0.2) => b.solid("head", leafGeo(b.toM, p0, p1, p2, wide, deep, 0.45), { col, paint: "hair", ink: 0.0075 });
    for (const s of [-1, 1]) {
      // behind the ear: out from under the cap, down, and a small flick outward
      lock(V(s * 0.82, 0.3, -0.26), V(s * 1.08, -0.1, -0.32), V(s * 1.14, -0.42, -0.26), 0.3, 0.16);
      // the nape
      lock(V(s * 0.5, 0.1, -0.8), V(s * 0.68, -0.3, -0.98), V(s * 0.74, -0.62, -0.88), 0.36, 0.18);
    }
    lock(V(0, 0.12, -0.86), V(0, -0.32, -1.06), V(0.06, -0.68, -0.94), 0.4, 0.18);
    if (o.cowlick) lock(V(0.1, 0.86, -0.3), V(0.3, 1.32, -0.42), V(0.62, 1.3, -0.2), 0.3, 0.16);
  },
});

// ------------------------------------------------------------------------------------------------------- Juliet
/** THE JULIET CAP (see the head of this file): gold = the net, pearl = the pearls; back = how far it is tipped toward
 *  the back of the head (deg); to = how far down from its own top it reaches (deg) */
export const julietCap = (o: { gold?: string; pearl?: string; back?: number; to?: number } = {}): Acc => {
  const gold = o.gold ?? "#e2b03a", pearl = o.pearl ?? "#fbf6ea", back = o.back ?? 20, to = o.to ?? 44;
  return {
    name: "julietCap", slots: ["crown"], key: ["rjJulietCap", gold, pearl, back, to].join("|"), noHairProps: true,
    build(b) {
      b.tilt(0, -back);
      const map = b.tex(512, 256, (g) => {
        // (u round the head, v = 1 at the cap's top .. 0 at its rim) the hair shows through a diamond net of gold
        g.fillStyle = shade(b.look.hairCol, 1.25); g.fillRect(0, 0, 512, 256);
        g.strokeStyle = gold; g.lineWidth = 7; g.lineCap = "round";
        const N = 12, step = 512 / N;
        for (let i = -N; i < 2 * N; i++) { g.beginPath(); g.moveTo(i * step, 256); g.lineTo(i * step + 256 * 0.9, 0); g.stroke(); g.beginPath(); g.moveTo(i * step, 256); g.lineTo(i * step - 256 * 0.9, 0); g.stroke(); }
        // pearls where the cords cross, on the two lower rows
        g.fillStyle = pearl; g.strokeStyle = shade(pearl, 0.6); g.lineWidth = 2;
        for (const m of [3, 5]) for (let i = -1; i <= N; i++) { g.beginPath(); g.ellipse((i + m / 2) * step, 256 - (m * step) / 1.8, 8.5, 9.5, 0, 0, 7); g.fill(); g.stroke(); }
        // the rim: a gold band with a row of pearls on it
        g.fillStyle = gold; g.fillRect(0, 256 - 46, 512, 46);
        g.fillStyle = shade(gold, 0.55); g.fillRect(0, 256 - 49, 512, 5);
        g.fillStyle = pearl; g.strokeStyle = shade(pearl, 0.6);
        for (let i = 0; i < 2 * N; i++) { g.beginPath(); g.ellipse((i + 0.5) * step * 0.5, 256 - 23, 9.5, 12, 0, 0, 7); g.fill(); g.stroke(); }
      }, `rjJulietCap|${gold}|${pearl}|${b.look.hairCol}`);
      b.shell({ r: 1.075, from: 0, to, map, rimInk: 0.007, tuck: 9, onR: 1.03 });
    },
  };
};
/** JULIET'S TRESSES (see the head of this file): len = how far below the head's middle they end (head radii); ribbon =
 *  the binding's colour (false = none) */
export const tresses = (o: { col?: string; ribbon?: string | false; len?: number } = {}): Acc => {
  const ribbon = o.ribbon === undefined ? "#e2b03a" : o.ribbon, len = o.len ?? 1.8;
  return {
    name: "tresses", slots: [], key: ["rjTresses", o.col ?? "", ribbon, len].join("|"),
    build(b) {
      const col = o.col ?? b.look.hairCol;
      const map = b.tex(64, 256, (g) => {
        // (v runs along the tress, 0 at the temple .. 1 at its end) strands, then the ribbon wound three times near the end
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 256);
        g.strokeStyle = "#8a8490"; g.lineWidth = 2.4; for (let x = 5; x < 64; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 3, 256); g.stroke(); }
      }, "rjTressStrands");
      for (const s of [-1, 1]) {
        const p0 = V(s * 0.82, 0.42, 0.14), p1 = V(s * 1.13, -0.5, 0.2), p2 = V(s * 0.9, -len, 0.34);
        b.solid("head", leafGeo(b.toM, p0, p1, p2, 0.4, 0.3, 0.46), { col, map, paint: "hair", ink: 0.0075 });
        if (ribbon) {
          // three small rings round the tress near its end (balls: a ring's hull would open seen edge-on)
          for (const t of [0.72, 0.8, 0.88]) {
            const q = 1 - t, c = V().addScaledVector(p0, q * q).addScaledVector(p1, 2 * q * t).addScaledVector(p2, t * t), w = 0.5 * Math.sin(Math.PI * t ** 1) ** 0.6;
            const ring = new THREE.SphereGeometry(b.R * (0.08 + 0.2 * w), 14, 10); ring.scale(1.06, 0.3, 1.0);
            b.put(b.solid("head", weld(ring), { col: ribbon, ink: 0.005 }), c.x, c.y, c.z);
          }
        }
      }
    },
  };
};
/** a soft roll of hair over the head from ear to ear (see the head of this file) */
export const hairRoll = (o: { col?: string; yaw?: number; deep?: number; across?: number } = {}): Acc => ({
  name: "hairRoll", slots: [], key: ["rjHairRoll", o.col ?? "", o.yaw ?? 12, o.deep ?? 0.14, o.across ?? 0.26].join("|"),
  build(b) {
    const g = hoop(b.toM, { r: 1.07, a0: -84, a1: 84, deep: o.deep ?? 0.14, across: o.across ?? 0.26, yaw: o.yaw ?? 12, e: 0.8 });
    b.solid("head", weld(g), { col: o.col ?? b.look.hairCol, paint: "hair", ink: 0.007 });
  },
});

// ------------------------------------------------------------------------------------------------------- the Friar
/** THE TONSURE (see the head of this file). It is a "hat" to the rig (rim = how far down from the crown the bare skin
 *  reaches, deg; hair "cut": the rig then leaves the fringe out and lets the hair show only under the rim from the
 *  temples back, which is exactly a tonsure's ring), and the bare patch is a skin-coloured shell lying on the head.
 *  tufts = a soft tuft of hair over each ear. col = the patch's colour (the lit skin, near white). */
export const tonsure = (o: { rim?: number; col?: string; tufts?: boolean } = {}): Acc => {
  const rim = o.rim ?? 50, tufts = o.tufts ?? true;
  return {
    name: "tonsure", slots: ["hat", "crown"], key: ["rjTonsure", rim, o.col ?? "", tufts].join("|"), hat: { rim, hair: "cut", shade: false },
    build(b) {
      if (tufts) {
        const col = b.look.hairCol;
        for (const s of [-1, 1]) {
          b.solid("head", leafGeo(b.toM, V(s * 0.88, 0.22, -0.06), V(s * 1.16, 0.06, -0.1), V(s * 1.1, -0.3, -0.02), 0.36, 0.18, 0.45), { col, paint: "hair", ink: 0.0075 });
          b.solid("head", leafGeo(b.toM, V(s * 0.76, 0.26, -0.48), V(s * 1.04, 0.06, -0.6), V(s * 0.98, -0.32, -0.5), 0.38, 0.18, 0.45), { col, paint: "hair", ink: 0.0075 });
        }
      }
      b.shell({ r: 1.014, from: 0, to: rim + 1, col: o.col ?? "#f3e9e3", ink: 0 });
    },
  };
};
/** THE FRIAR'S RING OF HAIR (v2, 22 Nov: replaces the tonsure shell, whose cap of skin read as a glass visor): the head
 *  is bald (people.ts Person.bald clears the rig's painted hair), and the ring is a horseshoe of soft tufts lying on
 *  the skull from the temples round the back, fullest over the ears (the classic friar's crown seen from the front as
 *  two puffs). col = the hair (default the look's), y = the ring's height on the head (head units), puff = how far the
 *  side tufts stand out. */
export const hairRing = (o: { col?: string; y?: number; puff?: number; burns?: number } = {}): Acc => {
  const y0 = o.y ?? 0.1, puff = o.puff ?? 1, burns = o.burns ?? 0;
  return {
    name: "hairRing", slots: [], key: ["rjHairRing", o.col ?? "", y0, puff, burns].join("|"),
    build(b) {
      const col = o.col ?? b.look.hairCol;
      // P(az, y, r): a point at azimuth az (deg from the face toward the person's left), height y, radius r (head units)
      const P = (az: number, y: number, r: number) => { const c = Math.sqrt(Math.max(0, 1 - y * y)), a = rad(az); return V(r * c * Math.sin(a), y, r * c * Math.cos(a)); };
      const tuft = (az: number, k: number) => {
        // a lock lying on the skull: from above the ring down over it and back in, standing out by k at its fullest
        b.solid("head", leafGeo(b.toM, P(az, y0 + 0.34, 0.985), P(az, y0 + 0.02, 1.0 + 0.17 * k * puff), P(az, y0 - 0.34, 0.99), 0.2 + 0.05 * k, 0.36 + 0.08 * k, 0.5), { col, paint: "hair", ink: 0.0075 });
      };
      for (const s of [-1, 1]) {
        for (const [az, k] of [[84, 0.85], [103, 1.15], [121, 1.0], [139, 0.8], [156, 0.65], [170, 0.55]] as const) tuft(s * az, k);
      }
      tuft(180, 0.5);
      // v4 ("polish the character designs"): the ring's front end is a pointed lock lying on the temple and running
      // down in front of the ear (a sideburn `burns` long), where it used to stop as a flat cut face (the two puffs
      // read as earmuffs from the front)
      if (burns > 0) for (const s of [-1, 1]) {
        const p0 = P(s * 92, y0 + 0.3, 1.0), p2 = P(s * 67, y0 - burns, 1.03), mid = p0.clone().add(p2).multiplyScalar(0.5), ml = mid.length(), p1 = mid.clone().multiplyScalar((2 * 1.1 - ml) / ml);
        const am = rad(s * 80), side = V(Math.cos(am), 0, -Math.sin(am));
        b.solid("head", lockGeo(b.toM, p0, p1, p2, side, 0.34, 0.11, 0.3, 0.9), { col, paint: "hair", ink: 0.0075 });
      }
    },
  };
};
export { rad };
