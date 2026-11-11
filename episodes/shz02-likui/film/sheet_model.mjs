// model sheet for the owner: bodies and tigers
import { figure, LIKUI, MOTHER, man, WUSONG, axesOnBack, podao, REST } from './puppet.mjs';
import { tiger, TP } from './tiger.mjs';
import { flushDefs } from './ink.mjs';
export const DUR = 1;
const walk = { spine: 8, neck: 6, thighR: 28, shinR: 8, footR: -12, thighL: -22, shinL: -48, footL: 28, upperR: -24, foreR: -6, upperL: 26, foreL: 44 };
const T = (x, y, t) => `<text x="${x}" y="${y}" font-family="Noto Sans CJK SC" font-weight="700" font-size="30" fill="#3a2a20" text-anchor="middle">${t}</text>`;
export function frameSVG(t) {
  let s = `<rect width="1920" height="1080" fill="#e9e1d0"/>`;
  if (t < 0.5) {
    s += `<line x1="0" y1="960" x2="1920" y2="960" stroke="#b8ad98" stroke-width="2"/>`;
    const put = (S, pose, x, o = {}) => { s += figure(S, pose, { x, y: 960, ...o }).svg; };
    put(LIKUI, REST, 250, { back: axesOnBack }); s += T(250, 1020, '李逵（带板斧）');
    put(LIKUI, walk, 720, { hold: (c) => podao(c.J.wristR, -62, c.H) }); s += T(720, 1020, '李逵（回乡路上，只带朴刀）');
    put(MOTHER, { ...REST, spine: 22, neck: 16, upperR: 30, foreR: 60 }, 1130, { expr: { smile: 0.5 } }); s += T(1130, 1020, '娘');
    put(WUSONG, REST, 1400); s += T(1400, 1020, '武松');
    put(man({ robe: '#6a7a5a', hat: 'cloth', beard: 'short' }), REST, 1620); put(man({ robe: '#7a5a4a', hat: 'straw' }), REST, 1800, { flip: true }); s += T(1710, 1020, '猎户、路人');
  } else {
    s += tiger(TP.stand, { x: 120, y: 470, u: 96 }).svg + tiger(TP.roar, { x: 1080, y: 470, u: 96 }).svg;
    s += tiger(TP.leap, { x: 300, y: 860, u: 104, noGround: true }).svg + tiger(TP.crouch, { x: 1230, y: 1010, u: 90 }).svg + tiger(TP.stand, { x: 1660, y: 1010, u: 50, cub: true, white: false }).svg;
    s += T(330, 520, '母虎') + T(1300, 520, '吊睛白额虎') + T(520, 1050, '扑') + T(1380, 1050, '伏') + T(1730, 1050, '小虎');
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>${flushDefs()}</defs>${s}</svg>`;
}
