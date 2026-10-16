import sys, glob
from PIL import Image, ImageDraw, ImageFont
files = sorted(glob.glob(sys.argv[1] + '/t*.png')) if len(sys.argv) < 4 else sys.argv[3:]
out = sys.argv[2]; W, H, cols = 640, 360, 3
rows = (len(files) + cols - 1)//cols
sheet = Image.new('RGB', (W*cols, H*rows), 'black'); d = ImageDraw.Draw(sheet)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
for i, p in enumerate(files):
    im = Image.open(p).convert('RGB').resize((W, H)); x, y = (i % cols)*W, (i//cols)*H
    sheet.paste(im, (x, y)); d.text((x+8, y+6), p.split('/t')[-1][:-4], fill='yellow', font=f)
sheet.save(out)
