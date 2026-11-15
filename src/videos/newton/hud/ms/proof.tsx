// hud/ms/proof.tsx: THE MARKS' PROOF SHEET (stage 1; a still tool, never the film): every mark of hud/ms/marks.tsx on
// one leaf over the frame, so the builders see what each function draws in Remotion's Chrome before they put a piece
// together. Film.tsx draws it on top (under the phone mask) when the input prop asks:
//   --props='{"fx":{"proof":true}}'        all written
//   --props='{"fx":{"proof":9}}'           the write-on at local frame 9 (牛 half written, its pools swelling ...)
// Ids: newton-ms-proof*. A pure function of its props.
import React from "react";
import { AbsoluteFill } from "remotion";
import { MS, MOTION } from "./skin";
import { msDefs, nibFilter, sinkFilter, quill, quillOutline, inkText, serifText, leaf, waxSeal, swash, xMark, manicule, ellipseArc, ellipseLen, ellipsePt, drawOn, writeK, quillLayout } from "./marks";

const P = "newton-ms-proof";
export const MsProof: React.FC<{ t: number }> = ({ t }) => {
  const orbitK = writeK(t, 0, 7), oLen = ellipseLen(300, 92, 200, 520);
  const sun = ellipsePt(540, 470, 300, 92, -8, 200 + 320 * orbitK);
  const nameW = quillLayout("牛顿", 270).width;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          {msDefs(P)}
          {nibFilter(`${P}-nibR`, MS.crimson, MS.edgeCrimson, 270)}
          {nibFilter(`${P}-nibA`, MS.ink, MS.edgeInk, 76, 7)}
          {nibFilter(`${P}-nibA2`, MS.ink, MS.edgeInk, 120, 9)}
          {nibFilter(`${P}-nibR2`, MS.crimson, MS.edgeCrimson, 120, 4)}
          {sinkFilter(`${P}-sink`, 0.62)}
        </defs>
        {leaf(P, `${P}-leaf`, 80, 180, 920, 1300, -1.2, {}, (
          <>
            {/* row 1: the title's marks (A_title): the compass orbit, 采访 / 牛顿 / 的一天 */}
            <path d={ellipseArc(540, 470, 300, 92, -8, 200, 520)} fill="none" stroke="#000" strokeWidth={3} filter={`url(#${P}-inkS)`} {...drawOn(oLen, orbitK)} />
            <circle cx={sun.x} cy={sun.y} r={9} fill={MS.crimson} opacity={orbitK > 0 ? 1 : 0} />
            {quill(`${P}-a`, "采访", 200, 330, 76, `${P}-nibA`, { write: { t, at: 12 }, core: MS.edgeInk, seed: 2 })}
            {quill(`${P}-n`, "牛顿", 540 - nameW / 2, 600, 270, `${P}-nibR`, { write: { t, at: 3, per: MOTION.char }, seed: 1 })}
            {quill(`${P}-b`, "的一天", 880, 700, 76, `${P}-nibA`, { anchor: "end", write: { t, at: 15 }, core: MS.edgeInk, seed: 3 })}
            {/* row 2: the body hand and the numerals */}
            {inkText(`${P}-date`, "1686年5月 · 剑桥三一学院", 160, 800, 34, `${P}-inkAsm`, { write: { t, at: 9 } })}
            {inkText(`${P}-goal`, "今日目标：让他笑一次", 160, 862, 40, `${P}-inkR`, { write: { t, at: 20 } })}
            {serifText(`${P}-n01`, "0/1", 660, 868, 64, { filter: `${P}-inkA` })}
            {serifText(`${P}-pct`, "2%", 820, 868, 64, { filter: `${P}-inkR` })}
            {/* row 3: wax, the cross, the manicule, a swash */}
            {waxSeal(P, `${P}-wax`, 250, 1040, 100, -8, ["冷面", "学神"])}
            {xMark(`${P}-x1`, 470, 1030, 34, `url(#${P}-inkR)`, writeK(t, 4, 6))}
            {xMark(`${P}-x2`, 560, 1030, 34, `url(#${P}-inkR)`, 1)}
            {manicule(P, `${P}-hand`, 880, 1040, 1.1, 0, { k: writeK(t, 9, 8) })}
            {swash(`${P}-sw`, 160, 1180, 640, 1160, 18, 9, `url(#${P}-inkR)`, { k: writeK(t, 0, 10) })}
            {/* row 4: a 花字 on its scrap (quillOutline under the word), and the exit (sinkFilter at 0.62) */}
            <g filter={`url(#${P}-shs)`}><g filter={`url(#${P}-torn2)`}>{quillOutline(`${P}-so`, "拒收", 170, 1400, 120, MS.slip, 22)}</g></g>
            {quill(`${P}-s`, "拒收", 170, 1400, 120, `${P}-nibA2`, { core: MS.edgeInk })}
            <g filter={`url(#${P}-sink)`}>{quill(`${P}-z`, "证毕", 600, 1400, 120, `${P}-nibR2`)}</g>
          </>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
