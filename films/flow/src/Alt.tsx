import {noise2D, noise3D} from '@remotion/noise';
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, mulberry} from './lib';
import {Light, SANS, SERIF} from './look';

/* Three alternative art directions for the flow film (the owner is tired of navy + gold particles).
   A: ink on paper (cream paper, black ink, one vermilion accent): flow as ink drifting in water.
   B: flat poster (cobalt, orange, black; heavy type, hard shapes).
   C: flow-field aurora (thousands of streamlines in a curl-noise field, cyan → violet → pink).
   Each look has two frames: the cold open and the flow channel. 6 s per frame. */
export const ALT_FRAMES = 36 * FPS;
const W = 1920;
const H = 1080;

// a 2D flow field from noise (curl of a potential, so streamlines swirl without sinks)
const curl = (x: number, y: number, t: number, s = 0.0016) => {
  const e = 0.5;
  const n1 = noise3D('f', x * s, (y + e) * s, t);
  const n2 = noise3D('f', x * s, (y - e) * s, t);
  const n3 = noise3D('f', (x + e) * s, y * s, t);
  const n4 = noise3D('f', (x - e) * s, y * s, t);
  return [(n1 - n2) / (2 * e), -(n3 - n4) / (2 * e)];
};
const SEEDS = (() => {
  const r = mulberry(5);
  return Array.from({length: 2200}, () => [r() * W, r() * H, r()]);
})();

const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#f1ebdf'}}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.35}}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0.35 0" />
      </filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
    {children}
  </AbsoluteFill>
);
const InkCanvas: React.FC<{draw: (c: CanvasRenderingContext2D) => void; t: number}> = ({draw, t}) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => {
    const c = ref.current!.getContext('2d')!;
    c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = 'multiply';
    draw(c);
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} data-t={t} />;
};
const InkText: React.FC<{zh: string; hl: string; end: string}> = ({zh, hl, end}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: '#14141a', letterSpacing: '0.04em'}}>
    {zh}
    <span style={{color: '#d9452b'}}>{hl}</span>
    {end}
  </div>
);

// ------------------------------------------------------------------ A. ink
const InkOpen: React.FC<{t: number}> = ({t}) => {
  const draw = (c: CanvasRenderingContext2D) => {
    // ink released at one point, drifting along the field: each seed traced a short way
    for (let i = 0; i < 1400; i++) {
      const [sx, sy, w] = SEEDS[i];
      const a = (sx / W) * Math.PI * 2;
      const r0 = 20 + w * 380 * Math.min(1, t / 5);
      let x = 820 + Math.cos(a) * r0 * (0.6 + 0.4 * (sy / H));
      let y = 520 + Math.sin(a) * r0 * 0.7;
      c.strokeStyle = `rgba(20,20,26,${0.1 + 0.14 * (1 - w)})`;
      c.lineWidth = 0.8 + 2.2 * (1 - w);
      c.beginPath();
      c.moveTo(x, y);
      for (let k = 0; k < 26; k++) {
        const [vx, vy] = curl(x, y, t * 0.05);
        x += vx * 900;
        y += vy * 900;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    // the clock as one brush ring, the hand in vermilion
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = 'rgba(20,20,26,0.85)';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(1460, 300, 120, -1.2, 4.6);
    c.stroke();
    c.strokeStyle = '#d9452b';
    c.lineWidth = 5;
    c.lineCap = 'round';
    const m = t * 3.2;
    c.beginPath();
    c.moveTo(1460, 300);
    c.lineTo(1460 + Math.sin(m) * 95, 300 - Math.cos(m) * 95);
    c.stroke();
  };
  return (
    <Paper>
      <InkCanvas draw={draw} t={t} />
      <InkText zh="你有没有过：做一件事，一抬头，" hl="天黑了" end="？" />
    </Paper>
  );
};
const InkChannel: React.FC<{t: number}> = ({t}) => {
  const draw = (c: CanvasRenderingContext2D) => {
    const x0 = 380;
    const y0 = 820;
    const x1 = 1520;
    const y1 = 150;
    c.strokeStyle = 'rgba(20,20,26,0.9)';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(x0, y1 - 20);
    c.lineTo(x0, y0);
    c.lineTo(x1 + 30, y0);
    c.stroke();
    // the channel: an ink wash streaming up the diagonal
    const r = mulberry(3);
    for (let i = 0; i < 900; i++) {
      const s = (r() + t * 0.05) % 1;
      const off = (r() - 0.5) * 0.2;
      const x = x0 + s * (x1 - x0);
      const y = y0 - (s + off) * (y0 - y1);
      c.strokeStyle = `rgba(20,20,26,${0.08 + r() * 0.12})`;
      c.lineWidth = 1 + r() * 3;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 40, y - 24);
      c.stroke();
    }
    // anxiety: scratchy vermilion marks; boredom: a few faint dots
    for (let i = 0; i < 160; i++) {
      const x = x0 + 40 + r() * 420;
      const y = y1 + 40 + r() * 330;
      c.strokeStyle = 'rgba(217,69,43,0.6)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (r() - 0.5) * 30 + Math.sin(t * 20 + i) * 4, y + (r() - 0.5) * 30);
      c.stroke();
    }
    for (let i = 0; i < 60; i++) {
      c.fillStyle = 'rgba(20,20,26,0.25)';
      c.beginPath();
      c.arc(x1 - 420 + r() * 380, y0 - 60 - r() * 220, 2, 0, Math.PI * 2);
      c.fill();
    }
  };
  return (
    <Paper>
      <InkCanvas draw={draw} t={t} />
      <div style={{position: 'absolute', left: 470, top: 250, fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: '#d9452b'}}>焦虑</div>
      <div style={{position: 'absolute', left: 1240, top: 640, fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: 'rgba(20,20,26,0.4)'}}>无聊</div>
      <div style={{position: 'absolute', left: 1140, top: 210, fontFamily: SERIF, fontWeight: 900, fontSize: 72, color: '#14141a'}}>心流</div>
      <InkText zh="难一点焦虑，易一点无聊，刚刚好，就是" hl="心流" end="" />
    </Paper>
  );
};

// ------------------------------------------------------------------ B. poster
const PosterOpen: React.FC<{t: number}> = ({t}) => {
  const m = t * 3.2;
  return (
    <AbsoluteFill style={{background: '#1f3bff'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <circle cx={1380} cy={430} r={330} fill="#ff6a2b" />
        <line x1={1380} y1={430} x2={1380 + Math.sin(m) * 290} y2={430 - Math.cos(m) * 290} stroke="#0d0d12" strokeWidth={26} strokeLinecap="round" />
        <line x1={1380} y1={430} x2={1380 + Math.sin(m / 12) * 190} y2={430 - Math.cos(m / 12) * 190} stroke="#0d0d12" strokeWidth={36} strokeLinecap="round" />
        <circle cx={1380} cy={430} r={26} fill="#0d0d12" />
        {Array.from({length: 12}, (_, k) => {
          const a = (k / 12) * Math.PI * 2;
          return <rect key={k} x={1380 + Math.sin(a) * 300 - 8} y={430 - Math.cos(a) * 300 - 8} width={16} height={16} fill="#0d0d12" />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 210, fontFamily: SANS, fontWeight: 900, fontSize: 150, lineHeight: 1.02, color: '#f4efe4', letterSpacing: '-0.02em'}}>
        一抬头
        <br />
        <span style={{color: '#ff6a2b'}}>天黑了</span>
      </div>
      <div style={{position: 'absolute', left: 124, top: 560, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: '#f4efe4'}}>你有没有过这种时候？</div>
    </AbsoluteFill>
  );
};
const PosterChannel: React.FC<{t: number}> = ({t}) => {
  const r = mulberry(7);
  const tri = Array.from({length: 26}, () => [380 + r() * 460, 130 + r() * 330, r() * 6.28]);
  const sq = Array.from({length: 18}, () => [1140 + r() * 520, 560 + r() * 260]);
  return (
    <AbsoluteFill style={{background: '#f4efe4'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <polygon points="300,900 450,900 1750,120 1600,120" fill="#1f3bff" />
        {Array.from({length: 9}, (_, k) => {
          const s = (k / 9 + t * 0.08) % 1;
          return <circle key={k} cx={375 + s * 1300} cy={900 - s * 780} r={22} fill="#ff6a2b" />;
        })}
        {tri.map(([x, y, a], k) => (
          <polygon key={k} transform={`translate(${x + Math.sin(t * 18 + k) * 4},${y}) rotate(${(a * 180) / Math.PI + t * 90})`} points="0,-22 19,11 -19,11" fill="#e8402a" />
        ))}
        {sq.map(([x, y], k) => (
          <rect key={k} x={x} y={y} width={18} height={18} fill="#b9b3a6" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 380, top: 470, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#e8402a'}}>焦虑</div>
      <div style={{position: 'absolute', left: 1400, top: 860, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#8d877b'}}>无聊</div>
      <div style={{position: 'absolute', left: 960, top: 270, fontFamily: SANS, fontWeight: 900, fontSize: 120, color: '#0d0d12', transform: 'rotate(-31deg)'}}>心流</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ C. flow-field aurora
const hue = (u: number) => {
  // cyan → violet → pink
  const a = [
    [56, 222, 255],
    [142, 92, 255],
    [255, 86, 170],
  ];
  const k = Math.min(1.999, Math.max(0, u * 2));
  const i = Math.floor(k);
  const f = k - i;
  return a[i].map((v, j) => Math.round(v + (a[i + 1][j] - v) * f));
};
const AuroraOpen: React.FC<{t: number}> = ({t}) => {
  const draw = (c: CanvasRenderingContext2D) => {
    for (let i = 0; i < 2200; i++) {
      let [x, y] = SEEDS[i];
      const w = SEEDS[i][2];
      const [rr, gg, bb] = hue((((y / H + 0.3 * noise2D('h', x * 0.001, t * 0.05)) % 1) + 1) % 1);
      c.strokeStyle = `rgba(${rr},${gg},${bb},${0.14 + 0.26 * w})`;
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(x, y);
      for (let k = 0; k < 40; k++) {
        const [vx, vy] = curl(x + t * 40, y, t * 0.03, 0.0012);
        x += vx * 700 + 2.2;
        y += vy * 700;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    // the worker: a calm white point the streams bend around
    const g = c.createRadialGradient(900, 540, 0, 900, 540, 90);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.15, 'rgba(200,230,255,0.4)');
    g.addColorStop(1, 'rgba(120,160,255,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(900, 540, 90, 0, Math.PI * 2);
    c.fill();
  };
  return (
    <AbsoluteFill style={{background: '#07070d'}}>
      <Light draw={draw} deps={[t]} bloom={0.8} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 46, color: '#eef3ff'}}>
        你有没有过：做一件事，一抬头，<span style={{color: '#7fe6ff'}}>天黑了</span>？
      </div>
    </AbsoluteFill>
  );
};
const AuroraChannel: React.FC<{t: number}> = ({t}) => {
  const draw = (c: CanvasRenderingContext2D) => {
    const x0 = 380;
    const y0 = 820;
    const x1 = 1520;
    const y1 = 150;
    c.strokeStyle = 'rgba(220,230,255,0.5)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x0, y1 - 20);
    c.lineTo(x0, y0);
    c.lineTo(x1 + 30, y0);
    c.stroke();
    const r = mulberry(11);
    for (let i = 0; i < 1600; i++) {
      const u = r();
      const v = r();
      const d = v - u;
      let x = x0 + u * (x1 - x0);
      let y = y0 - v * (y0 - y1);
      c.beginPath();
      c.moveTo(x, y);
      if (Math.abs(d) < 0.1) {
        // laminar: streams run cleanly up the channel
        const [rr, gg, bb] = hue(0.1 + u * 0.5);
        c.strokeStyle = `rgba(${rr},${gg},${bb},0.75)`;
        c.lineWidth = 2;
        const s = 26 + 10 * Math.sin(t * 2 + i);
        c.lineTo(x + s, y - s * 0.59);
      } else if (d > 0) {
        // turbulent: tight hot curls
        c.strokeStyle = 'rgba(255,80,110,0.5)';
        c.lineWidth = 1.2;
        for (let k = 0; k < 10; k++) {
          const [vx, vy] = curl(x, y, t * 0.3 + i, 0.02);
          x += vx * 40;
          y += vy * 40;
          c.lineTo(x, y);
        }
      } else {
        // stagnant: short grey stubs
        c.strokeStyle = 'rgba(140,150,170,0.18)';
        c.lineTo(x + 4, y);
      }
      c.stroke();
    }
  };
  return (
    <AbsoluteFill style={{background: '#07070d'}}>
      <Light draw={draw} deps={[t]} bloom={0.8} />
      <div style={{position: 'absolute', left: 480, top: 250, fontFamily: SANS, fontWeight: 800, fontSize: 48, color: '#ff6a8a'}}>焦虑</div>
      <div style={{position: 'absolute', left: 1250, top: 640, fontFamily: SANS, fontWeight: 800, fontSize: 48, color: 'rgba(170,180,200,0.6)'}}>无聊</div>
      <div style={{position: 'absolute', left: 1120, top: 200, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#9fd8ff'}}>心流</div>
    </AbsoluteFill>
  );
};

export const Alt: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const k = Math.floor(T / 6);
  const t = T - k * 6;
  const F = [InkOpen, InkChannel, PosterOpen, PosterChannel, AuroraOpen, AuroraChannel][Math.min(5, k)];
  return <F t={t} />;
};
