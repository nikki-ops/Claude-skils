# SEG3 — 22.0 s – 33.0 s (frames F = t·30, file f/NNNN.jpg = frame NNNN; 660 = 22.00 s, 990 = 33.00 s)

Method: ffmpeg scene score (thr 0.1 → only 1 hit at 21.53 = the dissolve start; everything else is camera moves/dissolves), 10 fps contact sheets, every frame 655–1000 viewed in 30-frame tiles, ORB/phase-correlation camera tracking, pixel sampling. Working files: `analysis/seg3/` (T_*.jpg tiles, f/ frames, faceA/B/C, horse*.jpg, jock.jpg, walk.jpg, cap.jpg).

## 0. Shot list (no hard cuts in the segment)
| # | Frames | Time | Content | In | Out |
|---|---|---|---|---|---|
| S0 tail | –658 | –21.93 | Farm field: straw-hat guy sitting on bench under a blank cloth billboard (prev segment) | – | dissolve |
| S1 | 658–822 (full opacity 666–817) | 21.93–27.40 | Betting-room interior. One continuous camera: slow push → lateral truck right → push-in → hold on two characters at window | **cross-dissolve 8 fr** (658 ≈10 %, 662 ≈50 %, 666 = 100 %), linear | cross-dissolve to S2 |
| S2 | 818–990+ (full 826–) | 27.27–33+ | Race track "HILLSIDE DOWNS". One continuous camera: tracking shot alongside the favourite → yaw/pull back → fast forward fly along the track to horse #9 at the parking lot | **cross-dissolve 8 fr** (818 start, 822 ≈50 %, 826 = 100 %), linear, no blur | continues past 33.0 s |

Dissolves are plain opacity cross-fades (both images move during the fade — camera keeps moving in the outgoing and incoming shot; no flash, no zoom-blur).

## 1. S1 — Betting room (21.93–27.40)

### 1a. Camera (measured with ORB affine, full-res px at 720×1280)
| Frames | Move | Numbers | Ease |
|---|---|---|---|
| 658–706 | very slow dolly-in on the barrel table group | scale ×1.050 (667→686) + ×1.027 (686→706) ≈ +7.7 % in 1.3 s, drift tx −52 px, ty −43 px (frame content drifts up-left = camera pushes slightly toward board/right-down) | linear |
| 707–736 | **lateral truck right** (true parallax: barrel/foreground pass faster than board) + continued push | per-frame x-speed (phase-corr): 4,4,8,8,16,16,24,28,24,28,…,32,36,32,28,28,28,24,24,20,16,12,8,8,4,4,4 px/fr → total ≈ 640 px (≈0.9 frame widths); scale ×1.09 (706→716), ×1.07 (716→726), ×1.07 (726→740); slight roll wobble ±1.5–3° | ease-in-out (sine), peak at 718–722 |
| 741–764 | **push-in (dolly) onto the two characters at the window** | scale ×1.13 (740→752) × 1.29 (752→766) ≈ ×1.46 total; image content moves up (ty −4…−12 px/fr) = camera dollies forward and slightly down | ease-in-out, peak 748–754 |
| 765–817 | near-hold, slow creep | ×1.023 (766→790), ×1.003 (790→816) | ease-out to stop |

Lens: ~35 mm-equivalent (moderate perspective on the board and floor planks); camera height ≈ character chest height (≈1.1–1.3 m in a world where characters are ≈1.7 m), slight downward tilt (~8–10°) at start (floor visible to bottom), almost level at the window. DOF: shallow-ish — characters sharp; board slightly soft; street outside the window soft (f/2.8 look); foreground floor slips at bottom slightly soft.

### 1b. Environment (build list, world units metres, camera looks toward +Z, X right)
**Room A (frames 658–715): corner of the betting hall**
- Left wall: plaster painted dusty pink, `#d68e79` average, lit `#f0a98f`, shadowed top `#290718`→`#5a2a35`; subtle stipple noise texture. Plane at x≈−2.5, rotated ~40° toward camera.
- Ceiling: dark coffered wood/plaster `#212733`–`#49414e`, cream crown moulding strip along wall/ceiling join.
- **Big odds board** (rounded box 4.0 w × 2.6 h × 0.08 d, bottom at y≈1.3, z≈4): slate/chalkboard `#1f2334`, gold wood frame `#d7b475` (frame width ~0.08), header strip: “RACE” gold serif caps + white square tile with black “5” + “WINNERS” gold caps (gold `#dfb476`, letters western slab-serif). Rows: three cream plaques `#e2cbb8` (rounded rect 1.2×0.28, black border) each with a black number box and black slab-serif horse name: “1 HIGH HAT”, “2 BEE’S KNEES”, “3 WHOOPEE”, (4th row hidden behind characters); chalk-written odds to the right in large hand-drawn chalk `#d0c1b8`: “1 – 5”, “4 – 1”, “6 – 1”. A second board panel to the right (dark, gold frame) with “9 MILK RUN 100 – 1” revealed during the truck (frames 714–730; plaque cream with black “9”).
- Right side: tall window with teal/green paint `#566854` and bright exterior.
- **Barrel table**: wooden cask Ø0.55 m, h 0.9 m (cylinder with bulge = SDF capped cylinder + radius modulated by sin(y)), staves `#a55626`/`#db7824` with dark seams, 3 iron hoops `#503018`; round tabletop Ø0.9 m, 0.05 thick, plank seams, warm yellow-orange highlight `#fccb57`; on top: scattered poker-chip-like white discs (betting tokens) and a small chalk sign.
- **Small chalkboard on table** (2D-ish prop, 0.35×0.25 m, green-black `#303d3d`, wooden frame): “WILL HE BET? / YES 50-1 / NO 1-50” in white chalk.
- **Floor**: wooden planks under a carpet of **discarded betting slips** — hundreds of small rectangles (cream `#d8c4a8`, some pink/teal/green/yellow ~10 %), random rotation, overlapping; base tone `#6f5547`, in sun `#8f745c`→`#f5e999`. Build as a plane with a Voronoi/rect-scatter texture (2D noise of small rotated rects, 3 size octaves).
**Room B (715–817): window bay to the right**
- Same board continues above (bottom edge of “100–1” chalk visible at top 0–60 px), a red trim band `#34031a` / dark `#12111d` under it.
- Big shopfront window: frame painted dark green `#313f2d` (mullions 0.08 m), transom of 2 frosted panes `#daeaff` (overexposed), main pane opening onto the street; cream window sill `#deb564` (box 3.0×0.06×0.25); below: vertical wood panelling `#724532` (planks 0.12 m, darker grooves).
- Window seat/bench: wooden box `#663a2e` with a striped ticking cushion (blue-violet stripes `#7f7b9c` on cream `#d7c8c0`, stripes running along the bench, soft rounded box).
- Floor: varnished planks running toward camera, `#7a4433` with strong sun stripes `#f5eca6`.
- **Street through the window = painted matte card** (a flat textured quad ~6 m behind the glass, slightly blurred): main street receding to a green hill `#6ba36d` with a dirt path, two trees on top, telegraph poles + many power lines (thin dark lines converging left), left: blue/purple timber buildings, “WESTERN UNION” blue sign, brass street lamp; centre: red-brick “THE GILDED SPUR” saloon `#815976` (pink-brick in grade); right: yellow building `#efcf34`, red-brick facades, vertical theatre sign “BIJOU” (red/pink with bulbs), US flag; “MILK RUN” billboard sign with a tiny pale figure, tiny distant people; street asphalt `#4d4850`. Hazy sky `#daeaff`.

### 1c. Lighting S1
- Key: hard warm sunlight entering from the upper-left (a window out of frame left), ~45° down, coming toward camera slightly. Visible as **volumetric light shafts** — a broad bright diagonal band across the board from upper-left to lower-right (warm white `#fff1d0`, additive 25–40 %), with a thin dark diagonal line (shadow of a rope/mullion) through it. Floor gets hard-edged sun patches (`#f5e999`), with window-mullion shadows → do this as a projected “gobo” mask on floor & wall.
- Fill: low, warm-magenta ambient (shadows go plum/purple: `#290718`, `#3c2c35`), shadow colour never grey.
- Bounce: orange from wood floor onto the barrel underside.
- Bloom: strong on the sun patches and the window glass (glow radius ~20 px, threshold ~0.8).
- Atmosphere: dusty haze (+8 % lift in mids, warm), slight vignette (~15 % at corners). Grade: warm, saturated, contrasty.

### 1d. Characters S1 (2D vector, brush outline `#3c2c35`/near-black plum, 5–7 px at 720 w, slightly variable width; heads off-white with lavender shading; limbs single 6–7 px dark lines)
Head diameter % of frame width (frame 680): Old man 27 %, Cap guy 21 %, Flapper 15 % (further back), Bowler guy 24 %. At the window (frame 790): Bowler 37.5 %, Green guy 35 %.

1. **Old man (left, x≈15 %)** — round lavender-white head `#d8d8f3` with grey-blue shading crescent on left (`#b8b8e0`), small round wire glasses, grey moustache, open smiling mouth; powder-blue suit `#7a81b0` with gold buttons, white collar & thin tie; stick legs `#231623`. Animation: talks/laughs constantly 667–713 — mouth open shapes alternate every 2–4 fr; big laugh 690–702: head tips back & sways left (head x −40 px, rotate −10°), torso leans, mouth wide “D”; returns 703. Holds on poses for 3–6 frames (pose-to-pose with small per-frame jitter).
2. **Cap guy (behind, left of barrel)** — flat cap brown `#845636`, orange-rust waistcoat `#b54b33` over black shirt, moustache, stern; small head turns and eye changes (frames 669, 675, 683, 700, 707).
3. **Flapper woman (behind barrel)** — red/crimson headband `#60103a`–`#c42050` with white feather, red bob hair `#791c1c`, sleepy half-lidded eyes, lipstick; mostly hold, eye-blink/side-glance 681, 693, 701.
4. **Bowler guy (right)** — brown bowler `#533535`, yellow-ochre windowpane-check jacket (`#b67a33` base, purple `#7029c7` check lines), purple tie, orange pocket square, cigarette (cream stick `#d6c9bb` with ember tip) in mouth corner, smug half-lidded eyes. In 667–706: smirk holds, eye-roll/brow changes ~every 6–8 fr, eyes go wide circles at 711–713 ("whether"). **Walk** 712–750: walks right with the truck, bouncy rubber-hose walk, step ≈ every 6 fr (contact 714, 720, 726, 732, 738, 744), body bob ±8 px, arms swing small; stops at 750 beside green guy. Talking 745–805: mouth shapes per frame — closed smirk 745–767, OPEN wide (red interior + tongue) 768–770, closed 771–778, small open 779, closed 780–785, OPEN wide 786–788, closed 789–792, open 793, closed 794–805, cigarette bobs with jaw (±4°). Arm: raises right hand with a round gold **pocket mirror/compact** `#715023`–`#7f5b2b` (Ø0.12 head) up near his cheek 757–771 (arm arcs up from hip in 6 fr: 751–757), lowers it to chest at 772 and holds; brief eye-close blink 735–737 and 796–797 (2 fr each).
5. **Green guy (seated on window bench, x≈65 %)** — mint body `#87e9bb` (sack/peanut shape, no visible arms except stick hands), red bow tie `#c71e4d` with white polka dots and darker red knot, small brown boater-like hat with tan band `#582c2d`/`#c9a07a`, smug half-lidded eyes, little smile. Holds a **pretzel** `#c08040` in his screen-right hand: lifts it 733–760 (hand up near shoulder), lowers at ~771. Sits with knees bent (legs as two bent lines). **Shock pop at frame 807 (hard switch, 0 inbetweens)**: eyes become big round white circles with black dot pupils, brows up, mouth a wide clenched-teeth grimace (white teeth grid, 7–8 vertical lines); held 807–822 into the dissolve.
- Timing: characters are **pose-to-pose with holds** (green-guy region diff spikes at 776, 784, 791, 797, 799 then ~0 between → holds 6–8 fr); mouths/heads of speaking characters change on 1s/2s mixed. Small constant "breathing" drift (1–2 px) every frame.
- Integration: characters are flat (no 3D shading), but a soft dark contact shadow ellipse under feet (plum `#2a1a24`, 40 % alpha, blurred), and global grade/haze laid over them (they get the same warm tint, light shafts pass OVER them — additive shaft layer above characters). No cast shadows on walls.

## 2. S2 — Hillside Downs race (27.27–33+)

### 2a. Camera
| Frames | Move | Notes |
|---|---|---|
| 818–845 | tracking truck right, low (≈1.3 m), parallel to the rail at ~8 m from it, lens ~35–40 mm, slight up-tilt (+3°) | horse enters from left edge (826) and catches up to frame centre by ~845 (horse faster than camera, then camera matches speed) |
| 845–895 | locked-speed tracking: horse stays centred (x≈45 %, belly at y≈62 %); camera slowly **yaws right** (~15–20° over 50 fr) so the grandstand begins to recede in perspective to the right; slight handheld-like bob | ease linear |
| 896–916 | continued tracking + yaw right more (sign “HILLSIDE DOWNS” now rising strongly to the right, ~15° in frame); horse slowly drifts left in frame | |
| 917–960 | camera **rises & falls behind** (horse shrinks: ×0.72 per 20 fr, ×0.80 per 10 fr), yaw continues to look down the track; horse exits frame right at ~955–958 | ease-in |
| 958–990+ | **fast forward fly** down the track, low (≈1–1.5 m above dirt), centre of track, looking along track to the far turn; scale ×1.84 / ×2.0 / ×2.1 per 10 fr (exponential approach), very strong motion blur on near dirt; slight yaw left 960–975 then straight; ends looking at poplars + parking at the turn | ease-in then constant high speed |
DOF: grandstand and horse sharp; far scenery soft-ish; near dirt heavily motion-blurred (directional streaks).

### 2b. Environment (3D, cartoon)
- **Sky**: gradient `#4585f3` (top) → `#7fb8fb` (low) → horizon haze `#e5e1e7`; a few puffy white cumulus `#f8f5ee` (sphere-cluster clouds, soft).
- **Hill behind stands**: green dome `#6cbc4a`-ish with lollipop trees (sphere canopy on cylinder trunk).
- **Grandstand** (long box ~60 m × 8 m h, opens to track): striped awning roof red `#e64e61` / white `#f09a9c→#fdf4e1` vertical stripes, scalloped valance (alternating red/white half-discs) along the front edge; gable end with red/white stripe triangle + green pennant flag on pole `#2fb16e`; **green sign board** `#307a45` with gold-yellow serif caps “HILLSIDE DOWNS” `#f5d048` (dark red outline) and a red/yellow sunburst emblem; black horse **weathervane** on top; interior back wall dark teal `#2d5158`; thin white posts every ~6 m; strings of **bunting** (triangular flags red, white, blue `#4062aa`, yellow `#ebcc48`) under the roof; tiered **crowd** of hundreds of 2D toon heads (white heads with hats/boaters, ~3 % fw each, varied clothing colours) — use instanced billboard sprites with per-instance hat/colour; cream lower wall `#fdf4e1` with a green kick strip.
- **Rail** (inner and outer): white posts + two rails `#e8e4dc` (warm shade `#d9b689`), posts every ~2.5 m.
- **Rail spectators**: standing toon people behind the rail (boaters, top hats, bowler) ~5–6 % fw head; one **mom** (pink dress, flowered sun hat, crying, waving handkerchief) beside a white banner on the rail “THAT’S MY BOY! ♥” (red hand lettering `#d02040`). Visible 905–935.
- **Track**: red-orange clay `#b24e22` (near `#af4820`, mid `#c66127`, far `#c36139`), noise texture of hoof prints and small dark pits, raked lines; strong motion blur when camera is fast. Infield: bright green grass `#53b530`.
- **Far turn (980–990+) — painterly matte**: row of tall **poplar trees** (stacked-sphere columns, green `#458257`/`#539c56` with lighter top lights), rolling pastel hills `#b8bce2`, yellow field strips `#cebe8a`, sky pale `#d9d5d2`; **PARKING 10¢ →** sign (white board red text `#db5f68` on post); row of 1920s cars (boxy, red `#944368`, teal, olive, dark navy) ; grey/white horse #9 standing with tiny jockey near the sign.
- Far left at 960–976: the rest of the field (5–6 small horses) far ahead in a **dust cloud** `#cfc288` trailing to the right.

### 2c. Lighting S2
- Key: bright warm sun from camera-right/front, elevation ~35–40°, hard shadows; horse shadow `#6c3c30` cast toward upper-left on the dirt (long, ~1.5× horse length). Sky fill blue on top surfaces; rail and stand whites slightly warm. Bloom moderate on white awning/cream wall. Slight haze toward horizon (aerial perspective: far objects desaturate toward `#e5e1e7`).

### 2d. Horse + jockey
- **Horse = real 3D rigged model** (bay: coat `#9d3213`/`#a43110`, dark shading `#24161d`, black mane/tail, black lower legs, white fetlock bands/hooves), cel-ish shading with a dark outline-ish rim; animated **on 1s** (every frame unique), **gallop cycle ≈ 13 frames (0.43 s)**: extended (front forward, hind back) at 860, gathered 863–865, front reach 866–869, extended again 873. Body bob ±10 px, head nod in phase. White saddle cloth with red border and red number “4”.
- **Jockey = 2D toon** (white round head with red/white quartered cap, red silks `#e74269`, white breeches), parented to the horse with the bob. **Wave**: arm raises 903–905, hand waves left-right 906–920 (≈4-frame swings), facing camera/crowd.
- **Particles**: small dirt clods/dust puffs kicked behind hooves (soft beige-white blurred blobs ~12–20 px, fade in 6–8 fr), dust plume behind the far pack (big soft cloud, `#cfc288`, alpha 70 %, expands rightwards).
- Motion blur: horse legs slight; track dirt foreground strong (horizontal streaks 845–940, radial/forward streaks 960–990).

## 3. Captions (whole segment)
- Font: heavy geometric sans, **Montserrat ExtraBold/Black**-like, lowercase as spoken (capitalised at sentence start), white `#ffffff` fill, **black outline ~3 px + hard black drop shadow ~3 px down-right** (no blur).
- Size: ascender height 36 px (y 881→917) ⇒ font-size ≈ 49 px at 720 w (≈ 73 px at 1080 w). Baseline y = 917 px (71.6 % of height), descenders to 925. Centred x = 360. No pop/scale/fade animation — hard on/off cuts, 1–2 words per card.
- Timings (frames inclusive): “the fifth,” 660–675 · “the” 676–681 · “regulars” 682–694 · “are” 695–697 · “betting” 698–705 · “on” 706–709 · “whether” 710–717 · “he’ll” 718–723 · “ever” 724–734 · “bet.” 735–744 · “Hey,” 745–755 · “mirror man.” 756–775 · “Maybe” 776–783 · “try” 784–790 · “wiping it.” 791–808 · “In the” 809–815 · “last” 816–824 · “race,” 825–835 · “the” 836–838 · “favorite’s” 839–851 · “so far” 852–869 · “ahead” 870–880 · “it’s” 881–886 · “Jockey” 887–899 · “is” 900–902 · “waving” 903–912 · “to his” 913–920 · “mom.” 921–933 · “and horse” 934–944 · “nine” 945–955 · “is so” 956–969 · “far” 970–976 · “behind,” 977–989 · “it’s” 990–994 · “practically” 995–…

## 4. Colour palette quick list
S1: wall `#d68e79`/`#f0a98f`, ceiling `#212733`, board slate `#1f2334`, gold frame `#d7b475`, plaque `#e2cbb8`, chalk `#d0c1b8`, barrel `#a55626`, hoop `#503018`, tabletop hi `#fccb57`, slips floor `#6f5547`, sun patch `#f5e999`, floor dark `#7a4433`, window green `#313f2d`, sill `#deb564`, panelling `#724532`, cushion `#7f7b9c`/`#d7c8c0`, outside sky `#daeaff`, hill `#6ba36d`, outline `#3c2c35`, head `#f0e9f8`/`#d8d8f3`, blue suit `#7a81b0`, waistcoat `#b54b33`, check jacket `#b67a33` + `#7029c7`, green body `#87e9bb`, bowtie `#c71e4d`.
S2: sky `#4585f3`→`#7fb8fb`, cloud `#f8f5ee`, awning red `#e64e61`, cream `#fdf4e1`, sign green `#307a45`, letters `#f5d048`, stand interior `#2d5158`, bunting `#4062aa`/`#ebcc48`/red/white, track `#b24e22`, horse `#9d3213`, jockey `#e74269`, shadow `#6c3c30`, infield `#53b530`, dust `#cfc288`, poplars `#458257`, far hills `#b8bce2`, haze `#e5e1e7`.