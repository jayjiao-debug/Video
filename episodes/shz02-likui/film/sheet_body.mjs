import { figure, LIKUI, MOTHER, man, WUSONG, axesOnBack, podao, saber, REST } from './puppet.mjs';
import { LKEX } from './faces.mjs';
import { flushDefs } from './ink.mjs';
export const DUR = 1;
const walk = { spine: 8, neck: 6, thighR: 28, shinR: 8, footR: -12, thighL: -22, shinL: -48, footL: 28, upperR: -24, foreR: -6, upperL: 26, foreL: 44 };
const crouch = { spine: 46, neck: 30, thighR: 82, shinR: -38, footR: 0, thighL: 70, shinL: -52, footL: 20, upperR: 60, foreR: 130, upperL: 50, foreL: 120 };
export function frameSVG() {
  let s = `<rect width="1920" height="1080" fill="#e9e1d0"/><line x1="0" y1="980" x2="1920" y2="980" stroke="#b8ad98" stroke-width="2"/>`;
  const put = (S, pose, x, o = {}) => { const r = figure(S, pose, { x, y: 980, ...o }); s += r.svg; return r; };
  put(LIKUI, REST, 230, { back: axesOnBack });
  put(LIKUI, walk, 680, { hold: (c) => podao(c.J.wristR, -62, c.H), expr: LKEX.平常 });
  put(MOTHER, { ...REST, spine: 22, neck: 16, upperR: 30, foreR: 60 }, 1080, { expr: { smile: 0.5 } });
  put(WUSONG, REST, 1360);
  put(man({ robe: '#6a7a5a', hat: 'cloth', beard: 'short' }), REST, 1600);
  put(man({ robe: '#7a5a4a', hat: 'straw' }), REST, 1800, { flip: true });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>${flushDefs()}</defs>${s}</svg>`;
}
