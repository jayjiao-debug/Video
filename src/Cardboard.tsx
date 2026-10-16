/* 《生命平等吗？》 look D · 纸板手偶 (after the 生姜蛋包饭 reference the owner sent): marker drawings on cut-out cardboard,
   each on a wooden stick, in front of a soft out-of-focus world. Everything is drawn in code.
   Frames: 0 = cold open (the cat under the lamp), 1 = 庄子 vs 惠子 with cardboard speech bubbles, 2 = 苏丹. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import '@fontsource/ma-shan-zheng';
import { Canvas } from './kit';

type G = CanvasRenderingContext2D;
type Pt = [number, number];
const W = 1920, H = 1080;
let seed = 1;
const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const BRUSH = '"Ma Shan Zheng", serif', SANS = '"Noto Sans CJK SC", sans-serif';
const MARK = '#1d1915';

/* ------------------------------------------------------------ shapes */
type Shape = { pts: Pt[]; closed: boolean };
const ell = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = Math.PI * 2, n = 44): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 22): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });
const C = (pts: Pt[]): Shape => ({ pts, closed: true });
const O = (pts: Pt[]): Shape => ({ pts, closed: false });
const path = (g: G, s: Shape) => { g.beginPath(); s.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (s.closed) g.closePath(); };

/** marker line: slightly wobbly, round, with a faint second pass */
const marker = (g: G, s: Shape, w = 7, col = MARK) => {
  for (let p = 0; p < 2; p++) {
    g.beginPath();
    s.pts.forEach(([x, y], i) => { const xx = x + (rand() - 0.5) * 1.6, yy = y + (rand() - 0.5) * 1.6; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); });
    if (s.closed) g.closePath();
    g.lineWidth = p ? w * 0.55 : w; g.strokeStyle = col; g.globalAlpha = p ? 0.35 : 0.95; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
  }
  g.globalAlpha = 1;
};
const dot = (g: G, x: number, y: number, r: number) => { g.fillStyle = MARK; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };

/** a cardboard cut-out: the union of the body shapes grown by `m` px (a fat stroke does the growing), with thickness,
 *  a cast shadow, a kraft texture and a lit edge. Then `ink` draws the marker drawing on top. Optional stick. */
const cutout = (g: G, body: Shape[], ink: (g: G) => void, o: { x: number; y: number; s?: number; rot?: number; m?: number; stick?: number; light?: number; tint?: string }) => {
  const s = o.s ?? 1, m = o.m ?? 16, rot = o.rot ?? 0;
  const tf = (gg: G) => { gg.translate(o.x, o.y); gg.rotate(rot); gg.scale(s, s); };
  const solid = (gg: G, col: string, dx = 0, dy = 0) => {
    gg.save(); gg.translate(dx, dy); gg.fillStyle = col; gg.strokeStyle = col; gg.lineWidth = m * 2; gg.lineJoin = 'round'; gg.lineCap = 'round';
    for (const b of body) { path(gg, b); if (b.closed) gg.fill(); gg.stroke(); }
    gg.restore();
  };
  // stick (behind the card)
  if (o.stick) {
    g.save(); tf(g);
    const sg = g.createLinearGradient(-14, 0, 14, 0); sg.addColorStop(0, '#b98d5c'); sg.addColorStop(0.5, '#e0bd8c'); sg.addColorStop(1, '#a87c4d');
    g.fillStyle = sg; g.fillRect(-13, -40, 26, o.stick + 40);
    g.restore();
  }
  // cast shadow
  g.save(); g.filter = 'blur(14px)'; g.globalAlpha = 0.45; tf(g); solid(g, 'rgba(10,6,2,1)', 18, 22); g.restore(); g.filter = 'none'; g.globalAlpha = 1;
  // thickness (the cut edge)
  g.save(); tf(g); solid(g, '#7d5d3a', 5, 7); solid(g, '#9b7649', 2.5, 3.5); g.restore();
  // face of the card, textured, on its own layer
  const L = document.createElement('canvas'); L.width = W; L.height = H; const l = L.getContext('2d')!;
  l.save(); tf(l); solid(l, o.tint ?? '#c9a272'); l.restore();
  l.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 2600; i++) { l.globalAlpha = rand() * 0.12; l.fillStyle = rand() < 0.5 ? '#6d4f2e' : '#f0d6aa'; l.fillRect(rand() * W, rand() * H, 1 + rand() * 3, 1 + rand() * 2); }
  l.globalAlpha = 0.05; l.strokeStyle = '#5a4026'; l.lineWidth = 2;
  for (let y = 0; y < H; y += 9) { l.beginPath(); l.moveTo(0, y); l.lineTo(W, y + 30); l.stroke(); }   // faint corrugation
  l.globalAlpha = 1;
  const lg = l.createLinearGradient(o.x - 300, o.y - 400, o.x + 300, o.y + 200); lg.addColorStop(0, `rgba(255,236,200,${0.28 * (o.light ?? 1)})`); lg.addColorStop(1, 'rgba(40,20,0,.18)');
  l.fillStyle = lg; l.fillRect(0, 0, W, H);
  l.globalCompositeOperation = 'source-over';
  l.save(); tf(l); ink(l); l.restore();
  g.drawImage(L, 0, 0);
};

/* ------------------------------------------------------------ backgrounds (soft focus) */
const bokeh = (g: G, n: number, cols: string[], y0: number, y1: number, r0: number, r1: number) => {
  for (let i = 0; i < n; i++) { const x = rand() * W, y = y0 + rand() * (y1 - y0), r = r0 + rand() * (r1 - r0); const gr = g.createRadialGradient(x, y, 0, x, y, r); const c = cols[i % cols.length]; gr.addColorStop(0, `rgba(${c},.55)`); gr.addColorStop(0.7, `rgba(${c},.35)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
};
const blurred = (g: G, draw: (g: G) => void, px = 22) => {
  const L = document.createElement('canvas'); L.width = W; L.height = H; const l = L.getContext('2d')!; draw(l);
  g.save(); g.filter = `blur(${px}px)`; g.drawImage(L, 0, 0); g.restore(); g.filter = 'none';
};
const vignette = (g: G, a = 0.55) => { const v = g.createRadialGradient(W / 2, H * 0.45, 380, W / 2, H / 2, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H); };

/* ------------------------------------------------------------ characters (local coords, feet/bottom at y=0) */
const CAT = {
  body: [C(ell(0, -95, 82, 95)), C(ell(-6, -215, 68, 60)), C([[-58, -250], [-62, -312], [-20, -268]]), C([[32, -268], [58, -314], [62, -250]]), O(bez([70, -40], [150, -40], [150, -130], [112, -150]))],
  ink: (g: G) => {
    marker(g, O([...ell(0, -95, 82, 95, Math.PI * 1.15, Math.PI * 1.85 + Math.PI * 2 * 0)])); marker(g, O(ell(0, -95, 82, 95, -0.2, Math.PI * 1.05)));
    marker(g, C([[-56, -244], [-60, -306], [-22, -270]])); marker(g, C([[30, -270], [56, -308], [60, -246]]));
    marker(g, O(ell(-6, -215, 68, 60, Math.PI * 0.95, Math.PI * 2.05)));
    marker(g, O(bez([70, -40], [150, -40], [150, -130], [112, -150])));
    // sad, closed eyes; small nose; whiskers
    marker(g, O(bez([-40, -222], [-34, -212], [-22, -212], [-16, -222])), 6); marker(g, O(bez([6, -222], [12, -212], [24, -212], [30, -222])), 6);
    marker(g, O([[-12, -196], [-2, -190], [6, -196]]), 5);
    marker(g, O([[-30, -192], [-80, -200]]), 3.5); marker(g, O([[-30, -184], [-78, -178]]), 3.5); marker(g, O([[24, -192], [74, -200]]), 3.5); marker(g, O([[24, -184], [72, -178]]), 3.5);
    marker(g, O([[-30, -10], [-20, -60]]), 5); marker(g, O([[20, -10], [14, -60]]), 5);
  },
};
const LAMP = {
  body: [C([[-14, 0], [-14, -620], [14, -620], [14, 0]]), O(bez([0, -620], [0, -700], [110, -700], [130, -650])), C([[90, -650], [170, -650], [150, -615], [110, -615]])],
  ink: (g: G) => { marker(g, O([[-14, 0], [-14, -610]])); marker(g, O([[14, 0], [14, -610]])); marker(g, O(bez([0, -620], [0, -700], [110, -700], [130, -650]))); marker(g, C([[90, -650], [170, -650], [150, -615], [110, -615]])); for (let i = 1; i < 6; i++) marker(g, O([[-12, -i * 100], [12, -i * 100 - 6]]), 4); },
};
/** robe + head; kind 'zhuang' (topknot, long beard, smiling) / 'hui' (cap, skeptical) */
const sage = (kind: 'zhuang' | 'hui') => ({
  body: [C([[-120, 0], [-100, -230], [-40, -270], [40, -270], [100, -230], [120, 0]]), C(ell(0, -350, 78, 88)),
    ...(kind === 'zhuang' ? [C(ell(0, -452, 34, 26)), C(bez([-40, -300], [-40, -200], [40, -200], [40, -300]))] : [C([[-70, -420], [-56, -500], [56, -500], [70, -420]])])],
  ink: (g: G) => {
    marker(g, C([[-120, 0], [-100, -230], [-40, -270], [40, -270], [100, -230], [120, 0]]));
    marker(g, O([[-40, -270], [0, -200], [40, -270]])); marker(g, O([[0, -200], [0, -40]]), 5);
    marker(g, O([[-100, -230], [-70, -120], [-30, -110]]), 6); marker(g, O([[100, -230], [70, -120], [30, -110]]), 6);
    marker(g, C(ell(0, -350, 78, 88)));
    if (kind === 'zhuang') {
      marker(g, C(ell(0, -452, 34, 26))); marker(g, O([[-60, -456], [62, -446]]), 5);
      marker(g, O(bez([-40, -300], [-40, -200], [40, -200], [40, -300]))); for (const x of [-20, 0, 20]) marker(g, O([[x, -296], [x * 0.8, -232]]), 3.5);
      marker(g, O(bez([-44, -362], [-36, -376], [-20, -376], [-12, -362])), 6); marker(g, O(bez([12, -362], [20, -376], [36, -376], [44, -362])), 6);   // ^ ^
      marker(g, O(bez([-18, -318], [-8, -308], [8, -308], [18, -318])), 5);
    } else {
      marker(g, C([[-70, -420], [-56, -500], [56, -500], [70, -420]])); marker(g, O([[-86, -420], [86, -420]]));
      marker(g, O([[-46, -392], [-14, -384]]), 6); marker(g, O([[14, -378], [46, -392]]), 6);    // one brow raised
      dot(g, -28, -360, 7); dot(g, 30, -360, 7);
      marker(g, O([[-18, -310], [18, -314]]), 5); marker(g, O(bez([-14, -296], [-8, -270], [8, -270], [14, -296])), 5);
    }
  },
});
const bubble = (w: number, h: number, side: number): { body: Shape[]; tail: Shape } => {
  const r = 46, pts: Pt[] = [];
  const rr = (cx: number, cy: number, a0: number) => ell(cx, cy, r, r, a0, a0 + Math.PI / 2, 8);
  pts.push(...rr(w / 2 - r, -h + r, -Math.PI / 2), ...rr(w / 2 - r, -r, 0));
  pts.push([side * 30 + 40, 0], [side * 120, 70], [side * 30 - 40, 0]);
  pts.push(...rr(-w / 2 + r, -r, Math.PI / 2), ...rr(-w / 2 + r, -h + r, Math.PI));
  return { body: [C(pts)], tail: C(pts) };
};
const RHINO = {
  body: [C(ell(0, -175, 230, 125)), C(ell(-250, -140, 108, 72)), C([[-338, -168], [-384, -282], [-312, -190]]), C([[-284, -198], [-300, -254], [-262, -208]]),
    C([[-150, -80], [-150, 0], [-90, 0], [-90, -80]]), C([[120, -80], [120, 0], [180, 0], [180, -80]]), C(ell(-196, -214, 20, 30))],
  ink: (g: G) => {
    marker(g, O(ell(0, -175, 230, 125, -Math.PI * 0.84, Math.PI * 0.8)));
    marker(g, O(ell(-250, -140, 108, 72, Math.PI * 0.42, Math.PI * 1.62)));
    marker(g, C([[-338, -168], [-384, -282], [-312, -190]])); marker(g, C([[-284, -198], [-300, -254], [-262, -208]]));
    marker(g, O([[-150, -80], [-150, 0], [-90, 0], [-90, -64]])); marker(g, O([[120, -70], [120, 0], [180, 0], [180, -80]]));
    marker(g, C(ell(-196, -214, 20, 30)));
    marker(g, O(bez([-268, -160], [-262, -150], [-248, -150], [-242, -160])), 6);   // a closed, tired eye
    marker(g, O(bez([-345, -118], [-320, -104], [-300, -104], [-290, -112])), 4);   // mouth
    marker(g, O(bez([-60, -120], [0, -100], [60, -110], [120, -130])), 4); marker(g, O([[228, -180], [260, -150]]), 5);
  },
};

/* ------------------------------------------------------------ the frames */
const draw = (g: G, f: number) => {
  seed = 11 + f * 7;
  if (f === 0) {
    blurred(g, (b) => {
      const sky = b.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#141a26'); sky.addColorStop(0.6, '#2a2c35'); sky.addColorStop(1, '#3a3430'); b.fillStyle = sky; b.fillRect(0, 0, W, H);
      bokeh(b, 26, ['255,190,110', '255,214,150', '140,170,220'], 120, 640, 30, 90);
      b.fillStyle = '#2b2622'; b.fillRect(0, 760, W, H);
      const pool = b.createRadialGradient(1080, 830, 0, 1080, 830, 520); pool.addColorStop(0, 'rgba(255,200,120,.55)'); pool.addColorStop(1, 'rgba(255,200,120,0)'); b.fillStyle = pool; b.fillRect(0, 500, W, 600);
    }, 18);
    const gl = g.createRadialGradient(1160, 300, 0, 1160, 300, 700); gl.addColorStop(0, 'rgba(255,200,120,.35)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
    cutout(g, LAMP.body, LAMP.ink, { x: 900, y: 930, s: 1.0, rot: 0.01, stick: 300, light: 0.8 });
    cutout(g, CAT.body, CAT.ink, { x: 1180, y: 900, s: 1.05, rot: -0.04, stick: 300 });
    vignette(g, 0.6);
  } else if (f === 1) {
    blurred(g, (b) => {
      const sky = b.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#cfe0d6'); sky.addColorStop(1, '#9fb9a6'); b.fillStyle = sky; b.fillRect(0, 0, W, H);
      for (let i = 0; i < 18; i++) { b.fillStyle = `rgba(${70 + rand() * 40},${110 + rand() * 40},${70 + rand() * 30},.7)`; b.beginPath(); b.ellipse(rand() * W, 200 + rand() * 300, 140 + rand() * 160, 90 + rand() * 90, 0, 0, 7); b.fill(); }
      b.fillStyle = '#7fa9ad'; b.fillRect(0, 700, W, 380);
      bokeh(b, 22, ['255,255,235', '230,245,255'], 700, 1000, 14, 40);
    }, 20);
    // a cardboard bridge rail in front
    cutout(g, [O(bez([-900, 0], [-400, -120], [400, -120], [900, 0], 30)), C([[-900, 0], [-900, 60], [900, 60], [900, 0]])], (l) => {
      marker(l, O(bez([-900, 0], [-400, -120], [400, -120], [900, 0], 30))); for (let i = -7; i <= 7; i++) { const x = i * 110, y = -120 * (1 - (i / 8.2) ** 2) + 10; marker(l, O([[x, y], [x, 50]]), 5); }
    }, { x: 960, y: 960, s: 1, m: 14 });
    const Z = sage('zhuang'), Hh = sage('hui');
    cutout(g, Z.body, Z.ink, { x: 470, y: 980, s: 1.0, rot: 0.03, stick: 200 });
    cutout(g, Hh.body, Hh.ink, { x: 1450, y: 980, s: 1.0, rot: -0.04, stick: 200 });
    const b1 = bubble(420, 170, -1), b2 = bubble(500, 220, 1);
    cutout(g, b1.body, (l) => { marker(l, b1.tail, 6); }, { x: 880, y: 300, s: 1, rot: -0.03, m: 8, tint: '#e9d2a8' });
    cutout(g, b2.body, (l) => { marker(l, b2.tail, 6); }, { x: 1040, y: 560, s: 1, rot: 0.03, m: 8, tint: '#e9d2a8' });
    vignette(g, 0.4);
  } else {
    blurred(g, (b) => {
      const sky = b.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#f1b57a'); sky.addColorStop(0.55, '#e9925f'); sky.addColorStop(0.62, '#a8754e'); sky.addColorStop(1, '#6b5038'); b.fillStyle = sky; b.fillRect(0, 0, W, H);
      const sun = b.createRadialGradient(1400, 560, 0, 1400, 560, 260); sun.addColorStop(0, 'rgba(255,240,200,.95)'); sun.addColorStop(1, 'rgba(255,200,140,0)'); b.fillStyle = sun; b.fillRect(0, 0, W, H);
      b.fillStyle = 'rgba(60,40,30,.75)'; for (const [x, w2] of [[300, 260], [760, 180], [1650, 300]]) { b.beginPath(); b.ellipse(x, 600, w2, 50, 0, 0, 7); b.fill(); b.fillRect(x - 8, 600, 16, 90); }
    }, 22);
    cutout(g, RHINO.body, RHINO.ink, { x: 1010, y: 900, s: 1.25, rot: 0.02, stick: 260, light: 1.1 });
    // a small cardboard name tag on a string
    cutout(g, [C([[-130, -70], [130, -70], [130, 70], [-130, 70]])], () => {}, { x: 520, y: 380, s: 1, rot: -0.08, m: 6, tint: '#e3c696' });
    vignette(g, 0.5);
  }
};

const Txt: React.FC<{ x: number; y: number; s: string; size: number; rot?: number; w?: number; col?: string }> = ({ x, y, s, size, rot = 0, w = 600, col = MARK }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, textAlign: 'center', fontFamily: BRUSH, fontSize: size, color: col, transform: `rotate(${rot}rad)`, lineHeight: 1.2, whiteSpace: 'pre', opacity: 0.92 }}>{s}</div>
);
const Sub: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: '0.04em', color: '#f6f0e4', textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,.9)' }}>{s}</div>
);

export const Cardboard: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(['40px "Ma Shan Zheng"', '700 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, '鱼真快乐子非安知之乐？。苏丹岁最后一只雄性北方白犀牛路边猫被车撞了惠问你不是怎么道它叫全世界都为难过45').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {ok && <>
        <Canvas dep={f} draw={(g) => draw(g, f)} />
        {f === 0 && <Sub s="路边一只猫被车撞了" />}
        {f === 1 && <>
          <Txt x={880} y={176} s="鱼真快乐。" size={70} rot={-0.03} />
          <Txt x={1040} y={386} s={'子非鱼，\n安知鱼之乐？'} size={66} rot={0.03} />
        </>}
        {f === 2 && <>
          <Txt x={520} y={322} s={'苏丹\n45岁'} size={60} rot={-0.08} />
          <Sub s="世界上最后一只雄性北方白犀牛死了" />
        </>}
      </>}
    </AbsoluteFill>
  );
};
