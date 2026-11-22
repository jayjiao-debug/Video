// THINGS IN THE HAND of 采访罗密欧与朱丽叶 (design stage): each one is part of its figure and follows a hand.
//   letter(o)       ROMEO: a folded love letter sealed with red wax (the film's skin is "the letter"). name "letter"
//   vial(o)         JULIET: the Friar's small glass bottle with a cork. name "vial"
//   herbBasket(o)   THE FRIAR: a small wicker basket of herbs hanging from his hand (that arm stays down). name "herbBasket"
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { roundBox, turned, shade } from "../../group/kit/rigacc/shapes";
import { leafGeo, weld } from "../../wanbi/acc/envoy";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** ROMEO'S LETTER: paper = the parchment, wax = the seal. Held upright a little above the hand, its face forward. */
export const letter = (o: { hand?: 0 | 1; paper?: string; wax?: string; size?: number } = {}): Acc => {
  const hand = o.hand ?? 0, paper = o.paper ?? "#f5ead0", wax = o.wax ?? "#c4202e", k = o.size ?? 1;
  return {
    name: "letter", slots: [hand ? "hand1" : "hand0"], key: ["rjLetter", hand, paper, wax, k].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [hand ? 0.012 : -0.012, 0.045 * k, 0.02], rot: [0, 0, hand ? -0.22 : 0.22] });
      b.solid(g, roundBox(0.118 * k, 0.082 * k, 0.014, 0.28), { col: paper, ink: 0.0065 });
      // the fold: the flap's two edges meet at the seal (two thin dark bars lying on the paper)
      for (const s of [-1, 1]) {
        const bar = roundBox(0.064 * k, 0.0045, 0.006, 0.5), m = b.solid(g, bar, { col: shade(paper, 0.62), ink: 0 });
        m.position.set(s * 0.028 * k, 0.014 * k, 0.0062); m.rotation.z = s * -0.5;
      }
      const seal = new THREE.SphereGeometry(0.0155 * k, 16, 12); seal.scale(1, 1, 0.5);
      b.solid(g, weld(seal), { col: wax, ink: 0.005 }).position.set(0, -0.002, 0.0085);
      const dot = new THREE.SphereGeometry(0.0062 * k, 10, 8); dot.scale(1, 1, 0.5);
      b.solid(g, weld(dot), { col: shade(wax, 0.72), ink: 0 }).position.set(0, -0.002, 0.0152);
    },
  };
};
/** THE VIAL: glass = the bottle, cork = its stopper, drink = what is in it (seen through the glass as a darker band) */
export const vial = (o: { hand?: 0 | 1; glass?: string; cork?: string; size?: number } = {}): Acc => {
  const hand = o.hand ?? 1, glass = o.glass ?? "#8fd0c4", cork = o.cork ?? "#a9763f", k = o.size ?? 1;
  return {
    name: "vial", slots: [hand ? "hand1" : "hand0"], key: ["rjVial", hand, glass, cork, k].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [hand ? 0.02 : -0.02, -0.012, 0.022] });
      const body = turned([[0, 0], [0.019 * k, 0], [0.021 * k, 0.03 * k], [0.0085 * k, 0.047 * k], [0.0085 * k, 0.064 * k], [0, 0.064 * k]], 0.006, 28), v = body.userData.v as number[];
      const map = b.tex(8, 128, (cg) => {
        cg.fillStyle = "#ffffff"; cg.fillRect(0, 0, 8, 128);
        cg.fillStyle = "#9fb7c9"; cg.fillRect(0, 128 * (1 - v[2]), 8, 128 * (v[2] - v[1]) * 0.86);          // the drink, up to the shoulder
      }, "rjVialDrink");
      b.solid(g, body, { col: glass, map, ink: 0.0055 });
      b.solid(g, turned([[0, 0.06 * k], [0.0105 * k, 0.06 * k], [0.012 * k, 0.078 * k], [0, 0.078 * k]], 0.003, 20), { col: cork, ink: 0.005 });
    },
  };
};
/** THE FRIAR'S BASKET OF HERBS: it hangs from the hand by its hoop handle */
export const herbBasket = (o: { hand?: 0 | 1; col?: string; leaf?: string; flower?: string } = {}): Acc => {
  const hand = o.hand ?? 1, col = o.col ?? "#b98a4e", leaf = o.leaf ?? "#5f9a4a", flower = o.flower ?? "#b38ad6";
  return {
    name: "herbBasket", slots: [hand ? "hand1" : "hand0"], key: ["rjHerbBasket", hand, col, leaf, flower].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [hand ? 0.03 : -0.03, -0.118, 0.012], hang: true });
      const bowl = turned([[0, 0], [0.04, 0], [0.056, 0.05], [0.05, 0.056], [0, 0.05]], 0.008, 32), v = bowl.userData.v as number[];
      const map = b.tex(256, 128, (cg) => {
        const Y = (t: number) => 128 * (1 - t);
        cg.fillStyle = col; cg.fillRect(0, 0, 256, 128);
        cg.strokeStyle = shade(col, 0.62); cg.lineWidth = 3;
        for (let x = 0; x < 256; x += 16) { cg.beginPath(); cg.moveTo(x, Y(v[1])); cg.lineTo(x + 8, Y(v[2])); cg.stroke(); }
        for (const t of [0.35, 0.65]) { const y = Y(v[1] + (v[2] - v[1]) * t); cg.beginPath(); cg.moveTo(0, y); cg.lineTo(256, y); cg.stroke(); }
        cg.fillStyle = shade(col, 0.72); cg.fillRect(0, Y(v[2]) - 6, 256, 8);                                  // the rim
        cg.fillStyle = shade(leaf, 0.7); cg.fillRect(0, 0, 256, Y(v[3]));                                     // inside: leaves
      }, `rjBasket|${col}|${leaf}`);
      b.solid(g, bowl, { map, ink: 0.006 });
      // the hoop handle: from rim to rim over the top, up to the hand
      const hoop = new THREE.TorusGeometry(0.05, 0.0062, 8, 28, Math.PI);
      b.solid(g, weld(hoop), { col: shade(col, 0.82), ink: 0.005 }).position.set(0, 0.052, 0);
      // the herbs: sprigs that stand out of the basket to each side of the handle
      const sprig = (x: number, z: number, lean: number, h: number, c: string, w = 0.03) => b.solid(g, leafGeo((p) => p, V(x * 0.4, 0.04, z * 0.4), V(x, 0.04 + h * 0.6, z), V(x + lean, 0.04 + h, z * 1.2), w, 0.012, 0.5), { col: c, ink: 0.005 });
      sprig(-0.03, 0.022, -0.02, 0.07, leaf); sprig(0.03, 0.02, 0.022, 0.065, shade(leaf, 0.86)); sprig(0.004, 0.032, 0.004, 0.08, shade(leaf, 1.12), 0.026);
      sprig(-0.012, -0.026, -0.012, 0.06, shade(leaf, 0.8)); sprig(0.02, -0.024, 0.016, 0.07, leaf);
      for (const [x, y, z] of [[-0.046, 0.108, 0.026], [0.05, 0.1, 0.022], [0.008, 0.122, 0.04]] as number[][]) b.solid(g, weld(new THREE.SphereGeometry(0.0105, 12, 9)), { col: flower, ink: 0.004 }).position.set(x, y, z);
    },
  };
};
