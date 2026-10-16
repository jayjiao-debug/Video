/* One cardboard puppet (transparent, 2000×1400, feet at 1000,1100) or one soft-focus background (1920×1080), for pre-rendering. */
import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill } from 'remotion';
import * as P from './puppets';

export const PUPPETS: Record<string, () => P.Puppet> = {
  zhuang: () => P.person({ hair: 'topknot', face: 'smile', dress: 'robe', beard: 'long' }),
  hui: () => P.person({ hair: 'cap', face: 'skeptic', dress: 'robe', beard: 'short' }),
  nagel: () => P.person({ hair: 'short', face: 'think', dress: 'shirt' }),
  kant: () => P.person({ hair: 'wig', face: 'calm', dress: 'coat' }),
  bentham: () => P.person({ hair: 'long', face: 'kind', dress: 'coat' }),
  singer: () => P.person({ hair: 'short', face: 'calm', dress: 'shirt' }),
  schweitzer: () => P.person({ hair: 'bushy', face: 'kind', dress: 'coat', mustache: true }),
  lecky: () => P.person({ hair: 'side', face: 'calm', dress: 'coat' }),
  researcher: () => P.person({ hair: 'short', face: 'calm', dress: 'shirt', glasses: true }),
  we: () => P.person({ hair: 'bald', face: 'sad', dress: 'shirt' }),
  cat: () => P.CAT, rhino: () => P.RHINO, fly: () => P.FLY, dog: () => P.DOG, chicken: () => P.CHICKEN, bird: () => P.BIRD, frog: () => P.FROG, fish: () => P.FISH, bat: () => P.BAT, hippo: () => P.HIPPO,
  lamp: () => P.LAMP, window: () => P.WINDOW, swatter: () => P.SWATTER, heart: () => P.heart(0), clipboard: () => P.CLIPBOARD, ruler: () => P.RULER, boat: () => P.BOAT, bridge: () => P.BRIDGE, sign: () => P.SIGN, tag: () => P.TAG,
  b_s_l: () => P.bubble(520, 170, -1), b_s_r: () => P.bubble(520, 170, 1), b_m_l: () => P.bubble(680, 210, -1), b_m_r: () => P.bubble(680, 210, 1),
  b_l_l: () => P.bubble(860, 250, -1), b_l_r: () => P.bubble(860, 250, 1), b_xl_l: () => P.bubble(1060, 300, -1), b_xl_r: () => P.bubble(1060, 300, 1),
};

const Cv: React.FC<{ w: number; h: number; draw: (g: CanvasRenderingContext2D) => void }> = ({ w, h, draw }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current; if (c) draw(c.getContext('2d')!); }, [draw]);
  return <canvas ref={ref} width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }} />;
};

export const Asset: React.FC<{ id: string }> = ({ id }) => (
  <AbsoluteFill style={{ background: 'transparent' }}>
    <Cv w={2000} h={1400} draw={(g) => {
      P.reseed(id.split('').reduce((a, c) => a + c.charCodeAt(0), 7));
      P.cutout(g, PUPPETS[id](), 1000, 1100, 1, 2000, 1400);
    }} />
  </AbsoluteFill>
);
export const Bg: React.FC<{ id: string }> = ({ id }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Cv w={1920} h={1080} draw={(g) => {
      P.reseed(3 + id.length * 17);
      const L = document.createElement('canvas'); L.width = 1920; L.height = 1080; const l = L.getContext('2d')!;
      P.BACKGROUNDS[id](l, 1920, 1080);
      g.save(); g.filter = 'blur(20px)'; g.drawImage(L, -40, -40, 2000, 1160); g.restore(); g.filter = 'none';
      const v = g.createRadialGradient(960, 500, 380, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
    }} />
  </AbsoluteFill>
);
