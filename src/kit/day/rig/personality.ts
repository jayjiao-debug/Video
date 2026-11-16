// A CHARACTER'S PERSONALITY PROFILE: how one figure idles, talks and reacts, written once per character instead of in
// every shot. Shots ask the persona for the state and it fills in what makes this character this character: the
// resting face, how often they blink, how restless their eyes are, how much the head moves with their words, how far
// they lean, and which face they pull for each kind of reaction (the rig's expressions, the seven emotes included:
// speechless, gloom, rage, aghast, doze, scheming, laughcry).
//
//   const NT = persona({ name: "newton", rest: "deadpan", energy: 0.25, blinkK: 0.7, restless: 0.2, talkHead: 0.6,
//                         react: { joke: "speechless", praise: "smug", shock: "aghast" } }, VERBS);
//   r.set({ ...NT.idle(f, 2), ...NT.talk(q, f, 2) });                 // standing, saying his line
//   r.set({ ...NT.idle(f, 2), ...NT.mood(f, [[0, "rest"], [line("B07").from, "joke"]]) });   // a reaction, with its change
//
// Pure functions of their arguments (the frame in, a partial RigState out). The face changes go through the rig's
// rigMood (the blink / take / sink changes), so a reaction never cuts from one face to the next.
import { rigMood, rigHeadAdd, type RigHead, type RigMoodHow, type RigState } from "../../../videos/group/kit/rig3d";
import type { Expr } from "../../../videos/group/kit/toon";
import { hash } from "../../../videos/group/story";
import type { Quote } from "../timeline";
import type { makeVerbs } from "../verbs";

/** the kinds of reaction a shot asks for; each character maps them to a face */
export type Reaction = "rest" | "listen" | "pleased" | "laugh" | "joke" | "praise" | "shock" | "fear" | "anger" | "sad" | "tired" | "doubt" | "scheme" | "bored" | "touched";
export type Personality = {
  name: string;
  /** the face at rest (default "neutral") */
  rest?: Expr;
  /** 0 = still and dry .. 1 = lively: scales the head's accents while talking and the idle lean (default 0.5) */
  energy?: number;
  /** blink rate: 1 = the rig's (4-frame blinks every 2.2-4.4 s); 0.6 = a slow, staring character (default 1) */
  blinkK?: number;
  /** 0 = the eyes stay ahead .. 1 = they wander every second or so (default 0.5) */
  restless?: number;
  /** how much the head moves with their words, on top of energy (default 1) */
  talkHead?: number;
  /** a resting lean (degrees: pitch + = forward, roll + = to their left): a stoop, a proud chest (default none) */
  lean?: { pitch?: number; roll?: number };
  /** the face for each reaction (the defaults below fill the rest) */
  react?: Partial<Record<Reaction, Expr>>;
  /** the way the face changes into a reaction (default: the rig picks by the new face) */
  how?: Partial<Record<Reaction, RigMoodHow>>;
};
/** what a reaction looks like when a character says nothing about it */
export const REACT_DEFAULT: Record<Reaction, Expr> = {
  rest: "neutral", listen: "neutral", pleased: "smile", laugh: "laugh", joke: "speechless", praise: "smug", shock: "aghast",
  fear: "nervous", anger: "rage", sad: "sad", tired: "doze", doubt: "gloom", scheme: "scheming", bored: "deadpan", touched: "laughcry",
};

type Verbs = Pick<ReturnType<typeof makeVerbs>, "speak" | "lid">;
const scaleHead = (h: RigHead | undefined, k: number): RigHead | undefined =>
  h && { ...h, dx: h.dx !== undefined ? h.dx * k : undefined, dy: h.dy !== undefined ? h.dy * k : undefined, tilt: h.tilt !== undefined ? h.tilt * k : undefined, scale: h.scale !== undefined ? 1 + (h.scale - 1) * k : undefined, squash: h.squash !== undefined ? h.squash * k : undefined };

export function persona(p: Personality, V: Verbs & { fps?: number }, fps = V.fps ?? 30) {
  const energy = p.energy ?? 0.5, blinkK = p.blinkK ?? 1, restless = p.restless ?? 0.5, talkK = (p.talkHead ?? 1) * (0.4 + 1.2 * energy);
  const face = (r: Reaction | Expr): Expr => (r in REACT_DEFAULT ? (r === "rest" ? p.rest ?? "neutral" : p.react?.[r as Reaction] ?? REACT_DEFAULT[r as Reaction]) : (r as Expr));
  /** where the eyes look at time t: a restless character changes gaze more often and further */
  const gazeAt = (t: number, id: number) => {
    if (restless <= 0) return 0;
    const step = Math.floor(t * (0.3 + 1.2 * restless) + hash(id, 7) * 5);
    const g = [0, 0, 0.5, 0, -0.5, 0, 1, -1][Math.floor(hash(step, id + 3) * (restless > 0.6 ? 8 : 6))];
    return g;
  };
  return {
    profile: p,
    /** the face this character pulls for a reaction */
    face,
    /** standing or sitting still: the resting face, their blinks, their gaze, their lean */
    idle(f: number, id: number): Partial<RigState> {
      const t = f / fps;
      return { expr: face("rest"), blink: V.lid(t * blinkK, id), gaze: gazeAt(t, id), ...(p.lean ? { lean: p.lean } : {}) };
    },
    /** saying a quote: the mouth and blinks of verbs.speak, the head's accents scaled by their energy and talkHead */
    talk<Sp extends string>(q: Quote<Sp>, f: number, id: number, stress?: number[]): Partial<RigState> {
      const s = V.speak(q, f, id, stress);
      return { ...s, head: scaleHead(s.head, talkK) };
    },
    /** their face over time: [frame, reaction or expression][] (from the first key on), changing the rig's way
     *  (rigMood: a blink, a take or a sink by the new face; their own `how` where they have one). `head` adds the
     *  change's head move to a head the shot already has. */
    mood(f: number, keys: [number, Reaction | Expr][], head?: RigHead): Partial<RigState> {
      const ks = keys.map(([at, r]) => ({ at: at / fps, expr: face(r), how: r in REACT_DEFAULT ? p.how?.[r as Reaction] : undefined, amp: energy < 0.3 ? 0.6 : 1 }));
      const m = rigMood(f / fps, ks, fps);
      return { expr: m.expr, ...(m.blink !== undefined ? { blink: m.blink } : {}), head: rigHeadAdd(m.head, head) };
    },
  };
}
export type Persona = ReturnType<typeof persona>;
