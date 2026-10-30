import React from 'react';
import {TakeD} from './take53d';
/* ep53 v3 TakeD3, 111.389 → 145.333: T1 … the end card. STUB (producer): v2 TakeD with bars 90–91 left out
   (v3 < 124.976 → v2 = v3 − 36.227; after → v2 = v3 − 31.701). The builder replaces the body. */
export const TakeD3: React.FC<{t: number}> = ({t}) => <TakeD t={t < 124.976 ? t - 36.227 : Math.min(113.6, t - 31.701)} />;
