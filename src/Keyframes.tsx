/* 《倒挂飞车》 key frames for the owner's approval: six moments of the one-take film plus the car's model sheet. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { F, FontFaces, FONT_LOADS, Grain, Bars, Subs, Canvas, glowDot } from './kit';
import {
  sky, mesas, mast, ground, rig, car, plume, arrow, ribbon, vehicle, hangar, withCam, toScreen, poseOnTrack, freePose, carToWorld, carDir,
  R, RW, S_TOP, DECK_END, GOLD, CYAN, RED, WARM, NOZZLES, type Cam, type Pose,
} from './world';
import { JUNO } from './brand/identity';

type G = CanvasRenderingContext2D;
const MASTS = [2700, -1200, -3600, -6200, -8600, -11200];

/** the set: sky and far layers in screen space, then the world through the camera */
const stage = (g: G, T: number, cam: Cam, o: { freeze?: number; hangarOn?: boolean; vehicles?: boolean } = {}) => {
  const groundY = 540 + (0 - cam.y) * cam.s, horizon = 540 + (0 - cam.y) * cam.s * 0.22 - 40;
  g.save();
  if (o.freeze) g.filter = `saturate(${1 - 0.5 * o.freeze}) brightness(${1 - 0.25 * o.freeze})`;
  g.save(); g.translate(960, 540); g.rotate(cam.r ?? 0); g.translate(-960, -540);
  sky(g, 1920, 1080, horizon); mesas(g, 1920, horizon, cam.x);
  // the desert floor between the horizon and the near ground
  const df = g.createLinearGradient(0, horizon, 0, Math.max(horizon + 10, groundY)); df.addColorStop(0, '#2a1e30'); df.addColorStop(1, '#17131d');
  g.fillStyle = df; g.fillRect(-200, horizon, 2400, Math.max(0, groundY - horizon) + 4);
  g.restore();
  withCam(g, cam, () => {
    MASTS.forEach((x, i) => mast(g, x, 2500 + 300 * (i % 2), [x + (i % 2 ? -900 : 900), -200], 1));
    if (o.hangarOn) hangar(g, -11800, -9300, 1500);
    rig(g, T);
    ground(g, -14000, 6000, MASTS);
    if (o.vehicles) { vehicle(g, -5150, 'sedan'); vehicle(g, -5750, 'suv'); vehicle(g, -6400, 'pickup'); vehicle(g, -7150, 'truck'); }
  });
  // haze: warm air lying on the ground, lit by the floodlights
  g.save(); g.globalCompositeOperation = 'lighter';
  const hz = g.createLinearGradient(0, groundY - 380 * cam.s, 0, groundY + 40); hz.addColorStop(0, 'rgba(255,170,110,0)'); hz.addColorStop(0.8, `rgba(255,170,110,${0.10})`); hz.addColorStop(1, 'rgba(255,170,110,0)');
  g.fillStyle = hz; g.fillRect(0, groundY - 380 * cam.s, 1920, 420 * cam.s + 40);
  g.restore();
  g.restore();
};
const label = (g: G, s: string, x: number, y: number, size = 34, col = '243,237,226', align: CanvasTextAlign = 'left', weight = 700, font = 'Noto Sans CJK SC') => {
  g.save(); g.font = `${weight} ${size}px "${font}"`; g.textAlign = align; g.textBaseline = 'middle';
  g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.65)'; g.strokeText(s, x, y); g.fillStyle = `rgb(${col})`; g.fillText(s, x, y); g.restore();
};
const leader = (g: G, a: [number, number], b: [number, number], col = GOLD) => {
  g.save(); g.strokeStyle = `rgba(${col},.85)`; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.fillStyle = `rgb(${col})`; g.beginPath(); g.arc(a[0], a[1], 5, 0, 7); g.fill(); g.restore();
};
const speedStreaks = (g: G, p: Pose, back: number, n: number, len: number, T: number) => {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const off = (i / (n - 1) - 0.5) * 220, c = Math.cos(p.a), s = Math.sin(p.a);
    const x0 = p.x - c * (380 + 60 * (i % 3)) - s * off, y0 = p.y - s * (380 + 60 * (i % 3)) + c * off;
    const L = len * (0.5 + 0.5 * ((i * 37) % 7) / 7);
    const lg = g.createLinearGradient(x0, y0, x0 - c * L, y0 - s * L); lg.addColorStop(0, `rgba(${WARM},.55)`); lg.addColorStop(1, `rgba(${WARM},0)`);
    g.strokeStyle = lg; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 - c * L, y0 - s * L); g.stroke();
  }
  g.restore();
};

type KF = { sub: string; draw: (g: G) => void; mark?: boolean; overlay?: React.ReactNode };
const KFS: KF[] = [
  // 1 · hook: already climbing the wall
  {
    sub: '这辆车，正开上一面墙',
    draw: (g) => {
      const p = poseOnTrack(R * 0.95), cam: Cam = { x: p.x - 300, y: p.y + 60, s: 0.68, r: -0.06 };
      stage(g, 0, cam);
      withCam(g, cam, () => { speedStreaks(g, p, 400, 9, 900, 0); car(g, p, { spin: 1.2, rim: 1, under: 0.5 }); });
    },
  },
  // 2 · inverted on the ceiling, against the dusk sky
  {
    sub: '倒过来了，它却没掉下来',
    draw: (g) => {
      const p = poseOnTrack(S_TOP + 700), cam: Cam = { x: p.x + 120, y: p.y + 170, s: 0.86 };
      stage(g, 0, cam);
      withCam(g, cam, () => { car(g, p, { spin: 0.4, rim: 0.8, under: 1 }); });
    },
  },
  // 3 · time stops: x-ray, the fans pull air out, the outside air presses the car up
  {
    sub: '车底只要少约[5%]的空气',
    draw: (g) => {
      const p = poseOnTrack(S_TOP + 700), cam: Cam = { x: p.x + 60, y: p.y + 100, s: 1.12 };
      stage(g, 0, cam, { freeze: 1 });
      withCam(g, cam, () => {
        car(g, p, { xray: 1, fans: 1, tanks: 0.25, rim: 0, T: 0.4 });
        // air drawn out of the gap, into the fans, along the duct and out past the tail
        for (let i = 0; i < 8; i++) {
          const lx0 = 330 - i * 88, fx = lx0 > -20 ? 110 : -150, pts: [number, number][] = [];
          for (let k = 0; k <= 30; k++) {
            const q = k / 30; let lx: number, ly: number;
            if (q < 0.35) { const u = q / 0.35; lx = lerp(lx0, fx, u); ly = lerp(52, 38, u * u); }
            else if (q < 0.7) { const u = (q - 0.35) / 0.35; lx = lerp(fx, -380, u); ly = lerp(38, 22, u); }
            else { const u = (q - 0.7) / 0.3; lx = -380 - 260 * u; ly = 22 - 6 * u + (i - 3.5) * 9 * u; }
            pts.push(carToWorld(p, 1, lx, ly));
          }
          ribbon(g, pts, CYAN, 2.5, 0.7, 1);
        }
        // the outside air pushes the whole car up against the deck
        for (let i = 0; i < 7; i++) { const lx = -330 + i * 110; const [x, y] = carToWorld(p, 1, lx, -330); arrow(g, x, y, -Math.PI / 2, 150, 26, `rgba(${GOLD},.92)`); }
      });
      // labels that live on the picture
      const [ux, uy] = toScreen(cam, ...carToWorld(p, 1, 0, 44));
      const [ax, ay] = toScreen(cam, ...carToWorld(p, 1, -330, -300));
      const [ex, ey] = toScreen(cam, ...carToWorld(p, 1, -520, 16));
      leader(g, [ex, ey], [ex + 30, ey + 70], CYAN); label(g, '风扇把车底的空气抽走', ex - 150, ey + 98, 32, CYAN);
      void ax; void ay;
      label(g, '外面的空气：约40吨的推力', 1200, 868, 38, GOLD);
      label(g, '车只有约2吨', 1200, 914, 32);
      // two gauges: outside vs under the car
      const gx = 110, gy = 800;
      g.save(); g.fillStyle = 'rgba(8,10,18,.72)'; g.beginPath(); (g as any).roundRect(gx - 30, gy - 290, 330, 340, 16); g.fill();
      const bar = (x: number, v: number, col: string, t: string) => { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x, gy - 220, 70, 220); g.fillStyle = col; g.fillRect(x, gy - 220 * v, 70, 220 * v); label(g, t, x + 35, gy + 30, 28, '243,237,226', 'center'); };
      bar(gx + 20, 1, `rgba(${GOLD},.95)`, '外面'); bar(gx + 180, 0.95, `rgba(${CYAN},.95)`, '车底');
      g.strokeStyle = `rgb(${RED})`; g.lineWidth = 3; g.beginPath(); g.moveTo(gx + 170, gy - 220); g.lineTo(gx + 260, gy - 220); g.stroke();
      label(g, '−5%', gx + 215, gy - 250, 34, RED, 'center', 900, 'JunoMono');
      label(g, '空气（示意）', gx + 135, gy - 270 + 0, 22, '200,200,210', 'center');
      g.restore();
    },
  },
  // 4 · off the end of the deck: it rolls over in the air (a kickflip), one side firing
  {
    sub: '一侧喷气，车就翻过身来',
    draw: (g) => {
      const p = freePose(DECK_END - 560, -2 * R + 430, Math.PI + 0.08), sy = 0.78, cam: Cam = { x: p.x + 220, y: p.y + 20, s: 0.86, r: 0.03 };
      stage(g, 0, cam);
      withCam(g, cam, () => {
        car(g, p, { sy, spin: 0.2, rim: 1, xray: 0.4, tanks: 1, nozzles: 1 });
        // the side jet fires towards us: a bright burst and a cone of vapour falling away
        const [jx, jy] = carToWorld(p, sy, 20, 0);
        plume(g, jx, jy, Math.PI / 2 + 0.35, 520, 1, 0.3, 7, 0);
      });
      // inset: the same car seen from the nose, turning about its long axis
      const ix = 1300, iy = 200, iw = 460, ih = 330;
      g.save(); g.fillStyle = 'rgba(8,10,18,.78)'; g.strokeStyle = `rgba(${CYAN},.6)`; g.lineWidth = 2; g.beginPath(); (g as any).roundRect(ix, iy, iw, ih, 16); g.fill(); g.stroke();
      label(g, '从车头看', ix + 24, iy + 34, 26, CYAN);
      g.restore();
      // front silhouette: low and wide, bubble canopy, tyres at the corners
      const front = () => {
        g.fillStyle = '#262a34'; g.strokeStyle = `rgba(${CYAN},.95)`; g.lineWidth = 3;
        g.beginPath(); g.moveTo(-170, 34); g.lineTo(-178, 0); g.quadraticCurveTo(-170, -26, -110, -34); g.quadraticCurveTo(-70, -40, -56, -44);
        g.quadraticCurveTo(-36, -92, 0, -94); g.quadraticCurveTo(36, -92, 56, -44); g.quadraticCurveTo(70, -40, 110, -34); g.quadraticCurveTo(170, -26, 178, 0); g.lineTo(170, 34); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = '#0f1626'; g.beginPath(); g.moveTo(-46, -46); g.quadraticCurveTo(0, -90, 46, -46); g.closePath(); g.fill();
        g.fillStyle = "#08080b"; g.beginPath(); (g as any).roundRect(-176, 22, 46, 44, 8); g.fill(); g.beginPath(); (g as any).roundRect(130, 22, 46, 44, 8); g.fill();
        g.fillStyle = 'rgba(220,240,255,.9)'; g.fillRect(-150, -8, 60, 6); g.fillRect(90, -8, 60, 6);
      };
      g.save(); g.translate(ix + iw / 2 + 10, iy + ih / 2 + 40); g.scale(0.78, 0.78); g.rotate(-0.55); front();
      g.restore();
      // the jet leaves the right flank; the car turns the other way about its long axis
      g.save(); g.translate(ix + iw / 2 + 10, iy + ih / 2 + 40); g.scale(0.78, 0.78); g.rotate(-0.55); plume(g, 182, 10, 0.1, 200, 1, 0.3, 3); g.restore();
      g.save(); g.translate(ix + iw / 2 + 10, iy + ih / 2 + 40);
      g.strokeStyle = `rgba(${GOLD},.95)`; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 118, -2.75, -1.75); g.stroke();
      arrow(g, 118 * Math.cos(-2.75), 118 * Math.sin(-2.75), -2.75 - Math.PI / 2, 44, 16, `rgba(${GOLD},.95)`);
      g.restore();
      const [nx, ny] = toScreen(cam, ...carToWorld(p, sy, -300, -76));
      leader(g, [nx, ny], [nx - 80, ny - 170], CYAN); label(g, '据报道：10个喷口，600升压缩空气', nx - 340, ny - 205, 30, CYAN);
    },
  },
  // 5 · the jump: jets down, over a row of parked vehicles
  {
    sub: '往下喷，车就跳了起来',
    draw: (g) => {
      const p = freePose(-6150, -900, Math.PI + 0.04), sy = -1, cam: Cam = { x: -6000, y: -600, s: 0.64 };
      stage(g, 0, cam, { vehicles: true });
      withCam(g, cam, () => {
        for (const [lx, ly] of [[300, 44], [-300, 44], [120, 44], [-140, 44]] as [number, number][]) plume(g, ...carToWorld(p, sy, lx, ly), carDir(p, sy, Math.PI / 2), 640, 1, 0.6, lx);
        car(g, p, { sy, spin: 0.7, rim: 1 });
        // thrust vs grip, to scale as Tesla states it
        const bx = p.x + 620, by = p.y + 60;
        arrow(g, bx, by + 300, -Math.PI / 2, 90, 30, `rgba(243,237,226,.9)`);
        arrow(g, bx + 220, by + 300, -Math.PI / 2, 400, 30, `rgba(${GOLD},.95)`);
      });
      const [bx, by] = toScreen(cam, p.x + 620, p.y + 360);
      label(g, '抓地力', bx, by + 28, 26, '243,237,226', 'center');
      label(g, '喷气推力', bx + 142, by + 28, 26, GOLD, 'center');
      label(g, '4–5倍', bx + 190, by - 290, 40, GOLD, 'left', 900, 'JunoMono');
      label(g, '特斯拉称，未经实测', bx + 190, by - 245, 22, '200,200,210', 'left');
    },
  },
  // 6 · reality: parked under the floodlights; 2028 on the hangar wall; three versions
  {
    sub: '[2028年]才量产',
    draw: (g) => {
      const p = freePose(-9200, -RW, Math.PI), cam: Cam = { x: -9900, y: -560, s: 0.62 };
      stage(g, 0, cam, { hangarOn: true });
      withCam(g, cam, () => {
        // projected light on the hangar wall
        g.save(); g.globalCompositeOperation = 'lighter';
        const r = g.createRadialGradient(-10550, -900, 0, -10550, -900, 900); r.addColorStop(0, 'rgba(255,214,150,.28)'); r.addColorStop(1, 'rgba(255,200,130,0)'); g.fillStyle = r; g.fillRect(-11600, -1900, 2200, 1900);
        g.restore();
        g.save(); g.font = '900 520px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle';
        const tg = g.createLinearGradient(0, -1150, 0, -650); tg.addColorStop(0, '#fff3cf'); tg.addColorStop(0.5, '#f0c873'); tg.addColorStop(1, '#b07c32'); g.fillStyle = tg; g.globalAlpha = 0.95; g.fillText('2028', -10550, -900); g.restore();
        car(g, p, { sy: -1, rim: 1.2 });
      });
      // three versions as plates standing on the apron
      const cards: [string, string, string][] = [['Performance', '定金 5万美元', '双座'], ['Thrust', '加推进器', '双座'], ['Rocket · 会飞', '单座 · 仅邀请 · {不能上路}', '']];
      cards.forEach(([a, b, c], i) => {
        const x = 1060 + i * 280, y = 250;
        g.save(); g.fillStyle = i === 2 ? 'rgba(40,18,16,.85)' : 'rgba(10,12,20,.8)'; g.strokeStyle = i === 2 ? `rgba(${RED},.9)` : `rgba(${GOLD},.7)`; g.lineWidth = 2;
        g.beginPath(); (g as any).roundRect(x, y, 260, 190, 14); g.fill(); g.stroke(); g.restore();
        label(g, a, x + 130, y + 42, 34, i === 2 ? RED : GOLD, 'center', 700, 'Cormorant Garamond');
        b.split(' · ').forEach((t, j) => label(g, t.replace(/[{}]/g, ''), x + 130, y + 92 + j * 34, 26, t.startsWith('{') ? RED : '243,237,226', 'center'));
        if (c) label(g, c, x + 130, y + 150, 24, '200,200,210', 'center');
      });
      label(g, '飞多高、飞多久：未公布', 1060, 490, 34, RED, 'left');
    },
  },
  // 7 · model sheet: the original car, side and x-ray
  {
    sub: '',
    mark: false,
    draw: (g) => {
      const bg = g.createLinearGradient(0, 0, 0, 1080); bg.addColorStop(0, '#0e1222'); bg.addColorStop(1, '#05060b'); g.fillStyle = bg; g.fillRect(0, 0, 1920, 1080);
      g.strokeStyle = 'rgba(140,220,255,.06)'; g.lineWidth = 1; for (let x = 0; x < 1920; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1080); g.stroke(); } for (let y = 0; y < 1080; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y); g.stroke(); }
      const cam: Cam = { x: 0, y: 0, s: 1 };
      withCam(g, { x: 0, y: -RW + 240, s: 0.95 }, () => { g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(0, 0, 420, 16, 0, 0, 7); g.fill(); car(g, freePose(0, -RW, 0), { rim: 1, spin: 0.3 }); });
      withCam(g, { x: 0, y: -RW - 260, s: 0.95 }, () => { car(g, freePose(0, -RW, 0), { xray: 1, fans: 1, tanks: 1, nozzles: 1, rim: 0, T: 0.3 }); });
      label(g, '原创跑车 · 无品牌', 120, 190, 36, GOLD); label(g, '外观', 120, 320, 26, '200,200,210'); label(g, '透视：风扇 · 气瓶 · 喷口', 120, 790, 26, CYAN);
      void cam;
    },
  },
];

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const GLYPHS = '这辆车正开上一面墙倒过来了它却没掉下来车底只要少约5%的空气一侧喷气就翻过身往跳起2028年才量产风扇把抽走外面推力吨只有据报道个口升压缩胎抓地倍特斯拉称未经实测定金万美元双座加推进器单仅邀请不能路会飞多高久公布原创跑无品牌观透视瓶示意−–·';
export const Keyframes: React.FC = () => {
  const f = useCurrentFrame(), kf = KFS[Math.min(f, KFS.length - 1)];
  const [h] = useState(() => delayRender('kf'));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '900 40px "Noto Serif CJK SC"'].map((x) => document.fonts.load(x, GLYPHS).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <Canvas dep={f} draw={(g) => { kf.draw(g); const v = g.createRadialGradient(960, 540, 420, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080); }} />
          <Grain T={f} />
          <Bars />
          {kf.mark !== false && <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}><span style={{ color: '#e3b765' }}>◆ </span>{JUNO.mark}</div>}
          {kf.sub && <Subs T={1} lines={[[0, 10, kf.sub]]} />}
          <div style={{ position: 'absolute', left: 40, top: 40, fontFamily: F.mono, fontSize: 22, color: 'rgba(255,255,255,.5)' }}>{`KF${f + 1}`}</div>
        </>
      )}
    </AbsoluteFill>
  );
};
void glowDot;
