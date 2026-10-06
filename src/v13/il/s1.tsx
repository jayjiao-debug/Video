import React from 'react';
import { W, H, C, F, Txt, Glow, Stars, Moon, Cam, Kid, Clock, Panel, hhmm, sm, life, pop, ease, eo, lerp, clamp, rng, cue, cend, cw, HIT } from './kit';

/* ============ opening: game night → homework → same brain → it's design → three conditions → title ============ */

/** night room, camera = the monitor. dawnK 0..1 turns the window from night to dawn */
export const GameRoom: React.FC<{ T: number; dawnK: number; face: any; mins: number; showClock?: boolean }> = ({ T, dawnK, face, mins, showClock = true }) => {
  const fl = Math.floor(T * 8) % 4, flick = ['teal', 'teal', 'ember', 'sky'][fl];
  return (
    <g>
      <rect width={W} height={H} fill="url(#room)" />
      {/* window */}
      <g>
        <rect x={1180} y={120} width={560} height={470} rx={10} fill={C.n0} />
        <rect x={1196} y={136} width={528} height={438} fill="url(#night)" />
        <rect x={1196} y={136} width={528} height={438} fill="url(#dawn)" opacity={dawnK} />
        <g clipPath="url(#winClip)">
          <Stars T={T} n={40} seed={7} o={1 - dawnK} />
          <g transform={`translate(${1500 + dawnK * 160},${230 + dawnK * 260})`}><Moon x={0} y={0} r={36} /></g>
          <Glow x={1460} y={590} r={260} c="gold" o={dawnK} sy={0.6} />
          {Array.from({ length: 9 }, (_, i) => { const r = rng(i + 3); const h = 70 + r() * 150, x = 1196 + i * 60; return <g key={i}><rect x={x} y={574 - h} width={54} height={h} fill={C.n1} />{Array.from({ length: 8 }, (_, j) => r() > 0.55 && r() > dawnK * 0.9 ? <rect key={j} x={x + 8 + (j % 3) * 15} y={574 - h + 14 + Math.floor(j / 3) * 26} width={8} height={12} fill={C.amber} /> : null)}</g>; })}
        </g>
        <rect x={1456} y={136} width={8} height={438} fill={C.n0} /><rect x={1196} y={350} width={528} height={8} fill={C.n0} />
        <defs><clipPath id="winClip"><rect x={1196} y={136} width={528} height={438} /></clipPath></defs>
        <rect x={1160} y={584} width={600} height={22} rx={6} fill={C.n2} />
      </g>
      {/* poster + shelf for depth */}
      <rect x={180} y={170} width={210} height={280} rx={8} fill={C.n2} /><circle cx={285} cy={290} r={60} fill={C.n3} /><path d="M235,370 L285,250 L335,370 Z" fill={C.ember} opacity={0.7} />
      {/* screen light pooled on the kid */}
      <Glow x={860} y={980} r={720} c={flick} o={0.55} sy={0.75} />
      <Kid x={860} y={640} s={1.55} face={face} light={flick === 'ember' ? C.orange : C.teal} lightO={0.35} T={T} />
      {/* controller in hands */}
      <g transform="translate(860,1000)"><rect x={-170} y={-40} width={340} height={110} rx={50} fill={C.n0} /><circle cx={-90} cy={0} r={18} fill={C.n3} /><circle cx={90} cy={-12} r={12} fill={C.ember} /><circle cx={118} cy={10} r={12} fill={C.amber} />
        <ellipse cx={-110} cy={-36} rx={46} ry={26} fill={C.skin} /><ellipse cx={110} cy={-36} rx={46} ry={26} fill={C.skin} /></g>
      {showClock && <g><rect x={120} y={560} width={330} height={150} rx={20} fill={C.n0} opacity={0.85} />
        <Txt x={285} y={668} s={104} c={dawnK > 0.5 ? C.gold : C.teal} f={F.mono} w={700}>{hhmm(mins)}</Txt></g>}
    </g>
  );
};
/** homework at dusk: lamp, wall clock that barely moves */
export const HomeworkRoom: React.FC<{ T: number; mins: number; sec: number; face: any; digital?: boolean }> = ({ T, mins, sec, face, digital = true }) => {
  const r = rng(11);
  return (
    <g>
      <rect width={W} height={H} fill="url(#warmroom)" />
      <rect x={120} y={110} width={480} height={420} rx={10} fill="#2A1C2C" /><rect x={136} y={126} width={448} height={388} fill="url(#dusk)" />
      <rect x={356} y={126} width={8} height={388} fill="#2A1C2C" />
      <Glow x={1330} y={330} r={620} c="amber" o={0.55} />
      <Clock x={1520} y={260} r={110} min={mins} sec={sec} />
      {/* dust motes drifting slowly in the lamp light */}
      {Array.from({ length: 26 }, (_, i) => { const x = 1000 + r() * 700, y = 120 + r() * 600, dx = Math.sin(T * 0.3 + i) * 20; return <circle key={i} cx={x + dx} cy={y + ((T * 12 + i * 30) % 80)} r={2 + r() * 2} fill={C.gold} opacity={0.35} />; })}
      {/* lamp */}
      <g><path d="M1640,760 L1600,520 L1430,420" stroke={C.n0} strokeWidth={16} fill="none" strokeLinecap="round" /><path d="M1360,380 L1500,330 L1530,430 Z" fill={C.n0} /><ellipse cx={1450} cy={428} rx={70} ry={16} fill={C.gold} opacity={0.8} /><rect x={1590} y={750} width={110} height={22} rx={8} fill={C.n0} /></g>
      <path d="M1380,430 L1560,430 L1800,1080 L1100,1080 Z" fill={C.gold} opacity={0.07} />
      <Kid x={880} y={600} s={1.5} face={face} hood="#5B4A6E" light={C.amber} lightO={0.3} headTilt={-8} chin T={T} />
      {/* hand under chin + desk + book */}
      <ellipse cx={810} cy={738} rx={56} ry={40} fill={C.skin} />
      <rect x={0} y={860} width={W} height={220} fill={C.wood} /><rect x={0} y={860} width={W} height={14} fill={C.wood2} />
      <g transform="translate(980,930) rotate(-4)"><rect x={-220} y={-50} width={440} height={170} rx={8} fill={C.paper} />{[0, 1, 2, 3].map((i) => <rect key={i} x={-190} y={-20 + i * 30} width={300 - i * 40} height={8} rx={4} fill="#CDBF9F" />)}</g>
      {digital && <g><rect x={1380} y={410} width={0} height={0} /><rect x={1390} y={560} width={260} height={100} rx={18} fill={C.n0} opacity={0.85} /><Txt x={1520} y={636} s={70} c={C.amber} f={F.mono}>{hhmm(mins)}</Txt></g>}
    </g>
  );
};

export const Opening: React.FC<{ T: number }> = ({ T }) => {
  const o2 = cue('O2'), o3 = cue('O3'), o4 = cue('O4'), o5 = cue('O5'), o6 = cue('O6');
  // 1 · game: the clock races 23:00 → 06:10; at "一抬头" he looks up at the dawn
  if (T < o2 - 0.08) {
    const up = cw('O1', '一抬头'), k = ease((T - 0.2) / (up + 0.4 - 0.2));
    const mins = 23 * 60 + Math.round(430 * (k ** 1.6));
    const look = T > up + 0.15, face = look ? { eyes: T > up + 0.45 ? 'wide' : 'up', mouth: T > up + 0.45 ? 'o' : 'grin' } : { eyes: 'open', mouth: 'grin' };
    return <Cam s={1.02 + T * 0.02}><GameRoom T={T} dawnK={sm(T, up - 0.1, 0.5)} face={face} mins={mins} /></Cam>;
  }
  // 2 · homework: ten minutes like an hour (the music stops here)
  if (T < o3 - 0.05) {
    const k = clamp((T - o2) / (o3 - o2));
    const sec = Math.floor((T - o2) * 1) + 12;
    return <Cam s={1.05 - k * 0.02}><HomeworkRoom T={T} mins={20 * 60 + (k > 0.85 ? 10 : 0)} sec={sec} face={{ eyes: 'half', mouth: 'sigh' }} /></Cam>;
  }
  // 3 · same you, same brain — side by side; then 不是懒，是设计
  if (T < o5 - 0.1) {
    const kIn = eo((T - o3) / 0.5), gap = 40, pw = (W - 3 * gap) / 2, ph = pw * 0.5625, py = 180 - 60 * (1 - kIn);
    const lazy = cw('O4', '懒'), design = cw('O4', '设计');
    const bp = sm(T, design - 0.2, 0.6);
    return (
      <g>
        <rect width={W} height={H} fill={C.n0} />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${gap + i * (pw + gap)},${py}) scale(${pw / W})`}>
            <defs><clipPath id={`sp${i}`}><rect width={W} height={H} rx={60} /></clipPath></defs>
            <g clipPath={`url(#sp${i})`}>{i === 0 ? <GameRoom T={T} dawnK={1} face={{ eyes: 'wide', mouth: 'o' }} mins={6 * 60 + 10} /> : <HomeworkRoom T={T} mins={20 * 60 + 10} sec={22} face={{ eyes: 'half', mouth: 'sigh' }} />}</g>
            <rect width={W} height={H} rx={60} fill="none" stroke={i ? C.amber : C.teal} strokeWidth={14} />
          </g>
        ))}
        <Txt x={gap + pw / 2} y={py + ph + 84} s={50} c={C.teal} o={kIn}>7 小时 10 分</Txt>
        <Txt x={gap * 2 + pw * 1.5} y={py + ph + 84} s={50} c={C.amber} o={kIn}>10 分钟</Txt>
        {/* not lazy */}
        {T > lazy - 0.1 && <g opacity={1 - sm(T, design - 0.45, 0.2)}><Txt x={W / 2} y={py + ph / 2 + 60} s={190} c={C.cream} w={900} stroke={C.n0}>懒？</Txt>
          <line x1={W / 2 - 200} y1={py + ph / 2 - 10} x2={W / 2 - 200 + 400 * eo((T - lazy - 0.35) / 0.3)} y2={py + ph / 2 - 10} stroke={C.ember} strokeWidth={22} strokeLinecap="round" /></g>}
        {/* blueprint: it's how the thing is designed */}
        {bp > 0 && <g opacity={bp}>
          {Array.from({ length: 25 }, (_, i) => <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={H} stroke={C.sky} strokeOpacity={0.12} strokeWidth={2} />)}
          {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={W} y2={i * 80} stroke={C.sky} strokeOpacity={0.12} strokeWidth={2} />)}
          <rect x={gap - 12} y={py - 12} width={pw + 24} height={ph + 24} fill="none" stroke={C.sky} strokeWidth={3} strokeDasharray="14 10" />
          <rect x={gap * 2 + pw - 12} y={py - 12} width={pw + 24} height={ph + 24} fill="none" stroke={C.sky} strokeWidth={3} strokeDasharray="14 10" />
          <Txt x={W / 2} y={py + ph / 2 + 50} s={150} c={C.gold} w={900} stroke={C.n0}>设计</Txt>
        </g>}
      </g>
    );
  }
  // 4 · psychologists found three conditions — and you can put them into anything
  const k1 = cw('O5', '三个条件'), into = cw('O6', '装进');
  const fly = ease((T - into) / 0.9);
  const objs = [{ x: 480, lab: '作业', c: C.paper }, { x: 960, lab: '练琴', c: C.wood2 }, { x: 1440, lab: '工作', c: C.n3 }];
  const pull = sm(T, cue('T1') + 0.3, HIT - cue('T1') - 0.25);
  return (
    <Cam s={1 + pull * 1.4}>
      <rect width={W} height={H} fill="url(#night)" />
      <Stars T={T} n={120} seed={8} y1={760} />
      <path d="M760,0 L1160,0 L1500,1080 L420,1080 Z" fill={C.gold} opacity={0.06} />
      <Glow x={W / 2} y={420} r={900} c="amber" o={0.22} />
      <path d={`M0,1080 L0,900 ${Array.from({ length: 24 }, (_, i) => `L${i * 84},${900 - ((i * 37) % 5) * 26} L${i * 84 + 70},${900 - ((i * 37) % 5) * 26}`).join(' ')} L1920,900 L1920,1080 Z`} fill={C.n0} />
      <Txt x={W / 2} y={190} s={46} c={C.slate} w={500} o={sm(T, o5, 0.4)}>心理学家找到的</Txt>
      {[0, 1, 2].map((i) => {
        const p = Math.max(0.55 * sm(T, o5, 0.5), pop(T, k1 + i * 0.18)), x0 = 600 + i * 360, y0 = 470, x1 = objs[i].x, y1 = 640;
        const x = lerp(x0, x1, fly), y = lerp(y0, y1, fly) - Math.sin(fly * Math.PI) * 160;
        return <g key={i}>
          <rect x={x0 - 80} y={600} width={160} height={30} rx={8} fill={C.n2} opacity={1 - fly} />
          <g transform={`translate(${x},${y}) scale(${p * (1 - 0.5 * fly)})`}><Glow x={0} y={0} r={190} c="amber" o={0.8} /><circle r={62} fill={C.amber} /><circle r={46} fill={C.gold} /><Txt x={0} y={22} s={64} c={C.n1} w={900} f={F.num}>{i + 1}</Txt></g>
        </g>;
      })}
      {fly > 0 && objs.map((o, i) => (
        <g key={i} opacity={sm(T, into - 0.3, 0.4)} transform={`translate(${o.x},740)`}>
          <Glow x={0} y={-40} r={220} c="gold" o={fly} />
          {i === 0 && <g><rect x={-90} y={-120} width={180} height={230} rx={10} fill={C.paper} />{[0, 1, 2, 3, 4].map((j) => <rect key={j} x={-66} y={-90 + j * 36} width={130 - (j % 2) * 30} height={10} rx={5} fill="#CDBF9F" />)}</g>}
          {i === 1 && <g><ellipse cx={0} cy={40} rx={80} ry={66} fill={C.wood2} /><ellipse cx={0} cy={-30} rx={56} ry={48} fill={C.wood2} /><circle cx={0} cy={20} r={22} fill={C.n0} /><rect x={-10} y={-200} width={20} height={170} fill={C.wood} /></g>}
          {i === 2 && <g><rect x={-120} y={-100} width={240} height={150} rx={12} fill={C.n2} /><rect x={-104} y={-86} width={208} height={120} fill={C.sky} opacity={0.7} /><rect x={-150} y={50} width={300} height={20} rx={8} fill={C.n3} /></g>}
          <Txt x={0} y={170} s={44} c={C.cream}>{o.lab}</Txt>
        </g>
      ))}
    </Cam>
  );
};

/* ============ title on the drop: a river of light across the night ============ */
export const Title: React.FC<{ T: number }> = ({ T }) => {
  const k = T - HIT;
  const r = rng(5);
  const lines = Array.from({ length: 34 }, (_, i) => {
    const off = (i - 17) * 9 + (r() - 0.5) * 6, ph = r() * 6, col = i % 7 === 3 ? C.ember : i % 3 ? C.amber : C.teal;
    const pts = Array.from({ length: 61 }, (_, j) => { const u = j / 60, x = -100 + u * 2120, y = 760 - u * 420 + Math.sin(u * 7 + ph + k * 2.2) * 26 + off; return `${j ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ');
    return <path key={i} d={pts} stroke={col} strokeWidth={i % 5 === 0 ? 3.5 : 1.6} fill="none" opacity={0.25 + 0.6 * (1 - Math.abs(i - 17) / 17)} strokeDasharray={`${2200 * eo(k / 0.7)} 4000`} />;
  });
  const t = pop(T, HIT + 0.05, 0.5);
  return (
    <g>
      <rect width={W} height={H} fill="url(#night)" />
      <Stars T={T} n={140} seed={2} y1={1080} />
      <Glow x={W / 2} y={560} r={900} c="amber" o={0.35} sy={0.5} />
      <g style={{ mixBlendMode: 'screen' }}>{lines}</g>
      <rect x={0} y={900} width={W} height={180} fill={C.n0} />
      <path d={`M0,905 ${Array.from({ length: 25 }, (_, i) => `L${i * 80},${905 - (i % 2) * 8}`).join(' ')} L1920,905 L1920,1080 L0,1080 Z`} fill={C.n0} />
      <g transform={`translate(${W / 2},${470}) scale(${0.85 + 0.15 * t})`} opacity={clamp(t * 1.4)}>
        <Glow x={0} y={-70} r={420} c="gold" o={0.5} sy={0.6} />
        <Txt x={0} y={0} s={230} c={C.cream} w={900} f={F.serif} ls="0.12em">心流</Txt>
        <Txt x={0} y={78} s={30} c={C.gold} w={500} f={F.mono} ls="0.8em">FLOW</Txt>
      </g>
      <g opacity={sm(T, HIT + 0.45, 0.2)} transform={`translate(${W / 2 + 300},${360})`}><rect x={-38} y={-38} width={76} height={76} rx={6} fill={C.ember} /><Txt x={0} y={14} s={36} c={C.cream} f={F.serif} w={900}>流</Txt></g>
      {k < 0.12 && <rect width={W} height={H} fill={C.cream} opacity={1 - k / 0.12} />}
    </g>
  );
};
