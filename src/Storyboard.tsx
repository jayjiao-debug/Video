/* 《这车真能飞？》 storyboard: the analysis cut. Nine frames, one per beat of the new script. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grain, Bars, Subs, Canvas } from './kit';
import { sky, mesas, mast, ground, rig, car, plume, arrow, withCam, poseOnTrack, freePose, carToWorld, carDir, R, RW, S_TOP, DECK_END, GOLD, CYAN, RED, type Cam } from './world';
import { JUNO } from './brand/identity';

type G = CanvasRenderingContext2D;
const CREAM = '243,237,226', DIM = '200,200,210';
const label = (g: G, s: string, x: number, y: number, size = 34, col = CREAM, align: CanvasTextAlign = 'left', weight = 700, font = 'Noto Sans CJK SC') => {
  g.save(); g.font = `${weight} ${size}px "${font}"`; g.textAlign = align; g.textBaseline = 'middle';
  g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.6)'; g.strokeText(s, x, y); g.fillStyle = `rgb(${col})`; g.fillText(s, x, y); g.restore();
};
/** the test site at dusk, dimmed as a backdrop for the analysis boards */
const backdrop = (g: G, cam: Cam, dim = 0.55, withCar = true) => {
  const horizon = 540 + (0 - cam.y) * cam.s * 0.22 - 40, groundY = 540 + (0 - cam.y) * cam.s;
  sky(g, 1920, 1080, horizon); mesas(g, 1920, horizon, cam.x);
  const df = g.createLinearGradient(0, horizon, 0, groundY); df.addColorStop(0, '#2a1e30'); df.addColorStop(1, '#17131d'); g.fillStyle = df; g.fillRect(0, horizon, 1920, Math.max(0, groundY - horizon) + 4);
  withCam(g, cam, () => { [2700, -1200, -3600].forEach((x, i) => mast(g, x, 2100 + 250 * (i % 2), [x + (i % 2 ? -900 : 900), -200])); rig(g, 0); ground(g, -9000, 6000, [2700, -1200, -3600]); if (withCar) car(g, freePose(-1500, -RW, Math.PI), { sy: -1, rim: 1 }); });
  g.fillStyle = `rgba(5,6,12,${dim})`; g.fillRect(0, 0, 1920, 1080);
};
const panel = (g: G, x: number, y: number, w: number, h: number, edge = `rgba(${GOLD},.35)`) => {
  g.save(); g.fillStyle = 'rgba(8,10,18,.82)'; g.strokeStyle = edge; g.lineWidth = 2; g.beginPath(); (g as any).roundRect(x, y, w, h, 18); g.fill(); g.stroke(); g.restore();
};
/** the verdict stamp: two rings, a big word and a small line, slightly rotated */
const stamp = (g: G, x: number, y: number, big: string, small: string, col: string, rot = -0.12, r = 120) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.strokeStyle = `rgba(${col},.95)`; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, r - 14, 0, 7); g.stroke();
  g.fillStyle = `rgba(${col},.08)`; g.beginPath(); g.arc(0, 0, r - 14, 0, 7); g.fill();
  g.fillStyle = `rgb(${col})`; g.font = `900 ${big.length === 1 ? 92 : 58}px "Noto Serif CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(big, 0, -14);
  g.font = '700 30px "Noto Sans CJK SC"'; g.fillText(small, 0, 52);
  g.restore();
};
/** generic low race-car silhouette with a fan at the tail (no livery, no real design) */
const fanCar = (g: G, x: number, y: number, s: number, tone: string) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = tone; g.beginPath(); g.moveTo(-212, 0); g.lineTo(-220, -34); g.lineTo(-150, -44); g.lineTo(-40, -46); g.lineTo(-12, -74); g.lineTo(40, -74); g.lineTo(70, -46); g.lineTo(200, -34); g.lineTo(226, -10); g.lineTo(214, 0); g.closePath(); g.fill();
  g.fillStyle = '#0a0a0d'; for (const wx of [-130, 140]) { g.beginPath(); g.arc(wx, 0, 34, 0, 7); g.fill(); }
  g.strokeStyle = `rgba(${CYAN},.95)`; g.lineWidth = 3; g.beginPath(); g.arc(-185, -24, 18, 0, 7); g.stroke();
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; g.beginPath(); g.moveTo(-185, -24); g.lineTo(-185 + 16 * Math.cos(a), -24 + 16 * Math.sin(a)); g.stroke(); }
  g.restore();
};
const rocket = (g: G, x: number, y: number, s: number) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  const bg = g.createLinearGradient(-40, 0, 40, 0); bg.addColorStop(0, '#9aa0aa'); bg.addColorStop(0.5, '#e8e8ec'); bg.addColorStop(1, '#8a8f99');
  g.fillStyle = bg; g.fillRect(-36, -520, 72, 520); g.fillStyle = '#2a2d35'; g.fillRect(-36, -40, 72, 40);
  g.strokeStyle = '#3a3e48'; g.lineWidth = 6; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 30, -40); g.lineTo(sx * 90, 30); g.stroke(); }
  g.fillStyle = '#c8ccd4'; g.beginPath(); g.ellipse(0, -520, 36, 10, 0, 0, 7); g.fill();
  g.restore();
};
const heli = (g: G, x: number, y: number, s: number) => {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#2b2f3a';
  g.beginPath(); g.ellipse(0, 0, 120, 60, 0, 0, 7); g.fill(); g.fillRect(80, -14, 220, 20); g.fillRect(290, -50, 14, 60);
  g.fillRect(-6, -84, 12, 30); g.strokeStyle = '#3e4352'; g.lineWidth = 8; g.beginPath(); g.moveTo(-260, -86); g.lineTo(260, -86); g.stroke();
  g.lineWidth = 6; g.beginPath(); g.moveTo(-90, 64); g.lineTo(90, 64); g.stroke();
  g.fillStyle = '#0f1626'; g.beginPath(); g.ellipse(-60, -10, 50, 32, 0, 0, 7); g.fill();
  g.restore();
};
const tank = (g: G, x: number, y: number, w: number, h: number, fill: number) => {
  g.save(); g.beginPath(); (g as any).roundRect(x, y, w, h, w / 2); g.clip();
  g.fillStyle = '#1a1c24'; g.fillRect(x, y, w, h);
  const fy = y + h * (1 - fill); const tg = g.createLinearGradient(0, fy, 0, y + h); tg.addColorStop(0, `rgba(${CYAN},.85)`); tg.addColorStop(1, `rgba(${CYAN},.35)`); g.fillStyle = tg; g.fillRect(x, fy, w, h * fill);
  g.strokeStyle = 'rgba(255,240,200,.18)'; g.lineWidth = 2; for (let i = -h; i < w + h; i += 18) { g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i - h, y + h); g.stroke(); }
  g.restore();
  g.strokeStyle = `rgba(${GOLD},.9)`; g.lineWidth = 4; g.beginPath(); (g as any).roundRect(x, y, w, h, w / 2); g.stroke();
};

type SB = { sub: string; tag: string; draw: (g: G) => void; mark?: boolean; overlay?: React.ReactNode };
const SBS: SB[] = [
  {
    tag: '0:00 钩子', sub: '倒挂、翻身、飞过一排车',
    draw: (g) => { const p = poseOnTrack(S_TOP + 700), cam: Cam = { x: p.x + 120, y: p.y + 170, s: 0.86 }; backdrop(g, cam, 0, false); withCam(g, cam, () => car(g, p, { rim: 0.8, under: 1 })); },
  },
  {
    tag: '0:05 钩子', sub: '是真本事，还是营销？',
    draw: (g) => {
      const p = freePose(-6150, -900, Math.PI + 0.04), cam: Cam = { x: -6000, y: -600, s: 0.64 };
      backdrop(g, cam, 0.25, false);
      withCam(g, cam, () => { for (const lx of [300, 120, -140, -300]) plume(g, ...carToWorld(p, -1, lx, 44), carDir(p, -1, Math.PI / 2), 640, 1, 0.6, lx); car(g, p, { sy: -1, rim: 1 }); });
      // three empty stamp rings waiting to be filled: 倒挂 / 翻身 / 飞
      ['倒挂', '翻身', '飞'].forEach((t, i) => { const x = 620 + i * 340, y = 820; g.save(); g.setLineDash([10, 10]); g.strokeStyle = `rgba(${GOLD},.7)`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 90, 0, 7); g.stroke(); g.restore(); label(g, t, x, y, 40, GOLD, 'center', 900, 'Noto Serif CJK SC'); });
    },
  },
  {
    tag: '0:10.5 片名', sub: '',
    draw: (g) => {
      backdrop(g, { x: -1300, y: -500, s: 0.6 }, 0.55, true);
      label(g, 'ROADSTER · McGREGOR, TEXAS · 2026.10.15', 960, 250, 28, GOLD, 'center', 600, 'Cormorant Garamond');
      g.save(); g.font = '900 150px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; const tg = g.createLinearGradient(0, 300, 0, 470); tg.addColorStop(0, '#fff3cf'); tg.addColorStop(0.5, '#f0c873'); tg.addColorStop(1, '#b07c32'); g.fillStyle = tg; g.fillText('《这车真能飞？》', 960, 380); g.restore();
      label(g, '三个绝活，哪个是真本事？', 960, 530, 50, CREAM, 'center', 700, 'Noto Serif CJK SC');
      label(g, '— VIBE知识大赏 —', 960, 610, 30, GOLD, 'center', 500);
    },
  },
  {
    tag: '0:15–0:29 倒挂', sub: '这招，50多年前就有人玩过',
    draw: (g) => {
      backdrop(g, { x: -1300, y: -500, s: 0.6 }, 0.7, false);
      panel(g, 100, 170, 1720, 700);
      const xs = [330, 760, 1190, 1620], yrs = ['1970', '1978', '2025', '2026'];
      g.strokeStyle = `rgba(${GOLD},.6)`; g.lineWidth = 3; g.beginPath(); g.moveTo(220, 640); g.lineTo(1720, 640); g.stroke();
      const names = [['Chaparral 2J', '风扇吸地', '被逐出 Can-Am'], ['Brabham BT46B', '只比一场，夺冠', '随即被禁'], ['McMurtry', '静止下压力约2吨', '台架上倒着开'], ['特斯拉', '倒挂 + 喷气', '发布会演示']];
      xs.forEach((x, i) => {
        g.fillStyle = `rgb(${i === 3 ? RED : GOLD})`; g.beginPath(); g.arc(x, 640, 10, 0, 7); g.fill();
        label(g, yrs[i], x, 690, 44, i === 3 ? RED : GOLD, 'center', 900, 'JunoMono');
        if (i < 3) fanCar(g, x, 520, 0.85, i === 2 ? '#3a3f4c' : '#2e323d'); else { g.save(); g.translate(x, 520); g.scale(0.45, 0.45); car(g, freePose(0, -RW, 0), { rim: 1 }); g.restore(); }
        label(g, names[i][0], x, 270, 30, CREAM, 'center', 700, 'Cormorant Garamond');
        label(g, names[i][1], x, 320, 26, DIM, 'center'); label(g, names[i][2], x, 358, 26, DIM, 'center');
      });
      stamp(g, 975, 770, '真', '但不新', GOLD, -0.14, 82);
    },
  },
  {
    tag: '0:29–0:44 翻身', sub: '火箭上，用的是同一类喷口',
    draw: (g) => {
      backdrop(g, { x: -2600, y: -2400, s: 0.6 }, 0.6, false);
      panel(g, 120, 170, 1680, 690, `rgba(${CYAN},.35)`);
      // left: the car turning in the air with a side jet; right: a booster coasting, nitrogen puffs at the top
      g.save(); g.translate(560, 520); g.rotate(-0.5); g.scale(0.9, 0.9); car(g, freePose(0, 0, 0), { sy: 0.55, rim: 1, xray: 0.4, tanks: 1, nozzles: 1 }); g.restore();
      plume(g, 640, 470, -0.6, 260, 1, 0.3, 4, 0.4);
      rocket(g, 1350, 800, 1.0);
      plume(g, 1310, 300, Math.PI + 0.2, 200, 1, 0.2, 5, 0.4); plume(g, 1390, 300, -0.2, 200, 1, 0.5, 6, 0.4);
      label(g, '冷气推进：喷出压缩气，车往反方向转', 220, 230, 34, CYAN);
      label(g, '猎鹰9号一级 · 滑行时用氮气喷口调姿态（示意）', 1350, 860 - 60, 24, DIM, 'center');
      label(g, '难的是：10个喷口，什么时候喷、喷多久', 220, 800, 32, GOLD);
      stamp(g, 1660, 330, '真', '难在控制', GOLD, -0.12, 100);
    },
  },
  {
    tag: '0:44–0:57 飞', sub: '它背着的气，最多够悬停十秒左右',
    draw: (g) => {
      backdrop(g, { x: -6000, y: -600, s: 0.6 }, 0.72, false);
      panel(g, 120, 170, 1680, 690);
      tank(g, 240, 260, 170, 470, 0.32);
      label(g, '600升（特斯拉现场说）', 460, 300, 34, CREAM); label(g, '最高约690巴（据MotorTrend）', 460, 350, 30, DIM);
      label(g, '≈ 300公斤压缩气（估算）', 460, 420, 38, CYAN, 'left', 900);
      // the hover clock
      g.save(); g.translate(1460, 470); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 26; g.beginPath(); g.arc(0, 0, 170, 0, 7); g.stroke();
      g.strokeStyle = `rgba(${GOLD},.95)`; g.beginPath(); g.arc(0, 0, 170, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (10 / 60)); g.stroke(); g.restore();
      label(g, '≈10秒', 1460, 450, 84, GOLD, 'center', 900, 'JunoMono'); label(g, '一分钟的表盘', 1460, 530, 24, DIM, 'center');
      label(g, '全部喷完，能把车托在空中多久', 1460, 700, 30, CREAM, 'center');
      label(g, '估算：车重约2吨、喷气速度按理想上限', 460, 780, 24, DIM);
      stamp(g, 1660, 740, '能跳', '不能飞', RED, -0.12, 100);
    },
  },
  {
    tag: '0:57–1:07 飞（对比）', sub: '直升机推外面的空气，它推自己背的气',
    draw: (g) => {
      backdrop(g, { x: -6000, y: -600, s: 0.6 }, 0.6, false);
      heli(g, 560, 470, 1.1);
      for (let i = 0; i < 5; i++) arrow(g, 360 + i * 100, 580, Math.PI / 2, 180, 20, `rgba(${CYAN},.75)`);
      for (let i = 0; i < 5; i++) arrow(g, 360 + i * 100, 230, Math.PI / 2, 90, 14, `rgba(${CYAN},.4)`);
      label(g, '空气用不完 → 能一直飞', 560, 860, 36, CYAN, 'center');
      g.save(); g.translate(1400, 500); g.scale(0.8, 0.8); car(g, freePose(0, 0, 0), { rim: 1, xray: 0.5, tanks: 1 }); g.restore();
      for (const dx of [-160, 160]) plume(g, 1400 + dx, 540, Math.PI / 2, 260, 1, 0.3, dx, 0.4);
      label(g, '气用完就落地 → 只能跳', 1400, 860, 36, RED, 'center');
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(960, 220); g.lineTo(960, 900); g.stroke();
    },
  },
  {
    tag: '1:02 0到60', sub: '0.59秒到60英里，平均约4.6g',
    draw: (g) => {
      backdrop(g, { x: -9000, y: -600, s: 0.6 }, 0.72, false);
      panel(g, 240, 200, 1440, 640);
      const bar = (y: number, v: number, t: string, val: string, col: string) => { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(560, y, 960, 70); g.fillStyle = `rgba(${col},.9)`; g.fillRect(560, y, 960 * v / 5, 70); label(g, t, 530, y + 35, 32, CREAM, 'right'); label(g, val, 560 + 960 * v / 5 + 20, y + 35, 40, col, 'left', 900, 'JunoMono'); };
      bar(330, 1.1, '轮胎能给的', '约1g', CREAM);
      bar(470, 4.63, '它宣称的', '4.6g', GOLD);
      label(g, '多出来的部分，只能靠喷气', 960, 660, 38, GOLD, 'center');
      label(g, '0–60英里/时 0.59秒：特斯拉宣称，未经第三方实测', 960, 740, 26, DIM, 'center');
    },
  },
  {
    tag: '1:09–1:22 现实', sub: '最大的问号，在交车这件事上',
    draw: (g) => {
      backdrop(g, { x: -9000, y: -600, s: 0.6 }, 0.72, false);
      panel(g, 240, 170, 1440, 700);
      label(g, '2017年 承诺', 760, 240, 36, DIM, 'center'); label(g, '2026年 现在', 1260, 240, 36, GOLD, 'center');
      const rows: [string, string, string][] = [['交车', '2020年', '2028年才量产'], ['续航', '620英里', '300多英里'], ['座位', '4个', '最多2个'], ['会飞的版本', '—', '仅邀请 · 不能上路']];
      rows.forEach(([k, a, b], i) => { const y = 330 + i * 90; g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(300, y - 34, 1320, 68); label(g, k, 340, y, 32, CREAM); label(g, a, 760, y, 34, DIM, 'center', 700, 'Noto Sans CJK SC'); label(g, b, 1260, y, 34, i === 0 ? GOLD : RED, 'center', 900); });
      label(g, '马斯克："安全不是主要目标"', 340, 760, 32, CREAM);
      stamp(g, 1560, 790, '存疑', '要等2028', RED, -0.12, 100);
    },
  },
  {
    tag: '1:22 片尾', sub: '', mark: false,
    draw: (g) => {
      backdrop(g, { x: -1300, y: -500, s: 0.6 }, 0.75, true);
      stamp(g, 640, 300, '真', '倒挂', GOLD, -0.1, 80); stamp(g, 960, 300, '真', '翻身', GOLD, 0.05, 80); stamp(g, 1280, 300, '能跳', '不能飞', RED, -0.08, 80);
      g.save(); g.font = '900 104px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; const tg = g.createLinearGradient(0, 470, 0, 570); tg.addColorStop(0, '#fff3cf'); tg.addColorStop(0.5, '#f0c873'); tg.addColorStop(1, '#b07c32'); g.fillStyle = tg; g.fillText('《这车真能飞？》', 960, 520); g.restore();
      label(g, '真本事还是营销？评论区打一个', 960, 640, 50, CREAM, 'center', 700, 'Noto Serif CJK SC');
      g.strokeStyle = C.gold; g.lineWidth = 1.5; g.beginPath(); (g as any).roundRect(700, 700, 520, 56, 28); g.stroke(); label(g, JUNO.follow, 960, 728, 28, GOLD, 'center', 500);
      label(g, '资料：TechCrunch · Fox Business · Electrek · MotorTrend · Motorsport Magazine · The Drive', 960, 810, 22, DIM, 'center', 500);
    },
  },
];

const GLYPHS = '倒挂翻身飞过一排车是真本事还营销？这能三个绝活哪50多年前就有人玩风扇吸地被逐出只比场夺冠随即禁静止下压力约2吨台架上着开特斯拉喷气发布会演示但不新火箭用的同类口冷推进出缩反方向转猎鹰9号级滑行时氮姿态示意难在控制10什么候久它背最够悬停秒左右600升现场说高690巴据≈300公斤估算钟表盘全部完把托空中重速度理想限直升机外面用不就落跳0到英里平均4.6g轮胎给宣称部分只靠第三方实测大问号交件2017承诺2026现量产续航620座位版本仅邀请路马克安主要目标存疑等片尾评论区打资料·—→《》';
export const Storyboard: React.FC = () => {
  const f = useCurrentFrame(), sb = SBS[Math.min(f, SBS.length - 1)];
  const [h] = useState(() => delayRender('sb'));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '900 40px "Noto Serif CJK SC"', '900 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, GLYPHS).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <Canvas dep={f} draw={(g) => { sb.draw(g); const v = g.createRadialGradient(960, 540, 420, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080); }} />
          <Grain T={f} />
          <Bars />
          {sb.mark !== false && <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}><span style={{ color: '#e3b765' }}>◆ </span>{JUNO.mark}</div>}
          {sb.sub && <Subs T={1} lines={[[0, 10, sb.sub]]} />}
          <div style={{ position: 'absolute', left: 40, top: 40, fontFamily: F.sans, fontWeight: 700, fontSize: 24, color: 'rgba(255,214,140,.8)' }}>{`分镜${f + 1} · ${sb.tag}`}</div>
        </>
      )}
    </AbsoluteFill>
  );
};
void R; void DECK_END;
