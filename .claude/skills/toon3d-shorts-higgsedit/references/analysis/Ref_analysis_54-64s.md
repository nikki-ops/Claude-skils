# SEG6 report: 54.0 s – 64.07 s (frames 1620–1921, end of video)
The video has 1922 frames (0..1921) at 30 fps. Frame index = round(t*30). Pixel values are given at 720x1280 (multiply by 1.5 for 1080x1920).
The method was ffmpeg scene scores (thr 0.1, plus a full per-frame score list), 10 fps sheets with timestamps (cs/), 30 fps sheets with frame labels for every frame 1611–1921 (f30/), key stills (key/, full/), a board crop strip (board.jpg), a green-pixel tracker for the money, and median-cut palettes.

## 0. Cut map
Scene detect at 0.1 found only 1630/1631 (0.14–0.15, the lens rim leaving the frame) and 1858 (0.107, the money appearing). **The segment has NO hard cuts.** All transitions are camera moves or dissolves.

| # | frames | time | content | in → out |
|---|---|---|---|---|
| A | (<1590)–1630 | ..–54.33 | Sunset meadow: farmer behind a tripod lens; camera pushes into the lens | in: from previous seg; out: **zoom-through portal** 1619–1631 |
| B1 | 1622(inside lens)/1631–1660 | 54.07–55.33 | Racetrack sunset: grey horse standing, then bolting (pink glowing scribble legs, dust burst) | out: whip-pan/orbit with heavy motion blur 1661–1670 |
| B2 | 1661–1684 | 55.37–56.13 | Chase cam behind/left of horse, looking down the straight toward the grandstand; orbits to the side | continuous camera move, motion blur 1680–1684 |
| B3 | 1685–1738 | 56.17–57.93 | Side tracking shot along grandstand: grey horse overtakes brown horses ("steal it by a nose") | out: **cross-dissolve 1739→1748 (10 f, linear)** |
| C | 1739/1748–1921 | 57.97–64.07 | Betting room at night: crowd laughing, board painted N-I-N-E, money avalanche on the hero, faces laugh→shock; ends on a hold | end: no fade. The last frame 1921 is a normal frame (hard end) |

---
## SHOT A – Sunset meadow → lens zoom-through (seen 1590–1631)
**Camera.** A continuous dolly-in at eye height (~1.6 m, matching the farmer's head) with a slight tilt up. Focal ~35 mm equivalent. Speed accelerates exponentially (ease-in) and peaks when the lens fills the frame.
Lens disc diameter as % of frame width (W):

| frame | 1611 | 1613 | 1615 | 1617 | 1619 | 1621 | 1623 | 1624 | 1625 | 1626 | 1627 | 1628 | 1629 | 1630 | 1631 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lens % of W | 4 | 6 | 8 | 12 | 22 | 27 | 30 | 35 | 48 | 75 | 95 | 115 | 145 | 185 | rim gone |

From 1624 the lens grows by about ×1.25–1.3 per frame. The farmer's head grows from ~13% W (1605) to ~44% W (1620) to >100% (1627).
- 1611–1616: the tripod legs (two brown sticks) sit in the foreground, converging at the lens. By 1617–1618 the camera has risen and passed them, so the legs slide out of the frame bottom. The lens now looks hand-held in front of his right eye.
- The lens interior shows a sunset reflection (1619–1621: cream #feeac7 / #fde4a4 sky band, mauve #c68998 / #af7c99 lower) and swaps to the racetrack view at 1622.
- The track view inside the lens is a live render of shot B through a circular mask with slight barrel distortion and a darker vignette at the edge. The inner camera also pushes in.
- At 1629–1630 only the dark rim ring remains at the frame edges. At 1631 shot B is full frame.
- **Build it as** shot B rendered into a circular mask. Scale the mask from 22% to 200% W over frames 1619–1631, with expo ease-in. Draw the ring on top: outer ring dark #3d1c23–#441f25 (≈12% of the radius), an orange-brown outer bevel #885b33 / #b57365, and a thin gold inner hairline #e8be84.

**Environment (raymarch).**
- **Sky.** A vertical gradient plane:

  | height | top 0% | 8% | 16% | 23% | 31% | 39% | 44% | horizon |
  |---|---|---|---|---|---|---|---|---|
  | colour | #312386 | #37278a | #60309a | #9039a9 | #d34991 | #f96272 | #f68b7d | #fc7973 |

  Horizon ≈ 52% H (1605). No sun disc is visible; it sits just behind the horizon, which glows warm salmon.
- **Ground.**
  - A plane covered in a tall-grass field: noise-displaced blade field, or many thin cones/billboards. Colours #627032, #596337, #4e5f2f, #6e6c39, #69782b, with lilac grass tips #8c388e lit by the pink sky.
  - Flowers are tiny spheres in orange #e58165 / #f2bb62, pink #e04d87 and lilac.
  - Bare dirt patch under the easel #9e5831 / #a25331, with tiny orange flowers.
- **Objects.**
  1. A tall wooden panel with a rounded top (the back of a big canvas or board), maroon planks #622322 / #5b2120 with rim-lit edges #ab4d2b / #cb5e49. Rounded box ≈ 1.0 × 1.6 × 0.08 m, left of the farmer.
  2. A wooden A-frame easel/tripod in front of it: 3 thin cylinders #a15c32 / #65281f, pink sky rim #fb8869.
  3. Orange wooden crate (box 0.4 m) #ce6226 / #c55720 with darker plank grooves #9e3e13.
  4. Wicker picnic basket (cylinder plus torus handle) #965b40 / #68331e, with a red-white gingham cloth #d84855 / #a32e27.
  5. 2–3 telephone poles (cylinder plus cross bars) silhouetted at the right horizon, lit #9d4652, with 4 sagging wires.
  6. A distant dark bush, left #3d4a2a.
- **Lighting.** Low sun behind and right gives a strong magenta-pink rim/back light (#ff7a7a) on every edge. Fill is the cool purple sky (#5d2f9a). Shadows are violet-brown #33193a. Ambient is warm. No hard key on the front faces.
- **DOF.** The bottom 30% of the frame (foreground grass) is heavily defocused (blur radius ≈ 25–40 px), the mid-ground is sharp and the horizon slightly soft. As the camera advances, the foreground grass becomes a smeared green wash.

**Character: farmer.**
- Round white head #fee1cc → reads #f2c9bd in the pink light, with a 4–5 px brush outline #2a1a20.
- Straw sun hat: ellipse brim plus dome, straw #eeac3f / #f9cd80 with a darker weave-dash texture #c88a30, blue band #2c56a5, and 3 straw tufts poking up on top. The tufts wiggle on 2s between 1617 and 1626.
- Round dot eyes with small brows. Green shirt #449a36 / #47af2f with a pointed collar. Denim overalls #516896 / #556b98 with yellow stitching #e6c25a and two gold buttons.
- Rubber-hose black legs and arms (~6 px). The right arm hangs, holding a small sandwich or crate item.
- Head ≈ 13% W at 1605, 1/3 W at 1620. He stands still. The motion comes only from the camera.

---
## SHOT B1 – Racetrack, horse start (1631–1660)
**Camera.**
- 1631–1640: continues the push-in from the lens (ease-out). The horse grows from ~35% to ~110% of W while the camera orbits ~10° to the right around it.
- 1641–1652: almost locked, with a slight follow-pan right.
- 1653–1660: a pan right accelerates to follow the bolting horse.

Camera height ≈ 1.3 m (just above horse back, looking slightly up at the rider), focal ~35–40 mm. DOF: cypresses and hills soft (≈6–10 px), track foreground sharp.

**Environment.**
- **Sky.** Pastel lilac → pink: y0 #a293cb, 8% #c1a5d1, 16% #ddb7d2, 23% #e4b4c1. Huge soft cumulus blobs #ebaec1 / #e2aec2, each with a bright warm rim on its sun side #f8dcbb. Build them as SDF sphere clusters with soft shading and a rim term.
- **Background.**
  - A green rolling hill on the right #42652b / #5b7232, a smooth sphere-blended terrain.
  - Rows of Italian cypress trees, tall stretched ellipsoids #42612c with darker vertical brush streaks.
  - Round umbrella-pine trees on top of the hill.
  - Small striped booths: a red-white kiosk with a striped awning #ed5244 / #fbe4d0.
  - Vintage cars parked behind the rail (1648: two black / tan 1920s cars) at ~30% H.
- **Track.**
  - Flat plane with orange-red clay #d2531f / #c94b17 / #d1521b, noise-mottled. Darker hoof-print dots #993d20, with small white papers (betting tickets) lying on it.
  - White wooden rail: two horizontal rounded boxes plus square posts, cream #f1c5b4 / #f7cb95, shaded #9a361a.
  - A string of small round bulbs (white spheres plus green wire #6a8a40) hangs along the rail.
  - Green infield strip #4b7b14 between rail and track.
- **Lighting.** Late-afternoon sun low from back-left. Long diagonal shadows of posts and trees fall across the track, colour #a43912 → deep #562226. Warm key #ffd2a8. Shadow side of objects pinkish-mauve #b9a0b7. Strong haze toward the horizon #fdbe88.

**Horse (2D vector, not 3D).**
- Dappled grey: base #eabaa1 / #f8ccb3 in sunset light. White dapple blotches #fed9bd over light grey-pink #cf9684 spots. Darker legs grading to grey-brown #82441c / #613f38 at the hooves.
- Mane and tail are dark brown-black spiky brush strokes #402b33. Bridle dark, with a yellow nameplate on the cheek.
- Brown saddle #bc6d30 over a saddle cloth.
- Size: 1640, ~90% of frame width, standing side-on facing right. Feet at y ≈ 86% H.
- 1641–1644: the horse stands and breathes. Ears flick at 1641/1643.

**Rider (hero bettor / jockey).**
- 1640: brown flat cap #a06c5b, open "O" mouth, round eyes. Head ≈ 13% W.
- He holds an open newspaper "THE DAILY ..." #e5e4d6 with column lines, reading it.
- 1648 onward: the cap reads as a red/white jockey helmet #d94a29 / #f9f0ee, with a red-brown jacket #5c3a37.

**Animation events (B1).**
- 1645: the legs start to "spin". Pink glow scribbles appear at the hooves and the horse's body starts to move right.
- 1647–1651: the horse rears. The front half lifts and the head goes up (peak 1650–1651), with the rider leaning back.
- 1652: the horse drops into a full gallop pose (front legs forward, rear legs back, body horizontal).
- 1653–1661: a dust cloud bursts at hoof level and expands.
- 1645–1660: tickets and papers fly up and spin. These are 4–6 small white rectangles, 10–18 px, flying from the hooves up and to the right.

**Dust cloud.**
- 6–10 overlapping soft spheres/blobs covering ~x 0–90% W and y 62–80% H at max (1656).
- Colours #f8b98d, #f8ae84, #ee9a76, #fcc9a2, with shadowed bottoms #d7765b.
- Grows from 0 to full in ~4 frames (1653–1657), then drifts left and thins out over 1658–1662.
- Render as volumetric noise, or 2D soft blobs with blur ~20 px.

---
## Pink glowing scribble legs ("speed legs")
Seen from 1645 through 1738 whenever the horse runs.
- The lower legs (from about the knees down) are replaced by or overlaid with a **zig-zag / barbed scribble**. It is a black jagged polyline (3 px) with many short perpendicular barbs, a hot-pink neon core #ff1e56 / #fe1d56 and an outer glow #f55465 → #df462b (glow radius ≈ 8–12 px, additive).
- The scribble runs from each hoof backward along the ground for ~150–300 px, like a smeared trail.
- **The path is regenerated every frame (on 1s).** The jitter amplitude is ±10 px, so it crackles like electricity.
- There are 2–4 strands, one per leg in contact. The hooves themselves get a small pink ellipse glow on the ground.
- In 1695 the strand from the front hoof reaches back to the rear hoof, a horizontal band about 260 px long at y ≈ 71% H.
- The horse body is sharp with no motion blur. Speed is sold by the background blur and the scribbles.

---
## SHOT B2 – Whip orbit and chase cam (1661–1684)
**Camera, step by step:**
1. 1661–1666: whip-pan right. The background gets heavy horizontal motion blur: smear ≈ 40–80 px on the hill and trees, vertical streaks on the trees. The horse stays sharp in the left third (x 0–45%), its rider at y ≈ 70% H.
2. 1666–1670: the camera swings around behind the horse (orbit ~90°) and drops to ~1 m height. Strong blur, then the grandstand appears at the right.
3. 1671–1679: chase cam. We look down the straight with a vanishing point at ~(70% W, 30% H). The grey horse is in the lower-left corner (x 0–40%, y 33–50% H), seen from rear 3/4 at ~25% W. A pack of 4–5 tiny dark horses sits at the vanishing point (~2% W each). The grandstand is on the left horizon with white/pink roofs, a round green tree, the white inner rail on the right, and a green infield.
4. 1677–1684: a fast orbit/truck right toward a side view. The grandstand rushes toward camera with heavy motion blur 1680–1684 (smear ~60 px). The foreground white rail crosses diagonally at bottom right (1681–1684).

Focal ~24–28 mm (wide), with strong perspective on the track. The camera shakes slightly, by ±3 px on 2s.

**Environment.**
- **Track.** Clay #a1381a / #b7431b, with a deep shadow band across the bottom-right foreground #522326 (shadow of the stand or a tree).
- **Sky.** #9c90cd at the top → #ccacd1 → #ebc0cf at 23% → #f6bcb3 at 35% (warm haze #fdbe88 near the horizon). A long white-pink cloud bank on the right with a bright rim.
- **Grandstand, far.** Long low box with a striped roof #d99398 and a grey-blue stand interior #4c515b.
- **Lighting.** Sun in front-left (backlight), so the horse is partially silhouetted, with pink rim on the horse back.

---
## SHOT B3 – Side tracking along grandstand (1685–1738)
**Camera.**
- Tracks parallel to the horse at its speed (truck right). The horse holds screen x ≈ 0–80%, body at y ≈ 47–70% H.
- Height ≈ horse back (1.4 m), looking very slightly up at the stand. Focal ~35 mm.
- The grandstand is mid-ground (slow parallax). The foreground rail (y 78–100% H) streaks past fast: posts cross the frame in ~6 frames, white #f5bf7a / #f7cb95 with mild motion blur.
- 1700–1738: the camera gradually slows and pans/orbits left (horizontal angle drifts ~20°). The stand slides right→left and its right end, then trees, come into view (1721–1738).
- Gentle drift up / tilt down 1705–1738. The grey horse ends at lower-left foreground, 1.2× larger.

**Environment: grandstand (rich).**
- **Structure.** One long box ~80 m. The roof is a row of triangular gables (prism SDFs) with a red/white vertical-stripe awning #d51a25 / #fac89c. A scalloped valance (half-disc teeth) hangs along the eave with yellow-green dots / ball finials.
- **Bunting.** A string of triangular pennants under the eave in red #d51a25, yellow #f2c230, blue #2f5fae and green #76912d, about every 30 px.
- **Interior.** Dark #203b4b / #2b3f48 behind the rows of spectators.
- **Crowd.** 6–8 rows of tiny toon spectators: white round heads #f8d3b3 in sun, top hats, coloured coats #715552 / #be958a. They are 2D billboards on 2s and wobble slightly. Thin white posts divide the bays.
- **Front rail and judges' booth.** A white/cream front rail runs at the stand's base with spectators leaning on it. The judges' booth is a small striped kiosk tower: red-white striped dome roof, a red banner with the text "JUDGES" on a cream plate #bd9987, and a flag on top. It sits at ~35% W, 30–36% H in 1720.
- **Flags.** On tall thin poles, red #e03a3a and blue #3a5ab0 triangle flags.
- **Hill behind.** #608132 / #8d9234 / #748b31 with round trees: brown-trunk cylinders plus clustered sphere crowns #4e6b2a.
- **Sky.** Lilac #c1a2c7 → #dea9ba. The far right (1720+) shows a big pink cloud and a purple-grey far stand #8a7fa8.
- **Track and shadows.** Track #c74e1d / #b94117 / #a33515. Long diagonal shadows of rail posts and horses run toward the lower-left #722b20 / #a43912, so the sun is behind the stand and slightly right, i.e. back-lit.
- **Treeline.** Round dark-green trees at the far right #3f6a30, visible 1725–1738.

**Other horses.**
- 3–4 brown thoroughbreds, 2D, base #a8330e / #a02f0d, shadow #582216, highlight #af754b.
- Jockeys wear diamond/check silks: red-white checks; a yellow / orange / green rider with a blue cap. Riders' heads are white with tiny faces.
- They run at almost the same speed. The grey horse gains about 1 head-length per 25 frames.
  - 1689: the brown lead horse's nose is ahead (at x ≈ 80%).
  - 1703–1709: noses level.
  - 1709–1726 ("a nose."): the grey's nose leads by ~30 px.

**Grey horse gallop.**
- About 8 frames per stride, drawn on 2s. Key poses: extended (1689, 1697, 1705), gathered (1693, 1701, 1709).
- The head bobs ±8 px. The mane flies back as black spiky strokes.
- The grey shows pink sun tint on the rim #f7a0a0. A pink spot on the cheek or nose #f06a8a (blush).
- Rider: crouched jockey, brown jacket #90765e, red/white helmet #d94a29 / #f9f0ee.

**Rider expressions.**
- 1685–1716: determined face (eyes forward, mouth line).
- 1717–1720: eyes wide, small open "o" mouth (surprise at winning). In 1720 the face looks up-left.
- 1721–1738: the head turns away (shows a blank white back of head plus helmet) as he looks ahead or back.
- On 2s throughout.

**Transition to C.**
- A 10-frame linear cross-dissolve (1739 ≈ 10% room → 1748 100%).
- The race keeps moving (truck continues) and the room already shows the laughing crowd.

---
## SHOT C – Betting room, night (1739–1921)
**Camera.**
- Front-on medium-wide, eye height ≈ 1.2 m (slightly below the big guy's head, looking a touch up at the board). Focal ~35 mm.
- Slow continuous push-in plus truck right. The board slides left about 8% W between 1748 and 1872. The big guy's head is 20% W at 1765 and 22–23% W at 1921, so the zoom is ≈ +12% over 5.8 s (linear, very slow ease).
- From 1858 to 1872 the push speeds up slightly and tilts up (the board rises by ~20 px).
- No shake. DOF is shallow-ish: the back wall and window are softly defocused (≈3–5 px), the characters sharp, and foreground floor papers slightly soft.

**Environment (raymarch).** Overall the room is cool, moonlit and low-key. Dominant palette: #19172f, #1f294f, #323a60, #71688b, #827ba0, #5f5069, #5a3c49, #b5bbd9.

1. **Back wall.**
   - A huge tote-board made of dark navy chalkboard panels #1f294f / #27315d / #161c3c in wooden frames with gold/brass trim (#816247 / #947865, thin bevel boxes).
   - Upper row: a white square plate with a black "8" (#9e95be in the blue light), "WINNER" in gold slab-serif caps #c9a35a (lit #b08a55), then a long empty slot frame where NINE is painted.
   - Left column: horse-name plates (white cards, cut off: "..AT", "..ES", "..PEE", "..UCE") with odds painted in white chalk-style: "1-5", "4-1", "6-1".
   - Centre: a cream plate with a black "9" box and "MILK RUN" in black slab serif, then "1000-1" in white.
   - A spider web in the board corner and a small hanging droplet/ornament.
2. **Window.**
   - A centre window (~45% W, from 23% to 37% H) with a white/cream frame #dcd6ef and a green-blue sill.
   - It shows a night street outside: purple dusk sky #886cb8 / #996deb, dark buildings #1e2650 with warm yellow lit windows #ffcf6a / #f7b955, street lamps glowing with a soft bloom, a tiny parked car.
   - This is the only warm light source in the shot.
3. **Wooden ladder.** Two rails plus rungs (cylinders/boxes) #463448 / #6d505e, with highlights #817cb2. It leans on the board, right of centre. It slides right with the painter: ladder x is 0.62 at 1765, 0.70 at 1848 and 0.83 at 1866, then it exits right by 1872.
4. **Floor.** Wooden planks running toward camera, mauve-violet #483651 / #624d6c / #756b89 / #695b78, with plank seams #2e2440.
5. **Torn tickets.** Hundreds of small white/grey-blue paper rectangles #c9d2eb / #776e90 / #a69ac3 (6–20 px, random rotation) are piled thickly on the left floor and around the barrel, and sparser on the right. Build as an instanced quad scatter.
6. **Furniture.**
   - A round wooden barrel-table at the far left edge #27233a (cylinder).
   - A low bench behind the group with a blue/white ticking-striped cushion #39345d / #5f5c8f / #7887a0.
7. **Ceiling.** Teal-blue tin/plaster panels #2e4264 / #3f5278 with a faint embossed pattern. A thin brass picture rail runs at the top of the board.

**Lighting.**
- Moonlight-blue ambient key from the upper front (#8f9be0 at ~0.6 intensity). Everything is tinted blue-violet, so even the white heads read #e4e6fb / #d0c1ef.
- The window gives a warm accent (yellow #ffcf6a bloom) from behind the characters. Faint warm rim on the heads closest to the window.
- Soft contact shadows under the characters #19172f.
- An overall vignette (corners darkened ~25%).

**Characters.** 2D, brush outline #1d1e40, ~4 px. All stand on the floor at y ≈ 72–86% H, feet in the paper scraps. Head diameters are % of W at 1765:

| # | Character | Head | Position | Look |
|---|---|---|---|---|
| 1 | Old man | ~11% | far left, x ≈ 12% | white moustache and round glasses, bald with fringe, grey-blue suit #4c4f77 / #191d43, gold tie-pin |
| 2 | Lady | ~17% | x ≈ 30% | red/maroon cloche hat #a52d6f / #5f2146 with a white ostrich feather; round black-rim glasses; teal coat #0c8db4 / #28577c with a yellow bow at the waist and a pocket-watch medallion on a chain; red hair at the side #b03040 |
| 3 | Flat-cap man | ~12% | behind, x ≈ 40%, head at 47% H | brown flat cap, orange-red coat #c05a3a, moustache |
| 4 | **HERO** | ~13% | centre, x ≈ 46%, head at 55% H, shortest | tiny tan boater hat #c89060 with a black band; red polka-dot bow tie #d03040; mint/teal shirt #60ccd3 / #579eb8; thin legs |
| 5 | Big guy | ~20% | right, x ≈ 70%, tallest, head at 48% H | dark brown bowler #3a2c30; yellow/mustard windowpane-plaid coat #a18874 / #8d7a77 (lit #c9a050) with a red M-shaped pocket square; purple tie; a cigarette in his mouth (white stick, orange tip) |
| 6 | Ladder man (board painter) | ~10% | on the ladder at the top, head at 6–10% H | blue flat cap #6078b8; blue shirt with suspenders #3a5ab0; holds a paint brush |

The ladder man shifts right with the ladder as he paints.

**Animation events and expressions** (drawn on 2s; idle bob: heads/torsos bounce 4–6 px on a 6–8 frame cycle while laughing):

| frames | event |
|---|---|
| 1748–1796 | Everyone laughing. Eyes are closed upward arcs (^ ^). Old man: open D-mouth. Lady: wide open laughing mouth, head tilts back and forth ±5°. Flat-cap man: laughing, head thrown back. Hero: content closed-eye smile. Big guy: squeezed-shut "> <" eyes, wide toothy grin around the cigarette, shoulders shaking (bob ±6 px every 3–4 frames). Ladder man: laughing at the top. |
| 1797–1830 | Laughter continues. The big guy throws his head back (1797–1806), then a closed-eye smile. The lady's laugh calms (1803–1820: smiling, eyes closed). The hero changes to a **smug half-lidded smirk** (from ~1806, eyelids flat, one-sided smile) and keeps it to the end. |
| 1800–1808 | The ladder man stops laughing, turns to the board and his face goes neutral or focused. |
| 1809–1815 | **Letter "N" painted** in the WINNER slot, stroke by stroke (left stem 1809, diagonal 1811–1813, right stem 1815). It is a thin white condensed sans/slab with chalky texture #c4cde8, about 70 px tall at 720 W. |
| 1827–1835 | Old man's laugh fades to open eyes (1828+). The lady opens her eyes, a dazed look (1828–1835). |
| 1834–1836 | **"I"** painted (single stroke). |
| 1838–1847 | Big guy: suspicious frown, flat eyebrows, straight mouth, eyes narrowed and looking up at the board ("it ... spells"). |
| 1839 | Lady: eyes wide, small "o" mouth (shock). The old man's eyes go wide with an open mouth at the same time. |
| 1843–1847 | **Second "N"** painted (complete by 1845–1848). |
| 1848–1850 | **Big guy shock:** eyes become big white circles with small pupils, mouth drops to a tall open "O". The cigarette tilts down (1848), then falls from his lips (1849–1856, it lands near his feet by 1862). |
| 1850–1857 | All shocked, holding the shock (on 2s, tiny trembles ±2 px). The hero is still smug. |
| 1858 | **The money avalanche starts** (see below). |
| ~1863–1869 | **"E"** painted behind the money. "NINE" is complete by 1869–1872. The ladder man slides right and exits frame right at 1870–1872. |
| 1873–1890 | Big guy: shocked, stunned "o" mouth, eyes wide. Lady: wide eyes, small mouth, mouth twitch. Old man: shocked. Hero: smug, partially hidden by falling bundles. |
| 1891–1921 | The money has settled. **Final expressions:** big guy round eyes plus a tiny flat or "o" mouth (dumbfounded); lady wide eyes plus small "o"; old man wide eyes and moustache; flat-cap man wide-eyed; hero smug half-lidded eyes looking up-right with a one-sided smirk (slow lid blink ≈ 1915–1918). |
| 1921 | Last frame. A plain hold with no fade or end card. |

**Money avalanche (1858–1894)**, measured with the green-pixel tracker at 180x320 → ×4:
- **Instant start.** Frame 1857 has none. At 1858 a full column already fills y 0→660 px (top of frame down to 52% H), x 120→492 px. The stream pops in already mid-fall, with no gradual build.
- **The column.** A vertical tumbling stream about 300–380 px wide (x ≈ 17–70% W), centred over the hero (x ≈ 44% W). It slightly widens and sways left/right by ±40 px over time (x-range 16–564 at times, 1874–1879).
- **Content.** About 20–30 bundles visible at any frame.
  - Each bundle is a **3D-looking brick of banknotes**: a rounded box ≈ 2.2:1:0.6, front face pale green #91b392 / #a9c794 with tiny engraved text and border lines.
  - The side/edge face is darker #648572 / #7d9d80, and the paper-band wrapper across the middle is tan #d0a588 / #bca18d.
- **Size.** Bundles near the top are bigger (≈140–190 px long at 720 W, closer to the camera). Near the heads they are ≈90–120 px. On the pile ≈60–80 px. This implies they fall from above and slightly toward the camera.
- **Motion.**
  - Falls at ≈ 75–100 px per frame (≈2,500 px/s), random tumbling rotation of ≈ 15–30° per frame around all axes, slight horizontal jitter ±10 px per frame. On 1s (smooth).
  - Bundles hit the hero's head and shoulders and bounce off sideways (1862–1870), shooting single bundles out left toward the lady and right toward the big guy.
- **Pile.**
  - Grows at the hero's feet from 1862: about 60 px tall at 1866, about 120 px at 1880, final ≈ 370 px wide × 240 px tall (x 183–550, y 825–1067 at 720 W). This buries the hero to his waist.
  - Pile bundles are in shadow and take the room's blue light: #37607a / #5b7fa3 / #33506c / #86aec8 highlights. Same brick model, teal-tinted.
- **Tail.** The last bundles leave the top at 1889–1890. Tail positions: y 172 at 1890, 272 at 1891, 348 at 1892, 420 at 1893. The last one lands at 1894, and loose ones settle by 1897.
- **Loose single bills.** 6–10 flat rectangles (≈30×15 px), flying out to the right at floor level (x 85–100% W, y 70–80% H) during 1880–1900. They then lie on the floor at the right (#586496 in shadow).
- **Build as** ~120 instanced rounded-box bundles spawned above frame top (y < 0) at 3–4 per frame for 32 frames, with gravity-like constant speed ~85 px/f. Give them random 3D spin and collide them into a heap shaped like a cone or ellipsoid at the hero's feet. Spray 10–15 off at the collision with the hero's head. Apply the blue room light so the falling ones look brighter green (they read lit by a top light) and the settled ones teal-blue.

---
## Captions (whole segment)
- **Font.** Montserrat ExtraBold/Black (single-storey "g", geometric "a"), lowercase as spoken. The sentence-initial words "Horse" and "So" are capitalised.
- **Colour and outline.** White #ffffff with a black outline ≈ 3 px at 720 W (≈4–5 px at 1080) plus a soft dark drop shadow (≈2–4 px blur).
- **Size.** Ascender-to-descender height ≈ 42 px at 720 W, so font-size ≈ 43 px at 720 (≈ 64–66 px at 1080).
- **Position.** Centred horizontally at x = 360. The text box spans y ≈ 883–925 px, so the baseline is ≈ 915 px (71.5% H) and the visual centre ≈ 902 px (70.5% H). The position is constant across all shots.
- **Behaviour.** One word or short phrase at a time, hard cuts between captions, no pop, scale or fade animation.
- **Timing (frames, inclusive):**

| caption | frames | caption | frames |
|---|---|---|---|
| buddy | 1605–1612 | the room | 1743–1752 |
| just | 1613–1619 | is | 1753–1755 |
| watched | 1620–1628 | still | 1756–1764 |
| Horse | 1629–1638 | laughing, | 1765–1780 |
| nine | 1639–1647 | the wire | 1781–1796 |
| come | 1648–1654 | starts | 1797–1806 |
| out of | 1655–1660 | clicking, | 1807–1819 |
| nowhere | 1661–1680 | and by | 1820–1827 |
| and | 1681–1684 | the time | 1828–1837 |
| steal it | 1685–1702 | it | 1838–1840 |
| by | 1703–1708 | spells | 1841–1850 |
| a nose. | 1709–1726 | out | 1851–1855 |
| So | 1727–1737 | nine, | 1856–1872 |
| while | 1738–1742 | nobody's | 1873–1890 |
| | | laughing | 1891–1901 |
| | | anymore. | 1902–1921 (end) |

---
## Key build notes / takeaways
- **Portal zoom.** Render scene B into a circle texture inside the lens. Scale the lens with exponential ease-in over ~12 frames (1619–1631), so the rim fully leaves the frame at 1631. Keep pushing the inner camera so the motion carries through.
- **Speed is sold by** a sharp 2D horse, a motion-blurred 3D background (directional blur 40–80 px during whip moves), crackling neon-pink barbed scribbles at the hooves redrawn every frame, a fast foreground rail parallax and a dust burst. There is no blur on the characters.
- **Sunset palettes.**
  - Meadow: saturated violet→magenta→salmon (#312386 → #9039a9 → #f96272).
  - Track: pastel lilac-pink (#a293cb → #e4b4c1) with orange clay (#c74e1d) and long shadows #722b20.
  - Room: cool navy/violet night (#19172f, #1f294f, #71688b) with one warm window (#ffcf6a).
- **Comic beat timing.** Laugh (1748–1837) → board finishes "NIN" → shock pop at 1839 (lady/old man) and 1848 (big guy) → money at 1858 (about 10 frames after the big guy's shock) → hold of stunned faces plus smug hero for 1 s (1891–1921) and the video ends on that hold.