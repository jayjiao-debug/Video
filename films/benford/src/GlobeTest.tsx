import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Globe, C, worldOf, project } from './globe';
import type { Key } from './lib';

/* Orientation check: frame i shows the globe spun by i*60 degrees with five known countries labelled.
   The labels must sit on the right land masses; fit LON0 / axis signs in globe.tsx until they do. */
const KEYS: Key[] = [[0, [0, 2, 26], [0, 0, 0]], [100, [0, 2, 26], [0, 0, 0]]];
const PICK = ['CHN', 'BRA', 'GBR', 'AUS', 'USA', 'IND', 'ZAF', 'JPN', 'EGY', 'ARG', 'CAN', 'RUS'];
export const GlobeTest: React.FC = () => {
  const f = useCurrentFrame();
  const spin = f * 60;
  return (
    <AbsoluteFill style={{ background: '#05070d' }}>
      <Globe T={0} keys={KEYS} spin={spin} pin={0.035} ambient={2.5} />
      {C.filter((c) => PICK.includes(c.code)).map((c) => {
        const p = project(KEYS, 0, worldOf(c.lat, c.lon, spin));
        if (p.facing < 0.05) return null;
        return <div key={c.code} style={{ position: 'absolute', left: p.x + 8, top: p.y - 14, color: '#ffe08a', font: '600 24px sans-serif', textShadow: '0 0 6px #000' }}>{c.code}</div>;
      })}
      <div style={{ position: 'absolute', left: 30, top: 20, color: '#fff', font: '24px monospace' }}>spin {spin}°</div>
    </AbsoluteFill>
  );
};
