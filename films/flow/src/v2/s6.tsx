import React from 'react';
import {b, clamp, prog} from '../lib';
import {anim, Create, M, TeX} from '../m3';
import {At, Credit, H, Label, view, W, World} from './kit';

/* S6 (b161 → b185), the drop, one world panned left to right:
   the two bars land on the drop (54% at work, 17% in leisure) and the ratio is written → a red arrow:
   yet at work people more often wished to be elsewhere → pan right to a TV and three meters
   (relaxed high, concentration and activity low) → pan right again to a slider from 太轻松 to 太难
   whose marker comes to rest on 刚刚好: the bridge into why 85%. */
const YB = 800;
const SC = 10;
const BX = [560, 980];
const BW = 280;
const TVX = 1920;
const SLX = 3840;

export const S6: React.FC<{T: number}> = ({T}) => {
  if (T < b(160.8) || T > b(185.4)) return null;
  const o = clamp(prog(T, b(160.8), b(161.2))) * (1 - prog(T, b(184.5), b(185.3)));
  const v = view(T, [
    [b(161), {x: 960, y: 560, z: 1.12}],
    [b(166), {x: 1000, y: 520, z: 1}],
    [b(172.5), {x: 1000, y: 520, z: 1}],
    [b(174.5), {x: TVX + 960, y: 520, z: 1}],
    [b(178.5), {x: TVX + 960, y: 520, z: 1}],
    [b(180.5), {x: SLX + 960, y: 520, z: 1}],
  ]);
  const b1 = anim(T, b(161), 0.9);
  const b2 = anim(T, b(161.6), 0.9);
  const ratio = anim(T, b(164), 1);
  const arrow = anim(T, b(167.5), 1);
  const tv = anim(T, b(173.5), 1.4);
  const meters = (i: number) => anim(T, b(175) + i * 0.45, 1);
  const slider = anim(T, b(179.5), 1);
  const mk = b(181) < T ? anim(T, b(181), 1.6) : 0;
  const sx = (u: number) => SLX + 360 + u * 1200;
  const markU = 0.08 + (0.62 - 0.08) * mk;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <World v={v}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <Create d={`M 440 ${YB} L 1360 ${YB}`} p={anim(T, b(160.9), 0.5)} color={M.white} w={4} />
          <rect x={BX[0]} y={YB - 54 * SC * b1} width={BW} height={54 * SC * b1} fill={M.yellow} fillOpacity={0.7} stroke={M.yellow} strokeWidth={5} />
          <rect x={BX[1]} y={YB - 17 * SC * b2} width={BW} height={17 * SC * b2} fill={M.grey} fillOpacity={0.55} stroke={M.greyB} strokeWidth={5} />
          {/* "wished to be elsewhere" */}
          <Create d={`M ${BX[0] - 30} ${YB - 300} C ${BX[0] - 140} ${YB - 330}, ${BX[0] - 200} ${YB - 420}, ${BX[0] - 180} ${YB - 500}`} p={arrow} color={M.red} w={5} />
          {arrow > 0.95 ? <polygon points={`${BX[0] - 180},${YB - 530} ${BX[0] - 196},${YB - 496} ${BX[0] - 164},${YB - 496}`} fill={M.red} /> : null}
          {/* TV */}
          <Create d={`M ${TVX + 260} 240 L ${TVX + 860} 240 L ${TVX + 860} 640 L ${TVX + 260} 640 Z`} p={tv} color={M.white} w={5} />
          <Create d={`M ${TVX + 500} 240 L ${TVX + 450} 150 M ${TVX + 620} 240 L ${TVX + 670} 150`} p={tv} color={M.white} w={4} />
          <Create d={`M ${TVX + 330} 640 L ${TVX + 300} 700 M ${TVX + 790} 640 L ${TVX + 820} 700`} p={tv} color={M.white} w={4} />
          {tv > 0.5 ? <rect x={TVX + 290} y={270} width={540} height={340} fill={M.blue} opacity={0.08 + 0.05 * Math.sin(T * 9)} /> : null}
          {[['放松', 0.92, M.yellow], ['专注', 0.3, M.blue], ['主动', 0.2, M.red]].map(([, val, c], i) => (
            <g key={i}>
              <rect x={TVX + 1100} y={300 + i * 140} width={560} height={40} fill="none" stroke={M.greyB} strokeWidth={2} opacity={meters(i)} />
              <rect x={TVX + 1100} y={300 + i * 140} width={560 * (val as number) * meters(i)} height={40} fill={c as string} opacity={0.85} />
            </g>
          ))}
          {/* the slider */}
          <Create d={`M ${sx(0)} 560 L ${sx(1)} 560`} p={slider} color={M.white} w={5} />
          <rect x={sx(0.5)} y={548} width={sx(0.74) - sx(0.5)} height={24} fill={M.yellow} opacity={0.35 * slider} />
          {slider > 0.5 ? (
            <g>
              <circle cx={sx(markU)} cy={560} r={22} fill={mk > 0.98 ? M.yellow : M.white} />
            </g>
          ) : null}
        </svg>
        <At x={BX[0] + BW / 2} y={YB - 54 * SC * b1 - 56} o={b1}>
          <TeX tex="54\%" size={84} color={M.yellow} />
        </At>
        <At x={BX[1] + BW / 2} y={YB - 17 * SC * b2 - 56} o={b2}>
          <TeX tex="17\%" size={84} color={M.greyB} />
        </At>
        <At x={BX[0] + BW / 2} y={YB + 46} o={b1}>
          <Label size={42} w={600}>上班时</Label>
        </At>
        <At x={BX[1] + BW / 2} y={YB + 46} o={b2}>
          <Label size={42} w={600}>下班后</Label>
        </At>
        <At x={BX[1] + BW + 250} y={YB - 380} o={ratio}>
          <TeX tex="\frac{54}{17} \approx 3.2" size={74} color={M.yellow} />
        </At>
        <At x={BX[0] - 180} y={YB - 580} o={anim(T, b(168.3), 0.8)}>
          <Label c={M.red} size={42} w={700}>更常希望在别处</Label>
        </At>
        {[['放松', 0.92, M.yellow], ['专注', 0.3, M.blue], ['主动', 0.2, M.red]].map(([name, , c], i) => (
          <At key={i} x={TVX + 1080} y={320 + i * 140} o={meters(i)} anchor="r">
            <Label c={c as string} size={40} w={700}>{name as string}</Label>
          </At>
        ))}
        <At x={sx(0)} y={640} o={slider}>
          <Label c={M.blue} size={40} w={600}>太轻松</Label>
        </At>
        <At x={sx(1)} y={640} o={slider}>
          <Label c={M.red} size={40} w={600}>太难</Label>
        </At>
        <At x={sx(0.62)} y={470} o={anim(T, b(182.2), 0.7)}>
          <Label c={M.yellow} size={52} w={700}>刚刚好</Label>
        </At>
      </World>
      <Credit o={1}>{T < b(173.5) ? 'Csikszentmihalyi & LeFevre, JPSP, 1989 · n = 78 · 心流时刻所占比例' : T < b(179.5) ? 'Kubey & Csikszentmihalyi, Television and the Quality of Life, 1990' : ''}</Credit>
    </div>
  );
};
