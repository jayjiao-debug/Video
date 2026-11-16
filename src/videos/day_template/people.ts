// THE CAST of the starter film: the reporter is the camera (never drawn); the guest is a stock figure of the shared
// cast (src/videos/wanbi/people.ts). A real film builds its own Persons (look + accessories) here.
import { addPerson, PEOPLE, type Person } from "../wanbi/people";

export { addPerson, type Person };
/** the guest (嘉宾): a stock figure until the film has its own */
export const GUEST: Person = PEOPLE.miaoXian;
