// MORE THINGS IN THE HAND of 采访罗密欧与朱丽叶 (props builder C), in the style of acc/held.ts: each one is part of its
// figure (PartKit.held) and follows a hand. Slots: one hand each; the defaults keep clear of what the persons already
// hold (Romeo's letter is hand 0, Juliet's vial and the Friar's herb basket are hand 1):
//   maskStick(o)       ROMEO at the feast: his masquerade half mask on a stick, deep blue and gold, its face forward,
//                      held up by a short stick (hand 1 by default; `stick` = its length, 0.1 m: a hand at the belly
//                      shows the mask at chest height, under the chin). name "maskStick"
//   darkBottleHeld(o)  ROMEO in Mantua and the vault: the apothecary's dark bottle (hand 1 by default). name "darkBottle"
//   quillHeld(o)       THE FRIAR writing his letter: a goose quill (hand 0 by default; `posed`: the "write" pose leans
//                      it over the paper with its nib on the desk). name "quill"
// Nothing here sits in front of a face (RIG3D.md rule "face"): all three are hand things; the mask is held at the
// hand, never worn (a pose that lifts that hand to the face is the shot's choice, and the mask then hides the face).
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { roundBox, turned, shade } from "../../group/kit/rigacc/shapes";
import { weld } from "../../wanbi/acc/envoy";

/** the half mask's outline (metres, centred, facing +z): a wide almond with a dip over the nose and two eye holes */
const maskShape = (k: number) => {
  const W = 0.088 * k, H = 0.04 * k, s = new THREE.Shape();
  const pts: [number, number][] = [];
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    // upper edge flared up at the outer corners (cat-eye), a notch at the nose (bottom middle)
    let y = sn * H * (sn > 0 ? 1 + 0.55 * c * c : 1), x = c * W;
    if (sn < 0) y += H * 0.55 * Math.exp(-(c * c) / 0.03);
    if (sn > 0) y -= H * 0.22 * Math.exp(-(c * c) / 0.05);
    pts.push([x, y]);
  }
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  for (const sx of [-1, 1]) {
    const e = new THREE.Path(), cx = sx * 0.036 * k, cy = 0.004 * k;
    for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2 * -1; const x = cx + Math.cos(a) * 0.017 * k, y = cy + Math.sin(a) * 0.0105 * k * (1 + 0.25 * Math.cos(a) * sx); i ? e.lineTo(x, y) : e.moveTo(x, y); }
    s.holes.push(e);
  }
  return s;
};

/** ROMEO'S MASK ON A STICK: col = the mask, trim = its gold edge, beads and stick. The stick rises from the hand; the
 *  mask sits on top of it to the outer side, its face toward the front (body +z), readable from the front. */
export const maskStick = (o: { hand?: 0 | 1; col?: string; trim?: string; size?: number; stick?: number } = {}): Acc => {
  const hand = o.hand ?? 1, col = o.col ?? "#1f3f86", trim = o.trim ?? "#e2b03a", k = o.size ?? 1, out = hand ? 1 : -1;   // +x = the person's left
  return {
    name: "maskStick", slots: [hand ? "hand1" : "hand0"], key: ["rjMaskStick", hand, col, trim, k, o.stick ?? 0.1].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [out * 0.012, 0.0, 0.035], rot: [0.12, 0, -out * 0.12] });
      // the stick: from below the fist up to the mask's lower outer corner. Short by default, so a hand at the belly
      // (~0.7 m) shows the mask at chest height, under the chin: the big toon head hides anything held higher.
      const top = (o.stick ?? 0.1) * k, mx = out * 0.07 * k, my = top + 0.032 * k;
      b.solid(g, weld(new THREE.CylinderGeometry(0.0055, 0.0062, top + 0.07, 10).translate(0, (top + 0.07) / 2 - 0.06, 0)), { col: shade(trim, 0.78), ink: 0.004 });
      b.solid(g, weld(new THREE.SphereGeometry(0.011, 12, 9)), { col: trim, ink: 0.004 }).position.set(0, -0.062, 0);   // a gold knob at its foot
      // the mask: the gold plate behind (a little larger: its rim shows as the gold edge), the blue face in front
      const front = new THREE.ExtrudeGeometry(maskShape(k), { depth: 0.012, bevelEnabled: false, curveSegments: 4 });
      const back = new THREE.ExtrudeGeometry(maskShape(k * 1.12), { depth: 0.008, bevelEnabled: false, curveSegments: 4 });
      const mask = new THREE.Group(); mask.position.set(mx, my, 0.004); mask.rotation.set(0, 0, -out * 0.1); g.add(mask);
      b.solid(mask, weld(back.translate(0, 0, -0.006)), { col: trim, ink: 0.0045 });
      b.solid(mask, weld(front.translate(0, 0, -0.002)), { col, ink: 0 });
      // gold beads along the brow line, a gold-and-cream plume from the outer corner
      for (let i = -2; i <= 2; i++) b.solid(mask, weld(new THREE.SphereGeometry(0.0058 * k, 10, 8)), { col: trim, ink: 0.003 }).position.set(i * 0.017 * k, 0.03 * k + 0.004 * k * Math.abs(i), 0.011);
      const plume = roundBox(0.022 * k, 0.07 * k, 0.012, 0.6, 16);
      const p1 = b.solid(mask, plume, { col: "#f1e6c8", ink: 0.0035 }); p1.position.set(out * 0.082 * k, 0.05 * k, -0.002); p1.rotation.z = -out * 0.55;
      const p2 = b.solid(mask, roundBox(0.016 * k, 0.055 * k, 0.012, 0.6, 16), { col: trim, ink: 0.0035 }); p2.position.set(out * 0.07 * k, 0.058 * k, -0.008); p2.rotation.z = -out * 0.2;
    },
  };
};

/** THE DARK BOTTLE IN A HAND (the prop darkBottle's twin): plum-black square-shouldered glass, a paper label, a cork */
export const darkBottleHeld = (o: { hand?: 0 | 1; size?: number } = {}): Acc => {
  const hand = o.hand ?? 1, k = o.size ?? 1;
  return {
    name: "darkBottle", slots: [hand ? "hand1" : "hand0"], key: ["rjDarkBottle", hand, k].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [hand ? 0.02 : -0.02, -0.018, 0.026] });
      const body = turned([[0, 0], [0.026 * k, 0], [0.028 * k, 0.062 * k], [0.011 * k, 0.077 * k], [0.0095 * k, 0.088 * k], [0, 0.088 * k]], 0.005, 28), v = body.userData.v as number[];
      const map = b.tex(16, 128, (cg) => {
        cg.fillStyle = "#4a3246"; cg.fillRect(0, 0, 16, 128);
        const y = (t: number) => 128 * (1 - t);
        cg.fillStyle = "#e4d8bc"; cg.fillRect(0, y(v[1] * 0.75), 16, y(v[1] * 0.35) - y(v[1] * 0.75));   // the label
        cg.fillStyle = "#6e5068"; cg.fillRect(2, y(v[2]), 2, y(v[1] * 0.8) - y(v[2]));                     // a highlight
      }, "rjDarkBottleGlass");
      b.solid(g, body, { col: "#ffffff", map, ink: 0.0055 });
      b.solid(g, turned([[0, 0.084 * k], [0.0115 * k, 0.084 * k], [0.0125 * k, 0.1 * k], [0, 0.1 * k]], 0.003, 20), { col: "#5a4636", ink: 0.005 });
    },
  };
};

/** THE FRIAR'S QUILL: its length along +y, the inked nib at the -y end, the origin where the fingers hold it */
export const quillHeld = (o: { hand?: 0 | 1 } = {}): Acc => {
  const hand = o.hand ?? 0;
  return {
    name: "quill", slots: [hand ? "hand1" : "hand0"], key: ["rjQuill", hand].join("|"),
    build(b) {
      const g = b.held(hand, { posed: true, rot: [1.0, 0, 0] });
      b.solid(g, turned([[0, -0.036], [0.0018, -0.034], [0.0042, -0.018], [0.0042, 0.1], [0.002, 0.2], [0, 0.205]], 0.002, 12), { col: "#e2d6ba", ink: 0.0026 });   // the shaft
      b.solid(g, turned([[0, -0.036], [0.002, -0.033], [0.0046, -0.024], [0, -0.022]], 0.001, 10), { col: "#3e3438", ink: 0.0024 });                         // the inked nib
      const vane = roundBox(0.042, 0.155, 0.007, 0.55, 20); vane.translate(0.008, 0.12, 0); vane.rotateZ(-0.06);
      const map = b.tex(32, 128, (cg) => { cg.fillStyle = "#f2ecdc"; cg.fillRect(0, 0, 32, 128); cg.strokeStyle = "rgba(150,136,116,0.65)"; cg.lineWidth = 1.5; for (let y = 6; y < 128; y += 7) { cg.beginPath(); cg.moveTo(16, y); cg.lineTo(0, y - 9); cg.moveTo(16, y); cg.lineTo(32, y - 9); cg.stroke(); } }, "rjQuillVane");
      b.solid(g, vane, { col: "#ffffff", map, ink: 0.003 });
    },
  };
};
