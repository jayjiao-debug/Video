import { L } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
export default { frame(t) {
  const c = {x:0,y:0,zoom:1};
  let s = `<rect width="1920" height="1080" fill="#e8dcc0"/>`;
  s += lin({ view: 'side', costume: 'A', expr: EX.怒, x: 300, y: 980, height: 560, pose: { shoulderL: 70, elbowL: 10, shoulderR: 60, elbowR: 20, spear: { hand: 'L', angle: -90, grip: 0.7 } } });
  s += lin({ view: 'side', costume: 'A', expr: EX.平静, x: 750, y: 980, height: 560, pose: { shoulderL: 20, elbowL: 60, spear: { hand: 'L', angle: 0, grip: 0.5 } } });
  s += lin({ view: 'side', costume: 'C', expr: EX.平静, x: 1200, y: 980, height: 560, pose: { shoulderL: 30, elbowL: 100, spear: { hand: 'L', angle: -60, grip: 0.3, gourd: true } } });
  s += lin({ view: 'side', costume: 'C', expr: EX.平静, x: 1650, y: 980, height: 560, pose: { shoulderL: 50, elbowL: 30, spear: { hand: 'L', angle: -90, grip: 0.6, gourd: true } } });
  return s; } };
