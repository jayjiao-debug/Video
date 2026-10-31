# Facts table: 《曹操，到底是英雄还是奸雄？》 (ep54), fact-check of script v1 + `CARDS` in qq54/demo54core.tsx

Researcher pass, 2026-10-31. Scope: verification only (owner/coordinator). No Wikipedia / Wikimedia (incl. Wikisource), 百度百科, 知乎.

## Sources and how far each was checked

Status tags used in the table:
- **[开]**: I opened the source in this session and the quoted text is copied from it.
- **[未开 UNVERIFIED]**: I could not open a source for it. The text is the standard 中华书局点校本 reading as I know it. It needs a 1-minute check on ctext (location given) before it goes on screen.

Opened sources:
- **S1**: 陳登武〈《三國志》卷1〈武帝紀第一〉解讀〉. A reading text of 武帝紀 with 裴注 (曹瞞傳, 魏書, 世語, 雜記, 任峻傳 excerpt). https://web.twu.edu.tw/~jim0326/TK/data/20080618.pdf [开]
- **S2**: 楊自平《史傳與現代生活》第十一講〈德才兼美的荀彧與足智多謀的郭嘉〉, 國立中央大學開放式課程 (OCW). Slides quoting 《三國志·荀彧傳》. https://ocw.ncu.edu.tw/filedownload/4131 [开]
- **S3**: 中華民國教育部《成語典》「老驥伏櫪」, 書證《晉書．卷二三．樂志下》. https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=30060 [开]
- **S4**: 涂榮華〈曹操官渡戰役中《孫子兵法》的運用與啟示〉,《空軍學術雙月刊》第664期 (2018-06), 中華民國國防部. https://www.mnd.gov.tw/File/28958 [开]
- **S5**: 劉殿爵、陳方正、何志華編《曹操集逐字索引》(香港中文大學出版社, 2000). Only the table of contents was readable; it lists 〈蒿里行〉 as 1.6 among 曹操's works. https://scalar.usc.edu/works/chinese-studies-reference-collection/media/PL2664.T8%20Z459%20曹操集逐字索引_OCR.pdf [开]

Could not be opened:
- **ctext.org**: every URL returned client_error to the fetch tool, and the shell proxy refused it (403 policy).
- **Wikisource**: excluded by the owner.
- **edb.gov.hk .doc**: came back as binary.

Where to confirm the UNVERIFIED rows: ctext.org/sanguozhi/N (N = 卷 number): 1 武帝紀, 6 袁紹傳, 7 呂布傳, 9 曹洪傳, 10 荀彧傳, 12 毛玠傳, 32 先主傳, 54 周瑜傳. Check that the ctext edition carries 裴注; if it doesn't, use 中华书局点校本. The poems are in 《宋書·樂志》.

Age rule: 武帝紀「庚子，王崩于洛陽，年六十六」 (220), so born 155 and 虚岁 = year − 154. All counters in `CARDS` follow this rule. The only age errors are card 10's text and card 13's counter.

## Table

| card # | claim (subtitle · stamp · age) | verdict | source with the exact quoted text | correction if needed |
|---|---|---|---|---|
| 1 | 20岁当官，他打死了[皇帝红人]的叔叔 · 174 洛阳 / 洛阳北部尉 · 20 | ✓ (⚠ minor timing) | S1 [开] 武帝紀「年二十，舉孝廉為郎，除洛陽北部尉，遷頓丘令」; 注引《曹瞞傳》「後數月，靈帝愛幸小黃門蹇碩叔父夜行，即殺之。」 "皇帝红人" is a fair gloss of 「靈帝愛幸小黃門」. | None needed. Note: the killing was 「後數月」 after he took office, so it may fall in 175 (21岁). The card does not say he killed him at 20, so it can stay. |
| 2 | 门口挂五色棒：犯禁者，一律打死 | ✓ | S1 [开] 《曹瞞傳》(裴注)「太祖初入尉廨，繕治四門。造五色棒，縣門左右各十餘枚，有犯禁，不避豪彊，皆棒殺之。」 The 五色棒 story is in 《曹瞞傳》. | — |
| 3 | 整个洛阳，再没人敢犯禁 · note 京师敛迹 | ✓ | S1 [开]「京師斂迹，莫敢犯者。近習寵臣咸疾之，然不能傷，於是共稱薦之，故遷為頓丘令。」 | — (S1 writes 斂迹; 迹/跡 are variants) |
| 5 | 30岁，黄巾四起，天下大乱 · 184 颍川 · 骑都尉 讨黄巾 · 30 | ✓ | [未开 UNVERIFIED] 武帝紀「光和末，黃巾起。拜騎都尉，討潁川賊。」 (光和七年 = 中平元年, 184). | — |
| 6 | 35岁，董卓进京，废了皇帝，独揽朝政 · 189 洛阳 · 35 | ✓ | S1 [开] 武帝紀「進乃召董卓，欲以脅太后，卓未至而進見殺。卓到，廢帝為弘農王而立獻帝，京都大亂。」 "独揽朝政" is a fair gloss. | — |
| 7 | 董卓要拉拢他。他改名换姓，**连夜**出逃 · 变易姓名，间行东归 | ⚠ | S1 [开]「卓表太祖為驍騎校尉，欲與計事。太祖乃變易姓名，間行東歸。」 注引《魏書》「太祖以卓終必覆敗，遂不就拜，逃歸鄉里。」 間行 means "by back roads, in secret". No source says 连夜. | 「他改名换姓，抄小路东逃。」 (or 「…偷偷逃出洛阳」) |
| 8 | 逃亡路上，他在吕伯奢家，杀了人 · 189 **成皋** · 各书说法不一 · 35 | ✓ | S1 [开] three versions in 裴注. **《魏書》**「從數騎過故人成皋呂伯奢；伯奢不在，其子與賓客共劫太祖，取馬及物，太祖手刃擊殺數人。」 (self-defence against robbery). **《世語》**「太祖過伯奢。伯奢出行，五子皆在，備賓主禮。太祖自以背卓命，疑其圖己，手劍夜殺八人而去。」 **孫盛《雜記》**「太祖聞其食器聲，以為圖己，遂夜殺之。」 成皋 comes from 《魏書》 only. The card's wording holds for all three. | — Keep 「各书说法不一」. Add 《世语》 to the end-card sources line (see list below). |
| 9 | 留下一句：“[宁我负人，毋人负我]。” · 孙盛《杂记》 | ✓ | S1 [开] 孫盛《雜記》「既而悽愴曰：『寧我負人，毋人負我！』遂行。」 Verbatim. In the source he says it 悽愴, with grief. 「宁教我负天下人…」 is the 演义 version, and the card correctly does not use it. | — |
| 10 | **36岁，他起兵讨董卓**。第一仗，惨败 · 190 荥阳 · 汴水遇徐荣 · 36 | ✗ (text) / ✓ (stamp) | S1 [开] 武帝紀「冬十二月，始起兵於己吾，是歲中平六年也。」 So he raised troops in 189, at **35**. The battle: [未开 UNVERIFIED] 武帝紀 (初平元年, 190)「到滎陽汴水，遇卓將徐榮，與戰不利，士卒死傷甚多。」 S1 [开] has his own later mention of the battle: 「故汴水之戰數千」. | 「36岁，他率军西进讨董卓。」 / 「第一仗，惨败。」 (or 「36岁，讨董卓第一仗，惨败。」). The stamp 190 荥阳 · 36 stays. |
| 11 | 中了箭，马也伤了，追兵就在身后 · 为流矢所中 | ✓ | [未开 UNVERIFIED] 武帝紀「太祖為流矢所中，所乘馬被創，從弟洪以馬與太祖，得夜遁去。」 曹洪傳「太祖失馬，賊追甚急」. | — |
| 12 | 堂弟曹洪让出马：“天下可无洪，不可无君。” | ✓ | [未开 UNVERIFIED] 曹洪傳「曹洪字子廉，太祖從弟也。太祖起義兵討董卓，至滎陽，為卓將徐榮所敗。太祖失馬，賊追甚急，洪下，以馬授太祖，太祖辭讓，洪曰：『天下可無洪，不可無君。』遂步從到汴水，水深不得渡，洪循水得船，與太祖俱濟，還奔譙。」 从弟 = 堂弟. | — |
| 13 | 那些年，他写下：“[白骨露于野]，千里无鸡鸣。” · 190s 关东 · 曹操《蒿里行》 · **36** | ✓ (quote) / ✗ (counter) | S5 [开] lists 〈蒿里行〉 among 曹操's works. [未开 UNVERIFIED] text (《宋書·樂志》): 「…淮南弟稱號，刻璽於北方。鎧甲生蟣蝨，萬姓以死亡。白骨露於野，千里無雞鳴。生民百遺一，念之斷人腸。」 「淮南弟稱號」 is 袁術 claiming the throne in 建安二年 (197) (武帝紀「袁術欲稱帝於淮南」), so the poem was written **197 or later**, when he was 43 or older, not at 36. | Hide the age counter on this card, or change the stamp to 「197年后 · 曹操《蒿里行》」. "190s" and "那些年" can stay. |
| 14 | 42岁，他把天子接到了许都 · 196 许 · 迎天子都许 · 42 | ✓ | S2 [开] 荀彧傳「太祖遂至洛陽，奉迎天子都許。」 S1 [开]「自太祖之迎天子也，袁紹內懷不服。」 Year 建安元年 (196): [未开] 武帝紀 建安元年. | — |
| 15 | 从此——[挟天子以令诸侯] · note **奉天子以令不臣** | ⚠ | The idiom's source wording, [未开 UNVERIFIED]: 袁紹傳注引《獻帝傳》 沮授「挾天子而令諸侯」, and 諸葛亮傳「挾天子而令諸侯」 (the idiom uses 以 where the sources have 而; fine because the card shows it as an idiom, not a quote). 「宜奉天子以令不臣，脩耕植，畜軍資」 is 毛玠's advice to 曹操 (毛玠傳, c.192, [未开 UNVERIFIED]). | Attribute the note: 「毛玠：奉天子以令不臣」. Otherwise it reads as a gloss of the slogan. Add 毛玠传 to the sources line. |
| 16 | 这招，袁绍的谋士早提过。袁绍没听 · 196 邺 · 沮授 ·《献帝传》 | ✓ (⚠ sources differ) | [未开 UNVERIFIED] 袁紹傳 注引《獻帝傳》: 沮授「宜迎大駕，安宮鄴都，挾天子而令諸侯，畜士馬以討不庭，誰能禦之！」…郭圖、淳于瓊 opposed…「紹弗能用」. 袁紹傳 main text: 「及在河東，紹遣潁川郭圖使焉。圖還說紹迎天子都鄴，紹不從。」 The texts disagree on who advised (沮授 or 郭圖), but both say 袁紹 refused. "袁绍的谋士…袁绍没听" holds for both. | Text OK. The stamp 「沮授 ·《献帝传》」 is accurate as attributed. The advice dates from when the emperor was in 河东 (195–196), so 「约196」 is safer than a flat 196. |
| 17 | 他招**流民**屯田，一年收粮百万斛 · 196 许 · 募民屯田许下 | ✓ (⚠ wording) | S1 [开] 武帝紀「是歲用棗祗、韓浩等議，始興屯田。」 注引《魏書》「是歲乃募民屯田許下，得穀百萬斛。」 任峻傳「募百姓屯田於許下，得穀百萬斛。」 S4 [开] also quotes「得穀百萬斛」「所在積穀」. The sources say 募民 / 募百姓, not 流民. | 「他招募百姓屯田，」 (exact). 百万斛 and "一年" (是歲) are correct. |
| 18 | 44岁，下邳**城破**，吕布被擒 · 198 下邳 · 白门楼 · 44 | ⚠ | [未开 UNVERIFIED] 武帝紀 (建安三年)「遂決泗、沂水以灌城。月餘，布將宋憲、魏續等執陳宮，舉城降，生禽布、宮，皆殺之。」 呂布傳「太祖塹圍之三月…其將侯成、宋憲、魏續縛陳宮，將其衆降。布與其麾下登白門樓。兵圍急，乃下降。」 The city was flooded and then surrendered by his own officers. It was not taken by storm. Note: 建安三年十二月 falls in early 199 CE; Chinese convention is 198. | 「44岁，水淹下邳，」 / 「吕布被擒。」 (or 「下邳被围，部将献城」). |
| 19 | 北方，只剩一个对手——袁绍 · 199 邺 · 袁绍并公孙瓒 · 45 | ⚠ minor | [未开 UNVERIFIED] 武帝紀 (建安四年)「袁紹既并公孫瓚，兼四州之地，衆十餘萬，將進軍攻許」. Other northern rivals were still active in 199: 張繡 (until 11月), 劉備 at 徐州, 馬騰/韓遂 in 關中. | 「北方，最大的对手——」 / 「袁绍。」 |
| 20 | 四州之地，兵[十余万] · 199 河北 · 冀青幽并四州 · 45 | ✓ | [未开 UNVERIFIED] 武帝紀「兼四州之地，衆十餘萬」. 袁紹傳「紹出長子譚為青州，中子熙為幽州，甥高幹為并州」 (plus 冀州), and gives 「衆數十萬…簡精卒十萬，騎萬匹」. S1 [开] 陳壽評「袁紹虎眎四州，彊盛莫敵」. S4 [开] quotes 武帝紀「紹眾十餘萬，屯營東西數十里」. "十余万" holds for every source. | — |
| 21 | 46岁，两军对峙官渡 · 200 官渡 · 建安五年 · 46 | ✓ | S2 [开] 荀彧傳「五年，與紹連戰。太祖保官渡，紹圍之。」 | — |
| 22 | 他的兵，[不满一万]。粮，快吃完了 · 《三国志》原文 | ✓ (contested number, flagged) | [未开 UNVERIFIED] 武帝紀「時公兵不滿萬，傷者十二三。」 裴松之 doubted it: 「臣松之以為魏武初起兵，已有衆五千，自後百戰百勝…以理而言，竊謂不然。」 Grain, S2 [开] 荀彧傳「太祖軍糧方盡」. | Keep the stamp 「《三国志》原文」; it signals that this is 陳壽's figure. For any platform query, cite 裴松之's doubt. |
| 23 | 他写信给荀彧：想退了 · 议欲还许 | ✓ | S2 [开] 荀彧傳「太祖軍糧方盡，書與彧，議欲還許以引紹。」 (also "to draw 袁紹 out"). | — |
| 24 | 荀彧回信：“此用奇之时，不可失也。” | ✓ | S2 [开]「彧曰：『今軍食雖少，未若楚、漢在滎陽、成皋閒也。…公以十分居一之眾，畫地而守之，扼其喉而不得進，已半年矣。情見勢竭，必將有變，此用奇之時，不可失也。』太祖乃住。」 Verbatim. | — |
| 25 | **深夜**，袁绍谋士许攸来投：粮，在乌巢 · 许攸来奔 | ⚠ | [未开 UNVERIFIED] 武帝紀「紹復遣車運穀，使淳于瓊等五人將兵萬餘人送之，宿紹營北四十里。紹謀臣許攸貪財，紹不能足，來奔，因說公擊瓊等。」 袁紹傳「瓊宿烏巢，去紹軍四十里」. 注引《曹瞞傳》 許攸「今袁氏有輜重萬餘乘，在故市、烏巢」. No source gives the time of night. | Drop 「深夜」: 「袁绍谋士许攸来投：」 / 「粮，在乌巢。」 |
| 26 | 他亲率五千人，[夜袭乌巢]！ · 200 乌巢 · 步骑五千人夜往 · 46 | ✓ | [未开 UNVERIFIED] 武帝紀「公乃留曹洪守，自將步騎五千人夜往，會明至。」 袁紹傳「候夜潛往攻瓊」. | — |
| 27 | 一把火，烧光袁军的粮。袁军，全线崩溃 · 尽燔其粮谷 | ✓ (⚠ attribution) | [未开 UNVERIFIED] The burning is in 注引《曹瞞傳》, not the main text: 「既至，圍屯，大放火，營中驚亂。大破之，盡燔其糧穀寶貨」. Main text 武帝紀「大破瓊等，皆斬之」…「紹衆大潰，紹及譚棄軍走，渡河」. | Text OK. Fix script.md's source column: 「尽燔其粮谷」 → 《曹瞒传》 (裴注), not 武帝纪. |
| 28 | 53岁，北方再无敌手。“[老骥伏枥]，志在千里。” · 207 碣石 · 《龟虽寿》 · 53 | ✓ (quote) / ⚠ (dating, wording) | S3 [开] 《晉書·樂志》 reading 「神龜雖壽，猶有竟時。騰蛇乘霧，終為土灰。**驥老伏櫪**，志在千里。烈士暮年，壯心不已。…」 [未开 UNVERIFIED] 《宋書·樂志》/通行本「老驥伏櫪，志在千里」. The card's 通行本 wording is fine. Dating 〈步出夏門行〉 (觀滄海「東臨碣石」 + 龜雖壽) to the 207 return from 烏桓 is the scholarly consensus (通说), not stated in the text, so treat it as 估算. 碣石 belongs to 觀滄海, which is in the same suite. 關中 (馬超、韓遂) and 漢中 were still independent in 207. | Optional: stamp note 「《步出夏门行·龟虽寿》」. Line: 「53岁，河北已平。」 is safer than 「北方再无敌手」. |
| 29 | 54岁，赤壁一把火，烧回了他自己 · 208 赤壁 · 孙刘联军火攻 · 54 | ✓ (sources differ, wording holds) | S1 [开] 武帝紀「公至赤壁，與備戰，不利。於是大疫，吏士多死者，乃引軍還。」 (no fire in 武帝紀). [未开 UNVERIFIED] 周瑜傳: 黃蓋「觀操軍船艦首尾相接，可燒而走也」…「蓋放諸船，同時發火。時風盛猛，悉延燒岸上營落」. 先主傳「大破之，焚其舟船」. 周瑜傳注引《江表傳》 曹操 to 孫權: 「赤壁之役，值有疾病，孤燒船自退，橫使周瑜虛獲此名。」 | Text OK. Add 周瑜传 to the sources line. |
| 30 | 劝他称帝，他只说：“吾为[周文王]矣。” · 219 **洛阳** · 意即：帝位留给儿子 · 65 | ✓ (quote) / ⚠ (place) | [未开 UNVERIFIED] 武帝紀 注引《魏氏春秋》 (孫盛): 夏侯惇「…應天順民，復何疑哉！」 王曰：「『施于有政，是亦為政』。若天命在吾，吾為周文王矣。」 The card trims 「若天命在吾」; the meaning holds. Timing: after 孫權's 上書稱臣, late 219 to early 220. 武帝紀 has him at 洛陽 (冬十月), then 摩陂, then back in 洛陽 (二十五年正月). No source names the place. | Remove 「洛阳」 from the `CARDS` stamp, as script.md already does: 「219 · 意即：帝位留给儿子」. |
| 31 | 66岁，他死在洛阳。遗令：[无藏金玉珍宝] · 220 洛阳 · 敛以时服 · 66 | ✓ | S1 [开]「遺令曰：『天下尚未安定，未得遵古也。葬畢，皆除服。其將兵屯戍者，皆不得離屯部。有司各率乃職。斂以時服，無藏金玉珍寶。』諡曰武王。二月丁卯，葬高陵。」 [未开 UNVERIFIED]「（建安二十五年春正月）庚子，王崩于洛陽，年六十六。」 | — |
| END | sources line | ⚠ | Cards 8, 15, 18 and 29 use 《世语》, 毛玠传, 吕布传 and 周瑜传, which the line does not list. | 「《三国志》武帝纪、荀彧传、曹洪传、袁绍传、吕布传、毛玠传、周瑜传 · 裴松之注引《曹瞒传》《魏书》《世语》《杂记》《献帝传》《魏氏春秋》 · 曹操《蒿里行》《步出夏门行·龟虽寿》」 (drop 毛玠传 if card 15's note is dropped). |

## Corrections the script needs

1. **Card 10 ✗**: he raised troops in 189 at 35 (「冬十二月，始起兵於己吾，是歲中平六年也」). Change to 「36岁，他率军西进讨董卓。/第一仗，惨败。」
2. **Card 13 ✗**: 《蒿里行》 mentions 袁術称帝 (197), so it was written at 43 or older. Hide the 36 counter, or change the stamp to 「197年后 · 曹操《蒿里行》」.
3. **Card 7 ⚠**: no source says 「连夜」. Use 「他改名换姓，抄小路东逃。」 (間行東歸).
4. **Card 25 ⚠**: no source says 「深夜」. Use 「袁绍谋士许攸来投：」.
5. **Card 18 ⚠**: the city was flooded, then surrendered by his own officers. Use 「44岁，水淹下邳，/吕布被擒。」
6. **Card 30 ⚠**: drop 「洛阳」 from the `CARDS` stamp, since no source names the place.
7. **Card 15 ⚠**: attribute the note: 「毛玠：奉天子以令不臣」.
8. **Card 17 ⚠**: the source says 募民 / 募百姓, not 流民. Use 「他招募百姓屯田，」.
9. **Cards 19 and 28, minor ⚠**: 「北方，最大的对手」 and 「53岁，河北已平」 avoid overclaiming. 龟虽寿 = 207 is the consensus dating, not stated in the text.
10. **Card 27 attribution**: 「尽燔其粮谷」 is from 《曹瞒传》, not 武帝纪, in script.md's source column.
11. **End-card sources line**: add 吕布传、毛玠传、周瑜传 and 《世语》.
12. **Before publish**: confirm the [未开 UNVERIFIED] quotations on ctext (or 中华书局本). I could not open ctext from this session.

## Story-worthy
- 「宁我负人，毋人负我」 comes only from 孙盛《杂记》, and there he says it 「悽愴」, with grief. 《魏书》 tells the same night as self-defence against robbers.
- 曹操 claimed he burned his own ships at 赤壁: 「孤燒船自退，橫使周瑜虛獲此名」 (《江表传》). 武帝纪 blames plague (「於是大疫」).
- 裴松之 himself doubted 「公兵不滿萬」 (「以理而言，竊謂不然」).
- 「挟天子…令诸侯」 was 沮授's advice to 袁绍 first. 曹操's own adviser 毛玠 had put it more politely: 「奉天子以令不臣」.
- His will: 「斂以時服，無藏金玉珍寶」.
- Strongest human story: 曹洪 gives up his horse (「天下可無洪，不可無君」), walks beside him to 汴水, and finds a boat to get them both across.
- Best visual: 五色棒, 「縣門左右各十餘枚」, hung in rows on both sides of the 尉廨 gate.

## Risks
- 演义 vs 正史: viewers and platform reviewers may "correct" true lines from memory of 演义 (宁教我负天下人; 关羽 etc.). Keep the source stamps (孙盛《杂记》, 《三国志》原文) as they are.
- Contested facts on screen: 吕伯奢 (three versions, already stamped 「各书说法不一」); 不满万 (裴松之 doubts); 赤壁 fire vs plague; who advised 袁绍 (沮授 or 郭图).
- Violence: 棒杀, the killings at 吕伯奢's, 白骨. Use no gore; follow the respectful-deaths rule (dim figures, no bodies).
- Maps and places: use 东汉 place names only (许, 邺, 成皋, 荥阳, 官渡, 乌巢), with no modern borders. Keep any map to rough relative positions.
- All people are historical; there are no living people and no portrait-rights issue.
