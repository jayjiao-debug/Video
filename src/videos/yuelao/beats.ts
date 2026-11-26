// THE BEATS shots and the timeline graphics share (looked up from the lines, never copied numbers).
import { seg, line, type SceneId } from "./story";
import type { VlogJoin } from "../../kit/day/hud/vlog";

const end = (id: string) => line(id).to, start = (id: string) => line(id).from;
/** the year's target meter: on from 「今年指标，就差一对」 through scene G (off in the quiet scene H), back for the fix */
export const METER = {
  // (it makes way for what takes its place in the upper left: the case files of scene C, the order slip of scene D)
  spans: [[start("B06") + 8, seg("C").from - 8], [seg("D").from + 16, start("D04") + 2], [start("D05") - 2, seg("G").to - 34], [start("I04") - 10, end("I08") + 20]] as [number, number][],
  /** it shakes at each failure */
  bumps: [end("E05") - 6, end("F05") + 6, start("G05") + 4],
  /** it turns to 达标 when she asks his name */
  done: end("I05") + 8,
};
/** THE JOINS BETWEEN THE SCENES: one kind each, never the same kind twice running (the series rule).
 *    A > B  clock   08:00 > 08:10: the clock runs on under the title as he sits down to work
 *    B > C  whip    from the KPI board on the right wall round to the cabinet on the left (08:10 > 09:30)
 *    C > D  clock   no cut: he droops by the cabinet while the morning runs away (09:30 > 11:00), then the burner smokes
 *    D > E  match   the spool he thrusts at her lens fills the frame; it comes away in the mortal world
 *    E > F  clock   the afternoon runs away (14:00 > 19:00)
 *    F > G  palm    he covers her lens after the second failure; the hand comes away at night with thread on the lens
 *    G > H  match   up to the moon; down from the moon, later
 *    H > I  clock   no cut: fifteen minutes of silence on the step (22:40 > 22:55)
 *    I > J  none    she simply keeps filming (the clock steps five minutes)                                   */
const J = (n: number, kind: VlogJoin<SceneId>["kind"], scene: SceneId, o: Partial<VlogJoin<SceneId>> = {}): VlogJoin<SceneId> => ({ n, kind, cut: seg(scene).from, scene, first: true, ...o });
export const JOINS: VlogJoin<SceneId>[] = [
  J(1, "clock", "B", { race: [seg("B").from - 12, seg("B").from + 6] }),
  J(2, "whip", "C"),
  J(3, "clock", "D", { race: [seg("D").from - 14, seg("D").from + 10], noCut: true }),
  J(4, "match", "E"),
  J(5, "clock", "F", { race: [seg("F").from - 14, seg("F").from + 6] }),
  J(6, "match", "G"),
  J(7, "match", "H"),
  J(8, "clock", "I", { race: [seg("I").from - 16, seg("I").from + 8], noCut: true }),
  J(9, "match", "J", { noCut: true }),
];
/** the frames of a join by its scene: cut = the incoming scene's first frame */
export const joinOf = (scene: SceneId) => JOINS.find((j) => j.scene === scene)!;
