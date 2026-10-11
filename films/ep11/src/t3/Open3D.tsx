import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, ZH, EN, beats, prog, easeOut, easeIn, easeInOut, lerp, inOut, swing } from '../lib';
import { Glow, Dust, Vignette, Grain, Rich } from '../ui';

/* ---------- timing (identical to Ep1) ---------- */
export const OPEN_DUR = 21.0;
const LAND = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18].map((i) => beats[i]);
const FLIP = beats[17];
const DROP1 = beats[19];
const Q_AT = 12.61;
const DIM_AT = 15.45;
const TITLE = 16.625;

/* ---------- world layout ---------- */
export const N = 10;
export const GAP = 1.15;
export const cx = (i: number) => (i - (N - 1) / 2) * GAP;
export const STR_HALF = 9;
export const strY = (x: number) => 0.28 - 0.32 * (1 - Math.pow(x / STR_HALF, 2));
export const CARD_W = 0.86;
export const CARD_H = 1.2;

export const v3 = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
export const mix = (a: number[], b: number[], k: number) => a.map((x, i) => lerp(x, b[i], k));

/* ---------- camera: one continuous move ---------- */
const camAt = (t: number) => {
  // follow the newest card
  let idx = 0;
  for (let i = 1; i < N; i++) idx += easeInOut(prog(t, LAND[i] - 0.45, LAND[i] + 0.55));
  const xf = cx(0) + idx * GAP;
  const intro = easeOut(prog(t, 0, 2.2));
  const trackPos = [xf - 1.75, lerp(0.05, -0.15, intro), lerp(2.7, 3.1, intro)];
  const trackLook = [xf + 0.35, -0.95, 0];
  // pull back to reveal all ten
  const w = easeInOut(prog(t, 6.0, 9.3));
  const drift = easeInOut(prog(t, 10.6, 15.4));
  const cxw = lerp(0, 0.575, easeInOut(prog(t, 10.6, 12.8)));
  const widePos = [cxw + lerp(0, 0.25, drift), lerp(0.3, 0.22, drift), lerp(11.6, 9.6, drift)];
  const wideLook = [cxw + lerp(0, 0.1, drift), -0.38, 0];
  // rise before the drop so the string sits under the title
  const r = easeInOut(prog(t, 15.2, 16.62));
  const settle = easeOut(prog(t, 16.62, OPEN_DUR));
  const endPos = [0.575, lerp(1.05, 0.95, settle), lerp(14.2, 13.4, settle)];
  const endLook = [0.575, lerp(0.95, 0.9, settle), 0];
  let pos = mix(trackPos, widePos, w);
  let look = mix(trackLook, wideLook, w);
  pos = mix(pos, endPos, r);
  look = mix(look, endLook, r);
  return { pos, look };
};

const CamRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(t);
  camera.position.copy(v3(pos));
  camera.lookAt(v3(look));
  camera.updateProjectionMatrix();
  return null;
};

/* ---------- paper textures ---------- */
export const rnd = (s: number) => {
  let x = Math.sin(s * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
export const paperCanvas = (seed: number) => {
  const W = 430, H = 600;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, W, H);
  gr.addColorStop(0, '#f3ead6');
  gr.addColorStop(1, '#e4d7bb');
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  // grain
  const img = g.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd(i * 0.37 + seed) - 0.5) * 16;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  g.strokeStyle = 'rgba(150,110,80,0.45)';
  g.lineWidth = 3;
  g.strokeRect(22, 22, W - 44, H - 44);
  return { c, g, W, H };
};
export const frontTex = (n: number) => {
  const { c, g, W, H } = paperCanvas(n);
  g.textAlign = 'center';
  g.fillStyle = '#5a3a2e';
  g.font = `900 210px ${ZH}`;
  g.fillText('?', W / 2, 330);
  g.fillStyle = '#7a6a52';
  g.font = `500 44px ${ZH}`;
  g.fillText(`第${n}位`, W / 2, 450);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
};
export const backTex = (n: number, score: number) => {
  const { c, g, W, H } = paperCanvas(n + 50);
  g.textAlign = 'center';
  g.fillStyle = '#7a6a52';
  g.font = `500 38px ${ZH}`;
  g.fillText('心 动 值', W / 2, 150);
  g.fillStyle = '#2b2118';
  g.font = `600 250px "Cormorant Garamond", Georgia, serif`;
  g.fillText(String(score), W / 2, 395);
  g.fillStyle = '#7a6a52';
  g.font = `500 40px ${ZH}`;
  g.fillText(`第${n}位`, W / 2, 485);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
};

/* ---------- one card on the string ---------- */
const DIM_COL = new THREE.Color('#4a4438');
const WHITE = new THREE.Color('#ffffff');
const Card3: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const at = LAND[i];
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#d9cbab', roughness: 0.9, transparent: true });
    const front = new THREE.MeshStandardMaterial({ map: frontTex(i + 1), roughness: 0.88, transparent: true });
    const back = new THREE.MeshStandardMaterial({ map: backTex(i + 1, 6), roughness: 0.88, transparent: true });
    return [side, side, side, side, front, back];
  }, [i]);
  if (t < at - 0.25) return null;
  const f = Math.max(0, (t - at + 0.18) * 30);
  const s = spring({ frame: f, fps: 30, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const fadeIn = prog(t, at - 0.18, at - 0.02);
  const x = cx(i);
  const y0 = strY(x);
  let dy = 0.95 * (1 - s);
  let rz = (swing(t, at, 7) * Math.PI) / 180;
  let rx = Math.sin(Math.max(0, t - at) * 6) * Math.exp(-Math.max(0, t - at) * 2.6) * 0.18 + (1 - s) * 0.35;
  let ry = 0;
  let o = fadeIn;
  // a breath of air on every card
  rz += Math.sin(t * 0.9 + i * 1.7) * 0.012;
  rx += Math.sin(t * 0.7 + i * 2.3) * 0.02;
  if (i === 0) {
    ry = Math.PI * easeInOut(prog(t, FLIP, FLIP + 0.5));
    const dp = prog(t, DROP1, DROP1 + 1.3);
    dy -= 3.2 * easeIn(dp);
    rz += 0.5 * easeIn(dp);
    rx += 0.6 * easeIn(dp);
    o *= 1 - prog(t, DROP1 + 0.45, DROP1 + 1.3);
  }
  const dim = i === 0 ? 0 : 0.62 * easeInOut(prog(t, Q_AT, Q_AT + 0.8)) * (1 - easeOut(prog(t, TITLE, TITLE + 0.6)));
  const col = WHITE.clone().lerp(DIM_COL, dim);
  mats.forEach((m) => {
    m.opacity = o;
    m.color.copy(m.map ? col : col.clone().multiply(new THREE.Color('#d9cbab')));
  });
  // clip stays on the string even when the card falls
  const clipDy = 0.95 * (1 - s);
  const clipRz = (swing(t, at, 7) * Math.PI) / 180;
  return (
    <>
      <group position={[x, y0 + clipDy, 0.02]} rotation={[0, 0, clipRz * 0.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.07, 0.2, 0.06]} />
          <meshStandardMaterial color="#7a5a34" roughness={0.7} transparent opacity={fadeIn} />
        </mesh>
      </group>
      <group position={[x, y0 + dy, 0]} rotation={[rx, ry, rz]}>
        <mesh position={[0, -CARD_H / 2 - 0.04, 0]} castShadow material={mats}>
          <boxGeometry args={[CARD_W, CARD_H, 0.012]} />
        </mesh>
      </group>
    </>
  );
};

/* ---------- red string that draws itself ---------- */
const SEG = 240;
const RAD = 8;
export const RedString3: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 60; k++) {
      const x = -STR_HALF - 2 + (k / 60) * (2 * STR_HALF + 4);
      pts.push(new THREE.Vector3(x, strY(Math.max(-STR_HALF, Math.min(STR_HALF, x))), 0));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), SEG, 0.011, RAD, false);
  }, []);
  const p = easeOut(prog(t, 0.0, 1.1));
  geo.setDrawRange(0, Math.floor(p * SEG) * RAD * 6);
  const glow = 0.25 + 0.9 * Math.max(0, 1 - (t - TITLE) / 1.4) * (t >= TITLE ? 1 : 0);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#b8483b" emissive="#7a1e14" emissiveIntensity={glow} roughness={0.55} />
    </mesh>
  );
};

/* ---------- drifting gold dust ---------- */
const DUST = 220;
export const Dust3: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUST * 3), 3));
    return g;
  }, []);
  const arr = geo.attributes.position.array as Float32Array;
  for (let k = 0; k < DUST; k++) {
    const sx = rnd(k + 1) * 22 - 11, sy = rnd(k + 2) * 6 - 3.5, sz = rnd(k + 3) * 5 - 1.5;
    const sp = 0.05 + rnd(k + 4) * 0.08;
    arr[k * 3] = sx + Math.sin(t * 0.3 + k) * 0.25;
    arr[k * 3 + 1] = ((sy + t * sp + 3.5) % 6) - 3.5;
    arr[k * 3 + 2] = sz + Math.cos(t * 0.25 + k * 1.3) * 0.2;
  }
  geo.attributes.position.needsUpdate = true;
  const burst = t >= TITLE ? Math.exp(-(t - TITLE) * 1.2) : 0;
  return (
    <points geometry={geo}>
      <pointsMaterial color="#f0d59a" size={0.035} sizeAttenuation transparent opacity={0.35 + 0.5 * burst}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

/* ---------- lights ---------- */
const Lights: React.FC<{ t: number }> = ({ t }) => {
  const { pos } = camAt(t);
  const flick = 1 + 0.05 * Math.sin(t * 13.1) * Math.sin(t * 7.3 + 1) + 0.03 * Math.sin(t * 23.7);
  const up = easeOut(prog(t, 0, 1.6));
  const wide = easeInOut(prog(t, 6.0, 9.3));
  const dark = 1 - 0.8 * easeInOut(prog(t, DIM_AT, TITLE - 0.05));
  const flare = t >= TITLE ? 1 + 2.2 * Math.exp(-(t - TITLE) * 2.2) : 1;
  const k = up * dark * flare * flick;
  const followX = lerp(pos[0] + 2.2, 0, wide);
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(followX, -0.5, 0);
  target.updateMatrixWorld();
  return (
    <>
      <primitive object={target} />
      <ambientLight intensity={0.1 * up} color="#8a98c0" />
      <spotLight position={[followX + 1.2, 3.4, 4.2]} target={target}
        angle={lerp(0.42, 0.95, wide)} penumbra={0.85} decay={1.1} intensity={lerp(55, 85, wide) * k} color="#ffc98a"
        castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0006} shadow-radius={14} shadow-blurSamples={20} />
      <pointLight position={[-6, 2.5, 3]} intensity={6 * up * dark} color="#6f7d91" decay={1.2} />
    </>
  );
};

const Scene: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CamRig t={t} />
    <fog attach="fog" args={['#0f1016', 7, 26]} />
    <Lights t={t} />
    <mesh position={[0, 0, -1.7]} receiveShadow>
      <planeGeometry args={[70, 40]} />
      <meshStandardMaterial color="#262836" roughness={1} />
    </mesh>
    <RedString3 t={t} />
    {Array.from({ length: N }, (_, i) => <Card3 key={i} i={i} t={t} />)}
    <Dust3 t={t} />
  </>
);

/* ---------- Ep1-style subtitles (small serif, English line, no band) ---------- */
export const Sub: React.FC<{ t: number; at: number; out: number; zh: string; en: string; y?: number; size?: number; enSize?: number }> = ({
  t, at, out, zh, en, y = 880, size = 56, enSize = 32,
}) => {
  const o = inOut(t, at, out, 0.4, 0.3);
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(t, at, at + 0.5))) * 14;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.65, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)` }}>
      <div style={{ fontFamily: ZH, fontSize: size, fontWeight: 500, color: C.paper, letterSpacing: '0.04em', lineHeight: 1.3,
        textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}><Rich s={zh} /></div>
      <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: enSize, color: C.dim, marginTop: 10, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{en}</div>
    </div>
  );
};

const TitleCard: React.FC<{ t: number }> = ({ t }) => {
  const at = TITLE;
  if (t < at - 0.05) return null;
  const tp = easeOut(prog(t, at, at + 0.7));
  const glow = Math.min(prog(t, at, at + 0.25), 1) * lerp(0.42, 0.14, easeOut(prog(t, at + 0.25, at + 2.2)));
  const sweep = lerp(-60, 160, easeInOut(prog(t, at + 0.05, at + 1.5)));
  return (
    <AbsoluteFill>
      <Glow x={960} y={360} r={720} color="rgba(201,164,92,0.9)" opacity={glow} />
      <Dust t={t} at={at} cx={960} cy={360} seed="title3d" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center', opacity: easeOut(prog(t, at + 0.2, at + 0.8)) }}>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginRight: 22, opacity: 0.7 }} />
        <span style={{ fontFamily: ZH, fontSize: 26, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏</span>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginLeft: 8, opacity: 0.7 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 222, textAlign: 'center', opacity: prog(t, at, at + 0.2),
        transform: `scale(${lerp(1.08, 1, tp)})`, filter: `blur(${(1 - tp) * 10}px)` }}>
        <span style={{ fontFamily: ZH, fontSize: 168, fontWeight: 900, letterSpacing: '0.12em',
          backgroundImage: `linear-gradient(105deg, ${C.paper} 0%, ${C.paper} ${sweep - 14}%, ${C.goldHi} ${sweep}%, ${C.paper} ${sweep + 14}%, ${C.paper} 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          《第几个人》
        </span>
      </div>
      <Sub t={t} at={at + 0.6} out={OPEN_DUR + 1} zh="什么时候，该停止相亲？" en="When to Stop Looking" y={905} size={50} enSize={32} />
    </AbsoluteFill>
  );
};

export const Open3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const qO = Math.min(easeOut(prog(t, Q_AT, Q_AT + 0.9)), 1 - prog(t, 16.35, 16.6));
  const qBlur = (1 - easeOut(prog(t, Q_AT, Q_AT + 0.7))) * 8;
  const endFade = 1 - prog(t, OPEN_DUR - 0.5, OPEN_DUR);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill style={{ opacity: endFade }}>
        <ThreeCanvas width={width} height={height} shadows="variance" gl={{ antialias: true }}
          camera={{ fov: 34, near: 0.1, far: 80, position: [0, 0, 10] }} style={{ background: C.ink }}>
          <Scene t={t} />
        </ThreeCanvas>
        <Sub t={t} at={1.0} out={5.6} zh="假如这一生，你会遇见*10*个可能的人" en="Say you'll meet ten people who could be the one." />
        <Sub t={t} at={6.5} out={10.45} zh="他们一个一个出现，错过了，就不能回头" en="They arrive one at a time. Let one go, and they're gone." />
        {qO > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: qO, filter: `blur(${qBlur}px)` }}>
            <div style={{ fontFamily: ZH, fontSize: 76, fontWeight: 600, color: C.paper, letterSpacing: '0.12em', textShadow: '0 3px 18px rgba(0,0,0,0.9)' }}>
              你该在<span style={{ color: C.gold }}>第几个人</span>，停下来？
            </div>
            <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 34, color: C.dim, marginTop: 12 }}>When should you stop looking?</div>
          </div>
        )}
        <TitleCard t={t} />
      </AbsoluteFill>
      <Vignette strength={0.55} />
      <Grain />
    </AbsoluteFill>
  );
};
