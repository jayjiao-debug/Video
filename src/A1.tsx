import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { b, cut, bf, prog, easeOut, easeIn, easeInOut, lerp, pop, mulberry, EN, ZH, GOLD, INK } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { GoldTitle } from './Title';
import { Cube2D } from './Kit2D';
import MOL from './molecules.json';

/* A1 (b32–b76), 2D. On the drop the title 《零糖》 is stamped over the tongue (2 s, no separate title card), then the
   sweet receptor as a lock: T1R2 + T1R3 on a cell membrane, each with a "Venus flytrap" top that closes on a molecule.
   Sucrose docks in T1R2's flytrap, the lobes close, a signal leaves the cell: sweet. Then aspartame, far stronger.
   The ladder (US FDA: aspartame 200×, sucralose 600×, advantame 20,000×) and the balance (35 g of sugar ≈ 0.2 g of
   sweetener at 200×, 估算; WHO's example assumes 200–300 mg of aspartame a can). Molecules: RDKit 3D coordinates,
   drawn as rotating ball-and-stick in 2D. Not to scale. */
export const A1_IN = cut(32), A1_OUT = cut(76) - 1e-4;

export const LINES_A1: Line[] = [
  [b(36) + 0.06, b(44) - 0.1, '你的舌头上，有一种"甜味受体"，像一把锁。', 'On your tongue sits a "sweet receptor", like a lock.'],
  [b(44) + 0.06, b(52) - 0.1, '糖分子卡进去，锁合上，大脑收到：[甜]。', 'Sugar slips in, the lock closes, and the brain hears: sweet.'],
  [b(52) + 0.06, b(60) - 0.1, '可是能开这把锁的，不只有糖。', 'But sugar is not the only key.'],
  [b(60) + 0.06, b(68) - 0.1, '阿斯巴甜约[200倍]甜，三氯蔗糖[600倍]。', 'Aspartame is about 200 times as sweet as sugar; sucralose, 600.'],
  [b(68) + 0.06, b(76) - 0.1, '同样的甜，只要[零点几克]。', 'The same sweetness takes a fraction of a gram.'],
];

type Mol = { atoms: [string, number, number, number][]; bonds: [number, number, number][] };
const COL: Record<string, string> = { C: '#4a4f5a', O: '#e0453a', N: '#4a7dff', H: '#eef0f4', Cl: '#5fd06a' };
const RAD: Record<string, number> = { C: 0.62, O: 0.62, N: 0.62, H: 0.42, Cl: 0.75 };

const Molecule2D: React.FC<{ name: string; x: number; y: number; scale: number; ang: number; glow?: number; o?: number }> = ({ name, x, y, scale, ang, glow = 0, o = 1 }) => {
  const m = (MOL as unknown as Record<string, Mol>)[name];
  const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(0.5), st = Math.sin(0.5);
  const P = m.atoms.map(([el, ax, ay, az]) => {
    const x1 = ax * ca + az * sa, z1 = -ax * sa + az * ca; // around y
    const y2 = ay * ct - z1 * st, z2 = ay * st + z1 * ct;  // a fixed tilt
    return { el, x: x1 * scale, y: -y2 * scale, z: z2 };
  });
  const order = P.map((p, i) => i).sort((a, z) => P[a].z - P[z].z);
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      {glow > 0 && <circle r={scale * 7} fill="#f6cf78" opacity={0.18 * glow} />}
      {m.bonds.map(([a, z], i) => <line key={i} x1={P[a].x} y1={P[a].y} x2={P[z].x} y2={P[z].y} stroke="#b9bdc6" strokeWidth={scale * 0.22} strokeLinecap="round" opacity={0.85} />)}
      {order.map((i) => {
        const p = P[i], r = (RAD[p.el] ?? 0.6) * scale, shade = 0.75 + 0.25 * Math.max(-1, Math.min(1, p.z / 4));
        return <g key={i}><circle cx={p.x} cy={p.y} r={r} fill={COL[p.el] ?? '#999'} style={{ filter: `brightness(${shade})` }} /><circle cx={p.x - r * 0.3} cy={p.y - r * 0.35} r={r * 0.32} fill="#fff" opacity={0.45} /></g>;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the receptor
const MEM = 720; // top of the membrane
const Subunit: React.FC<{ x: number; c: [string, string, string]; open: number; glow: number; pulse: number; id: string }> = ({ x, c, open, glow, pulse, id }) => {
  const lobe = (cy: number) => <ellipse cx={0} cy={cy} rx={135} ry={56} fill={`url(#${id}-g)`} stroke={c[2]} strokeWidth={2} />;
  const lit = (yy: number) => Math.max(0, 1 - Math.abs(pulse - yy) * 4); // the signal travelling down: pulse 0 → 1
  return (
    <g transform={`translate(${x},0)`}>
      <defs>
        <radialGradient id={`${id}-g`} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor={c[0]} /><stop offset="1" stopColor={c[1]} /></radialGradient>
        <linearGradient id={`${id}-h`} x1="0" x2="1"><stop offset="0" stopColor={c[1]} /><stop offset="0.4" stopColor={c[0]} /><stop offset="1" stopColor={c[1]} /></linearGradient>
      </defs>
      {/* seven helices through the membrane */}
      {Array.from({ length: 7 }, (_, k) => {
        const hx = (k - 3) * 19;
        return <rect key={k} x={hx - 12} y={MEM - 30} width={24} height={170} rx={12} fill={`url(#${id}-h)`} opacity={k % 2 ? 0.85 : 1} stroke={GOLD} strokeOpacity={lit(0.75 + (k % 3) * 0.05)} strokeWidth={4} />;
      })}
      <ellipse cx={0} cy={MEM - 40} rx={86} ry={28} fill={`url(#${id}-g)`} stroke={c[2]} strokeWidth={2} />
      <rect x={-26} y={530} width={52} height={150} rx={22} fill={`url(#${id}-h)`} stroke={GOLD} strokeOpacity={lit(0.45)} strokeWidth={4} />
      {/* the flytrap: lower lobe fixed, upper lobe hinged at its right end */}
      {lobe(520)}
      <g transform={`rotate(${-open} 112 470)`}>{lobe(420)}</g>
      {glow > 0 && <ellipse cx={-40} cy={470} rx={150} ry={90} fill="#f6cf78" opacity={0.22 * glow} />}
    </g>
  );
};

const R2X = 820, R3X = 1110;
const DOCK = [R2X - 150, 468];
const SU = { in0: b(44), in1: b(46) + 0.2, sig: b(46) + 0.6, out0: b(51), out1: b(52) - 0.1 };
const AS = { in0: b(52) + 0.3, in1: b(54) + 0.5, sig: b(55) };
const along = (T: number, a: number, z: number, from: number[], to: number[]) => {
  const k = easeInOut(prog(T, a, z));
  return [lerp(from[0], to[0], k), lerp(from[1], to[1], k) - 60 * Math.sin(Math.PI * k)];
};

const Receptor: React.FC<{ T: number }> = ({ T }) => {
  const heads = useMemo(() => {
    const r = mulberry(9), out: number[][] = [];
    for (let x = -20; x < 1960; x += 27) { const gap = Math.abs(x - R2X) < 80 || Math.abs(x - R3X) < 80; if (!gap) out.push([x + (r() - 0.5) * 4, r()]); }
    return out;
  }, []);
  const closeSu = easeInOut(prog(T, SU.in1, SU.in1 + 0.4)) * (1 - easeInOut(prog(T, SU.out0, SU.out0 + 0.4)));
  const closeAs = easeInOut(prog(T, AS.in1, AS.in1 + 0.4));
  const open = lerp(24, 6, Math.max(closeSu, closeAs));
  const pulse = T > AS.sig ? prog(T, AS.sig, AS.sig + 1.4) : T > SU.sig ? prog(T, SU.sig, SU.sig + 1.6) : 0;
  const glow = T > AS.sig ? 1.2 : T > SU.sig && T < SU.out0 ? 0.5 : 0;
  const ring = (a: number, s: number) => { const k = prog(T, a + 1.0, a + 2.4); return k > 0 && k < 1 ? <ellipse cx={(R2X + R3X) / 2} cy={MEM + 150} rx={80 + 520 * k} ry={20 + 80 * k} fill="none" stroke={GOLD} strokeWidth={3 * s} opacity={(1 - k) * s} /> : null; };
  const label = easeOut(prog(T, cut(36) + 0.3, cut(37))) * (1 - prog(T, b(43), b(44)));
  const sweet = (a: number, z: number, size: number) => {
    const oo = easeOut(prog(T, a, a + 0.3)) * (1 - prog(T, z - 0.4, z));
    return oo > 0 ? <text x={1560} y={470} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, fill: GOLD }} opacity={oo} transform={`translate(1560,420) scale(${0.85 + 0.15 * pop(T, a, 0.35)}) translate(-1560,-420)`}>甜</text> : null;
  };
  const su = T >= SU.in0 && T < SU.out1 ? (T < SU.out0 ? along(T, SU.in0, SU.in1, [240, 260], DOCK) : along(T, SU.out0, SU.out1, DOCK, [200, 200])) : null;
  const as = T >= AS.in0 ? along(T, AS.in0, AS.in1, [220, 300], DOCK) : null;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="a1-bg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0d0a1c" /><stop offset="0.66" stopColor="#141030" /><stop offset="0.67" stopColor="#1a1436" /><stop offset="1" stopColor="#0a0814" /></linearGradient>
        <radialGradient id="a1-glow" cx="0.45" cy="0.42" r="0.5"><stop offset="0" stopColor="#5a6cff" stopOpacity="0.16" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id="a1-head" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#c4bcff" /><stop offset="1" stopColor="#6b62b4" /></radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#a1-bg)" />
      <rect width={1920} height={1080} fill="url(#a1-glow)" />
      {/* the membrane: two layers of heads with their tails */}
      <rect x={0} y={MEM + 12} width={1920} height={96} fill="#2a2452" opacity={0.8} />
      {heads.map(([x, k], i) => <g key={i}><line x1={x} y1={MEM + 14} x2={x + (k - 0.5) * 8} y2={MEM + 56} stroke="#5d55a0" strokeWidth={2} /><line x1={x} y1={MEM + 106} x2={x - (k - 0.5) * 8} y2={MEM + 64} stroke="#5d55a0" strokeWidth={2} /><circle cx={x} cy={MEM} r={13} fill="url(#a1-head)" /><circle cx={x} cy={MEM + 120} r={13} fill="url(#a1-head)" opacity={0.8} /></g>)}
      <text x={60} y={MEM - 30} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.45)' }}>细胞外</text>
      <text x={60} y={MEM + 190} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.45)' }}>细胞内</text>
      <Subunit x={R3X} c={['#c7a6ff', '#6c43b8', '#e2d2ff']} open={6} glow={glow * 0.3} pulse={pulse} id="a1t3" />
      <Subunit x={R2X} c={['#8ff0de', '#239b8c', '#c9fff4']} open={open} glow={glow} pulse={pulse} id="a1t2" />
      {ring(SU.sig - 1.0, 0.6)}{ring(AS.sig - 1.0, 1)}
      {su && <Molecule2D name="sucrose" x={su[0]} y={su[1]} scale={11} ang={T * 0.9} glow={T > SU.sig ? 0.6 : 0} />}
      {as && <Molecule2D name="aspartame" x={as[0]} y={as[1]} scale={11} ang={T * 0.8 + 1} glow={T > AS.sig ? 1 : 0} />}
      {su && T > SU.in1 - 0.5 && T < SU.out0 && <text x={DOCK[0]} y={DOCK[1] - 110} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: GOLD }}>蔗糖</text>}
      {as && T > AS.in1 - 0.5 && <text x={DOCK[0]} y={DOCK[1] - 110} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: GOLD }}>阿斯巴甜</text>}
      {sweet(SU.sig + 0.3, SU.out0 + 0.2, 150)}{sweet(AS.sig + 0.3, b(60), 230)}
      <g opacity={label}>
        <text x={R2X - 175} y={310} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: INK }}>T1R2</text>
        <text x={R3X + 175} y={310} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: INK }}>T1R3</text>
        <path d={`M${R2X - 120},255 L${R2X - 120},235 L${R3X + 120},235 L${R3X + 120},255`} fill="none" stroke={GOLD} strokeWidth={2} />
        <text x={(R2X + R3X) / 2} y={215} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 38, fill: GOLD, letterSpacing: '0.12em' }}>甜味受体</text>
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- the tongue under the title
const Tongue2D: React.FC = () => {
  const p = useMemo(() => {
    const r = mulberry(4), out: { x: number; y: number; s: number; f: boolean }[] = [];
    for (let i = 0; i < 520; i++) { const d = Math.pow(r(), 1.4); const y = 470 + d * 620; out.push({ x: r() * 1920, y, s: 3 + d * 22, f: r() < 0.06 }); }
    return out.sort((a, z) => a.y - z.y);
  }, []);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="tg-bg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1a0710" /><stop offset="0.42" stopColor="#3a1020" /><stop offset="0.43" stopColor="#b84a5e" /><stop offset="1" stopColor="#7a2236" /></linearGradient>
        <radialGradient id="tg-light" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stopColor="#ffd6d6" stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#tg-bg)" />
      <path d="M0,470 Q480,430 960,455 T1920,460 L1920,1080 L0,1080 Z" fill="#c4566a" />
      {p.map((q, i) => q.f
        ? <g key={i}><ellipse cx={q.x} cy={q.y} rx={q.s * 1.6} ry={q.s * 0.9} fill="#d8485e" /><ellipse cx={q.x - q.s * 0.4} cy={q.y - q.s * 0.3} rx={q.s * 0.5} ry={q.s * 0.25} fill="#fff" opacity={0.5} /></g>
        : <g key={i}><ellipse cx={q.x} cy={q.y} rx={q.s * 0.6} ry={q.s * 0.8} fill="#e48a9a" /><ellipse cx={q.x - q.s * 0.15} cy={q.y - q.s * 0.35} rx={q.s * 0.2} ry={q.s * 0.15} fill="#fff" opacity={0.45} /></g>)}
      <rect width={1920} height={1080} fill="url(#tg-light)" />
    </svg>
  );
};

const LADDER: [string, number, string][] = [['蔗糖', 1, '×1'], ['阿斯巴甜', 200, '×200'], ['三氯蔗糖', 600, '×600'], ['爱德万甜', 20000, '×20,000']];

export const A1: React.FC<{ T: number }> = ({ T }) => {
  if (T < A1_IN || T > A1_OUT) return null;
  const shot = T < cut(36) ? 'title' : T < cut(60) ? 'lock' : T < cut(68) ? 'ladder' : 'balance';
  const XL = 300, WL = 1100;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0716' }}>
      {shot === 'title' && (
        <>
          <Tongue2D />
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(5,6,11,0.72), rgba(5,6,11,0.25) 75%)' }} />
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <text x={960} y={360} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={easeOut(prog(T, cut(32) + 0.2, cut(33)))}>ZERO SUGAR · 甜 味 剂</text>
            <GoldTitle text="零糖" T={T} at={cut(32)} size={170} y={560} id="a1t" />
            <text x={960} y={660} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: INK, letterSpacing: '0.08em' }} opacity={easeOut(prog(T, b(34), b(34) + 0.4))}>答案，在你的舌头上</text>
          </svg>
        </>
      )}
      {shot === 'lock' && <Receptor T={T} />}
      {shot === 'ladder' && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <defs><radialGradient id="a1-lg" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stopColor="#f6cf78" stopOpacity="0.08" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
          <rect width={1920} height={1080} fill="#0b0a14" /><rect width={1920} height={1080} fill="url(#a1-lg)" />
          <text x={XL} y={200} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 36, fill: INK }}>甜度：以蔗糖为 1</text>
          {[1, 10, 100, 1000, 10000].map((v) => {
            const x = XL + 150 + (Math.log10(v) / Math.log10(20000)) * WL;
            return <g key={v}><line x1={x} x2={x} y1={240} y2={700} stroke="rgba(243,237,226,0.14)" strokeDasharray="4 6" /><text x={x} y={736} textAnchor="middle" style={{ fontFamily: EN, fontSize: 26, fill: 'rgba(243,237,226,0.5)', fontVariantNumeric: 'lining-nums' }}>{v.toLocaleString('en-US')}</text></g>;
          })}
          {LADDER.map(([name, v, lab], i) => {
            const grow = easeOut(prog(T, cut(60) + 0.15 + i * 0.45, cut(60) + 0.75 + i * 0.45));
            const w = Math.max(10, (Math.log10(v) / Math.log10(20000)) * WL) * grow, y = 280 + i * 105;
            return (
              <g key={name}>
                <text x={XL + 130} y={y + 38} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 36, fill: i === 0 ? 'rgba(243,237,226,0.75)' : INK }}>{name}</text>
                <rect x={XL + 150} y={y} width={w} height={56} fill={i === 0 ? '#e9e4da' : GOLD} opacity={i === 0 ? 0.8 : 0.92} />
                <text x={XL + 170 + w} y={y + 42} style={{ fontFamily: EN, fontWeight: 700, fontSize: 44, fill: i === 0 ? INK : GOLD, fontVariantNumeric: 'lining-nums' }} opacity={grow}>{lab}</text>
              </g>
            );
          })}
          <text x={XL} y={790} style={{ fontFamily: ZH, fontSize: 20, fill: 'rgba(243,237,226,0.45)' }}>对数刻度 · 甜度倍数：美国食品药品管理局（FDA）</text>
        </svg>
      )}
      {shot === 'balance' && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <defs><radialGradient id="a1-bl" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stopColor="#ffcf8a" stopOpacity="0.14" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
          <rect width={1920} height={1080} fill="#0b0a14" /><rect width={1920} height={1080} fill="url(#a1-bl)" />
          <text x={960} y={200} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 44, fill: INK, letterSpacing: '0.12em' }}>一样甜</text>
          <rect x={955} y={300} width={10} height={380} fill="#c8a25a" /><rect x={860} y={676} width={200} height={14} rx={7} fill="#c8a25a" />
          <rect x={560} y={296} width={800} height={10} rx={5} fill="#e2c27e" /><circle cx={960} cy={300} r={16} fill="#f6cf78" />
          {[640, 1280].map((x) => <g key={x}><line x1={x} y1={306} x2={x - 120} y2={480} stroke="#c8a25a" strokeWidth={2} /><line x1={x} y1={306} x2={x + 120} y2={480} stroke="#c8a25a" strokeWidth={2} /><path d={`M${x - 150},480 Q${x},540 ${x + 150},480 Z`} fill="#c8a25a" /></g>)}
          {Array.from({ length: 9 }, (_, k) => <Cube2D key={k} x={640 + ((k % 3) - 1) * 30} y={482 - Math.floor(k / 3) * 30} s={30} />)}
          {Array.from({ length: 7 }, (_, k) => <circle key={k} cx={1280 + (k - 3) * 4} cy={474 - (k % 2) * 3} r={2.6} fill="#fbf7ef" />)}
          <text x={640} y={610} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 68, fill: INK, fontVariantNumeric: 'lining-nums' }}>35<tspan fontFamily={ZH} fontSize={34}> 克蔗糖</tspan></text>
          <text x={1280} y={610} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 68, fill: GOLD, fontVariantNumeric: 'lining-nums' }}>≈0.2<tspan fontFamily={ZH} fontSize={34}> 克甜味剂</tspan></text>
          <text x={1280} y={652} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.55)' }}>按阿斯巴甜 200 倍估算</text>
        </svg>
      )}
      <SubBand />
      {shot !== 'title' && <Chapter T={T} at={cut(36)} out={cut(76)} text="舌 头 上 的 锁" />}
      <Subs T={T} lines={LINES_A1} />
    </AbsoluteFill>
  );
};

