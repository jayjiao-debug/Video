import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Bot, Expr } from './Bot3D';
import voice from './voice.json';

/* 10 s flat test of 小J: flies in, says three lines with a typed speech bubble in sync with its babble, then the gold
   title card lands on the track's first hit (8.47 s). The black hole behind is the real ray-traced plate (15 fps). */

const FPS = 30, GOLD = '#f1c56d', INK = '#f3ede2';
const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
const TITLE = 8.473;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
type Line = { t: number; end: number; text: string; reveal: number[]; typed: number };
const LINES = (voice as { lines: Line[] }).lines;

/** how much the robot is "talking" right now: a short pulse on every character it says */
const talkAt = (T: number) => {
  let v = 0;
  for (const l of LINES) for (let i = 0; i < l.reveal.length; i++) {
    const ch = l.text[i]; if ('，。、？！…'.includes(ch)) continue;
    const d = T - l.reveal[i]; if (d >= 0 && d < 0.09) v = Math.max(v, Math.sin(Math.PI * d / 0.09));
  }
  return v;
};
const shownText = (l: Line, T: number) => { let n = 0; while (n < l.reveal.length && T >= l.reveal[n]) n++; return l.text.slice(0, n); };

const Bubble: React.FC<{ T: number }> = ({ T }) => {
  const l = LINES.find((x) => T >= x.t - 0.12 && T < x.end + 0.12);
  if (!l) return null;
  const k = easeOut(prog(T, l.t - 0.12, l.t + 0.1)) * (1 - prog(T, l.end, l.end + 0.12));
  const s = shownText(l, T);
  return (
    <div style={{ position: 'absolute', left: 560, top: 300, transform: `scale(${lerp(0.85, 1, backOut(clamp(k)))})`, transformOrigin: '0% 80%', opacity: k }}>
      {/* the tail points to 小J */}
      <svg width={60} height={60} style={{ position: 'absolute', left: -38, top: 92 }}><polygon points="60,6 0,52 58,40" fill="rgba(12,14,24,0.9)" stroke={GOLD} strokeWidth={2} /></svg>
      <div style={{ position: 'relative', padding: '20px 30px', borderRadius: 30, background: 'rgba(12,14,24,0.9)', border: `2px solid ${GOLD}`, whiteSpace: 'nowrap',
        fontFamily: SANS, fontWeight: 700, fontSize: 52, color: INK, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontVariantNumeric: 'lining-nums' }}>
        {/* full text invisible underneath keeps the bubble size fixed while it types */}
        <span style={{ visibility: 'hidden' }}>{l.text}</span>
        <span style={{ position: 'absolute', left: 30, top: 20 }}>{s}</span>
      </div>
    </div>
  );
};

/** 小J's acting, as a function of time */
const pose = (T: number) => {
  const fly = easeOut(prog(T, 0.0, 0.95));
  let x = lerp(-3.4, -2.6, 0) ; x = lerp(-6.2, -2.55, backOut(fly));
  let y = 0.15 + 0.05 * Math.sin(T * 2 * Math.PI * 0.55);
  let yaw = 0.35, tilt = Math.sin(T * 2 * Math.PI * 0.4) * 0.03 - 0.25 * (1 - fly), handL = 0, handR = 0, e: Expr = 'normal', flame = 1 + 1.2 * (1 - fly);
  const [L1, L2, L3] = LINES;
  if (T < L1.t) e = fly < 0.7 ? 'surprised' : 'happy';
  else if (T < L2.t - 0.1) { // 嗨 — wave, wink on 小J
    handR = 0.75 + 0.25 * Math.sin((T - L1.t) * 2 * Math.PI * 2.2) * (T < L1.t + 1.2 ? 1 : 0);
    e = T > L1.reveal[L1.text.indexOf('小')] ? 'wink' : 'normal';
  } else if (T < L3.t - 0.1) { // turns to the black hole and points
    const k = easeInOut(prog(T, L2.t - 0.1, L2.t + 0.4));
    yaw = lerp(0.35, 1.05, k); handR = 0.8 * k; tilt += 0.06 * k;
    e = T > L2.reveal[L2.text.indexOf('4')] ? 'surprised' : 'normal';
  } else { // back to you: reassuring, then the shrug
    const k = easeInOut(prog(T, L3.t - 0.1, L3.t + 0.35));
    yaw = lerp(1.05, 0.25, k); handR = lerp(0.8, 0, k);
    const shrugT = L3.reveal[L3.text.indexOf('…')];
    e = T < shrugT ? 'happy' : 'squint';
    const sh = easeOut(prog(T, shrugT, shrugT + 0.3)) * (1 - easeInOut(prog(T, L3.end - 0.2, L3.end + 0.3)));
    handL = 0.45 * sh; handR = 0.45 * sh; tilt += 0.1 * sh; y -= 0.05 * sh;
  }
  // title card: 小J scoots down-left and looks up at the title
  const tk = easeInOut(prog(T, TITLE - 0.25, TITLE + 0.35));
  x = lerp(x, -3.6, tk); y = lerp(y, -1.25, tk); yaw = lerp(yaw, 0.55, tk);
  const sc = lerp(1.35, 1.0, tk);
  if (T >= TITLE) e = 'happy';
  return { x, y, yaw, tilt, handL, handR, e, flame, sc };
};

const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < TITLE - 0.05) return null;
  const chars = [...'《掉进黑洞》'];
  const beat = 60 / 117.94;
  const pour = TITLE + 0.3 + 2 * beat;
  return (
    <AbsoluteFill style={{ background: `rgba(3,4,8,${0.6 * easeOut(prog(T, TITLE - 0.05, TITLE + 0.2))})` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 30, letterSpacing: '0.32em', color: GOLD, opacity: easeOut(prog(T, TITLE, TITLE + 0.3)) }}>
        SCHWARZSCHILD · A FALL · 360°
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center' }}>
        {chars.map((c, i) => {
          const a = TITLE + (i === 0 || i === 5 ? 0 : (i - 1) * beat / 2), k = prog(T, a, a + 0.1);
          return <span key={i} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, display: 'inline-block', opacity: k, transform: `scale(${1 + 0.3 * (1 - easeOut(k))})`,
            color: T > pour ? GOLD : INK, textShadow: T > pour ? '0 0 34px rgba(241,197,109,0.6)' : 'none' }}>{c}</span>;
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: INK, opacity: easeOut(prog(T, pour, pour + 0.3)) }}>如果你掉进黑洞，会看到什么？</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 622, textAlign: 'center', fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: 30, color: 'rgba(243,237,226,0.6)', opacity: easeOut(prog(T, pour + 0.2, pour + 0.5)) }}>What would you see if you fell into a black hole?</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: 'monospace', fontSize: 22, letterSpacing: '0.4em', color: 'rgba(241,197,109,0.7)', opacity: easeOut(prog(T, pour + 0.3, pour + 0.6)) }}>— VIBE知识大赏 —</div>
    </AbsoluteFill>
  );
};

export const Test2D: React.FC = () => {
  const f = useCurrentFrame(), T = f / FPS;
  const p = pose(T), talk = talkAt(T);
  const bg = Math.min(149, Math.floor(T * 15));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Img src={staticFile(`t2bg/f${String(bg).padStart(4, '0')}.jpg`)} style={{ width: 1920, height: 1080 }} />
      <TitleCard T={T} />
      <ThreeCanvas width={1920} height={1080} orthographic camera={{ zoom: 200, position: [0, 0, 10] }} style={{ position: 'absolute', inset: 0 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#fff3df" />
        <directionalLight position={[5, 0.5, 1]} intensity={1.8} color="#ffc98a" />{/* warm light from the disk on the right */}
        <pointLight position={[0, -2, 2]} intensity={1.2} color="#bfe3ff" />
        <Bot pos={[p.x, p.y, 0]} scale={p.sc} yaw={p.yaw} tilt={p.tilt} e={talk > 0.5 && p.e === 'normal' ? 'normal' : p.e} handL={p.handL} handR={p.handR} talk={talk} flame={p.flame} />
      </ThreeCanvas>
      <Bubble T={T} />
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * (T < TITLE - 0.2 ? 1 : 0), fontFamily: SANS, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
        <span style={{ color: GOLD }}>◆ </span>Juno · VIBE知识大赏
      </div>
    </AbsoluteFill>
  );
};
