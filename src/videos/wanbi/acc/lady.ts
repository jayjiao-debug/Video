// THE LADIES' HEADS of the Wanbi film (完璧归赵, BIBLE 5; BUILD_PLAN WP4): the only women of the cast.
//   ladyBun({ pin })   ONE low bun at the back of the head (Warring States: the hair drawn back and knotted low at the
//                      nape), a single plain pin through it from side to side, and the look's long fall (Look hair
//                      "long") hanging from it down the back as its tail. Worn on a Look with hair "long" (people.ts
//                      ladyLook): the long hair frames the face at the sides from the front, the bun and the pin show
//                      from the side and the back. No hat. The tall double loops are only the fallback (BIBLE 5).
//                      Slot crown (nothing else goes on her head); hide: ["ladyBun"].
//   ladyFace()         the rig has no female face: two lash strokes at the outer end of each eye (drawn after the eyes,
//                      so they follow every expression and the blink) and a soft rose tint under the mouth (drawn before
//                      it, so the mouth's own line stays on top). BIBLE 5's fallback, worn by both ladies (the 100 px
//                      line-up decides: people_lineup.ts shows them with and without). No slot.
import * as THREE from "three";
import type { Acc, P2 } from "../../group/kit/rig3d";
import { shade } from "../../group/kit/rigacc/shapes";
import { weld } from "./envoy";

/** the low bun with its single plain pin; see the head of this file. pin = its colour (false = none); side = degrees
 *  it sits round from the middle of the back toward the person's LEFT (- = her right: a low bun swept to one side,
 *  LADY_B's, which also keeps it off the gold screen she stands against) */
export const ladyBun = (o: { pin?: string | false; size?: number; side?: number } = {}): Acc => {
  const pin = o.pin === undefined ? "#e2b03a" : o.pin, s = o.size ?? 1, side = o.side ?? 0;
  return {
    name: "ladyBun", slots: ["crown"], key: ["ladyBun", pin, s, side].join("|"),
    build(b) {
      const R = b.R, hair = b.look.hairCol, az = ((180 - side) * Math.PI) / 180, sn = Math.sin(az), cs = Math.cos(az);
      // (az from the face side toward the person's left: the middle of the back is 180; its own axes turn with it, so
      //  it lies along the head's surface: x across, z out)
      const at = (along: number, y: number, out: number): [number, number, number] => [sn * out + cs * along, y, cs * out - sn * along];
      // the bun: a flattened ball at the nape, low on the back of the head, standing well clear of the skin
      const bun = new THREE.SphereGeometry(0.4 * s * R, 24, 16); bun.scale(1.18, 0.86, 0.8);
      const strands = b.tex(128, 64, (g) => {
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 128, 64);
        g.strokeStyle = "#7a7480"; g.lineWidth = 3; g.lineCap = "round";
        for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(64, 70, 18 + k * 9, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
      }, "wanbiBun");
      b.put(b.solid("head", weld(bun), { col: hair, map: strands, paint: "hair", ink: 0.008 }), ...at(0, -0.02, 1.02)).rotation.y = az;
      if (pin) {
        // the pin: a plain rod through the bun from side to side, a small knob on one end only
        const len = 1.3 * s, rr = 0.032, rod = new THREE.CylinderGeometry(rr * R, rr * R, len * R, 10, 1);
        rod.rotateZ(Math.PI / 2);
        b.put(b.solid("head", rod, { col: pin, ink: 0.004 }), ...at(-0.06, 0.08, 1.08)).rotation.y = az;
        b.put(b.solid("head", new THREE.SphereGeometry(0.06 * R, 12, 9), { col: shade(pin, 0.9), ink: 0.004 }), ...at(-0.06 - len / 2, 0.08, 1.08));
      }
    },
  };
};

/** two lash strokes at the outer end of each eye and a rose tint under the mouth; see the head of this file */
export const ladyFace = (o: { lip?: string } = {}): Acc => {
  const lip = o.lip ?? "#e07a86";
  return {
    name: "ladyFace", slots: [], key: `wanbiLady|${lip}`,
    faceUnder(f) {
      const [mx, my] = f.mouth;
      f.fill(f.arc(mx, my + 0.6, 4.6, 3.1, 0, 360, 18), shade(lip, 1.0), 0);
    },
    face(f) {
      // the eyelid line runs about 10 u each side of the eye's middle (x = +-sp); the lashes leave its outer end
      for (const s of [-1, 1]) {
        const x0 = s * (f.sp + 8.6), y0 = -1.2;
        const lash = (dx: number, dy: number, ex: number, ey: number): P2[] => f.quad([x0 + s * dx, y0 + dy], [x0 + s * (dx + ex * 0.4), y0 + dy + ey * 0.7], [x0 + s * (dx + ex), y0 + dy + ey], 5);
        f.line(lash(0, 0, 4.6, -3.4), 2.3);
        f.line(lash(-2.8, -1.4, 3.0, -4.4), 2.1);
      }
    },
  };
};
