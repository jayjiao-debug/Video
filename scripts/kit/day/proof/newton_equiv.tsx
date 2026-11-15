// THE ENGINE PROOF, part 1: the kit's day engine (src/kit/day) gives EXACTLY what the Newton film's own copy gives, on
// every frame of the film. Pure functions only (the timeline, the camera moves, the verbs, the caption and vlog HUDs as
// static markup); part 2 (render_compare.sh) compares rendered frames.
//   node scripts/kit/day/proof/run.mjs        (bundles this file with esbuild and runs it)
// Exit code 0 = every check equal; it prints one line per group with the number of values compared.
import * as THREE from "three";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
// ---- Newton's own copy
import * as NS from "../../../../src/videos/newton/story";
import * as NC from "../../../../src/videos/newton/cam";
import * as NV from "../../../../src/videos/newton/shots/common";
import * as NCap from "../../../../src/videos/newton/hud/caption";
import * as NVlog from "../../../../src/videos/newton/hud/vlog";
import * as VOICE from "../../../../src/videos/newton/voice";
import * as CAPS from "../../../../src/videos/newton/captions";
import { JOINS, BEAT, joinClip } from "../../../../src/videos/newton/beats";
import { EN, L } from "../../../../src/videos/newton/lang";
import { HC } from "../../../../src/videos/newton/hud/style";
// ---- the kit
import { makeTimeline } from "../../../../src/kit/day/timeline";
import { makeCam } from "../../../../src/kit/day/cam";
import { makeVerbs } from "../../../../src/kit/day/verbs";
import { makeCaption } from "../../../../src/kit/day/hud/caption";
import { makeVlog } from "../../../../src/kit/day/hud/vlog";

let bad = 0;
const norm = (x: unknown): unknown => {
  if (x instanceof THREE.Vector3) return { x: x.x, y: x.y, z: x.z };
  if (x instanceof THREE.Quaternion) return { qx: x.x, qy: x.y, qz: x.z, qw: x.w };
  if (typeof x === "function") return "fn";
  if (Array.isArray(x)) return x.map(norm);
  if (x && typeof x === "object") { if (React.isValidElement(x)) return renderToStaticMarkup(x as React.ReactElement); const o: Record<string, unknown> = {}; for (const k of Object.keys(x).sort()) o[k] = norm((x as Record<string, unknown>)[k]); return o; }
  return x;
};
const group = (name: string, run: (eq: (what: string, a: unknown, b: unknown) => void) => void) => {
  let n = 0, fails = 0;
  run((what, a, b) => {
    n++;
    const A = JSON.stringify(norm(a)), B = JSON.stringify(norm(b));
    if (A !== B) { fails++; if (fails <= 3) console.log(`  DIFF ${name} ${what}\n    newton: ${A.slice(0, 300)}\n    kit:    ${B.slice(0, 300)}`); }
  });
  bad += fails;
  console.log(`${fails ? "FAIL" : "ok  "} ${name}: ${n} values${fails ? `, ${fails} differ` : ""}`);
};
const FR = Array.from({ length: NS.TOTAL + 20 }, (_, i) => i - 10);

// ------------------------------------------------------------------------------------------------ the timeline
const WHAT = Object.fromEntries(NS.SEGMENTS.map((s) => [s.id, s.what]));
const T = makeTimeline<VOICE.Speaker, NS.SceneId, NS.Place, CAPS.CaptionGroup>({
  voice: VOICE as never, captions: { cap: CAPS.cap, capWord: CAPS.capWord, lineNum: CAPS.lineNum }, L, fps: NS.FPS, what: WHAT,
  clock: { min: NS.SCENE_CLOCK, digits: NS.SCENE_DIGITS, word: { G: ["凌晨", "Small hours"] } },
});
group("timeline tables", (eq) => {
  for (const k of ["SCENES", "SCENE", "SCENE_STAMP", "SCENE_TIME", "LINES", "SPEECH_END", "QUOTES", "TOTAL", "LEAD", "TAIL", "SEGMENTS", "CARDS", "TITLE", "SUBTITLE", "TITLE_BLOCK"] as const)
    eq(k, (NS as Record<string, unknown>)[k], (T as Record<string, unknown>)[k]);
});
group("timeline lookups (every frame)", (eq) => {
  for (const f of FR) { eq(`lineAt ${f}`, NS.lineAt(f), T.lineAt(f)); eq(`lineNo ${f}`, NS.lineNo(f), T.lineNo(f)); eq(`segmentAt ${f}`, NS.segmentAt(f), T.segmentAt(f)); eq(`cardAt ${f}`, NS.cardAt(f), T.cardAt(f)); }
  for (const l of NS.LINES) { eq(`line ${l.n}`, NS.line(l.n), T.line(l.n)); eq(`lineId ${l.id}`, NS.lineId(l.id), T.lineId(l.id)); }
  for (const c of NS.CARDS) eq(`card ${c.id}`, NS.card(c.id), T.card(c.id));
  for (const s of NS.SCENES) eq(`seg ${s}`, NS.seg(s), T.seg(s));
  for (const q of NS.QUOTES) { eq(`quote ${q.line}`, NS.quote(q.who, q.line), T.quote(q.who, q.line)); }
  for (const who of Object.keys(VOICE.SPOKEN) as VOICE.Speaker[]) eq(`quotesOf ${who}`, NS.quotesOf(who), T.quotesOf(who));
  for (const c of CAPS.CAPTIONS) eq(`cap ${c.line}/${c.k}`, NS.cap(c.line, c.k), T.cap(c.line, c.k));
});

// ------------------------------------------------------------------------------------------------ the camera
const C = makeCam({ fps: NS.FPS, W: NS.W, H: NS.H, FOV: NC.FOV, EYE: NC.EYE, lensTan: NS.lensTan, lensH: NS.LENS_H, smearBand: [NS.Y_915, NS.H_915] });
const K1: NC.CamKey[] = [{ f: 0, pos: [0, 1.6, 4], look: [0, 1.5, 0] }, { f: 60, pos: [1.2, 1.6, 3.1], look: [0.3, 1.4, 0], fov: 48 }, { f: 140, pos: [-0.8, 1.55, 2.4], look: [0, 1.2, -1], roll: 0.04 }];
const base = (f: number): NS.CamPose => NC.keyCam(f, K1);
const head = (f: number) => new THREE.Vector3(Math.sin(f / 40), 1.5, Math.cos(f / 50) - 1);
group("camera (every frame of 0..400)", (eq) => {
  for (let f = 0; f <= 400; f++) {
    const c = base(f);
    eq(`keyCam ${f}`, c, C.keyCam(f, K1));
    for (const mood of ["still", "calm", "excited", "scared"] as const) eq(`handheld ${mood} ${f}`, NC.handheld(c, f, { mood, walk: 0.8, seed: 3 }), C.handheld(c, f, { mood, walk: 0.8, seed: 3 }));
    eq(`handheld moods ${f}`, NC.handheld(c, f, { mood: [[0, "calm"], [100, "scared"]], walk: [[0, 0], [120, 1.5]] }), C.handheld(c, f, { mood: [[0, "calm"], [100, "scared"]], walk: [[0, 0], [120, 1.5]] }));
    eq(`povCam ${f}`, NC.povCam(f, K1, { walk: 1 }), C.povCam(f, K1, { walk: 1 }));
    eq(`punchIn ${f}`, NC.punchIn(c, f, 30), C.punchIn(c, f, 30));
    eq(`whip ${f}`, NC.whip(c, f, 90, { dir: 1, to: base(200) }), C.whip(c, f, 90, { dir: 1, to: base(200) }));
    eq(`follow ${f}`, NC.follow(f, head, { back: 1.2 }), C.follow(f, head, { back: 1.2 }));
    eq(`dip ${f}`, NC.dip(c, f, 40, 120), C.dip(c, f, 40, 120));
    eq(`duck ${f}`, NC.duck(c, f, 40, 120), C.duck(c, f, 40, 120));
    eq(`aside ${f}`, NC.aside(c, f, 50, 150, [2, 1.5, 0]), C.aside(c, f, 50, 150, [2, 1.5, 0]));
    eq(`creep ${f}`, NC.creep(c, f, 10, 300, 0.8), C.creep(c, f, 10, 300, 0.8));
    eq(`lean ${f}`, NC.lean(c, f, 60, head(f)), C.lean(c, f, 60, head(f)));
    eq(`handCover ${f}`, NC.handCover(c, f, 70), C.handCover(c, f, 70));
    eq(`lower ${f}`, NC.lower(c, f, 80), C.lower(c, f, 80));
    eq(`nudge ${f}`, NC.nudge(c, { yaw: f / 100, pitch: 0.1, right: 0.2 }), C.nudge(c, { yaw: f / 100, pitch: 0.1, right: 0.2 }));
    eq(`lensK ${f}`, NC.lensK(f, 30, 60), C.lensK(f, 30, 60));
    eq(`whipSmear ${f}`, NC.whipSmear(Math.min(1, f / 200), f % 2 ? 1 : -1), C.whipSmear(Math.min(1, f / 200), f % 2 ? 1 : -1));
    eq(`palm ${f}`, NC.palm(Math.min(1, f / 300)), C.palm(Math.min(1, f / 300)));
    eq(`toScreen ${f}`, NC.toScreen(c, head(f)), C.toScreen(c, head(f)));
    eq(`fromScreen ${f}`, NC.fromScreen(NC.camFrame(c), 300, 900, 2), C.fromScreen(C.camFrame(c), 300, 900, 2));
    eq(`aimCam ${f}`, NC.aimCam([0, 1.6, 3], head(f), 540, 700, 50, 0.02), C.aimCam([0, 1.6, 3], head(f), 540, 700, 50, 0.02));
    eq(`leanStand ${f}`, NC.leanStand(c), C.leanStand(c));
  }
  eq("zoom", [NC.zoomFov(60, 30, 0.3), NC.zoomBy(55, 0.7), NC.zoomFactor(60, 40), NC.leanDist(0.5)], [C.zoomFov(60, 30, 0.3), C.zoomBy(55, 0.7), C.zoomFactor(60, 40), C.leanDist(0.5)]);
});

// ------------------------------------------------------------------------------------------------ the verbs
const VB = makeVerbs({ fps: NS.FPS, EYE: NC.EYE, FOV: NC.FOV, quotes: NS.QUOTES });
group("verbs (every frame)", (eq) => {
  const pts: [number, number, number][] = [[0, 0, 0], [1, 0, 0.5], [1.5, 0, 2], [0, 0, 3]];
  const seat = { top: new THREE.Vector3(0.2, 0.46, -0.1), floor: 0, back: 0.03, facing: 0.3 };
  for (const f of FR) {
    const t = f / NS.FPS, q = NS.QUOTES[(Math.abs(f) >> 5) % NS.QUOTES.length];
    eq(`lid ${f}`, NV.lid(t, 3, [40, 900]), VB.lid(t, 3, [40, 900]));
    eq(`speak ${f}`, NV.speak(q, f, 2), VB.speak(q, f, 2));
    eq(`accent ${f}`, NV.accent("nod", f, 100), VB.accent("nod", f, 100));
    eq(`ky ${f}`, NV.ky(f, [[0, 0], [300, 2], [900, -1]]), VB.ky(f, [[0, 0], [300, 2], [900, -1]]));
    eq(`walkAlong ${f}`, NV.walkAlong(pts, 1.1, t / 3), VB.walkAlong(pts, 1.1, t / 3));
    eq(`seated ${f}`, NV.seated(seat, t, { rise: Math.min(1, t / 20) }), VB.seated(seat, t, { rise: Math.min(1, t / 20) }));
    eq(`kneel ${f}`, NV.kneel(Math.min(1, t / 9), new THREE.Vector3(0, 0, 1)), VB.kneel(Math.min(1, t / 9), new THREE.Vector3(0, 0, 1)));
    eq(`salute ${f}`, NV.salute(Math.min(1, t / 9), new THREE.Vector3(0, 0, 1), 0.4, t), VB.salute(Math.min(1, t / 9), new THREE.Vector3(0, 0, 1), 0.4, t));
    eq(`alive ${f}`, NV.alive(t, 5), VB.alive(t, 5));
    eq(`standing ${f}`, NV.standing(new THREE.Vector3(1, 0, 0), 0.5, f, 4), VB.standing(new THREE.Vector3(1, 0, 0), 0.5, f, 4));
    for (const who of Object.keys(VOICE.SPOKEN) as VOICE.Speaker[]) eq(`saying ${who} ${f}`, NV.saying(who, f), VB.saying(who, f));
    eq(`shake ${f}`, NV.shake(base(f % 300), f, 200), VB.shake(base(f % 300), f, 200));
  }
});

// ------------------------------------------------------------------------------------------------ the HUD
const CAP = makeCaption<VOICE.Speaker, CAPS.CaptionGroup>({ captions: CAPS.CAPTIONS, captionAt: CAPS.captionAt, captionRuns: CAPS.captionRuns, trailingPunct: CAPS.TRAILING_PUNCT, speakerCol: NCap.SPEAKER_COL, joinClip });
group("captions (every frame, as markup)", (eq) => {
  for (const c of CAPS.CAPTIONS) eq(`capLayout ${c.line}/${c.k}`, NCap.capLayout(c.zh, NCap.enShown(c)), CAP.capLayout(c.zh, CAP.enShown(c)));
  for (const f of FR) {
    eq(`capOn ${f}`, NCap.capOn(f), CAP.capOn(f)); eq(`capAlpha ${f}`, NCap.capAlpha(f), CAP.capAlpha(f));
    eq(`Caption ${f}`, renderToStaticMarkup(<NCap.Caption f={f} />), renderToStaticMarkup(<CAP.Caption f={f} />));
  }
});
const VL = makeVlog<NS.SceneId>({ fps: NS.FPS, scenes: NS.SCENES, stamp: NS.SCENE_STAMP, segments: NS.SEGMENTS, segmentAt: NS.segmentAt, en: EN, offAt: BEAT.G.cameraOff, joins: JOINS, wordFrom: NVlog.WORD_FROM });
group("vlog (every frame, as markup)", (eq) => {
  eq("tables", [NVlog.OFF_AT, NVlog.RACES, NVlog.CLOCK_JOINS, NVlog.VLOG_RECT, NVlog.STAMP_AT], [VL.OFF_AT, VL.RACES, VL.CLOCK_JOINS, VL.VLOG_RECT, VL.STAMP_AT]);
  for (const f of FR) {
    eq(`numbers ${f}`, [NVlog.recAlpha(f), NVlog.stampAt(f), NVlog.clockAt(f), NVlog.digitsAlpha(f), NVlog.batteryAt(f), NVlog.vlogRectsAt(f)], [VL.recAlpha(f), VL.stampAt(f), VL.clockAt(f), VL.digitsAlpha(f), VL.batteryAt(f), VL.vlogRectsAt(f)]);
    eq(`VlogHud ${f}`, renderToStaticMarkup(<NVlog.VlogHud f={f} />), renderToStaticMarkup(<VL.VlogHud f={f} />));
    if (f % 7 === 0) eq(`VlogHud rec/cards/lit ${f}`, renderToStaticMarkup(<NVlog.VlogHud f={f} rec={f % 2 === 0} cards={false} lit={0.5} />), renderToStaticMarkup(<VL.VlogHud f={f} rec={f % 2 === 0} cards={false} lit={0.5} />));
  }
  void HC;
});

console.log(bad ? `\n${bad} values differ` : "\nevery value equal: the kit reproduces the Newton film's engine");
process.exit(bad ? 1 : 0);
