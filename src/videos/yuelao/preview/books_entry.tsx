// THE CASE BOOKS BOARD (review only, not part of the film): each pop-up book of scene C on its own in the office, in the
// states of its gag, one state per frame, so the books can be designed and judged before the scene is rebuilt.
//   npx remotion render src/videos/yuelao/preview/books_entry.tsx YuelaoBooks <outdir> --sequence --frames=0-13 --scale=0.5
//   props: { list?: [kind, open, g, t, cam][] }
import React from "react";
import * as THREE from "three";
import { Composition, registerRoot, getInputProps } from "remotion";
import { makeDayFilm } from "../../../kit/day/film";
import { W, H, lineNo } from "../story";
import { World } from "../world";
import type { BookKind } from "../popbook";
import type { Pose } from "../story";

type Row = [BookKind, number, number, number, "close" | "wide"];
const DEFAULT: Row[] = [
  ["niulang", 0, 0, 0, "close"], ["niulang", 0.5, 0, 0, "close"], ["niulang", 1, 0.25, 0, "close"], ["niulang", 1, 0.5, 0.4, "close"], ["niulang", 1, 0.95, 0, "close"],
  ["liangzhu", 1, 0.2, 0, "close"], ["liangzhu", 1, 0.5, 0.3, "close"],
  ["baishe", 1, 0.1, 0, "close"], ["baishe", 1, 0.7, 1.2, "wide"],
  ["baodai", 1, 0.1, 0, "close"], ["baodai", 1, 0.5, 0, "close"], ["baodai", 1, 0.78, 0, "close"],
  ["qixian", 0, 0, 0, "close"], ["qixian", 0.12, 0.3, 0.2, "wide"],
];
const LIST: Row[] = (getInputProps() as { list?: Row[] }).list ?? DEFAULT;
const N = LIST.length;
const AT: [number, number, number] = [-1.0, 1.0, 0.6];
const CAM = {
  close: { pos: [-1.0, 1.06, 1.58], look: [-1.0, 1.02, 0.6], fov: 50 },
  wide: { pos: [-1.0, 1.25, 2.4], look: [-1.0, 1.35, 0.6], fov: 60 },
};
const SEG = {
  id: "X", from: 0, to: N - 1, enter() {}, exit() {},
  pose(w: World, f: number): Pose {
    const [kind, open, g, t, cam] = LIST[Math.min(N - 1, Math.max(0, f))];
    w.setPlace("office"); w.set.param("tangle", 0.46); w.set.param("kpi", 0); w.set.param("smoke", 0);
    const c = CAM[cam];
    w.setCamera(c as never);
    w.update();
    w.props.book(kind).put(new THREE.Vector3(...AT), { yaw: 0 }).set({ open, g, t });
    return { camera: c } as Pose;
  },
};
const Books = makeDayFilm({ name: "yuelao-books", W, H, timeline: [{ id: "X", from: 0, to: N - 1 }], segments: [SEG as never], makeWorld: (gl, cam) => new World(gl, cam), lineNo });
registerRoot(() => <Composition id="YuelaoBooks" component={Books as React.FC} durationInFrames={N} fps={30} width={1080} height={1920} />);
