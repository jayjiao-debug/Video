import React from 'react';
import {M} from './m3';

/* subtitle mark-up in this film's colours: [yellow] flow / the answer, {red} challenge or the trap, <blue> skill */
export const Rich3: React.FC<{s: string}> = ({s}) => (
  <>
    {s
      .split(/(\[[^\]]+\]|\{[^}]+\}|<[^>]+>)/)
      .filter(Boolean)
      .map((seg, i) => {
        const c = seg.startsWith('[') ? M.yellow : seg.startsWith('{') ? M.red : seg.startsWith('<') ? M.blue : null;
        return c ? <span key={i} style={{color: c}}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>;
      })}
  </>
);
