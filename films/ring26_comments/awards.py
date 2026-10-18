import json, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont
R = {r['id']: r for r in json.load(open('rows.json'))}
SERIF = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc', 96, index=2)
SANS = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 40, index=2)
SMALL = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 30, index=2)
GOLD, INK, NIGHT = (241, 197, 109), (243, 237, 226), (5, 6, 11)
AW = [
 ('摇人王', '一条评论 @ 了 22 个人，后面还有“展开”', 1568),
 ('人气王', '这次抓到的评论里点赞最多 · 91 赞', 2635),
 ('条件反射奖', '手机里根本没有微信，心还是一紧 · 86 赞', 2616),
 ('行动派奖', '真的退出去点开微信找人 · 79 赞', 2631),
 ('表情包奖', '一句话 + 一张图，73 人懂她', 2605),
 ('最扎心奖', '“从来没人给我发消息” · 48 赞', 2663),
 ('课堂社死奖', '普高偷玩手机时铃声响了 · 42 赞', 1846),
 ('吓尿奖', '字面意思 · 29 赞', 2771),
 ('凌晨四点奖', '北京时间凌晨 4:31 刷到的', 2738),
 ('跨国逃课奖', 'IP 越南，正在逃课', 668),
 ('唯一没被骗奖', '因为微信被封了', 2615),
 ('最长控诉奖', '21 秒语音 + 一整段小作文', 1817),
 ('最离谱跑题奖', '湘西赶尸，和电话毫无关系', 2220),
]
os.makedirs('awards', exist_ok=True)
for k, (title, why, cid) in enumerate(AW, 1):
    W, H = 1920, 1080
    bg = Image.new('RGB', (W, H), NIGHT); d = ImageDraw.Draw(bg)
    # soft gold glow behind the screenshot
    glow = Image.new('L', (W, H), 0); ImageDraw.Draw(glow).ellipse((820, 140, 1860, 940), fill=70); glow = glow.filter(ImageFilter.GaussianBlur(160))
    bg = Image.composite(Image.new('RGB', (W, H), (80, 60, 25)), bg, glow); d = ImageDraw.Draw(bg)
    lines, line = [], ''
    for ch in why:
        if d.textlength(line + ch, font=SANS) > 600 and ch not in '）)，。、”': lines.append(line); line = ''
        line += ch
    lines.append(line)
    blockH = 60 + 130 + 40 + 60 * len(lines); y = (H - blockH) // 2 - 20
    d.text((120, y), f'No.{k:02d}', font=SANS, fill=(200, 160, 90)); y += 60
    d.text((120, y), title, font=SERIF, fill=GOLD); y += 140
    d.rectangle((120, y, 470, y + 4), fill=GOLD); y += 36
    for l in lines: d.text((120, y), l, font=SANS, fill=INK); y += 60
    d.text((120, 990), '◆ Juno · VIBE知识大赏 · 《谁打来的？》评论区颁奖', font=SMALL, fill=(150, 140, 125))
    shot = Image.open('crops/' + R[cid]['crop']).convert('RGB')
    s = min(1080 / shot.width, 900 / shot.height); shot = shot.resize((int(shot.width * s), int(shot.height * s)), Image.LANCZOS)
    x, y0 = 1840 - shot.width, (H - shot.height) // 2
    mask = Image.new('L', shot.size, 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, shot.width - 1, shot.height - 1), 28, fill=255)
    sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).rounded_rectangle((x + 10, y0 + 24, x + shot.width + 10, y0 + shot.height + 24), 28, fill=160); sh = sh.filter(ImageFilter.GaussianBlur(24))
    bg = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), bg, sh)
    bg.paste(shot, (x, y0), mask)
    bg.save(f'awards/award_{k:02d}_{title}.png')
    shot.save(f'awards/shot_{k:02d}_{title}.png')
print('done')
