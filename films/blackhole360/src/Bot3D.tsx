import React, { useMemo } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* 小J v2 — rounder and cuter. A soft rounded cube (big corner radius), a glossy face screen with big eyes, highlight
   dots and blush, a gold bulb antenna, gold "ear" discs, and two small floating round hands (no arms, so nothing
   bends in a strange way). Real 3D (three.js) so it can turn, tilt and be lit by the black hole later. */

export type Expr = 'normal' | 'blink' | 'wink' | 'happy' | 'worried' | 'surprised' | 'squint' | 'red';
const GOLD = '#f1c56d', INK = '#f3ede2';

/** the face screen, drawn on a canvas (512×400) */
const faceCanvas = (e: Expr) => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 400;
  const g = c.getContext('2d')!;
  // glass
  const rr = (x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const grd = g.createLinearGradient(0, 0, 0, 400); grd.addColorStop(0, '#1a2034'); grd.addColorStop(1, '#070910');
  rr(0, 0, 512, 400, 120); g.fillStyle = grd; g.fill();
  const col = e === 'red' ? '#ff6f55' : '#ffd27a';
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  g.shadowColor = col; g.shadowBlur = 26;
  const eye = (cx: number, kind: Expr | 'open') => {
    const cy = 190;
    switch (kind) {
      case 'blink': g.lineWidth = 22; g.beginPath(); g.moveTo(cx - 40, cy + 10); g.quadraticCurveTo(cx, cy + 26, cx + 40, cy + 10); g.stroke(); break;
      case 'happy': g.lineWidth = 24; g.beginPath(); g.moveTo(cx - 42, cy + 18); g.quadraticCurveTo(cx, cy - 46, cx + 42, cy + 18); g.stroke(); break;
      case 'squint': g.lineWidth = 22; g.beginPath(); const s = cx < 256 ? 1 : -1; g.moveTo(cx - 34 * s, cy - 30); g.lineTo(cx + 30 * s, cy); g.lineTo(cx - 34 * s, cy + 30); g.stroke(); break;
      case 'surprised': g.lineWidth = 20; g.beginPath(); g.arc(cx, cy, 44, 0, Math.PI * 2); g.stroke(); break;
      default: {
        const h = kind === 'worried' ? 92 : 112, w = 78, top = cy - h / 2 + (kind === 'worried' ? 14 : 0);
        rr(cx - w / 2, top, w, h, 39); g.fill();
        g.shadowBlur = 0; g.fillStyle = '#fffaf0';
        g.beginPath(); g.arc(cx + 14, top + 28, 13, 0, Math.PI * 2); g.fill(); // highlight
        g.beginPath(); g.arc(cx - 12, top + h - 30, 6, 0, Math.PI * 2); g.fill();
        g.fillStyle = col; g.shadowBlur = 26;
        if (kind === 'worried') { g.lineWidth = 16; g.beginPath(); const s = cx < 256 ? 1 : -1; g.moveTo(cx - 40 * s, top - 30); g.lineTo(cx + 34 * s, top - 14); g.stroke(); }
      }
    }
  };
  const L: Expr | 'open' = e === 'wink' || e === 'red' ? 'open' : e, R: Expr | 'open' = e === 'wink' ? 'happy' : e === 'red' ? 'open' : e;
  eye(170, L); eye(342, R);
  g.shadowBlur = 0;
  // mouth
  g.lineWidth = 14; g.strokeStyle = col;
  if (e === 'happy' || e === 'wink' || e === 'normal') { g.beginPath(); g.moveTo(232, 292); g.quadraticCurveTo(256, 316, 280, 292); g.stroke(); }
  if (e === 'surprised') { g.beginPath(); g.arc(256, 300, 14, 0, Math.PI * 2); g.fillStyle = col; g.fill(); }
  if (e === 'worried') { g.beginPath(); g.moveTo(236, 306); g.quadraticCurveTo(256, 290, 276, 306); g.stroke(); }
  // blush
  g.fillStyle = 'rgba(255,140,120,0.35)';
  g.beginPath(); g.ellipse(112, 278, 40, 18, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(400, 278, 40, 18, 0, 0, Math.PI * 2); g.fill();
  // glass sheen
  g.fillStyle = 'rgba(255,255,255,0.07)'; rr(40, 22, 230, 46, 23); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
};
const backCanvas = () => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d')!;
  g.strokeStyle = GOLD; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 84, 0, Math.PI * 2); g.stroke();
  g.fillStyle = GOLD; g.font = 'italic bold 150px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('J', 122, 136);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

export const Bot: React.FC<{ e?: Expr; pos?: [number, number, number]; yaw?: number; tilt?: number; scale?: number; handL?: number; handR?: number; bob?: number; stretch?: number }> =
  ({ e = 'normal', pos = [0, 0, 0], yaw = 0, tilt = 0, scale = 1, handL = 0, handR = 0, bob = 0, stretch = 1 }) => {
    const body = useMemo(() => new RoundedBoxGeometry(1, 0.94, 0.9, 8, 0.22), []);
    const screenGeo = useMemo(() => {
      const w = 0.7, h = 0.56, r = 0.13, sh = new THREE.Shape();
      sh.moveTo(-w / 2 + r, -h / 2); sh.lineTo(w / 2 - r, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); sh.lineTo(w / 2, h / 2 - r);
      sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); sh.lineTo(-w / 2 + r, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); sh.lineTo(-w / 2, -h / 2 + r); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      return new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 4, curveSegments: 16 });
    }, []);
    const glowTex = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(160,210,255,0.7)'); gr.addColorStop(1, 'rgba(60,120,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); }, []);
    const face = useMemo(() => faceCanvas(e), [e]);
    const back = useMemo(() => backCanvas(), []);
    const ivory = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f4eee3', roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3 }), []);
    const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.28, emissive: '#3a2608' }), []);
    const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2d38', roughness: 0.5 }), []);
    const bulb = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffcf6a', emissive: '#e8a530', emissiveIntensity: 1.1, roughness: 0.3 }), []);
    return (
      <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[tilt * 0.3, yaw, tilt]} scale={[scale, scale * stretch, scale]}>
        <mesh geometry={body} material={ivory} />
        {/* face: gold bezel + screen */}
        <mesh position={[0, 0.03, 0.43]} geometry={screenGeo} material={gold} />
        <mesh position={[0, 0.03, 0.4665]}>
          <planeGeometry args={[0.66, 0.516]} />
          <meshBasicMaterial map={face} transparent toneMapped={false} />
        </mesh>
        {/* back J */}
        <mesh position={[0, 0, -0.452]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.42, 0.42]} />
          <meshBasicMaterial map={back} transparent toneMapped={false} />
        </mesh>
        {/* ear discs */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.505 * s, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} material={gold}>
            <cylinderGeometry args={[0.13, 0.13, 0.05, 40]} />
          </mesh>
        ))}
        {/* antenna */}
        <mesh position={[0.16, 0.6, 0]} material={dark}><cylinderGeometry args={[0.022, 0.022, 0.26, 16]} /></mesh>
        <mesh position={[0.16, 0.77, 0]} material={bulb}><sphereGeometry args={[0.085, 32, 24]} /></mesh>
        {/* floating round hands (no arms) */}
        {[[-1, handL], [1, handR]].map(([s, h]) => (
          <mesh key={s} position={[0.7 * s, -0.12 + 0.36 * h, 0.06]} rotation={[0, 0, -0.5 * s * h]} material={ivory}>
            <capsuleGeometry args={[0.105, 0.07, 8, 20]} />
          </mesh>
        ))}
        {/* thruster */}
        <mesh position={[0, -0.52, 0]} material={dark}><cylinderGeometry args={[0.16, 0.12, 0.08, 32]} /></mesh>
        <sprite position={[0, -0.63, 0.05]} scale={[0.42, 0.42, 1]}>
          <spriteMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
      </group>
    );
  };

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight position={[-3, 4, 5]} intensity={2.4} color="#fff3df" />
    <directionalLight position={[4, 1, -3]} intensity={1.6} color="#8fb8ff" />
    <pointLight position={[0, -2, 2]} intensity={1.5} color="#bfe3ff" />
  </>
);
const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
const Label: React.FC<{ x: number; y: number; t: string; sub?: string }> = ({ x, y, t, sub }) => (
  <div style={{ position: 'absolute', left: x - 170, width: 340, top: y, textAlign: 'center' }}>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: INK }}>{t}</div>
    {sub && <div style={{ fontFamily: SANS, fontSize: 19, color: 'rgba(243,237,226,0.55)', marginTop: 4 }}>{sub}</div>}
  </div>
);
const BG = 'radial-gradient(ellipse at 50% 40%, #151a2a, #05060b 70%)';
// orthographic: 1 world unit = zoom px; x from -960/zoom .. 960/zoom
const Z = 200;
const X = (px: number) => (px - 960) / Z, Y = (py: number) => (540 - py) / Z;

const ModelSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: 'absolute', left: 70, top: 46, fontFamily: SERIF, fontWeight: 900, fontSize: 56, color: GOLD }}>小J · 设定图 v2</div>
    <div style={{ position: 'absolute', left: 74, top: 124, fontFamily: SANS, fontSize: 24, color: 'rgba(243,237,226,0.65)' }}>更圆、更可爱：大圆角方块身体 · 大眼睛带高光和腮红 · 金色耳朵和灯泡天线 · 两只悬浮的圆手</div>
    <ThreeCanvas width={1920} height={1080} orthographic camera={{ zoom: Z, position: [0, 0, 10] }} style={{ position: 'absolute', inset: 0 }}>
      <Lights />
      <Bot pos={[X(330), Y(540), 0]} e="normal" />
      <Bot pos={[X(790), Y(540), 0]} yaw={-0.55} tilt={0.06} e="happy" handR={0.9} />
      <Bot pos={[X(1250), Y(540), 0]} yaw={-Math.PI / 2} e="normal" />
      <Bot pos={[X(1680), Y(540), 0]} yaw={Math.PI} e="normal" />
    </ThreeCanvas>
    <Label x={330} y={780} t="正面" sub="大眼睛 + 高光 + 腮红" />
    <Label x={790} y={780} t="四分之三侧" sub="挥手：圆手直接飘起来" />
    <Label x={1250} y={780} t="侧面" sub="金色耳朵，圆滚滚的方块" />
    <Label x={1680} y={780} t="背面" sub="背后是 Juno 的 J" />
    <div style={{ position: 'absolute', left: 74, top: 900, width: 1780, fontFamily: SANS, fontSize: 22, lineHeight: 1.7, color: 'rgba(243,237,226,0.6)' }}>
      手不再是方块推进器，而是两只悬浮的圆手，没有胳膊，所以永远不会弯出奇怪的角度。身体所有边角都是大圆角；屏幕边框、耳朵、天线灯泡是金色。底部一团蓝白推进光让它飘着。
    </div>
  </AbsoluteFill>
);
const EXPR: [Expr, string, string][] = [
  ['normal', '平常', '介绍、讲解'], ['blink', '眨眼', '说完一句'], ['wink', '挤眼', '"……大概吧"'], ['happy', '开心', '"恭喜"'],
  ['worried', '担心', '"坏消息"'], ['surprised', '惊讶', '"回头看！"'], ['squint', '眯眼', '"不是我没开灯"'], ['red', '变红', '外面的人看我们'],
];
const Expressions: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: 'absolute', left: 70, top: 46, fontFamily: SERIF, fontWeight: 900, fontSize: 56, color: GOLD }}>小J · 表情 v2</div>
    <ThreeCanvas width={1920} height={1080} orthographic camera={{ zoom: 150, position: [0, 0, 10] }} style={{ position: 'absolute', inset: 0 }}>
      <Lights />
      {EXPR.map(([e], i) => <Bot key={e} e={e} yaw={-0.32} pos={[(250 + (i % 4) * 470 - 960) / 150, (540 - (350 + Math.floor(i / 4) * 380)) / 150, 0]} handL={e === 'happy' ? 0.8 : e === 'surprised' ? 0.9 : 0} handR={e === 'happy' || e === 'surprised' ? 0.9 : 0} />)}
    </ThreeCanvas>
    {EXPR.map(([, t, sub], i) => <Label key={t} x={250 + (i % 4) * 470} y={480 + Math.floor(i / 4) * 380} t={t} sub={sub} />)}
  </AbsoluteFill>
);
const Bubble: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => (
  <div style={{ position: 'absolute', left: x, top: y, padding: '18px 28px', borderRadius: 30, background: 'rgba(12,14,24,0.88)', border: `2px solid ${GOLD}`, whiteSpace: 'nowrap',
    fontFamily: SANS, fontWeight: 700, fontSize: 44, color: INK, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>{t}</div>
);
const InShot: React.FC<{ bg: string; x: number; y: number; s: number; yaw: number; e: Expr; handR?: number; t: string; bx: number; by: number; title: string }> = ({ bg, x, y, s, yaw, e, handR = 0, t, bx, by, title }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Img src={staticFile(bg)} style={{ width: 1920, height: 1080, objectFit: 'cover' }} />
    <ThreeCanvas width={1920} height={1080} orthographic camera={{ zoom: 200, position: [0, 0, 10] }} style={{ position: 'absolute', inset: 0 }}>
      <Lights />
      <Bot pos={[X(x), Y(y), 0]} scale={s} yaw={yaw} tilt={0.08} e={e} handR={handR} />
    </ThreeCanvas>
    <Bubble x={bx} y={by} t={t} />
    <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: 'rgba(243,237,226,0.7)', background: 'rgba(0,0,0,0.45)', padding: '6px 14px', borderRadius: 8 }}>{title}</div>
  </AbsoluteFill>
);

export const Bot3DSheets: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f === 0 && <ModelSheet />}
      {f === 1 && <Expressions />}
      {f === 2 && <InShot bg="bg1.jpg" x={440} y={600} s={0.95} yaw={0.4} e="wink" handR={0.9} t="嗨，我是这趟的向导，小J。" bx={600} by={430} title="0:00 · 打招呼" />}
      {f === 3 && <InShot bg="bg2.jpg" x={1500} y={340} s={0.75} yaw={-0.45} e="squint" t="左边亮、右边暗，不是我没开灯。" bx={640} by={150} title="0:25 · 靠近" />}
    </AbsoluteFill>
  );
};
