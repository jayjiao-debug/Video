/* 《倒挂飞车》 timeline (placeholder until the plan is approved). Track: the owner's slowed track, ~92.05 BPM. */
export type Line = [number, number, string];
export const B = 0.6518;
export const bt = (k: number) => 0.12 + k * B;
export const CUT: Record<string, number> = {};
