// model-sheet comp for faces: frameSVG(0)
import { likuiBust, LKEX, motherBust, wusongBust } from './faces.mjs';
import { flushDefs } from './ink.mjs';
export const DUR = 1;
export function frameSVG(t) {
  const cells = [[likuiBust(LKEX.平常), '李逵 · 平常'], [likuiBust(LKEX.大哭), '李逵 · 大哭'], [likuiBust(LKEX.红眼), '李逵 · 红了眼'], [likuiBust(LKEX.愣住, { shirtless: true }), '李逵 · 愣住'], [motherBust({ smile: 0.6 }), '娘'], [wusongBust(), '武松']];
  let s = `<rect width="1920" height="1080" fill="#e9e1d0"/>`;
  cells.forEach(([c, name], i) => {
    const x = 30 + (i % 3) * 630, y = 10 + Math.floor(i / 3) * 535;
    s += `<g transform="translate(${x} ${y}) scale(0.66)">${c}</g><text x="${x + 20}" y="${y + 40}" font-family="Noto Sans CJK SC" font-weight="700" font-size="30" fill="#3a2a20">${name}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>${flushDefs()}</defs>${s}</svg>`;
}
