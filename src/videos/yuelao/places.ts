// THE PLACES of 采访月老的一天 and where things stand in each: the contract between the set builders and the shots.
// Every place is built round its own island (x = ISLAND[place], floors at y = 0 unless said). All positions below are
// LOCAL to the island. Units: metres. The reporter's eye (the camera) is about 1.5 m above the floor. The rig's figures
// are about 1.27 m tall (head centre 1.05 m): furniture is sized for them (a desk top 0.62, a seat 0.34).
// In every place the camera mostly looks toward -z (the "back wall"); she comes in from +z.
//
// OFFICE  天庭姻缘司, 月老's one-man bureau in heaven: small, warm, crammed, red thread everywhere. Morning light.
// WORK    小满's open-plan office in the mortal world, afternoon going on evening: grey-blue, screens, one tired plant.
// STREET  the pavement in front of her office tower, dusk (scene F) and night (G to J): the glass door at the top of
//         three steps, a small noodle shop's outdoor table to the left, a parked delivery scooter to the right.
export type Place = "office" | "work" | "street";
export const PLACES: Place[] = ["office", "work", "street"];
export const ISLAND: Record<Place, number> = { office: 0, work: 200, street: 400 };
export type V3 = [number, number, number];

/** 天庭姻缘司: the room's inner box and its furniture (all local) */
export const OFFICE = {
  x0: -3.0, x1: 3.0, z0: -2.6, z1: 3.4, h: 3.3,
  /** the round moon window in the back wall (-z): centre and radius; clouds and a pale day moon outside */
  moon: { x: 0.2, y: 1.95, r: 0.85 },
  /** 月老's desk, pushed toward the back wall: centre, top height, size (x by z). He stands or sits BEHIND it (z < desk.z) or beside it */
  desk: { x: 0.35, z: -1.25, top: 0.62, w: 1.5, d: 0.7 },
  /** his stool behind the desk: seat centre and height */
  stool: { x: 0.35, z: -1.95, top: 0.34 },
  /** THE CASE-FILE CABINET: a wall of small square drawers (like a medicine chest) covering the -x wall from z -2.3 to 1.2,
   *  floor to 2.3 m; its front face is at x = cabinetX. Each drawer has a small paper label. Scene C plays in front of it */
  cabinetX: -2.72, cabinet: { z0: -2.3, z1: 1.2, top: 2.3 },
  /** THE KPI BOARD on the +x wall: a wooden notice board, centre (boardX, 1.55, boardZ), 1.3 wide (along z) x 1.0 tall. Its text is a set param */
  boardX: 2.93, board: { z: -0.6, y: 1.55, w: 1.3, h: 1.0 },
  /** the prayer burner: a small bronze incense burner on a low side table (top 0.5) by the +x wall, nearer the door; the prayers arrive as its smoke */
  burner: { x: 2.3, z: 1.0, top: 0.5 },
  /** THE TANGLE: a waist-high heap of tangled red thread on the floor (scene A: he is stuck in the middle of it): centre, radius, height.
   *  The heap is a set param (tangle 0..1 scales its height; 0 hides it) */
  tangle: { x: -0.5, z: 0.5, r: 0.75, h: 0.55 },
  /** the door she comes in by: centre of the +z wall */
  door: { x: 0, z: 3.4 },
} as const;

/** 小满's office floor: the box and her desk */
export const WORK = {
  x0: -5.0, x1: 5.0, z0: -3.0, z1: 4.0, h: 2.9,
  /** the window wall is -z: floor-to-ceiling glass from x0 to x1, the city outside (grey afternoon going blue; lit windows) */
  /** her desk: centre, top, size. She sits BEHIND it (z < desk.z) facing +z (toward the camera), her back to the window,
   *  so we see her face over her laptop. The laptop stands on the desk at (desk.x, top, desk.z + 0.05), its screen's back toward the camera */
  desk: { x: 0, z: -0.9, top: 0.62, w: 1.5, d: 0.7 },
  /** her chair's seat: centre and height (a low office chair with a back) */
  chair: { x: 0, z: -1.55, top: 0.34 },
  /** where 月老 crouches to tie her ankle: at the desk's +x end, beside her chair */
  tie: { x: 1.05, z: -1.35 },
  /** other desks: two rows receding to the left and right with dark monitors, a few chairs; nobody else is in */
} as const;

/** the pavement in front of the tower */
export const STREET = {
  /** the pavement runs along x; the tower's front wall is at z = wallZ (glass and grey stone); the road and the far side of the street are at z > 3 (behind the camera, never seen) */
  wallZ: -3.6,
  /** THE STEPS up to the door: three steps, each 0.17 high and 0.36 deep, 3.2 wide (x -1.6 .. 1.6); the lowest step's front edge at z = -2.0;
   *  the landing (y 0.51) runs from z = -3.08 back to the door */
  steps: { x0: -1.6, x1: 1.6, front: -2.0, rise: 0.17, run: 0.36, n: 3, landingY: 0.51 },
  /** the glass double door: centre x 0, 1.7 wide, 2.3 tall above the landing; warm lobby light behind it. Param door 0..1 slides it open */
  door: { x: 0, w: 1.7, h: 2.3 },
  /** the noodle shop to the left: its lit window in the tower's wall from x -5.2 to -2.2, a red sign over it (面), and ONE small outdoor table:
   *  round top 0.62 high, radius 0.38, at table; two stools (top 0.34) at table.x -+ 0.62 */
  table: { x: -3.3, z: -1.5, top: 0.62, r: 0.38 },
  stools: [{ x: -3.92, z: -1.5, top: 0.34 }, { x: -2.68, z: -1.5, top: 0.34 }],
  /** the delivery scooter, parked at the kerb to the right, a yellow box on its back */
  scooter: { x: 3.0, z: -0.6, yaw: 0.5 },
  /** a street lamp to the right of the steps (its pool of light on the pavement at night) */
  lamp: { x: 2.1, z: -1.9, h: 3.0 },
  /** where 月老 sits in scenes G to I: the lowest step, left part (seat = the step's top, y 0.17) */
  sit: { x: -0.85, z: -2.0 + 0.18, top: 0.17 },
} as const;
