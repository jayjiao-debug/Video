import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

/* Load the subset fonts (scripts/fonts.py) before anything draws: canvas text sampling needs them. */
const FACES: [string, string, FontFaceDescriptors][] = [
  ['Juno Sans', 'fonts/sans.woff2', {weight: '100 900'}],
  ['Juno Serif', 'fonts/serif.woff2', {weight: '200 900'}],
  ['Juno Latin', 'fonts/latin.woff2', {weight: '300 700'}],
  ['Juno Latin', 'fonts/latin-italic.woff2', {weight: '300 700', style: 'italic'}],
];
let ready: Promise<void> | null = null;
const load = () =>
  (ready ??= Promise.all(
    FACES.map(async ([fam, file, desc]) => {
      const f = new FontFace(fam, `url(${staticFile(file)}) format('woff2')`, desc);
      await f.load();
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
    }),
  ).then(() => undefined));

export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    load().then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok ? <>{children}</> : null;
};
