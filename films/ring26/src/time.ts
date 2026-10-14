/* ring26 timing helpers. The channel track's beat grid; picture time equals track time (the pause stops both). */
export const bt = (k: number) => 0.4058 + k * 0.50625;
export const CUT = {} as Record<string, number>;
export type Line = [number, number, string];
