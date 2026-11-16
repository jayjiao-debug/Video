// THE DAY ENGINE's types: the contract between a day film's story, its world, its shots and the film shell. Types only.
// Taken from the day films' story.ts (秦始皇, 苏东坡, 李白, Newton: the same contract in each; this is Newton's, the
// newest). src/kit/day/README.md has the whole engine.
import type React from "react";
import type * as THREE from "three";
import type { GradeParams } from "../../videos/vasa/grade";
import type { CastLight } from "../../videos/group/kit/cast";
import type { EnvSpec } from "../../videos/bt/pbr";

export type Vec3 = [number, number, number];
export type V3Like = Vec3 | THREE.Vector3;
/** a camera pose: camera.up = up ?? (0,1,0); position = pos; lookAt(look); rotateZ(roll ?? 0); fov (vertical, degrees) */
export type CamPose = { pos: V3Like; look: V3Like; fov: number; roll?: number; up?: Vec3; near?: number; far?: number };
export type PostPose = {
  /** depth of field: focus distance (m) and blur-disc radius in px (on the 1080-wide frame) of things at infinity; 0 = off */
  dof?: { focus: number; amount: number } | null;
  /** bloom intensity (threshold 1.0: only emissive / glowing things bloom); default: the place's */
  bloom?: number;
  /** default: the place's grade (PlaceLook.grade), else the film's grade */
  grade?: GradeParams; gradeAmount?: number;
  /** ink outline strength 0..1 (1 = default) */
  ink?: number;
  /** N8AO intensity multiplier (1 = the place's value) */
  ao?: number;
  /** scene.background instead of the place's (a CSS colour) */
  bg?: string;
};
/** what a shot returns for its frame. `X` adds a film's own fields (Newton: title?: Partial<TitlePlace>). */
export type DayPose<X = {}> = {
  camera: CamPose;
  /** [x, z]: where the key light's shadow frustum is centred (default: under the camera's look point) */
  focus?: [number, number];
  /** seconds for the place's own animation (fire flicker, dust, steam): default f / FPS */
  clock?: number;
  /** 2D layer above the 3D picture and the HUD, below the subtitles */
  overlays?: React.ReactNode;
  /** 2D layer above the subtitles (the end's black, a flash) */
  top?: React.ReactNode;
  post?: PostPose;
  /** false hides the subtitle on this frame */
  captions?: boolean;
  /** false hides the whole HUD layer on this frame (the vlog UI, the cards, the title block, the registered HUDs) */
  hud?: boolean;
  /** false hides the fact card and the title block on this frame, and skips the timestamp's big intro */
  cards?: boolean;
  /** false hides her camera's REC lamp and the timestamp on this frame (the battery stays) */
  rec?: boolean;
  /** a debug label for the animatic (drawn only with the input prop slate: true) */
  slate?: string;
} & X;
/** a build segment (= a scene): shots/segX.ts exports SEG */
export type DaySegment<W, P> = {
  id: string;
  /** inclusive absolute frames */
  from: number; to: number;
  enter(w: W): void;
  exit(w: W): void;
  /** pure function of f: pose the world and the camera, return what to show */
  pose(w: W, f: number): P;
};

// ---------------------------------------------------------------------------------------------------- places
export type AO = { aoRadius: number; distanceFalloff: number; intensity: number; color: string };
/** what the engine needs to know about a place besides its meshes */
export type PlaceLook = {
  /** scene.background (a CSS colour) */ bg: string;
  /** N8AO */ ao: AO;
  /** the rig figures' light in this place (BAKED_LIGHT's three values as in every place) */ cast: CastLight;
  /** the bt/pbr fill the place's materials (and its props kit) are lit by */ fill: EnvSpec;
  /** bloom intensity (default: the film shell's) */ bloom?: number;
  /** the place's grade (default: the film's grade) */ grade?: GradeParams;
};
export type ParamValue = number | string | boolean;
/** what a place builder returns */
export type PlaceBuild = {
  group: THREE.Group;
  /** hides what the camera stands behind (the camera's world position) */
  view?(camPos: THREE.Vector3): void;
  /** the place's own motion: a pure function of t (seconds: Pose.clock ?? f / FPS) and the frame f */
  animate?(t: number, f: number): void;
  /** one param of the place (the set calls it only with a known name and a value of the default's kind) */
  setParam?(name: string, value: ParamValue): void;
  /** the figures' light for the CURRENT params and frame (laid over PlaceLook.cast by the World in w.update()) */
  cast?(t: number, f: number): Partial<CastLight>;
};
