// SCENE A · 26 Oct 1937, late night, inside the warehouse. THE COLD OPEN: she has counted them three times (420); she
// asks a boy how many they are; "八百！" Then, lower: "……对外，都讲八百。" The title (an extra slapped on) lands in the
// gap, then the unit's clipping while the men go on walling up the windows with grain sacks; he gives his name: 满仓.
// CAMERA (one take, her eyes):
//   1  A01-A02   a slow pan along the south wall: men hauling sacks under lantern light; her count ticks up to 420
//   2  A03       settles on a boy stacking a sack at the middle window; he turns round
//   3  A04       PUNCH IN on 「八百！」 (his chest out)
//   4  A05       he looks left and right, leans in; she leans in too. The tally lands after the line
//   5  title     he goes back to his sack; the lens eases wide; the title, then the unit's clipping, over the work
//   6  A06       back on him: he pats his sack. His strip; the 真事 seal after the line; whip out
import { seg, line, TITLE_BLOCK, type Segment } from "../story";
import { povCam, punchIn, whip } from "../cam";
import { MANCANG_SACK, LAO, MEN } from "../people";
import { P, ck, put, loopWalk, sit, startOf, endOf, ky, rel, h, frag, sec, win, hit, V } from "./kit";
import { Tally, UnitCard, NameStrip, Fact, Count } from "../hud/skin";

const S = seg("A");
const LANES: [number, number, number][] = [[-5.6, 0, 0.0], [-4.3, 0, 6.5], [-1.7, 0, 3.1], [3.4, 0, 9.2], [5.3, 0, 5.0], [6.4, 0, 12.5]];
export const UNIT = { from: line("A06").from - sec(3.55), to: line("A06").from - 4 };

export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("hall");
    w.set.param("time", "night"); w.set.param("lamp", "south");
    const a03 = startOf("A03"), a04 = startOf("A04"), a05 = startOf("A05"), a06 = startOf("A06"), e05 = endOf("A05"), e06 = endOf("A06");
    const T0 = TITLE_BLOCK.from, T1 = UNIT.to;
    // --- the camera
    let camera = povCam(f, [
      ck("hall", S.from, [0.2, 1.5, 0.9], [-5.2, 1.15, -4.6], 62),
      ck("hall", a03 - 20, [0.5, 1.5, -0.2], [-1.2, 1.2, -5.0], 62),
      ck("hall", a03 + 6, [0.7, 1.48, -0.85], [1.05, 1.1, -3.3], 58),
      ck("hall", a05 - 2, [0.7, 1.48, -0.85], [1.05, 1.1, -3.3], 58),
      ck("hall", a05 + 16, [0.8, 1.42, -1.25], [1.0, 1.14, -3.0], 56),
      ck("hall", e05 + 20, [0.8, 1.42, -1.25], [1.0, 1.14, -3.0], 56),
      ck("hall", T0 + 30, [0.3, 1.5, 0.3], [0.3, 1.2, -5.0], 64),
      ck("hall", T1 - 20, [0.1, 1.5, 0.6], [-0.2, 1.2, -5.0], 64),
      ck("hall", a06 - 2, [0.7, 1.48, -0.9], [1.05, 1.1, -3.3], 58),
      ck("hall", S.to, [0.7, 1.48, -0.9], [1.05, 1.1, -3.3], 58),
    ], { mood: "calm", amp: 0.8, walk: [[S.from, 0.5], [a03 + 6, 0.5], [a03 + 16, 0], [e05 + 20, 0], [T0 + 20, 0.4], [T0 + 34, 0], [a06 - 24, 0.4], [a06 - 4, 0]] });
    camera = punchIn(camera, f, a04 - 1, { k: 0.76, len: 5, off: a05 - 6 });
    const wp = whip(camera, f, S.to - 3, { dir: 1, deg: 30 }); camera = wp.cam;
    w.setCamera(camera);
    // --- the haulers: six men walking sacks from the piles to the windows and back, each in his own lane
    LANES.forEach(([x, , ph], i) => {
      const leg = loopWalk([P("hall", x, 0, 3.4), P("hall", x + 0.25, 0, -4.7), P("hall", x + 0.75, 0, -4.7), P("hall", x + 0.9, 0, 3.4)], 1.05, f / 30 + ph);
      put(w, f, MEN[i % MEN.length], { at: leg.at, facing: leg.facing, id: 20 + i, pose: leg.pose, expr: "calm" }, `h${i}`);
    });
    // 老班长, further along the wall, cleaning nothing yet: he sits and watches (he is scene B's)
    put(w, f, LAO, { at: P("hall", 2.2, 0, -3.36), facing: 0.5, id: 3, expr: "dry", lookDown: 10, more: sit(P("hall", 2.2, 0, -3.36), 0.5, 0.45, f / 30) });
    // --- 满仓: stacking at the window (back to her) -> turned to her -> chest out -> leaning in -> back to work -> his name
    const AT = P("hall", 1.05, 0, -3.3), WALL = P("hall", 0.9, 0, -4.9);
    const turnK = ky(f, [[a03 - 4, 0], [a03 + 8, 1], [e05 + 26, 1], [e05 + 40, 0], [a06 - 22, 0], [a06 - 8, 1]]);
    const inK = ky(f, [[a05 - 2, 0], [a05 + 12, 1], [e05 + 14, 1], [e05 + 26, 0]]);
    const at = WALL.clone().lerp(AT, turnK).add(V(-0.06, 0, 0.3).multiplyScalar(inK));
    const facing = Math.PI * (1 - turnK) + 0.14 * turnK;
    const pat = f >= a06 ? 0.5 + 0.5 * Math.sin((f - a06) * 0.55) : 0;
    const r = put(w, f, MANCANG_SACK, {
      at, facing, id: 1, who: "mc",
      expr: [[S.from, "think"], [a03 + 4, "bright"], [a04 - 2, "loud"], [a05 - 8, "shy"], [e05 + 16, "bright"], [a06 - 4, "proud"]],
      head: f >= a04 - 2 && f < a04 + 14 ? { dy: 0.05 * hit(f, a04 - 2, 14) } : undefined,
      lean: inK > 0.01 ? { pitch: 7 * inK } : f >= a04 && f < a05 - 8 ? { pitch: -5 } : undefined,
      gaze: f >= a05 - 12 && f < a05 + 4 ? (f < a05 - 4 ? -1 : 1) : 0,
      hands: f >= a06 && f <= e06 + 6 ? [rel(at, facing, -0.02, 0.66 + 0.05 * pat, 0.24), null] : undefined,
      pose: turnK < 0.5 ? { kind: "hold", t: f / 30 } as never : undefined,
      more: f >= a04 - 3 && f < a04 + 16 ? { blink: 0 } : undefined,
    });
    void r;
    w.update();
    // --- over the picture: her count, the tally, the unit's clipping, his strip, the seal
    const overlays = frag(
      h(Count, { key: "n", f, from: line("A01").from + 6, to: line("A02").to + 4, n0: 381, n1: 420, x: 540, y: 520 }),
      h(Tally, { key: "t", f, from: e05 + 6, to: T0 - 4, real: 420 }),
      h(UnitCard, { key: "u", f, from: UNIT.from, to: UNIT.to }),
      h(NameStrip, { key: "mc", f, from: a06 + 4, to: e06 + 2, x: 400, y: 560, name: "满仓", sub: "十九岁 · 湖北通城 · 入伍三个月", invented: true }),
      h(Fact, { key: "f", f, from: e06 + 6, to: S.to - 4, y: 600, rows: ["仓库里存着粮食", "兵们拿粮包垒工事"] }),
    );
    return { camera, overlays, post: { bloom: 0.6, ...(wp.post ?? {}) } };
  },
};
void win;
