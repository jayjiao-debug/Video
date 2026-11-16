// THE RIG LAYER's checks (src/kit/day/rig), run on real solved figures in node (no browser: the rig solves without a
// canvas):  node scripts/kit/day/proof/run.mjs scripts/kit/day/rig/check.tsx
//   1. the contact check finds what it should (a planted figure: nothing; a figure put 5 cm into the floor: a sink; a
//      hand target out of reach: a reach) and nothing else
//   2. seat data on furniture: a chair turned any way gives the same seat in the sitter's frame; the rig sits on it with
//      the feet as the rig's legs allow (the table of each stock figure's highest seat with feet planted)
//   3. the personality profile: pure (the same frame twice = the same state), its face map, its mood changes
//   4. the pose library: every pose solves without a contact problem
import * as THREE from "three";
import { RigCast, type Rig } from "../../../../src/videos/group/kit/rig3d";
import { addPerson, PEOPLE, type Person } from "../../../../src/videos/wanbi/people";
import { BAKED_LIGHT } from "../../../../src/kit/day/sets";
import { makeVerbs } from "../../../../src/kit/day/verbs";
import { contactIssues, FOOT_Y } from "../../../../src/kit/day/rig/contact";
import { chairSeat, stoolSeat, seatOn } from "../../../../src/kit/day/rig/seats";
import { persona } from "../../../../src/kit/day/rig/personality";
import { POSES } from "../../../../src/kit/day/rig/poses";

let bad = 0;
const ok = (c: boolean, msg: string) => { if (!c) bad++; console.log(`${c ? "ok  " : "FAIL"} ${msg}`); };
const scene = new THREE.Group();
const rc = new RigCast(scene, { light: { key: [0.5, 0.5, 0.5], tint: [1, 1, 1], tintK: 0.5, gain: 1, ...BAKED_LIGHT } as never });
const cam = new THREE.PerspectiveCamera(50, 9 / 16, 0.03, 100); cam.position.set(0.4, 1.5, 4); cam.lookAt(0, 1.0, 0); cam.updateMatrixWorld(true);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const fig = (p: Person) => addPerson(rc, p);
const solve = (r: Rig, s: Parameters<Rig["set"]>[0]) => { for (const k of Object.keys(r.state)) delete (r.state as Record<string, unknown>)[k]; r.set({ visible: true, facing: 0, ...s } as never); rc.update(cam, 1920); return r; };
const VB = makeVerbs({ fps: 30, EYE: 1.6, FOV: 62, quotes: [] });

// ---- 1. contacts
const a = fig(PEOPLE.miaoXian);
solve(a, { at: V(0, 0, 0), pose: { kind: "idle", t: 0 } });
ok(contactIssues(a).length === 0, `contact: a figure standing on the floor has no issue (feet at floor + ${FOOT_Y})`);
solve(a, { at: V(0, -0.05, 0), pose: { kind: "idle", t: 0 } });
const sink = contactIssues(a, { floorAt: () => 0 });
ok(sink.length === 2 && sink.every((c) => c.kind === "sink" && Math.abs(c.by - 0.05) < 0.002), `contact: 5 cm into the floor = two sinks (${sink.map((c) => c.msg).join("; ")})`);
solve(a, { at: V(0, 0.04, 0), pose: { kind: "idle", t: 0 } });
ok(contactIssues(a, { floorAt: () => 0 }).filter((c) => c.kind === "float").length === 2, "contact: 4 cm above the floor = two floats");
for (const ph of [0, 0.13, 0.25, 0.4, 0.5, 0.75]) { solve(a, { at: V(0, 0, 0), pose: { kind: "walk", t: 0, phase: ph } }); ok(contactIssues(a, { floorAt: () => 0 }).length === 0, `contact: walking (phase ${ph}): the lifted foot is allowed`); }
solve(a, { at: V(0, 0, 0), pose: { kind: "hold", t: 0 }, hands: [V(-0.2, 0.75, 0.25), V(0.2, 0.75, 0.25)] });
const near = contactIssues(a);
solve(a, { at: V(0, 0, 0), pose: { kind: "hold", t: 0 }, hands: [V(-0.2, 0.75, 2.5), null] });
const far = contactIssues(a);
ok(near.length === 0 && far.length === 1 && far[0].kind === "reach", `contact: a reachable hand target passes, one 2.5 m away is reported (${far.map((c) => c.msg).join("; ") || "nothing"}; near: ${near.map((c) => c.msg).join("; ") || "nothing"})`);

// ---- 2. seats
const CHAIR = chairSeat({ seat: 0.45, d: 0.4, backZ: -0.185, backTop: 0.95 });
const local = (yaw: number, at: THREE.Vector3) => { const s = seatOn(CHAIR, at, yaw, { floor: 0 }); const d = s.top.clone().sub(at); return [+d.y.toFixed(4), +Math.hypot(d.x, d.z).toFixed(4), s.facing === yaw, s.backrest, s.front]; };
ok(JSON.stringify(local(0, V(1, 0, 2))) === JSON.stringify(local(1.3, V(-2, 0, 0.5))), "seats: the same chair turned and moved gives the same seat in its own frame");
const off = { ...CHAIR, at: [0.1, 0.05] as [number, number] };
const s90 = seatOn(off, V(0, 0, 0), Math.PI / 2);
ok(Math.abs(s90.top.x - 0.05) < 1e-9 && Math.abs(s90.top.z + 0.1) < 1e-9, `seats: an off-centre seat turns with the furniture (${s90.top.x.toFixed(3)}, ${s90.top.z.toFixed(3)})`);
const seatedOn = (p: Person, top: number) => {
  const r = fig(p), s = seatOn(stoolSeat({ seat: top, d: 0.34 }), V(0, 0, 0), 0, { floor: 0 });
  solve(r, VB.seated(s, 0) as never);
  return Math.max(...contactIssues(r, { strictSeats: true }).filter((c) => c.kind === "dangle").map((c) => c.by), 0);
};
console.log("     the highest seat each stock figure sits on with both feet planted (the rig's short legs dangle above it):");
for (const [k, p] of Object.entries(PEOPLE).slice(0, 6)) {
  let lo = 0.15, hi = 0.6;
  for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (seatedOn(p, m) <= 0.015) lo = m; else hi = m; }
  console.log(`       ${k.padEnd(14)} ${lo.toFixed(3)} m`);
}
const chairR = fig(PEOPLE.lin);
solve(chairR, VB.seated(seatOn(CHAIR, V(0, 0, 0), 0.6, { floor: 0, desk: { edge: 0.3, top: 0.76 } }), 0) as never);
ok(!!chairR.state.seat && chairR.state.seat.backrest !== undefined && chairR.state.seat.deskEdge === 0.3, "seats: seated() hands the chair's back and the desk to the rig");
ok(contactIssues(chairR).length === 0, `seats: sitting on the chair has no contact issue (dangling allowed: ${contactIssues(chairR, { strictSeats: true }).map((c) => c.msg).join("; ")})`);

// ---- 3. personality
const NT = persona({ name: "dry", rest: "deadpan", energy: 0.1, blinkK: 0.6, restless: 0.1, react: { joke: "gloom" } }, VB);
const HM = persona({ name: "lively", energy: 0.9, restless: 0.9 }, VB);
ok(JSON.stringify(NT.idle(123, 2)) === JSON.stringify(NT.idle(123, 2)), "persona: pure (the same frame twice gives the same state)");
ok(NT.face("rest") === "deadpan" && NT.face("joke") === "gloom" && NT.face("shock") === "aghast" && HM.face("rest") === "neutral", "persona: the face map (own, then the defaults)");
const gz = (P: typeof NT) => { const g = Array.from({ length: 300 }, (_, f) => P.idle(f, 1).gaze); return g.filter((x, i) => i > 0 && x !== g[i - 1]).length; };
ok(gz(HM) > gz(NT), `persona: a restless character's eyes move more (gaze changes over 10 s: ${gz(HM)} vs ${gz(NT)})`);
const q = { line: 1, id: "X", who: "x", text: "hello there friend", syl: 5, from: 30, to: 75, start: 1, end: 2.5 };
const hd = (P: typeof NT) => Array.from({ length: 50 }, (_, i) => Math.abs(P.talk(q, 30 + i, 1).head?.tilt ?? 0) + Math.abs(P.talk(q, 30 + i, 1).head?.dy ?? 0) * 10).reduce((x, y) => x + y, 0);
ok(hd(HM) > hd(NT) * 2, `persona: a lively character's head moves more with the words (${hd(HM).toFixed(2)} vs ${hd(NT).toFixed(2)})`);
const keys: [number, "rest" | "joke"][] = [[0, "rest"], [60, "joke"]];
const faces = Array.from({ length: 80 }, (_, f) => JSON.stringify(NT.mood(f, keys).expr));
ok(faces[30] === JSON.stringify("deadpan") && faces[75] === JSON.stringify("gloom") && new Set(faces.slice(55, 64)).size > 2, "persona: a reaction changes face through the rig's change frames, not a cut");

// ---- 4. poses
const pr = fig(PEOPLE.miaoXian), seat = seatOn(stoolSeat({ seat: 0.4, d: 0.34 }), V(0, 0, 0), 0, { floor: 0, desk: { edge: 0.28, top: 0.72 } });
for (const [name, P] of Object.entries(POSES)) {
  const s = name === "sit" || name === "desk" || name === "write" ? (P as (t: number, s: typeof seat) => object)(0.5, seat) : name === "offer" ? (P as (t: number, h: [THREE.Vector3, THREE.Vector3]) => object)(0.5, [V(-0.15, 0.75, 0.3), V(0.15, 0.75, 0.3)]) : (P as (t: number) => object)(0.5);
  solve(pr, { at: V(0, 0, 0), ...s } as never);
  const iss = contactIssues(pr, { floorAt: () => 0 });
  ok(iss.length === 0, `pose ${name}: solves clean${iss.length ? ` (${iss.map((c) => c.msg).join("; ")})` : ""}`);
}
console.log(bad ? `\n${bad} checks failed` : "\nevery rig check passed");
process.exit(bad ? 1 : 0);
