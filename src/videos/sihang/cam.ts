// HER EYES: the kit's camera moves for this film's frame and lens (src/kit/day/cam.ts). She is the camera: eyes 1.5 m.
import { makeCam } from "../../kit/day/cam";
import { FPS, W, H, lensTan } from "./story";

export const EYE = 1.5, FOV = 62;
export const CAM = makeCam({ fps: FPS, W, H, FOV, EYE, lensTan });
export const { keyCam, povCam, handheld, lensCam, punchIn, whip, follow, creep, lean, nudge, toScreen, whipSmear, duck, lower, dip } = CAM;
export type { CamKey } from "../../kit/day/cam";
