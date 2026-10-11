import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Figure } from './Figure';
import { WORLDS, Cam, Ctx } from './styles';
import { fit, walk, blend, STAND, POINT, HAUL, HUDDLE, WAVE, Pose, travel, travelAt, travelSmooth, ease, prog, lerp, HANDS, Hand } from './rig';
import { Grain } from '../v13/il/kit';

/* Character style test: the same rig and choreography in four looks.
   Each clip: walk in (feet planted), stop, look up and point at the ship, camera pushes in. */
const CYC = 1.05, CLIP = 6, S = 1.45, X0 = -300;
export const plan = (t: number): Pose => {
  let p = blend(walk(t / CYC + 0.1), STAND, ease(prog(t, 3.3, 3.9)));
  p = blend(p, POINT, ease(prog(t, 3.95, 4.6)));
  const b = Math.max(0, t - 4.6);
  return b > 0 ? { ...p, lean: p.lean + 0.9 * Math.sin(b * 2.4), sN: p.sN + 1.5 * Math.sin(b * 2.4 + 0.6) } : p;
};
const TR = travel(plan, CLIP + 1);
const camAt = (w: (typeof WORLDS)[number], t: number): Cam => {
  const k = ease(prog(t, 2.6, 5.7));
  return { cx: X0 + travelSmooth(TR, t) * S + lerp(270, 200, k), cy: lerp(w.cam0.cy, w.cam1.cy, k), z: lerp(w.cam0.z, w.cam1.z, k) };
};
export const CS_FRAMES = CLIP * 30 * WORLDS.length;
const ZH = '"Noto Serif CJK SC", "Noto Serif SC", serif';

const Label: React.FC<{ i: number; dark?: boolean }> = ({ i, dark }) => {
  const w = WORLDS[i].st, col = dark ? '#f6e7c8' : '#2a2320';
  return (
    <g>
      <text x={70} y={96} fontFamily={ZH} fontSize={26} fill={col} opacity={0.75} letterSpacing={4}>角色画风测试 · {i + 1}/4</text>
      <text x={70} y={150} fontFamily={ZH} fontSize={46} fontWeight={700} fill={col}>{w.id} · {w.name}</text>
      <text x={72} y={188} fontFamily='Georgia, serif' fontSize={24} fontStyle="italic" fill={col} opacity={0.8}>{w.en}</text>
    </g>
  );
};

export const World: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const w = WORLDS[i], cam = camAt(w, t), camEnd = camAt(w, CLIP);
  const prints = TR.prints.map((p) => ({ x: X0 + p.x * S, t: p.t }));
  const c: Ctx = { t, cam, camEnd, prints };
  const BG = w.BG, x = X0 + travelAt(TR, t) * S;
  const zl = cam.z;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>{w.st.defs}</defs>
      <BG c={c} />
      <g transform={`translate(960 540) scale(${zl}) translate(${-cam.cx} ${-cam.cy})`}>
        {w.so > 0 && <ellipse cx={x + (i === 3 ? 150 : 10)} cy={4} rx={i === 3 ? 210 : 90} ry={12} fill={w.shadow} opacity={w.so} />}
        <Figure pose={plan(t)} st={w.st} t={t} x={x} y={0} s={S} />
      </g>
      <BG c={c} fg />
      <Label i={i} dark={i === 1 || i === 3} />
    </svg>
  );
};

export const CharStyles: React.FC = () => {
  const f = useCurrentFrame(), i = Math.min(WORLDS.length - 1, Math.floor(f / (CLIP * 30))), t = (f - i * CLIP * 30) / 30;
  const fade = Math.min(1, t / 0.25, (CLIP - t) / 0.25);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
        <World i={i} t={t} />
        <Grain frame={f} o={0.08} />
      </div>
    </AbsoluteFill>
  );
};

/* Model sheet: the vetted pose set and hand set in one look (the acceptance test for the rig). */
const SHEET_POSES: [string, Pose][] = [['站 stand', STAND], ['走 walk', walk(0.15)], ['指 point', POINT], ['拉 haul', HAUL], ['冷 huddle', HUDDLE], ['挥手 wave', WAVE(0.3)]];
const SHEET_HANDS: [string, Hand][] = [['放松 relax', 'relax'], ['握拳 fist', 'fist'], ['指 point', 'point'], ['张开 open', 'open']];
export const CharSheet: React.FC<{ i: number }> = ({ i }) => {
  const w = WORLDS[i], st = w.st, dark = i === 1 || i === 3;
  const bg = ['#efe2c4', '#f2a34a', '#ede5d4', '#2b2f57'][i], ink = dark ? '#f6e7c8' : '#2a2320';
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg width={1920} height={1080}>
        <defs>{st.defs}<radialGradient id="sh-glow" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#ffe6a8" /><stop offset="1" stopColor="#b5501b" /></radialGradient></defs>
        {i === 1 && <rect width={1920} height={1080} fill="url(#sh-glow)" />}
        <Label i={i} dark={dark} />
        <text x={1850} y={96} textAnchor="end" fontFamily={ZH} fontSize={26} fill={ink} opacity={0.75}>同一套骨骼 · 6 个姿势 · 4 种手</text>
        <line x1={80} x2={1840} y1={640} y2={640} stroke={ink} strokeOpacity={0.25} strokeWidth={2} />
        {SHEET_POSES.map(([name, p], k) => (
          <g key={k}>
            <Figure pose={p} st={st} t={0.4} x={210 + k * 300} y={640} s={1.05} />
            {k === 3 && (() => { const q = fit(p).wN, X = 210 + k * 300 + q[0] * 1.05, Y = 640 + q[1] * 1.05; return <line x1={X - 40} y1={Y - 8} x2={X + 190} y2={Y + 40} stroke={dark ? '#e8c890' : '#6b4a2a'} strokeWidth={6} strokeLinecap="round" />; })()}
            <text x={210 + k * 300} y={690} textAnchor="middle" fontFamily={ZH} fontSize={26} fill={ink}>{name}</text>
          </g>
        ))}
        {SHEET_HANDS.map(([name, h], k) => (
          <g key={k} transform={`translate(${420 + k * 360} 860)`}>
            <circle r={92} fill={dark ? '#ffffff' : '#000000'} opacity={0.07} />
            <g transform="scale(3.3) rotate(-50) translate(-16 0)" filter={st.filter}>
              {HANDS[h].map((d, j) => st.part({ d, mat: 'glove', far: false, k: 'hh' + j }))}
              {st.part({ d: 'M -26 -9 L 2 -10 L 2 10 L -26 9 Z', mat: 'coat', far: false, k: 'cuff' })}
            </g>
            <text y={135} textAnchor="middle" fontFamily={ZH} fontSize={26} fill={ink}>{name}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
