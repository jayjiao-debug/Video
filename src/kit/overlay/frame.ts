// overlay/frame.ts: WHERE THINGS MAY SIT (shared kit; src/kit/overlay/README.md). The frame's shape, what the phone app
// draws over it, the free slots round a face, and the check that nothing lands on a face, a caption, the REC display
// or the app's buttons. Geometry only: what a card or a title looks like is the film's own.
//
//   const S = slots(FRAME_9x15, faceRect)[0];             // the largest free slot beside / above / below the face
//   const B = fit({ w: 420, h: 150 }, S.r, { ax: 0 });    // the film's card of 420 x 150 placed in it (shrunk if it must)
//   const faults = checkOverlays(items, { spec: FRAME_9x15, protect: (f) => [...faces(f), ...captions(f)] });
//
// The app's zones were measured on ONE phone (1320 x 2868, Douyin, 14 Nov 2026). Measure again when a screenshot shows a
// different crop, and change the numbers here so every film gets them.
export type Rect = { x0: number; y0: number; x1: number; y1: number };
export type Pt = { x: number; y: number };
export type Zone = { what: string; r: Rect };

export const rectOf = (cx: number, cy: number, w: number, h: number): Rect => ({ x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 });
export const rectW = (r: Rect) => r.x1 - r.x0;
export const rectH = (r: Rect) => r.y1 - r.y0;
export const centre = (r: Rect): Pt => ({ x: (r.x0 + r.x1) / 2, y: (r.y0 + r.y1) / 2 });
export const grow = (r: Rect, d: number): Rect => ({ x0: r.x0 - d, y0: r.y0 - d, x1: r.x1 + d, y1: r.y1 + d });
/** the area two boxes share (0 = clear); `gap` asks for that much air between them */
export const overlap = (a: Rect, b: Rect, gap = 0) =>
  Math.max(0, Math.min(a.x1 + gap, b.x1) - Math.max(a.x0 - gap, b.x0)) * Math.max(0, Math.min(a.y1 + gap, b.y1) - Math.max(a.y0 - gap, b.y0));
export const inside = (a: Rect, b: Rect) => a.x0 >= b.x0 && a.y0 >= b.y0 && a.x1 <= b.x1 && a.y1 <= b.y1;

/** a frame shape and what the phone puts over it */
export type FrameSpec = {
  W: number; H: number;
  /** picture only: nothing that matters within `side` px of the left or right edge */ side: number;
  /** words, cards and effects live between `top` (under the REC display) and `bottom` (above the post's own text) */ top: number; bottom: number;
  /** the REC row and its label row (centre y), and the box the REC display takes */ recY: number; labelY: number; rec: Rect;
  /** what the app draws over the film */ app: Zone[];
  /** the caption band: the widest and tallest the captions may be */ caption: Rect;
};
/** 9:15, 1080 x 1800: the owner's choice for new films (14 Nov 2026). Douyin shows its whole width, with a black bar
 *  above and below, so the phone's clock and part of the post's text fall off the picture. */
export const FRAME_9x15: FrameSpec = {
  W: 1080, H: 1800, side: 54, top: 215, bottom: 1500, recY: 120, labelY: 180, rec: { x0: 54, y0: 85, x1: 1026, y1: 205 },
  app: [
    { what: "the app's back icon", r: { x0: 0, y0: 0, x1: 90, y1: 60 } },
    { what: "the app's search icon", r: { x0: 970, y0: 0, x1: 1080, y1: 60 } },
    { what: "the app's button column", r: { x0: 940, y0: 950, x1: 1080, y1: 1800 } },
    { what: "the post's own text", r: { x0: 0, y0: 1510, x1: 830, y1: 1800 } },
  ],
  caption: { x0: 150, y0: 1270, x1: 930, y1: 1490 },
};
/** 9:16, 1080 x 1920: the films made before 14 Nov 2026. Douyin fills the screen and cuts 57 px off each side. */
export const FRAME_9x16: FrameSpec = {
  W: 1080, H: 1920, side: 110, top: 320, bottom: 1490, recY: 230, labelY: 288, rec: { x0: 58, y0: 195, x1: 1024, y1: 312 },
  app: [
    { what: "the side the app cuts off", r: { x0: 0, y0: 0, x1: 58, y1: 1920 } },
    { what: "the side the app cuts off", r: { x0: 1024, y0: 0, x1: 1080, y1: 1920 } },
    { what: "the app's back icon", r: { x0: 58, y0: 143, x1: 150, y1: 222 } },
    { what: "the app's search icon", r: { x0: 920, y0: 143, x1: 1024, y1: 222 } },
    { what: "the app's button column", r: { x0: 890, y0: 1000, x1: 1080, y1: 1900 } },
    { what: "the post's own text", r: { x0: 58, y0: 1505, x1: 805, y1: 1790 } },
  ],
  caption: { x0: 110, y0: 1270, x1: 890, y1: 1460 },
};

/** the box that words, cards and effects may use on rows y0..y1: the frame's safe band, narrowed where the app's
 *  button column runs beside those rows */
export const free = (spec: FrameSpec, y0 = spec.top, y1 = spec.bottom): Rect => {
  const Y0 = Math.max(y0, spec.top), Y1 = Math.min(y1, spec.bottom);
  let x0 = spec.side, x1 = spec.W - spec.side;
  for (const z of spec.app) {
    if (z.r.y1 <= Y0 || z.r.y0 >= Y1 || rectH(z.r) < 200) continue;          // only the tall columns narrow a row
    if (z.r.x0 > spec.W / 2) x1 = Math.min(x1, z.r.x0 - 10); else x0 = Math.max(x0, z.r.x1 + 10);
  }
  return { x0, y0: Y0, x1, y1: Y1 };
};

export type Slot = { name: "left" | "right" | "above" | "below"; r: Rect; w: number; h: number; /** nothing in `keep` is under it */ clear: boolean };
/** THE FREE SLOTS round a subject (a face box in film px), largest first: beside it, above it, below it down to the
 *  caption band. Each is inside the phone-safe frame and clear of the app's buttons. `keep` = other boxes that must
 *  stay visible (a second face, the body, a prop): a slot that covers one is marked `clear: false` and sorted last.
 *  The slots are ALTERNATIVES and share their corners: when two are used at once, checkOverlays() says if they touch. */
export const slots = (spec: FrameSpec, subject: Rect, o: { gap?: number; reach?: number; keep?: Rect[]; min?: number } = {}): Slot[] => {
  const g = o.gap ?? 24, reach = o.reach ?? 120, min = o.min ?? 80, capTop = spec.caption.y0 - g;
  const ys0 = Math.max(spec.top, subject.y0 - reach), ys1 = Math.min(capTop, subject.y1 + reach);
  const band = (y0: number, y1: number) => free(spec, y0, y1);
  const side = band(ys0, ys1), up = band(spec.top, subject.y0 - g), down = band(subject.y1 + g, capTop);
  const cand: [Slot["name"], Rect][] = [
    ["left", { x0: side.x0, y0: ys0, x1: Math.min(side.x1, subject.x0 - g), y1: ys1 }],
    ["right", { x0: Math.max(side.x0, subject.x1 + g), y0: ys0, x1: side.x1, y1: ys1 }],
    ["above", { x0: up.x0, y0: spec.top, x1: up.x1, y1: subject.y0 - g }],
    ["below", { x0: down.x0, y0: subject.y1 + g, x1: down.x1, y1: capTop }],
  ];
  return cand
    .map(([name, r]) => ({ name, r, w: rectW(r), h: rectH(r), clear: !(o.keep ?? []).some((k) => overlap(r, k) > 0) }))
    .filter((s) => s.w >= min && s.h >= min)
    .sort((a, b) => Number(b.clear) - Number(a.clear) || b.w * b.h - a.w * a.h);
};
/** place a box of w x h in a slot: shrunk to fit if it must (never grown), aligned by ax, ay (0 = left / top,
 *  0.5 = centred, 1 = right / bottom). s = the scale it was given. */
export const fit = (box: { w: number; h: number }, slot: Rect, o: { ax?: number; ay?: number } = {}) => {
  const s = Math.min(1, rectW(slot) / box.w, rectH(slot) / box.h), w = box.w * s, h = box.h * s;
  const x0 = slot.x0 + (rectW(slot) - w) * (o.ax ?? 0.5), y0 = slot.y0 + (rectH(slot) - h) * (o.ay ?? 0.5);
  return { r: { x0, y0, x1: x0 + w, y1: y0 + h } as Rect, s, cx: x0 + w / 2, cy: y0 + h / 2 };
};
/** the two ends of a pointer from a box to a subject: the point on the box's edge nearest the subject, and the point
 *  on the subject's edge nearest the box */
export const pointer = (box: Rect, subject: Rect): { from: Pt; to: Pt } => {
  const c = centre(subject), b = centre(box);
  const from = { x: clampTo(c.x, box.x0, box.x1), y: clampTo(c.y, box.y0, box.y1) };
  const to = { x: clampTo(b.x, subject.x0, subject.x1), y: clampTo(b.y, subject.y0, subject.y1) };
  return { from, to };
};
const clampTo = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// ---------------------------------------------------------------------------------------------------- the check
/** one thing a film draws over the picture: what it is, the frames it shows on, and the box it takes on a frame */
export type Shown = { what: string; kind: "title" | "card" | "effect"; from: number; to: number; rect: (f: number) => Rect | null; scene?: string };
export type Fault = { what: string; f: number; why: string };
export type CheckOptions = {
  spec: FrameSpec;
  /** what must stay visible on frame f: faces, the caption shown, a fact card (the film knows these) */
  protect?: (f: number) => Zone[];
  /** the frame spans that take no cards and no effects: the turn, the emotional scene */
  quiet?: [number, number][];
  /** effects per scene, and the fewest frames between two effects' starts */
  budget?: { perScene?: number; gap?: number };
  /** check every `step` frames (default 2) */
  step?: number;
};
/** THE CHECK: every overlay stays in the phone-safe frame; none sits on the REC display, the app's buttons, a face or a
 *  caption; no two sit on each other; no card or effect falls in a quiet span; the effects keep their budget.
 *  Returns the faults (empty = clean): one per overlay and reason, on the first frame it happens. */
export const checkOverlays = (items: Shown[], o: CheckOptions): Fault[] => {
  const out: Fault[] = [], seen = new Set<string>(), step = Math.max(1, o.step ?? 2), S = o.spec;
  const add = (what: string, f: number, why: string) => { const k = `${what}|${why}`; if (!seen.has(k)) { seen.add(k); out.push({ what, f, why }); } };
  const safe: Rect = { x0: S.side, y0: 0, x1: S.W - S.side, y1: S.bottom };
  const lo = Math.min(...items.map((i) => i.from)), hi = Math.max(...items.map((i) => i.to));
  for (let f = lo; items.length && f <= hi; f += step) {
    const live = items.filter((i) => f >= i.from && f <= i.to).map((i) => ({ i, r: i.rect(f) })).filter((x): x is { i: Shown; r: Rect } => !!x.r);
    if (!live.length) continue;
    const zones = [{ what: "the REC display", r: S.rec }, ...S.app, ...(o.protect ? o.protect(f) : [])];
    live.forEach(({ i, r }, n) => {
      if (!inside(r, safe)) add(i.what, f, "outside the phone-safe frame");
      for (const z of zones) if (overlap(r, z.r) > 0) add(i.what, f, `over ${z.what}`);
      for (let m = n + 1; m < live.length; m++) if (overlap(r, live[m].r) > 0) add(i.what, f, `over ${live[m].i.what}`);
    });
  }
  for (const i of items) {
    if (i.kind === "title") continue;
    for (const [a, b] of o.quiet ?? []) if (i.from <= b && i.to >= a) add(i.what, Math.max(i.from, a), "inside a quiet span (no cards or effects there)");
  }
  const fx = items.filter((i) => i.kind === "effect").sort((a, b) => a.from - b.from);
  if (o.budget?.gap) for (let n = 1; n < fx.length; n++) if (fx[n].from - fx[n - 1].from < o.budget.gap) add(fx[n].what, fx[n].from, `only ${fx[n].from - fx[n - 1].from} frames after ${fx[n - 1].what} (budget: ${o.budget.gap})`);
  if (o.budget?.perScene) {
    const by = new Map<string, Shown[]>();
    for (const i of fx) if (i.scene) by.set(i.scene, [...(by.get(i.scene) ?? []), i]);
    for (const [scene, list] of by) if (list.length > o.budget.perScene) add(list[o.budget.perScene].what, list[o.budget.perScene].from, `effect ${o.budget.perScene + 1} of scene ${scene} (budget: ${o.budget.perScene})`);
  }
  return out;
};
