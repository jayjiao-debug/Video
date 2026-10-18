import glob,re
from fontTools.ttLib import TTCollection,TTFont
from fontTools import subset
txt=''.join(open(f,encoding='utf8').read() for f in ['lines.json','panels.js','main.js','film.html','data.json'])
chars=set(txt)|set('0123456789%.,:+-×≈—…？！，。：·（）()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ')
def sc(ttc):
  c=TTCollection(ttc)
  for f in c.fonts:
    if 'SC' in f['name'].getDebugName(1): return f
for src,dst in [('/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc','fonts/NotoSansSC-Black.otf'),('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc','fonts/NotoSansSC-Bold.otf'),('/usr/share/fonts/opentype/inter/InterDisplay-Black.otf','fonts/InterDisplay-Black.otf')]:
  f=sc(src) if src.endswith('ttc') else TTFont(src)
  o=subset.Options();o.layout_features=['*'];o.name_IDs=['*'];s=subset.Subsetter(o);s.populate(unicodes=[ord(ch) for ch in chars]);s.subset(f);f.save(dst)
print(len(chars))
