// THE ROAD (place "road", island x 500): the summer road at 沙丘, 210 BC (PLAN 1, 7G): heat, dry grass, the closed
// ornate carriage (辒凉车) with curtained windows, officials queueing at its curtain, baskets of salted fish loaded onto
// its rear rack and onto the baggage cart ahead. NUMBERS ONLY. Owner: WP2. The road runs along z; the carriage faces
// -z (it travels away from the camera), so its REAR (the rack) faces the camera.
import { ISLAND, V, eyeCam, type Stand, type Cam } from "./base";

export const RX = ISLAND.road;
export const ROAD_SET = {
  /** the dry ground */ ground: { x0: RX - 60, x1: RX + 60, z0: -120, z1: 20 },
  /** the road: middle x, width */ road: { x: RX, w: 4.4 },
  /** dry grass tufts: how many, seeded over the ground off the road */ grass: 120,
  /** THE CARRIAGE (辒凉车; origin = the ground under its middle, facing -z): body length (z) / width (x) / the body's
   *  floor and roof, the canopy's top, the wheels (radius, their z offset from the middle, toward the front), the rear
   *  rack (its top, how far it reaches out behind), the window on each side (its middle z offset, width, sill, head) */
  carriage: { len: 3.0, w: 1.7, floor: 0.92, roof: 2.15, top: 2.42, wheel: { r: 0.72, dz: -0.6, track: 2.06 }, rack: { y: 0.82, out: 0.55 }, win: { dz: 0.3, w: 0.72, y0: 1.12, y1: 1.62 } },
  /** the baggage cart ahead of it (where the second load of fish goes): its size and its wheels */ cart: { len: 2.2, w: 1.4, bed: 0.78, side: 0.38, wheel: 0.55 },
  /** the far dunes (沙丘) and the heat band on the horizon */ dunes: { z: -110, y0: -1, y1: 9 },
};
export const ROAD = {
  /** the closed carriage (origin on the ground under its middle, facing -z) */ carriage: V(RX - 0.2, 0, -6.5),
  /** the curtain at its right side (the officials pass the slips through it): the window's middle, 1 cm outside */ curtain: V(RX + 0.66, 1.35, -6.2),
  /** the officials queue beside it, along z */ officials: [V(RX + 1.6, 0, -5.2), V(RX + 1.75, 0, -4.2), V(RX + 1.9, 0, -3.2), V(RX + 2.05, 0, -2.2)],
  /** the baggage cart ahead (the second load of fish; origin on the ground under its middle, facing -z) */ fishCart: V(RX + 0.3, 0, -12.5),
  /** the rack at the carriage's rear: where the attendants set the baskets (its top's middle) */ rack: V(RX - 0.2, 0.82, -4.78),
  /** where two attendants stand to lift the baskets onto the rack */ lifters: [V(RX - 0.75, 0, -3.75), V(RX + 0.35, 0, -3.75)],
};
/** NAMED CAMERAS (her eyes, 1.55 m) */
export const ROAD_CAMS: Record<"stand" | "creep" | "curtain" | "rack", Cam> = {
  /** G01: on the road behind the carriage, the officials' queue on the right */
  stand: eyeCam(RX + 1.0, 2.6, [RX, 1.2, -5]),
  /** the creep toward the closed carriage (start) */
  creep: eyeCam(RX + 0.5, 7.0, [RX - 0.2, 1.3, -6.5]),
  /** G02-G04: close on the curtain, the officials handing in their slips */
  curtain: eyeCam(RX + 2.7, -3.3, [RX + 0.66, 1.3, -6.3]),
  /** G05: the fish baskets on the rear rack */
  rack: eyeCam(RX + 1.1, -1.4, [RX - 0.2, 0.95, -4.9]),
};
export const ROAD_STAND: Stand = { cam: eyeCam(RX + 1.0, 2.6, [RX, 1.2, -5]), emperor: V(RX + 1.2, 0, -2.6), facing: 0 };
