# facts: 第32期 刷脸

| # | 说法 | 依据 |
|---|---|---|
| F1 | 英国消费者组织 Which? 自 2022 年 10 月起测了 208 部手机，其中 133 部（64%）能被一张打印出来的 2D 照片解锁 | Which?, 2026-06-24 https://www.which.co.uk/news/article/face-recognition-on-phones-easily-fooled-aqMVo7l5KwvN |
| F2 | 多数安卓手机的刷脸是 2D：用摄像头拍一张平面照片来比，没有深度，常常分不清活人和照片 | Which? (F1 link) |
| F3 | Face ID 向脸上投射并读取 3 万多个红外点，形成深度图，同时拍一张 2D 红外图像 | Apple, Face ID Security Guide https://apple.com/business-docs/FaceID_Security_Guide.pdf |
| F4 | "Face ID always requires depth information, which isn't found in print or 2D digital photographs." | Apple Support 102381 https://support.apple.com/102381 |
| F5 | 深度图和红外图像被神经网络转换成一组数学表示，再和录入的面部数据比对 | Apple Support 102381 |
| F6 | Face ID 会确认注意力：看你的视线方向、眼睛是否睁开 | Apple Face ID Security Guide (F3) |
| F7 | 连续失败 5 次就必须输入密码 | Apple Face ID Security Guide (F3) |
| F8 | 随机一个陌生人能用脸解锁你手机的概率约为一百万分之一（Touch ID 约五万分之一） | Apple Face ID Security Guide (F3) |
| F9 | 双胞胎、长得像你的兄弟姐妹、13 岁以下儿童，误识概率更高；Apple 建议这些情况用密码 | Apple Support 102381; Security Guide |
| F10 | NIST 2022 年测评（698 对双胞胎、5938 张照片）：所有人脸识别算法在比对同卵双胞胎时，误识率都很高 | NIST IR 8439 https://nvlpubs.nist.gov/nistpubs/ir/2022/NIST.IR.8439.pdf ; Biometric Update 2026-08-14 https://www.biometricupdate.com/202608/fbi-twin-research-highlights-why-multimodal-biometrics-still-matter |
| F11 | 同卵双胞胎的指纹和虹膜不同 | Biometric Update (F10 link) |
| F12 | FaceNet（Google, 2015）：把一张脸压成 128 个字节的数字，同一个人的距离近、不同人的距离远；LFW 准确率 99.63% | Schroff et al., CVPR 2015 https://openaccess.thecvf.com/content_cvpr_2015/html/Schroff_FaceNet_A_Unified_2015_CVPR_paper.html |
| F13 | 2017 年安全公司 Bkav 声称用一个约 150 美元的面具（3D 打印 + 硅胶 + 手工皮肤）骗过了 Face ID；媒体无法独立验证 | NPR 2017-11-13 https://www.npr.org/sections/thetwo-way/2017/11/13/563741014/security-firm-says-extremely-creepy-mask-cracks-iphone-xs-face-id |
| F14 | Face ID 的反欺骗神经网络专门训练来识别照片和面具 | Apple Face ID Security Guide (F3) |
