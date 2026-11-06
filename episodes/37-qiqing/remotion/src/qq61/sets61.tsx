import React from 'react';
import {Pylon, PylonSun, Column61, Architrave, Obelisk, Colossus, Sphinx, SphinxAvenue, Naos61, Throne61, Dais, FalseDoor, TombFacade, Pyramids, Mastaba, WindowOfAppearances, WingSmall} from './sets61_arch';
import {Nile, Ripples, PapyrusThicket, LotusPond, LotusFlower, DatePalm, Dunes, NightSky, HorizonSun, Nun, Benben, RedSky, FlameFx, SmokeCurl, DustMotes, Sparks, BirdsCrossing, WaterShimmer, LightShafts} from './sets61_nature';
import {OfferingPile, BeerJars, BeerJarU, IncenseStand, Censer, OilLamp, Brazier61, CanopicSet, ScrollOpen, ScrollRolled, ScribeKit, Senet, Sistrum61, Ankh61, Was61, Djed61, SunBarque, Skiff61, LionBed, Chest61, Baskets, BasketU, FeatherFan, FlameU} from './sets61_props';
import {Falcon, Ibis, Cat61, Cobra, Scarab61, CrocWater, Geese, Cow, JackalShrine, Fish, FishSchool} from './sets61_animals';
import {PriestProcession, Mourners, Haulers, BasketCarriers, Musicians, Soldiers, FanBearers, EXTRAS} from './sets61_crowds';
import {SetDefs61, S61, SetP} from './sets61_kit';

/* ep61 · SET-DRESSING library — the public entry point. Future episodes import from here:
     import {Pylon, Column61, Nile, PapyrusThicket, OfferingPile, Brazier61, Falcon, PriestProcession, SetDefs61} from '../qq61/sets61';
   and put <SetDefs61 /> once inside their <svg> unless the scene uses Stage60 (which defines the same g60-* light gradients).
   The catalogue (SETS61), the example scenes (SCENE61) and the motion reel (SETSANIM61) live in setsbook61.tsx.
   Words + sources: episodes/61-zhongshen/setsbook.md. */
export {Pylon, PylonSun, Column61, Architrave, Obelisk, Colossus, Sphinx, SphinxAvenue, Naos61, Throne61, Dais, FalseDoor, TombFacade, Pyramids, Mastaba, WindowOfAppearances, WingSmall};
export {Nile, Ripples, PapyrusThicket, LotusPond, LotusFlower, DatePalm, Dunes, NightSky, HorizonSun, Nun, Benben, RedSky, FlameFx, SmokeCurl, DustMotes, Sparks, BirdsCrossing, WaterShimmer, LightShafts};
export {OfferingPile, BeerJars, BeerJarU, IncenseStand, Censer, OilLamp, Brazier61, CanopicSet, ScrollOpen, ScrollRolled, ScribeKit, Senet, Sistrum61, Ankh61, Was61, Djed61, SunBarque, Skiff61, LionBed, Chest61, Baskets, BasketU, FeatherFan, FlameU};
export {Falcon, Ibis, Cat61, Cobra, Scarab61, CrocWater, Geese, Cow, JackalShrine, Fish, FishSchool};
export {PriestProcession, Mourners, Haulers, BasketCarriers, Musicians, Soldiers, FanBearers, EXTRAS};
export {SetDefs61, S61};
export type {SetP};

/** short source tags shown on the catalogue (full citations + URLs: setsbook.md §2; ✓ = record opened by the researcher) */
export const SRC: Record<string, string> = {
	A1: 'Met 30.4.6 神庙游行（摹本）', A2: 'Met 10.177.2 纸草柱头', A3: 'Met 09.180.55 有翼日轮', A4: 'Met 11.154.9 / 58.107.1', A5: 'Met 22.5.2 阿蒙霍特普三世坐像',
	A6: 'Met 31.3.166 哈特谢普苏特斯芬克斯 · UNESCO 87', A7: 'Louvre 阿玛西斯神龛 · Met 23.6.75a', A8: 'Met 68.58 Reniseneb 椅', A9: 'Met 64.100 Metjetji 假门',
	A10: 'Met 13.183.3 Perneb 马斯塔巴', A11: 'UNESCO 86 吉萨', A12: '设计选择（未核实）', A13: 'Met 21.2.66 Iufaa 金字塔尖',
	N1: 'Met 30.4.48 Menna 沼泽', N2: 'Met 30.4.148 园中水池', N3: 'Met 30.4.2 Sennedjem', N4: 'Met 48.105.52 Senenmut 星顶', N5: 'Met 21.2.66 金字塔尖',
	N6: '水的象形字 N35 · Met 36.3.8', N7: '地平线符号 akhet（设计）', N8: '设计选择（努恩之水）',
	P1: 'Met INST.1979.2.19 · 15.3.1150', P2: 'Met 20.3.256 啤酒罐', P3: 'Met 41.2.2 香炉', P4: 'Met 15.3.1391 陶灯', P5: 'Met 36.3.165 火盆', P6: 'Met 28.3.115 · 12.183.1',
	P7: 'Met 26.2.51 亡灵书', P8: 'Met 47.123 书吏调色板', P9: 'Met 16.10.475 塞尼特', P10: 'Met 26.7.986 叉铃', P11: 'Met 12.182.66 · 08.200.51 · 25.3.170',
	P12: 'Met 31.3.130 太阳船', P13: 'Met 20.3.6 Meketre 船模', P14: 'Met 30.3.45 · 1977.170', P15: 'Met 36.3.56 山形盖箱', P16: 'Met 36.3.57 篮', P17: 'Met 22.1.149 扇顶（羽毛：设计）',
	B1: 'Met 30.8.233 隼', B2: 'Met 43.2.2 朱鹮', B3: 'Met 17.120.146 · 30.4.1', B4: 'Met 50.198.3 圣蛇', B5: 'Met 10.130.701（推球：设计）', B6: 'Met 07.227.19 鳄鱼',
	B7: 'Met 31.6.8 美杜姆群雁', B8: 'Met 30.4.70 牛群', B9: 'Met 04.18.9 神龛上的阿努比斯', B10: 'Met 17.190.1966 罗非鱼',
	C1: 'Met 30.4.6 · 31.6.5 圣船', C2: 'Met 30.4.37 Ramose 送葬', C3: 'Met 15.5.17a 拖运雕像', C4: 'Met 30.4.9 女乐师 · 43.2.1 竖琴', C5: 'Met 1991.237.39 · 11.150.11',
	X1: '设计选择（无实物）', X2: '设计选择', X3: '设计（动效）',
};

/* ---------------- the catalogue registry ----------------
   One entry per catalogue cell: Chinese label, English name, the component(s), the source tag (full citation in setsbook.md §2),
   and the unit bounding box around the origin [xmin, xmax, ymin, ymax] used to fit the piece into its cell. `dark` cells get a
   night panel. Ambience entries draw in px inside their cell box instead (kind 'px'). */
export type Cat = 'arch' | 'nature' | 'props' | 'animals' | 'crowds' | 'ambient';
export type Item = {key: string; cat: Cat; zh: string; en: string; src: string; box?: [number, number, number, number]; dark?: boolean;
	draw: (x: number, y: number, s: number, t: number) => React.ReactNode; px?: boolean};
const I = (key: string, cat: Cat, zh: string, en: string, src: string, box: [number, number, number, number], draw: Item['draw'], dark = false): Item => ({key, cat, zh, en, src, box, draw, dark});
const PX = (key: string, zh: string, en: string, src: string, draw: (x: number, y: number, s: number, t: number) => React.ReactNode): Item => ({key, cat: 'ambient', zh, en, src, draw, px: true, dark: true});

export const ITEMS: Item[] = [
	/* architecture */
	I('pylon', 'arch', '神庙塔门 + 旗杆', 'Pylon with flagstaffs', 'A1', [-22.6, 22.6, -38, 0.3], (x, y, s, t) => <g><Pylon x={x} y={y} s={s} t={t} /><PylonSun x={x} y={y} s={s} t={t} /></g>),
	I('columns', 'arch', '纸草束柱 · 莲花柱（开 / 合）', 'Papyrus & lotus columns, open / closed', 'A2', [-10.4, 10.4, -18.3, 0.3], (x, y, s, t) => <g>
		<Column61 x={x - 7.6 * s} y={y} s={s} t={t} kind="papyrus" open /><Column61 x={x - 2.6 * s} y={y} s={s} t={t} kind="papyrus" open={false} />
		<Column61 x={x + 2.6 * s} y={y} s={s} t={t} kind="lotus" open /><Column61 x={x + 7.6 * s} y={y} s={s} t={t} kind="lotus" open={false} /></g>),
	I('architrave', 'arch', '额枋 + 有翼日轮', 'Architrave with the winged sun', 'A3', [-13.2, 13.2, -5.6, 0.4], (x, y, s, t) => <Architrave x={x} y={y} s={s} t={t} w={24} />),
	I('obelisk', 'arch', '方尖碑', 'Obelisk', 'A4', [-3.0, 3.0, -27.6, 0.3], (x, y, s, t) => <Obelisk x={x} y={y} s={s} t={t} h={24} />),
	I('colossus', 'arch', '坐像巨像', 'Seated colossus', 'A5', [-6.6, 7.0, -26.0, 0.3], (x, y, s) => <Colossus x={x} y={y} s={s} />),
	I('sphinx', 'arch', '狮身人面像', 'Sphinx', 'A6', [-11.0, 11.4, -12.6, 0.3], (x, y, s, t) => <Sphinx x={x} y={y} s={s} t={t} />),
	I('avenue', 'arch', '羊首狮身像大道', 'Avenue of ram-sphinxes', 'A6', [-43.8, 11.6, -12.6, 0.3], (x, y, s, t) => <SphinxAvenue x={x} y={y} s={s} t={t} n={4} />),
	I('naos', 'arch', '神龛（naos）', 'Naos shrine', 'A7', [-4.6, 4.6, -10.9, 0.3], (x, y, s, t) => <Naos61 x={x} y={y} s={s} t={t} />),
	I('throne', 'arch', '王座（狮足椅）', 'Throne chair', 'A8', [-4.3, 4.3, -10.7, 0.3], (x, y, s, t) => <Throne61 x={x} y={y} s={s} t={t} />),
	I('dais', 'arch', '阶梯高台', 'Stepped dais', 'A8', [-8.4, 8.4, -13.6, 0.3], (x, y, s, t) => <g><Dais x={x} y={y} s={s} t={t} /><Throne61 x={x + 2 * s} y={y - 2.6 * s} s={s} t={t} /></g>),
	I('falsedoor', 'arch', '假门', 'False door', 'A9', [-4.7, 4.7, -12.5, 0.3], (x, y, s, t) => <FalseDoor x={x} y={y} s={s} t={t} />),
	I('tomb', 'arch', '墓葬礼拜堂（小金字塔）', 'Tomb chapel facade', 'A13', [-13.3, 13.3, -15.8, 0.3], (x, y, s, t) => <TombFacade x={x} y={y} s={s} t={t} />),
	I('pyramids', 'arch', '金字塔群', 'Pyramid group', 'A11', [-26.6, 28.0, -15.9, 0.3], (x, y, s, t) => <Pyramids x={x} y={y} s={s} t={t} />),
	I('mastaba', 'arch', '马斯塔巴墓', 'Mastaba', 'A10', [-9.4, 9.4, -5.9, 0.3], (x, y, s, t) => <Mastaba x={x} y={y} s={s} t={t} />),
	I('window', 'arch', '王宫显现之窗', 'Window of appearances', 'A12', [-8.9, 8.9, -19.9, 0.3], (x, y, s, t) => <WindowOfAppearances x={x} y={y} s={s} t={t} />),
	/* nature */
	I('nile', 'nature', '尼罗河（水纹 · 涟漪）', 'The Nile', 'N6', [-13, 13, -1.2, 6.3], (x, y, s, t) => <g><Nile x={x} y={y} s={s} t={t} w={26} h={6} /><Ripples x={x - 6 * s} y={y + 0.1 * s} s={s} t={t} /><Ripples x={x + 7 * s} y={y + 0.1 * s} s={s} t={t + 1.1} seed={3} /></g>),
	I('papyrus', 'nature', '纸草丛（摇曳）', 'Papyrus thicket', 'N1', [-11.5, 11.5, -16.8, 0.4], (x, y, s, t) => <PapyrusThicket x={x} y={y} s={s} t={t} />),
	I('lotus', 'nature', '莲花池（花开花合）', 'Lotus pond', 'N2', [-10.6, 10.6, -5.8, 5.3], (x, y, s, t) => <LotusPond x={x} y={y} s={s} t={t} cycle={6} />),
	I('palm', 'nature', '椰枣树', 'Date palms', 'N3', [-10.5, 13.5, -19.6, 0.4], (x, y, s, t) => <g><DatePalm x={x + 5 * s} y={y} s={s * 0.8} t={t} seed={2} /><DatePalm x={x - 2 * s} y={y} s={s} t={t} /></g>),
	I('dunes', 'nature', '沙丘（扬沙）', 'Desert dunes', 'X2', [-15, 15, -9.4, 0.3], (x, y, s, t) => <Dunes x={x} y={y} s={s} t={t} w={30} />),
	I('night', 'nature', '星空', 'Night sky', 'N4', [-15, 15, 0, 16], (x, y, s, t) => <NightSky x={x} y={y} s={s} t={t} w={30} h={16} n={60} />, true),
	I('sunrise', 'nature', '日出（地平线 akhet）', 'Sunrise over the horizon', 'N7', [-15, 15, -16, 0.4], (x, y, s, t) => <HorizonSun x={x} y={y} s={s} t={t} w={30} h={16} mode="rise" auto={false} rise={0.55 + 0.1 * Math.sin(t * 0.8)} />),
	I('sunset', 'nature', '日落', 'Sunset', 'N7', [-15, 15, -16, 0.4], (x, y, s, t) => <HorizonSun x={x} y={y} s={s} t={t} w={30} h={16} mode="set" auto={false} rise={0.45 - 0.1 * Math.sin(t * 0.8)} />),
	I('nun', 'nature', '努恩 · 原初之水', 'Nun, the primeval waters', 'N8', [-15, 15, 0, 12], (x, y, s, t) => <Nun x={x} y={y} s={s} t={t} w={30} h={12} />, true),
	I('benben', 'nature', '原初之丘 + 本本石', 'Primeval mound & benben', 'N5', [-12, 12, -9.6, 5], (x, y, s, t) => <g><Nun x={x} y={y} s={s} t={t} w={24} h={5} /><Benben x={x} y={y} s={s} t={t} auto={false} rise={0.75 + 0.25 * Math.sin(t * 0.7)} /></g>, true),
	I('redsky', 'nature', '血色天空（愤怒）', 'Red sky (rage)', 'X1', [-15, 15, 0, 16], (x, y, s, t) => <RedSky x={x} y={y} s={s} t={t} w={30} h={16} />, true),
	/* props */
	I('offering', 'props', '供桌（面包 · 无花果 · 鹅 · 莲）', 'Offering table, heaped', 'P1', [-6.1, 6.1, -10.4, 0.3], (x, y, s, t) => <OfferingPile x={x} y={y} s={s} t={t} />),
	I('beer', 'props', '啤酒罐', 'Beer jars', 'P2', [-2.9, 2.9, -4.4, 0.3], (x, y, s, t) => <BeerJars x={x} y={y} s={s} t={t} />),
	I('incense', 'props', '香炉 + 升腾的烟', 'Incense burner with smoke', 'P3', [-3.2, 4.6, -13.4, 0.3], (x, y, s, t) => <IncenseStand x={x} y={y} s={s} t={t} smokeColor="#8C8070" />),
	I('censer', 'props', '手臂形香炉', 'Arm-shaped censer', 'P3', [-4.3, 4.6, -8.2, 0.6], (x, y, s, t) => <Censer x={x} y={y} s={s} t={t} smokeColor="#8C8070" />),
	I('lamps', 'props', '油灯（立灯 / 地灯）', 'Oil lamps', 'P4', [-2.6, 3.4, -6.8, 0.3], (x, y, s, t) => <g><OilLamp x={x - 1.4 * s} y={y} s={s} t={t} /><OilLamp x={x + 2.2 * s} y={y} s={s} t={t} stand={false} seed={3} /></g>),
	I('brazier', 'props', '火盆', 'Brazier', 'P5', [-2.7, 2.7, -10.0, 0.3], (x, y, s, t) => <Brazier61 x={x} y={y} s={s} t={t} />),
	I('canopic', 'props', '卡诺匹斯罐（四子）', 'Canopic jars', 'P6', [-6.1, 6.1, -6.8, 0.3], (x, y, s, t) => <CanopicSet x={x} y={y} s={s} t={t} />),
	I('scroll', 'props', '纸草卷（展开 / 卷起）', 'Papyrus scrolls', 'P7', [-0.6, 13.6, -4.4, 0.3], (x, y, s, t) => <g><ScrollOpen x={x} y={y} s={s} t={t} /><ScrollRolled x={x + 11.6 * s} y={y} s={s} t={t} /></g>),
	I('palette', 'props', '书吏调色板 + 水罐 + 笔盒', "Scribe's palette & kit", 'P8', [-4.7, 3.5, -3.6, 0.4], (x, y, s, t) => <ScribeKit x={x} y={y} s={s} t={t} />),
	I('senet', 'props', '塞尼特棋', 'Senet board', 'P9', [-4.7, 8.4, -3.5, 0.3], (x, y, s, t) => <Senet x={x} y={y} s={s} t={t} />),
	I('sistrum', 'props', '叉铃（哈托尔）', 'Sistrum', 'P10', [-1.6, 1.6, -7.1, 0.3], (x, y, s, t) => <Sistrum61 x={x} y={y} s={s} t={t} />),
	I('emblems', 'props', '安卡 · 瓦斯权杖 · 杰德柱', 'Ankh, was, djed', 'P11', [-4.6, 5.0, -7.8, 0.3], (x, y, s, t) => <g><Ankh61 x={x - 3.2 * s} y={y} s={s} t={t} /><Was61 x={x} y={y} s={s} t={t} /><Djed61 x={x + 3.6 * s} y={y} s={s} t={t} /></g>),
	I('barque', 'props', '太阳船', 'Sun barque', 'P12', [-17, 17.2, -17.6, 5.6], (x, y, s, t) => <SunBarque x={x} y={y} s={s} t={t} />),
	I('skiff', 'props', '纸草小舟', 'Papyrus skiff', 'P13', [-7.8, 7.8, -4.6, 2.2], (x, y, s, t) => <Skiff61 x={x} y={y} s={s} t={t} />),
	I('bed', 'props', '狮形葬床', 'Funerary bed with lion legs', 'P14', [-1.9, 22.8, -8.9, 0.3], (x, y, s, t) => <LionBed x={x} y={y} s={s} t={t} />),
	I('chest', 'props', '木箱（山形盖）', 'Chest', 'P15', [-2.6, 2.6, -3.9, 0.3], (x, y, s, t) => <Chest61 x={x} y={y} s={s} t={t} />),
	I('baskets', 'props', '篮子', 'Baskets', 'P16', [-3.9, 4.3, -3.4, 0.3], (x, y, s, t) => <Baskets x={x} y={y} s={s} t={t} />),
	I('fan', 'props', '鸵鸟羽扇', 'Ostrich-feather fan', 'P17', [-3.4, 3.4, -11.2, 0.3], (x, y, s, t) => <FeatherFan x={x} y={y} s={s} t={t} />),
	/* animals */
	I('falcon', 'animals', '隼（栖 · 转头）', 'Falcon, perched', 'B1', [-1.9, 1.9, -7.0, 0.3], (x, y, s, t) => <Falcon x={x} y={y} s={s} t={t} />),
	I('falconfly', 'animals', '隼（飞）', 'Falcon, flying', 'B1', [-4.0, 3.3, -4.3, 4.3], (x, y, s, t) => <Falcon x={x} y={y} s={s} t={t} mode="fly" />),
	I('ibis', 'animals', '朱鹮（涉水 · 啄水）', 'Ibis, wading', 'B2', [-2.7, 5.4, -7.5, 1.6], (x, y, s, t) => <g><Nile x={x + 1.3 * s} y={y} s={s} t={t} w={8.2} h={1.5} sparkle={0.3} /><Ibis x={x} y={y} s={s} t={t} /></g>),
	I('cat', 'animals', '猫（坐 · 甩尾）', 'Cat, sitting', 'B3', [-1.9, 3.0, -4.9, 0.4], (x, y, s, t) => <Cat61 x={x} y={y} s={s} t={t} />),
	I('cobra', 'animals', '眼镜蛇 / 圣蛇（膨颈）', 'Cobra / uraeus', 'B4', [-2.3, 2.6, -6.3, 0.3], (x, y, s, t) => <Cobra x={x} y={y} s={s} t={t} />),
	I('scarab', 'animals', '圣甲虫推粪球', 'Scarab with its ball', 'B5', [-3.2, 2.1, -2.1, 0.3], (x, y, s, t) => <Scarab61 x={x} y={y} s={s} t={t} />),
	I('croc', 'animals', '鳄鱼（水中）', 'Crocodile in the water', 'B6', [-11, 11, -2.8, 3.2], (x, y, s, t) => <g><Nile x={x} y={y} s={s} t={t} w={22} h={3} sparkle={0.4} /><CrocWater x={x} y={y} s={s} t={t} /></g>),
	I('geese', 'animals', '雁阵', 'Geese in flight', 'B7', [-15.6, 3.4, -3.2, 3.2], (x, y, s, t) => <Geese x={x} y={y} s={s} t={t} />),
	I('cow', 'animals', '牛', 'Cow', 'B8', [-8.8, 7.0, -11.6, 0.4], (x, y, s, t) => <Cow x={x} y={y} s={s} t={t} />),
	I('jackal', 'animals', '卧在神龛上的豺', 'Jackal on a shrine', 'B9', [-8.9, 8.9, -11.2, 0.3], (x, y, s, t) => <JackalShrine x={x} y={y} s={s} t={t} />),
	I('fish', 'animals', '水下的鱼', 'Fish under the water', 'B10', [-9, 9, -0.6, 5.2], (x, y, s, t) => <g><Nile x={x} y={y} s={s} t={t} w={18} h={5} sparkle={0.3} /><FishSchool x={x} y={y + 2.6 * s} s={s} t={t} w={14} n={4} /></g>),
	/* crowds */
	I('procession', 'crowds', '祭司队列（抬圣船神龛）', 'Procession of priests with the barque shrine', 'C1', [-33.4, 8.6, -30.4, 0.5], (x, y, s, t) => <PriestProcession x={x} y={y} s={s} t={t} n={5} gap={6} />),
	I('mourners', 'crowds', '哭丧者', 'Mourners', 'C2', [-22.2, 4.4, -25.4, 0.5], (x, y, s, t) => <Mourners x={x} y={y} s={s} t={t} kneel gap={4.9} />),
	I('haulers', 'crowds', '拖运石块的工人', 'Workers hauling a block', 'C3', [-30.4, 4.2, -21.4, 0.5], (x, y, s, t) => <Haulers x={x} y={y} s={s} t={t} n={4} gap={5.6} />),
	I('carriers', 'crowds', '头顶篮子的工人', 'Basket carriers', 'C3', [-22.4, 4.4, -24.6, 0.5], (x, y, s, t) => <BasketCarriers x={x} y={y} s={s} t={t} gap={6} />),
	I('musicians', 'crowds', '乐师与舞者（竖琴 · 叉铃）', 'Musicians & dancers', 'C4', [-26.6, 6.2, -25.4, 0.5], (x, y, s, t) => <Musicians x={x} y={y} s={s} t={t} />),
	I('soldiers', 'crowds', '持矛士兵', 'Soldiers with spears', 'C5', [-26.4, 4.4, -25.8, 0.5], (x, y, s, t) => <Soldiers x={x} y={y} s={s} t={t} gap={5.8} />),
	I('fanbearers', 'crowds', '执扇者', 'Fan-bearers', 'P17', [-9.6, 6.4, -31.4, 0.5], (x, y, s, t) => <FanBearers x={x} y={y} s={s} t={t} gap={6} />),
	/* ambience (px space: x, y = cell centre, s = cell scale ≈ 1) */
	PX('flame', '火焰闪烁', 'Flame flicker', 'X3', (x, y, s, t) => <g><FlameFx x={x - 70 * s} y={y + 50 * s} s={s * 1.4} t={t} /><FlameFx x={x + 60 * s} y={y + 50 * s} s={s * 1.0} t={t} seed={3} /></g>),
	PX('smoke', '烟雾卷曲', 'Smoke curls', 'X3', (x, y, s, t) => <SmokeCurl x={x} y={y + 80 * s} s={s * 18} t={t} h={8.6} seed={2} />),
	PX('dust', '浮尘', 'Dust motes', 'X3', (x, y, s, t) => <g><LightShafts x={x - 40 * s} y={y - 95 * s} s={s * 0.8} t={t} n={1} L={220 * s} a={14} motes={false} /><DustMotes t={t} box={[x - 150 * s, y - 90 * s, x + 150 * s, y + 90 * s]} n={50} /></g>),
	PX('birds', '飞鸟掠过', 'Birds crossing', 'X3', (x, y, s, t) => <BirdsCrossing x={x - 150 * s} y={y - 20 * s} s={s * 14} t={t} w={300 * s} period={5} color="#F4E8CC" />),
	PX('shimmer', '水面波光', 'Water shimmer', 'X3', (x, y, s, t) => <g><Nile x={x} y={y - 60 * s} s={s * 12} t={t} w={26} h={10} /><WaterShimmer t={t} box={[x - 150 * s, y - 55 * s, x + 150 * s, y + 55 * s]} n={30} /></g>),
	PX('shafts', '光柱', 'Light shafts', 'X3', (x, y, s, t) => <LightShafts x={x - 60 * s} y={y - 100 * s} s={s} t={t} n={3} L={230 * s} a={18} />),
	PX('sparks', '火星飞溅', 'Sparks', 'X3', (x, y, s, t) => <g><Brazier61 x={x} y={y + 95 * s} s={s * 14} t={t} sparks={false} /><Sparks x={x} y={y - 0 * s} s={s} t={t} h={150} n={16} /></g>),
];
export const CATS: {cat: Cat; zh: string; en: string; cols: number; rows: number}[] = [
	{cat: 'arch', zh: '建筑', en: 'Architecture', cols: 4, rows: 4},
	{cat: 'nature', zh: '自然', en: 'Nature', cols: 4, rows: 3},
	{cat: 'props', zh: '道具', en: 'Props', cols: 5, rows: 4},
	{cat: 'animals', zh: '动物', en: 'Animals', cols: 4, rows: 3},
	{cat: 'crowds', zh: '群众', en: 'Crowds', cols: 3, rows: 3},
	{cat: 'ambient', zh: '氛围动效', en: 'Ambient motion', cols: 4, rows: 2},
];
export const _libKeep = {BeerJarU, BasketU, FlameU, LotusFlower, Fish, EXTRAS, S61};
