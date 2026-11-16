// HER EYES: the kit's camera moves for this film's frame and lens (src/kit/day/cam.ts). She is the camera: eyes 1.6 m,
// fov 62. A film adds its own first-person things (a mic, her hands) here.
import { makeCam } from "../../kit/day/cam";
import { FPS, W, H, lensTan } from "./story";

export const EYE = 1.6, FOV = 62;
export const CAM = makeCam({ fps: FPS, W, H, FOV, EYE, lensTan });
export const { keyCam, povCam, handheld, punchIn, whip, follow, creep, lean, nudge, toScreen, whipSmear } = CAM;
export type { CamKey } from "../../kit/day/cam";
