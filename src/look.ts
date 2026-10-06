import { createContext, useContext } from 'react';

/* Two candidate looks for 《筛子》, picked by the owner at the art-direction gate. Every scene reads its colours and
   motifs from here, so the film renders in either look.
   card  = "划卡": a dating app at night. Plum-black, hot pink for the people you keep, mint for the maths; people are
           little profile cards, and the ones you reject swipe off to the left.
   paper = "坐标纸": a statistician's graph paper. Warm paper, ink-black dots, red pencil for the cut, a yellow
           highlighter on the numbers; rejected people are rubbed out. */
export type LookId = 'card' | 'paper';
export type Look = {
  id: LookId; dark: boolean;
  bg: string; bgGrad: string; grid: string; gridMajor: string; dust: string;
  ink: string; dim: string; faint: string; accent: string; accentGlow: string; second: string; secondGlow: string; mark: string;
  pointIn: string; pointOut: string;
  subInk: string; subShadow: string; subBand: string; subNum: string;
  vignette: string;
};

export const LOOKS: Record<LookId, Look> = {
  card: {
    id: 'card', dark: true,
    bg: '#0b060d', bgGrad: 'radial-gradient(ellipse 85% 75% at 50% 45%, #22102a 0%, #120814 58%, #070308 100%)',
    grid: 'rgba(255,214,232,0.09)', gridMajor: 'rgba(255,214,232,0.09)', dust: '#ffd6e8',
    ink: '#fff2f6', dim: 'rgba(255,242,246,0.5)', faint: 'rgba(255,242,246,0.14)',
    accent: '#ff4f8b', accentGlow: 'rgba(255,79,139,0.75)', second: '#3dffc5', secondGlow: 'rgba(61,255,197,0.6)', mark: '#ff4f8b',
    pointIn: '#ff4f8b', pointOut: 'rgba(255,242,246,0.78)',
    subInk: '#fff2f6', subShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)',
    subBand: 'linear-gradient(180deg, rgba(7,3,8,0) 0%, rgba(7,3,8,0.72) 55%, rgba(7,3,8,0.9) 100%)', subNum: '#ff7aa8',
    vignette: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
  },
  paper: {
    id: 'paper', dark: false,
    bg: '#efe9dc', bgGrad: 'radial-gradient(ellipse 90% 80% at 50% 45%, #f6f1e6 0%, #ece5d6 65%, #ddd4c1 100%)',
    grid: 'rgba(70,110,150,0.16)', gridMajor: 'rgba(70,110,150,0.3)', dust: '#6a5a40',
    ink: '#1c1b20', dim: 'rgba(28,27,32,0.55)', faint: 'rgba(28,27,32,0.16)',
    accent: '#d8362a', accentGlow: 'rgba(216,54,42,0.0)', second: '#2a5bd6', secondGlow: 'rgba(42,91,214,0.0)', mark: '#d8362a',
    pointIn: '#1c1b20', pointOut: 'rgba(28,27,32,0.8)',
    subInk: '#1c1b20', subShadow: '0 0 10px rgba(246,241,230,0.95), 0 0 3px rgba(246,241,230,1)',
    subBand: 'linear-gradient(180deg, rgba(239,233,220,0) 0%, rgba(239,233,220,0.8) 55%, rgba(239,233,220,0.95) 100%)', subNum: '#d8362a',
    vignette: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(60,40,20,0) 60%, rgba(60,40,20,0.22) 100%)',
  },
};

export const LookCtx = createContext<Look>(LOOKS.card);
export const useLook = () => useContext(LookCtx);
