import React from 'react';
import {DigB3} from './tomb53b3';
import {Chamber53B3} from './chamber53b3';
/* ep53 v3 TakeB3, 20.821 → 38.935 (MUSIC_NOTES_v3 rows 4–7), one camera (cam53b3.camB3):
   20.821 the dive through the 11 pommel rings (tomb53's morph, unchanged) · 22.6 → 29.45 the 1965 dig in the snow, falling all the
   time, tilting into the shaft · 29.45 → 33.839 the descent (≈2.4 m/s, 五花土 → 青灰泥 → 白膏泥) · 33.839 the 椁 roof planks ·
   34.406 lid ① · 35.538 lid ② · 36.670 top-down over the inner coffin (the sword beside the occupant, on the left, the knife) ·
   ≈37.4–38.3 the gloved hands lift and rinse the sheath · 38.322 the draw starts · 38.935 = v2 TakeC(43.463).
   The renderer switches from the dig (tomb53b3) to the chamber (chamber53b3) deep in the shaft, where both draw the same shaft. */
export const T_SWITCH_B3 = 32.1;   // tau 34.37: before the chamber's darkening ring around the roof starts (tau 34.4), camera 6 m down
export const TakeB3: React.FC<{t: number}> = ({t}) => (t < T_SWITCH_B3 ? <DigB3 t={t} /> : <Chamber53B3 t={t} />);
