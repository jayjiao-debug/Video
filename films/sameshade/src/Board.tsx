import React from 'react';

/* Our own checker-shadow board (the Adelson 1995 construction, redrawn in code, not his image).
   Light squares are exactly 200, dark squares exactly 120; the cylinder's shadow is black at alpha 0.4, so a light
   square fully inside it is 200 × 0.6 = 120 — exactly the dark square A outside it. No grain, no vignette over the
   board: the pixels of A and B must stay identical. */
export const LIGHT = 200, DARK = 120, SHADOW_ALPHA = 0.4;
export const grey = (v: number) => `rgb(${v},${v},${v})`;

// board coords (u, v) in cells -> screen; an isometric diamond centred at (cx, cy0 + 5 b / 2)
export type Proj = { cx: number; cy0: number; a: number; b: number };
export const P0: Proj = { cx: 960, cy0: 250, a: 120, b: 62 };
export const pt = (p: Proj, u: number, v: number): [number, number] => [p.cx + (u - v) * p.a, p.cy0 + (u + v) * p.b];
const poly = (p: Proj, pts: [number, number][]) => pts.map(([u, v]) => pt(p, u, v).join(',')).join(' ');

export const A_CELL: [number, number] = [0, 1];
export const B_CELL: [number, number] = [2, 2];
export const CYL: [number, number] = [2.5, 0.0]; // cylinder base centre (board coords), on the back edge
export const CYL_R = 0.75;

/** the cast shadow: light from behind the cylinder, so the shadow runs along +v (towards the viewer, lower-left on
    screen) and covers B (u 2..3, v 2..3) with a 0.25-cell margin of full shadow; off slides it (board coords) */
export const shadowPoly = (p: Proj, off: [number, number] = [0, 0]) => {
  const [cu, cv] = CYL, hw = 0.78, v1 = 3.35, cap = 0.55;
  const pts: [number, number][] = [[cu - hw, cv], [cu + hw, cv]];
  for (let i = 0; i <= 14; i++) { const t = Math.PI * (i / 14); pts.push([cu + hw * Math.cos(t), v1 + cap * Math.sin(t)]); }
  return poly(p, pts.map(([u, v]) => [u + off[0], v + off[1]] as [number, number]));
};

export const Board: React.FC<{ p?: Proj; shadowOff?: [number, number]; showShadow?: boolean; bFixed?: boolean; labels?: boolean; maskAB?: number; cylinder?: boolean }> =
  ({ p = P0, shadowOff = [0, 0], showShadow = true, bFixed = false, labels = true, maskAB = 0, cylinder = true }) => {
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const light = (i + j) % 2 === 0;
      cells.push(<polygon key={`${i}-${j}`} points={poly(p, [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]])} fill={grey(light ? LIGHT : DARK)} />);
    }
    const [ax, ay] = pt(p, A_CELL[0] + 0.5, A_CELL[1] + 0.5), [bx, by] = pt(p, B_CELL[0] + 0.5, B_CELL[1] + 0.5);
    const [cx, cy] = pt(p, CYL[0], CYL[1]);
    const rx = p.a * CYL_R * Math.SQRT2, ry = p.b * CYL_R * Math.SQRT2, H = 210;
    const bPoly = poly(p, [[B_CELL[0], B_CELL[1]], [B_CELL[0] + 1, B_CELL[1]], [B_CELL[0] + 1, B_CELL[1] + 1], [B_CELL[0], B_CELL[1] + 1]]);
    const aPoly = poly(p, [[A_CELL[0], A_CELL[1]], [A_CELL[0] + 1, A_CELL[1]], [A_CELL[0] + 1, A_CELL[1] + 1], [A_CELL[0], A_CELL[1] + 1]]);
    return (
      <g>
        <defs>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
          <linearGradient id="cylG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1f5a2e" /><stop offset="0.35" stopColor="#3f9a52" /><stop offset="0.6" stopColor="#5cbf6d" /><stop offset="1" stopColor="#1c4d27" />
          </linearGradient>
        </defs>
        {/* board thickness */}
        <polygon points={`${pt(p, 0, 5).join(',')} ${pt(p, 5, 5).join(',')} ${pt(p, 5, 5)[0]},${pt(p, 5, 5)[1] + 34} ${pt(p, 0, 5)[0]},${pt(p, 0, 5)[1] + 34}`} fill="#3a3a3a" />
        <polygon points={`${pt(p, 5, 0).join(',')} ${pt(p, 5, 5).join(',')} ${pt(p, 5, 5)[0]},${pt(p, 5, 5)[1] + 34} ${pt(p, 5, 0)[0]},${pt(p, 5, 0)[1] + 34}`} fill="#525252" />
        {cells}
        {showShadow && <polygon points={shadowPoly(p, shadowOff)} fill="#000" opacity={SHADOW_ALPHA} filter="url(#soft)" />}
        {/* B held at its true value (it does not follow the shadow) when we slide the shadow away */}
        {bFixed && <polygon points={bPoly} fill={grey(DARK)} />}
        {cylinder && (
          <g>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#0d0d0d" opacity={0.5} filter="url(#soft)" />
            <rect x={cx - rx} y={cy - H} width={rx * 2} height={H} fill="url(#cylG)" />
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#cylG)" />
            <ellipse cx={cx} cy={cy - H} rx={rx} ry={ry} fill="#6fd27f" />
          </g>
        )}
        {maskAB > 0 && (
          <g opacity={maskAB}>
            <rect x={-2000} y={-2000} width={6000} height={6000} fill="#050505" />
            <polygon points={aPoly} fill={grey(DARK)} />
            <polygon points={bPoly} fill={grey(DARK)} />
          </g>
        )}
        {labels && (
          <g style={{ fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 900, fontSize: 64 }}>
            <text x={ax} y={ay + 22} textAnchor="middle" fill={maskAB > 0.5 ? '#f3ede2' : '#1a1a1a'}>A</text>
            <text x={bx} y={by + 22} textAnchor="middle" fill={maskAB > 0.5 ? '#f3ede2' : '#1a1a1a'}>B</text>
          </g>
        )}
      </g>
    );
  };
