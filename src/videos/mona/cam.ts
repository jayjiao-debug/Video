// HER EYES: the kit's camera moves for this film's frame and lens (src/kit/day/cam.ts). She is the camera: eyes 1.5 m.
// The picture hangs at her eye height, so the resting view is level and long (fov 38 from five metres).
import { makeCam } from "../../kit/day/cam";
import { FPS, W, H, lensTan } from "./frame";

export const EYE = 1.5, FOV = 38;
export const CAM = makeCam({ fps: FPS, W, H, FOV, EYE, lensTan });
export const { keyCam, povCam, handheld, punchIn, whip, follow, creep, lean, nudge, toScreen, whipSmear } = CAM;
export type { CamKey } from "../../kit/day/cam";
