import React from 'react';
import { INK, CREAM, CREAM2 } from '../ep2/ink';

/* Hand-drawn "ink on cream" props for 《还能见几次》. All are SVG <g> groups; origin noted per prop. */
export { INK, CREAM, CREAM2 };
export const ROUGE = '#c4574a';
export const WARM = '#f3d9a4';
const SW = 5;
const g = { strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** rolling suitcase, origin bottom-centre, ~170w × 330h incl. handle */
export const Suitcase: React.FC = () => (
  <g {...g}>
    <path d="M -40 -200 L -40 -300 L 40 -300 L 40 -200" fill="none" stroke={INK} strokeWidth={SW + 9} />
    <path d="M -40 -200 L -40 -300 L 40 -300 L 40 -200" fill="none" stroke={CREAM} strokeWidth={7} />
    <rect x={-52} y={-312} width={104} height={24} rx={10} fill={CREAM} stroke={INK} strokeWidth={SW} />
    <rect x={-85} y={-205} width={170} height={190} rx={22} fill={CREAM} stroke={INK} strokeWidth={SW} />
    <path d="M -45 -198 L -45 -22 M 45 -198 L 45 -22" stroke={INK} strokeWidth={4} />
    <path d="M -85 -150 L 85 -150" stroke={INK} strokeWidth={3} />
    <circle cx={-55} cy={-6} r={11} fill={INK} /><circle cx={55} cy={-6} r={11} fill={INK} />
    <path d="M 60 -170 L 92 -150 L 84 -120 L 58 -136 Z" fill={ROUGE} stroke={INK} strokeWidth={4} />
    <circle cx={67} cy={-150} r={4} fill={CREAM} />
  </g>
);

/** mum's bag of food, origin bottom-centre, ~140w × 170h */
export const FoodBag: React.FC = () => (
  <g {...g}>
    <circle cx={-26} cy={-128} r={26} fill="#e8a54a" stroke={INK} strokeWidth={SW} />
    <path d="M -26 -154 q 4 -8 12 -8" fill="none" stroke={INK} strokeWidth={4} />
    <circle cx={18} cy={-122} r={24} fill="#e8a54a" stroke={INK} strokeWidth={SW} />
    <rect x={30} y={-160} width={34} height={44} rx={6} fill={CREAM} stroke={INK} strokeWidth={SW} />
    <rect x={28} y={-168} width={38} height={12} rx={3} fill={ROUGE} stroke={INK} strokeWidth={4} />
    <path d="M -70 -110 Q -76 -20 -60 -4 Q 0 8 60 -4 Q 76 -20 70 -110 Z" fill={CREAM} stroke={INK} strokeWidth={SW} />
    <path d="M -46 -110 Q -40 -160 -14 -112 M 46 -110 Q 40 -160 14 -112" fill="none" stroke={INK} strokeWidth={SW} />
    <path d="M -50 -70 Q 0 -60 50 -70" fill="none" stroke={ROUGE} strokeWidth={6} />
  </g>
);

/** high-speed train (nose at +x), origin = rear-bottom, length L */
export const Train: React.FC<{ L?: number; lit?: number }> = ({ L = 1500, lit = 1 }) => {
  const cars = Math.floor((L - 260) / 250);
  return (
    <g {...g}>
      <path d={`M 0 -120 L ${L - 260} -120 Q ${L - 60} -118 ${L} -30 L ${L} -8 L 0 -8 Z`} fill={CREAM} stroke={INK} strokeWidth={SW} />
      <path d={`M 0 -44 L ${L - 20} -44`} stroke={ROUGE} strokeWidth={10} />
      <path d={`M ${L - 250} -112 Q ${L - 120} -108 ${L - 40} -52 L ${L - 250} -52 Z`} fill="#27324a" stroke={INK} strokeWidth={4} />
      {Array.from({ length: cars }, (_, c) => (
        <g key={c}>
          <path d={`M ${c * 250 + 250} -120 L ${c * 250 + 250} -8`} stroke={INK} strokeWidth={3} />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={c * 250 + 22 + k * 56} y={-102} width={40} height={36} rx={6} fill={lit > 0 ? WARM : '#27324a'} opacity={lit > 0 ? 0.55 + 0.45 * lit : 1} stroke={INK} strokeWidth={3} />
          ))}
        </g>
      ))}
      <path d={`M 0 -8 L ${L} -8`} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** instant-noodle cup, origin bottom-centre */
export const NoodleCup: React.FC = () => (
  <g {...g}>
    <path d="M -46 -110 L 46 -110 L 36 0 L -36 0 Z" fill={CREAM} stroke={INK} strokeWidth={SW} />
    <path d="M -43 -80 L 43 -80 L 41 -56 L -41 -56 Z" fill={ROUGE} stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={-110} rx={50} ry={10} fill={CREAM2} stroke={INK} strokeWidth={SW} />
    <path d="M 10 -112 L 60 -170 M 22 -110 L 72 -166" stroke={INK} strokeWidth={5} />
  </g>
);

/** rice bowl, origin bottom-centre; `full` 0..1 adds a piece of food on top */
export const Bowl: React.FC<{ w?: number; food?: number }> = ({ w = 150, food = 0 }) => (
  <g {...g}>
    <ellipse cx={0} cy={-w * 0.52} rx={w * 0.5} ry={w * 0.12} fill="#fbf6ea" stroke={INK} strokeWidth={SW} />
    <path d={`M ${-w * 0.36} ${-w * 0.56} Q 0 ${-w * 0.78} ${w * 0.36} ${-w * 0.56}`} fill="#fbf6ea" stroke={INK} strokeWidth={4} />
    <path d={`M ${-w * 0.5} ${-w * 0.52} Q ${-w * 0.46} ${-w * 0.1} 0 ${-w * 0.06} Q ${w * 0.46} ${-w * 0.1} ${w * 0.5} ${-w * 0.52}`} fill={CREAM} stroke={INK} strokeWidth={SW} />
    <path d={`M ${-w * 0.42} ${-w * 0.32} Q 0 ${-w * 0.22} ${w * 0.42} ${-w * 0.32}`} fill="none" stroke="#5a7db0" strokeWidth={5} />
    <rect x={-w * 0.16} y={-w * 0.07} width={w * 0.32} height={w * 0.07} rx={3} fill={CREAM2} stroke={INK} strokeWidth={4} />
    {food > 0 && (
      <g opacity={food} transform={`translate(0 ${-w * 0.66 - (1 - food) * 40})`}>
        <rect x={-26} y={-18} width={52} height={34} rx={9} fill="#9b4a2c" stroke={INK} strokeWidth={4} />
        <path d="M -18 -8 L 18 -8" stroke="#e7b08a" strokeWidth={4} />
      </g>
    )}
  </g>
);

/** a plate of food, origin centre */
export const Dish: React.FC<{ kind: 'fish' | 'greens' | 'pork' | 'eggs'; w?: number }> = ({ kind, w = 230 }) => (
  <g {...g}>
    <ellipse cx={0} cy={0} rx={w / 2} ry={w * 0.22} fill="#fbf6ea" stroke={INK} strokeWidth={SW} />
    <ellipse cx={0} cy={-2} rx={w * 0.38} ry={w * 0.15} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.5} />
    {kind === 'fish' && (
      <g>
        <path d={`M ${-w * 0.34} 0 Q ${-w * 0.05} ${-w * 0.16} ${w * 0.22} 0 Q ${-w * 0.05} ${w * 0.14} ${-w * 0.34} 0 Z`} fill="#c98a4a" stroke={INK} strokeWidth={4} />
        <path d={`M ${w * 0.22} 0 L ${w * 0.36} ${-w * 0.08} L ${w * 0.36} ${w * 0.08} Z`} fill="#c98a4a" stroke={INK} strokeWidth={4} />
        <circle cx={-w * 0.24} cy={-3} r={4} fill={INK} />
        <path d={`M ${-w * 0.1} -12 L ${-w * 0.04} 10 M ${w * 0.02} -12 L ${w * 0.08} 10`} stroke={INK} strokeWidth={3} />
        <path d={`M ${-w * 0.2} -20 q 10 -8 20 0 M 0 -22 q 10 -8 20 0`} stroke="#6aa15a" strokeWidth={4} fill="none" />
      </g>
    )}
    {kind === 'greens' && [-0.2, -0.05, 0.1, 0.22].map((x, i) => (
      <path key={i} d={`M ${w * x - 18} ${6 - (i % 2) * 8} Q ${w * x} ${-22} ${w * x + 20} ${4}`} fill="#6aa15a" stroke={INK} strokeWidth={4} />
    ))}
    {kind === 'pork' && [-0.2, 0, 0.2, -0.1, 0.1].map((x, i) => (
      <rect key={i} x={w * x - 20} y={i < 3 ? -20 : -2} width={40} height={30} rx={8} fill="#9b4a2c" stroke={INK} strokeWidth={4} />
    ))}
    {kind === 'eggs' && (
      <g>
        <path d={`M ${-w * 0.3} 4 Q ${-w * 0.1} -24 ${w * 0.1} -6 Q ${w * 0.3} -20 ${w * 0.3} 6 Q 0 20 ${-w * 0.3} 4 Z`} fill="#f2c94c" stroke={INK} strokeWidth={4} />
        {[-0.18, 0, 0.16].map((x, i) => <circle key={i} cx={w * x} cy={-2 + (i % 2) * 6} r={9} fill={ROUGE} stroke={INK} strokeWidth={3} />)}
      </g>
    )}
  </g>
);

/** chopsticks, origin at the grip, pointing in direction `ang` (deg) */
export const Chopsticks: React.FC<{ ang?: number; len?: number }> = ({ ang = 0, len = 300 }) => (
  <g {...g} transform={`rotate(${ang})`}>
    <path d={`M 0 -6 L ${len} -2`} stroke={INK} strokeWidth={14} />
    <path d={`M 0 -6 L ${len} -2`} stroke="#d9a96a" strokeWidth={7} />
    <path d={`M 0 8 L ${len} 3`} stroke={INK} strokeWidth={14} />
    <path d={`M 0 8 L ${len} 3`} stroke="#d9a96a" strokeWidth={7} />
  </g>
);

/* ---------- memory icons (origin centre, ~120px) ---------- */
export const IconBottle: React.FC = () => (
  <g {...g}>
    <path d="M -12 -70 Q 0 -86 12 -70 L 12 -60 L -12 -60 Z" fill="#e8a54a" stroke={INK} strokeWidth={4} />
    <rect x={-22} y={-62} width={44} height={14} rx={4} fill={ROUGE} stroke={INK} strokeWidth={4} />
    <rect x={-26} y={-48} width={52} height={100} rx={16} fill={CREAM} stroke={INK} strokeWidth={SW} />
    {[-24, -6, 12, 30].map((y) => <path key={y} d={`M -26 ${y} L -12 ${y}`} stroke={INK} strokeWidth={3} />)}
    <path d="M -24 18 L 24 18 L 24 40 Q 0 54 -24 40 Z" fill="#fbf6ea" opacity={0.9} />
  </g>
);
export const IconSchoolbag: React.FC = () => (
  <g {...g}>
    <path d="M -30 -58 Q 0 -86 30 -58" fill="none" stroke={INK} strokeWidth={9} />
    <path d="M -30 -58 Q 0 -86 30 -58" fill="none" stroke={ROUGE} strokeWidth={4} />
    <rect x={-50} y={-60} width={100} height={116} rx={22} fill={ROUGE} stroke={INK} strokeWidth={SW} />
    <rect x={-36} y={-4} width={72} height={44} rx={10} fill="#e27a6c" stroke={INK} strokeWidth={4} />
    <path d="M -36 -30 Q 0 -44 36 -30" fill="none" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-6} r={5} fill={CREAM} stroke={INK} strokeWidth={3} />
  </g>
);
export const IconBike: React.FC = () => (
  <g {...g}>
    <circle cx={-44} cy={20} r={32} fill="none" stroke={INK} strokeWidth={SW + 2} />
    <circle cx={44} cy={20} r={32} fill="none" stroke={INK} strokeWidth={SW + 2} />
    <circle cx={-44} cy={20} r={32} fill="none" stroke={CREAM} strokeWidth={2} />
    <circle cx={44} cy={20} r={32} fill="none" stroke={CREAM} strokeWidth={2} />
    <path d="M -44 20 L -10 -24 L 30 -24 L 44 20 M -10 -24 L 6 20 L 30 -24 M 6 20 L -44 20" fill="none" stroke={ROUGE} strokeWidth={7} />
    <path d="M -18 -34 L 2 -34 M 26 -42 L 36 -42 L 30 -24" stroke={INK} strokeWidth={6} fill="none" />
  </g>
);
export const IconCake: React.FC = () => (
  <g {...g}>
    <rect x={-56} y={-10} width={112} height={60} rx={10} fill={CREAM} stroke={INK} strokeWidth={SW} />
    <path d="M -56 8 Q -42 22 -28 8 Q -14 22 0 8 Q 14 22 28 8 Q 42 22 56 8" fill="none" stroke={ROUGE} strokeWidth={6} />
    <rect x={-40} y={-50} width={80} height={42} rx={8} fill="#fbf6ea" stroke={INK} strokeWidth={SW} />
    {[-20, 0, 20].map((x) => (
      <g key={x}><rect x={x - 4} y={-76} width={8} height={26} rx={2} fill="#e8a54a" stroke={INK} strokeWidth={3} />
        <path d={`M ${x} -78 q -6 -10 0 -16 q 6 6 0 16`} fill="#f2c94c" stroke={INK} strokeWidth={2.5} /></g>
    ))}
  </g>
);
export const IconLetter: React.FC = () => (
  <g {...g}>
    <rect x={-64} y={-46} width={128} height={92} rx={6} fill={ROUGE} stroke={INK} strokeWidth={SW} />
    <path d="M -64 -46 L 0 4 L 64 -46" fill="none" stroke={INK} strokeWidth={4} />
    <rect x={-38} y={10} width={76} height={24} rx={3} fill="#f2c94c" stroke={INK} strokeWidth={3} />
  </g>
);

/** picture frame, origin centre, inner w×h; children drawn inside (use foreignObject-free SVG) */
export const Frame: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <g {...g}>
    <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 36} rx={6} fill="#8a5a36" stroke={INK} strokeWidth={SW} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#e9dfc6" stroke={INK} strokeWidth={4} />
  </g>
);

/** the 福 diamond on the door, origin centre */
export const Fu: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...g}>
    <rect x={-46} y={-46} width={92} height={92} transform="rotate(45)" fill={ROUGE} stroke={INK} strokeWidth={SW} />
    <text x={0} y={22} textAnchor="middle" fontFamily="Ma Shan Zheng, Noto Serif CJK SC, serif" fontSize={64} fill="#f2c94c">福</text>
  </g>
);
