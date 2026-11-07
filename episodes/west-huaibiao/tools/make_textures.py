"""Our own textures for the body shots (no Synty files): card faces, an invented magazine page (no real masthead),
invented dime-novel covers, a ledger page of scribbles, an exhibit tag. usage: python3 make_textures.py <out dir>"""
import sys, os, random, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); R = random.Random(1865)
def font(names, size):
    for n in names:
        try: return ImageFont.truetype(n, size)
        except Exception: pass
    return ImageFont.load_default()
SER = ["/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"]; SANS = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]; SYM = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
W, H = 250, 350
def card(rank, suit):
    im = Image.new("RGB", (W, H), (245, 240, 228)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([4, 4, W - 5, H - 5], 18, outline=(60, 55, 50), width=3)
    fr = font(SER, 46); fs = font(SYM, 40); col = (20, 20, 24)
    for _ in range(2):
        d.text((16, 10), rank, font=fr, fill=col); d.text((18, 58), suit, font=fs, fill=col); im = im.rotate(180); d = ImageDraw.Draw(im)
    if rank == "A":
        big = font(SYM, 150); bb = d.textbbox((0, 0), suit, font=big); d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], (H - (bb[3] - bb[1])) / 2 - bb[1]), suit, font=big, fill=col)
    else:
        pf = font(SYM, 48)
        for x, y in [(0.32, 0.2), (0.68, 0.2), (0.5, 0.35), (0.32, 0.5), (0.68, 0.5), (0.5, 0.65), (0.32, 0.8), (0.68, 0.8)]:
            bb = d.textbbox((0, 0), suit, font=pf); d.text((x * W - (bb[2] + bb[0]) / 2, y * H - (bb[3] + bb[1]) / 2), suit, font=pf, fill=col)
    return im
for r, s, n in [("A", "♠", "card_as"), ("A", "♣", "card_ac"), ("8", "♠", "card_8s"), ("8", "♣", "card_8c")]: card(r, s).save(f"{OUT}/{n}.png")
b = Image.new("RGB", (W, H), (120, 24, 28)); d = ImageDraw.Draw(b); d.rounded_rectangle([4, 4, W - 5, H - 5], 18, outline=(240, 230, 210), width=4)
for i in range(-H, W + H, 18): d.line([(i, 0), (i + H, H)], fill=(150, 40, 44), width=3); d.line([(i, H), (i + H, 0)], fill=(150, 40, 44), width=3)
d.rounded_rectangle([18, 18, W - 19, H - 19], 12, outline=(240, 230, 210), width=2); b.save(f"{OUT}/card_back.png")
PW, PH = 768, 1024
pg = Image.new("RGB", (PW, PH), (232, 222, 198)); d = ImageDraw.Draw(pg)
for _ in range(9000):
    x, y = R.randrange(PW), R.randrange(PH); c = R.randint(205, 235); d.point((x, y), fill=(c, c - 8, c - 28))
d.text((PW / 2, 52), "THE NEW MONTHLY", font=font(SER, 58), fill=(30, 24, 20), anchor="mm")
d.line([(40, 92), (PW - 40, 92)], fill=(40, 32, 26), width=3); d.line([(40, 100), (PW - 40, 100)], fill=(40, 32, 26), width=1)
d.text((PW / 2, 128), "A TALE OF THE FRONTIER", font=font(SER, 24), fill=(40, 32, 26), anchor="mm")
ill = Image.new("L", (420, 520), 255); di = ImageDraw.Draw(ill)
for y in range(0, 520, 6): di.line([(0, y), (420, y)], fill=200, width=1)
body = [(200, 90), (230, 95), (240, 140), (275, 150), (300, 230), (285, 232), (262, 175), (258, 300), (270, 470), (240, 470), (215, 330), (195, 470), (165, 470), (178, 300), (170, 180), (130, 215), (70, 215), (70, 200), (125, 190), (160, 150), (185, 140)]
di.polygon(body, fill=20); di.ellipse([178, 40, 238, 100], fill=20); di.polygon([(150, 62), (270, 62), (240, 48), (180, 48)], fill=20); di.rectangle([20, 200, 90, 214], fill=20)
for y in range(470, 520, 4): di.line([(0, y), (420, y)], fill=60, width=2)
pg.paste(Image.merge("RGB", [ill.point(lambda v: 30 + v * 0.78)] * 3), (174, 170)); d.rectangle([174, 170, 594, 690], outline=(30, 24, 20), width=3)
for col in range(2):
    for k in range(17):
        y = 720 + k * 16; ln = R.randint(200, 300) if k % 6 != 5 else R.randint(90, 170); d.line([(60 + col * 340, y), (60 + col * 340 + ln, y)], fill=(90, 80, 70), width=5)
pg.filter(ImageFilter.GaussianBlur(0.6)).save(f"{OUT}/page.png")
titles = [("THE SIX-GUN KING", (196, 40, 30)), ("WILD RIDER OF THE PLAINS", (230, 170, 30)), ("TERROR OF THE BORDER", (40, 70, 140)), ("THE LONE MARSHAL", (200, 90, 30)), ("THUNDER GULCH", (120, 30, 90)), ("DEAD-EYE DAN", (30, 110, 70))]
for i, (tt, c) in enumerate(titles):
    cv = Image.new("RGB", (512, 768), c); d = ImageDraw.Draw(cv); d.rectangle([14, 14, 498, 754], outline=(250, 240, 215), width=6)
    d.text((256, 60), "FRONTIER LIBRARY · No. %d" % (100 + i * 7), font=font(SANS, 24), fill=(250, 240, 215), anchor="mm")
    lines = []; cur = ""
    for w in tt.split():
        if len(cur + " " + w) > 12 and cur: lines.append(cur); cur = w
        else: cur = (cur + " " + w).strip()
    lines.append(cur)
    for k, l in enumerate(lines): d.text((256, 140 + k * 70), l, font=font(SER, 62), fill=(255, 248, 225), anchor="mm")
    sil = Image.new("L", (400, 380), 0); ds = ImageDraw.Draw(sil)
    if i % 2 == 0:
        ds.polygon([(60, 330), (120, 200), (250, 190), (320, 120), (345, 140), (300, 210), (330, 330), (300, 330), (270, 250), (160, 250), (120, 330)], fill=255)
        ds.polygon([(200, 190), (215, 110), (240, 105), (250, 190)], fill=255); ds.ellipse([212, 70, 245, 105], fill=255); ds.polygon([(195, 85), (262, 85), (250, 70), (205, 70)], fill=255)
    else:
        ds.polygon([(180, 90), (220, 90), (232, 140), (262, 150), (300, 230), (285, 232), (262, 175), (258, 300), (270, 370), (240, 370), (215, 320), (195, 370), (165, 370), (178, 300), (170, 180), (130, 215), (60, 215), (60, 200), (125, 190), (160, 150)], fill=255)
        ds.ellipse([172, 40, 228, 96], fill=255); ds.polygon([(145, 62), (260, 62), (232, 46), (172, 46)], fill=255)
    cv.paste((20, 15, 12), (56, 340), sil); d.text((256, 724), "TEN CENTS", font=font(SANS, 30), fill=(250, 240, 215), anchor="mm"); cv.save(f"{OUT}/cover{i}.png")
lg = Image.new("RGB", (700, 960), (226, 214, 186)); d = ImageDraw.Draw(lg)
for y in range(90, 940, 34): d.line([(30, y), (670, y)], fill=(170, 160, 190), width=1)
d.line([(110, 40), (110, 940)], fill=(190, 120, 110), width=2); d.line([(560, 40), (560, 940)], fill=(190, 120, 110), width=1)
for y in range(96, 930, 34):
    x = 124
    while x < 540:
        w = R.randint(14, 60); pts = [(x + j, y + 12 + math.sin(j * 0.6 + R.random()) * 5) for j in range(0, w, 2)]
        if len(pts) > 1: d.line(pts, fill=(52, 40, 60), width=2)
        x += w + R.randint(8, 18)
    d.text((575, y + 2), "%d.%02d" % (R.randint(1, 90), R.randint(0, 99)), font=font(SER, 20), fill=(52, 40, 60))
lg.filter(ImageFilter.GaussianBlur(0.5)).save(f"{OUT}/ledger.png")
tag = Image.new("RGB", (160, 90), (236, 226, 200)); d = ImageDraw.Draw(tag); d.rectangle([2, 2, 157, 87], outline=(80, 60, 40), width=2)
d.text((80, 30), "EXHIBIT", font=font(SER, 24), fill=(50, 36, 26), anchor="mm"); d.text((80, 62), "No. 1", font=font(SER, 26), fill=(50, 36, 26), anchor="mm"); tag.save(f"{OUT}/tag.png")
print("ok")
