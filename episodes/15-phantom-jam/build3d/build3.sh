python3 - <<'PY'
h=open('film2.html').read();s=open('film3_main.js').read()
a=h.index('/* ===== 幽灵堵车 v2');b=h.index("await document.fonts.load('900 60px")
css=open('tb.css').read()
open('film3.html','w').write(h[:a].replace('</style>',css+'</style>',1).replace('<div id="sub"></div>','<div id="tb"></div><div id="flash"></div><div id="sub"></div>',1)+s+'\n'+h[b:])
PY
python3 - <<'PY'
h=open('film3.html').read()
h=h.replace('<div id="plaque"><div class="p">','<div id="plaque"><div class="p"><i style="left:30px;top:30px"></i><i style="right:30px;top:30px"></i><i style="left:30px;bottom:30px"></i><i style="right:30px;bottom:30px"></i>',1)
open('film3.html','w').write(h)
PY
