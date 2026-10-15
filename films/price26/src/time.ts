export type Line = [number, number, string];
export const B = 0.50625;
export const bt = (k: number) => 0.4058 + k * B;
export const CUT = {} as Record<string, number>;
