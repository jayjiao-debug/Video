// THE FRAME of 采访蒙娜丽莎的一天: the film's size, its lens and its one place. (The timeline joins these in story.ts when
// the voice timing exists; the world, the place and the previews only need what is here.)
import { makeLens } from "../../kit/day/timeline";

export const FPS = 30;
export const W = 1080, H = 1920;
/** ONE place: the stage (sets/stage.ts). The film's rooms are its "room" param: she never moves, the world does. */
export type Place = "stage";
export const PLACES: Place[] = ["stage"];
export const { lensTan, lensFov } = makeLens(H);
