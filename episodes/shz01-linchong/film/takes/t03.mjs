import { lin } from '../../chars/rig/linchong.mjs';
export default { frame(t) {
  return `<rect width="1920" height="1080" fill="#fff"/>` + lin({ view: 'side', costume: 'C', x: 1520, y: 1010, height: 500, pose: { shoulderL: 75, elbowL: 5, spear: { hand: 'L', angle: 90, grip: 0.2, gourd: true } } });
} };
