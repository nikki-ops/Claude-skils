# SEG5 — 44.0–54.0 s (f1320–f1620 @30fps; frame = round(t*30), absolute)

Method: ffmpeg scene detection (thr 0.1 + 0.04 score dump), 10 fps contact sheets (cs10_*.jpg), 30 fps tiles 150x266 at every transition (t30_*.jpg, every frame 1320–1649 inspected), full-res stills full_*.png, pixel sampling (pal.py), per-frame mean-abs-diff as camera-speed proxy. Detector hits (abs): 47.20–47.60 (fast crane, not a cut), **48.833 = f1465 hard cut (score 0.348, the ONLY hard cut)**, 54.33–54.37 (next segment). All other transitions are dissolves or continuous camera moves.

## 0. Shot map (summary)
| # | frames | time | content | in | out |
|---|---|---|---|---|---|
| S1 | ≤1320–1403 | ≤44.00–46.77 | Milk cart crossing FINISH line, main street (day) | (prev seg) | dissolve f1397–1404 (8 fr) |
| S2a | 1397–1415 | 46.57–47.17 | Racetrack, horses passing finish post | dissolve | continuous |
| S2b | 1415–1429 | 47.17–47.63 | Fast crane-up/push to JUDGES booth (foreground horse wipe f1416–1418) | continuous | continuous |
| S2c | 1429–1447 | 47.63–48.23 | Judge close-up; telegraph spark; tilt up the wire | — | dissolve f1441–1447 (≈6–7 fr) with tilt-up |
| S3 | 1442–1464 | 48.07–48.80 | Dusk main street fly-through along telegraph wires | dissolve | HARD CUT f1464→1465 |
| S4 | 1465–1586 | 48.83–52.87 | ONE continuous move inside betting parlour: window → door jamb wipe → telegraph corner → push to desk → pan right across chalkboard → truck right to 2 characters | hard cut (motion-masked) | dissolve f1578–1587 (≈10 fr) |
| S5 | 1578–1620+ | 52.60–54.0+ | Sunset meadow, farmer at telescope; accelerating push into the lens (lens zoom-through f1620–1631 continues into seg6: lens image becomes racetrack w/ horse #9) | dissolve | lens zoom-through (f1626–1631) |

Overall rhythm: shot length 0.6–4 s; camera NEVER static more than ~4 frames; every join is either a dissolve during movement, a foreground wipe (horse, door jamb), a motivated move following the telegraph pulse, or a "through the lens" zoom. Story device: **a glowing telegraph pulse travels judge's key → wire → street wires → parlour wire → sounder**, and the camera follows it — this is what stitches S2c→S3→S4.

---

## S1 Milk cart at FINISH (≤f1320 – f1403)
**Camera**: low (≈1.2 m eye, ~0.8 m above road scale-wise: horizon at y≈0.47 H), lens ≈ 28–32 mm equiv (strong street perspective converging to vp at x≈0.85 W, y≈0.45 H), slight roll 0°. Trucks right-to-left? No: camera stays locked to the cart which moves left→right/away diagonally toward the vanishing point; camera dollies forward following. Speed proxy (mean frame diff): f1321–1352 ≈5–7 (slow, cart small ~30% W), f1353–1381 ramps to 21 (peak f1381 = 46.03 s), then ease-out to 6 by f1398. => ease-in-out push-in from medium-wide (cart ≈30% W at f1320) to tight (cart panel fills left 50% W, horse at x≈0.5 at f1390) over f1350–1395 (1.5 s, easeInOutCubic). Camera also yaws ~10° right so the FINISH banner rises/exits top. Background buildings slide left (parallax).
**DOF**: moderate; far end of street slightly soft (blur ~2 px@720), foreground road crisp with pebble texture.
**Environment (SDF build)**:
- Ground plane: packed dirt, base #7f6146, mid #856b4b, lighter speckle pebbles (#a18569, ellipses 3–8 px), dark wheel ruts converging to vp (#69584c), cool shadow #47373e. Noise: fbm low-freq colour variation + sparse pebble voronoi.
- Left building row (boxes): red brick facades #c15b2e/#8d563c with cream cornices #ffdaac, false fronts with arched pediment ("…MERCANTILE" sign, gold letters on dark green #162234 band), teal-blue awnings, shop windows dark #2f2b3e; "SNIP'S BARBER SHOP" (cream sign red letters), "TELEGRAPH OFFICE" blue sign, distant yellow/green/blue facades fading to haze #727f8b.
- Boardwalk + white rail; crowd of 20–30 toon spectators (2D cards, white heads ≈3% W, hats, coloured coats) along rail, receding.
- Telephone/telegraph wires: 6–8 thin dark lines from top-left diagonally (catenary) — part of the wire motif.
- FINISH banner: long horizontal band spanning street at y≈0.27 H, black #0c0f1c with checkered top and bottom edges (squares ≈5% W, white squares shaded lavender #afb9ee/#a7b2e0 on underside), centre text "FINISH" white bold serif (slab), tilted with perspective (rises to right). Hung from poles; strings of triangular bunting red/white/blue under it.
- Right side: "DAIRY DAY" banner (blue on white) at x≈0.8–1.0, y≈0.34; bunting.
- Prop: small orange-red wooden crate #9f492b/#b2440e at road right (x≈0.82 W, y≈0.69 H) with a milk bottle (white, blue cap) on top — sits in foreground, crisp.
- Sky: gradient top #61a4f0 → horizon #b8d8ff; cumulus "popcorn" clouds (clusters of 5–7 spheres, white #ffffff top, lavender shade #d1cfe2), at y 0.05–0.13.
**Lighting**: sun high-left/behind-left (key from upper-left-back), warm white #fff4e0, soft shadows cast to camera-right/forward (cart shadow purple-brown #47373e, penumbra ~6 px). Fill: sky blue ambient (shadow sides of buildings bluish). No rim. Slight warm bounce from ground. Exposure bright, saturated.
**Milk cart** (3D or 2.5D, build as boxes/cylinders): body royal navy #10297b with lighter blue trim, cream side panel #e1dcc0 with red bold slab text "MILK RUN DAIRY" (red #c21f1f), red trim; load of milk crates/bottles (red-brown tray, white bottles with red caps) on top; 4 spoked wheels: red rims #962619/#c8281e with yellow hubs #ffbd42, 12 spokes; front wheels smaller. Shafts to horse.
**Horse**: white/cream #fff0d4 toon horse (2D vector, thick dark outline, brown harness/collar), galloping in place relative to cart, legs cycle ≈ 8–10 frames per stride, body bob ±2% H. Dust plume behind/under hooves: tan #f0c39c / #b7926f, soft volumetric puffs (stacked blurred circles, alpha 0.6→0, elongated backwards along travel, length ≈ 25% W), regenerated each stride.
**Captions** (S1): "it was" ≤1320–1323, "pulling" 1324–1337, "the" 1338–1340, "milk" 1341–1346, "cart." 1347–1358, "You" 1359–1361, "see," 1362–1370, "back" 1371–1379, "then," 1380–1392, "betting" 1393–1401.

## S1→S2 Dissolve f1397–1404 (8 frames, linear opacity)
Racetrack fades in while S1 is still pushing (S1 nearly at rest, md≈6). 1399–1402 clear double exposure (target post appears over horse). S2 clean at f1404.

## S2a Racetrack (f1404–1415)
**Camera**: low, track-level (~1 m), lens ≈ 35–40 mm, slight slow drift right/forward (md 5–8), horizon at y≈0.42.
**Environment**:
- Background is a painted-looking set: big rounded green hill (#69a03c lit, #5c9c44 shade, darker stroke texture) occupying y 0.22–0.40 with 5–6 lollipop trees (sphere canopies #3e7a2a, brown trunks), small flags on poles (green, blue, red pennants). Sky #3f7ee8 → #6ca5ff, slight blocky texture (painterly), white cumulus #fae9ce shaded.
- Grandstand: long roof of red/white candy stripe awning (#eb1820 / white, scalloped valance), dense crowd of white-head toon spectators (tiny, 2% W) under roof (#ad9e90 average), bunting flags; white low wall.
- JUDGES booth at centre (x≈0.5, y≈0.37–0.6): hexagonal tower with candy-striped conical roof, cream posts, red sign "JUDGES" (white panel, navy letters, red border).
- Track: orange-red clay #c05926 lit / #8e3f1b / #a94021, scuffed texture, dark diagonal shadow bands (fence shadows) #41251b; white wooden rail fence (posts + 2 rails, #d0b98a shaded) in foreground at y≈0.78; finish post at x≈0.79: red/white striped pole with round target disk (white #fbebcd ring, red #f10b1c rings, red centre).
- Foreground grass strip #3e8118 / #458719 at y>0.88.
**Horses**: 3–4 brown racehorses (#a43a10, dark mane/legs #2a1a14), 2D vector with outline, running left→right, jockeys with white round heads (≈4% W) and silks (blue/white, red/pink, yellow/green), caps. Gallop cycle ≈ 8 frames; horses move ≈ 1.2% W per frame.
**Lighting**: warm afternoon sun from right-back, strong cast shadows of fence/horses toward camera-left, ambient blue; saturated.

## S2b Crane-push to judges booth (f1415–1429) — "foreground wipe"
md: 16 (1415) → 29–30 (1416–1419) → 50–71 peak at f1424 → 44 (1426) → 14 (1428) → 1 (1429). So an ease-in-out move of 14 frames (0.47 s), peak velocity at 64% of the move (slight late peak = easeInOutQuad with ease-out tail).
- f1416–1417: camera rises/pushes forward while a horse + jockey passes very close in the foreground (big, blurred, fills lower-left 50%) — this acts as a wipe.
- f1418: wide of grandstand + booth (camera already ~3 m higher, looking slightly down).
- f1419–1424: rapid dolly-in + crane up to booth; the telegraph wire (thin grey cable from booth desk slanting down-left to ground) becomes visible f1420+; judges below booth (top-hat judge white head ≈16% W at f1422 bottom centre, another judge bottom right).
- f1425–1426: motion blur on "JUDGES" sign (horizontal smear ≈20 px), camera passes over sign into the booth window.
- f1427–1429: settle on medium-close of judge; then slow drift (md 9–14, f1431–1436) = slow push-in + slight rotate.
Lens during push ≈ 35 mm; end framing camera inside booth rail level.

## S2c Judge in booth (f1429–1447)
**Environment**: booth interior: canopy candy stripes top (red #a30722 / lilac-white #bc90bd — the whites are shaded lilac), back panels slate-navy #3d4766/#434762 (walls in shade), lilac posts #a98cbc, red velvet bench #9b0622/#880720, desk/counter cream #fff1bc with lilac shadow #9c7da0, dark floor #20141e, sill rail pale yellow #fbe498. Thin black wire hanging from top-right (telegraph line) going down behind the judge; cable in lower-left foreground going out of frame (the line from S2b).
**Lighting**: shade side — cool lilac ambient, warm bounce from cream counter; scene slightly desaturated/pastel. DOF: background (outside booth, f1442 shows sea of green hills) blurred.
**Judge**: 2D toon. White round head (≈28% W, centred x≈0.47, y≈0.39), black brush outline 3–4 px, green visor/eyeshade cap (#2aa04a with white band), angry low brows, small dark moustache, frown; green suit jacket #1d7065/#618849 with yellow buttons, red bow tie, thin rubber-hose arms, sits behind counter (bottom of body hidden by 3D counter = integration via depth occlusion).
- Expressions (held drawings): f1425–1437 scowl (brows down, eyes narrowed); f1438–1439 eyes widen/neutral; f1440 eyes half-closed blink-squint; f1441 new pose smug side-eye, head tilted ≈8° right, moved up ~3% H (head pops, no tween); f1442+ hold. Drawings held 3–12 frames (limited animation), the camera moves on 1s.
- **Telegraph spark**: f1438 white-pink star flash (4-point star + radial glow, Ø≈40 px, #ffffff core, magenta #ff3fae halo) at his desk key (x≈0.58,y≈0.66); f1439 brighter; f1440 a white light streak (≈8 px wide, 120 px long, additive glow) shoots UP the vertical wire to the top with a starburst at the top (x≈0.62, y≈0.03); f1441 streak gone.
- Camera **tilts up following the streak** (phase-corr vertical shift +8, +28, +40 px/fr @720 equivalent ×4 = rising) f1440–1442, and dissolves to S3.

## S2c→S3 Dissolve f1441–1447 (~6–7 frames)
f1443–1444: heavy overlap (booth canopy + judge + dusk clouds); f1445–1446 street dominant; f1447 clean. The glowing orb of the pulse in S3 sits at the same screen position (x≈0.47, y≈0.47) as where the streak exits — match on the light.

## S3 Dusk street fly-through (f1442–1464)
**Camera**: low dolly at ~1.5 m flying straight down the centre of main street toward vp (x≈0.47, y≈0.47) at CONSTANT speed (md flat 9–11 → linear), ≈ 26 mm equiv wide lens (strong convergence), tiny drift left, roll ~1–2° (street lines slightly tilted). Rising slightly toward the end (f1455–1464 the camera seems to tilt up a bit and pass under the wires on left).
**Environment**:
- Sky gradient: top #38589a → #44609b → #7587b1 (mid) → lavender #b5a0a6 near horizon → peach haze at horizon behind hill. Clouds: stylised popcorn cumulus (sphere clusters) lit warm orange from below #fcb369 with tops pinkish #cf9176, shaded lavender; 6–8 clouds y 0.03–0.40.
- Distant green hill at street end #525649 (dusk-dimmed) with small structure/flag on top (racetrack/grandstand silhouette).
- Buildings: western false-front 1–2 storey boxes, left side in shadow #262354/#2c223e (navy-purple), windows warm glowing (some), right side partially lit warm cream #cca78f with green #897729 and yellow awnings, red/blue striped awnings, porch posts; street lamps (thin posts, warm bulbs #f9e39e with small bloom) both sides; parked wagons; boardwalks with white edge lines #fdfffc running to vp (strong leading lines).
- Road: reddish dirt #692f25 (near) → #573946 (far, lavender haze), parallel wheel ruts/hoof marks darker #3c2a3e, faint dust texture.
- Telegraph poles on the left with crossbars carrying 6–8 sagging wires (catenaries) that run from upper-left corner to vp.
**Pulse**: glowing yellow-white orb (#f2e294 core, bloom Ø≈30 px@720, soft halo #f9e39e alpha 0.5, Ø≈70) at vp f1446–1452, i.e. on the far wires; f1461–1463 a bright star/flare slides along the wires toward camera upper-left (moves ~40 px/fr) — the signal running down the line toward the parlour. 
**Lighting**: dusk: sun set behind hill (warm rim on cloud bottoms, warm glow at horizon), ambient blue-violet, low contrast; shadows navy #1b1929; atmospheric haze lavender increasing with depth (fog colour ≈#a6969f, density so far buildings at 60% mix).
**DOF**: deep, mild far blur.

## S3→S4 HARD CUT f1464|f1465 (48.80|48.83) — how it is hidden
- Both frames: street receding to the right of centre, telegraph pole + wires upper-left, buildings left. S4 starts on the SAME main street seen through the parlour window (day lighting!), so composition matches (pole at x≈0.25,y≈0.3 both sides), only time-of-day changes.
- S4 begins mid-fast-move (md 51 at the cut, motion-blurred), the eye reads it as continuation of the fly-through.
- Daytime exterior through window: sky #b8d8ff-ish, white clouds, purple-blue building #2b1f55, red road #3d1c01.

## S4 Betting parlour — one continuous camera move (f1465–1586, 4.07 s)
Camera speed curve (md): 51 at 1465, 39–56 (1466–1474, fast yaw right + forward), 38→14 (1475–1497, ease-out push to desk), 12→2 (1498–1511, near-hold / micro creep), 4→38 (1512–1529 ease-in pan right, peak f1527–1529), 37→2 (1530–1563 ease-out while trucking right to characters), hold 1563–1566, then slow push-in md 4–8 (1567–1586) into the dissolve.
Phases:
1. **Window/door (f1465–1472)**: camera at ~1.5 m inside the room, near window, yawing right ≈ 60° over 8 frames. Window: green-painted frame #284949/#22403a with transom panes, view of street. Yellow hanging sign "BETS OPEN" (#9a6719 shaded/#e8b52a lit, black slab-serif text #1c0e04, brown border, dark nail holes) on chains inside the window, swings slightly. Cream-white painted door jamb/architrave (#ac9ba6 shaded, speckled with dark dots = worn paint), 120–150 px wide@720, which sweeps across frame right→left (f1468–1471) = **foreground wipe hiding the room change**. Board edge (dark navy with gold trim) visible above jamb at f1469.
2. **Telegraph corner reveal (f1472–1486)**: wide-ish 24 mm lens, room corner: left wall with big sash window (white frame, overexposed exterior #ffffff, brick wall outside #f9b287), crimson damask wallpaper (#690f21 lit / #470c1d shade, damask motif darker #4e0d1d, slight velvet sheen), dark wood wainscot #512417/#672913 with chair rail, pressed-tin ceiling sage green #566d64 with cream cornice; right wall = huge chalkboard (see 4). Floor: wood planks entirely littered with discarded betting slips (cream #e7c0a2 rectangles 15–30 px, some pink, green, blue, ~400 papers random rotation). Red-top bar stool #c82225 on black pedestal with foot ring (left), wooden stool (round seat #944e28) and telegraph desk in corner.
   - Pulse: a white glowing point descends the vertical wire from ceiling f1473 (y≈0.30) → f1476 (y≈0.45) → f1477 (y≈0.5) toward the desk, ~15 px/fr, with soft bloom. A teal glowing glass bead (#3cc3b0-ish cyan, Ø 12 px) on the board edge wire at x≈0.05 f1470–1475.
3. **Push to desk (f1475–1500)**: dolly forward + slight right, ending in medium close of desk (desk fills 70% W at f1500), camera height ~1.2 m looking down ~20°.
   Desk: wooden table (top #774325 lit, front apron #673412, turned legs), stack of white paper #fee8c0 (box 25% W), red book/block #d40c13, telegraph sounder on dark walnut base (#3c1b11): brass frame/posts #d99237, two copper-red coils, brass lever arm, black round knob/inkwell (#1a1a1a). Wall-mounted dark wood box (#531c0d, ≈30% W) on brass bracket arm (#d99237) holding the wire; wire (dark brown, 2 px) comes down from ceiling with a white porcelain insulator/bead (Ø≈10 px) at y≈0.37, bends to the sounder.
4. **Clicking (f1500–1516)**: near-static (md 2–5). Sounder armature clicks: white sparkle glints (small 4-point star Ø≈15 px, additive) at the sounder f1504, f1505, f1508, f1511 (≈every 3 frames = clicking). The lever moves 1–2 px.
5. **Pan right across chalkboard (f1512–1535)**: yaw right ≈ 70° with forward truck (stool foreground passes bottom), peak speed f1527–1529, motion blur mild. Chalkboard: tall slate board, dark navy-charcoal #3f4659 / #31303c with chalky smudges (lighter cloudy noise #645957), gold-leaf frame #d99237/#936941 with red inner border; header row: "RACE" gold serif + white tile with black "8" + "WINNER" gold serif; horse rows on cream paper labels (#e9e6d8, slight worn texture, pinned with brass tacks): black numbered square tile + black slab-serif name: "1 HIGH HAT", "2 BEE'S KNEES", "3 WHOOPEE", "4 APPLESAUCE"; chalk odds in white handwritten: "1 - 5", "4 - 1", "6 - 1", "8 - 1". Second board to the right above the window: label "9 MILK RUN" + chalk "100-1" (the underdog), little cobweb at its corner and a hanging teal bead. Below boards: wood panelling.
6. **Truck right to characters (f1530–1566)**: camera trucks right along the board ≈ 1.2 m and pushes slightly; framing ends on two characters at a barrel table in front of the street window (window shows the street + yellow "BETS OPEN" sign again, overexposed warm). A tall wooden library ladder leans on the board at right (#5c504e shaded / honey #a57857 lit).
7. **Hold + slow push** f1563–1586; image gets a soft bloom/glow (whites blooming, contrast down ~10%) from ≈f1569, then dissolves.
**Lighting S4**: strong warm sunlight through windows (key from left/back window, overexposed, light shafts implied), warm orange bounce on floor/papers (#cfa284), deep crimson/brown shadows #281010, ambient low; practical: none visible besides window. Soft bloom on bright areas (threshold ~0.85, radius ~20 px). Slight haze/dust in air near window (lifted blacks behind characters #747284).
**DOF S4**: phase 3–4: background wall slightly soft, stool foreground soft; phase 6: background window/board softly blurred (≈3–4 px), characters sharp.

**Characters S4** (2D vector toons composited in 3D, standing behind barrel table so the table occludes their lower bodies):
- Woman (left, enters frame from right edge at f1536 as the camera trucks — she is static, revealed by camera): white round head ≈44% W at f1560 (centre x≈0.15, y≈0.62 — partially off left edge), red-pink cloche hat #f96d86 / darker band #c2304a with a huge white feather quill (outlined, serrated) sticking up-left; long lashes, half-lidded smug eyes, small smile; teal dress #3cc3b0 with yellow bow; holds a small green chalk slate "RACE 8" (#58544a board, wooden frame, white chalk lines) in front of chest with rubber-hose arm (purple outline). Expressions: f1537–1539 smiling looking right; f1540 eyes half-closed smug (pose swap); holds.
- Man (right, x≈0.68, y≈0.48, head ≈31% W): brown bowler hat #77534c/#9e6745, white head, cigarette/toothpick in mouth (white stick with orange tip) that bobs; unimpressed face, sweat? no; yellow-orange plaid vest #f2b473 with brown checks over purple shirt/tie #6b3a8a; thin legs visible below table. Expression swaps: f1548 neutral → f1554 eyes side-glance → f1557 lids lowered → f1560 eyes forward → f1563 back to bored; drawings held 3 frames each (animated on 3s/2s), plus constant slight head bob.
- Round barrel table: staves #704d3b, iron hoops dark #3a2a24, top #9b6437 lit with warm sun gradient; cards/chips on top (white rectangles, round chips).

**Captions S4**: "came" 1469–1474, "clicking" 1475–1485, "in over" 1486–1497, "a wire." 1498–1511, "And" 1512–1516, "until it" 1517–1526, "did," 1527–1539, "bets" 1540–1551, "stayed" 1552–1561, "open." 1562–1573, "Up" 1574–1577, "on that" 1578–1586.

## S4→S5 Dissolve f1578–1587 (~10 frames, linear)
Parlour already bloomed/whitened; meadow (purple-pink sky) fades in; f1584–1585 the telegraph poles of S5 overlap the ladder; S5 clean f1587. Both shots are slowly pushing in (motion continuity).

## S5 Sunset meadow + farmer with telescope (f1587–1620+)
**Camera**: ground level, ~0.3–0.5 m, inside tall grass (foreground grass strongly blurred), lens ≈ 50 mm, slow push (md 5–6, f1587–1603) then accelerating push (ease-in, f1604–1620, md in a crop around the farmer 14 → 67) tracking toward the farmer; camera rises slightly so the horizon moves from y≈0.50 (f1590) to ≈0.37 (f1619) while the farmer grows from head 5% W to 35% W. Continues into a dolly through the telescope lens: f1620–1626 lens fills more, f1627–1629 lens circle exceeds frame (brass rim #ffe8aa/#7e4f30 ring with dark outline), f1630–1631 inside lens = new shot of racetrack (seg6). Hidden transition = zoom-through-object (iris-like circular wipe).
**Environment**:
- Sky (no sun visible) vertical gradient: top #302587 → #45277e (y0.1) → violet #8438a7 (0.18) → magenta #da4c8b (0.30) → coral pink #fe736f (0.40) → orange #fe9b64 at horizon (0.49). Smooth, no clouds.
- Meadow: flat field, tall grass blades (thin tapered cards / SDF instanced), colour far #736d4b/#5b6834 (sunset-tinted olive), near #627031 / #515939, lit tips warm; wildflowers: purple #9e3c9a, red #c8282a, orange #e38b2a, white dots; foreground grass heavily blurred (DOF ~15–25 px), mid-ground sharp at the farmer.
- Telegraph/telephone poles on the right (x≈0.8–0.9) receding, crossbars + 4–6 wires sagging (catenary) going off top-right — pole colour pinkish silhouette #ac515c; a second smaller pole at x≈0.80; far tiny poles left.
- Farmer's spot: a patch of bare brown dirt path (#95592c / #7e4f30) under him; tall wooden A-frame (two slanted poles + crossbar, #9e582d) holding a large arched dark-red wooden board/panel (#612426 / #973d26 lit, plank lines) — like a signboard/easel back; wooden crate #c0561e (stack of 2) next to him; picnic basket with red/pink gingham cloth (#e86e8c / white) to his right; a dark green bush/tree behind him (#2f5a2a).
**Farmer** (2D toon): round white head (≈5% W at f1590 → 35% W at f1619), straw hat #fab446 with blue band #2453a9 and straw tufts poking up (3 sticks) + straw fringe ends; one big round eye with pupil, the other eye at the telescope eyepiece; brown moustache dot; green shirt #3ea84a, blue denim overalls #4d66a2 with yellow buttons and stitched pocket; thin black rubber-hose limbs; right arm out holding a sandwich/biscuit (#c09661). Telescope: brass tube on a tall wooden tripod (3 legs #9e582d with dark outline), objective lens facing camera — glassy disk showing reflected sunset (top pink #fdecae highlight, lavender bottom) which later shows the racetrack (lens image = render-to-texture of next scene).
- Animation: f1597–1612 standing, looking through telescope with slight head bob; f1613–1617 lifts head/eye aligns behind lens; f1617–1619 face centred behind lens (lens covers his eye exactly). Arm with sandwich swings slightly (2–3 frame holds).
**Lighting S5**: backlit sunset: warm rim from horizon behind, ambient purple-magenta; subjects slightly desaturated warm; soft, no hard shadows; strong atmospheric pink haze at horizon (far objects tinted #e39061/#d45274).
**Captions S5**: "hill." 1587–1596, "His" 1597–1603, "buddy" 1604–1612, "just" 1613–1619, "watched" 1620–1630 (then "Horse" 1631–1638, "nine" 1639–1647, "come" 1648+ — seg6).

---
## Effects (all shots)
- Telegraph pulse (signature effect): additive glowing point/streak, core #ffffff, halo warm #f9e39e (dusk) or pink-magenta (#ff3fae, booth), bloom radius 20–40 px, 4-point star flare on events; travels along wire paths at 15–40 px/frame; sparkle glints at the sounder (f1504/1505/1508/1511).
- Dust plume S1 (tan #f0c39c → #b7926f, blurred puffs).
- Motion blur: present on fast camera moves (S2b f1424–1426 ~20 px; S4 f1466–1474 ~10–15 px; pan f1525–1530 ~8 px); none on slow drifts.
- Bloom/glow: windows in S4 overexposed with bloom; S4 tail f1569–1586 global soft-glow (lifted blacks + white bloom) to ease into the dissolve; S3 lamp glows.
- DOF everywhere (gaussian by depth), strongest in S5 foreground grass.
- No film grain/vignette visible; slight lens vignette ~5% in S3.

## Characters general (style)
White round heads with black brush outline (3–5 px @720, variable width), dot/oval eyes, thick lashes for women, hats as separate shapes; thin black rubber-hose limbs; flat colour fills with 1 cel shade at most; all are 2D cards placed in 3D depth and occluded by 3D props (counter, barrel table, tripod legs in front of the farmer). Characters mostly HOLD poses; expression/pose swaps are instant (no inbetweens) every 3–12 frames, plus subtle idle bob; camera always moves on 1s.

## Captions (style)
- Font: heavy geometric sans, lowercase as spoken (Montserrat ExtraBold/Black ≈ weight 800–900 matches), white #ffffff, black outline ≈3 px @720 (≈4–5 px @1080) + hard black drop shadow offset ≈(+2,+3) px @720.
- Size: ascender top→baseline 34 px @720 (y 883→917) ⇒ font-size ≈ 47 px @720 = **≈70 px @1080x1920**. Descenders reach y≈925 @720.
- Position: horizontally centred (x=360 @720), baseline at y≈917/1280 = **71.6% H** (≈1375 px @1920); constant across all shots.
- Timing: 1–2 words per card, hard cuts between cards (no pop/scale animation), each card 3–18 frames, switching exactly on word onsets; text is not karaoke-highlighted. Full list per shot above.

## Build checklist (SDF/JSX)
1. S1: street box-row SDF + checkered FINISH band + bunting + 2D crowd cards + cart (boxes/cylinders) + 2D horse loop + dust sprites; easeInOut push f1350–1395.
2. Dissolve 8 fr.
3. S2: painted hill backdrop (big sphere-ish blob + noise), striped tent roof (box + stripe uv), JUDGES hex booth (hexagonal prism + cone with stripes), clay track plane, rail fence, target post; 2D horses; 14-frame crane push (peak f1424) with foreground horse card wipe; judge 2D in booth; spark + upward streak; tilt-up + 6-fr dissolve.
4. S3: linear fly down street, wires (catenary tubes) on left, pulse orb along wires, popcorn clouds lit from below, lavender fog.
5. Hard cut on motion to S4 window; one 4-s camera spline: yaw through door jamb (foreground wipe) → push to desk → hold w/ sounder glints → ease pan right along chalkboard → truck to 2 characters → bloom → 10-fr dissolve.
6. S5: gradient sky, instanced grass with heavy DOF, A-frame board, tripod telescope, farmer card; ease-in push; zoom through lens (lens = circular mask with next scene render) into seg6.