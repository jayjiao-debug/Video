// THE KINGS' HEADS of the Wanbi film (完璧归赵, BIBLE 5; BUILD_PLAN WP4).
//   mianCrown()    秦王's FLAT CROWN BOARD (冕): a low black crown cap with a gold band on his crown, and on it a flat
//                  black board with a gold band round its edge (black underneath too: a gold underside read as a gold
//                  crown from below), a little longer front to back than the head and as wide as it, its
//                  front a touch lower than its back; short strings of gold beads (旒) hang from its front edge and
//                  end ABOVE the brows (never in the face zone), a shorter row at the back. Slots hat + crown, hair
//                  "keep". The silhouette nobody else has: a flat bar over the head with a fringe under its front.
//   chinBeard()    赵王's short beard WITHOUT sideburns: a rounded beard on the chin and the jaw under the mouth that
//                  stops short of the hair. (The kit's "short" beard runs up the jaw into the hair, and at 33 % its
//                  ring of black round his face read as a hood: WP1b's note.) Slot chin, name "beard": it is drawn
//                  as hair by kit facehair.ts hairOverBeard (people.ts addPerson), without the sideburn extension.
import * as THREE from "three";
import type { Acc, P2 } from "../../group/kit/rig3d";
import { roundBox, shade } from "../../group/kit/rigacc/shapes";
import { lathe, rounded, weld } from "./envoy";

const GOLD = "#e2b03a";

/** one string of beads hanging from (x, y, z) (head units through put: the head's frame): n beads of radius r (head
 *  units) on a cord, each a little apart, merged into one solid */
const beadString = (R: number, n: number, r: number, gap: number) => {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < n; i++) { const s = new THREE.SphereGeometry(r * R, 12, 9); s.translate(0, -(i + 0.5) * (2 * r + gap) * R, 0); parts.push(s); }
  // the cord through them (a thin rod from the board down to the last bead, inside each bead)
  const len = n * (2 * r + gap) * R, cord = new THREE.CylinderGeometry(r * R * 0.42, r * R * 0.42, len, 8, Math.max(2, n * 2));
  cord.translate(0, -len / 2, 0); parts.push(cord);
  const pos: number[] = [], idx: number[] = [];
  let base = 0;
  for (const g of parts) {
    const gi = g.index ? g : g.toNonIndexed(), P = gi.attributes.position;
    for (let i = 0; i < P.count; i++) pos.push(P.getX(i), P.getY(i), P.getZ(i));
    const I = gi.index!; for (let i = 0; i < I.count; i++) idx.push(base + I.getX(i));
    base += P.count;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  return weld(g);
};

/** 秦王's flat crown board (冕) with its bead fringes; see the head of this file. board = its colour, gold = the edge,
 *  the band and the beads. hide: ["mianCrown"] */
export const mianCrown = (o: { board?: string; gold?: string; beads?: string } = {}): Acc => {
  const board = o.board ?? "#2a2630", gold = o.gold ?? GOLD, beads = o.beads ?? GOLD;
  return {
    name: "mianCrown", slots: ["hat", "crown"], key: ["mianCrown", board, gold, beads].join("|"), hat: { rim: 40, hair: "keep", shade: false },
    build(b) {
      const R = b.R;
      // the crown cap: a low drum on the crown, a gold band round its foot (the board rests on it)
      b.tilt(0, -4);
      const prof = rounded([[0.46, 0.5], [0.66, 0.8], [0.62, 1.2], [0, 1.22]], 0.06), cap = lathe(b.toM, prof, 40), vAt = cap.userData.vAt as number[];
      const map = b.tex(8, 256, (g) => { g.fillStyle = board; g.fillRect(0, 0, 8, 256); g.fillStyle = gold; const y0 = 256 * (1 - (vAt[4] + 0.4 * (vAt[10] - vAt[4]))); g.fillRect(0, y0, 8, 256 - y0); g.fillStyle = shade(gold, 0.5); g.fillRect(0, y0 - 3, 8, 5); }, `mianCap|${board}|${gold}`);
      b.solid("head", cap, { col: "#ffffff", map, ink: 0.008 });
      // the board: front a touch lower than the back (tilted forward 6 deg), its gold edge a thin slab under it
      b.tilt(0, 4);
      const W = 2.05, D = 2.3, T = 0.1, y = 1.3;
      // (its map: black top and underside, a gold band round its edge: roundBox's v runs from the bottom pole to the top)
      const edge = b.tex(16, 256, (g) => { g.fillStyle = board; g.fillRect(0, 0, 16, 256); g.fillStyle = gold; g.fillRect(0, 98, 16, 60); g.fillStyle = shade(gold, 0.55); g.fillRect(0, 96, 16, 3); g.fillRect(0, 157, 16, 3); }, `mianBoard|${board}|${gold}`);
      b.put(b.solid("head", roundBox(W * R, T * R, D * R, 0.18), { col: "#ffffff", map: edge, ink: 0.008 }), 0, y, 0.12);
      // the fringes: 9 strings along the front edge, ending above the brows; 5 shorter ones at the back
      const zF = 0.12 + D / 2 - 0.08, zB = 0.12 - D / 2 + 0.08, top = y - 0.09;
      for (let i = 0; i < 9; i++) {
        const x = -0.88 + (i * 1.76) / 8, n = i % 2 ? 2 : 3;
        b.put(b.solid("head", beadString(R, n, 0.058, 0.03), { col: beads, ink: 0.0042 }), x, top, zF);
      }
      for (let i = 0; i < 5; i++) b.put(b.solid("head", beadString(R, 2, 0.058, 0.03), { col: beads, ink: 0.0042 }), -0.7 + (i * 1.4) / 4, top, zB);
    },
  };
};

/** 赵王's short beard without sideburns (see the head of this file): from under the mouth over the chin and along
 *  the lower jaw, its upper edge well inside the head's outline, so it never meets the hair. col: default the look's
 *  hair colour. */
export const chinBeard = (o: { col?: string; wide?: number } = {}): Acc => {
  const wide = o.wide ?? 1;
  const acc = {
    name: "beard", slots: ["chin"], key: `wanbiChin|${o.col ?? ""}|${wide}`, hmBeard: true, sideburn: false, beardCol: o.col,
    faceUnder(f: Parameters<NonNullable<Acc["faceUnder"]>>[0]) {
      const col = o.col ?? f.look.hairCol, my = f.mouth[1], q = f.quad, w = 30 * wide;
      // under the lower lip, out to the jaw's corners (x +-w), round under the chin past the outline
      const pts: P2[] = [...q([-10, my + 7.5], [0, my + 5], [10, my + 7.5], 6), ...q([10, my + 7.5], [w * 0.8, my + 2], [w, my + 9], 8).slice(1),
        ...q([w, my + 9], [w + 6, my + 22], [16, 72], 8).slice(1), [-16, 72], ...q([-16, 72], [-w - 6, my + 22], [-w, my + 9], 8).slice(1), ...q([-w, my + 9], [-w * 0.8, my + 2], [-10, my + 7.5], 8).slice(1)];
      f.fill(pts, col, 0);
    },
  };
  return acc as Acc;
};
