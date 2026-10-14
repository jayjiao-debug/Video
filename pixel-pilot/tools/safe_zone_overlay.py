import sys
from PIL import Image, ImageDraw, ImageFont
F = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
# Douyin overlay zones on a 1080x1920 frame, measured from the owner's upload-preview screenshot
ZONES = [
    ((0, 0, 1080, 220), "顶部标签栏"),
    ((910, 640, 1080, 1890), "右侧按钮"),
    ((0, 1400, 910, 1920), "文案/音乐"),
]
def mark(src, dst):
    im = Image.open(src).convert("RGBA")
    ov = Image.new("RGBA", im.size, (0,0,0,0))
    d = ImageDraw.Draw(ov)
    f = ImageFont.truetype(F, 44)
    for box, label in ZONES:
        d.rectangle(box, fill=(255,40,40,95), outline=(255,60,60,255), width=6)
        d.text((box[0]+16, box[1]+12), label, font=f, fill=(255,255,255,255), stroke_width=3, stroke_fill=(0,0,0))
    d.rectangle((40, 220, 900, 1400), outline=(60,255,120,255), width=6)
    d.text((56, 232), "安全区", font=f, fill=(60,255,120,255), stroke_width=3, stroke_fill=(0,0,0))
    Image.alpha_composite(im, ov).convert("RGB").save(dst)
srcs = sys.argv[1:]
for s in srcs: mark(s, "m_" + s)
# contact sheet
ims = [Image.open("m_" + s).resize((360, 640)) for s in srcs]
sheet = Image.new("RGB", (360*len(ims) + 10*(len(ims)-1), 640), (30,30,30))
for i, m in enumerate(ims): sheet.paste(m, (i*370, 0))
sheet.save("sheet.png")
