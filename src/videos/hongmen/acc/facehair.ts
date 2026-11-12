// FACE HAIR of the Hongmen film: the beards (as acc/garb.ts `beard`, which this replaces in people.ts) with the
// sideburn fixed, and the heavy "sword brows" of a warlord.
//   beard({ kind, col })    full / short / fork / stubble / goatee / long, the same options and the same accessory name
//                           ("beard", slot chin) as garb.ts had. What changed: THE HAIR LIES OVER THE BEARD.
//   hairOverBeard(rig)      call once per figure after rc.add (people.ts addPerson does): a figure's beard becomes
//                           part of its hair (under the hair's edge, shaded like it, carried round the head's side)
//   swordBrows({ ... })     剑眉: thick, blade-shaped brows drawn over the rig's own thin ones, wherever the expression
//                           and the blink put them (they are found on the drawing itself). No slot.
//
// THE SIDEBURN (the owner's note: "the beard goes over the hair at the temples; it should be the other way round").
// How the rig decides where hair ends and face begins (group/kit/rig3d.ts, read only): the hair is not a drawing. The
// head's shader paints it on the ball wherever the angle from the crown is less than the look's hairline at that
// azimuth (hairLine(look, az); under a pulled-down hat hairLineHat(look, az, rim): both go into the lookup texture
// uHair), in the HEAD's own frame. The face drawing (eyes, brows, mouth, and a beard's faceUnder) is a flat picture
// projected along the face direction, which slides up to 0.7 * 45 degrees round the head toward the camera, and it is
// mixed in AFTER the hair: `base = mix( base, hairC, hm ); ... base = mix( base, fc, f.a * fm );`. So anything a beard
// draws above the hairline is drawn over the hair, and because the drawing slides against the hair no fixed number in
// the drawing can follow the hairline: the old sideburn (a block from x = 43 u to the edge, up to y = -26 u) cut into
// the hair on the side the head turned to and left a notch of skin on the other.
// The fix (round 2: the beard is part of the HAIR, not of the face drawing; see sideEdit below):
//   1. the head shader (hairOverBeard, through fx/rim.ts editHeadShader, guarded) takes every pixel of the face
//      drawing that has the beard's colour out of the drawing and paints it on the head BEFORE the hair: the hair (and
//      a head band) lies over the beard at the look's real hairline, per pixel, whatever the hat and however far the
//      face has slid; and the beard is shaded exactly as the hair is, so black hair and a black beard are one mass
//      (the drawing's darks are lifted toward the ink colour, the hair is not: the old beard was navy beside black
//      hair). Between a dark beard and dark hair there is no ink line either.
//   2. the sideburn is a strip that runs up along the head's outline to above every hairline (to y = -34 u): its top
//      end is always under the hair.
//   3. a beard with sideburns goes on round the SIDE of the head beyond the drawing (which fades toward the ball's
//      edge): at a three-quarter view the beard carries to the head's outline, with no bare skin behind it.
// If the rig's shader text changes, all of this switches itself off with one console line and the beard is the plain
// drawing again (over the hair at the temples, as before round 1).
import * as THREE from "three";
import type { Acc, P2, Rig } from "../../group/kit/rig3d";
import { shade } from "../../group/kit/rigacc/shapes";
import { editHeadShader, headMaterials } from "../fx/rim";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const rad = (d: number) => (d * Math.PI) / 180;
const wrapA = (a: number) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
/** how light a colour looks, 0..1 */
const luma = (col: string) => { const c = new THREE.Color(col).convertLinearToSRGB(); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };
/** one normal per position (the mean of the faces that meet there), so that the ink hull stays closed over seams */
const weld = <T extends THREE.BufferGeometry>(g: T) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};
/** runs fn whenever the object's world matrix is brought up to date (once per traversal of the scene) */
const everyFrame = (o: THREE.Object3D, fn: () => void) => {
  const base = o.updateMatrixWorld;
  o.updateMatrixWorld = function (force?: boolean) { fn(); base.call(o, force); };
};

// ===== hair over the beard =====
/** where the face drawing's INK (the outline of a pale beard's sideburn) gives way to the hair, as a share of the
 *  drawing's half width (the brows end at 0.49) */
const SIDE_FROM = 0.62, SIDE_FULL = 0.74;
// the places of the rig's head shader this edit needs (rig3d.ts FRAG_DECL / FRAG_SHADE, kind "face")
const DECL = "uniform vec4 uRim;";
const HAIR_MIX = "base = mix( base, hairC, hm );";
const INK_MIX = "base = mix( base, uInk, max( il, pl * hm ) );";
const FACE_MIX = "base = mix( base, fc, f.a * fm );";
const COV = "float cov = max( hm, bm ) * ( 1.0 - f.a * fm );";
/** The head shader with the BEARD AS HAIR (round 2). uHmBeard = the beard's colour as the face drawing has it (rgb,
 *  linear) and on / off (w); uHmBeardT = (t0, t1: how near that colour a drawing pixel must be to count as beard,
 *  ext: 1 = the beard has sideburns and goes on round the head, dark: 1 = no ink line where hair meets beard).
 *  1. a pixel of the face drawing in the beard's colour is taken OUT of the drawing and painted on the head BEFORE
 *     the hair: the hair and the head band then lie over it (per pixel, at the look's real hairline), and it is
 *     shaded as the hair is (the drawing's own darks are lifted toward the ink colour; hair is not: that was the
 *     "navy beard on black hair").
 *  2. where the drawing cannot reach (it fades out toward the edge of the ball it is projected on, and it ends at its
 *     own border) a beard with sideburns goes on in the same colour, from the drawing's outermost column round the
 *     side of the head: no bare skin between beard and outline at a three-quarter view.
 *  3. the rest of the drawing (eyes, brows, mouth, the ink outline of a pale beard) goes on last as before, and at the
 *     sides of the face it gives way to the hair. */
const sideEdit = (frag: string): string | null => [DECL, HAIR_MIX, INK_MIX, FACE_MIX, COV].every((t) => frag.includes(t)) && /float hm = /.test(frag) && /float il = /.test(frag) && /vec2 q = /.test(frag) && /float fm = /.test(frag)
  ? frag
    .replace(DECL, DECL + " uniform vec4 uHmBeard; uniform vec4 uHmBeardT;")
    .replace(HAIR_MIX, `float hmC = uHmBeard.w * ( 1.0 - smoothstep( uHmBeardT.x, uHmBeardT.y, distance( f.rgb, uHmBeard.rgb ) ) );
  float hmNF = dot( n, uFF );
  float hmE = uHmBeard.w * uHmBeardT.z * uFaceOn * max( 1.0 - smoothstep( 0.24, 0.3, hmNF ), smoothstep( 0.93, 0.97, abs( q.x ) ) ) * ( 1.0 - smoothstep( 0.7, 0.74, q.y ) ) * smoothstep( -0.62, -0.56, hmNF );
  float hmB = max( hmC * f.a * fm, hmE );
  base = mix( base, uHmBeard.rgb, hmB );
  ${HAIR_MIX}`)
    .replace(INK_MIX, "base = mix( base, uInk, max( il * ( 1.0 - uHmBeardT.w * hmB ), pl * hm ) );")
    .replace(FACE_MIX, `float hmF = f.a * fm * ( 1.0 - hmC ) * ( 1.0 - max( hm, il ) * smoothstep( ${SIDE_FROM.toFixed(2)}, ${SIDE_FULL.toFixed(2)}, abs( q.x ) ) );
  base = mix( base, fc, hmF );`)
    .replace(COV, "float cov = max( max( hm, bm ), hmB ) * ( 1.0 - hmF );") : null;
type BeardAcc = Acc & { sideburn: boolean; hmBeard: true; beardCol?: string };
/** Makes a figure's beard (of this file) part of its HAIR: under the hair's edge, shaded like it, and carried round
 *  the side of the head (see sideEdit). Once per figure, after rc.add (people.ts addPerson does it); returns true when
 *  the figure has such a beard. col = the beard's colour when the figure has none of this file's beards (force). */
export const hairOverBeard = (rig: Rig, force = false, col?: string): boolean => {
  const b = rig.acc.find((a) => (a as BeardAcc).hmBeard) as BeardAcc | undefined;
  if (!b && !force) return false;
  const U = { uHmBeard: { value: new THREE.Vector4(0, 0, 0, 1) }, uHmBeardT: { value: new THREE.Vector4(0.008, 0.022, b ? (b.sideburn ? 1 : 0) : 1, 0) } };
  for (const m of headMaterials(rig.group)) editHeadShader(m, {
    id: "hair-over-beard", edit: sideEdit, uniforms: U,
    onUniforms: (u) => {
      // the beard's colour: its own, or the look's hair colour (the rig's own uniform)
      const c = b?.beardCol ?? col, k = c ? new THREE.Color(c) : ((u.uHairCol?.value as THREE.Color | undefined) ?? new THREE.Color("#1f1c22"));
      const L = 0.2126 * k.r + 0.7152 * k.g + 0.0722 * k.b;
      U.uHmBeard.value.set(k.r, k.g, k.b, 1);
      U.uHmBeardT.value.set(0.008 + 0.04 * L, 0.022 + 0.1 * L, U.uHmBeardT.value.z, L < 0.07 ? 1 : 0);
    },
  });
  return true;
};

// ===== the beard =====
/** the head's outline in the face drawing: a circle of this radius (u = 1 % of the head's width) round the middle */
const RO = 50.5;
/** the inner edge of the sideburn strip of side s, from its hidden tip down to y1: it keeps `w` inside the head's
 *  outline (3 u at the top, wider lower down) and never comes nearer the middle than the zone the hair covers */
const stripIn = (s: number, y1: number, wLow: number): P2[] => {
  const out: P2[] = [[s * 62, -44], [s * (SIDE_FULL * RO + 0.4), -34.5]];
  for (let y = -31; y < y1 - 0.5; y += 3) out.push([s * Math.max(SIDE_FULL * RO + 0.4, Math.sqrt(RO * RO - y * y) - lerp(3, wLow, smooth((y + 31) / (y1 + 31)))), y]);
  return out;
};

/** the hanging part of a long beard (as garb.ts beardGeo): a tapered tongue of hair from inside the chin down over
 *  the chest. Head units through toM. uv: u round it (0.25 = its front), v along it. */
const beardGeo = (toM: (v: THREE.Vector3) => THREE.Vector3, len: number, wide: number, deep: number) => {
  const NS = 22, NC = 16, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3();
  const y0 = -0.5, mid = (t: number): [number, number] => [lerp(y0, -len, t), 0.42 + 0.36 * smooth(t / 0.3) - 0.1 * smooth((t - 0.45) / 0.55)];
  const [ya, za] = mid(0), [yb, zb] = mid(1);
  toM(v.set(0, ya, za)); pos.push(v.x, v.y, v.z); uv.push(0.5, 0);
  for (let i = 1; i < NS; i++) {
    const t = i / NS, [y, z] = mid(t);
    const k = smooth(t / 0.3) * (1 - 0.82 * smooth((t - 0.32) / 0.68) ** 1.1), w = (wide / 2) * k * (1 + 0.05 * Math.sin(t * 15)), d = (deep / 2) * (0.5 + 0.5 * k);
    for (let j = 0; j < NC; j++) { const p = (j / NC) * Math.PI * 2; toM(v.set(w * Math.cos(p), y, z + d * Math.sin(p))); pos.push(v.x, v.y, v.z); uv.push(j / NC, t); }
  }
  toM(v.set(0, yb, zb)); pos.push(v.x, v.y, v.z); uv.push(0.5, 1);
  const R = (i: number, j: number) => 1 + (i - 1) * NC + (j % NC), end = 1 + (NS - 1) * NC;
  for (let j = 0; j < NC; j++) { idx.push(0, R(1, j + 1), R(1, j)); idx.push(end, R(NS - 1, j), R(NS - 1, j + 1)); }
  for (let i = 1; i < NS - 1; i++) for (let j = 0; j < NC; j++) idx.push(R(i, j), R(i, j + 1), R(i + 1, j), R(i, j + 1), R(i + 1, j + 1), R(i + 1, j));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return weld(g);
};

type BeardKind = "full" | "short" | "fork" | "stubble" | "goatee" | "long";
/** A beard, drawn on the face under the mouth and the other features (the mouth is drawn on top of it and every
 *  expression keeps working). full = over the jaw and the chin up to the cheeks and under the nose; short = trimmed
 *  along the jaw, with a sideburn up to the hair; fork = a full beard that ends in two points; stubble = a shadow of
 *  dots; goatee = a tuft on the chin only; long = a full beard, and in 3D a long tongue of beard that hangs from the
 *  chin over the chest (len = how far below the head's middle it ends, in head radii, default 2.0; wide = its width,
 *  default 0.95). col: default the look's hair colour. A beard as dark as the ink goes round the mouth instead (the
 *  mouth stays on bare skin, where its line reads). With a moustache of the kit (slot lip) the mouth sits lower, and
 *  the beard goes with it. full / long / fork / short have SIDEBURNS that run up under the hair (see the head of this
 *  file; the figure needs hairOverBeard(rig): people.ts addPerson). short: lip = a trimmed moustache joined to the
 *  beard round the corners of the mouth (the mouth stays on bare skin).
 *  The long beard's 3D part belongs to the head and turns to stay under the DRAWN face (garb.ts trackFace), and it is
 *  gone with the face in a back view; rig.accRules() reports it (it is in front of the face on purpose). */
export const beard = (o: { col?: string; kind?: BeardKind; len?: number; wide?: number; lip?: boolean; wild?: boolean } = {}): Acc => {
  const kind = o.kind ?? "full", len = o.len ?? 2.0, wide = o.wide ?? 0.95, lip = !!o.lip, wild = !!o.wild;
  const acc: BeardAcc = {
    name: "beard", slots: ["chin"], key: `hm3|${kind}|${o.col ?? ""}|${len}|${wide}|${lip}|${wild}`, sideburn: kind === "full" || kind === "long" || kind === "fork" || kind === "short", hmBeard: true, beardCol: o.col,
    faceUnder(f) {
      const col = o.col ?? f.look.hairCol, my = f.mouth[1], q = f.quad, dark = luma(col) < 0.3, top = my - 7.6, strand = dark ? shade(col, 1.7) : shade(col, 0.74);
      // (a dark beard has no ink outline: beside black hair the ink line is the lighter of the two and would trace it)
      const OL = dark ? 0 : 1.6;
      // the upper edge of a full beard, from the left temple to the right: the sideburn strip down the head's outline
      // (its top end is under the hair), a dip under the cheek, then level above the mouth, which is drawn on the
      // beard. A beard as dark as the ink goes down round the mouth instead: the mouth (and a moustache) stay on bare
      // skin, where they read
      const cheek = Math.max(top + 4.5, 15.5), in0 = top + (dark ? 3 : 0);
      const side = (s: number): P2[] => [...stripIn(s, -8, 6.6), ...q([s * 43.5, -8], [s * 45, cheek + 2], [s * 34, cheek], 8), ...q([s * 34, cheek], [s * 25, cheek - 1.5], [s * 19.5, in0], 6).slice(1)];
      const mid: P2[] = dark ? [...q([-19.5, in0], [-20, my + 9.5], [0, my + 10], 8).slice(1), ...q([0, my + 10], [20, my + 9.5], [19.5, in0], 8).slice(1, -1)] : [];
      const upper: P2[] = [...side(-1), ...mid, ...side(1).reverse()];
      if (kind === "full" || kind === "long") f.fill([...upper, [62, 20], [50, 70], [-50, 70], [-62, 20]], col, OL);
      else if (kind === "fork") f.fill([...upper, ...q([56, 6], [40, 24], [14.5, 43.5], 10), ...q([14.5, 43.5], [9, 37], [0, my + 11.5], 6).slice(1), ...q([0, my + 11.5], [-9, 37], [-14.5, 43.5], 6).slice(1), ...q([-14.5, 43.5], [-40, 24], [-56, 6], 10).slice(1)], col, OL);
      else if (kind === "short") {
        // a band up the jaw, a hand wide at the chin, that goes on up the outline as a sideburn into the hair
        // (wild: a broader band whose upper edge on the cheeks is cut into upswept points, a fighter's bristling beard)
        const wl = wild ? 8.4 : 5.4, edge = (s: number): P2[] => {
          const pts = q([s * (RO - 0.1 - wl), 2], [s * (wild ? 40 : 42), my + (wild ? 3.5 : 5)], [0, my + 9.5], wild ? 18 : 14);
          if (wild) for (let i = 1; i < pts.length - 1; i += 2) if (Math.abs(pts[i][0]) > 13) { pts[i] = [pts[i][0] - s * 2.2, pts[i][1] - 4.4]; pts[i + 1] = [pts[i + 1][0] + s * 0.6, pts[i + 1][1] + 0.8]; }
          return pts;
        };
        const band = (s: number): P2[] => [...stripIn(s, 2, wl), ...edge(s)];
        f.fill([...band(-1), ...band(1).reverse().slice(1), [62, 30], [40, 70], [-40, 70], [-62, 30]], col, OL);
        if (lip) {
          // a trimmed moustache: a strip over the upper lip whose ends come down past the corners of the mouth into
          // the beard; the mouth stays on bare skin between them
          const [mx] = f.mouth, y = my - 6.4, half = (s: number): P2[] => {
            const X = (x: number) => mx + s * x;
            return [...q([X(0), y - 1.5], [X(9), y - 2.6], [X(14.6), y + 1.6], 8), ...q([X(14.6), y + 1.6], [X(18.2), y + 7], [X(17.4), my + 8.6], 8).slice(1),
              ...q([X(12.2), my + 8.2], [X(13.2), y + 6.5], [X(10.6), y + 3.6], 8), ...q([X(10.6), y + 3.6], [X(6), y + 2.2], [X(0), y + 2.3], 6).slice(1)];
          };
          for (const s of [-1, 1]) f.fill(half(s), col, 0);
        }
      }
      // a tuft under the lower lip, down over the chin to the head's outline
      else if (kind === "goatee") f.fill([...q([-8.5, my + 8], [0, my + 5.5], [8.5, my + 8], 6), ...q([8.5, my + 8], [13.5, my + 17], [3.2, 70], 8).slice(1), [-3.2, 70], ...q([-3.2, 70], [-13.5, my + 17], [-8.5, my + 8], 8).slice(1)], col, OL);
      else {
        // stubble: a faint shadow over the jaw and rows of dots on it
        const g = f.g, area: P2[] = [...upper, [62, 20], [50, 70], [-50, 70], [-62, 20]];
        g.save(); g.globalAlpha = 0.16; f.fill(area, col, 0); g.restore();
        for (let j = 0, k = 0; j < 7; j++) for (let i = -6; i <= 6; i++, k++) {
          const x = i * 7.2 + (j % 2) * 3.6 + f.jit(200 + k, 1.6), y = top + 2.5 + j * 5.6 + f.jit(400 + k, 1.3), e = (Math.abs(x) - 21) / 20, yTopAt = Math.abs(x) < 21 ? top : top - 9 * e * e - 6 * e;
          if (y < yTopAt + 2 || Math.hypot(x, y) > 47) continue;
          f.fill(f.arc(x, y, 1.05, 1.05, 0, 360, 8), col, 0);
        }
        return;
      }
      // a few strands
      if (kind === "full" || kind === "fork" || kind === "long") for (const [x, y, dx] of [[-30, my + 9, 2.5], [-12, my + 15.5, 1], [12, my + 15.5, -1], [30, my + 9, -2.5]] as [number, number, number][]) f.line(q([x, y], [x + dx, y + 4], [x + dx * 1.6, y + 7.5], 5), 1.5, strand);
    },
    build: kind === "long" ? (b) => {
      const col = o.col ?? b.look.hairCol, pale = luma(col) > 0.6;
      const map = b.tex(128, 256, (g) => {
        g.fillStyle = col; g.fillRect(0, 0, 128, 256);
        g.strokeStyle = shade(col, pale ? 0.8 : 1.5); g.lineWidth = 3.2; g.lineCap = "round";
        for (const [u, y0, y1] of [[0.12, 70, 190], [0.2, 100, 236], [0.25, 60, 170], [0.3, 110, 240], [0.38, 80, 200]] as [number, number, number][]) { g.beginPath(); g.moveTo(u * 128, y0); g.lineTo(u * 128 + 2, y1); g.stroke(); }
      }, `beard|${col}`);
      const mesh = b.solid("head", beardGeo(b.toM, len, wide, 0.42), { map, paint: "hair", ink: 0.0085 });
      // it hangs from a pivot at the head's middle that turns about the head's upright axis toward the drawn face,
      // and goes with the face in a back view: as the face fades the beard draws back into the head and is gone
      const head = mesh.parent!, pv = new THREE.Group();
      head.add(pv); pv.add(mesh);
      everyFrame(pv, () => {
        const root = head.parent?.parent, fy = root ? (root.userData.hmFaceYaw as number | undefined) : undefined;
        if (fy === undefined) { pv.rotation.y = 0; pv.visible = true; pv.scale.set(1, 1, 1); return; }
        const e = head.matrixWorld.elements, on = smooth((root!.userData.hmFaceOn as number | undefined) ?? 1);
        pv.rotation.y = clamp(wrapA(fy - Math.atan2(e[8], e[10])), -rad(50), rad(50));
        pv.visible = on > 0.02; pv.scale.set(0.3 + 0.7 * on, 0.45 + 0.55 * on, 0.3 + 0.7 * on);
      });
    } : undefined,
  };
  return acc;
};

// ===== sword brows =====
/** 剑眉, a warrior's brows: thick blades drawn over the rig's own brows. The rig has no brow weight in a Look, and
 *  where a brow sits depends on the expression, the blink and the figure's own quirks, so the blades are laid on the
 *  rig's brows as they were DRAWN: after the face is drawn, the top edge of each brow is read off the drawing at
 *  three places (the first ink from the top above the eye), and a blade is filled over it: `weight` u thick at the
 *  nose end (the rig's pen is 3.3), drawn `down` u lower there than the rig's brow (a scowl), and drawn out past the
 *  outer end to a point that rises `rise` u. It covers the rig's brow completely in every expression. No slot. */
export const swordBrows = (o: { col?: string; weight?: number; down?: number; rise?: number; len?: number } = {}): Acc => {
  const weight = o.weight ?? 6.8, down = o.down ?? 2.6, rise = o.rise ?? 2.2, len = o.len ?? 1;
  return {
    name: "brows", slots: [], key: `sword|${o.col ?? ""}|${weight}|${down}|${rise}|${len}`,
    face(f) {
      const g = f.g, col = o.col ?? f.INK, D = 6.2;
      /** the top of the first ink at column x (u), looking down from y = -36 to y = 3; null = none */
      const topAt = (x: number): number | null => {
        const [px, py0] = f.px(x, -36), [, py1] = f.px(x, 3), h = Math.max(1, Math.round(py1 - py0));
        const d = g.getImageData(Math.round(px), Math.round(py0), 1, h).data;
        for (let i = 0; i < h; i++) if (d[i * 4 + 3] > 150) return -36 + (39 * i) / h;
        return null;
      };
      for (const s of [-1, 1]) {
        const x0 = s * f.sp, yi = topAt(x0 - s * D), ym = topAt(x0), yo = topAt(x0 + s * D);
        if (yi === null || ym === null || yo === null) continue;
        // the rig's brow's top edge through the three: y(t), t = -1 at the nose end .. 1 at the outer end
        const b1 = (yo - yi) / 2, b2 = (yo + yi - 2 * ym) / 2, edge = (t: number) => (Math.abs(t) <= 1 ? ym + b1 * t + b2 * t * t : (t > 0 ? yo : yi) + (b1 + 2 * b2 * Math.sign(t)) * (t - Math.sign(t)) * 0.5);
        const X = (t: number) => x0 + s * D * t;
        const tIn = -1.42, tEnd = 1.56, tTip = 1.56 + 0.72 * len;
        const upper: P2[] = [], lower: P2[] = [];
        for (let k = 0; k <= 16; k++) {
          const t = lerp(tIn, tEnd, k / 16), e = edge(t), u = (t - tIn) / (tEnd - tIn);
          upper.push([X(t), e - 0.7 - 0.9 * u]);
          lower.push([X(t), e + lerp(weight - 0.7 + down * 0.55, 4.6, u ** 1.3)]);
        }
        const eT = edge(tEnd), tip: P2 = [X(tTip), eT - 0.7 - 0.9 - rise];
        // the nose end is cut slanting (lower at the nose), the outer end runs out to the rising point
        const blade: P2[] = [[X(tIn) + s * 1.2, upper[0][1] + 0.4], ...upper.slice(1), tip, ...lower.reverse()];
        f.fill(blade, col, 0);
      }
    },
  };
};
