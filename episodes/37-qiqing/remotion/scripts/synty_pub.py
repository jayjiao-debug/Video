#!/usr/bin/env python3
"""Synty POLYGON pack(s) -> a small asset dir for Remotion/three.js or Godot: hard links to the chosen FBX + the textures their
material slots use, and matmap.json (prefab -> albedo per slot, in order). The Synty files stay outside the repo (licence + public
repo). Several packs can be added one after another into the same PUB: matmap.json is merged.

    SYNTY_SRC=<unzipped SourceFiles folder> SYNTY_PUB=<asset dir> python3 -I scripts/synty_pub.py SM_Prop_Bed_Large_01 Characters ...
    'tex:NAME.png' args add a texture by file name (normal maps, floors, alternative atlases)
    'dir:SUBDIR' puts the following FBX under fbx/SUBDIR (e.g. animations)
    'def:NAME.png' = the texture for the following FBX whose prefab name is not in the material list (character packs name
                     prefabs differently from their FBX files)

Then render with PUBLIC_DIR=$PUB (scripts/frame_ms.mjs) or point the Godot project's assets folder at it."""
import os, json, sys, glob
SRC = os.environ.get('SYNTY_SRC', '/dev/shm/synty/egypt'); PUB = os.environ.get('SYNTY_PUB', '/dev/shm/synty/pub')
mm = {}
for ml in glob.glob(f'{SRC}/MaterialList_*.txt'):   # every material list in the pack (some packs ship two)
    cur = None; mesh_n = 0
    for ln in open(ml, encoding='utf-8', errors='ignore').read().replace('\r', '').split('\n'):
        s = ln.strip()
        if s.startswith('Prefab Name:'): cur = s.split(':', 1)[1].strip(); mm[cur] = []; mesh_n = 0
        elif s.startswith('Mesh Name:'): mesh_n += 1
        elif s.startswith('Albedo:') and cur and mesh_n <= 1: mm[cur].append(s.split(':', 1)[1].strip().split(' ')[0])
tex = {}
for r, _, fs in os.walk(SRC):
    for f in fs:
        if f.lower().endswith(('.png', '.tga', '.jpg')): tex.setdefault(f, os.path.join(r, f))
# material lists sometimes name an atlas differently from the shipped file
alias = {'PolygonAncientEgypt_01_A.png': 'PolygonAncientEgypt_Texture_01_A.png'}
os.makedirs(f'{PUB}/fbx', exist_ok=True); os.makedirs(f'{PUB}/tex', exist_ok=True)
old = json.load(open(f'{PUB}/matmap.json')) if os.path.exists(f'{PUB}/matmap.json') else {'mat': {}, 'tex': []}
need = set(a[4:] for a in sys.argv[1:] if a.startswith('tex:')); out = {}; sub = ''; dflt = None
for w in sys.argv[1:]:
    if w.startswith('tex:'): continue
    if w.startswith('dir:'): sub = w[4:]; os.makedirs(f'{PUB}/fbx/{sub}', exist_ok=True); continue
    if w.startswith('def:'): dflt = w[4:]; continue
    p = None
    for r, _, fs in os.walk(SRC):
        if w + '.fbx' in fs: p = os.path.join(r, w + '.fbx'); break
    if not p: print('missing', w); continue
    d = f'{PUB}/fbx/{sub + "/" if sub else ""}{w}.fbx'
    if not os.path.exists(d): os.link(p, d)
    out[w] = mm.get(w) or ([dflt] if dflt else []); need.update(out[w])
got = []
import re
def find_tex(n):
    # exact, the alias table, then the common Synty mismatch 'Pack_01_A.png' (list) vs 'Pack_Texture_01_A.png' (file), any extension
    f = tex.get(alias.get(n, n)) or tex.get(n)
    if not f: f = tex.get(re.sub(r'_(\d\d_[A-Z]\.png)$', r'_Texture_\1', n))
    if not f:
        stem = os.path.splitext(n)[0].lower()
        f = next((v for k, v in tex.items() if os.path.splitext(k)[0].lower() == stem), None)
    return f
for n in need:
    f = find_tex(n)
    if not f: print('no texture', n); continue
    d = f'{PUB}/tex/{n}'
    if not os.path.exists(d): os.link(f, d)
    got.append(n)
old['mat'].update(out); old['tex'] = sorted(set(old['tex']) | set(got))
json.dump(old, open(f'{PUB}/matmap.json', 'w'), indent=1)
print(len(out), 'fbx,', len(got), 'textures from', os.path.basename(SRC))
