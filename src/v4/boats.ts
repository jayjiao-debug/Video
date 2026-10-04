/* Titanic's 20 lifeboats in launch order.
   Capacity: 14 lifeboats x 65, emergency cutters 1 and 2 x 40, collapsibles A-D x 47 = 1178.
   Occupancy at launch: Bill Wormstedt et al., "Titanic Lifeboat Occupancy Totals" (estimates; capped at capacity for display).
   Survivors in total: 712. */
export type Boat = { id: string; cap: number; occ: number; launch: string };
export const BOATS: Boat[] = [
  { id: '7', cap: 65, occ: 34, launch: '0:40' }, { id: '5', cap: 65, occ: 30, launch: '0:45' }, { id: '3', cap: 65, occ: 32, launch: '0:55' },
  { id: '8', cap: 65, occ: 27, launch: '1:00' }, { id: '1', cap: 40, occ: 12, launch: '1:05' }, { id: '6', cap: 65, occ: 24, launch: '1:10' },
  { id: '16', cap: 65, occ: 52, launch: '1:20' }, { id: '14', cap: 65, occ: 25, launch: '1:25' }, { id: '12', cap: 65, occ: 65, launch: '1:30' },
  { id: '9', cap: 65, occ: 40, launch: '1:30' }, { id: '11', cap: 65, occ: 50, launch: '1:35' }, { id: '13', cap: 65, occ: 55, launch: '1:40' },
  { id: '15', cap: 65, occ: 65, launch: '1:41' }, { id: '2', cap: 40, occ: 17, launch: '1:45' }, { id: '10', cap: 65, occ: 55, launch: '1:50' },
  { id: '4', cap: 65, occ: 60, launch: '1:50' }, { id: 'C', cap: 47, occ: 43, launch: '2:00' }, { id: 'D', cap: 47, occ: 35, launch: '2:05' },
  { id: 'A', cap: 47, occ: 13, launch: '2:15' }, { id: 'B', cap: 47, occ: 30, launch: '2:15' },
];
export const TOTAL_SEATS = BOATS.reduce((a, b) => a + b.cap, 0); // 1178
export const SURVIVORS = 712;
export const IN_WATER = 1500; // ~1,496-1,517 died
