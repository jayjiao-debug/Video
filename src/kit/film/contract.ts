// THE FILM CONTRACT: what the shared tools (scripts/kit/*) expect of a toon film. Types only: nothing here runs, and a
// film fits it by shape (structural typing), so neither Hongmen nor Arthur had to change to fit it. KIT.md has the story.
import type * as THREE from "three";

/** story.ts must export these (deps.mjs, the clearance checker and the cut read them) */
export interface FilmStory {
  FPS: number;
  /** the film frame in px (1080 x 1920 for a 9:16 film) */
  W: number; H: number;
  /** frames in the film */
  TOTAL: number;
  /** inclusive absolute frames; they cover 0 .. TOTAL - 1 with no gap */
  SEGMENTS: { id: string; from: number; to: number }[];
}

/** what a segment file (shots/segX.ts) exports as SEG */
export interface Segment<W = KitWorld, P = unknown> {
  id: string; from: number; to: number;
  enter?(w: W): void;
  exit?(w: W): void;
  pose(w: W, f: number): P;
}

/** the World the tools drive: build once, then per frame beginFrame(f), seg.pose(w, f), endFrame(P) */
export interface KitWorld {
  root: THREE.Object3D;
  camera: THREE.PerspectiveCamera;
  rc: { figures: unknown[] };
  /** a world point to film px (x, y) and whether it is in frame */
  project(p: unknown): { x: number; y: number; on: boolean };
  update(): void;
  beginFrame(f: number): void;
  endFrame(P: any): void;
  /** the static set and the props layer (each optional: a film without props has none) */
  set?: { group: THREE.Object3D };
  props?: { group: THREE.Object3D };
  /** the current place (island) name, if the film has several */
  place?: unknown;
  /** a prop by name, to move it (the clearance checker's seeds) */
  prop?(name: string): { put(...a: any[]): unknown };
}

/** <film>/kit.world.ts default-exports this: the code hooks of the clearance checker (scripts/kit/qa/clearance) */
export interface FilmHooks<W extends KitWorld = KitWorld> {
  film: string;
  /** story.ts W, H */
  W: number; H: number;
  /** build the real World; canvas is an inert headless proxy (scripts/kit/qa/clearance/stub.js) */
  makeWorld(canvas: any, camera: THREE.PerspectiveCamera): W;
  /** every segment, in film order */
  segments: Segment<W, any>[];
  /** the shot id at a frame (default: the segment's id) */
  shotAt?(f: number): string;
  /** a name for every figure in w.rc.figures (default: figure0, figure1 ...) */
  rigNames?(w: W): Map<unknown, string>;
  /** --seed: film-specific faults put into the scene after the pose (the generic ones are the checker's); log what was
   *  planted and what the checker should report */
  seeds?(w: W, f: number, log: (line: string) => void): void;
  /** meshes whose name matches are left out (default: ink hulls, sky, glows, shadows, flames ...) */
  skipName?: RegExp;
  /** the checker's default output folder */
  out?: string;
}
