/* S15 · end card (121.904 – 130.0), hard cut from S14's tag glint onto the J monogram's spark, which then pulls
   back to the whole card: the gold ring draws itself, the italic J lands (122.412), the gold title slams on the
   next beat, the motif (the bag on a gold line, its holo tag glinting), the question, the comment line and the
   follow pill arrive half a bar apart; sources in small print below. Everything is foil on a velvet wall that
   catches their shadows. The music runs on; the camera keeps a slow drift. */
import React from 'react';
import type { SceneDef } from '../scene';
import { prog, easeOut, easeInOut, impulse, slam, pop } from '../scene';
import { HeroBag, Cut, rect, ring } from '../foil';
import { Backdrop } from '../kit';
import { JUNO } from '../brand/identity';
import { font } from '../brand/lib';
import { Spot, rframe, spark, arcBand, J_PATH, FoilText, Glow } from './S10_kit';

const T0 = 121.904, RING_Y = 1.143;
const beat = (k: number) => 122.412 + k * 0.50625;

const rise = (T: number, a: number, d = 0.22) => easeOut(prog(T, a, a + d));

const Set: React.FC<{ T: number }> = ({ T }) => {
  const draw = easeInOut(prog(T, T0, T0 + 0.62));
  const jIn = pop(T, beat(0) - 0.24, 0.24), word = rise(T, beat(0) + 0.15, 0.3);
  const title = slam(T, beat(1), 0.12), tk = impulse(T, beat(1), 0.3);
  const motif = pop(T, beat(2) - 0.24, 0.24);
  const q = rise(T, beat(3)), sub = rise(T, beat(4)), pill = pop(T, beat(5) - 0.24, 0.24);
  const glint = 0.75 + 0.25 * Math.sin(T * 1.6) + 1.2 * impulse(T, T0, 0.35);
  const sweep = prog(T, 124.85, 125.55); // one foil sheen across the monogram
  const s1 = prog(T, beat(1) + 0.05, beat(1) + 0.7), s2 = prog(T, 127.3, 128.0);
  const titleSheen = s1 > 0 && s1 < 1 ? s1 : s2 > 0 && s2 < 1 ? s2 : -1;
  return (
    <group>
      <Backdrop z={-0.6} burst="none" />
      <Glow w={3.2} h={2.0} color="#ff9a3a" o={0.12} position={[0, 0.85, -0.55]} />
      {/* the monogram */}
      <group position={[0, RING_Y, 0]}>
        {draw > 0.002 && <Cut d={draw >= 1 ? ring(0, 0, 122, 131) : arcBand(122, 131, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * draw, 72)} kind="gold" depth={0.009} />}
        <Cut d={ring(0, 0, 110, 112.5)} kind="gold" depth={0.002} bevel={0} position={[0, 0, -0.004]} scale={draw} shadow={false} />
        {jIn > 0 && <Cut d={J_PATH} kind="gold" depth={0.013} position={[0, 0.02 * (1 - jIn), 0.002]} scale={[1.18 * jIn, 1.18 * jIn, 1]} />}
        <group position={[0.094, 0.094, 0.018]} rotation={[0, 0, T * 0.25]} scale={0.6 * glint}>
          <Cut d={spark(0, 0, 30)} kind="holo" depth={0.001} bevel={0} shadow={false} />
        </group>
        {sweep > 0 && sweep < 1 && <pointLight position={[-0.45 + 0.9 * sweep, 0.05, 0.09]} intensity={0.035 * Math.sin(Math.PI * sweep)} distance={0.26} decay={2} color="#fff1d0" />}
        <group position={[0, -0.176, 0]} scale={word}><FoilText text="JUNO" glyph={0.034} weight="700" spacing={0.55} /></group>
      </group>
      {/* 《你买的不是包》: pure gold, one sheen when it lands and one later */}
      <group position={[0, 0.82, 0.02]} scale={title > 0 ? 1 + 0.35 * (1 - title) : 0}>
        <FoilText text="《你买的不是包》" glyph={0.13} sheen={titleSheen} />
      </group>
      {/* the motif: the bag on a gold line */}
      <group position={[0, 0.621, 0.02]}>
        <Cut d={rect(-330, -1.5, 660, 3)} kind="gold" depth={0.002} bevel={0} scale={[motif, 1, 1]} shadow={false} />
        {motif > 0 && <HeroBag position={[0, 0.002, 0]} scale={0.33 * motif} swing={6 * Math.sin(T * 1.3)} />}
      </group>
      <group position={[0, 0.521 - 0.02 * (1 - q), 0.02]} scale={q}><FoilText text="你最想要的一件奢侈品是什么？" glyph={0.068} fill="#e9e0cf" weight="700" gain={0.92} shadow={0.6} /></group>
      <group position={[0, 0.433 - 0.02 * (1 - sub), 0.02]} scale={sub}><FoilText text="评论区说说，为什么想要它" glyph={0.044} fill="#c4b8a2" weight="500" gain={0.9} shadow={0.6} /></group>
      <group position={[0, 0.339, 0.02]} scale={pill}>
        <Cut d={rframe(0, 0, 720, 86, 43, 4)} kind="gold" depth={0.004} bevel={0} />
        <FoilText text={JUNO.follow} glyph={0.046} weight="700" position={[0, 0, 0.003]} shadow={0} />
      </group>

      <Spot p={[0.6, 2.6, 2.4]} at={[0, 0.8, 0]} i={22 + 8 * tk} angle={0.42} pen={0.65} shadow />
      <Spot p={[-2.2, 1.2, 1.4]} at={[0, 0.9, 0]} i={2.5} color="#ff3ec8" angle={0.5} pen={0.9} />
      <Spot p={[2.2, 1.2, 1.4]} at={[0, 0.9, 0]} i={2.5} color="#29e6ff" angle={0.5} pen={0.9} />
      <ambientLight intensity={0.03} />
    </group>
  );
};

const SOURCES = '资料：米兰法院文件（路透社，2024；法新社，2025）· 博柏利2017/18年报 · OECD–EUIPO 2025 · Plassmann et al. 2008, PNAS · Berridge & Robinson 1998 · Schultz et al. 1997 · Han, Nunes & Drèze 2010 · 基拉尔《浪漫的谎言与小说的真实》 · 画面为代码绘制的示意，包与物件均为原创设计';

const Overlay: React.FC<{ T: number }> = ({ T }) => {
  if (T < T0) return null;
  const k = easeOut(prog(T, beat(6), beat(6) + 0.5)), out = prog(T, 129.55, 130.0);
  return (
    <>
      <div style={{ position: 'absolute', left: 170, right: 170, bottom: 22, textAlign: 'center', opacity: k, fontFamily: font.sans, fontWeight: 400, fontSize: 19,
        lineHeight: 1.45, letterSpacing: '0.02em', color: 'rgba(243,237,226,0.6)', fontVariantNumeric: 'lining-nums' }}>{SOURCES}</div>
      {out > 0 && <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: out }} />}
    </>
  );
};

export const S15: SceneDef = {
  id: 'S15_endcard', t0: 121.904, t1: 130.0, x: 196, enter: 'cut', Set, Overlay,
  bg: '#030308', env: 0.8,
  keys: [
    { t: 121.904, pos: [0.09, 1.235, 0.36], look: [0.094, 1.237, 0], fov: 30, ap: 0.008, bloom: 0.8 },
    { t: 123.2, pos: [0.03, 0.765, 1.98], look: [0, 0.755, 0], fov: 36, ap: 0.0015, bloom: 0.55 },
    { t: 126.5, pos: [-0.03, 0.758, 1.9], look: [0, 0.752, 0], fov: 36, ap: 0.0015, bloom: 0.55 },
    { t: 130.0, pos: [0.03, 0.752, 1.81], look: [0, 0.75, 0], fov: 36, ap: 0.0015, bloom: 0.55 },
  ],
  lines: [],
  hits: [[122.918, 0.3]],
};
