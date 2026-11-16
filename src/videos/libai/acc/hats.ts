// THE HEADS of the Su film's cast (PLAN 2; WP3): the accessories the kit's wardrobe does not have, for the rig3d
// figures of group/kit (read only). Each function returns an Acc (rig3d.ts "accessories"); people.ts puts them on.
//   bambooHat()    SU's wide conical bamboo hat (斗笠): a shallow cone a head and a half wide each side with a
//                  rounded rim, woven rings painted at low contrast, a dark band where it sits; a plug under it sits
//                  in the head. No slot (it is no rig "hat": see bambooHat). hide: ["bambooHat"]
//   dongpoCap()    the tall square black cap 东坡巾: a square tube with rounded corners, a little wider at the top, a
//                  flat top, a darker band at its foot and a seam line round it a third of the way up (the double wall
//                  of the real cap). solo: true = it takes the "hat" slot (SU_OLD); false (SU, who also has the
//                  bamboo hat) = slot "crown" only. hide: ["dongpoCap"]
//   futou()        a Song official's black cap (幞头): a rounded cap with a raised back and, with wings: true, two
//                  straight stiff wings out to the sides from the back (the courier); wings: false (the servants).
//                  Slots "hat", "crown". hide: ["futou"]
//   twinBuns()     a child's two hair buns (双丫髻) high on each side of the crown, each tied with a ribbon. Slot
//                  "crown". hide: ["twinBuns"]
//   wink()         the rig has no wink (RIG_EXPRS: every face has two matching eyes, except "pained"): this draws on
//                  the face AFTER the eyes, erases the eye on the strong side (the side of the smirk) and draws a
//                  closed arched eye there instead. Part of the face drawing (cached with the figure), so a wink is a
//                  SWAP of figures with one Look (people.ts SU_WINK, under a blink), never a per-frame switch. No slot.
// The kit's rules (group/kit/RIG3D.md): nothing 3D in front of the face (62 deg each side of the front, below the
// brows), every hidden end deep inside the head, thin things at least two ink widths thick, nothing random.
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { shade } from "../../group/kit/rigacc/shapes";
import { lathe, rounded, meshOf, weld } from "../../wanbi/acc/envoy";

type ToM = (v: THREE.Vector3) => THREE.Vector3;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------- 斗笠
/** the bamboo hat's sizes in head units: the rim's radius and height, the apex's height */
export const BAMBOO_HAT = { rim: 1.78, rimY: 0.5, apex: 1.56 } as const;
/** SU's conical bamboo hat (see the head of this file). col = the bamboo, band = the ring where it sits */
export const bambooHat = (o: { col?: string; band?: string } = {}): Acc => {
  const col = o.col ?? "#d9bf86", band = o.band ?? "#8a6a3e", H = BAMBOO_HAT;
  return {
    // (not a rig "hat": a hat covers the crown slot, and SU also wears the 东坡巾 there, each hidden in turn; its rim
    //  stands above the head, so the hair needs nothing from it: the look's buzz hair stays as drawn, as under a
    //  perched hat with hair "keep")
    name: "bambooHat", slots: [], key: ["bambooHat", col, band].join("|"),
    build(b) {
      b.tilt(0, -4);
      // one closed solid, the material on the left of the profile: a plug that stands in the head up to the cone's
      // underside, the underside out to the rim, the rounded rim, the top surface up to the apex
      const prof = rounded([[0.48, 0.42], [0.6, 1.09], [H.rim - 0.08, H.rimY - 0.03], [H.rim, H.rimY + 0.02], [H.rim - 0.1, H.rimY + 0.1], [0.07, H.apex - 0.01], [0, H.apex]], 0.06);
      const g = lathe(b.toM, prof, 64), vAt = g.userData.vAt as number[];
      // v by length: the underside from vAt[1] to vAt[2], the top from vAt[4] to vAt[5]; woven rings on the top, a
      // darker band on the underside near the plug (seen from below: where it sits on the head)
      const weave = shade(col, 0.86), dark = shade(col, 0.74);
      const map = b.tex(8, 512, (cg) => {
        const Y = (v: number) => 512 * (1 - v);
        cg.fillStyle = col; cg.fillRect(0, 0, 8, 512);
        cg.fillStyle = dark; cg.fillRect(0, Y(vAt[2]), 8, Y(vAt[1]) - Y(vAt[2]));          // the underside: a shade darker
        cg.fillStyle = band; cg.fillRect(0, Y(vAt[1] + 0.06), 8, Y(vAt[1]) - Y(vAt[1] + 0.06));
        cg.fillStyle = weave; for (let k = 1; k < 9; k++) { const v = vAt[4] + ((vAt[5] - vAt[4]) * k) / 9; cg.fillRect(0, Y(v) - 3, 8, 6); }
        cg.fillStyle = band; cg.fillRect(0, Y(vAt[4] + 0.012), 8, Y(vAt[3]) - Y(vAt[4] + 0.012));   // the rim's binding
      }, `bambooHat|${col}|${band}`);
      b.solid("head", g, { map, ink: 0.008 });
    },
  };
};

// ---------------------------------------------------------------------------------------------------- 东坡巾
/** a tube with a rounded-square section round the head's axis, through toM: rows [half width (x), half depth (z),
 *  height] from the bottom up, closed at the top (its last row's centre); p = how square (0.5 = officerCap's) */
const squareTube = (toM: ToM, rows: [number, number, number][], p = 0.42, seg = 64) => {
  const n = rows.length, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), len = [0];
  for (let k = 1; k < n; k++) len.push(len[k - 1] + Math.hypot(rows[k][0] - rows[k - 1][0], rows[k][2] - rows[k - 1][2]));
  const sq = (c: number) => Math.sign(c) * Math.abs(c) ** p;
  for (let i = 0; i <= seg; i++) {
    const a = -Math.PI + (2 * Math.PI * (i % seg)) / seg, cx = sq(Math.sin(a)), cz = sq(Math.cos(a));
    for (let k = 0; k < n; k++) { const [hx, hz, y] = rows[k]; toM(v.set(hx * cx, y, hz * cz)); pos.push(v.x, v.y, v.z); uv.push(i / seg, len[k] / len[n - 1]); }
  }
  for (let i = 0; i < seg; i++) for (let k = 0; k < n - 1; k++) { const A = i * n + k, B = A + 1, C = A + n, D = C + 1; idx.push(A, C, B, B, C, D); }
  const g = meshOf(pos, uv, idx);
  g.userData.vAt = len.map((l) => l / len[n - 1]);
  return g;
};
/** the tall square black cap 东坡巾 (see the head of this file): an inner square crown and, round its foot, a lower
 *  outer wall (the cap's two layers: the stepped look that names it). tall = its height factor (1 = 0.8 head units above
 *  the crown, the default 0.75), col = the cloth, band = the foot band */
export const dongpoCap = (o: { col?: string; band?: string; tall?: number; solo?: boolean } = {}): Acc => {
  const col = o.col ?? "#33303a", band = o.band ?? "#24212b", tall = o.tall ?? 0.75, solo = !!o.solo;
  return {
    name: "dongpoCap", slots: solo ? ["hat", "crown"] : ["crown"], key: ["dongpoCap", col, band, tall, solo].join("|"),
    ...(solo ? { hat: { rim: 52, hair: "cut" as const, shade: false } } : {}),
    build(b) {
      b.tilt(0, -3);
      const top = 1.0 + 0.8 * tall, mid = 1.0 + 0.36 * tall;
      // the inner crown: the foot deep in the head, up the straight walls (a little narrower than the head), a
      // rounded top edge, the flat top
      const rows: [number, number, number][] = [[0.45, 0.45, 0.5], [0.62, 0.66, 0.85], [0.64, 0.68, top - 0.08], [0.62, 0.66, top - 0.015], [0.54, 0.58, top], [0.0, 0.0, top + 0.01]];
      const g = squareTube(b.toM, rows);
      b.solid("head", g, { col, ink: 0.008, paint: "cloth" });
      // the outer wall: from the skin above the brows up to `mid`, wider, its top edge turned in to the crown
      const outer: [number, number, number][] = [[0.5, 0.5, 0.36], [0.74, 0.78, 0.6], [0.78, 0.82, 0.7], [0.8, 0.84, mid - 0.06], [0.78, 0.82, mid], [0.62, 0.66, mid + 0.02]];
      const g2 = squareTube(b.toM, outer), vAt = g2.userData.vAt as number[];
      const map = b.tex(8, 512, (cg) => {
        const Y = (v: number) => 512 * (1 - v);
        cg.fillStyle = col; cg.fillRect(0, 0, 8, 512);
        cg.fillStyle = band; cg.fillRect(0, Y(vAt[2] + 0.04), 8, Y(vAt[1]) - Y(vAt[2] + 0.04));      // the foot band
        cg.fillStyle = shade(col, 1.6); cg.fillRect(0, Y(vAt[4]) - 3, 8, 5);                          // the top edge
      }, `dongpo2|${col}|${band}|${tall}`);
      b.solid("head", g2, { map, ink: 0.008, paint: "cloth" });
    },
  };
};

// ---------------------------------------------------------------------------------------------------- 幞头
/** a Song official's black cap (see the head of this file); wings = the two stiff side wings, wingLen = their reach
 *  (head units out from the head's middle) */
export const futou = (o: { col?: string; wings?: boolean; wingLen?: number } = {}): Acc => {
  const col = o.col ?? "#2f2c36", wings = o.wings ?? true, wl = o.wingLen ?? 1.75;
  return {
    name: "futou", slots: ["hat", "crown"], key: ["futou", col, wings, wl].join("|"), hat: { rim: 58, hair: "cut", shade: false },
    build(b) {
      b.tilt(0, -6);
      // the cap: a rounded dome pulled down to above the brows
      const g = lathe(b.toM, rounded([[0.6, 0.3], [0.86, 0.52], [0.98, 0.82], [0.9, 1.1], [0.55, 1.26], [0, 1.3]], 0.12), 48);
      b.solid("head", g, { col, ink: 0.008, paint: "cloth" });
      // the raised back (a rounded block behind the crown)
      const back = weld(new THREE.SphereGeometry(b.R * 0.5, 20, 14).scale(1.1, 1.0, 0.8));
      b.put(b.solid("head", back, { col, ink: 0.008, paint: "cloth" }), 0, 1.0, -0.42);
      if (wings) for (const s of [-1, 1]) {
        // a stiff flat wing from inside the back block out to the side, a little upturned, 2 cm thick (two inks)
        const len = (wl - 0.4) * b.R, wing = weld(new THREE.BoxGeometry(len, 0.13 * b.R, 0.14 * b.R, 8, 1, 1));
        wing.translate(s * (len / 2 + 0.4 * b.R), 0, 0);
        const P = wing.attributes.position;
        for (let i = 0; i < P.count; i++) { const x = Math.abs(P.getX(i)) / (wl * b.R); P.setY(i, P.getY(i) + 0.08 * b.R * x * x); }
        b.put(b.solid("head", weld(wing), { col, ink: 0.007 }), 0, 1.02, -0.5);
      }
    },
  };
};

// ---------------------------------------------------------------------------------------------------- 双丫髻
/** a child's two buns high on each side of the crown, each tied with a ribbon (col = ribbon) */
export const twinBuns = (o: { ribbon?: string; size?: number } = {}): Acc => {
  const ribbon = o.ribbon ?? "#d8463a", s = o.size ?? 1;
  return {
    name: "twinBuns", slots: ["crown"], noHairProps: true, key: ["twinBuns", ribbon, s].join("|"),
    build(b) {
      const hair = b.look.hairCol;
      for (const sd of [-1, 1]) {
        // up and out from the crown at 40 deg, a little back: the bun stands clear, its neck deep in the head
        const az = (sd * 58 * Math.PI) / 180, el = (38 * Math.PI) / 180, dir = V(Math.sin(az) * Math.sin(el), Math.cos(el), Math.cos(az) * Math.sin(el) - 0.12).normalize();
        const at = dir.clone().multiplyScalar(1.08 + 0.12 * s);
        const bun = weld(new THREE.SphereGeometry(0.3 * s * b.R, 18, 12));
        b.put(b.solid("head", bun, { col: hair, paint: "hair", ink: 0.007 }), at.x, at.y, at.z);
        // the ribbon: a flattened knot between the head and the bun (its lower half in the head)
        const knot = weld(new THREE.SphereGeometry(0.19 * s * b.R, 14, 10).scale(1.25, 0.8, 1.25)), nk = dir.clone().multiplyScalar(0.9 + 0.05 * s);
        b.put(b.solid("head", knot, { col: ribbon, paint: "cloth", ink: 0.006 }), nk.x, nk.y, nk.z);
      }
    },
  };
};

// ---------------------------------------------------------------------------------------------------- the wink
/** one eye closed in an arch (see the head of this file). side: 1 / -1 = which eye (screen right / left); default
 *  the strong side (the side of the smirk and of the higher brow) */
export const wink = (o: { side?: 1 | -1 } = {}): Acc => ({
  name: "wink", slots: [], key: `wink|${o.side ?? 0}`,
  face(f) {
    const s = o.side ?? f.strong, x = s * f.sp, g = f.g;
    // erase the open eye (and nothing above it: the brow stays), then the closed eye: an arch, pen width
    g.save(); g.globalCompositeOperation = "destination-out";
    g.beginPath(); const [cx, cy] = f.px(x, 0.5); g.ellipse(cx, cy, 9.4 * f.u, 8.4 * f.u, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    f.line(f.arc(x, 3.2, 8.6, 5.6, 195, 345, 18));
    f.line([[x + s * 8.2, 1.4], [x + s * 10.6, -0.6]], f.PEN * 0.8);
  },
});
