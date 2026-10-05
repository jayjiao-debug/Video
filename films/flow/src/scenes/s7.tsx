import React from 'react';
import {b, clamp, inOut, keys, mulberry, prog} from '../lib';
import {SANS} from '../look';
import {anim, Create, M, Write} from '../m3';

/* S7 (b185–b209): the brain, hedged. A brain outline draws itself; the dorsolateral prefrontal patch
   (schematic) is shaded blue and dims; on the right a keyboard where a dot improvises (Limb & Braun
   2008, six jazz pianists in fMRI); a "self-monitoring" meter falls; the self dot fades. */
const W = 1920;
const H = 1080;
const BRAIN = 'M 520 540 C 450 470, 470 330, 560 280 C 640 220, 780 190, 900 215 C 1010 230, 1090 300, 1100 400 C 1110 470, 1080 520, 1030 545 C 1010 600, 940 620, 880 590 C 800 610, 700 610, 640 585 C 590 590, 545 575, 520 540 Z';
const SULCI = ['M 640 300 C 690 340, 680 410, 740 440', 'M 780 240 C 800 300, 860 330, 850 400', 'M 930 250 C 950 320, 1000 340, 1010 420', 'M 600 480 C 680 470, 760 520, 860 500', 'M 880 590 C 900 560, 960 560, 1000 540'];
const KEYS = 14;
const KX = 1200;
const KY = 600;
const KW = 40;
export const NOTES = (() => {
  const r = mulberry(70);
  let k = 7;
  return Array.from({length: 64}, (_, i) => {
    k = Math.max(0, Math.min(KEYS - 1, k + Math.round((r() - 0.5) * 5)));
    return {t: b(186) + i * 0.33 + (r() - 0.5) * 0.08, k};
  });
})();

export const S7: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(185), b(209), 0.45, 0.45);
  const outline = anim(T, b(185), 1.6);
  const pfc = keys(T, [[b(186.5), 0], [b(188), 0.55], [b(194), 0.55], [b(200), 0.12]]);
  const meter = keys(T, [[b(193), 5], [b(200), 1]]);
  const self = 1 - prog(T, b(203), b(207));
  let note = NOTES[0];
  for (const n of NOTES) if (T >= n.t) note = n;
  const since = T - note.t;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="brainClip">
            <path d={BRAIN} />
          </clipPath>
        </defs>
        <rect x={440} y={180} width={230} height={260} fill={M.blue} fillOpacity={pfc} clipPath="url(#brainClip)" />
        <Create d={BRAIN} p={outline} color={M.white} w={4} />
        {SULCI.map((d, i) => (
          <Create key={i} d={d} p={anim(T, b(186) + i * 0.15, 1)} color={M.grey} w={3} />
        ))}
        {/* keyboard */}
        {Array.from({length: KEYS}, (_, k) => (
          <Create key={k} d={`M ${KX + k * KW} ${KY} L ${KX + (k + 1) * KW} ${KY} L ${KX + (k + 1) * KW} ${KY + 150} L ${KX + k * KW} ${KY + 150} Z`} p={anim(T, b(186) + k * 0.03, 0.8)} color={M.white} w={2} />
        ))}
        {T > b(186) ? (
          <>
            <rect x={KX + note.k * KW + 2} y={KY + 2} width={KW - 4} height={146} fill={M.yellow} opacity={0.5 * Math.exp(-since * 4)} />
            <circle cx={KX + note.k * KW + KW / 2} cy={KY - 30 - 50 * Math.sin(clamp(since / 0.33) * Math.PI)} r={10} fill={M.yellow} />
          </>
        ) : null}
        {/* the self-monitoring meter */}
        {Array.from({length: 5}, (_, k) => (
          <rect key={k} x={1200 + k * 44} y={300 - k * 18} width={30} height={60 + k * 18} fill={k < meter ? M.blue : 'none'} fillOpacity={0.7} stroke={M.blue} strokeWidth={2} opacity={anim(T, b(193), 0.6)} />
        ))}
        <circle cx={780} cy={420} r={12} fill={M.white} opacity={self * anim(T, b(201), 0.5)} />
      </svg>
      <Write p={anim(T, b(187.5), 0.8)} color={M.blue} style={{left: 300, top: 160}}>
        <span style={{fontFamily: SANS, fontSize: 28}}>背外侧前额叶（示意）</span>
      </Write>
      <Write p={anim(T, b(187), 0.8)} style={{left: KX, top: KY + 170}}>
        <span style={{fontFamily: SANS, fontSize: 26}}>即兴演奏</span>
      </Write>
      <Write p={anim(T, b(193.5), 0.8)} color={M.blue} style={{left: 1200, top: 390}}>
        <span style={{fontFamily: SANS, fontSize: 26}}>“自我监控”</span>
      </Write>
      <Write p={anim(T, b(201.5), 0.8)} style={{left: 740, top: 450}}>
        <span style={{fontFamily: SANS, fontSize: 28}}>我</span>
      </Write>
      <div style={{position: 'absolute', right: 52, bottom: 30, fontFamily: SANS, fontSize: 18, color: 'rgba(255,255,255,0.4)'}}>Limb & Braun, PLoS ONE, 2008 · n = 6 · 研究提示，并非定论</div>
    </div>
  );
};
