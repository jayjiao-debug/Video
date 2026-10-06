import { createContext, useContext } from 'react';

/* Two candidate looks for 《草稿箱》, picked by the owner at the art-direction gate.
   night = "深夜": a chat app at 2 a.m. Blue-black, warm amber for the drafts (what you didn't do), cool blue for the
           sent messages (what you did). Quiet, close, a phone-lit room.
   dusk  = "黄昏": the end of a day. A purple-to-ember sky, cream type, sunset orange for the drafts, teal for the
           sent; a low sun and long light. More cinematic, more about a whole life. */
export type LookId = 'night' | 'dusk';
export type Look = {
  id: LookId; dark: boolean;
  bg: string; bgGrad: string; grid: string; gridMajor: string; dust: string;
  ink: string; dim: string; faint: string; accent: string; accentGlow: string; second: string; secondGlow: string; mark: string;
  pointIn: string; pointOut: string; panel: string; panelEdge: string;
  subInk: string; subShadow: string; subBand: string; subNum: string;
  vignette: string;
};

export const LOOKS: Record<LookId, Look> = {
  night: {
    id: 'night', dark: true,
    bg: '#06080e', bgGrad: 'radial-gradient(ellipse 80% 70% at 50% 42%, #141b2c 0%, #0a0e18 58%, #04060a 100%)',
    grid: 'rgba(200,220,255,0.07)', gridMajor: 'rgba(200,220,255,0.07)', dust: '#cfe0ff',
    ink: '#f2f4f8', dim: 'rgba(242,244,248,0.5)', faint: 'rgba(242,244,248,0.12)',
    accent: '#ffb547', accentGlow: 'rgba(255,181,71,0.7)', second: '#7aa2ff', secondGlow: 'rgba(122,162,255,0.6)', mark: '#ffb547',
    pointIn: '#ffb547', pointOut: 'rgba(242,244,248,0.6)', panel: 'rgba(22,28,44,0.92)', panelEdge: 'rgba(242,244,248,0.14)',
    subInk: '#f6f1e6', subShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)',
    subBand: 'linear-gradient(180deg, rgba(4,6,10,0) 0%, rgba(4,6,10,0.72) 55%, rgba(4,6,10,0.9) 100%)', subNum: '#f4b860',
    vignette: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
  },
  dusk: {
    id: 'dusk', dark: true,
    bg: '#120a14', bgGrad: 'linear-gradient(180deg, #1b1030 0%, #3a1a3c 38%, #7a3a3a 64%, #c8673a 84%, #f0a050 100%)',
    grid: 'rgba(255,230,200,0.06)', gridMajor: 'rgba(255,230,200,0.06)', dust: '#ffe2b8',
    ink: '#fff4e6', dim: 'rgba(255,244,230,0.6)', faint: 'rgba(255,244,230,0.16)',
    accent: '#ff9a3c', accentGlow: 'rgba(255,154,60,0.75)', second: '#5fd0c8', secondGlow: 'rgba(95,208,200,0.55)', mark: '#ff9a3c',
    pointIn: '#ff9a3c', pointOut: 'rgba(255,244,230,0.65)', panel: 'rgba(30,14,34,0.82)', panelEdge: 'rgba(255,244,230,0.18)',
    subInk: '#fff4e6', subShadow: '0 2px 14px rgba(20,6,20,0.95), 0 0 2px rgba(20,6,20,0.9)',
    subBand: 'linear-gradient(180deg, rgba(20,8,20,0) 0%, rgba(20,8,20,0.6) 55%, rgba(20,8,20,0.85) 100%)', subNum: '#ffb86b',
    vignette: 'radial-gradient(ellipse 80% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,0,10,0.55) 100%)',
  },
};

export const LookCtx = createContext<Look>(LOOKS.night);
export const useLook = () => useContext(LookCtx);
