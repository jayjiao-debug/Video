import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { W, H, SANS, SERIF, FONT_CHARS } from './lib';
import { mumTable, deskScene, youDesk, withCam, MUM_W, MUM_H, DESK_W, DESK_H, YOU_W, YOU_H } from './desks';
import { ring, lock, chatPay } from './screens';
export const SetTest: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('f')); const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([`700 40px ${SANS}`, `700 40px ${SERIF}`].map((x) => document.fonts.load(x, FONT_CHARS + '十月星期二九月初十案件卷宗北京拟声冒充亲属转账凭证收款方孙子的朋友合成声音年龄两张卡内万民警赶到分钟客服屏幕共享正在一分未损电信网络诈骗受害人分布公安部刑侦局岁其他本学生证交作业周五还花呗山东济南江苏苏州拒绝接听快递您包裹异常三倍理赔请回电保险百万保障即将扣费儿子妈到这个我同急用确认').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    if (f === 0) withCam(g, { x: MUM_W / 2, y: MUM_H / 2, s: H / MUM_H * 1.05 }, () => mumTable(g, { t: 1, screen: ring('192 **** 3721', '山东 济南', 0.3), glowA: 1 }));
    if (f === 1) withCam(g, { x: DESK_W / 2, y: DESK_H / 2, s: H / DESK_H * 1.05 }, () => deskScene(g, { t: 1, stampA: 1, stampB: 1 }));
    if (f === 2) withCam(g, { x: YOU_W / 2, y: YOU_H / 2, s: H / YOU_H * 1.05 }, () => youDesk(g, { t: 1, screen: ring('192 **** 0816', '江苏 苏州'), glowA: 1 }));
    if (f === 3) withCam(g, { x: 1320, y: 820, s: 1.6 }, () => mumTable(g, { t: 1, screen: chatPay(1), glowA: 1 }));
  }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
