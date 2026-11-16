// A BLOCK-OUT SEGMENT (scenes B-G until they are built): the place, the right Napoleon, a still camera.
import { seg, type SceneId, type Place } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, standing, speak, saying, yawTo } from "./common";
import { ISLAND } from "../sets";
import type { Person } from "../people";

export const blockSeg = (id: SceneId, place: Place, who: Person): Segment => {
  const S = seg(id), X = ISLAND[place];
  return {
    id, from: S.from, to: S.to, enter() {}, exit() {},
    pose(w, f) {
      w.setPlace(place);
      const at = V(X + 0.2, 0, -1.8), me = V(X, 1.5, 1.6), q = saying("np", f);
      w.actor(who).set({ ...standing(at, yawTo(at, me), f, 1), ...(q ? speak(q, f, 1) : {}) });
      return { camera: povCam(f, [{ f: S.from, pos: [X, 1.5, 1.8], look: [X + 0.2, 1.3, -1.8], fov: 50 }], {}), slate: "block-out" };
    },
  };
};
