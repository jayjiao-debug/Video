// SCENE A · 08:00, 天庭姻缘司. THE COLD OPEN. She pushes the door open on a small old god stuck waist-deep in a heap of
// tangled red thread, his back to her, wrestling a knot with a thread in his teeth. 「月老？您被线绑架了？」 He freezes,
// turns: 「别动！一动，三对离婚。」 HIS CARD (the picture freezes; he is lifted into a full moon). Then, with infinite care,
// he draws the last loop through, and it SNAPS in his own hands (离婚 +3). He looks up at her lens: it must be HER
// fault: she is heaven's inspector. He wades out, fawns, will not hear otherwise (懂！暗访。), bows her in, and trots off
// to his desk under THE TITLE.
// CAMERA PLAN (her eyes, one take; 22 s, six moves):
//   open     LOOK AT the heap with a red back in it      wide, he is left of centre, back view     she walks in from the door (the bob)
//   A01      him freezing, turning                        medium                                    she stops: still
//   A02      his face on 「三对离婚」                       close (snap zoom, a third tighter)         lands on 三; the card freezes it
//   snap     the thread parting between his hands         medium, he is on the left third           eased back out after the card; one kick on the snap
//   A03      his face coming to her lens                  medium close                              she gives way half a step as he wades up
//   A05      the bow                                      medium close                              a small tilt down with him
//   title    the whole bureau, him trotting to the desk   wide                                      she steps back and pans right: the place, then the title on it
import { seg, TITLE_BLOCK, type Segment } from "../story";
import { povCam, punchIn } from "../cam";
import { CARD } from "../freeze";
import { P, ck, mouthOf, mouthAt, startOf, endOf, wordAt, ky, rel, V, walkAlong, kick, VERBS, hang, smooth } from "./kit";
import { act, YL, wring, type MoodKey } from "./act";
import { droop, taut, recoil, lay, FLAT } from "./thread";
import { hua, draw, type Fx } from "./fx";

const S = seg("A");
const HEAP = P("office", -0.5, 0, 0.5), NEAR = P("office", -0.3, 0, 1.12);
/** how he stands in the heap when she walks in: side on to the door, bent over his knot (a profile, not a back) */
const PROFILE = -0.62;
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office");
    const a01 = startOf("A01"), a02 = startOf("A02"), a03 = startOf("A03"), a04 = startOf("A04"), a05 = startOf("A05"), e05 = endOf("A05");
    const T0 = TITLE_BLOCK.from, three = wordAt("A02", "三对"), turn0 = a01 + 13, snap = CARD.to + 22;
    const you = wordAt("A03", "您是"), wade0 = you - 8, hushAt = wordAt("A05", "暗访"), bowAt = wordAt("A05", "您记"), go = e05 + 9;
    w.set.param("tangle", ky(f, [[snap, 1], [snap + 6, 0.82], [wade0, 0.82], [wade0 + 34, 0.6], [go, 0.6], [S.to, 0.46]]));
    // ---------------------------------------------------------------------------------------------- the camera
    let camera = povCam(f, [
      ck("office", S.from, [0.22, 1.52, 3.3], [-0.42, 0.78, 0.5], 60),   // (looking down at the heap: the red 缘 on the wall stays above the REC clock)
      ck("office", a01 - 3, [0.12, 1.5, 2.5], [-0.5, 1.0, 0.5], 58),
      ck("office", CARD.to, [0.12, 1.5, 2.5], [-0.5, 1.0, 0.5], 58),
      ck("office", CARD.to + 12, [0.14, 1.5, 2.6], [-0.16, 0.95, 0.5], 58),
      ck("office", wade0, [0.14, 1.5, 2.6], [-0.16, 0.95, 0.5], 58),
      ck("office", wade0 + 36, [0.16, 1.5, 2.95], [-0.3, 1.0, 1.12], 58),
      ck("office", bowAt - 2, [0.16, 1.5, 2.95], [-0.3, 1.0, 1.12], 58),
      ck("office", bowAt + 12, [0.16, 1.48, 2.95], [-0.3, 0.84, 1.12], 58),
      ck("office", e05 + 4, [0.16, 1.48, 2.95], [-0.3, 0.86, 1.12], 58),
      ck("office", T0 + 22, [0.0, 1.52, 3.15], [0.72, 1.2, -1.6], 64),
      ck("office", S.to, [0.0, 1.52, 3.1], [0.74, 1.18, -1.6], 64),
    ], { mood: "calm", amp: 0.6, walk: [[S.from, 0.75], [a01 - 9, 0.75], [a01 - 2, 0], [wade0 + 4, 0], [wade0 + 14, 0.35], [wade0 + 34, 0], [go + 2, 0], [go + 10, 0.3], [T0 + 22, 0]] });
    camera = punchIn(camera, f, three - 5, { k: 0.72, len: 5, off: CARD.to + 9 });
    camera = kick(camera, f, snap, 0.03);
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老
    const trot = f >= go ? walkAlong([NEAR, P("office", 0.85, 0, 0.55), P("office", 1.45, 0, -1.0), P("office", 1.3, 0, -1.84)], 1.8, (f - go) / 30) : null;
    const wade = f >= wade0 ? walkAlong([HEAP, NEAR], 0.72, (f - wade0) / 30, { endFacing: 0.1 }) : null;
    const leg = trot ?? wade;
    const at = leg ? leg.at : HEAP.clone();
    const round = smooth((f - turn0) / 7);                      // he swings round to her
    const facing = leg ? leg.facing : ky(f, [[turn0, PROFILE], [turn0 + 7, 0.16]]);
    const busy = f < turn0, careful = f > CARD.to && f < snap;
    const jig = busy ? Math.sin(f * 0.95) : 0, apart = ky(f, [[CARD.to + 4, 0], [snap - 1, 0.7], [snap, 0.75], [snap + 3, 2.4], [snap + 26, 2.0]]);
    const bowK = ky(f, [[bowAt - 2, 0], [bowAt + 8, 1], [e05 + 2, 1], [e05 + 10, 0]]), hush = f >= hushAt - 4 && f < bowAt - 3;
    const fawnK = ky(f, [[you - 4, 0], [you + 6, 1], [a05 - 6, 1], [a05, 0]]);
    // the knot between his hands in front of his chest; after the snap the hands fly apart, then sink
    const hy = 0.74 + 0.02 * jig - 0.1 * ky(f, [[snap + 10, 0], [snap + 30, 1]]), hx = 0.085 + 0.065 * apart;
    const knot: [ReturnType<typeof V>, ReturnType<typeof V>] = [rel(at, facing, -hx, hy + 0.012 * jig, 0.2), rel(at, facing, hx, hy - 0.012 * jig, 0.2)];
    const hands = f < wade0 - 6 ? knot : fawnK > 0.02 ? wring(at, facing, f, fawnK, 0.7) : undefined;
    const faces: MoodKey[] = [
      [S.from, "bite"], [a01 + 15, "caught", "take"], [a02 - 1, "hiss", "take", 0.8], [wordAt("A02", "一动") - 2, "grave"],
      [CARD.to + 5, "bite"], [snap, "panic", "take"], [a03 - 3, "suspicious"], [you - 1, "fawn"],
      [a04 + 10, "eager"], [a05 - 1, "sly"], [hushAt - 1, "hush"], [bowAt - 1, "fawn"], [go + 4, "proud"],
    ];
    const r = act(w, f, YL, {
      at, facing, faces, pose: leg && leg.moving ? leg.pose : hush ? { kind: "shh", t: f / 30, arm: 1, amount: ky(f, [[hushAt - 4, 0], [hushAt + 3, 1], [bowAt - 9, 1], [bowAt - 3, 0]]) } : undefined,
      hands: bowK > 0.01 || hush ? undefined : hands, show: hush ? ["finger"] : undefined,
      turn: busy ? 1 : f < turn0 + 7 ? 1 - round : trot && f > go + 10 ? ky(f, [[go + 10, 0], [go + 26, 0.9]]) : undefined,
      lookDown: busy ? 12 : careful ? 16 : undefined,
      gaze: busy || careful ? 0 : f >= snap && f < snap + 9 ? 0 : undefined,
      lean: busy ? { roll: 4 * jig, pitch: 6 } : wade && !trot && f < a05 ? { pitch: 7 } : undefined,
      head: f >= a05 && f < a05 + 9 ? VERBS.accent("nod", f, a05 + 1, { amp: 1.2 }) : undefined,
      more: bowK > 0.01 ? VERBS.salute(bowK, at, facing, f / 30) : undefined,
    });
    w.update();
    // ---------------------------------------------------------------------------------------------- the threads
    const h0 = r.handWorld(0), h1 = r.handWorld(1), mid = h0.clone().lerp(h1, 0.5);
    const heapL = rel(HEAP, 0, -0.5, 0.5, 0.22), heapR = rel(HEAP, 0, 0.52, 0.47, 0.1), TH = { r: 0.0065 };
    if (f < snap) {
      // the knot's own thread between his hands (drawn tight as he pulls), the one in his teeth, two from the heap
      w.props.thread("knot", taut(h0, h1, f, [], { sag: 0.012 * (1 - apart) }), { r: 0.0075 });
      w.props.thread("teeth", droop(f < turn0 + 4 ? mouthAt(r, facing) : mouthOf(w, r), mid, 0.1, FLAT, { n: 8 }), TH);
    } else if (f < wade0 + 30) {
      // snapped: each half springs back into its hand and hangs there; the one from his teeth falls with it
      const d = f - snap;
      w.props.thread("knot", recoil(h0, mid.clone().add(V(0, 0.01, 0)), d, FLAT, { n: 6, whip: 0.5 }), { r: 0.0075 });
      w.props.thread("knot2", recoil(h1, mid.clone().add(V(0, 0.01, 0)), d, FLAT, { n: 6, whip: 0.5 }), { r: 0.0075 });
      if (d < 16) w.props.thread("teeth", recoil(mid, mouthOf(w, r), d * 1.4, FLAT, { n: 6 }), TH);
    }
    if (f < wade0 - 6) { w.props.thread("heapL", droop(heapL, h0, 0.16, FLAT), TH); w.props.thread("heapR", droop(heapR, h1, 0.2, FLAT), TH); }
    else if (f < wade0 + 22) { const d = f - (wade0 - 6); w.props.thread("heapL", recoil(heapL, hang(at, facing, 0), d, FLAT), TH); w.props.thread("heapR", recoil(heapR, hang(at, facing, 1), d, FLAT), TH); }
    // one thread snagged on his hem trails after him out of the heap, and slips off as he trots away
    if (f >= wade0 + 8 && f < go + 16) {
      const from = rel(HEAP, 0, 0.1, 0, 0.62), foot = at.clone().add(V(0.05, 0, -0.06));
      w.props.thread("trail", f < go + 4 ? lay([from, foot], FLAT, { wander: 0.03, seed: 4 }) : lay([from, from.clone().lerp(NEAR, 1 - smooth((f - go - 4) / 12))], FLAT, { wander: 0.03, seed: 4 }), TH);
    }
    // ---------------------------------------------------------------------------------------------- over the picture
    const FX: Fx[] = [hua(f, { from: snap + 3, to: snap + 44, text: "离婚 +3", x: 742, y: 566, px: 88, rot: -6 })];
    return { camera, overlays: draw(f, FX), shown: FX, post: { bloom: 0.5 } };
  },
};
