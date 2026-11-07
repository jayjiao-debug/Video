#!/usr/bin/env python3
"""Synty POLYGON pack -> a small Remotion public dir: hard links to the chosen FBX + the textures their slots use, and matmap.json.
The Synty files stay outside the repo (licence + public repo). Usage:
    python3 -I scripts/synty_pub.py SM_Bld_Sphinx_Large_01 Characters ...   (SRC = the unzipped SourceFiles folder, PUB = the public dir)
then render with PUBLIC_DIR=$PUB (scripts/frame_ms.mjs). Original note: build a small public dir of hardlinks + matmap.json (prefab -> albedo per slot, in order) for the Synty look test"""
import os, json, sys, re
SRC = os.environ.get('SYNTY_SRC', '/dev/shm/synty/egypt'); PUB = os.environ.get('SYNTY_PUB', '/dev/shm/synty/pub')
txt = open(f'{SRC}/MaterialList_PolygonAncientEgypt.txt', encoding='utf-8', errors='ignore').read().replace('\r', '')
mm = {}; cur = None; mesh_n = 0
for ln in txt.split('\n'):
    s = ln.strip()
    if s.startswith('Prefab Name:'): cur = s.split(':', 1)[1].strip(); mm[cur] = []; mesh_n = 0
    elif s.startswith('Mesh Name:'): mesh_n += 1
    elif s.startswith('Albedo:') and cur and mesh_n <= 1: mm[cur].append(s.split(':', 1)[1].strip().split(' ')[0])
tex = {}
for r, _, fs in os.walk(f'{SRC}/Textures'):
    for f in fs: tex.setdefault(f, os.path.join(r, f))
# Synty's material list names the atlas PolygonAncientEgypt_01_A.png; the file ships as Alts/PolygonAncientEgypt_Texture_01_A.png
alias = {'PolygonAncientEgypt_01_A.png': 'PolygonAncientEgypt_Texture_01_A.png'}
want = sys.argv[1:]
os.makedirs(f'{PUB}/fbx', exist_ok=True); os.makedirs(f'{PUB}/tex', exist_ok=True)
need = {'PolygonAncientEgypt_01_A.png', 'Simple_Sky_01.png', 'Stucco_01.png'}; out = {}
for w in want:
    p = None
    for r, _, fs in os.walk(f'{SRC}/FBX'):
        if w + '.fbx' in fs: p = os.path.join(r, w + '.fbx')
    if not p: print('missing', w); continue
    d = f'{PUB}/fbx/{w}.fbx'
    if not os.path.exists(d): os.link(p, d)
    out[w] = mm.get(w, []); need.update(out[w])
for n in need:
    f = tex.get(alias.get(n, n)) or tex.get(n)
    if not f: print('no texture', n); continue
    d = f'{PUB}/tex/{n}'
    if not os.path.exists(d): os.link(f, d)
json.dump({'mat': out, 'tex': sorted(n for n in need if os.path.exists(f'{PUB}/tex/{n}'))}, open(f'{PUB}/matmap.json', 'w'), indent=1)
print(json.dumps(out, indent=0)[:1500])
