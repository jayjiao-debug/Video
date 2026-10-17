# facts — 第29期 声音

| 说法 | 依据 |
|---|---|
| 这首歌最低的鼓/贝斯约45 Hz；主旋律主音约363 Hz（≈360），约为鼓声的8倍（三个八度） | 我对这首BGM做的频谱实测（FFT 32768点，20–45 s段） |
| 放慢播放 = 每次振动被拉长 = 频率降低、音变低 | 物理定义（频率=每秒振动次数） |
| 加速 ×1.26 = 升高4个半音（大三度） | 2^(4/12)=1.26 |
| 人耳听觉范围约 20–20000 Hz，年纪越大高频先损失 | SFU Sonic Studio Handbook “Range of Human Hearing” https://sfu.ca/~gotfrit/ZAP_Sept.3_99/r/range.html ；The Physics Factbook https://hypertextbook.com/facts/2003/ChrisDAmbrose.shtml |
| 耳蜗像蜗牛壳；宽的一端的毛细胞听高音，靠近中心的听低音 | NIDCD “How Do We Hear?” https://www.nidcd.nih.gov/health/how-do-we-hear |
| 声音到两耳的时间差最大约0.6毫秒；高频主要靠头的“声影”造成的音量差定位 | SFU Sonic Studio Handbook “Binaural Hearing” https://www.sfu.ca/sonic-studio-webdav/cmns/Handbook/Binaural_Hearing.html |
| 八度 2:1，五度 3:2；比例越简单越和谐 | 乐理/声学基础（音程频率比） |
| 又慢又低的音乐常被听成悲伤，与人悲伤时说话变慢变低相似 | Juslin & Laukka (2003), Psychological Bulletin 129(5):770–814（情绪在语音与音乐中的表达） |
| 声音绕着头慢慢转，比固定不动更容易让人起鸡皮疙瘩（frisson） | Honda 等 (2020) “Proximal Binaural Sound Can Induce Subjective Frisson”, Frontiers in Psychology 11:316 https://www.frontiersin.org/articles/10.3389/fpsyg.2020.00316/full |
| 无限上升音（谢泼德音）：只含相隔八度的成分，响度呈钟形包络——高处的成分渐弱、低处的渐强，于是听起来一直在升 | Univ. of Southampton ISVR “Shepard tone” tutorial https://resource.isvr.soton.ac.uk/spcg/tutorial/tutorial/Tutorial_files/Web-hearing-Shepard.htm ；本片配乐即按此合成（process_v2.py） |
| 两个接近的频率会产生拍（“呜哇”），拍频=两频率之差；363 与 385 Hz 相差约22 Hz。泛音之间的拍造成不协和的“粗糙感”；简单比例（2:1、3:2）泛音重合，故协和（Helmholtz；Plomp） | SFU Sonic Studio Handbook “Consonance” https://www.sfu.ca/sonic-studio-webdav/cmns/Handbook/Consonance.html ；Plomp & Levelt 1965 |
| 喀麦隆北部的马法人从未听过西方音乐，却能以高于随机的水平听出快乐、悲伤、害怕 | Fritz et al. 2009, Current Biology；ScienceDaily 报道 https://sciencedaily.com/releases/2009/03/090319132909.htm |
| 音乐带来强烈快感（起鸡皮疙瘩）时，纹状体释放多巴胺；高潮之前的“期待”阶段（尾状核）也在活动 | Salimpoor et al. 2011, Nature Neuroscience 14:257 https://www.zlab.mcgill.ca/publications/docs/salimpoor_2011_nn.pdf |
| 腹语效应：看到的位置会“拉走”听到的位置——看电视电影时，声音像从演员嘴里发出，而非真正的喇叭 | Alais & Burr 2004, Current Biology 14:257 https://flore.unifi.it/bitstream/2158/202581/1/AlaisBurr_Ventril.pdf |
| 《敦刻尔克》配乐大量使用谢泼德音（无限上升的听觉错觉），点子来自诺兰 | CBC Radio q（汉斯·季默访谈）https://www.cbc.ca/radio/q/blog/hans-zimmer-explains-the-audio-trickery-that-made-dunkirk-audiences-nauseous-1.4311684 |
| 拍频 = 两个频率之差；钢琴调音师就是听“拍”消失来调准 | OpenStax University Physics Vol.1 §17.6 Beats https://oer.xyzhomework.com/ebooks/html/university-physics-volume-1/ch17/17-6-beats.html |
| 人的毛细胞被过大的声音损伤后无法修复或再生，造成永久听力损失（包括耳机听大声音乐） | NIDCD “How does loud noise cause hearing loss?” https://www.nidcd.nih.gov/health/how-does-noise-damage-your-hearing |
| 双耳拍频：两只耳朵各听一个频率，大脑“造出”第三个声音，频率=两者之差（363/369 → 6 Hz）；声音本身里没有它 | Oster, G. (1973) “Auditory beats in the brain”, Scientific American 229(4):94–102；Hearing Health Matters “Binaural Beat Therapy Revisited” https://hearinghealthmatters.org/hearing-international/2017/binaural-beat-therapy/ ；本片配乐实测 L 363.3 / R 369.3 Hz |
| 优先效应：两个相同的声音先后到达（相差几毫秒到几十毫秒），人听到的位置由先到的那个决定（本片右/左耳晚 18 ms） | Litovsky, Colburn, Yost & Guzman (1999) “The precedence effect”, JASA 106(4):1633–1654 https://bhsl.waisman.wisc.edu/documents/the-precedence-effect/ |
| 缺失的基频（幽灵低音）：去掉基频、只留泛音，人听到的音高不变——大脑从泛音里“补”出低音 | Fay, R. R. (Loyola Univ. Chicago, Parmly Hearing Institute), ASA 146th meeting pressroom https://acoustics.org/pressroom/httpdocs/146th/Fay.htm |
