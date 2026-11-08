import { lin } from '../../chars/rig/linchong.mjs';
const P = [
 { shoulderL: 82, elbowL: 2, spear: { hand: 'L', angle: 90, grip: 0.2 } },
 { shoulderL: 55, elbowL: 55, spear: { hand: 'L', angle: 92, grip: 0.25 } },
 { shoulderL: 150, elbowL: 25, spear: { hand: 'L', angle: 150, grip: 0.5 } },
 { shoulderL: 35, elbowL: 75, spear: { hand: 'L', angle: 0, grip: 0.55 } },
];
export default { frame(t) {
  const i = Math.round((t - 28) * 10);
  return `<rect width="1920" height="1080" fill="#fff"/>` + `<g transform="rotate(${i === 0 ? -7 : 0} 1330 905)">` + lin({ view: 'side', costume: 'A', x: 1330, y: 905, height: 680, pose: P[i] }) + '</g>';
} };
