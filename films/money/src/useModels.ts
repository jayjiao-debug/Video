import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { continueRender, delayRender } from 'remotion';
import { loadModel, type ModelName } from './models';

/** loads models (cached), holding the frame until they are ready; returns clones so scenes can move them freely */
export const useModels = <K extends ModelName>(names: K[]) => {
  const key = names.join(',');
  const [m, setM] = useState<Record<K, THREE.Group> | null>(null);
  const [h] = useState(() => delayRender(`models ${key}`, { timeoutInMilliseconds: 120000 }));
  useEffect(() => {
    Promise.all(names.map((n) => loadModel(n))).then((gs) => {
      const r = {} as Record<K, THREE.Group>;
      names.forEach((n, i) => { r[n] = gs[i].clone(true); });
      setM(r);
      continueRender(h);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, h]);
  return m;
};

const ASYNC = new Map<string, Promise<unknown>>();
/** any async asset (textures, prepared meshes), cached by key and held behind delayRender */
export const useAsset = <V,>(key: string, load: () => Promise<V>) => {
  const [v, setV] = useState<V | null>(null);
  const [h] = useState(() => delayRender(`asset ${key}`, { timeoutInMilliseconds: 120000 }));
  useEffect(() => {
    if (!ASYNC.has(key)) ASYNC.set(key, load());
    (ASYNC.get(key) as Promise<V>).then((x) => { setV(x); continueRender(h); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, h]);
  return v;
};
