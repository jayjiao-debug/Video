import sys
e=open('engine.html').read()
for name in sys.argv[1:]:
    js=open(name+'.js').read()
    h=e.replace('</body>',f'<script>\n{js}\ndocument.fonts.load(\'900 60px "Noto Sans CJK SC"\').then(()=>document.fonts.ready).then(()=>{{window.renderAt(0);window.READY=true}});\n</script>\n</body>')
    open(name+'.html','w').write(h)
