import json, numpy as np, matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.patches import FancyBboxPatch, Rectangle, Polygon
import sys; sys.path.insert(0, 'build'); from face_model import height
B = fm.FontProperties(fname='/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc')
SB = fm.FontProperties(fname='/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc') if __import__('os').path.exists('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc') else B
P = np.array(json.load(open('build/face_pts.json'))['pts'])
def canvas(bg):
    fig = plt.figure(figsize=(19.2, 10.8), dpi=100); ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 1920); ax.set_ylim(1080, 0); ax.axis('off'); fig.patch.set_facecolor(bg); ax.set_facecolor(bg); return fig, ax
def sub(ax, txt, col='white', edge='#000'):
    import matplotlib.patheffects as pe
    ax.text(960, 905, txt, ha='center', va='center', fontproperties=B, fontsize=46, color=col, path_effects=[pe.withStroke(linewidth=8, foreground=edge, alpha=0.55)])
def dots(ax, cx, cy, s, th, cmap, flat=False, size=7):
    x, y, z = P[:, 0], P[:, 1], (P[:, 2] * 0 + 0.5 if flat else P[:, 2])
    X = x * np.cos(th) + (z - 0.5) * 0.9 * np.sin(th); Z = -x * np.sin(th) + (z - 0.5) * 0.9 * np.cos(th)
    o = np.argsort(Z); ax.scatter(cx + X[o] * s, cy - y[o] * s, s=size, c=cmap(np.clip(z[o] * 0.85 + 0.1, 0, 1)), linewidths=0)
def phone(ax, x, y, w, h, col, fill, lw=4):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0,rounding_size=46', ec=col, fc=fill, lw=lw))
    ax.add_patch(FancyBboxPatch((x + w / 2 - 50, y + 18), 100, 22, boxstyle='round,pad=0,rounding_size=11', ec='none', fc=col))
# ---------------------------------------------------------------- look A · 红外点阵
from matplotlib.colors import LinearSegmentedColormap
IR = LinearSegmentedColormap.from_list('ir', ['#2a0716', '#7a1236', '#e0245e', '#ff8fb1', '#fff1f5'])
fig, ax = canvas('#050307')
phone(ax, 330, 170, 360, 620, '#ff4f86', '#0b060a')
ax.text(510, 430, '🔒', ha='center', fontsize=1, color='w')
ax.add_patch(FancyBboxPatch((470, 400), 80, 64, boxstyle='round,pad=0,rounding_size=10', ec='#ff4f86', fc='none', lw=4)); ax.add_patch(matplotlib.patches.Arc((510, 400), 56, 70, theta1=0, theta2=180, ec='#ff4f86', lw=4))
ax.add_patch(Polygon([[760, 250], [1180, 215], [1215, 735], [795, 770]], closed=True, fc='#efe6e9', ec='none'))
from matplotlib.colors import LightSource
xs_=np.linspace(-0.95,0.95,300); ys_=np.linspace(-1.3,1.3,410); X_,Y_=np.meshgrid(xs_,ys_); Z_=height(X_,Y_)
SH=LightSource(azdeg=300,altdeg=35).hillshade(np.nan_to_num(Z_,nan=0)*3,vert_exag=4)
img=np.dstack([SH*0.75+0.15]*3+[(~np.isnan(Z_)).astype(float)])
ax.imshow(img[::-1], extent=[990-0.95*175, 990+0.95*175, 485+1.3*175, 485-1.3*175], zorder=3)
ax.text(1000, 800, '打印出来的照片', ha='center', fontproperties=B, fontsize=26, color='#c98aa0')
ax.text(1560, 380, '133', ha='center', fontproperties=B, fontsize=150, color='#ff4f86'); ax.text(1560, 470, '/ 208 部手机', ha='center', fontproperties=B, fontsize=40, color='#f3d7e0')
ax.text(1560, 540, '被照片解锁', ha='center', fontproperties=B, fontsize=40, color='#f3d7e0')
for yy in range(120, 860, 24): ax.plot([0, 1920], [yy, yy], color='#ff4f86', alpha=0.03, lw=1)
sub(ax, '133部，被一张打印照片骗开了'); fig.savefig('style/A1_hook.png', facecolor=fig.get_facecolor()); plt.close(fig)
fig, ax = canvas('#050307')
dots(ax, 720, 470, 300, 0.42, IR, size=10)
for k in range(9): ax.plot([720 + 330 * 1.6, 720 + 330 * 1.6 - 900], [470 - 330 * 1.25 + k * 100, 470 - 330 * 1.25 + k * 90], color='#ff4f86', alpha=0.06, lw=1)
ax.plot([1500, 1500], [190, 760], color='#efe6e9', lw=5); ax.text(1500, 800, '照片：侧过来，厚度 0', ha='center', fontproperties=B, fontsize=30, color='#f3d7e0')
ax.text(160, 150, '30,000+', fontproperties=B, fontsize=86, color='#ff4f86'); ax.text(165, 215, '个红外点 · 深度图', fontproperties=B, fontsize=34, color='#f3d7e0')
cb = np.linspace(0, 1, 200)
for i, v in enumerate(cb): ax.plot([1720, 1760], [760 - i * 2.6, 760 - i * 2.6], color=IR(v * 0.85 + 0.1), lw=3)
ax.text(1785, 250, '近', fontproperties=B, fontsize=28, color='#fff1f5'); ax.text(1785, 770, '远', fontproperties=B, fontsize=28, color='#a33')
sub(ax, '照片是平的：所有点一样远'); fig.savefig('style/A2_key.png', facecolor=fig.get_facecolor()); plt.close(fig)
# ---------------------------------------------------------------- look B · 等高线地图
INK, ORG, PAPER = '#1d2433', '#e8572a', '#f1ece1'
def contours(ax, cx, cy, s, n=16, lw=2.2, col=INK):
    xs = np.linspace(-0.9, 0.9, 300); ys = np.linspace(-1.3, 1.3, 420); X, Y = np.meshgrid(xs, ys); Z = height(X, Y)
    ax.contour(cx + X * s, cy - Y * s, Z, levels=n, colors=col, linewidths=lw)
fig, ax = canvas(PAPER)
phone(ax, 330, 170, 360, 620, INK, '#e9e3d6', lw=5)
ax.add_patch(FancyBboxPatch((470, 400), 80, 64, boxstyle='round,pad=0,rounding_size=10', ec=INK, fc='none', lw=5)); ax.add_patch(matplotlib.patches.Arc((510, 400), 56, 70, theta1=0, theta2=180, ec=INK, lw=5))
ax.add_patch(Polygon([[760, 250], [1180, 215], [1215, 735], [795, 770]], closed=True, fc='#fbf8f2', ec=INK, lw=3))
xs = np.linspace(-0.9, 0.9, 200); ys = np.linspace(-1.3, 1.3, 280); X, Y = np.meshgrid(xs, ys); Z = height(X, Y)
from matplotlib.colors import LightSource
SH=LightSource(azdeg=300,altdeg=35).hillshade(np.nan_to_num(Z,nan=0)*3,vert_exag=4)
img=np.dstack([0.12+SH*0.0+0.0+ (SH*0.6+0.25)*0+0.0+ (SH*0.55+0.3)]*3+[(~np.isnan(Z)).astype(float)])
ax.imshow(img[::-1], extent=[990-0.9*175, 990+0.9*175, 485+1.3*175, 485-1.3*175], zorder=3)
ax.text(1000, 805, '打印的照片：看着像，摸着平', ha='center', fontproperties=B, fontsize=26, color=INK)
ax.text(1560, 380, '133', ha='center', fontproperties=SB, fontsize=160, color=ORG); ax.text(1560, 470, '/ 208 部手机', ha='center', fontproperties=B, fontsize=40, color=INK); ax.text(1560, 540, '被照片解锁', ha='center', fontproperties=B, fontsize=40, color=INK)
sub(ax, '133部，被一张打印照片骗开了', col='#fffaf0', edge='#1d2433'); fig.savefig('style/B1_hook.png', facecolor=fig.get_facecolor()); plt.close(fig)
fig, ax = canvas(PAPER)
contours(ax, 640, 470, 330, n=18)
ax.plot([1180, 1700], [700, 700], color=INK, lw=4); ax.text(1440, 760, '照片：海拔永远是 0', ha='center', fontproperties=B, fontsize=30, color=INK)
ax.text(1440, 640, '0 m', ha='center', fontproperties=SB, fontsize=40, color=ORG)
ax.annotate('鼻尖：最高', xy=(640, 470 + 0.18 * 330), xytext=(1000, 330), fontproperties=B, fontsize=30, color=ORG, arrowprops=dict(arrowstyle='-', color=ORG, lw=2))
ax.text(150, 150, '深度图', fontproperties=SB, fontsize=86, color=INK); ax.text(155, 215, '你的脸，是一座山', fontproperties=B, fontsize=34, color=ORG)
sub(ax, '照片是平的：所有点一样远', col='#fffaf0', edge='#1d2433'); fig.savefig('style/B2_key.png', facecolor=fig.get_facecolor()); plt.close(fig)
print('ok')
