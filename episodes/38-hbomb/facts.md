# ep38 大海捞一颗氢弹 — facts (researched 2026-10-22)

| # | Fact | Source | Status |
|---|---|---|---|
| P1 | 17 Jan 1966: a B-52G collided with a KC-135 tanker while refuelling over the Spanish coast near Palomares; 7 airmen died. The B-52 carried **4** B28 hydrogen bombs: 3 came down on land near Palomares (the conventional explosives of 2 detonated on impact, scattering plutonium; no nuclear yield), the 4th fell into the Mediterranean. | USNI Proceedings June 1967 "Palomares — exercise in ocean engineering" [1]; Weintz [2]; WHOI [3] | ✓ |
| P2 | Fisherman **Francisco Simó Orts** saw a parachute carry an object into the sea at a specific spot; the search used his sighting. | Moody, *Faceplate* (NAVSEA) 2006 via [4]; UChicago Atomic Age [5] | ✓ |
| P3 | **John P. Craven** (Navy Special Projects Office) led the analysis with **Bayesian search**: probabilities for each grid square from the scenarios (did the chutes open, how it fell, the sighting), updated as squares were searched. | Moody 2006 [4]; Craven, *The Silent War* (2001); Weintz [2] | ✓ (keep the method general; no claim that the map alone found it) |
| P4 | DSV **Alvin** found the bomb mid-March 1966 at about **2,550 ft (~780 m)** on a steep canyon slope; it slipped away during the lift, was found again on 2 April, and was raised onto USS Petrel on **7 April 1966** — 80 days after the crash. | USNI 1967 [1]; UChicago [5]; WHOI [3] | ✓ (say "两个月后" / "近800米") |
| S1 | USS **Scorpion** (SSN-589), **99** men, lost about 22 May 1968 some 400 miles SW of the Azores, >3,000 m deep. | Congressional Record 23 Mar 1999 [6] | ✓ |
| S2 | Craven and Capt. Frank Andrews wrote loss scenarios; Henry (Tony) Richardson turned them into a probability map; Lawrence Stone advised aboard USNS **Mizar**. In **October 1968** (28 Oct) the wreck was found **within 200 yards of the highest-probability cell**. | INFORMS interview with L. D. Stone [7]; Richardson & Stone 1971, *Naval Research Logistics Quarterly* 18:141–157 [8]; [6] | ✓ ("不到200米": 200 yd = 183 m) |
| A1 | Air France **AF447**, Rio → Paris, lost 1 June 2009 over the Atlantic, **228** aboard. Last position 2.98°N 30.59°W; wreck assumed within 40 NM. | Stone et al. 2014, *Statistical Science* 29(1):69–80 [9] | ✓ |
| A2 | **Four searches failed over two years**: surface (June 2009), passive acoustic for the recorders' beacons (10 June – 10 July 2009, no pings), side-scan sonar (Aug 2009), side-scan sonar (Apr–May 2010). The acoustic search likely covered the spot where the wreck was later found. | [9]; MIT Technology Review 2014 [10] | ✓ |
| A3 | July 2010 the BEA asked Metron (Stone et al.) to re-analyse. Bayesian posterior over all four failed searches; key choice: allow that the **beacons may have failed** (P(one beacon survives) = 0.8; overall detection by the acoustic search ≈ 0.77). Report published 20 Jan 2011. | [9] | ✓ |
| A4 | The 2011 search found the wreck after **about one week** (located 3 April 2011), ~3,900 m deep, **near the centre** of the circle, in a high-probability area of the map. A recovered beacon was tested and **did not produce a signal**. | [9]; WHOI 2011 [11]; [10] | ✓ |
| B1 | The update after an unsuccessful look: new p(cell) = p(cell)·(1 − pd) / Σ p·(1 − pd). Worked example for the film (illustrative): A 40 %, B 35 %, C 25 %; search A with pd = 0.8, nothing → A 0.08/0.68 = **11.8 %**, B **51.5 %**, C **36.8 %**. | [9] eq. 4.1 | ✓ (label as 示意) |
| B2 | Optimal search (Koopman/Stone): look next where probability × chance of detection (per unit effort) is highest — not simply the most likely cell. | [7]; Stone, *Theory of Optimal Search* | ✓ (everyday phrasing only) |

## Sources
1. https://www.usni.org/magazines/proceedings/1967-06/professional-notes-notebook-and-progress
2. https://daxe.substack.com/p/how-to-find-a-missing-h-bomb
3. https://www.whoi.edu/?p=6831
4. https://en.wikipedia.org/wiki/1966_Palomares_accident (used only to locate: Moody, D. H. "40th Anniversary of Palomares", *Faceplate*, NAVSEA, Sept 2006; Melson, USNI Proceedings June 1967)
5. https://lucian.uchicago.edu/blogs/atomicage/2016/01/18/remembering-the-palomares-h-bomb-incident-via-history/
6. https://www.govinfo.gov/content/pkg/CREC-1999-03-23/html/CREC-1999-03-23-pt1-PgS3149.htm
7. https://www.informs.org/ORMS-Today/ORMS-Today-Current-Issue/Search-Theory-Search-research
8. https://ideas.repec.org/a/wly/navlog/v18y1971i2p141-157.html
9. https://arxiv.org/abs/1405.4720 (Stone, Keller, Kratzke & Strumpfer 2014)
10. https://www.technologyreview.com/2014/05/27/13283/how-statisticians-found-air-france-flight-447-two-years-after-it-crashed-into-atlantic/
11. https://www.whoi.edu/press-room/news-release/whoi-led-team-locates-air-france-wreckage
