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
