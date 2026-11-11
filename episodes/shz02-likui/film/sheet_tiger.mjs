import { tiger, TP } from './tiger.mjs';
import { flushDefs } from './ink.mjs';
export const DUR = 1;
export function frameSVG() {
  let s = `<rect width="1920" height="1080" fill="#e9e1d0"/><line x1="0" y1="500" x2="1920" y2="500" stroke="#b8ad98" stroke-width="2"/><line x1="0" y1="1020" x2="1920" y2="1020" stroke="#b8ad98" stroke-width="2"/>`;
  s += tiger(TP.stand, { x: 130, y: 500, u: 100 }).svg + tiger(TP.roar, { x: 820, y: 500, u: 100 }).svg + tiger(TP.crouch, { x: 1420, y: 500, u: 90 }).svg;
  s += tiger(TP.leap, { x: 300, y: 860, u: 110, noGround: true }).svg + tiger(TP.prowl, { x: 1050, y: 1020, u: 100 }).svg + tiger(TP.stand, { x: 1640, y: 1020, u: 55, cub: true, white: false }).svg;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>${flushDefs()}</defs>${s}</svg>`;
}
