import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, camAt, DROP, EN, ZH, GOLD, INK, RED, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig, canvasTex, project } from './three-kit';
import { softTex } from './kit';
import SIM from './tvl.json';

/* S5–S7, talent and luck (b128 → b238). Pluchino, Biondo & Rapisarda, "Talent vs Luck", Advances in Complex Systems (2018),
   re-run here with the paper's parameters (sim/tvl.py, seed 81): 1000 people on a 201×201 world, talent N(0.6, 0.1),
   capital 10, 500 drifting events (half lucky), 80 half-year steps. Lucky event: capital doubles with probability = talent.
   Unlucky: halves. In this run the richest person (talent 0.62) ends with 2560; the most talented (0.93) with 0.31;
   the top 20 % hold 80 %. The paper's own run: 0.61 → 2560, 0.89 → 0.625.
   Each person is a thin pillar whose height grows with their capital; events are green (lucky) and red (unlucky) points. */
type Sim = { L: number; steps: number; top: number; best: number; pos: number[]; tal: number[]; logcap: number[][]; hits: number[][]; tracks: number[][]; lucky: number[]; top20: number };
const S = SIM as unknown as Sim;
const N = S.tal.length, NE = S.lucky.length;
const SCALE = 0.1;
export const agentXZ = (i: number) => [(S.pos[2 * i] - 100) * SCALE, (S.pos[2 * i + 1] - 100) * SCALE];
const H = (lc: number) => 0.28 * Math.pow(2, lc * 0.5);
export const TOPI = S.top, BESTI = S.best;
const capAt = (i: number, s: number) => 10 * Math.pow(2, S.logcap[Math.min(S.steps, Math.max(0, Math.floor(s)))][i]);
// the sim clock: step 0 until b142, then all 80 steps by the drop
export const stepAt = (T: number) => 80 * prog(T, b(142), DROP);
const HITS_BY_STEP: number[][][] = Array.from({ length: S.steps + 1 }, () => []);
S.hits.forEach((h) => HITS_BY_STEP[h[0]].push(h));

export const LINES_S5: Line[] = [
  [b(128) + 0.1, b(135) - 0.1, '越难预测的事，练习越不管用。', 'The less predictable the task, the less practice helps.'],
  [b(135) + 0.06, b(142) - 0.1, '那剩下的差距，靠什么？', 'So what makes up the rest of the gap?'],
  [b(142) + 0.06, b(151) - 0.1, '2018年，有人用电脑模拟了1000人的40年：', 'In 2018, researchers simulated 40 years in the lives of 1,000 people:'],
  [b(151) + 0.06, DROP - 0.05, '每个人天赋不同，好运和厄运随机砸下来。', 'different talents, and good and bad luck falling at random.'],
];
export const LINES_S6: Line[] = [
  [DROP + 0.02, b(169) - 0.1, '40年后，最成功的那个人，天赋只是[中等]。', 'After 40 years, the most successful person had only average talent.'],
  [b(169) + 0.06, b(180) - 0.1, '这个人的天赋只比平均高一点点，财富却翻了256倍。', 'Barely above average talent, yet a 256-fold rise in wealth.'],
  [b(180) + 0.06, b(190) - 0.1, '而天赋最高的那个人，最后几乎一无所有。', 'The most talented person ended with almost nothing.'],
  [b(190) + 0.06, b(199) - 0.1, '拉开差距的，不是天赋，是一连串的[运气]。', 'What set them apart was not talent but a run of luck.'],
];
export const LINES_S7: Line[] = [
  [b(199) + 0.06, b(207) - 0.1, '那还要不要努力？要。因为天赋越高，越接得住好运。', 'So is effort pointless? No: the more able you are, the more luck you can catch.'],
  [b(207) + 0.06, b(217) - 0.1, '研究者给个人的建议是：多做事、多见人、多尝试，保持开放。', 'The authors’ advice: do more, meet more people, try more things, stay open.'],
  [b(217) + 0.06, b(225) - 0.1, '好运没法控制，但被它砸中的机会，可以变多。', "You can't control luck, but you can give it more chances to find you."],
  [b(225) + 0.06, b(232) - 0.1, '然后，用你的本事[接住它]。', 'Then use your skill to catch it.'],
  [b(232) + 0.06, b(238) - 0.1, '天赋和努力，决定你能接住多少。', 'Talent and effort decide how much of it you can hold.'],
];

const [TX, TZ] = agentXZ(TOPI), [BX, BZ] = agentXZ(BESTI);
// the person we follow in S7: a moderately talented one near the middle of the world
const FOLLOW = (() => {
  let best = 0, bd = 1e9;
  for (let i = 0; i < N; i++) { const [x, z] = agentXZ(i); const d = x * x + z * z + Math.abs(S.tal[i] - 0.66) * 40; if (d < bd) { bd = d; best = i; } }
  return best;
})();
const [FX, FZ] = agentXZ(FOLLOW);

export const KEYS_LUCK: Key[] = [
  [b(128) - 0.3, [0, 15, 19], [0, 0, 0]],
  [b(142), [7, 11, 15], [0, 0, 0]],
  [DROP - 0.05, [9, 6.5, 11], [0, 0.6, 0]],
  [DROP + 0.9, [TX + 4.5, 5.5, TZ + 7.5], [TX, 3.2, TZ]],
  [b(180) - 0.2, [TX - 3.5, 4.5, TZ + 6.5], [TX, 3.6, TZ]],
  [b(181) + 0.6, [BX + 2.2, 1.4, BZ + 3.2], [BX, 0.25, BZ]],
  [b(190), [BX + 2.6, 1.6, BZ + 3.6], [BX, 0.2, BZ]],
  [b(199), [0, 17, 21], [0, 0, 0]],
  [b(207), [FX + 5, 6, FZ + 8], [FX, 0.6, FZ]],
  [b(238) + 0.4, [FX + 3, 4.6, FZ + 5.5], [FX, 0.9, FZ - 0.6]],
];

const groundTex = () => {
  const t = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#0b0c10'; g.fillRect(0, 0, 1024, 1024);
    g.strokeStyle = 'rgba(243,237,226,0.06)'; g.lineWidth = 1;
    for (let i = 0; i <= 1024; i += 51.2) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke(); }
  });
  return t;
};

/** S7's illustration: the followed person's reach grows (they "go out more"), so more lucky events touch them */
const reachAt = (T: number) => lerp(0.1, 0.55, easeInOut(prog(T, b(208), b(216))));
const extraGrowth = (T: number) => easeOut(prog(T, b(225) + 0.2, b(227))) * 1.6 + easeOut(prog(T, b(219), b(221))) * 0.8;

export const World: React.FC<{ T: number; sim: number; keys: Key[]; highlight?: number }> = ({ T, sim, keys }) => {
  const ground = useMemo(groundTex, []);
  const mesh = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.032, 0.036, 1, 8); g.translate(0, 0.5, 0);
    const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.2 }), N);
    m.castShadow = true;
    return m;
  }, []);
  const pts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Array(NE * 3).fill(0), 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(S.lucky.flatMap((l) => (l ? [0.45, 1.0, 0.65] : [1.0, 0.35, 0.3])), 3));
    return g;
  }, []);
  // pillars
  const o = new THREE.Object3D(), c = new THREE.Color();
  const s0 = Math.floor(sim), f = sim - s0;
  for (let i = 0; i < N; i++) {
    const [x, z] = agentXZ(i);
    const a = S.logcap[Math.min(S.steps, s0)][i], bb = S.logcap[Math.min(S.steps, s0 + 1)][i];
    let h = H(lerp(a, bb, easeOut(Math.min(1, f * 3))));
    if (i === FOLLOW) h *= 1 + extraGrowth(T);
    o.position.set(x, 0, z); o.scale.set(1, Math.max(0.02, h), 1); o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    const t = (S.tal[i] - 0.3) / 0.65;
    c.setRGB(0.35 + 0.55 * t, 0.38 + 0.52 * t, 0.45 + 0.45 * t);
    if (i === TOPI && T > DROP) c.lerp(new THREE.Color('#ffcf6a'), easeOut(prog(T, DROP, DROP + 0.5)));
    if (i === BESTI && T > b(180)) c.lerp(new THREE.Color('#ff7a66'), easeOut(prog(T, b(180), b(181))));
    if (i === FOLLOW && T > b(207)) c.lerp(new THREE.Color('#ffe6b0'), easeOut(prog(T, b(207), b(208))));
    mesh.setColorAt(i, c);
  }
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  // events: interpolate between half-year positions (no interpolation across the world's wrap)
  const p = pts.attributes.position as THREE.BufferAttribute;
  const ta = S.tracks[Math.min(S.steps, s0)], tb = S.tracks[Math.min(S.steps, s0 + 1)];
  for (let e = 0; e < NE; e++) {
    let x = ta[2 * e], y = ta[2 * e + 1];
    const x2 = tb[2 * e], y2 = tb[2 * e + 1];
    if (Math.abs(x2 - x) < 10 && Math.abs(y2 - y) < 10) { x = lerp(x, x2, f); y = lerp(y, y2, f); }
    p.setXYZ(e, (x - 100) * SCALE, 0.12, (y - 100) * SCALE);
  }
  p.needsUpdate = true;
  // flashes where events hit people in the last step and a half
  const flashes: { x: number; z: number; k: number; kind: number; h: number }[] = [];
  for (let s = Math.max(1, s0 - 1); s <= Math.min(S.steps, s0 + 1); s++) {
    const age = sim - s + 1;
    if (age < 0 || age > 1.6) continue;
    for (const h of HITS_BY_STEP[s]) { const [x, z] = agentXZ(h[1]); flashes.push({ x, z, k: 1 - age / 1.6, kind: h[3], h: H(S.logcap[s][h[1]]) }); }
  }
  const { pos, look } = camAt(keys, T);
  return (
    <Stage bloom={0.6} threshold={0.8} seed={Math.floor(T * 30) % 97} fov={34} near={0.05} far={300}
      focus={Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2])} aperture={0.0015} maxblur={0.008}
      shake={T > DROP && T < DROP + 0.6 ? [0.004 * Math.exp(-(T - DROP) / 0.15) * Math.sin(T * 80), 0.004 * Math.exp(-(T - DROP) / 0.15) * Math.cos(T * 70)] : [0, 0]}>
      <CamRig T={T} keys={keys} fov={34} />
      <fog attach="fog" args={['#05060b', 18, 42]} />
      <hemisphereLight args={['#8a9ad0', '#0a0806', 0.5]} />
      <directionalLight position={[8, 14, 6]} intensity={1.6} color="#ffd6a8" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-camera-near={1} shadow-camera-far={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20.1, 20.1]} /><meshStandardMaterial map={ground} roughness={0.9} /></mesh>
      <primitive object={mesh} />
      <points geometry={pts}>
        <pointsMaterial size={0.26} map={softTex()} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
      </points>
      {flashes.map((fl, i) => (
        <sprite key={i} position={[fl.x, fl.h + 0.1, fl.z]} scale={[0.6 * (1.4 - fl.k), 0.6 * (1.4 - fl.k), 1]}>
          <spriteMaterial map={softTex()} color={fl.kind === 0 ? '#ff6a5c' : fl.kind === 1 ? '#7dffb0' : '#3e7d5a'} transparent opacity={fl.k} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
      {T > b(207) && (
        <mesh position={[FX, 0.02, FZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[reachAt(T) * 1.6, reachAt(T) * 1.6 + 0.04, 64]} />
          <meshBasicMaterial color="#ffe6b0" transparent opacity={0.8 * easeOut(prog(T, b(207), b(208)))} toneMapped={false} />
        </mesh>
      )}
      {/* S7: lucky points drawn into the followed person's wider reach (illustration) */}
      {T > b(217) && Array.from({ length: 6 }, (_, k) => {
        const at = b(217) + 0.5 + k * 0.9, t = T - at;
        if (t < 0 || t > 1.2) return null;
        const a = k * 1.9, r = lerp(2.2, 0.05, easeIn(Math.min(1, t / 0.8)));
        return <sprite key={k} position={[FX + Math.cos(a) * r, 0.3 + (t > 0.8 ? (t - 0.8) * 2 : 0), FZ + Math.sin(a) * r]} scale={[0.45, 0.45, 1]}>
          <spriteMaterial map={softTex()} color="#7dffb0" transparent opacity={t < 0.8 ? 1 : 1 - (t - 0.8) / 0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>;
      })}
    </Stage>
  );
};

const Tag: React.FC<{ T: number; at: number; out: number; p: { x: number; y: number }; title: string; lines: [string, string][]; color: string }> = ({ T, at, out, p, title, lines, color }) => {
  const o = easeOut(prog(T, at, at + 0.4)) * (1 - prog(T, out - 0.3, out));
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: Math.min(1500, p.x + 40), top: Math.max(140, p.y - 110), width: 380, opacity: o, transform: `translateX(${(1 - o) * 16}px)` }}>
      <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, color }}>{title}</div>
      {lines.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6 }}>
          <span style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.6)', width: 64 }}>{k}</span>
          <span style={{ fontFamily: EN, fontWeight: 700, fontSize: 46, color: INK, fontVariantNumeric: 'tabular-nums lining-nums' }}>{v}</span>
        </div>
      ))}
    </div>
  );
};

/** the top person's 40 years as a strip of 80 half-years: green = a lucky break taken, red = a blow */
const LifeStrip: React.FC<{ T: number; who: number; y: number; label: string; at: number; out: number }> = ({ T, who, y, label, at, out }) => {
  const o = easeOut(prog(T, at, at + 0.4)) * (1 - prog(T, out - 0.3, out));
  if (o <= 0.01) return null;
  const x0 = 460, w = 1000, reveal = easeInOut(prog(T, at + 0.2, at + 2.2));
  const hits = S.hits.filter((h) => h[1] === who && h[3] !== 2);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <text x={x0 - 24} y={y + 8} textAnchor="end" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.75)' }}>{label}</text>
      <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke="rgba(243,237,226,0.3)" strokeWidth={2} />
      {[0, 20, 40, 60, 80].map((s) => <text key={s} x={x0 + (s / 80) * w} y={y + 34} textAnchor="middle" style={{ fontFamily: EN, fontSize: 20, fill: 'rgba(243,237,226,0.45)' }}>{20 + s / 2}岁</text>)}
      {hits.map((h, i) => {
        const x = x0 + (h[0] / 80) * w;
        if ((h[0] / 80) > reveal) return null;
        return <circle key={i} cx={x} cy={y} r={9} fill={h[3] === 1 ? '#7dffb0' : RED} style={{ filter: 'drop-shadow(0 0 8px rgba(125,255,176,0.6))' }} />;
      })}
    </svg>
  );
};

export const S5_IN = b(128) - 0.3;
export const S6_OUT = b(199);
export const S7_OUT = b(238) + 0.4;

export const Luck: React.FC<{ T: number }> = ({ T }) => {
  if (T < S5_IN || T > S7_OUT) return null;
  const o = easeOut(prog(T, S5_IN, S5_IN + 0.6)) * (1 - easeIn(prog(T, S7_OUT - 0.5, S7_OUT)));
  const sim = stepAt(T);
  const ptTop = project(KEYS_LUCK, T, [TX, H(S.logcap[S.steps][TOPI]), TZ], 34);
  const ptBest = project(KEYS_LUCK, T, [BX, 0.3, BZ], 34);
  const year = Math.floor(sim / 2);
  const capTop = Math.round(capAt(TOPI, sim));
  const freeze = T > DROP - 0.25 && T < DROP;
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      <World T={T} sim={freeze ? stepAt(DROP - 0.25) : sim} keys={KEYS_LUCK} />
      {T > b(142) && T < DROP + 0.3 && (
        <div style={{ position: 'absolute', right: 140, top: 140, textAlign: 'right', opacity: easeOut(prog(T, b(142), b(143))) * (1 - prog(T, DROP, DROP + 0.3)) }}>
          <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.65)', letterSpacing: '0.1em' }}>模拟进行到</div>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 96, color: INK, lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums' }}>{year}<span style={{ fontFamily: ZH, fontSize: 36 }}> 年</span></div>
          <div style={{ fontFamily: ZH, fontSize: 22, color: 'rgba(243,237,226,0.5)', marginTop: 8 }}><span style={{ color: '#7dffb0' }}>●</span> 好运　<span style={{ color: RED }}>●</span> 厄运　柱子高度 = 财富</div>
        </div>
      )}
      <Tag T={T} at={DROP + 0.5} out={b(180)} p={ptTop} title="最成功的人" color={GOLD} lines={[['天赋', `${S.tal[TOPI].toFixed(2)}`], ['平均', '0.60'], ['财富', `10 → ${capTop.toLocaleString('en-US')}`]]} />
      <Tag T={T} at={b(181) + 0.3} out={b(190)} p={ptBest} title="天赋最高的人" color="#ff8a76" lines={[['天赋', `${S.tal[BESTI].toFixed(2)}`], ['财富', `10 → ${capAt(BESTI, 80).toFixed(2)}`]]} />
      <LifeStrip T={T} who={TOPI} y={190} label="最成功者" at={b(190) + 0.1} out={b(199)} />
      <LifeStrip T={T} who={BESTI} y={270} label="天赋最高者" at={b(191)} out={b(199)} />
      {T > b(190) && T < b(199) && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 345, textAlign: 'center', fontFamily: ZH, fontSize: 20, color: 'rgba(243,237,226,0.45)', opacity: easeOut(prog(T, b(192), b(193))) * (1 - prog(T, b(198), b(199))) }}>
          按论文参数重跑的一次模拟 · 前20%的人拿走了{Math.round(S.top20 * 100)}%的财富 · 论文原结果：0.61 → 2560，0.89 → 0.625
        </div>
      )}
      {T > b(207) && T < b(217) && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', gap: 28 }}>
          {['多做事', '多见人', '多尝试'].map((t, i) => {
            const a = b(207) + 0.6 + i * 0.5, k = easeOut(prog(T, a, a + 0.35)) * (1 - prog(T, b(216), b(217)));
            return <span key={t} style={{ opacity: k, transform: `translateY(${(1 - k) * 10}px)`, padding: '10px 28px', borderRadius: 40, border: '1.5px solid rgba(255,230,176,0.6)', background: 'rgba(5,6,11,0.6)', fontFamily: ZH, fontWeight: 700, fontSize: 36, color: INK }}>{t}</span>;
          })}
        </div>
      )}
      {T > b(217) && T < b(238) && (
        <div style={{ position: 'absolute', right: 120, top: 150, fontFamily: ZH, fontSize: 20, color: 'rgba(243,237,226,0.45)', opacity: easeOut(prog(T, b(217), b(218))) }}>示意：接触面越大，碰到好运的机会越多</div>
      )}
      <Chapter T={T} at={b(142) + 0.2} out={b(198)} text="2018年 · 天赋与运气模拟" />
      <SubBand o={0.85} />
      <Subs T={T} lines={[...LINES_S5, ...LINES_S6, ...LINES_S7]} />
    </AbsoluteFill>
  );
};
