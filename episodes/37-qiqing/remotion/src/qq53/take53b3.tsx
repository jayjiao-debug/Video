import React from 'react';
import {TakeB} from './tomb53';
import {TakeC} from './take53c';
/* ep53 v3 TakeB3, 20.821 → 38.935: the dive, the dig, a faster descent, the chamber (roof, lids ①②, top-down coffin), the rinse.
   STUB (producer): maps v3 time linearly onto v2 20.821 → 43.463 so the film renders; the builder replaces the body. */
export const TakeB3: React.FC<{t: number}> = ({t}) => { const v2 = 20.821 + (t - 20.821) * (43.463 - 20.821) / (38.935 - 20.821);
	return v2 < 33.274 ? <TakeB t={v2} /> : <TakeC t={v2} />; };
