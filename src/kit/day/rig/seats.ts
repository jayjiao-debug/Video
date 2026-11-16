// SEAT DATA ON FURNITURE: a piece of furniture says where and how it is sat on, in its own frame, once. A shot puts the
// furniture and asks it for the seat (seatOn), so the sitter's hip, knees, back and desk always match the furniture as
// built, wherever it stands and however it is turned. No more seat numbers copied into a shot.
//   const CHAIR_SEAT = chairSeat({ seat: 0.45, d: 0.4, backZ: -0.185, backTop: 0.95 });       // from the chair's own sizes
//   const s = seatOn(CHAIR_SEAT, chairAt, chairYaw, { floor: 0, desk: { at: deskAt, top: 0.76, edgeZ: 0.2 } });
//   r.set({ ...seated(s, t) })                  // verbs.ts seated: the rig's RigSeat fields go through with it
// The rig's short legs dangle on a chair 0.456 m high (rig3d.ts seatFit): that is the house look, not an error;
// contact.ts reports it only when asked (strictSeats).
import * as THREE from "three";
import type { RigSeat } from "../../../videos/group/kit/rig3d";
import type { V3Like } from "../types";
import type { Seat } from "../verbs";

/** where a furniture piece is sat on, in its own frame (origin = its footprint centre on the floor, facing +z):
 *  top = the seat's top height; at = the seat's centre on x / z (default 0, 0); back = how far the hip sits behind
 *  that centre (rig default 0.03); front = centre to front edge; backrest = centre to the back's front face (z, > 0
 *  behind); backTop = the back's top edge height */
export type SeatSpec = { top: number; at?: [number, number]; back?: number; front?: number; backrest?: number; backTop?: number };
/** a chair from its sizes: seat height, depth, the back's z (negative, behind the centre) and its top */
export const chairSeat = (o: { seat: number; d: number; backZ: number; backTop: number }): SeatSpec =>
  ({ top: o.seat, front: o.d / 2, backrest: -o.backZ - 0.02, backTop: o.backTop });
/** a stool or a bench: a top and its depth (no back) */
export const stoolSeat = (o: { seat: number; d: number }): SeatSpec => ({ top: o.seat, front: o.d / 2 });

/** the seat (verbs.ts Seat, and the rig's RigSeat fields) of a furniture piece put at `at`, turned by `yaw` (0 = facing
 *  +z). desk: a desk the sitter faces: its near edge's distance from the seat's centre along the facing, and its top */
export const seatOn = (s: SeatSpec, at: V3Like, yaw = 0, o: { floor?: number; desk?: { edge: number; top: number } } = {}): Seat & RigSeat => {
  const p = Array.isArray(at) ? new THREE.Vector3(at[0], at[1], at[2]) : at.clone();
  const [lx, lz] = s.at ?? [0, 0], c = Math.cos(yaw), sn = Math.sin(yaw);
  const top = new THREE.Vector3(p.x + lx * c + lz * sn, p.y + s.top, p.z - lx * sn + lz * c);
  return {
    top, floor: o.floor ?? p.y, back: s.back ?? 0.03, facing: yaw,
    ...(s.front !== undefined ? { front: s.front } : {}),
    ...(s.backrest !== undefined ? { backrest: s.backrest, backrestTop: p.y + (s.backTop ?? s.top + 0.42) } : {}),
    ...(o.desk ? { deskEdge: o.desk.edge, deskTop: o.desk.top } : {}),
  };
};
