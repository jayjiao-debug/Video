/* S08 · after (65.206 – 73.304). The build slam cuts to home at night, at full blaze: the bag on a lacquered table
   beside its open box and tissue, a fan of gold rays on the wall behind it, foil confetti falling and settling.
   The camera punches in on the clasp, then pulls back and arcs to show the window: a city at night, a cool moon.
   On four build hits (69.257, 70.775, 71.534, 72.8) the gold rays switch off a quarter at a time; the warm key
   cools to blue and the moonlight through the window takes over, throwing the window bars across the bag. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { prog, easeOut, impulse, swing, clamp, lerp } from '../scene';
import { HeroBag, Cut, rect, ring } from '../foil';
import { MirrorFloor, Beam } from '../kit';
import { strokePath, quadPts, useGlow, Box, CutM, rectHole } from './S06_lib';
import { Spot, DIAMOND } from './S06_waiting';

const OFF = [69.257, 70.775, 71.534, 72.8];
const BAG_X = -0.14, TOP = 0.228;
/* the window opening on the wall (m) */
const WIN = { x0: 0.36, x1: 0.96, y0: 0.36, y1: 1.12 };
const ORIGIN: [number, number] = [BAG_X, 0.4];
/* one ray (px, around the origin) */
const ray = (a: number, r0: number, r1: number, w: number) => {
  const p = (r: number, s: number) => `${(Math.cos(a + s) * r).toFixed(1)} ${(Math.sin(a + s) * r).toFixed(1)}`;
  return `M ${p(r0, -w * 0.25)} L ${p(r1, -w)} L ${p(r1, w)} L ${p(r0, w * 0.25)} Z`;
};
const NR = 40, A0 = Math.PI * 0.985, A1 = Math.PI * 1.6;
const RAYS = [0, 1, 2, 3].map((g) => Array.from({ length: NR }, (_, i) => i).filter((i) => (i * 7) % 4 === g)
  .map((i) => ray(A0 + ((A1 - A0) * i) / (NR - 1), 230, 2600, i % 2 ? 0.006 : 0.011)).join(' '));
const SUN = ring(0, 0, 175, 190) + ' ' + ring(0, 0, 140, 144);

/* a little city, two layers, with lit windows */
let rs = 5; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
const city = (x0: number, x1: number, hMin: number, hMax: number, base: number) => {
  let x = x0; const blds: string[] = [], warm: string[] = [], cool: string[] = [];
  while (x < x1) {
    const w = 50 + rnd() * 90, h = hMin + rnd() * (hMax - hMin);
    blds.push(rect(x, -base - h, w, h + base + 40));
    if (rnd() > 0.6) blds.push(rect(x + w * 0.4, -base - h - 40 - rnd() * 40, 6, 80));
    for (let yy = base + 20; yy < base + h - 20; yy += 26) for (let xx = x + 10; xx < x + w - 14; xx += 20) {
      const r = rnd(); if (r < 0.16) warm.push(rect(xx, -yy, 8, 11)); else if (r < 0.24) cool.push(rect(xx, -yy, 8, 11));
    }
    x += w + 6 + rnd() * 14;
  }
  return { b: blds.join(' '), warm: warm.join(' '), cool: cool.join(' ') };
};
const FAR = city(-200, 1600, 120, 420, 0), NEAR = city(-100, 1500, 60, 300, 0);

/* the confetti of the purchase: falls on the slam, lands on the table or the floor, lies still */
const CONF = Array.from({ length: 30 }, (_, i) => {
  const h = (k: number) => { const s = Math.sin((i + 1) * (k + 3) * 12.9898) * 43758.5453; return s - Math.floor(s); };
  const x = -0.7 + h(1) * 1.4, z = -0.28 + h(2) * 0.6, y0 = 0.75 + h(3) * 0.7, v = 0.45 + h(4) * 0.35;
  const onTable = Math.abs(x - (-0.04)) < 0.6 && z > -0.3 && z < 0.2;
  return { x, z, y0, v, land: onTable ? TOP + 0.001 : 0.002, rz: h(5) * 6, kind: (i % 3 ? 'holo' : 'gold') as 'holo' | 'gold', s: 0.8 + h(6) * 0.9, ph: h(7) * 6 };
});

const skyTex = (() => { let t: THREE.Texture | null = null; return () => t ?? (t = (() => {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#050a1e'); gr.addColorStop(0.65, '#0c1a40'); gr.addColorStop(1, '#22356e');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; return x; })()); })();

const Set: React.FC<{ T: number }> = ({ T }) => {
  const off = OFF.map((t) => (T >= t ? 1 : 0));
  const left = 1 - OFF.reduce((s, t) => s + easeOut(prog(T, t, t + 0.35)), 0) / 4;   // share of gold still on, smoothed
  const cool = 1 - left;
  const blaze = impulse(T, 65.206, 0.9);
  const flashM = OFF.map(() => useGlow('#ff9a40', 0.9)); // eslint-disable-line react-hooks/rules-of-hooks
  flashM.forEach((m, g) => { m.opacity = clamp(impulse(T, OFF[g], 0.22) * 0.45); });
  const sky = useMemo(() => new THREE.MeshBasicMaterial({ map: skyTex(), toneMapped: false }), []);
  const moon = useGlow('#e6eeff', 1.6), moonHalo = useGlow('#7e98d8', 0.5);
  moonHalo.opacity = 0.35;
  const warmWin = useGlow('#ffc98a', 1.1), coolWin = useGlow('#9fc4ff', 1.0);
  const keyCol = new THREE.Color('#fff0d8').lerp(new THREE.Color('#8aa6ff'), cool);
  const wall = rect(-3000, -2600, 6000, 2800) + ' ' + rectHole(WIN.x0 * 1000, -WIN.y1 * 1000, (WIN.x1 - WIN.x0) * 1000, (WIN.y1 - WIN.y0) * 1000);
  const fw = (WIN.x1 - WIN.x0) * 1000, fh = (WIN.y1 - WIN.y0) * 1000;
  const frame = rect(-30, -30, fw + 60, fh + 60) + ' ' + rectHole(0, 0, fw, fh);
  const bars = rect(fw / 2 - 7, 0, 14, fh) + ' ' + rect(0, fh * 0.42 - 7, fw, 14);
  const goldEdge = rect(-6, -6, fw + 12, fh + 12) + ' ' + rectHole(0, 0, fw, fh);
  const tissue = useMemo(() => {
    const soft = (x0: number, x1: number, hs: number[]) => { const n = hs.length, dx = (x1 - x0) / n; let d = `M ${x0} 0 L ${x0} ${-hs[0] * 0.7}`;
      hs.forEach((h, i) => { const xa = x0 + i * dx, xb = xa + dx; d += ` Q ${xa + dx * 0.5} ${-h - 18} ${xb} ${-(hs[i + 1] ?? h) * 0.8}`; }); return d + ` L ${x1} 0 Z`; };
    return [soft(-130, 10, [50, 78, 62, 90, 70]), soft(-30, 130, [70, 96, 80, 104, 66]), soft(-100, 100, [40, 66, 52, 72, 48])];
  }, []);
  return (
    <group>
      <MirrorFloor />
      {/* the night outside: sky, moon, two layers of city */}
      <mesh material={sky} position={[0.66, 0.9, -1.62]}><planeGeometry args={[1.6, 1.6]} /></mesh>
      <CutM d={'M 30 0 A 30 30 0 1 0 -30 0 A 30 30 0 1 0 30 0 Z'} m={moon} position={[0.84, 1.0, -1.58]} depth={0.001} bevel={0} shadow={false} />
      <CutM d={'M 70 0 A 70 70 0 1 0 -70 0 A 70 70 0 1 0 70 0 Z'} m={moonHalo} position={[0.84, 1.0, -1.59]} depth={0.001} bevel={0} shadow={false} />
      <group position={[0, 0.0, -1.5]}>
        <Cut d={FAR.b} kind="black" color="#0a1230" depth={0.002} bevel={0} shadow={false} position={[0, 0.25, 0]} />
        <CutM d={FAR.warm} m={warmWin} depth={0.001} bevel={0} shadow={false} position={[0, 0.25, 0.003]} />
        <CutM d={FAR.cool} m={coolWin} depth={0.001} bevel={0} shadow={false} position={[0, 0.25, 0.003]} />
      </group>
      <group position={[0.1, 0.0, -1.3]}>
        <Cut d={NEAR.b} kind="black" color="#05070f" depth={0.003} bevel={0} shadow={false} position={[0, 0.2, 0]} />
        <CutM d={NEAR.warm} m={warmWin} depth={0.001} bevel={0} shadow={false} position={[0, 0.2, 0.004]} />
      </group>
      {/* the wall with the window cut in it, the frame, the bars, a sill */}
      <Cut d={wall} kind="black" position={[0, 0, -1.02]} depth={0.01} />
      <group position={[WIN.x0, WIN.y1, -1.005]}>
        <Cut d={frame} kind="black" depth={0.02} />
        <Cut d={goldEdge} kind="gold" position={[0, 0, 0.021]} depth={0.001} bevel={0} shadow={false} />
        <Cut d={bars} kind="black" position={[0, 0, 0.004]} depth={0.012} />
      </group>
      <Box w={fw / 1000 + 0.1} h={0.02} d={0.07} position={[(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.02, -0.98]} />
      {/* the gold rays and the sun ring on the wall, four groups, switched off one by one */}
      <group position={[ORIGIN[0], ORIGIN[1], -1.0]}>
        {RAYS.map((d, g) => <React.Fragment key={g}>
          <Cut d={d} kind={off[g] ? 'black' : 'gold'} depth={0.002} bevel={0} shadow={false} />
          {flashM[g].opacity > 0.01 && <CutM d={d} m={flashM[g]} position={[0, 0, 0.003]} depth={0.0005} bevel={0} shadow={false} />}
        </React.Fragment>)}
        <Cut d={SUN} kind={off[3] ? 'black' : 'gold'} position={[0, 0, 0.003]} depth={0.002} bevel={0} shadow={false} />
      </group>
      {/* the table */}
      <group position={[-0.04, 0, -0.05]}>
        <Box w={1.3} h={0.028} d={0.52} position={[0, 0.2, 0]} kind="lacquer" color="#0d0a12" />
        <Cut d={rect(-650, -4, 1300, 4)} kind="gold" position={[0, 0.226, 0.261]} depth={0.001} bevel={0} shadow={false} />
        <Box w={1.2} h={0.05} d={0.46} position={[0, 0.15, 0]} />
        {[-0.54, 0.54].map((x) => <Cut key={x} d={'M -22 0 L 22 0 L 12 150 L -12 150 Z'} kind="black" position={[x, 0.15, 0.2]} rotation={[Math.PI, 0, 0]} depth={0.02} />)}
        {[-0.54, 0.54].map((x) => <Cut key={x + 'f'} d={rect(-14, -6, 28, 6)} kind="gold" position={[x, 0.0, 0.21]} depth={0.004} />)}
      </group>
      {/* the bag, just put down */}
      <HeroBag position={[BAG_X, TOP, 0.04]} swing={swing(T, 65.206, 9)} />
      {/* the open box, its lid leaning behind, tissue spilling */}
      <group position={[0.3, TOP, -0.1]} rotation={[0, -0.18, 0]}>
        <Box w={0.3} h={0.004} d={0.24} />
        <Box w={0.3} h={0.11} d={0.006} position={[0, 0, 0.117]} />
        <Box w={0.3} h={0.11} d={0.006} position={[0, 0, -0.117]} />
        <Box w={0.006} h={0.11} d={0.24} position={[-0.147, 0, 0]} />
        <Box w={0.006} h={0.11} d={0.24} position={[0.147, 0, 0]} />
        <Cut d={rect(-150, -40, 300, 7)} kind="gold" color="#9a7434" position={[0, 0, 0.1205]} depth={0.001} bevel={0} shadow={false} />
        <Cut d={DIAMOND(12)} kind="gold" position={[0, 0.057, 0.122]} depth={0.0015} bevel={0.0004} />
        {tissue.map((d, i) => <Cut key={i} d={d} kind="paper" color={['#b89c92', '#c4aca2', '#ad9188'][i]} position={[[-0.02, 0.03, 0.0][i], 0.06, [-0.05, 0.0, 0.05][i]]} rotation={[[-0.25, 0.15, -0.4][i], 0, [0.12, -0.1, 0.05][i]]} depth={0.0015} />)}
        <Cut d={tissue[2]} kind="paper" color="#bca298" position={[-0.05, 0.08, 0.125]} rotation={[0.9, 0, 0.2]} depth={0.0015} />
        <group position={[0.04, 0.0, -0.21]} rotation={[-0.22, 0, 0.04]}>
          <Box w={0.31} h={0.25} d={0.03} />
          <Cut d={DIAMOND(20)} kind="gold" position={[0, 0.2, 0.016]} depth={0.002} bevel={0.0005} />
        </group>
      </group>
      {/* a loose gold ribbon on the table */}
      <Cut d={strokePath([...quadPts([0, 0], [60, -50], [110, -10], 12), ...quadPts([110, -10], [150, 30], [200, -20], 12).slice(1), ...quadPts([200, -20], [230, -50], [260, -30], 8).slice(1)], 9)} kind="gold" rotation={[-Math.PI / 2, 0, 0.3]} position={[0.08, TOP + 0.002, 0.13]} depth={0.001} bevel={0} />
      {/* confetti from the slam, lying where it fell */}
      {CONF.map((c, i) => {
        const t = T - 65.206; if (t < 0) return null;
        const y = Math.max(c.land, c.y0 - c.v * t - 0.12 * t * t), landed = y <= c.land + 1e-4;
        const sway = landed ? 0 : 0.03 * Math.sin(t * 5 + c.ph);
        return <Cut key={i} d={i % 2 ? 'M 0 -9 L 7 0 L 0 9 L -7 0 Z' : 'M -6 -6 L 6 -6 L 6 6 L -6 6 Z'} kind={c.kind} depth={0.0006} bevel={0} shadow={false} scale={c.s}
          position={[c.x + sway, y, c.z]} rotation={landed ? [-Math.PI / 2, 0, c.rz] : [t * 6 + c.ph, t * 4, c.rz]} />;
      })}

      {/* light: the warm key cools as the gold goes out; the moon comes through the window */}
      <Spot p={[-0.35, 2.3, 1.2]} at={[BAG_X, 0.34, 0]} angle={0.36} i={(7 + 22 * left) * (1 + 0.6 * blaze)} color={keyCol} shadow />
      <Spot p={[BAG_X - 1.1, 0.45, 0.9]} at={[BAG_X, 0.34, 0.04]} angle={0.22} i={0.6 + 4 * left} color={keyCol} pen={0.8} />
      <Spot p={[0.85, 1.25, -1.2]} at={[BAG_X + 0.05, 0.25, 0.05]} angle={0.36} i={3 + 15 * cool} color="#9db8ff" shadow pen={0.35} />
      <Spot p={[-2.4, 1.1, 1.1]} at={[0, 0.4, -0.2]} angle={0.55} i={(2 + 6 * blaze) * left} color="#ff3ec8" pen={0.9} />
      <Spot p={[2.4, 1.1, 1.1]} at={[0, 0.4, -0.2]} angle={0.55} i={(2 + 6 * blaze) * left + 2 * cool} color="#29e6ff" pen={0.9} />
      <Beam from={[BAG_X, 2.4, 0.0]} len={2.2} r={0.36} o={0.05 * left + 0.05 * blaze} color={`#${keyCol.getHexString()}`} />
      <ambientLight intensity={0.012} />
    </group>
  );
};

export const S08: SceneDef = {
  id: 'S08_after', t0: 65.206, t1: 73.304, x: 98, enter: 'cut', Set, env: 0.55,
  keys: [
    { t: 65.206, pos: [BAG_X - 0.02, 0.37, 0.5], look: [BAG_X - 0.01, 0.37, 0.04], fov: 32, ap: 0.008, bloom: 0.85 },
    { t: 65.8, pos: [BAG_X + 0.03, 0.39, 0.66], look: [BAG_X, 0.38, 0.0], fov: 32, ap: 0.007, bloom: 0.95 },
    { t: 68.0, pos: [0.06, 0.44, 1.05], look: [0.02, 0.42, -0.2], fov: 33, ap: 0.005, bloom: 0.8 },
    { t: 69.257, pos: [0.16, 0.48, 1.25], look: [0.08, 0.45, -0.3], fov: 34, ap: 0.004, bloom: 0.75 },
    { t: 71.5, pos: [0.36, 0.5, 1.45], look: [0.14, 0.46, -0.35], fov: 34, ap: 0.004, bloom: 0.7 },
    { t: 73.28, pos: [0.48, 0.49, 1.6], look: [0.12, 0.45, -0.35], fov: 34, ap: 0.004, bloom: 0.7 },
  ],
  lines: [
    { t: 65.3, end: 68.9, text: '可拿到手以后，那股劲很快就退了。' },
    { t: 69.3, end: 73.2, text: '心理学叫它：享乐适应。' },
  ],
  hits: [[69.257, 0.35], [70.775, 0.25], [71.534, 0.2], [72.8, 0.2]],
};
