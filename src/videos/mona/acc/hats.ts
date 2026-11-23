// HEADS of the side cast of 采访蒙娜丽莎的一天 (first build, 23 Nov 2026): hats and hair in 3D for the rig3d figures of
// group/kit (imported, never edited). Head units: the head's radius = 1; x = the person's left, y = up, z = the face.
//   foolCap(o)    THE JESTER: a close cap in two colours split down the middle, a gold zigzag at its edge, two long
//                 horns that curl out and down, each with a bell. name "foolCap"
//   nightCap(o)   NAPOLEON in bed: a white cap with a rolled edge, its long end falling to his left with a tassel.
//                 name "nightCap"
//   oldHair(o)    LEONARDO at sixty-five: a bare crown (people.ts Person.bald) with long white hair falling from the
//                 temples and the back down to the shoulders. name "oldHair"
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { shade } from "../../group/kit/rigacc/shapes";
import { lathe, leafGeo } from "../../wanbi/acc/envoy";
import { lockGeo } from "../../romeo/acc/backhair";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
/** a dome lying on the head from height y0 up over the crown, r out from the skull */
const dome = (y0: number, r: number, n = 12): [number, number][] => {
  const t0 = Math.asin(y0 / r), prof: [number, number][] = [];
  for (let i = 0; i < n; i++) { const t = t0 + ((Math.PI / 2 - t0) * i) / n; prof.push([r * Math.cos(t), r * Math.sin(t)]); }
  prof.push([0, r]);
  return prof;
};

export const foolCap = (o: { a?: string; b?: string; bell?: string } = {}): Acc => {
  const ca = o.a ?? "#c8322e", cb = o.b ?? "#e8b83a", bell = o.bell ?? "#e2b03a";
  return {
    name: "foolCap", slots: ["hat", "crown"], key: ["monaFool", ca, cb, bell].join("|"), hat: { rim: 54, hair: "keep", shade: false },
    build(b) {
      const R = b.R, prof: [number, number][] = [[0.98, 0.24], ...dome(0.34, 1.045)], cap = lathe(b.toM, prof, 48), vAt = cap.userData.vAt as number[];
      const map = b.tex(256, 256, (g) => {
        // (u: 0.5 = the face side; the split runs over the crown from the brow to the nape)
        g.fillStyle = ca; g.fillRect(0, 0, 128, 256); g.fillStyle = cb; g.fillRect(128, 0, 128, 256);
        const y0 = 256 * (1 - vAt[1]);
        g.fillStyle = bell; g.beginPath(); g.moveTo(0, 256); for (let i = 0; i <= 16; i++) g.lineTo(i * 16, i % 2 ? y0 - 16 : y0 + 2); g.lineTo(256, 256); g.closePath(); g.fill();
        g.strokeStyle = shade(bell, 0.55); g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 16; i++) (i ? g.lineTo(i * 16, i % 2 ? y0 - 16 : y0 + 2) : g.moveTo(0, y0 + 2)); g.stroke();
      }, `monaFool|${ca}|${cb}|${bell}`);
      b.solid("head", cap, { map, ink: 0.0085 });
      // the horns: each in the other side's colour, out over the ear and curling down, a bell at the tip
      for (const s of [-1, 1]) {
        const p0 = V(s * 0.5, 0.82, 0), p1 = V(s * 1.5, 1.5, 0.05), p2 = V(s * 1.9, 0.5, 0.18);
        b.solid("head", lockGeo(b.toM, p0, p1, p2, V(0, 0, 1), 0.62, 0.56, 0.2, 0.75), { col: s > 0 ? ca : cb, ink: 0.008 });
        b.put(b.solid("head", new THREE.SphereGeometry(0.15 * R, 14, 10), { col: bell, ink: b.INK * 0.7 }), p2.x, p2.y - 0.08, p2.z);
      }
    },
  };
};

export const nightCap = (o: { col?: string; tassel?: string } = {}): Acc => {
  const col = o.col ?? "#f3efe4", tassel = o.tassel ?? "#c8a040";
  return {
    name: "nightCap", slots: ["hat", "crown"], key: ["monaNightCap", col, tassel].join("|"), hat: { rim: 52, hair: "keep", shade: false },
    build(b) {
      const R = b.R;
      b.tilt(4, -4);
      // a rolled edge, then the cap over the crown
      const prof: [number, number][] = [[0.97, 0.24], [1.08, 0.28], [1.1, 0.38], [1.04, 0.46], ...dome(0.48, 1.05).slice(1)];
      b.solid("head", lathe(b.toM, prof, 48), { col, ink: 0.0085 });
      // the long end: up from the crown, over, and down past his left ear
      const p0 = V(0.1, 0.9, 0), p1 = V(1.1, 1.75, 0.05), p2 = V(1.5, 0.15, 0.25);
      b.solid("head", lockGeo(b.toM, p0, p1, p2, V(0, 0, 1), 0.95, 0.9, 0.12, 0.9), { col, ink: 0.008 });
      b.put(b.solid("head", new THREE.SphereGeometry(0.16 * R, 14, 10), { col: tassel, ink: b.INK * 0.7 }), p2.x, p2.y - 0.1, p2.z);
    },
  };
};

export const oldHair = (o: { col?: string; len?: number } = {}): Acc => {
  const len = o.len ?? 1;
  return {
    name: "oldHair", slots: [], key: ["monaOldHair", o.col ?? "", len].join("|"),
    build(b) {
      const col = o.col ?? b.look.hairCol;
      const P = (az: number, y: number, r: number) => { const a = rad(az); return V(r * Math.sin(a), y, r * Math.cos(a)); };
      // long locks from a ring above the ears, falling outside the shoulders; fuller toward the back
      for (const s of [-1, 1]) for (const [az, k] of [[88, 0.8], [112, 1.0], [136, 1.0], [160, 0.9]] as const)
        b.solid("head", leafGeo(b.toM, P(s * az, 0.42, 0.9), P(s * az, -0.25, 1.22 + 0.1 * k), P(s * az, -1.0 * len - 0.3 * k, 1.02), 0.42 + 0.1 * k, 0.26, 0.42), { col, paint: "hair", ink: 0.0075 });
      b.solid("head", leafGeo(b.toM, P(180, 0.42, 0.9), P(180, -0.3, 1.3), P(180, -1.3 * len, 1.02), 0.6, 0.28, 0.42), { col, paint: "hair", ink: 0.0075 });
    },
  };
};
