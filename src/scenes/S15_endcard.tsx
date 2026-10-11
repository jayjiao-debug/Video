/* S15 · end card (121.904 – 130.0), hard cut from S14's tag glint onto the J monogram's spark, which then pulls
   back to the whole card: the gold ring draws itself, the italic J lands (122.412), the gold title slams on the
   next beat, the motif (the bag on a gold line, its holo tag glinting), the question, the comment line and the
   follow pill arrive half a bar apart; sources in small print below. Everything is foil on a velvet wall that
   catches their shadows. The music runs on; the camera keeps a slow drift. */
import React from 'react';
import type { SceneDef } from '../scene';
import { prog, easeOut, easeInOut, impulse, slam, pop } from '../scene';
import { HeroBag, Cut, rect, ring } from '../foil';
import { Backdrop, Word, Confetti } from '../kit';
import { JUNO } from '../brand/identity';
import { font } from '../brand/lib';
import { Spot, rframe, spark, arcBand, J_PATH } from './S10_kit';

const T0 = 121.904, RING_Y = 1.12;
const beat = (k: number) => 122.412 + k * 0.50625;

const rise = (T: number, a: number, d = 0.22) => easeOut(prog(T, a, a + d));

const Set: React.FC<{ T: number }> = ({ T }) => {
  const draw = easeInOut(prog(T, T0, T0 + 0.62));
  const jIn = pop(T, beat(0) - 0.24, 0.24), word = rise(T, beat(0) + 0.15, 0.3);
  const title = slam(T, beat(1), 0.12), tk = impulse(T, beat(1), 0.3);
  const motif = pop(T, beat(2) - 0.24, 0.24);
  const q = rise(T, beat(3)), sub = rise(T, beat(4)), pill = pop(T, beat(5) - 0.24, 0.24);
  const glint = 0.75 + 0.25 * Math.sin(T * 1.6) + 1.2 * impulse(T, T0, 0.35);
  return (
    <group>
      <Backdrop z={-0.6} burst="none" />
      {/* the monogram */}
      <group position={[0, RING_Y, 0]}>
        {draw > 0.002 && <Cut d={draw >= 1 ? ring(0, 0, 104, 112) : arcBand(104, 112, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * draw, 72)} kind="gold" depth={0.008} />}
        <Cut d={ring(0, 0, 94, 96.5)} kind="gold" depth={0.002} bevel={0} position={[0, 0, -0.004]} scale={draw} shadow={false} />
        {jIn > 0 && <Cut d={J_PATH} kind="gold" depth={0.012} position={[0, 0.02 * (1 - jIn), 0.002]} scale={[jIn, jIn, 1]} />}
        <group position={[0.08, 0.08, 0.016]} rotation={[0, 0, T * 0.25]} scale={0.55 * glint}>
          <Cut d={spark(0, 0, 30)} kind="holo" depth={0.001} bevel={0} shadow={false} />
        </group>
        <group position={[0, -0.168, 0]} scale={word}><Word text="J U N O" size={0.042} kind="gold" weight="700" /></group>
      </group>
      {/* 《你买的不是包》 */}
      <group position={[0, 0.8, 0.02]} scale={title > 0 ? 1 + 0.55 * (1 - title) : 0}>
        <Word text="《你买的不是包》" size={0.16} kind="gold" weight="900" />
      </group>
      {/* the motif: the bag on a gold line */}
      <group position={[0, 0.565, 0.02]}>
        <Cut d={rect(-300, -1.5, 600, 3)} kind="gold" depth={0.002} bevel={0} scale={[motif, 1, 1]} shadow={false} />
        {motif > 0 && <HeroBag position={[0, 0.002, 0]} scale={0.36 * motif} swing={6 * Math.sin(T * 1.3)} />}
      </group>
      <group position={[0, 0.468 - 0.02 * (1 - q), 0.02]} scale={q}><Word text="你最想要的一件奢侈品是什么？" size={0.086} kind="cream" weight="700" color="#e6ddcc" /></group>
      <group position={[0, 0.386 - 0.02 * (1 - sub), 0.02]} scale={sub}><Word text="评论区说说，为什么想要它" size={0.056} kind="cream" weight="500" color="#b9ad98" /></group>
      <group position={[0, 0.28, 0.02]} scale={pill}>
        <Cut d={rframe(0, 0, 600, 76, 38, 3.6)} kind="gold" depth={0.004} bevel={0} />
        <Word text={JUNO.follow} size={0.05} kind="glow" color="#f1c56d" glow={0.9} weight="700" position={[0, 0, 0.002]} />
      </group>

      <Spot p={[0.6, 2.6, 2.4]} at={[0, 0.78, 0]} i={20 + 8 * tk} angle={0.42} pen={0.65} shadow />
      <Spot p={[-2.2, 1.2, 1.4]} at={[0, 0.9, 0]} i={4} color="#ff3ec8" angle={0.5} pen={0.9} />
      <Spot p={[2.2, 1.2, 1.4]} at={[0, 0.9, 0]} i={4} color="#29e6ff" angle={0.5} pen={0.9} />
      <Confetti T={T} box={[2.2, 1.3, 0.8]} center={[0, 0.75, 0.1]} n={12} seed={21} fall={0.015} />
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
      <div style={{ position: 'absolute', left: 200, right: 200, bottom: 34, textAlign: 'center', opacity: k * 0.9, fontFamily: font.sans, fontWeight: 400, fontSize: 19,
        lineHeight: 1.6, letterSpacing: '0.03em', color: 'rgba(243,237,226,0.5)', fontVariantNumeric: 'lining-nums' }}>{SOURCES}</div>
      {out > 0 && <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: out }} />}
    </>
  );
};

export const S15: SceneDef = {
  id: 'S15_endcard', t0: 121.904, t1: 130.0, x: 196, enter: 'cut', Set, Overlay,
  bg: '#030308', env: 0.8,
  keys: [
    { t: 121.904, pos: [0.075, 1.19, 0.34], look: [0.08, 1.2, 0], fov: 30, ap: 0.012, bloom: 1.0 },
    { t: 123.2, pos: [0.03, 0.8, 1.85], look: [0, 0.755, 0], fov: 36, ap: 0.002, bloom: 0.6 },
    { t: 126.6, pos: [-0.05, 0.78, 1.97], look: [0, 0.755, 0], fov: 36, ap: 0.002, bloom: 0.55 },
    { t: 130.0, pos: [0.04, 0.775, 1.91], look: [0, 0.76, 0], fov: 36, ap: 0.002, bloom: 0.55 },
  ],
  lines: [],
  hits: [[122.918, 0.3]],
};
