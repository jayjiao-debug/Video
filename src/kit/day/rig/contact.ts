// THE CONTACT CHECK: after w.update(), does every visible figure touch what it should? It catches the mistakes a still
// shows only on a close look: a foot sunk into a stair or floating above it, a hand that stops short of the thing it is
// meant to hold (the rig could not reach the target: the cup floats), a sitter whose feet hang (only when asked: the
// rig's short legs dangle on a chair by design).
//   contactIssues(rig, { name: "newton", floorAt: (x, z) => 0, tol: 0.015 })   -> [{ part, kind, by, msg }]
// The World runs it on every frame when the input prop `contacts` is true and warns in the log:
//   npx remotion still ... --props='{"contacts":true}'   ->   [newton] f1234 contact: newton right hand 6.2 cm short of its target
// Pure: it reads the solved figure (footWorld, handWorld) and its state; it changes nothing.
import type { Rig } from "../../../videos/group/kit/rig3d";

/** the foot point's height above its sole for a planted foot (measured on the rig: footWorld(i).y - floor) */
export const FOOT_Y = 0.0182;
export type ContactIssue = { part: string; kind: "sink" | "float" | "dangle" | "reach"; by: number; msg: string };
export type ContactO = {
  name?: string;
  /** the floor's height under a point (default: the seat's floor for a sitter, else the figure's own at.y) */
  floorAt?: (x: number, z: number) => number;
  /** metres a contact may be off (default 0.015) */
  tol?: number;
  /** report a sitter's hanging feet too */
  strictSeats?: boolean;
};
const ARM = ["right hand", "left hand"], LEG = ["right foot", "left foot"];

export const contactIssues = (r: Rig, o: ContactO = {}): ContactIssue[] => {
  const st = r.state, tol = o.tol ?? 0.015, out: ContactIssue[] = [], who = o.name ?? "figure";
  if (st.visible === false) return out;
  const cm = (m: number) => `${(m * 100).toFixed(1)} cm`;
  // the hands: a target the arm did not reach
  (st.hands ?? []).forEach((h, i) => {
    if (!h) return;
    const d = r.handWorld(i as 0 | 1).distanceTo(h);
    if (d > tol * 2) out.push({ part: ARM[i], kind: "reach", by: d, msg: `${who} ${ARM[i]} ${cm(d)} short of its target` });
  });
  // the feet: on the floor under them
  const walking = st.pose.kind === "walk", seated = !!st.seat;
  const feet = [r.footWorld(0), r.footWorld(1)];
  const floorOf = (x: number, z: number) => (o.floorAt ? o.floorAt(x, z) : seated ? st.seat!.floor ?? 0 : st.at.y);
  const off = feet.map((p) => p.y - FOOT_Y - floorOf(p.x, p.z));
  off.forEach((d, i) => {
    if (d < -tol) out.push({ part: LEG[i], kind: "sink", by: -d, msg: `${who} ${LEG[i]} ${cm(-d)} below the floor` });
  });
  if (seated) {
    if (o.strictSeats) off.forEach((d, i) => { if (d > tol) out.push({ part: LEG[i], kind: "dangle", by: d, msg: `${who} ${LEG[i]} hangs ${cm(d)} above the floor (seated)` }); });
  } else {
    // a walker lifts one foot at a time: the lower one must be down; anyone else stands on both
    const check = walking ? [off[0] < off[1] ? 0 : 1] : [0, 1];
    for (const i of check) if (off[i] > tol) out.push({ part: LEG[i], kind: "float", by: off[i], msg: `${who} ${LEG[i]} ${cm(off[i])} above the floor` });
  }
  return out;
};
