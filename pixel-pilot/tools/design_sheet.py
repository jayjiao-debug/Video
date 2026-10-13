"""Character design sheets: every pose labelled, colour palette with hex codes and the
part each colour is for, and the sprite at the size it appears in the 1080p film.
Writes out/sheet_<name>.png.
"""
import pathlib
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPR = ROOT / "public" / "sprites"
BG, PANEL, INK, MUTED, GOLD = (30, 24, 40), (43, 34, 56), (244, 230, 196), (160, 146, 176), (232, 182, 72)
F = lambda s, b=True: ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if b else ''}.ttf", s)
POSE_LABEL = {"idle": "Idle", "sit": "Happy", "look": "Look", "shock": "Shock", "read": "Reading",
              "think": "Thinking", "deduce": "Deduction", "blink": "Blink", "magnify": "Investigate"}


def palette(prefix, poses):
    counts = {}
    for p in poses:
        im = Image.open(SPR / f"{prefix}_{p}.png").convert("RGBA")
        for c, (r, g, b, a) in im.getcolors(1 << 16) or []:
            if a:
                counts[(r, g, b)] = counts.get((r, g, b), 0) + c
    return [c for c, _ in sorted(counts.items(), key=lambda kv: -kv[1])]


def sheet(name, title, subtitle, rows, swatch_names, film_scale=4, out=None):
    """rows: list of (row title, prefix, poses, zoom)."""
    W = 1920
    blocks = []
    y = 150
    for rt, prefix, poses, zoom in rows:
        sample = Image.open(SPR / f"{prefix}_{poses[0]}.png")
        cell_w = max(sample.width * zoom, 170) + 20
        h = sample.height * zoom + 90
        blocks.append((rt, prefix, poses, zoom, cell_w, h, y))
        y += h + 40
    pal_y = y
    H = pal_y + 260
    W = max(W, 120 + max(len(b[2]) * b[4] for b in blocks))
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((60, 40), title, font=F(56), fill=INK)
    d.text((60, 108), subtitle, font=F(24, False), fill=MUTED)
    for rt, prefix, poses, zoom, cell_w, h, y0 in blocks:
        d.text((60, y0), rt, font=F(28), fill=GOLD)
        x = 60
        for p in poses:
            spr = Image.open(SPR / f"{prefix}_{p}.png").convert("RGBA")
            big = spr.resize((spr.width * zoom, spr.height * zoom), Image.NEAREST)
            d.rounded_rectangle((x, y0 + 44, x + cell_w - 16, y0 + 44 + big.height + 20), 12, fill=PANEL)
            im.paste(big, (x + (cell_w - 16 - big.width) // 2, y0 + 54), big)
            lbl = POSE_LABEL.get(p, p)
            tw = d.textlength(lbl, font=F(22))
            d.text((x + (cell_w - 16 - tw) / 2, y0 + 44 + big.height + 28), lbl, font=F(22), fill=INK)
            x += cell_w
    # palette
    d.text((60, pal_y), "Palette", font=F(28), fill=GOLD)
    cols = palette(rows[0][1], rows[0][2])
    if len(rows) > 1:
        for c in palette(rows[1][1], rows[1][2]):
            if c not in cols:
                cols.append(c)
    rows_n = (min(len(cols), 28) + 13) // 14
    if rows_n > 1:  # grow the canvas for a second swatch row
        im2 = Image.new("RGB", (W, H + 150 * (rows_n - 1)), BG)
        im2.paste(im, (0, 0))
        im, d = im2, ImageDraw.Draw(im2)
    x = 60
    for i, c in enumerate(cols[:28]):
        if i and i % 14 == 0:
            pal_y += 150
            x = 60
        hexc = "#%02X%02X%02X" % c
        d.rounded_rectangle((x, pal_y + 48, x + 110, pal_y + 128), 10, fill=c, outline=(0, 0, 0))
        d.text((x, pal_y + 138), hexc, font=F(18, False), fill=INK)
        part = swatch_names.get(hexc, "")
        if part:
            d.text((x, pal_y + 162), part, font=F(18, False), fill=MUTED)
        x += 126
    im.save(out or ROOT / "out" / f"sheet_{name}.png")
    print("saved", name, im.size)


def hexmap(pairs):
    return {"#%02X%02X%02X" % rgb: label for rgb, label in pairs}


if __name__ == "__main__":
    from obrien import COL as OC  # noqa: E402
    sheet(
        "obrien", "CONAN O'BRIEN · narrator", "Chibi caricature · 18-cell grid shown 2x · private tests only (real person's likeness)",
        [("Poses", "obrien", ["idle", "sit", "look", "shock", "read", "think", "deduce", "blink"], 4)],
        hexmap([(OC["O"], "pompadour"), (OC["o"], "hair shine"), (OC["S"], "skin"), (OC["s"], "nose"),
                (OC["b"], "brows"), (OC["N"], "suit"), (OC["T"], "tie"), (OC["K"], "outline"),
                (OC["w"], "shirt"), (OC["F"], "shoes"), (OC["M"], "mouth"), (OC["W"], "eye white")]),
        film_scale=1,
    )
    import importlib, conan_v2  # noqa: E401
    importlib.reload(conan_v2)
    CC = conan_v2.COL
    sheet(
        "conan", "CONAN · narrator + sticker head", "Full-body chibi and sticker head · 18 / 24-cell grids shown 2x · private tests only",
        [("Full body", "conan", ["idle", "sit", "look", "shock", "read", "think", "deduce", "blink"], 4),
         ("Sticker head", "conan_head", ["idle", "sit", "look", "shock", "read", "think", "deduce", "blink"], 4)],
        hexmap([(CC["H"], "hair"), (CC["S"], "skin"), (CC["U"], "blazer"), (CC["R"], "bow tie"), (CC["B"], "eyes"),
                (CC["K"], "outline"), (CC["Y"], "button"), (CC["C"], "head skin"), (CC["p"], "blush"),
                (CC["G"], "glasses"), (CC["w"], "shirt"), (CC["F"], "shoes"), (CC["h"], "hair shine")]),
        film_scale=1,
    )
