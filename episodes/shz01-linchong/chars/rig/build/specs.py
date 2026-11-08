# Part layout for each traced reference, in the reference's own pixel coordinates (864 x 1536).
# poly: the part's full extent (visible + hidden areas, joint caps included); outside the
#   figure the polygon may be loose, the background is cut away by the silhouette.
# keep: within an optional sub-polygon, keep only pixels of a colour class (dark, red, skin,
#   brown, notskin, ...), so a loose polygon does not steal pixels of the parts behind it.
# pivot: joint the part rotates about; parent: the part it hangs from; z: draw order.
# Where a higher part covers a lower one at rest, the lower part's hidden area is repainted
# from its own visible colours (nearest fill), so moving a limb never opens a hole.
# paint: shapes filled with a flat colour (hidden sleeve sections that the reference never shows).
# hidden_edges: silhouette lines that are covered at rest and must be drawn on the lower part.
# erase: areas painted out before tracing (traced face features, which are redrawn in code;
#   the jade ring on the topknot; the reference hat and its cord, redrawn in code).
import math


def arc(c, r, a0, a1, n=8):
    """Points on a circle (degrees, SVG orientation: 0 = +x, 90 = +y/down)."""
    return [(c[0] + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             c[1] + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def tube(a, b, ra, rb, n=6):
    """Closed outline of a tapered limb from a (radius ra) to b (radius rb), round ends."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    ang = math.degrees(math.atan2(dy, dx))
    return arc(b, rb, ang - 90, ang + 90, n) + arc(a, ra, ang + 90, ang + 270, n)


SKIN = '#efb58e'

A_FRONT = dict(
    src='ref_linchong_A_front.png', skin='#f1b58c',
    chin=(428, 331), sole=1468, origin_x=428, merge=9, min_region=300,
    holes=[[(372, 280), (394, 280), (394, 346), (372, 346)], [(460, 280), (484, 280), (484, 346), (460, 346)]],  # background between the scarf tails and the neck
    ink_recolour=[dict(poly=[(358, 234), (390, 234), (390, 304), (358, 304)], colour='#a36c49', maxw=0.9), dict(poly=[(464, 234), (498, 234), (498, 304), (464, 304)], colour='#a36c49', maxw=0.9)],
    parts=dict(
        legR=dict(z=1, poly=[(300, 1180), (372, 1180), (370, 1440), (330, 1462), (300, 1470), (268, 1478), (238, 1470), (236, 1448), (262, 1420), (300, 1400)], pivot=(338, 1200)),
        legL=dict(z=1, poly=[(484, 1180), (552, 1180), (556, 1400), (592, 1420), (612, 1448), (606, 1474), (570, 1478), (530, 1470), (494, 1460), (484, 1440)], pivot=(516, 1200)),
        neck=dict(z=5, poly=[(388, 286), (466, 286), (468, 340), (476, 372), (380, 372), (388, 340)], pivot=(428, 372)),
        torso=dict(z=10, poly=[(352, 292), (504, 292), (514, 360), (540, 382), (592, 402), (562, 470), (548, 560), (540, 700), (560, 960), (600, 1290), (598, 1306), (258, 1306), (256, 1290), (296, 960), (318, 700), (312, 560), (298, 470), (266, 402), (320, 382), (342, 360)],
                   keep=[dict(poly=[(340, 286), (516, 286), (516, 351), (340, 351)], pred='notskin')],
                   hidden_edges=[[(292, 452), (298, 470), (312, 560), (318, 700)], [(566, 452), (562, 470), (548, 560), (540, 700)]]),
        sash=dict(z=12, parent='torso', poly=[(314, 660), (546, 660), (556, 700), (560, 760), (556, 996), (472, 996), (470, 732), (314, 732)], keep=[dict(pred='red')]),
        head=dict(z=15, parent='neck', pivot=(428, 332), poly=[(318, 95), (540, 95), (540, 250), (520, 290), (520, 384), (466, 384), (466, 296), (452, 316), (438, 330), (428, 336), (418, 330), (404, 316), (390, 296), (390, 384), (336, 384), (336, 290), (318, 250)],
                  keep=[dict(poly=[(330, 292), (392, 292), (392, 390), (330, 390)], pred='dark'), dict(poly=[(464, 292), (530, 292), (530, 390), (464, 390)], pred='dark')]),
        armR_up=dict(z=20, parent='torso', pivot=(290, 420), poly=arc((290, 420), 46, 0, -150) + [(240, 430), (200, 560), (176, 628), (322, 664), (322, 560), (318, 470), (336, 432)]),
        handR=dict(z=20.5, parent='armR_lo', pivot=(190, 806), keep=[dict(pred='skin')], poly=[(140, 760), (176, 770), (210, 790), (222, 862), (226, 904), (176, 904), (160, 930), (122, 930), (124, 880), (134, 830)]),
        armR_lo=dict(z=21, parent='armR_up', pivot=(240, 640), keep=[dict(poly=[(120, 760), (230, 760), (230, 940), (120, 940)], pred='notskin')],
                     poly=[(176, 628)] + arc((240, 640), 72, 190, 345, 10) + [(322, 664), (304, 800), (300, 832), (282, 900), (264, 938), (236, 916), (214, 866), (200, 816), (176, 800), (150, 792), (128, 764)]),
        armL_up=dict(z=20, parent='torso', pivot=(566, 420), poly=arc((566, 420), 46, 180, 330) + [(616, 430), (656, 560), (680, 628), (538, 664), (540, 560), (544, 470), (522, 432)]),
        handL=dict(z=20.5, parent='armL_lo', pivot=(670, 806), keep=[dict(pred='skin')], poly=[(722, 760), (686, 770), (652, 790), (640, 862), (636, 904), (686, 904), (702, 932), (740, 932), (738, 880), (728, 830)]),
        armL_lo=dict(z=21, parent='armL_up', pivot=(618, 640), keep=[dict(poly=[(630, 760), (740, 760), (740, 940), (630, 940)], pred='notskin')],
                     poly=[(680, 628)] + arc((618, 640), 72, 350, 195, 10) + [(538, 664), (552, 800), (560, 840), (580, 910), (600, 948), (630, 920), (648, 866), (660, 816), (684, 800), (710, 792), (732, 764)]),
    ),
    erase=[
        dict(poly=[(374, 224), (482, 224), (479, 263), (469, 270), (466, 300), (458, 322), (444, 334), (428, 337), (412, 334), (398, 322), (390, 300), (386, 270), (376, 263)], mode='skin'),
        dict(poly=[(408, 330), (448, 330), (447, 352), (409, 352)], mode='#c98e6a'),  # goatee over the neck -> neck shade
        dict(poly=[(409, 350), (447, 350), (446, 384), (410, 384)], mode='near'),  # goatee over the collar
        dict(poly=[(410, 146), (444, 146), (444, 166), (410, 166)], mode='near', within=[(380, 120), (480, 120), (480, 200), (380, 200)]),  # ring on the topknot
        dict(poly=[(392, 129), (462, 129), (470, 172), (489, 194), (489, 223), (367, 223), (367, 194), (386, 172)], mode='#343536', pred='dark', ink_all=True),  # flat head cloth
        dict(poly=[(361, 231), (387, 231), (387, 302), (361, 302)], mode='near', pred='dark', within=[(352, 226), (396, 226), (396, 306), (352, 306)]),  # hard side lock (left)
        dict(poly=[(467, 231), (495, 231), (495, 302), (467, 302)], mode='near', pred='dark', within=[(458, 226), (504, 226), (504, 306), (458, 306)]),  # hard side lock (right)
    ],
    face=dict(eyeR=(397, 253.5), eyeL=(456, 253.5), browR=[(418, 244), (377, 231)], browL=[(436, 244), (477, 230)],
              nose=(425, 291), mouth=(426, 306), chin=(428, 336), jaw=[(379, 280), (386, 300), (400, 321), (428, 337), (456, 321), (470, 300), (476, 280)],
              fw=105, rings=[(369, 266), (487, 266)]),
)

# ---------------------------------------------------------------- A side (faces left)
A_SIDE = dict(
    src='ref_linchong_A_side.png', skin='#edaf86',
    chin=(362, 304), sole=1470, origin_x=430,
    parts=dict(
        legFar=dict(z=1, pivot=(428, 842), poly=[(286, 1250), (452, 1250), (452, 1418), (436, 1434), (398, 1434), (378, 1448), (378, 1466), (286, 1466)],
                    paint=[dict(poly=tube((424, 860), (424, 1300), 34, 32), colour='#1e1d1a')]),
        legNear=dict(z=1.5, pivot=(436, 842), poly=[(452, 1250), (546, 1250), (546, 1490), (370, 1490), (378, 1448), (398, 1434), (436, 1434), (452, 1418)],
                     paint=[dict(poly=tube((470, 860), (488, 1300), 36, 36), colour='#1e1d1a')]),
        neck=dict(z=5, poly=[(388, 262), (472, 256), (492, 336), (398, 340)], pivot=(440, 330)),
        torso=dict(z=10, poly=[(380, 296), (470, 278), (512, 280), (536, 330), (556, 500), (566, 700), (576, 905), (590, 1300), (300, 1300), (306, 1000), (316, 780), (318, 640), (318, 560), (322, 470), (334, 400), (356, 340)],
                   hidden_edges=[[(537, 346), (556, 500), (566, 700), (575, 900)]], keep=[dict(poly=[(280, 790), (330, 790), (330, 905), (280, 905)], pred='notskin'), dict(poly=[(370, 270), (520, 270), (520, 334), (370, 334)], pred='notskin')]),
        sash=dict(z=12, parent='torso', poly=[(318, 656), (482, 656), (482, 730), (318, 730)], keep=[dict(pred='red')], fill_any=True,
                  extend=[(466, 664), (566, 668), (568, 706), (466, 704)]),
        head=dict(z=15, parent='neck', pivot=(440, 300),
                  poly=[(320, 56), (530, 56), (532, 212), (572, 384), (526, 390), (500, 302), (470, 284), (446, 272), (452, 356), (410, 356), (414, 300), (398, 303), (378, 302), (373, 288), (352, 283.5), (326, 281), (320, 200)],
                  keep=[dict(poly=[(404, 290), (456, 290), (456, 360), (404, 360)], pred='dark'), dict(poly=[(494, 214), (580, 214), (580, 392), (494, 392)], pred='dark')]),
        jaw=dict(z=15.2, parent='head', pivot=(440, 256), keep=[dict(pred='skin')],
                 poly=[(326, 282), (352, 283), (372, 287), (400, 286), (426, 279), (431, 287), (404, 300), (378, 305), (362, 306), (348, 314), (328, 306)]),
        armL_up=dict(z=20, parent='torso', pivot=(470, 410), poly=arc((470, 410), 50, 160, 380) + [(546, 380), (580, 520), (610, 640), (464, 646), (458, 520), (440, 430)]),
        armL_lo=dict(z=21, parent='armL_up', pivot=(468, 636),
                     keep=[dict(poly=[(430, 830), (520, 830), (520, 920), (430, 920)], pred='notskin'), dict(poly=[(400, 640), (482, 640), (482, 1000), (400, 1000)], pred='notred')],
                     poly=[(464, 646)] + arc((468, 636), 58, 180, 360, 8) + [(612, 640), (616, 760), (614, 890), (586, 916), (548, 920), (520, 904), (500, 846), (466, 838), (452, 846), (446, 800), (450, 700)]),
        tails=dict(z=22, parent='torso', poly=[(414, 700), (480, 700), (480, 1100), (408, 1100)], keep=[dict(pred='red')], extend=[(432, 846), (474, 846), (474, 908), (432, 908)]),
        handL=dict(z=23, parent='armL_lo', pivot=(472, 840), keep=[dict(pred='skin')], poly=[(430, 830), (520, 830), (522, 920), (430, 920)]),
    ),
    far=dict(shoulder=(452, 412), rest=dict(shoulder=20, elbow=0)),
    holes=[[(476, 274), (508, 274), (508, 336), (476, 336)]],  # background between the nape and the scarf tails
    erase=[
        dict(poly=[(358, 199), (404, 197), (404, 233), (366, 233), (358, 224)], mode='skin'),  # brow + eye
        dict(poly=[(338, 196), (359, 196), (359, 230), (338, 230)], mode='bg', pred='dark', ink_all=True),  # brow tip past the forehead
        dict(poly=[(358, 190), (408, 190), (408, 201), (358, 201)], mode='skin', pred='dark', ink_all=True),  # brow top remains
        dict(poly=[(424, 212), (438, 212), (438, 262), (447, 268), (437, 300), (427, 350), (403, 350), (410, 300), (424, 262)], mode='near', pred='dark', ink_all=True,
             within=[(380, 200), (480, 200), (480, 360), (380, 360)]),  # long hair lock + hard sideburn
        dict(poly=[(356, 263), (386, 266), (388, 296), (372, 298), (356, 292)], mode='skin'),  # moustache, mouth line
        dict(poly=[(340, 262), (357, 263), (357, 294), (340, 294)], mode='near', within=[(330, 240), (360, 240), (360, 300), (330, 300)], pred='dark'),  # moustache tip over the lip
        dict(poly=[(366, 284), (412, 282), (412, 304), (366, 310)], mode='skin', pred='notskin_soft'),  # jaw stubble
        dict(poly=[(348, 306), (394, 302), (394, 362), (348, 362)], mode='bg'),  # goatee below the chin
        dict(poly=[(412, 104), (446, 104), (446, 130), (412, 130)], mode='near', within=[(380, 90), (520, 90), (520, 200), (380, 200)]),  # ring on the topknot
    ],
    face=dict(brow=[(357, 212), (401, 204)], eye=(368, 222), eyeBack=(393, 216), nose=(340, 262), nostril=(353, 266),
              mouth=(352, 282), corner=(372, 286), chin=(362, 305), jaw=[(438, 262), (428, 288), (404, 300), (378, 305), (362, 305)],
              ear=(451, 243), fw=105, rings=[(512, 226), (520, 240)]),
)

# ---------------------------------------------------------------- C front
NAVY = '#2c2c3c'
C_FRONT = dict(
    src='ref_linchong_C_front.png', skin='#f4b98f',
    chin=(428, 338), sole=1468, origin_x=428,
    parts=dict(
        legR=dict(z=1, poly=[(262, 1130), (424, 1130), (420, 1440), (370, 1470), (300, 1476), (236, 1470), (236, 1440), (262, 1410)], pivot=(330, 1150)),
        legL=dict(z=1, poly=[(434, 1130), (596, 1130), (600, 1410), (620, 1440), (616, 1474), (556, 1476), (490, 1470), (440, 1440)], pivot=(526, 1150)),
        neck=dict(z=5, poly=[(388, 290), (468, 290), (470, 350), (480, 380), (378, 380), (386, 350)], pivot=(428, 375)),
        torso=dict(z=10, poly=[(372, 330), (488, 330), (560, 400), (576, 700), (580, 1150), (280, 1150), (284, 700), (300, 400)]),
        sash=dict(z=12, parent='torso', poly=[(352, 618), (488, 618), (488, 726), (484, 1060), (448, 1060), (446, 726), (352, 726)]),
        cloak=dict(z=14, parent='torso', poly=[(236, 360), (624, 360), (724, 690), (724, 960), (620, 1206), (236, 1206), (136, 960), (136, 690)], keep=[dict(pred='brown')]),
        head=dict(z=15, parent='neck', pivot=(428, 338),
                  poly=[(330, 150), (530, 150), (530, 300), (466, 300), (452, 322), (438, 336), (428, 340), (418, 336), (404, 322), (390, 300), (330, 300)]),
        armR_up=dict(z=20, parent='torso', pivot=(300, 420), poly=tube((300, 420), (240, 640), 30, 28), keep=[dict(pred='none')]),
        armR_lo=dict(z=21, parent='armR_up', pivot=(240, 640), poly=tube((240, 640), (200, 800), 34, 30) + [(176, 820), (160, 800), (170, 720), (240, 730)],
                     paint=[dict(poly=tube((240, 640), (204, 760), 30, 28), colour=NAVY)], keep=[dict(pred='notbrown'), dict(poly=[(120, 790), (240, 790), (240, 940), (120, 940)], pred='notskin')]),
        handR=dict(z=22, parent='armR_lo', pivot=(196, 806), keep=[dict(pred='skin')], poly=[(130, 790), (230, 790), (232, 930), (130, 930)]),
        armL_up=dict(z=20, parent='torso', pivot=(556, 420), poly=tube((556, 420), (616, 640), 30, 28), keep=[dict(pred='none')]),
        armL_lo=dict(z=21, parent='armL_up', pivot=(616, 640), poly=tube((616, 640), (658, 800), 34, 30) + [(686, 820), (700, 800), (690, 720), (616, 730)],
                     paint=[dict(poly=tube((616, 640), (654, 760), 30, 28), colour=NAVY)], keep=[dict(pred='notbrown'), dict(poly=[(620, 790), (740, 790), (740, 940), (620, 940)], pred='notskin')]),
        handL=dict(z=22, parent='armL_lo', pivot=(662, 806), keep=[dict(pred='skin')], poly=[(626, 790), (730, 790), (732, 930), (626, 930)]),
    ),
    # arms are drawn in front of the cloak, but hidden where the cloak's side drapes cover them
    arm_clip=dict(part='cloak', polys=[[(140, 330), (372, 330), (346, 420), (300, 700), (250, 760), (236, 960), (140, 960)], [(716, 330), (486, 330), (512, 420), (556, 700), (606, 760), (620, 960), (716, 960)]]),
    erase=[
        dict(poly=[(160, 40), (700, 40), (700, 214), (160, 214)], mode='bg'),  # reference hat (peaked) -> code hat
        dict(poly=[(150, 200), (360, 200), (360, 250), (150, 250)], mode='bg', pred='notskin'),  # brim edges left
        dict(poly=[(496, 200), (710, 200), (710, 250), (496, 250)], mode='bg', pred='notskin'),
        dict(poly=[(364, 206), (492, 206), (492, 228), (364, 228)], mode='#16171b'),  # hair under the brim
        dict(poly=[(370, 226), (486, 226), (482, 264), (470, 270), (466, 300), (458, 324), (444, 336), (428, 339), (412, 336), (398, 324), (390, 300), (386, 270), (372, 264)], mode='skin'),
        dict(poly=[(360, 226), (500, 226), (500, 350), (360, 350)], mode='near', pred='cord'),  # red hat cord over the face
        dict(poly=[(404, 330), (452, 330), (452, 470), (404, 470)], mode='near'),  # goatee + hanging cord ends
    ],
    face=dict(eyeR=(396, 253.5), eyeL=(456, 253.5), browR=[(418, 246), (375, 233)], browL=[(437, 245), (480, 232)],
              nose=(425, 291), mouth=(427, 307), chin=(428, 339), jaw=[(380, 282), (386, 300), (402, 322), (428, 340), (456, 322), (470, 300), (478, 282)],
              fw=104, hat=dict(cx=428, y=212, brim=282, crown=112, crownH=50), tattoo=(462, 276)),
)

# ---------------------------------------------------------------- C side (faces left)
C_SIDE = dict(
    src='ref_linchong_C_side.png', skin='#efb188',
    chin=(346, 313), sole=1474, origin_x=430,
    parts=dict(
        legFar=dict(z=4, pivot=(420, 850), poly=[(250, 1150), (446, 1150), (446, 1300), (440, 1420), (420, 1440), (380, 1452), (380, 1476), (250, 1476)],
                    keep=[dict(poly=[(250, 1150), (600, 1150), (600, 1250), (250, 1250)], pred='notbrown')], paint=[dict(poly=tube((410, 870), (400, 1250), 50, 46), colour='#2e2c3e')]),
        legNear=dict(z=4.5, pivot=(450, 850), poly=[(446, 1150), (600, 1150), (600, 1490), (372, 1490), (380, 1452), (420, 1440), (440, 1420), (446, 1300)],
                     keep=[dict(poly=[(250, 1150), (600, 1150), (600, 1250), (250, 1250)], pred='notbrown')], paint=[dict(poly=tube((470, 870), (500, 1250), 52, 50), colour='#2e2c3e')]),
        neck=dict(z=5, poly=[(368, 270), (480, 262), (500, 340), (380, 346)], pivot=(430, 330)),
        torso=dict(z=10, poly=[(300, 330), (480, 300), (700, 340), (700, 1250), (270, 1250), (280, 1000), (296, 830), (300, 640), (290, 520)],
                   keep=[dict(poly=[(250, 620), (305, 620), (305, 920), (250, 920)], pred='brown'), dict(poly=[(432, 560), (624, 560), (624, 870), (432, 870)], pred='brown')],
                   extend=[(432, 560), (624, 560), (624, 870), (432, 870)]),
        head=dict(z=15, parent='neck', pivot=(430, 310),
                  poly=[(290, 120), (520, 120), (520, 300), (480, 296), (450, 300), (418, 320), (380, 318), (364, 305), (359, 291), (337, 285.5), (300, 284)],
                  keep=[dict(poly=[(440, 280), (520, 280), (520, 320), (440, 320)], pred='dark')]),
        jaw=dict(z=15.2, parent='head', pivot=(402, 258), keep=[dict(pred='skin')],
                 poly=[(312, 285), (337, 285), (358, 290), (384, 290), (404, 283), (410, 296), (386, 310), (360, 315), (346, 316), (334, 318), (316, 308)]),
        armL_up=dict(z=20, parent='torso', pivot=(478, 420), poly=tube((478, 420), (520, 640), 52, 58) + [(590, 620), (596, 660)], keep=[dict(pred='notbrown')],
                     paint=[dict(poly=tube((478, 420), (512, 600), 46, 50), colour='#3d3e50')]),
        capelet=dict(z=22, parent='torso', poly=[(330, 300), (520, 290), (606, 310), (612, 618), (330, 618)], keep=[dict(pred='brown')]),
        armL_lo=dict(z=23, parent='armL_up', pivot=(520, 640), poly=[(448, 640)] + arc((520, 640), 70, 180, 360, 8) + [(616, 640), (620, 700), (600, 800), (548, 862), (480, 862), (436, 810), (440, 700)],
                     keep=[dict(pred='notbrown'), dict(poly=[(420, 836), (560, 836), (560, 950), (420, 950)], pred='notskin')]),
        handL=dict(z=24, parent='armL_lo', pivot=(478, 846), keep=[dict(pred='skin')], poly=[(420, 830), (540, 830), (540, 940), (420, 940)]),
    ),
    far=dict(shoulder=(456, 420), rest=dict(shoulder=13, elbow=3)),
    holes=[[(420, 1270), (476, 1270), (470, 1440), (430, 1440)]],  # background seen between the boots
    erase=[
        dict(poly=[(200, 30), (700, 30), (700, 196), (200, 196)], mode='bg'),  # reference hat -> code hat
        dict(poly=[(200, 180), (330, 180), (330, 240), (200, 240)], mode='bg', pred='notskin'),
        dict(poly=[(480, 180), (700, 180), (700, 240), (480, 240)], mode='bg', pred='notdark'),
        dict(poly=[(330, 176), (500, 176), (500, 200), (330, 200)], mode='#111214'),  # hair under the brim
        dict(poly=[(342, 192), (392, 190), (392, 236), (350, 236), (342, 222)], mode='skin'),  # brow + eye
        dict(poly=[(322, 190), (344, 190), (344, 228), (322, 228)], mode='bg', pred='dark'),  # brow tip past the forehead
        dict(poly=[(338, 270), (370, 270), (372, 300), (356, 300), (338, 292)], mode='skin'),
        dict(poly=[(320, 268), (340, 268), (340, 296), (320, 296)], mode='near', within=[(310, 240), (342, 240), (342, 300), (310, 300)], pred='dark'),
        dict(poly=[(352, 250), (420, 250), (420, 322), (352, 322)], mode='skin', pred='notskin_soft'),  # tattoo dots, stubble
        dict(poly=[(380, 160), (440, 160), (440, 380), (380, 380)], mode='near', pred='cord'),  # hat cord
        dict(poly=[(370, 294), (400, 294), (400, 324), (370, 324)], mode='near', pred='dark', ink_all=True),  # cord knot remains under the jaw
        dict(poly=[(330, 314), (378, 312), (378, 362), (330, 362)], mode='bg'),  # goatee
    ],
    face=dict(brow=[(343, 206), (388, 196)], eye=(354, 222), eyeBack=(378, 214), nose=(325, 263), nostril=(338, 268),
              mouth=(337, 284), corner=(358, 289), chin=(346, 314), jaw=[(420, 262), (410, 296), (386, 310), (360, 315), (346, 314)],
              ear=(410, 240), fw=104, hat=dict(cx=400, y=190, brim=290, crown=112, crownH=50, tilt=-8), tattoo=(396, 282)),
)

VIEWS = dict(A_front=A_FRONT, A_side=A_SIDE, C_front=C_FRONT, C_side=C_SIDE)
