# subset the CJK fonts to the characters this film uses (run again after any text change)
from fontTools.ttLib import TTCollection, TTFont
from fontTools import subset
txt = ''.join(open(f, encoding='utf8').read() for f in ['lines.json', 'panels.js', 'main.js', 'film.html', 'data.json'])
chars = set(txt) | set('0123456789%.,:+-×≈—…？！，。：·（）()/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ■')
def sc(ttc):
    for f in TTCollection(ttc).fonts:
        if 'SC' in f['name'].getDebugName(1): return f
for src, dst in [('/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc', 'fonts/NotoSansSC-Black.otf'),
                 ('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 'fonts/NotoSansSC-Bold.otf'),
                 ('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc', 'fonts/NotoSerifSC-Bold.otf')]:
    f = sc(src); o = subset.Options(); o.layout_features = ['*']; o.name_IDs = ['*']; s = subset.Subsetter(o); s.populate(unicodes=[ord(ch) for ch in chars]); s.subset(f); f.save(dst)
print(len(chars))
