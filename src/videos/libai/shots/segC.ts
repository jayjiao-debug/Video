// SEGMENT C, lines C19-C22: 午时, 沉香亭 (Qin's terrace with peonies). beats.ts BEAT.C.
//   write   C19-C20   he writes at a low desk, face still wet; the emperor's back at the parapet far off; 高力士 stands
//                     at his left, smug. C20 the couplet: the sheet fills.
//   foot    C21       高公公，靴子太紧: he turns to 高力士, smug.
//   boot    C21 after silence: 高力士 kneels, pulls the boot off, stands with it, turns and glares into the lens.
//   aside   C22       完了: the camera turns away to the pillar (to the viewers). Card 3. Fade through cream.
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { LI, GAO, EMPEROR } from "../people";
import { TX } from "../layout";
import { transitionAt } from "../hud";
import { V, rel, yawTo, lid, says, accent, heads, headPop, at, kneel, standing } from "./common";
import { aim, ramp, table, putTable, type St } from "./lb";

const S = SEGMENTS[2], Cb = BEAT.C;
const L20 = lineId("C20"), L21 = lineId("C21");
const T = table(V(TX + 0.2, 0, -0.55), 0);
const HEAD = rel(T.at, T.facing, 0, 0.98, 0);
const GAO_AT = V(TX + 0.95, 0, -1.05), GAO_F = yawTo(V(TX + 0.95, 0, -1.05), V(TX + 0.2, 0, 2.5));
const GAO_KNEEL = V(TX + 0.6, 0, -1.3), GAO_KF = -Math.PI / 2 - 0.6;
const EMP_AT = V(TX - 0.75, 0, -2.45);
const PEONIES = [V(TX - 1.35, 0, -1.6), V(TX + 1.75, 0, -1.9), V(TX - 1.0, 0, 0.55), V(TX + 1.55, 0, 0.35)];
const CAM0 = V(TX + 0.45, 1.45, 2.15);
const PILLAR = V(TX + 1.75, 1.6, -2.55);

const cam = (f: number): CamPose => {
  let c = aim(CAM0, HEAD.clone().add(V(0.3, -0.12, 0)), 760);
  c = C.handheld(c, f, { mood: f >= Cb.kneel && f < Cb.aside ? "still" : "calm" });
  c = C.punchIn(c, f, Cb.glare, { k: 0.72, len: 5, off: Cb.aside - 2 });
  c = C.aside(c, f, Cb.aside, Cb.card[0] + 6, PILLAR, { len: 10 });
  return c;
};

const li = (f: number): St => {
  const t = f / FPS, writing = f < L21.from - 6;
  const expr = at<NonNullable<St["expr"]>>(f, [[0, "focus"], [lineId("C19").to, "happy"], [L20.from, "smile_closed"], [L20.to, "happy"], [L21.from, "smug"], [Cb.kneel, "smile_closed"], [Cb.glare, "happy"]]);
  const m = says("li", ["C20", "C21"], f, 2);
  return {
    at: T.at.clone(), facing: T.facing + (f >= Cb.foot - 8 && f < Cb.glare ? 0.35 : 0), seat: T.seat, pose: { kind: writing ? "write" : "sit", t },
    expr, mouth: m.mouth, head: heads(m.head, headPop(f, Cb.foot)), blink: m.blink ?? lid(t, 2), gaze: f >= Cb.foot - 8 && f < Cb.glare ? 1 : 0, visible: true,
  };
};
const gao = (f: number): St => {
  const t = f / FPS;
  const k = ramp(f, Cb.kneel - 8, Cb.kneel + 6) * (1 - ramp(f, Cb.up - 6, Cb.up + 4));
  const p = GAO_AT.clone().lerp(GAO_KNEEL, ramp(f, Cb.kneel - 16, Cb.kneel - 2) * (1 - ramp(f, Cb.up, Cb.glare)));
  const facing = f < Cb.kneel - 16 ? GAO_F : f < Cb.up + 4 ? GAO_KF : yawTo(p, CAM0);
  const expr = at<NonNullable<St["expr"]>>(f, [[0, "smug"], [Cb.foot + 4, "shock"], [Cb.kneel, "pained"], [Cb.boot, "wince"], [Cb.glare, "huff"], [Cb.card[0], "stern"]]);
  const hold = f >= Cb.boot - 6;
  const bootAt = rel(p, facing, 0, 0.82, 0.28);
  return {
    ...standing(p, facing, f, 4), ...kneel(k, p), facing, expr, blink: lid(t, 4),
    pose: hold ? { kind: "hold", t } : { kind: "idle", t }, hands: hold ? [bootAt.clone().add(V(0, 0, 0)), bootAt.clone()] : [null, null],
    head: heads(accent("jolt", f, Cb.foot + 4, { amp: 0.7 }), accent("shake", f, Cb.glare, { amp: 0.5 })), turn: f < Cb.up + 4 && f >= Cb.kneel - 16 ? 1 : undefined,
  };
};

export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit(w) { w.actor(GAO).set({ visible: false }); w.actor(EMPEROR).set({ visible: false }); },
  pose(w, f) {
    w.setPlace("terrace");
    w.set.param("carriages", 0);
    const camera = cam(f);
    w.setCamera(camera);
    putTable(w, T);
    PEONIES.forEach((p, i) => w.prop("peony", `p${i}`).put(p, { rot: i }));
    w.prop("inkstone").put(T.on(0.35, 0.1));
    const ink = ramp(f, L20.from, L20.to);
    w.prop("letter").put(T.on(-0.02, 0.05), { ink });
    w.actor(LI).set(li(f));
    w.actor(GAO).set(gao(f));
    w.actor(EMPEROR).set({ at: EMP_AT, facing: Math.PI + 0.3, pose: { kind: "idle", t: f / FPS }, turn: 1, visible: true });
    w.update();
    const r = w.actor(LI), writing = f < L21.from - 6;
    if (writing) w.prop("brush").put(r.handWorld(0), { grip: "hilt", rot: [0.3, 0, 0.2] });
    else w.prop("brush").put(T.on(0.32, -0.02), { rot: [Math.PI / 2, 0.4, 0] });
    if (f >= Cb.boot - 6) w.prop("boot").put(w.actor(GAO).handWorld(1), { grip: "hilt", rot: yawTo(V(), V(1, 0, 0)) });
    return { camera, overlays: transitionAt(f)?.node, slate: "C 沉香亭" };
  },
};
void THREE;
