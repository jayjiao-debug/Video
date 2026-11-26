// SCENE J · 23:00. THE BUTTON: he shuffles off; she asks about her own thread. 「你的？早绑好了。」 The lens tilts down: a
// red thread runs from under her camera away along the pavement. 「是你已经见过的人。」 He waves and goes; her camera
// switches off.
// CAMERA: follows him; tilts down to her own ankle's thread; lifts along it down the street; back to him waving.
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { P, ck, lead, put, startOf, endOf, wordAt, ky, hit, walkAlong, faceTo, v3, V, ring } from "./kit";
import { XIAOMAN, RIDER } from "../people";
import { BY_SCOOTER, HER_STOP } from "./night";

const S = seg("J");
export const SEG: Segment = {
  id: "J", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", 0); w.set.param("lit", 0.35); w.set.param("moon", 1);
    const j01 = startOf("J01"), x01 = endOf("J01"), j02 = startOf("J02"), x02 = endOf("J02"), j03 = startOf("J03"), x03 = endOf("J03");
    const t = f / 30, back = x03 + 14;
    const STOP = P("street", -0.75, 0, -0.75), FRONT = P("street", 0.95, 0, -0.4);
    const camera = povCam(f, [
      ck("street", S.from, [0.6, 1.48, 1.0], [0.95, 1.04, -0.4], 53),
      ck("street", j01 + 20, [0.5, 1.48, 0.95], [-0.75, 1.02, -0.75], 50),
      ck("street", x02 - 4, [0.5, 1.48, 0.95], [-0.75, 1.02, -0.75], 48),
      ck("street", x02 + 12, [0.5, 1.5, 0.95], [0.85, 0.0, 0.2], 58),
      ck("street", j03 + 4, [0.5, 1.5, 0.95], [1.0, 0.0, 0.1], 58),
      ck("street", x03 - 6, [0.5, 1.5, 0.95], [3.3, 0.6, -0.8], 58),
      ck("street", back - 8, [0.5, 1.5, 0.95], [3.4, 0.62, -0.8], 57),
      ck("street", back + 10, [0.5, 1.48, 0.95], [-1.0, 1.0, -0.8], 50),
      ck("street", S.to, [0.5, 1.48, 0.95], [-1.6, 1.0, -0.9], 50),
    ], { mood: "calm", amp: 0.7 });
    w.setCamera(camera);
    const camP = v3(camera.pos);
    const leave = back + 34;
    const leg = f < leave ? walkAlong([FRONT, STOP], 1.3, (f - (S.from + 2)) / 30, {}) : walkAlong([STOP, P("street", -2.6, 0, -0.55), P("street", -5.5, 0, -0.5)], 1.1, (f - leave) / 30, {});
    const walking = leg.pose.kind === "walk", turned = f >= j01 + 22 && f < leave;
    const waveK = ky(f, [[back + 6, 0], [back + 12, 1], [leave - 6, 1], [leave, 0]]), pointK = ky(f, [[wordAt("J02", "早") - 2, 0], [wordAt("J02", "早") + 4, 1], [x02 + 20, 1], [x02 + 30, 0]]);
    lead(w, f, {
      at: leg.at, facing: walking ? leg.facing : turned ? faceTo(leg.at, camP) : leg.facing,
      pose: walking ? leg.pose : waveK > 0.3 ? { kind: "wave", t, arm: 0 } : pointK > 0.3 ? { kind: "point", t, arm: 0 } : undefined,
      expr: [[S.from, "smile"], [j01 + 16, "look"], [j02 - 2, "sly"], [x02 + 4, "smile"], [j03 - 2, "warm"], [back, "beam"], [leave, "smile"]],
      turn: walking && f >= leave ? 0.6 : undefined, lookDown: 10 * pointK,
      head: { dy: 0.04 * hit(f, j02, 8) },
    });
    // the two by the scooter, still talking
    put(w, f, RIDER, { at: BY_SCOOTER, facing: faceTo(BY_SCOOTER, HER_STOP), id: 4, expr: "beam", head: { dy: 0.03 * Math.sin(f * 0.21) } });
    const xm = put(w, f, XIAOMAN, { at: HER_STOP, facing: faceTo(HER_STOP, BY_SCOOTER), id: 2, expr: "smile", head: { dy: 0.03 * Math.sin(f * 0.17 + 1) } });
    const rd = w.actor(RIDER);
    w.update();
    const a = xm.footWorld(1).add(V(0, 0.06, 0)), b = rd.footWorld(0).add(V(0, 0.06, 0));
    ring(w, "ra", a, 0.05, 0.25); ring(w, "rb", b, 0.05, 0.25);
    w.props.thread("old", w.props.hang(a, b, 0.03, 5), { r: 0.008, glow: 0.9, col: "#ffcf6a" });
    // HER OWN THREAD: from under the lens (her ankle) away along the pavement, drawn on as the lens tilts down
    const on = x02 + 2, c = ky(f, [[on, 0], [j03 + 30, 1]]), pulse = 0.75 + 0.25 * Math.sin((f - on) * 0.25);
    if (f >= on) {
      const s0 = P("street", 0.56, 0.05, 0.72);
      ring(w, "me", s0, 0.055, 0.25);
      w.props.thread("mine", [s0, P("street", 0.9, 0.02, 0.3), P("street", 1.6, 0.02, 0.1), P("street", 2.6, 0.02, -0.15), P("street", 4.4, 0.02, -0.35), P("street", 7.0, 0.02, -0.5), P("street", 11.0, 0.02, -0.6)], { r: 0.009, glow: pulse, cut: c });
    }
    void x01; void endOf;
    return { camera, post: { bloom: 0.5 } };
  },
};
