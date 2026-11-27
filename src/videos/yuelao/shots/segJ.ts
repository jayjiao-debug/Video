// SCENE J · 23:00, the same pavement (no cut from I: she simply keeps filming). THE BUTTON.
// He looks round at the two, hands clasped behind his back; they are swapping numbers. She asks about her own thread
// (那我的那根呢？). He turns back to her: 「你的？早绑好了。」 and nods down at her feet. Her lens drops: a red thread comes
// from under her own camera, over the kerb, onto the pavement (his feet are already going, at the top of her frame).
// 「是你已经见过的人。」 She steps onto the pavement after it and her lens runs along it: it goes on down the whole street,
// under the lamps, past the all-night shop, into the lit city, and its light races ahead of her to the far end. When she
// looks back he is by the scooter, waving; he turns to go; her camera switches off.
// CAMERA PLAN (her eyes, one take; 12 s, three moves, each because of what he says or does):
//   那我的那根   LOOK AT him: he is watching his work                  the wide from scene I, held                still
//   你的？早…    his face at her lens; his nod down at her feet        the same, held                             still (the lead is at the lens)
//   (her feet)   her own thread, coming from under the camera          a tilt straight down                       along his look
//   是你已经…    where it goes: the whole street, to the far lights    ONE follow along it, two steps after it    she follows the thing
//   (bye)        him, already going, waving                            back to him, medium full                   to the reaction
import * as THREE from "three";
import React from "react";
import { seg, type Segment } from "../story";
import { OFF_AT } from "../hud";
import { P, startOf, endOf, wordAt, ky, rel, V, smooth, walkAlong, hang, hit, win, shotCam, turnTo, faceTo, type ShotKey } from "./kit";
import { act, YL, XM, QS, type MoodKey } from "./act";
import { anklet, knotAt, bowKnot, lay, type Floor } from "./thread";
import { oldLine, oldCol } from "./night";
import { C2, FRONT, TAB, KNOT_END, MEET_R, HER_FOOT } from "./segI";

const S = seg("J"), HALF = Math.PI / 2, ISL = P("street", 0, 0, 0).x, STROLL = 1.0;
/** where she stands on the pavement at the end of the follow (over her thread, looking down the street) */
const P2: [number, number, number] = [-0.9, 1.5, 1.95];
/** where he turns to wave (a few steps back from her, toward the tower: from where she ends up, the two he has just
 *  tied are behind his shoulder and the scooter is beside him), and his way off into the night, past the scooter */
const BYE_AT = P("street", 0.6, 0, 0.2), GO = [FRONT, BYE_AT], AWAY = [BYE_AT, P("street", 2.4, 0, 0.75), P("street", 9, 0, 1.0), P("street", 22, 0, 1.0)];
/** the street under her feet: the road she stands in, the kerb, the pavement */
const ROAD: Floor = (_x, z) => (z > 2.4 ? -0.12 : z > 2.2 ? 0.03 : 0);
/** HER OWN THREAD: from her ankle (behind her lens), over the kerb, then away along the pavement, down the whole street */
const MINE = ([[0.4, 3.5], [0.37, 3.05], [0.31, 2.55], [0.2, 2.1], [-0.15, 1.86], [-0.9, 1.8], [-2.2, 1.9], [-4.2, 1.68], [-6.5, 1.5], [-9.5, 1.62], [-13, 1.5], [-18, 1.3], [-24, 1.1], [-32, 0.95], [-42, 0.85], [-54, 0.8], [-66, 0.8], [-80, 0.8], [-91, 0.8]] as const).map(([x, z]) => P("street", x, 0, z));
let LAID: { pts: THREE.Vector3[]; s: number[] } | null = null;
const laid = () => {
  if (!LAID) {
    const pts = lay(MINE, ROAD, { wander: 0, seed: 3, r: 0.006, step: 0.1 }), s = [0];
    for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + pts[i].distanceTo(pts[i - 1]));
    // it lies loosely near her (small waves, from past the kerb to about 14 m); farther off it must be a clean line
    const side = pts.map((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], d = V(b.x - a.x, 0, b.z - a.z); return d.lengthSq() < 1e-6 ? V(0, 0, 0) : V(d.z, 0, -d.x).normalize(); });
    for (let i = 0; i < pts.length; i++) {
      const d = s[i], env = smooth((d - 1.7) / 1.5) * (1 - smooth((d - 3.5) / 6));
      if (env > 0.001) pts[i].addScaledVector(side[i], 0.022 * env * (0.75 * Math.sin(d * 4.1 + 1.3) + 0.25 * Math.sin(d * 8.3 + 0.7)));
    }
    LAID = { pts, s };
  }
  return LAID;
};
/** the stretch of it between two lengths from her ankle */
const stretch = (a: number, b: number): THREE.Vector3[] => {
  const { pts, s } = laid(), out: THREE.Vector3[] = [];
  const cut = (d: number) => { let j = 1; while (j < pts.length - 1 && s[j] < d) j++; return pts[j - 1].clone().lerp(pts[j], Math.max(0, Math.min(1, (d - s[j - 1]) / Math.max(1e-6, s[j] - s[j - 1])))); };
  out.push(cut(a));
  for (let i = 0; i < pts.length; i++) if (s[i] > a + 0.02 && s[i] < b - 0.02) out.push(pts[i]);
  out.push(cut(b));
  return out;
};
/** it is drawn in stretches that grow thicker with distance, so that it still reads as a line at the far end of the street */
const BANDS = [0, 5, 8, 11, 15, 20, 26, 34, 44, 57, 74, 200];
const DIM = "#9c2a26", LIT = "#ff4a34";
/** the point of it that her lens sees `phi` (rad) below the horizon from `cam`: the farthest one that steep */
const elev = (cam: THREE.Vector3, p: THREE.Vector3) => Math.atan2(cam.y - p.y, Math.hypot(p.x - cam.x, p.z - cam.z));
const seenAt = (cam: THREE.Vector3, phi: number): THREE.Vector3 => {
  const { pts } = laid();
  for (let i = pts.length - 1; i > 0; i--) {
    const e0 = elev(cam, pts[i - 1]);
    if (e0 >= phi) { const e1 = elev(cam, pts[i]); return pts[i - 1].clone().lerp(pts[i], Math.max(0, Math.min(1, (e0 - phi) / Math.max(1e-6, e0 - e1)))); }
  }
  return pts[0].clone();
};
// ---- HER CAMERA SWITCHES OFF (the series' ending): the picture holds for a moment under the dead display, folds to a
// bright line, the line shrinks to a dot, black.
const OFF = { freeze: 9, collapse: 8, dot: 10 }, C0 = OFF_AT + OFF.freeze, C1 = C0 + OFF.collapse - 1, D0 = C1 + 1, BLACK = D0 + OFF.dot, MID = 960;
const h = React.createElement, clamp01 = (x: number) => Math.max(0, Math.min(1, x)), mix = (a: number, b: number, k: number) => a + (b - a) * k;
const offBlack = (key: string, top: number, height: number) => h("div", { key, style: { position: "absolute", left: 0, top, width: 1080, height, background: "#000" } });
const offLine = (hw: number, hh: number, a: number) => h("div", { key: "offLine", style: {
  position: "absolute", left: 540 - hw, top: MID - hh, width: 2 * hw, height: 2 * hh, borderRadius: hh, background: "#fffaf0", opacity: a,
  boxShadow: "0 0 10px 3px rgba(255,242,222,0.9), 0 0 34px 8px rgba(255,226,190,0.32)" } });
const switchOff = (f: number) => {
  if (f < C0) return null;
  if (f >= BLACK) return offBlack("offBlack", 0, 1920);
  const kids: React.ReactNode[] = [];
  if (f <= C1) {
    const k = (f - C0 + 1) / (C1 - C0 + 1), hh = Math.max(3, MID * (1 - smooth(k)));
    const edge = 0.04 + 0.45 * k * k * k, mid = 0.08 + 0.8 * k * k * k, grey = 0.2 * k;
    kids.push(
      h("div", { key: "offGrey", style: { position: "absolute", left: 0, top: MID - hh, width: 1080, height: 2 * hh, background: `rgba(128,124,120,${grey.toFixed(3)})` } }),
      h("div", { key: "offVeil", style: { position: "absolute", left: 0, top: MID - hh, width: 1080, height: 2 * hh,
        background: `linear-gradient(to bottom, rgba(255,246,232,${edge.toFixed(3)}) 0%, rgba(255,246,232,${mid.toFixed(3)}) 50%, rgba(255,246,232,${edge.toFixed(3)}) 100%)` } }),
      offBlack("offTop", 0, MID - hh), offBlack("offBottom", MID + hh, 1920 - MID - hh),
    );
    const la = clamp01((60 - hh) / 50);
    if (la > 0) kids.push(offLine(540, 3, la));
  } else {
    const n = f - D0, u = smooth(Math.min(1, (n + 1) / 6)), a = n < 6 ? 1 : 1 - (n - 5) / 5;
    kids.push(offBlack("offAll", 0, 1920), offLine(mix(540, 7, u), mix(3, 7, u * u), a));
  }
  return h("div", { key: "switchOff", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" } }, ...kids);
};
/** the two where scene I left them (a small step nearer each other) */
const NEARER = HER_FOOT.clone().sub(MEET_R).normalize().multiplyScalar(0.035), R_AT = MEET_R.clone().add(NEARER), X_AT = HER_FOOT.clone().sub(NEARER);

export const SEG: Segment = {
  id: "J", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f0) {
    const f = Math.min(f0, OFF_AT);                                                          // the picture holds from the off click
    const j01 = startOf("J01"), j02 = startOf("J02"), early = wordAt("J02", "早"), x02 = endOf("J02"), j03 = startOf("J03"), x03 = endOf("J03");
    // he looks round at them; back to her; the nod; her lens drops; he goes; she follows the thread; back to him; he waves; he goes
    // (the lens stays on her own thread for half a second before it follows it: its light has to wake under her and
    // run away from her first, or it is just another thread; the line 是你已经见过的人 starts as she begins to follow it)
    const TILT = 14, WHIP = 26;
    const round0 = S.from + 8, back0 = j01 + 12, tilt0 = x02 + 1, go0 = tilt0 + 8, on0 = tilt0 + 9, fl0 = j03 - 4, fl1 = fl0 + 54, b0 = x03 + 8, wave0 = b0 + 19, leave = b0 + 50;
    const p0 = S.from + 14, p1 = S.from + 84;
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", 0); w.set.param("lit", 0.35); w.set.param("moon", 0.8);
    const t = f / 30;
    // ---------------------------------------------------------------------------------------------- the camera
    const camAt = (g: number): [number, number, number] => { const k = smooth((g - fl0) / (fl1 - fl0 - 6)); return [C2[0] + (P2[0] - C2[0]) * k, C2[1] + (P2[1] - C2[1]) * k, C2[2] + (P2[2] - C2[2]) * k]; };
    const camW = (g: number) => { const c = camAt(g); return P("street", c[0], c[1], c[2]); };
    const PHI0 = 58.5 * Math.PI / 180, PHI1 = 2.1 * Math.PI / 180;
    const seen = (g: number) => seenAt(camW(g), PHI0 + (PHI1 - PHI0) * smooth((g - fl0) / (fl1 - fl0)));
    // back to him: she swings round the short way (past the tower's door) to where he has got to
    // (when he walks off, her lens goes with him a little: the lead walks, so the camera may move)
    const offAt = (g: number) => walkAlong(AWAY, STROLL, (g - (leave + 8)) / 30).at, byeAimAt = (g: number) => { const o = g > leave + 8 ? offAt(g).sub(BYE_AT).multiplyScalar(0.8) : V(0, 0, 0); return P("street", BYE_AT.x - ISL, 1.02, BYE_AT.z).add(o); };
    const aim = (g: number) => {
      if (g <= b0) return seen(g);
      const c = camW(g), a = seen(b0).sub(c), b = byeAimAt(g).sub(c), k = smooth((g - b0) / WHIP);
      const ya = Math.atan2(a.x, a.z), yb = Math.atan2(b.x, b.z) - 2 * Math.PI, yaw = ya + (yb - ya) * k;
      const da = Math.hypot(a.x, a.z), db = Math.hypot(b.x, b.z), d = da + (db - da) * k;
      return c.clone().add(V(Math.sin(yaw) * d, a.y + (b.y - a.y) * k, Math.cos(yaw) * d));
    };
    const DOWN = { sx: 590, sy: 1200, fov: 62 }, FAR = { sx: 449, sy: 857, fov: 50 }, BYE = { sx: 600, sy: 930, fov: 56 };
    const keys: ShotKey[] = [
      { f: S.from, ...TAB }, { f: tilt0, ...TAB }, { f: tilt0 + TILT, pos: camAt, at: aim, ...DOWN },
      { f: fl0, pos: camAt, at: aim, ...DOWN }, { f: fl1, pos: camAt, at: aim, ...FAR }, { f: b0, pos: camAt, at: aim, ...FAR },
      { f: b0 + WHIP, pos: camAt, at: aim, ...BYE }, { f: S.to, pos: camAt, at: aim, ...BYE },
    ];
    const camera = shotCam("street", f, keys, { mood: "calm", amp: 0.4, walk: [[fl0, 0], [fl0 + 8, 0.5], [fl1 - 16, 0.5], [fl1 - 6, 0]] });
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老
    const camG = P("street", C2[0], 0, C2[2]), cam2G = P("street", P2[0], 0, P2[2]), lensYaw = faceTo(FRONT, camG), byeYaw = faceTo(BYE_AT, cam2G);
    // he looks round at the two over his left shoulder (his face stays in her lens), hands clasped behind his back
    const roundK = smooth((f - round0) / 12) * (1 - smooth((f - back0) / 10));
    const go = walkAlong(GO, 1.4, (f - go0) / 30, { endFacing: byeYaw }), away = walkAlong(AWAY, STROLL, (f - (leave + 8)) / 30);
    const going = f >= go0 && go.moving, leaving = f >= leave, walksOff = leaving && away.moving;
    const at = leaving ? away.at : f >= go0 ? go.at : FRONT;
    const facing = leaving ? turnTo(byeYaw, away.facing, smooth((f - leave) / 12)) : going ? turnTo(lensYaw, go.facing, smooth((f - go0) / 7)) : f >= go0 ? go.facing : lensYaw + 1.35 * roundK;
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z);
    // his hands: clasped behind his back (the old man who knows) until he goes; at the end one big wave over his head
    const behind = smooth((f - round0) / 12) * (1 - smooth((f - (go0 - 2)) / 8));
    const handR = hang(at, facing, 0).lerp(H(-0.07, 0.7, -0.14), behind), handL = hang(at, facing, 1).lerp(H(0.07, 0.7, -0.14), behind);
    const waveK = smooth((f - wave0) / 6) * (1 - smooth((f - leave) / 8)), wv = (f - wave0) * 0.42;
    const waveHand = hang(at, facing, 1).lerp(H(0.36 + 0.06 * Math.sin(wv), 1.25 + 0.02 * Math.cos(2 * wv), 0.05), waveK);
    // 那我的那根呢？ oh? | 你的？ warm, his head on one side | 早绑好了 eyes shut in a grin, a slow nod down at her feet
    // (eyes OPEN through 早绑好了: a look down at her feet cannot be read on a face with its eyes shut in a grin)
    const faces: MoodKey[] = [[S.from, "fawn"], [round0 + 3, "warm"], [back0 + 6, "oh", "take", 0.6], [j02 - 10, "warm"], [go0 + 3, "warm"], [wave0 - 6, "joy"], [leave + 2, "warm"]];
    act(w, f, YL, {
      at, facing, faces, turn: leaving ? 0.5 + 0.5 * smooth((f - leave - 4) / 10) : 0.5,
      pose: walksOff ? away.pose : going ? go.pose : undefined,
      hands: f < go0 ? [handR, handL] : waveK > 0.01 ? [null, waveHand] : undefined,
      lookDown: f < go0 ? ky(f, [[S.from, -8], [round0, -8], [round0 + 10, -2], [back0, -2], [back0 + 10, -8], [early + 2, -8], [early + 8, 21], [early + 15, 15], [early + 21, 23], [go0, 23]]) : waveK > 0.01 ? -4 : 0,
      gaze: f < go0 ? ky(f, [[round0, 0], [round0 + 8, 1], [back0, 1], [back0 + 8, 0]]) : 0,
      lean: { pitch: f < go0 ? ky(f, [[S.from, 2], [round0 + 10, -3], [back0, -3], [back0 + 12, 2], [early + 2, 2], [early + 9, 10], [early + 15, 7], [early + 21, 11]]) : 0, roll: 2.5 * waveK * Math.sin(wv) },
      head: { tilt: 5 * win(f, j02 - 3, early - 2, 6, 6) + 4 * roundK + 3 * waveK * Math.sin(wv), dy: -0.03 * hit(f, early + 8, 9) - 0.02 * hit(f, early + 21, 8) },
    });
    // ---------------------------------------------------------------------------------------------- the two
    // they swap numbers: his phone out, hers over it; then they just go on talking
    const phK = win(f, p0, p1, 10, 10), RH = (dx: number, y: number, z: number) => rel(R_AT, -HALF, dx, y, z), XH = (dx: number, y: number, z: number) => rel(X_AT, HALF, dx, y, z);
    const rd = act(w, f, QS, {
      at: R_AT, facing: -HALF, turn: 0.55, faces: [[S.from, "beam"], [p0 - 4, "smile"], [p1 + 4, "beam"], [p1 + 34, "smile"]], talk: false,
      hands: phK > 0.01 ? [null, hang(R_AT, -HALF, 1).lerp(RH(0.1, 0.98, 0.3), smooth(phK))] : undefined,
      gaze: -1, lookDown: 3 + 10 * smooth(phK), lean: { pitch: 3 }, head: { dy: 0.012 * Math.sin(f * 0.21) * (1 - phK) },
    });
    const xm = act(w, f, XM, {
      at: X_AT, facing: HALF, turn: 0.4, faces: [[S.from, "beam"], [p0 - 2, "smile"], [p1 + 8, "beam"], [p1 + 46, "shy"]], talk: false, show: phK > 0.3 ? ["phone"] : undefined,
      hands: phK > 0.01 ? [null, hang(X_AT, HALF, 1).lerp(XH(0.08, 1.0, 0.3), smooth(phK))] : undefined,
      gaze: 1, lookDown: 3 + 10 * smooth(phK), lean: { pitch: 3 }, head: { dy: 0.012 * Math.sin(f * 0.17 + 1) * (1 - phK) },
    });
    w.update();
    if (phK > 0.3) w.prop("phone", "rider").put(rd.handWorld(1).add(V(0, 0.03, 0)), { yaw: -HALF, pitch: -0.45 });
    w.prop("tangle", "his").put(KNOT_END, { yaw: 11.3, roll: 6 });
    // ---------------------------------------------------------------------------------------------- the gold thread
    const ankHis = rd.footWorld(1).add(V(0, 0.07, 0)), ankHer = xm.footWorld(0).add(V(0, 0.07, 0)), inHis = V(-1, 0, 0.3), inHer = V(1, 0, 0.3);
    const knotHis = knotAt(ankHis, inHis, 0.026), knotHer = knotAt(ankHer, inHer, 0.026);
    oldLine(w, 1, { ends: { her: knotHer, his: knotHis }, lit: 1, clean: 1, tight: { a: knotHer, b: knotHis, k: 1 } });
    const tie = (key: string, ank: THREE.Vector3, inward: THREE.Vector3) => {
      const o = { r: 0.0065, closed: true, col: oldCol(1, 1), glow: 1 };
      w.props.thread(key + "a", anklet(ank, 0.026, 0.25, 0.4), o); w.props.thread(key + "b", bowKnot(knotAt(ank, inward, 0.026), inward, 0.026), o);
    };
    tie("oh", ankHis, inHis); tie("os", ankHer, inHer);
    // ---------------------------------------------------------------------------------------------- her own thread
    // It lies there, a plain red thread, from the moment her lens comes down. Then its light wakes at her ankle and runs
    // away along it, ahead of her lens, to the far end of the street.
    if (f >= tilt0) {
      const total = laid().s[laid().s.length - 1];
      const front = ky(f, [[on0, 0.3], [fl0, 3.4], [fl0 + 20, 9], [fl1 - 8, 34], [fl1 + 8, total]]), pulse = 0.5 + 0.5 * Math.sin((f - on0) * 0.21);
      for (let i = 0; i + 1 < BANDS.length; i++) {
        const a = BANDS[i], b = Math.min(BANDS[i + 1], total);
        if (a >= total) break;
        const r = 0.0064 * Math.max(1, (a + b) / 2 / 7);
        if (front > a + 0.05) w.props.thread(`mine${i}`, stretch(a, Math.min(b, front)), { r, glow: (i < 2 ? 0.45 : 0.7) + 0.25 * pulse, col: LIT });
        if (front < b - 0.05) w.props.thread(`mineD${i}`, stretch(Math.max(a, front), b), { r, glow: 0.1, col: DIM });
        // the head of the light: a short hot stretch at its front (the same thread, only brighter)
        if (front > a && front <= b && front < total - 0.1) w.props.thread("mineH", stretch(Math.max(0, front - 0.12 - 0.03 * front), front), { r: r * 1.04, glow: 1, col: "#ffd2b0" });
      }
    }
    void j01;
    return { camera, shown: [], post: { bloom: 0.8 }, top: switchOff(f0), ...(f0 >= C0 ? { captions: false } : {}), ...(f0 >= OFF_AT ? { clock: OFF_AT / 30 } : {}) };
  },
};
