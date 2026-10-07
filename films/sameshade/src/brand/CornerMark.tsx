import React from 'react';
import { JUNO } from './identity';
import { font } from './lib';

/** The quiet corner mark: top-right (Douyin puts its own watermark top-left), ~20px, 55% opacity. */
export const CornerMark: React.FC<{ o: number }> = ({ o }) =>
  o <= 0.001 ? null : (
    <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * o, fontFamily: font.sans, fontWeight: 500, fontSize: 20,
      letterSpacing: '0.3em', color: 'rgba(243, 237, 226, 0.58)' }}>
      <span style={{ color: JUNO.colors.gold }}>◆ </span>
      {JUNO.mark}
    </div>
  );
