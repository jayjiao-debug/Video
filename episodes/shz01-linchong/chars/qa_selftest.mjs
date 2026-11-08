// Self-test for the frame checker: synthetic frames that must be flagged.
import { FRAMES, compose } from './scenes16.mjs';
import { front, EX } from './manhua.mjs';
const h = front(EX['平静'], { hat: false, headscarf: 'tokyo', noScarf: true });
const face = `<g transform="translate(960,520) scale(1.1) translate(-300,-400)">${h.body}<rect data-face="1" x="196" y="206" width="208" height="380" fill="none"/></g>`;
FRAMES.push({ id: 'T1', make: () => compose(h.defs, [{ id: 'c', z: 30, depth: 1, body: face, bleed: 'b' }, { id: 'prop', z: 40, depth: 1, body: '<rect x="900" y="300" width="200" height="200" fill="#a33"/>', bleed: '' }], '这是一句会挡住脸的字幕测试吗') });
FRAMES.push({ id: 'T2', make: () => compose(h.defs, [{ id: 'c', z: 30, depth: 1, body: face, bleed: '' }, { id: 'prop', z: 40, depth: 1, body: '<rect x="1800" y="100" width="300" height="100" fill="#a33"/>', bleed: '' }], '') });
process.argv = [process.argv[0], 'x', '/dev/shm/shz01/qa_selftest', 'T1,T2'];
await import('./render6.mjs');
