# Facts table: 一夜修好电话线

Every claim on screen appears here with a credible source (official report, government/UN body, peer-reviewed
paper with DOI, national archive/museum, established news agency). Never Wikipedia, 百度百科, 知乎, blogs.

Researcher: filled 2026-10-12 (unattended run). Status is the first word of the Note column:
**OK** = I opened the source and the wording matches · **估算** = an estimate or our own arithmetic, label it 示意/约 on
screen · **UNVERIFIED** = do not use on screen.

## A. The maths (our own arithmetic, no outside source needed)

| # | Claim as it will appear on screen | Exact figure / wording in the source | Source (title, publisher, year, URL/DOI) | Note (estimate? disagreements?) |
|---|---|---|---|---|
| 1 | 10 公里线，50 米一根杆 → 200 段 | 10 000 m ÷ 50 m = 200 spans between poles | Arithmetic | OK (arithmetic). **Careful:** 200 spans need **201 poles** if a pole stands at both ends. On screen say "200段" or "约200根杆"; "200根杆" alone is off by one. The fault lies in a span, so the search is over 200 spans. The 10 km / 50 m line is illustrative (示意), not a real line. |
| 2 | 2⁸ = 256 ≥ 200，8 次就够 | 2^7 = 128 < 200 ≤ 256 = 2^8, so ⌈log2 200⌉ = 8 | Arithmetic | OK. 8 is the **worst case** for 200 spans (some searches end at 7). 7 checks are not always enough, because 128 < 200. |
| 3 | 一根一根查：最坏 200 次 | Checking span by span: worst case 200 tests, about 100 on average | Arithmetic | OK (the average is 估算: (n+1)/2 ≈ 100 if the fault is equally likely anywhere). |
| 4 | 每查一次，剩下的减半 | After k yes/no tests, at most N/2^k candidates remain | Arithmetic | OK. 200 → 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1 (round up at odd counts): 8 tests. |
| 5 | 100 万个位置，只需 20 次 | 2^20 = 1 048 576 ≥ 1 000 000 | Arithmetic | OK. Doubling the line length adds only one more check. |
| 6 | 1000 个提交 ≈ 10 步 | 2^10 = 1024 | Arithmetic; matches the git docs example in row 13 (675 revisions, "roughly 10 steps") | OK. |

## B. A real telephone-line procedure: the halfway test (US Army)

| # | Claim as it will appear on screen | Exact figure / wording in the source | Source (title, publisher, year, URL/DOI) | Note (estimate? disagreements?) |
|---|---|---|---|---|
| 7 | 线路不通，接线员没回应 → 走到故障段的一半 | "If wireman did not receive answer from distant end, he will proceed to halfway along the wire section that has the fault" | *Testing Wire Lines and Locating Faults*, Subcourse SS 0437 (edition 7), Wire Systems Installer MOS 31L course, US Army Signal Center and Fort Gordon, GA; undated. Copy opened: https://www.radionerds.com/images/3/37/SS0437-Testing-Wire-Lines-and-Locating-Faults.pdf | OK. This is a primary US Army training document; the hosting site is a hobbyist archive, so cite it as "US Army Signal School, SS0437". It refers to FM 24-20 ch. 11 (*Field Wire and Field Cable Techniques*), which I did not open. **Undated:** on screen say "美军通信兵教材", with no year. This is our best real "phone line" story. |
| 8 | 剪开线，接上测试电话，两头各试一次 | "Wireman will cut the wire or remove tape if a splice exists there" … "Test wire in both directions to locate which side contains the fault." | Same as row 7 (Lesson 2, Learning Event 1, para 4) | OK. |
| 9 | 摇手柄，有人接 = 这一边是好的 | "Release line binding posts and turn handcrank rapidly." "Pick up handset and when operator answers, determine what side is good." | Same as row 7 (para 3b–c) | OK. A good concrete image: crank the field phone, hear the operator. This is the yes/no test. |
| 10 | 重复，直到锁定那一段 | "repeat testing procedures until fault is narrowed down to the section" | Same as row 7 (para 4) | OK. |
| 11 | 修完：每个剪口都要重新接好 | "Retape or splice each opening made in the wire line." | Same as row 7 (para 5) | OK. Every test leaves a splice, so the search has a physical cost. |
| 12 | 断续故障：接头不良时有时无 | "An intermittent open also occurs in poor splices." | Same as row 7 (Lesson 1, LE 2, para 3) | OK. Supports "the catch": a fault that comes and goes defeats the yes/no test. |

## C. git bisect (official docs + the Linux kernel)

| # | Claim as it will appear on screen | Exact figure / wording in the source | Source (title, publisher, year, URL/DOI) | Note (estimate? disagreements?) |
|---|---|---|---|---|
| 13 | 程序员用同一招找"哪次改动出的错" | "This command uses a binary search algorithm to find which commit in your project's history introduced a bug." Example output: "Bisecting: 675 revisions left to test after this (roughly 10 steps)" | git-bisect documentation, git-scm.com (Git project), version 2.55/2.56, https://www.git-scm.com/docs/git-bisect | OK. |
| 14 | 675 个版本，大约 10 步 | "Bisecting: 675 revisions left to test after this (roughly 10 steps)" | Same as row 13; the identical example appears in the Linux kernel's *Bisecting a regression*, https://docs.kernel.org/admin-guide/bug-bisect.html | OK. Two official sources agree. |
| 15 | Linux 内核开发者：大约每天用一次 | Ingo Molnar: "My average is roughly once a day." | Christian Couder, "Fighting regressions with git bisect", 2009-11-08, written for Linux-Kongress 2009; shipped in Git's own Documentation (git-bisect-lk2009.txt). Opened: https://code.googlesource.com/git/+/HEAD/Documentation/git-bisect-lk2009.txt | OK. Couder's paper quotes Molnar; this is the author's own publication in the Git project. |
| 16 | 15 步，20–30 分钟自动完成 | Molnar: "in the best case i can get a ~15 step kernel bisection done in 20-30 minutes, in an automated way." … even with manual help or several overlapping bugs, "it's rarely more than an hour." | Same as row 15 | OK. 2^15 = 32 768 versions in about 15 steps. Say "最好的情况" (best case). |
| 17 | "git bisect 是无条件的好东西" | Molnar: "So git bisect is unconditional goodness - and feel free to quote that ;-)" | Same as row 15 | OK. A real person's quote. Present it as a quote with his name, and do not show a likeness of him. |
| 18 | 10928 个版本，约 14 步 | "10928 revisions left to test after this (roughly 14 steps)" | Same as row 15 | OK. log2 10928 ≈ 13.4, so 14 steps. |
| 19 | git bisect 最早是 Linus Torvalds 发明的 | The paper credits Linus with inventing git bisect; he wrote a "truly stupid" algorithm, later improved by Junio Hamano | Same as row 15 | OK for "Linus 发明". **No year** in this source; the year 2005 is UNVERIFIED, so do not put a year on screen. |
| 20 | 有一次判断错，整个搜索就跑偏 | "Note, getting this wrong just once will send the rest of the bisection totally off course." | *Bisecting a regression*, Linux kernel documentation, https://docs.kernel.org/admin-guide/bug-bisect.html | OK. Catch #1: the test must be reliable. The doc also asks for "a fully reliable and straight-forward way to reproduce the regression". |
| 21 | 时有时无的错误，二分会失败 | Molnar: a failed bisection "tells us something valuable about the bug: that it's non-deterministic." The paper says Ealdwulf's BBChop project handles intermittent bugs and "works in the presence of false negatives". | Couder 2009, row 15 | OK. Catch #2: intermittent faults. |
| 22 | 不止一个错误时，它只假设有一个 | "there could be more than one 'first bad commit'"; the algorithm assumes only one | Couder 2009, row 15 | OK. Catch #3: more than one fault. |
| 23 | 测不了的点只能跳过，会留下一团说不清 | "The special exit code 125 should be used when the current source code cannot be tested." If a skipped commit is next to the culprit, "Git will be unable to tell exactly which of those commits was the first bad one." | git-scm.com git-bisect docs, row 13 | OK. Catch #4: you need a test you can run at any point. |
| 24 | 浏览器也这样找：约 log n 个版本 | Mozilla's regression range finder "will narrow down the range by executing a binary search on the mozilla nightlies"; it takes "about log n nightlies, if your initial regression range is n days." | Mozilla QA blog, "Regression Range Finder for Firefox Nightly Builds", quality.mozilla.org, Dec 2009 (no author named), https://quality.mozilla.org/2009/12/regression-range-finder-for-firefox-nightly-builds/ | OK. This is Mozilla's own publication; the date comes from the URL. |

## D. Everyday version: the viewer's own computer

| # | Claim as it will appear on screen | Exact figure / wording in the source | Source (title, publisher, year, URL/DOI) | Note (estimate? disagreements?) |
|---|---|---|---|---|
| 25 | 微软官方：一次测一半最省事 | "the most efficient way to do this is to test half of them at a time" (each restart rules out half the items) | Microsoft Support, "How to perform a clean boot in Windows" (KB 929135), https://support.microsoft.com/help/929135 | OK. **Strong relatable hook:** your PC breaks after installing something, and Microsoft's own fix is to halve the list. |
| 26 | 先勾上一半；还坏 → 再去掉另一半 | "Select each of the check boxes in the upper half of the Service list." … "Repeat steps 1 through 6, but in Step 4, clear the lower half of the boxes" | Same as row 25 | OK. |

## E. Telegraph and cable history (background, contrast)

| # | Claim as it will appear on screen | Exact figure / wording in the source | Source (title, publisher, year, URL/DOI) | Note (estimate? disagreements?) |
|---|---|---|---|---|
| 27 | 1858 年第一条跨大西洋电报电缆 | Completed August 5, 1858; Queen Victoria's message took "more than 16 hours to send and receive less than 100 words"; "Just weeks after its completion, the transatlantic cable stopped functioning." | National High Magnetic Field Laboratory (US NSF-funded), Magnet Academy, "Transatlantic Telegraph Cable – 1858", https://nationalmaglab.org/magnet-academy/history-of-electricity-magnetism/museum/transatlantic-telegraph-cable-1858/ | OK. Use "不到100个词，花了16个多小时" and "几周后就坏了". The exact number of days differs between accounts, so avoid it. |
| 28 | 1857 年第一次铺设，放到约 380 英里时断了 | "after about 380 miles of line had been laid, the cable broke" | Same as row 27 | OK. |
| 29 | 英国组成调查委员会，1861 年报告 | The committee was appointed in 1859 (4 members from the Board of Trade, 4 from the Atlantic Telegraph Co.), reported to the government in April 1861 and published in July 1863; failures "have been due to causes which might have been guarded against" | PBS *American Experience*, "The Cable: Committee of Inquiry", https://www.pbs.org/wgbh/americanexperience/features/cable-committee-inquiry | OK (PBS is a public broadcaster; the primary 1861 Joint Committee report itself was not opened). Varley was a member. |
| 30 | Varley：最早找到给海底电缆"定位故障"的方法之一 | Varley's contribution was "first in finding a method of localising faults in submarine cables"; Varley 1828–1883; he reported on the 1858 Atlantic cable fault | University of Glasgow Library, Special Collections, Kelvin exhibition, "Cromwell Fleetwood Varley", https://www.gla.ac.uk/myglasgow/library/files/special/exhibns/Kelvin/varley.html | OK for wording close to the source. The page does **not** describe the method. "Varley loop" as a named test is confirmed only by the illustration caption "Varley's Loop Test using a differential galvanometer" in Moyle 2015 (row 32). |
| 31 | 电报工程师靠测电阻算出故障有多远 | Thomson's letter of 10 Oct 1859 describes fault-distance testing using positive and negative currents; Moyle: "These tests of resistance were key to the location of cable malfunction." | Glasgow page (row 30); Moyle 2015 p. 27 (row 32) | OK. **Contrast for the script:** loop tests *calculate* the distance from resistance; they are not halving. Use this only if the film wants "measuring" vs "searching". Do not call Varley's loop a bisection. |
| 32 | 海底电缆被剪开测故障、再接上，最后成了"补丁" | "where the cable had been cut to test the location of faults and interruptions, and re-spliced"; cables were "patchworks" with many joints. Repair voyages: "once per annum per 500 nautical miles of cable" | John T. B. Moyle, *The Telegraphic Life: Maintenance of the System 1850–1914*, PhD thesis, University of Leeds, 2015, White Rose eTheses, https://etheses.whiterose.ac.uk/id/eprint/31724/ (PDF p. 12, abstract) | OK. This is a peer-examined thesis without a DOI; cite it as a "Leeds PhD thesis". It shows that cutting and testing each way was real practice on cables. The thesis does not say they cut at the *midpoint*, so do not claim cable crews bisected. |
| 33 | 美国农村电网：分段开关把故障段隔开 | Sectionalizing devices are placed "to isolate faulted portions of the system from the rest of the system"; line switches "can be used to isolate the part of a circuit requiring repair" | USDA Rural Utilities Service, *Design Guide for Sectionalizing Distribution Lines*, RUS Bulletin 1724E-102, 2012, https://rd.usda.gov/sites/default/files/UEP_Bulletin_1724E-102.pdf | OK for "sectionalizing isolates the faulted section". The bulletin does **not** describe halving by trial switching, so do not claim it does. |

## F. Binary search is easy to get wrong

| # | Claim as it will appear on screen | Exact figure / wording in the source | Source (title, publisher, year, URL/DOI) | Note (estimate? disagreements?) |
|---|---|---|---|---|
| 34 | 连 Java 自带的二分查找都藏了 9 年的错 | "int mid = (low + high) / 2;" overflows for "arrays whose length (in elements) is 2^30 or greater"; the bug lay "in wait for nine years or so" | Joshua Bloch, "Extra, Extra – Read All About It: Nearly All Binary Searches and Mergesorts are Broken", Google Research Blog, 2 June 2006, https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/ | OK. This is a JDK library bug (author's own publication). Say "约9年". |
| 35 | 1946 年就有人发表二分查找，正确版本 1962 年才出现 | "the first binary search that works correctly for all values of n did not appear until 1962" (Bloch attributes this to Bentley) | Bloch 2006 (row 34), **secondary** | 估算/secondary: the primary (Knuth, TAOCP vol. 3; Bentley, *Programming Pearls*) is a book I could not open. The 1962 date is OK only as "据 Bentley". **1946 is UNVERIFIED**, so do not use it. |
| 36 | 只有约 10% 的职业程序员能写对二分查找 | Not found in any source opened | Bentley, "Programming Pearls: Writing correct programs", *CACM* 26(12), Dec 1983. Only the issue listing was opened (https://cacm.acm.org/issue/december-1983); it confirms the column exists, not the figure | **UNVERIFIED.** Do not use. |
| 37 | "Murray loop" 是另一种电缆故障定位法 | Only Wikipedia and edu-blogs found | Tried: web search; no museum, archive or paper opened | **UNVERIFIED.** Do not use. |
| 38 | 圣诞串灯一个灯泡坏、整串不亮 | No source opened | None | **UNVERIFIED.** Usable only as an illustrative, unclaimed picture (示意) with no factual claim. |

---

## Story-worthy

**5 most surprising facts**
1. Microsoft's own fix for a broken Windows PC is to halve the list: "the most efficient way to do this is to test
   half of them at a time" (row 25). This is the viewer's own situation, sourced officially.
2. A top Linux kernel developer runs a binary search on the kernel "roughly once a day"; best case "a ~15 step kernel
   bisection done in 20-30 minutes" (rows 15–16). 15 steps cover about 32 000 versions.
3. A US Army wireman with a broken line literally "proceed[s] to halfway", cuts the wire, cranks the field
   phone, and the side where "the operator answers" is the good side (rows 7–9).
4. Doubling the problem costs one extra check: 200 spans need 8 checks, 1 000 000 places need 20 (rows 2, 5).
5. The halving trick itself is easy to get wrong: Java's built-in binary search had a one-line overflow bug that
   lay "in wait for nine years or so" (row 34).

**Strongest human story:** the wireman of the US Army manual (rows 7–11), alone on a dead line. He walks to the
halfway point, cuts in, cranks the handset. Someone answers on one side and the other is silent, so he walks
half the remaining distance and repeats. Every test leaves a splice to retape. This matches the brief's
"一夜修好电话线" and is documented. The Victorian counterpart is real but less direct: cables "cut to test the location of
faults … and re-spliced" until they became "patchworks" (row 32).

**Best visual image:** a long line of poles across the screen. With each check, half of it greys out
(200 → 100 → 50 … → 1) and a counter ticks 1…8 beside a "一根根查: 200" counter that barely moves. Callback:
the same halving animation on a Windows services checklist (upper half ticked or unticked), and on a strip of
commits labelled "675 个版本 · 约10步".

## Risks

- **Sensitive topics:** low. Military source: present the Army wireman as a telephone repair procedure only,
  with no weapons and no combat. Show an illustrative 2D lineman, not a soldier in battle gear, or label him
  "通信兵" neutrally.
- **Maps:** the Atlantic cable story invites a map. If it is used, show only an ocean outline with two coastlines
  and **no national borders** (owner rule). Better: no map, a cable on the sea floor.
- **Real people:** Ingo Molnar, Linus Torvalds, Junio Hamano, Joshua Bloch, Cromwell Varley, Wildman Whitehouse.
  Quote them exactly with attribution, and draw no caricatures or likenesses of living people. Do not
  describe Whitehouse as "the man who destroyed the cable": the sources say the high currents were "ultimately
  blamed", and PBS cites the committee blaming "flawed science", so keep it impersonal ("电压过高，绝缘被击穿").
- **Brand/platform:** Microsoft/Windows, Java and Firefox names are factual references, fine with no logos.
  Avoid showing real Windows UI screenshots; draw a generic checklist. Do not show the Linux penguin, the Java
  logo or the Firefox logo.
- **Accuracy traps:** (a) 200 spans vs 201 poles (row 1); (b) "8 次" is worst case for 200 (row 2); (c) do not call
  Varley's loop test or cable cutting a "bisection" (rows 31–32); (d) the RUS bulletin does not prescribe halving
  (row 33); (e) the Army subcourse has no date, so do not add one; (f) the 1858 cable's lifespan varies by
  account, so say "几周".
- **Owner rule (textbook):** binary search is a textbook classic. The sources here (Army field manual,
  Microsoft support, kernel docs) let the film show the real situation without saying "课本".
