import React from 'react';
import {TitleOnGlass} from './master53';
/* ep53 v3 overlay: subtitles (lines53v3), stamp, hollow seal, title, depth tag, element tiles, end card.
   STUB (producer): only the title on the glass; the overlay builder replaces the body. */
export const Overlay53v3: React.FC<{t: number; quad: [number, number][] | null}> = ({t, quad}) => <><TitleOnGlass t={t} quad={quad} /></>;
