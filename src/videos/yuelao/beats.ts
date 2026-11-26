// THE BEATS shots and the timeline graphics share (looked up from the lines, never copied numbers).
import { seg, line } from "./story";

const end = (id: string) => line(id).to, start = (id: string) => line(id).from;
/** the year's target meter: on from 「今年指标，就差一对」 through scene G (off in the quiet scene H), back for the fix */
export const METER = {
  spans: [[start("B06") + 8, seg("G").to - 6], [start("I04") - 10, end("I08") + 20]] as [number, number][],
  /** it shakes at each failure */
  bumps: [end("E05") - 6, end("F05") + 6, start("G05") + 4],
  /** it turns to 达标 when she asks his name */
  done: end("I05") + 8,
};
