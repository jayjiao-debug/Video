"""Shared engine layer for the ep30 style frames: subtitle (boxless), corner mark, patterns."""

W, H = 1920, 1080
GOLD = '#F5C76A'

# 16-step patterns (0-based steps; beats on 0/4/8/12)
ROCK = {
    'sig': [0, 3, 6, 8, 11, 14],
    'ci': [0, 2, 4, 6, 8, 10, 12, 14],
    'da': [4, 12],
    'dong': [0, 8],
}
REGGAE = {
    'sig': [4, 12],                       # skank, not playing yet at line 20 (ghosted)
    'ci': [2, 4, 6, 8, 10, 12, 14],       # beat-1 hat left out
    'da': [8],                            # rim on 3
    'dong': [8],                          # kick on 3 only
}
ROWS = ['sig', 'ci', 'da', 'dong']        # top -> bottom
SYL = {'ci': '次', 'da': '打', 'dong': '动'}
NAME = {'ci': '踩镲', 'da': '军鼓', 'dong': '底鼓'}


def sub_html(text_html, ink_edge='0,0,0'):
    """Engine subtitle: white heavy 64 px, gold key words, soft dark edge, feathered shade, no box."""
    e = ink_edge
    return f'''
<div style="position:absolute;left:330px;right:330px;top:812px;height:160px;
  background:radial-gradient(ellipse 50% 50% at 50% 50%, rgba({e},.42), rgba({e},0) 100%);filter:blur(10px)"></div>
<div style="position:absolute;left:0;right:0;top:846px;text-align:center;
  font:900 64px/1.2 'Noto Sans CJK SC';color:#fff;letter-spacing:.02em;
  text-shadow:0 0 2px rgba({e},.95),0 0 5px rgba({e},.85),0 3px 12px rgba({e},.6),0 0 28px rgba({e},.4)">{text_html}</div>'''


def corner_html(color='rgba(244,240,232,.78)', shadow='0 1px 6px rgba(0,0,0,.55)'):
    return f'''<div style="position:absolute;right:58px;top:36px;font:500 24px 'Noto Sans CJK SC';
  letter-spacing:.32em;color:{color};text-shadow:{shadow}">Juno · VIBE知识大赏</div>'''


def page(body, bg='#000', extra_css=''):
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;padding:0;width:{W}px;height:{H}px;overflow:hidden;background:{bg}}}
.f{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;overflow:hidden}}
svg text{{font-family:'Noto Sans CJK SC'}}
.k{{color:{GOLD}}}
{extra_css}
</style></head><body><div class="f">{body}</div></body></html>'''
