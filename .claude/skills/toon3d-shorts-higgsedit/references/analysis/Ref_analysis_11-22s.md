# Segment 2 analysis: 11.0 s – 22.0 s (frames 330–660 @30 fps)

Frame numbers are absolute: frame n = n/30 s, so frame 330 = 11.000 s. I checked this against an exact `select=eq(n,330)` extraction (difference = 0).
Method: ffmpeg scene detection at threshold 0.1 (hits at 10.53, 18.27-18.43, 19.03-19.10, 19.77-19.83, 20.27-20.37 s, which are the iris moves, not cuts). I also made contact sheets at 6 fps, viewed every frame (30 fps tiles) around each event, measured the mean absolute frame difference per frame (whole frame and the top 180 px "sky" band) to get the camera speed curves, measured the iris circle by luminance scan, and sampled colours as 5×5 / 7×7 averages.
Working files: `f/NNNN.jpg` (all frames 326–664), `t*.jpg` (tiles), `g*.jpg` (colour grids with labels), `hat.jpg`, `faces.jpg`, `chalk.jpg`, `zt.jpg`.

The look overall: 3D toon environments with **ink outlines on the 3D geometry** (dark 2–3 px contour lines on buildings, crates, cars and the mirror frame, Freestyle-like). Painterly textures, soft daylight and saturated pastel colours. Characters are flat 2D vector shapes (white head, outline #22152c, a 2–3 tone fill, no cel shading on the body) composited on top with no visible cast shadows. There are no hard cuts in this segment. Every shot change is a **camera-driven transition**: zoom-through-mirror, dissolve, iris in/out, and an orbit.

---
## Shot list / timeline

| # | Frames | Time | Content | In | Out |
|---|---|---|---|---|---|
| A | (<330)–385 | –12.83 | Betting booth: Brown-vest guy + Teal guy seated on a bench in front of a window | (from seg1; camera is still easing out of a move, diff falling 19→1 over 327–335) | zoom-through into the hand mirror (366–395) |
| B | 386–395 | 12.87–13.17 | Mirror-transition overlap (mirror rim and the old shot fade while the mirror scales) | — | — |
| C | 386/396–466 | 13.2–15.53 | Street "fly-down": western/1910s main street, Model-T cars, hill with racetrack | zoom-through | cross-dissolve 456–466 (~10 f) |
| D | 457–546 | 15.23–18.2 | Farmer with a giant gilded mirror on an easel in a field: hat wave, push-in, orbit to behind-shoulder | dissolve | iris-in (binocular) 545–550 |
| E1 | 550–568 | 18.33–18.93 | Race seen through a circular iris (pan with horse) | iris in | iris out 568–573 |
| D2 | 573–591 | 19.1–19.7 | Back on the farmer (side/back view), head turn, chalk tally stroke #1 | iris out | iris in 591–595 |
| E2 | 595–606 | 19.83–20.2 | Race through iris, 2nd angle (horse at the finish post) | iris in | iris out 607–611 |
| D3 | 611–655 | 20.37–21.83 | Farmer: tally stroke #2, feed sack drops over the mirror, camera arcs to frontal, farmer slumps and sits | iris out | cross-dissolve starts 656 (next shot is a "RACE 5 WINNER 1-5" board with 3 characters; ~12 f dissolve, mostly in seg3) |

### Camera-speed data (mean |Δ| frame-to-frame, whole frame / sky band)
- 327→335: 18.9→1.2 (end of the previous move, ease-out). 336–365: 2–4 (near-static, very slow drift). 366: 5.9, 368: 16.9, 370: 29, 372: 41, 373–375: 47–49 (peak), 376–383: 35–45, 384–389: 32→19, 390–395: 12→6 (ease-out of the zoom-through).
- Street 396–402 ≈ 5.4, ramps 403→420 (6→12.7), constant 12–13 for 420–443, eases 444–452 (10.6→8.6), then the dissolve starts.
- Farmer wide 464–501: sky band = 0.0 (**camera locked**). 502–515: push ramps to 15, 516–523: decel to ~4 (a short hold at 519–523). 524–538: ~20 (**orbit**), 539–546: decel to 14.
- 573–591: ~1.3 sky (slow drift). 611–619: static. 620–653: arc move (4→21 at 629→13 at 648→1.1 at 655, ease-in-out). 656+: dissolve.

---
## SHOT A — Betting booth (330–385)

**Camera.** Frontal, eye-level at seated head height (~1.2 m), centred, zero roll. About 35 mm full-frame equivalent (mild perspective on the floor planks, vanishing point near the frame centre, y ≈ 0.42). Hold/slow creep 335–365 (scale change <2 %). Then from 366 a **push-in with a strong ease-in (accelerating, quadratic-to-exponential)** aimed at the hand mirror at screen (380, 540). The camera passes *between* the two heads: by 373 the heads fill 45 % of width each, by 376 they are cut off at the frame edges, and by 379–386 the characters are huge out-of-focus dark-outlined shapes (DOF blur ≈ 4–6 px) framing the mirror. From 379 the focus is locked on the mirror (rack focus from the characters to the mirror at ≈ 377–379). No motion-blur streaks: the motion is smooth with only slight blur at the peak, 373–375.

**Environment (build list).**
- Booth back wall = a window opening. Upper wooden beam (dark reddish-brown wood #734b28 / #7c5425) across the top 6 % of the frame. Under it, a painted plank wall in grey-lavender **#7e7183–#837a8d**, 6–14 % of height, weathered and chipped paint.
- Window frame: dark teal-green painted wood **#1d3b3b / #2a4647**, a 2×3 mullion grid (the top transom row is ~10 % of height, with vertical mullions at x ≈ 0.40 and 0.77). Left jamb ~6 % wide, plus a grey outer casing #9d97a5.
- Hanging sign "BETS / OPEN": a rounded rectangle of ~150×70 px at (90–215, 330–405), mustard/ochre wood #b89a57 with a dark brown border and serif text #4f3f28. It hangs on two thin wires from the transom.
- Window sill / counter: a yellow-ochre strip at y ≈ 0.53–0.56 (#c69f5f / #be9b40 family), then a grey sill board #9d97a5 with nail dots.
- Bench: back panel of dark walnut-brown planks #3d2120 / #8b644c (y 0.62–0.69). Seat cushion: a long thin mattress with **blue and white stripes**: blue #2f4297 / #424c8c, white stripe #dfe4f5, shaded underside #261a3c. Front rail of the bench is shadowed wood #40241a.
- Floor: wide planks running toward the camera, warm brown **#8d5d4f / #865f51**, darker plank #75544e, gaps/shadow #311b1d, with small nail-hole dots. Lighter at the front (a soft light pool), vignetted dark at the bottom-left.
- View through the window (a real 3D exterior, sharp at the start): sky **#75c0fa** (top pane) → #95d1fe → near-horizon haze **#bbeafe / #c6e8fb**; puffy white cloud #fafafe with a lilac shade. Green hill **#7fe48f / #97dc9c** with the racetrack grandstand on top. A left-side brick building with blue trim. A right-side two-storey wooden storefront in blue-grey **#a2aed7 / #8c99c6** with the sign "FURLONG SAVINGS & …" (dark sign band). A dirt street in the middle distance (the same street as Shot C, so the zoom-through is spatially continuous). Telegraph wires cross the upper left.

**Lighting.** Bright exterior / softer interior: the exterior runs ~1 stop hotter (pale sky). The interior is lit by a broad soft fill from the window (back) plus a frontal soft key (the characters are flat-lit). No hard shadows; ambient occlusion under the cushion and counter. Overall a slightly cool/violet shadow tint (shadows lean purple: #261a3c, #311b1d).

**Characters.**
1. **Brown guy** (left): head centre ≈ (190, 640), head diameter ≈ 220 px = **30.5 % of width**, with a slightly egg-shaped white head **#e2e8f6** (cool white; the shade side is a hair darker, #dce4f7). Thick outline #22152c (~6 px). Brown **bowler hat** with a dark band (crown #6a4a3a, dark brown with a highlight). Half-lidded skeptical eyes, one eyebrow raised. **Toothpick/cigarette** (cream #e8d8a8 with an outline) at the mouth corner. Purple shirt and purple tie #6a2fb0. **Mustard plaid vest** #ab8a31 / #be9b40 with purple check lines, an orange pocket square and 3 purple buttons. Rubber-hose legs in navy-purple #2f1b2c, ~14 px thick, dangling from the bench to the floor, crossed/bent at the knees. His right arm reaches across toward Teal and the hand gestures at Teal's chest (a dark mitten hand).
2. **Teal guy** (right): head centre ≈ (486, 660), diameter ≈ 190 px = **26 %**, slightly smaller and further back. Small **cream boater hat** with a brown band (#e1d3b9 / #8a5a3a). Smug half-lidded eyes and a small smirk. Body is a teal capsule **#66ddc8 / #6fdfc8**. **Red bowtie with white polka dots** #b02557. He holds a **small round gold hand-mirror** up at his right shoulder (centre (380, 540), Ø ≈ 45 px), shown as a gold ring + a gold disc base on a dark handle.

**Animation events (A).**
- Brown-guy lip-sync: mouth swaps on mixed 1s/2s. 330–336 closed smirk ("Wait,"). 337 small open, 338 open with tongue, 339 open, 340–341 closed, 342–343 open, 344–345 closed, 346 open, 347–348 wide grin/open, 349–350 small, 351–357 mostly closed, 358 open, **359–360 round "O"** ("going"), 361 closed, 362 wide flat, 363–364 closed, 365–366 open ("to do?"), 367+ closed. The **toothpick re-angles with every mouth shape** (±10–15°, a secondary motion pivoting at the mouth corner).
- Teal: static smug face. **Blink 369–370** (2 frames, eyes become closed arcs), open again at 371. Mirror held steady (no wobble).
- Brown: subtle eye squint at 369. The arm gesture is held.
- Both are drawn crisp and flat. At 379+ they are blurred by DOF, as if they were cards in 3D space (they scale with perspective at different rates, so they are layers at different depths: Brown is nearer).

---
## TRANSITION A→C — Zoom-through the hand mirror (366–395, 30 frames)

1. 366–378: the camera push described above. The mirror grows: Ø 45 px (366) → ~80 px (377) → ~240 px (381) → ~384 px (384) → ~600 px (388) → ~760 px (390) → >900 px (393). The centre drifts slightly from (380, 540) to (380, 510). The scale is **exponential** (roughly ×1.25 per frame at the peak).
2. Mirror build: a gold ring (rim thickness ≈ 9 % of the radius, gold #c69f5f with a darker inner bevel #8a6a30 and an ink outline) + a separate **elliptical gold base disc** below (ratio ~2.2:1, colour #b08a3a, highlight #e0bd60) on a dark stick handle. The glass interior shows a **reflection = sky #a1caec + green hill #78e675** (377–385).
3. 386–389: the content inside the ring is replaced by the **destination shot (street)**, scaled about 0.8× and centred, while the **entire outer old frame starts cross-fading to the full-frame destination**: at 388 the street is visible through the semi-transparent characters, and the rim + base are ~70 % opaque.
4. 390–395: the ring and base keep scaling (already larger than the frame) while their opacity fades **~60 % → 0 % over 6 frames** (390: rim clearly visible, 393: faint ghost, 395: almost gone, 396: clean).
→ To build it: render the destination shot under everything. Scale the old shot layer + the mirror layer around the mirror centre with an exponential ease-in. Mask the destination into the mirror circle until 386. Then fade the old layer opacity 1→0 over 386–392 and the mirror-rim layer opacity 1→0 over 388–395.

---
## SHOT C — Street fly-down (396–466)

**Camera.** Starts at **car-roof height (~1.8 m)**, looking straight down the street. The vanishing point is at (≈ 360, 450) and the horizon line is at y ≈ 0.36 (hill base). Lens is wide, about **24–28 mm** (strong convergence of the building fronts and the road ruts). Move: **dolly forward + crane up + tilt down**, all together with an ease-in-out (slow 396–402, accelerating 403–420, constant 420–443, easing 444–455). End framing (452): the camera is ~8–10 m high and tilted ~15° down. The street now runs from the bottom centre to the saloon at y ≈ 0.40, and the hill fills y 0.12–0.35 with sky above. Forward travel is roughly 12–20 m. DOF is deep, with only a mild softening of the far hill. No motion blur.

**Environment (build list).**
- **Road**: a wide dirt street (≈ 12 m), warm tan **#b88643 / #c68f4a / #d99b4b**, with many **wheel ruts** (parallel darker grooves #945f2e / #92692b, slightly wavy, converging) and light speckle noise (pebbles). The far road is a little cooler, #c79446.
- **Boardwalks** on both sides (raised wooden sidewalks, grey-brown #828678) with hitching posts and gas street lamps (black posts with white globes).
- **Left buildings** (front to back): a blue/teal clapboard building with a stepped parapet (#5567b1 / #6f8bd2, trim #3c4471). A **cream/yellow two-storey clapboard** building #ac9962 with a dark-red cornice. A long **white porch canopy on thin white posts** with a pale roof (#e8e0d8). A red/white striped awning. A **green-and-white striped awning** at the bottom-left (#6fa87e). Red-brick buildings beyond, with a dark-red gable/turret.
- **Right buildings**: a red-brick block. A tall vertical **"BIJOU" marquee sign** (magenta/crimson #64103b with cream letters, a pink box marquee #e070a0 underneath, bulb dots). Blue-grey storefronts. A **red/white striped awning** #d9948c with a cream canopy. Purple-red facades #7a476d / #774764.
- **End of the street**: "THE GILDED SPUR" saloon/livery: a red-brick front #9a7b7a / #9c6c78 with a wide barn door (an X-braced cream door), a dark sign band, cream serif lettering.
- **Telegraph poles** (wood #a28d63) with crossarms down the left side, plus a thick bundle of **wires** sagging across the top of the frame (#78aad7 against the sky). **12+ small grey-blue birds** sit on the top wire.
- **Hill**: a big smooth rounded mound filling the background. Bright grass **#76d95e / #83de61**, sunlit top #89e070, lighter rim. A dirt road curves across it (#c8b070). Round **deciduous trees** (#3b9055, dark green with light tops) at the base. On top: the racetrack/grandstand pavilion (small striped tents in red/blue/green/white, a dark steel **ferris-wheel / lattice tower**).
- **Vehicles**: 4–6 **Ford-Model-T-style cars** (black/dark-brown body #443940, grey roof #676468, cream windshield frame, spoked wheels, outline). One **white "MILK RUN DAIRY" box truck** (white sign panel, blue lettering, red wheels). The nearest car drives away from the camera and stays roughly the same size because the camera follows it (on 1s, smooth).
- **Sky**: top **#66aee9 / #6ab6f2** → mid #8ecbf9 / #96d2fe → horizon haze **#e2e2db / #ccc9ce** (a warm grey-white band behind the hill = aerial-perspective haze). Cumulus clouds pure white #e1dfea with lavender-grey undersides, upper right.

**Lighting.** Sunny late morning. Key light high, from the left/front-left: the right-hand facades are lit, the left facades are in soft shadow, and the shadows are soft and short. Shadow colour is cool blue-violet (#3c4471 on blue walls, #49414b under the cars). Strong sky ambient. The hill has a soft top highlight. No bloom.

**Animation in shot.** The cars drive forward (on 1s). **The birds on the wire take off ~418–426**: 2D flapping silhouettes rise up-left and fly across the hill (425: ~10 birds mid-air over the hill). Telegraph wires pass overhead as the camera rises. No characters.

**Transition C→D: cross-dissolve 456–466 (≈10 frames, linear).** At 460 it is ~50/50: the farmer, hat and mirror frame are ghosted over the street.

---
## SHOT D — Farmer and giant mirror, wide (457–546)

**Camera.** 464–501 **locked off** (sky diff = 0). Medium-wide, at **eye level of the character (~1.3 m)**, looking slightly up at the mirror. About 35 mm. **Shallow DOF**: the background (sky, haze clouds, patchwork fields) is strongly blurred (Gaussian ≈ 10–14 px at 720 w), the foreground grass blades at the bottom are blurred ≈ 6 px, and the mirror and farmer are sharp. 502–518: **push-in + slight arc right**, ease-in-out (mirror width 0.47 → 0.58 of frame). The background **sharpens** during 505–510 (DOF opens up / focus pulls toward infinity: clouds become crisp by 509). Short settle at 519–523. Then **524–546: a fast orbit ~70° to the left** around the farmer (camera ends behind-left of him, looking over his shoulder at the mirror). Constant speed 524–538, decel 539–546. The farmer drawing swaps to a **back/¾-back view at 530** (one-frame swap), and a **sun glint flare** (soft white disc, Ø ≈ 30 px, #ffffff at 80 %) slides across the mirror glass 531–534. During the orbit a **telegraph pole** with crossarm (grey wood #878690) and wires enters on the left (531–536), and a **wooden crate** comes into the bottom-left foreground.

**Environment (build list).**
- **Giant ornate mirror** (≈ 2.4 m tall × 1.4 m wide): a gilded frame with an arched, scalloped top crest with carved scrolls; the crest has a **dusty/cream patina** (#c5bc98 / #c4bba3) on its edges. Gold body **#be9b35 / #a68b40 / #98722b**, highlights #e0bd38, dark recess #7c5e15 / #8a6d2d. A punched-dot ornament line runs along the inner edge, with small rosettes at the corners. An arched engraved inscription **"THE GILDED SPUR"** (dark brown letters in a light band) and a **red oval "GS" medallion** #5b1519 / #c03030 at the top centre. The glass reflects a blurred sky-to-meadow gradient: top **#bfd8e3 / #c8e2e8** → bottom green **#a8d890**. Faint scratches and dust specks. Ink outline around the frame.
- **Easel**: an A-frame of 3 wooden legs (**#966c4b / #84502e**, satin wood) with the top peeking above the crest. A horizontal wooden **base tray/bench** (#a07040) the mirror sits on, extending forward/right (in 646 the farmer sits on it).
- **Small slate chalkboard** (≈ 0.45 × 0.35 m) hanging on the left side of the frame: slate **#26333e / #25313c**, a thin wooden frame #6a5030, a slightly chalky smudge texture.
- **Ground**: an olive-tan **dirt patch** (#a6903d / #af963d) with scattered **pale oval pebbles** (#d6c075) and dark grey pebbles, surrounded by tall **meadow grass** (#46b335 / #55b23f / #4cb039, blades with a lighter tip) with **wildflowers** (white daisies with yellow centres, purple, pink, orange). The **easel/mirror cast shadow** is a long soft olive-dark streak, **#655536 / #777133**, falling toward the right/back (key light from the front-left, mid-high).
- **Wooden crate** (bottom-left, ≈ 0.6 m): light pine planks **#bc7e34** on top, side face #96693f / #6f4736, dark seams, red stencil **"PRUITT / FARM APPLES"**.
- **Background**: a vast flat **patchwork farmland** to the horizon. Rectangles in greens/yellows **#aaea97, #cde09c, #e3d68d, #b2da9c, #63b17f**, with dark hedgerow lines and little round trees (#4a8a5a). Haze increases toward the horizon (fields → **#c2e3e2 / #c5e5e7**). A horizon band of hazy pale cyan.
- **Sky**: top **#73bbf5 / #78bcf3** → **#8ecdf8** → near horizon **#c8e4e7** (blurred). Large white cumulus (#d3d3e8 / #eeebf1). In the orbit section the sky is sharp, with clouds pure white with a pale blue-grey shade (#d4e9fd / #e8ecf7).

**Lighting.** Bright midday sun, warm. Key light from the front-left, ~45° up (shadows fall to the back-right). Soft-edged shadows. Strong sky fill (cool). The mirror gold has specular highlights. A glint flare at 531–534. Slight overall bloom on the sky/glass. Colours saturated and clean.

**Character — Farmer.**
- Head: a white circle **#f6f4f6** (in DOF frames the head reads cool #e9ecf8), outline ~5 px #1c1420. Ø ≈ 184 px = **25.5 % of width** in the wide shot (head centre (226, 580)). ≈ 120 px = 16.7 % in the orbit/side shot (540). ≈ 166 px = 23 % at 646.
- Face: round eyes with a dark pupil (wide/surprised), pink **blush ovals #e7a8b0** on the cheeks, a small smile with a tiny tongue.
- Hat: a **straw sun hat** with a wide brim, straw yellow **#ebc94e** with a woven texture line pattern, a **blue band #2865bf**, and a few loose straw tufts sticking up from the crown.
- Clothes: a **green long-sleeve shirt #65b76a / #40df33** (bright green when seen from the back). **Blue denim overalls #3773c1** with a bib pocket (dashed stitching), yellow buttons, and straps. Thin black hose legs (~10 px) with no feet/shoes (they taper).

**Animation events (D).**
- 457–462 (during the dissolve): the hat is on his head.
- **463: hat doffed in one frame**: lifted by the right hand to the upper right of the head (hat centre ≈ (430, 520)).
- **464–497 hat wave** (on 1s, a smooth sine): the hat rotates about its grip point between **~ –55° (brim tilted steeply down-right, hat lower/closer: 469–470, 481–483, 495–497)** and **~ –5…–10° (brim horizontal, hat raised and further out right: 474–478, 488–491)**. Period ≈ **13 frames** (peaks 470 → 483 → 496; flats 476 → 489). Arm swing amplitude ~40 px. Eyes stay wide and open; the mouth smiles.
- **498–500 hat back on the head**: 498 swung up over the head, 499 tilted ~20° landing, **500 seated**. 501–503 a small settle (1–2 px squash/rotation overshoot).
- Mouth flaps with the VO (2s).
- **509: eyes switch to happy closed "^ ^" arcs** with an open smile ("biggest mirror"), held to 529. At 530 the eyes open as he turns.
- 530–546: back view, standing looking at the mirror. **545: he lifts binoculars** to his face: no binocular prop is drawn. Instead a **small circle (Ø ≈ 100 px) of the race image appears right at his face** (≈ (440, 690)), which seeds the iris.

---
## IRIS / BINOCULAR TRANSITION (545–551 in, 568–573 out; again 591–595 in, 607–611 out)

- It is a **single circle mask** (not two-lobed binoculars) with a **thin gold/brass rim** (~4–5 px, #c8b060 / #795630, plus a dark inner line). Inside is the race shot. Outside, the scene is the same shot **darkened toward #110b19 (very dark violet-black)**.
- **Iris in, frames → circle Ø / centre / outside brightness:** 545: Ø ≈ 100 (440, 690), 100 %. 546: ≈ 180 (390, 680), 100 %. 547: ≈ 390 (420, 670), ~78 %. 548: ≈ 550 (395, 640), ~32 % (the dimmed farmer scene is visible, slightly blurred). 549: 718 (360, 617), ~12 %. **550: 830 (360, 603), solid dark #110b19**. **551→: 860 (360, 600) = 119 % of width, clipped left/right, top at y = 170, bottom at y = 1030** (final hold). Easing: fast ease-out, ~5 frames.
- Iris out mirrors it: 567 still 860. 568: 850. 569: 740 (centre y 614). 570: ≈ 530 at (384, 625), outside ~33 %. 571: ≈ 330 at (403, 660), ~85 %. 572: ≈ 150 at the face. **573: gone**. Ease-in, ~5 frames, collapsing back to the farmer's face position.
- 2nd pair: in at 591 (small at the face) → 592 (≈ 400, outside 60 %) → 593 (680) → 594 (830) → 595 (860, dark). Out at 607 (782) → 608 (≈ 450, outside 25 %) → 609 (≈ 280, 85 %) → 610 (≈ 120 at the face) → 611 gone.
- The circle centre path: from the farmer's face (~(440, 690) at 1/720 scale) to (360, 600).

## SHOT E — Race inside the iris (550–568, 595–606)

**Camera.** A side-on **tracking pan** with the lead horse (the horse stays ~x 0.25–0.4 and the background slides left). The grandstand moves ≈ **18 px/frame** (E1) and ≈ 25 px/frame (E2). Eye-level with the rail. Telephoto-ish, ~70 mm (flat perspective). Fully sharp.
**Environment (inside the circle, top→bottom):**
- A **speckled green hedge/canopy band** at the top (#5ca237 with light-green sparkle dots #a8e070, like sunlit leaves).
- A **grandstand roof**: a red/white **striped awning** (red **#d40d31 / #e00c2a**, white **#fae3cb / #f5cfb4**) with a scalloped valance. A gable centre with a yellow **round clock/emblem**, and a flag (blue #2a50a0) on a pole.
- A **triangular pennant bunting** string (blue #1b4654 / #2e5aa0, yellow #e0be33, red, white) under the roof.
- The **crowd**: rows of tiny 2D toon spectators (white heads, coloured bodies, top hats, boaters). Mid-tone mix ≈ #4f4f6d with lots of white heads (#f9e8cc).
- A **JUDGES booth**: a small white tower with a red/white striped conical cupola and a sign "JUDGES" in red.
- A **finish post**: a red/white candy-striped pole with a **round target disc** (red rings on white, Ø ≈ 70 px).
- Front row standing spectators behind the rail (top hats). A **white rail fence** (#e8e0d0 posts, shaded #cdaa89).
- **Dirt track** rust-orange **#c16028 / #b95829 / #9d4b2c** with darker hoof texture.
- **Infield grass** bright **#4ea71a / #49a520** with a darker edge vignette near the rim.
- **Horses**: chestnut **#c8603a / #d16e50** with a dark mane/tail, galloping cycle on 1s (≈ 8-frame gallop cycle). The jockey wears white/red silks (E1: white with red cap; E2 shows two horses: a lead chestnut with a red/white jockey, a trailing bay with a yellow/blue jockey).

---
## SHOT D2 / D3 — Farmer side view, chalk tally, sack (573–655)

**Camera.** 573–591: side/over-shoulder ¾ view of the farmer facing right toward the mirror. Very slow drift (push ~0.2 %/frame). Background sharp (deep DOF), telegraph pole centre-left behind him.
611–619: static. **620–653: arc ~35–40° clockwise + slight pull-back and lower**, ease-in-out, peak around 627–630. It ends on a more frontal view of the covered mirror with the farmer sitting at frame-left (646).

**Tally (chalkboard).** Board region ≈ (480–620, 720–860) in frame 580.
- **Stroke 1 (frames 580–582, 3-frame write-on, top→bottom)**: 580 a short dot at the top, 581 half length, 582 full. A white rounded chalk line **#f4f4f0**, ~8 px wide × ~60 px tall, slightly irregular edges. No hand or chalk is drawn: the stroke draws itself while the farmer looks at the camera.
- **Stroke 2 (frames 614–616, same 3-frame write-on)**, to the right of #1 with ~22 px spacing, giving "II". Board held to 627.

**Farmer animation.**
- 573–577: back view.
- **578: head snaps (1-frame swap) to a ¾-front view looking at the camera**: half-lidded **deadpan/unimpressed eyes**, a flat mouth, **blush** and some **freckle dots**. The body swaps to the overall-front drawing. Held through 585 (mouth flaps on 2s with "race, the favorite").
- **586: snaps back to the back view** (green back, no overalls front).
- 591: binoculars → iris.
- 611–627: ¾-front deadpan again, with the head slightly drooping and tilting down ~10° at 618–627.
- **Sack drop 627–640**: a large **burlap feed sack/tarp** falls from above frame-right and drapes over the whole mirror. 627–629 the top edge flops in from the upper right with its corner folded. 630–634 it slides down and unfurls with waves (cloth wobble). 635–638 it settles and hangs straight. 639–640 the final small sway. Build it as a cloth plane with a top-down reveal mask + a sine-wave displacement that decays (amplitude ~20 px → 0 over 12 frames). Material: **burlap cream #cabc9e / #d1c3a6**, lighter centre seam #b3a68e (a vertical stitched seam), a **patched square** #b7a888 with a darker outline, and a **faded red stencil "FURLONG FEED & SEED / No. 4 BUCK"** (#c08a7a, low contrast). Dark ink outline on the silhouette. Soft folds with AO in the creases. The easel top pokes out above it.
- **641–647: slump and sit**: the farmer slides down (an ~8-frame ease), knees bend to ~90°, and he sits on the easel's front crossbar with his elbows on his knees. The hat tilts and settles at 645–647. The face is a **blank half-lidded stare**, held. Small idle mouth flaps for "And by".
- 656+: cross-dissolve to the next shot (the "RACE 5 WINNER … 1-5" board).

**Environment additions in D2/D3**: a **wooden telegraph pole** with 2 crossarms, glass insulators and 5–6 wires sweeping to the upper-left (pole #878690 / #89858b grey-weathered wood, wires dark #333 against the sky). The far patchwork fields are sharp here (rows of trees, a road, a pond in blue). Sky **#6bb3eb → #87c1f4 → #a1d6fe → #b2defd → horizon #ddf1fc**. Clouds are fat cumulus, pure white #eeebf1 with grey-lilac shading (#d1d3e7). In the foreground: tall grass + yellow wildflowers (black-eyed-susan style) at the bottom right.

---
## Captions (whole segment)

- Font: white **#ffffff**, a heavy geometric sans (Montserrat ExtraBold/Black look), lowercase as spoken, with punctuation kept. A **thin black outline (~2 px) + a soft dark drop shadow offset (+2, +3) px**, blur ~3 px, ~70 % opacity.
- Size: ascender-to-baseline = **34 px** ("the racetrack" spans y 883–917), so the font size is ≈ **46–48 px at 720 w** (≈ 6.5 % of width). Centred at x = 360. **Baseline y ≈ 917 (71.6 % of height)**. Width examples: "the racetrack" 335 px, "Race" 121 px.
- Display: **one word (or short phrase) at a time, hard swap, no pop/scale/fade**. Stays put over all shots and transitions.
- Timings (frames): "Wait," –331 · "what's" 332–341 · "a mirror" 342–355 · "going" 356–362 · "to do?" 363–374 · "Well," 375–388 · "the racetrack" 389–409 · "is" 410–413 · "right" 414–422 · "over" 423–428 · "the" 429–431 · "hill" 432–437 · "from" 438–441 · "town," 442–453 · "and" 454–458 · "his buddy" 459–470 · "is up" 471–478 · "on" 479–482 · "that" 483–487 · "hill" 488–494 · "with" 495–497 · "the" 498–501 · "biggest" 502–516 · "mirror" 517–525 · "he could" 526–533 · "find." 534–547 · "Race" 548–559 · "after" 560–567 · "race," 568–580 · "the" 581–584 · "favorite" 585–597 · "wins" 598–610 · "and the" 611–618 · "hill" 619–626 · "stays" 627–637 · "dark." 638–649 · "And by" 650–658 · "the fifth," 659–.

---
## Effects summary
- Zoom-through mirror: exponential scale on the old layer + mirror, with the destination masked in the circle, then a cross-fade (detailed above).
- Cross-dissolves: 456–466 (10 f) and 656–~668 (~12 f), linear opacity.
- Iris in/out: a circle mask with a 4–5 px gold rim; the outside dims to #110b19 over 3–4 frames; Ø 100 → 860 px in ~6 frames, ease-out (in) / ease-in (out).
- Sun glint on the mirror glass: 531–534 (soft radial white sprite moving left → right).
- DOF: rack focus 377–379 (characters → mirror). Shot D background blur that clears 505–510. Foreground grass blur in the farm wide.
- Birds taking off from the wire (418–426), 2D flapping sprites.
- Cloth drop with a decaying wave (627–640).
- Chalk write-on strokes (3 f each).
- No speed lines, no film grain beyond light compression noise, no particles except the birds and the leaf-sparkle texture in the race canopy.

## Build notes for the GLSL/JSX engine
- Every 3D environment needs: an **ink outline pass** (depth/normal edge detection, 2–3 px, colour ~#2a1e2e), **soft sun + sky-dome ambient**, **height-based aerial haze** to a warm-grey horizon (#e2e2db for the street, #c8e4e7 for the farm), and **saturated albedo** with low-frequency painted noise (±6 % value) on wood, dirt and grass.
- Characters: flat fills, a single outline colour #22152c (A) / #1c1420 (farmer), no shading. Size them by the head-diameter percentages above. Stack them as depth-sorted cards so DOF blur can apply (A, 379+).
- Hat wave: rotate around the hand pivot, θ(t) = –30° + 25°·sin(2π(t–463)/13) plus a 40 px arc offset, on 1s.