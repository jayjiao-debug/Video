/* ep53 v3 (2:25, 4360 frames): the timeline constants and the v2 → v3 time maps (episodes/53-goujian/MUSIC_NOTES_v3.md). */
export const FPS3 = 30, FRAMES3 = 4360, LEN3 = FRAMES3 / FPS3;
export const P3 = 0.56605, DA3 = (k: number) => 0.4432 + 2.2642 * k, frame3 = (t: number) => Math.round(t * 30);
export const V3 = {DIVE: 20.821, DRAW: DA3(17), G0: 51.954, B1: 92.709, M1: DA3(43), HUSH: DA3(47), STILL: DA3(49) - 0.75, T1: DA3(49),
	ARRIVAL: DA3(53), P1: DA3(59), CARD: DA3(62)};
/** v3 → v2 time for the legs that reuse the v2 picture as is */
export const SHIFT_DRAW = 43.463 - DA3(17);        // +4.528: v3 38.935–51.954 = v2 43.463–56.482
export const SHIFT_MID = 56.482 - 92.709;           // −36.227: v3 92.709–111.389 = v2 56.482–75.162
