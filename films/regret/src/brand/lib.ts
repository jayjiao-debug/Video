// Helpers the Juno brand components expect (ported from jayjiao-debug/Video explainer/src/lib).
import { Easing, interpolate } from 'remotion';

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

/** frame-based progress 0..1 over [start, start + dur] */
export const prog = (frame: number, start: number, dur = 18, e = ease.out) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });

export const font = {
  serif: '"Noto Serif CJK SC", "Noto Serif SC", serif',
  sans: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
  latin: '"Cormorant Garamond", Georgia, serif',
  latinItalic: '"Cormorant Garamond", Georgia, serif',
};
