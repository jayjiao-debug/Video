"""Labelled character sheet: every 128x128 portrait and expression, plus the manga symbols."""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont
HERE = pathlib.Path(__file__).resolve().parent
ART = HERE / "art"
F = ImageFont.truetype("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc", 22)
ROWS = [("薇恩夫人", [("lady_smile", "微笑"), ("lady_shock", "惊吓"), ("lady_cry", "大哭"), ("lady_angry", "生气")]),
        ("莉莉（画家）", [("lily_angry", "生气"), ("lily_calm", "平静"), ("lily_shock", "惊吓"), ("lily_sad", "委屈"), ("lily_happy", "开心"), ("lily_after", "灯亮后")]),
        ("扎卡里（魔术师）", [("magician_smug", "得意"), ("magician_shock", "惊吓"), ("magician_laugh", "大笑"), ("magician_after", "灯亮后")]),
        ("格兰特上校", [("colonel_calm", "灯灭前"), ("colonel_after", "灯亮后"), ("colonel_caught", "被识破")]),
        ("管家", [("butler_calm", "平静"), ("butler_nervous", "紧张"), ("butler_sad", "难过"), ("butler_smile", "微笑")])]
S = 2
cw, ch = 128 * S + 20, 128 * S + 44
sheet = Image.new("RGB", (220 + 6 * cw, len(ROWS) * ch + 120), (34, 30, 42))
d = ImageDraw.Draw(sheet)
for r, (who, items) in enumerate(ROWS):
    y = r * ch + 10
    d.text((14, y + 110), who, font=F, fill=(244, 230, 196))
    for c, (n, lab) in enumerate(items):
        x = 220 + c * cw
        d.rectangle((x, y, x + 128 * S, y + 128 * S), fill=(52, 44, 64))
        im = Image.open(ART / f"{n}.png").convert("RGBA").resize((128 * S, 128 * S), Image.NEAREST)
        sheet.paste(im, (x, y), im)
        d.text((x + 4, y + 128 * S + 6), lab, font=F, fill=(232, 182, 72))
y = len(ROWS) * ch + 20
d.text((14, y + 30), "表情符号", font=F, fill=(244, 230, 196))
for i, n in enumerate(("note", "bang", "sweat", "anger", "spark", "ask")):
    e = Image.open(ART / f"emote_{n}.png").convert("RGBA")
    e = e.resize((e.width * 8, e.height * 8), Image.NEAREST)
    sheet.paste(e, (220 + i * 120, y), e)
sheet.save(ART / "character_sheet.png")
