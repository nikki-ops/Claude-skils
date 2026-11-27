# SEG1 report — ref.mp4 0.000–11.000 s (frames 0–329 @30fps, 720x1280)

Frame index n = round(t*30). Pixel coords are in full 720x1280. Hex = 5x5 average.

## 0. Global findings (apply to ALL shots)
- **No hard cuts in 0–11 s.** ffmpeg scene score never >0.08 (max 0.080 @ f29 = pig smash). The segment is 2 continuous "camera worlds" joined by ONE dissolve:
  - World A (racetrack): f0–f108, one continuous camera with a long pan/crane.
  - Dissolve f100–f108 (9 frames, linear cross-fade, no blur).
  - World B (betting room / window bench): f100–f329+, one continuous camera with move-hold-move pushes.
- **Camera rhythm = move / hold / move.** Each move is a bell-shaped speed curve (ease-in-out, cubic-ish), 20–30 frames long, then a hold of 15–50 frames. Mean abs frame-diff (proxy for speed, 180x320 gray): peaks 25–34 during moves, 0.4–3 during holds.
- **Post look:** whole frame (3D + 2D) has a "toon ink" pass: dark thin outlines on 3D edges (plank edges, fence posts, cloud silhouettes have a broken brushy dark-lavender outline), slightly painterly/posterised shading, very saturated. Apply: Sobel-on-depth/normal outline ~1.5–2px colour ≈ #3b2a40 at 60–80% opacity + mild posterise. No film grain, no visible vignette (corners at f170: top #0f0d1b is the dark ceiling beam, bottom #805c50 floor — i.e. scene content, not vignette).
- **No motion blur** on camera moves (moves are smooth, edges stay crisp), except a subtle radial zoom-blur on floor periphery during the fast push f155–f163.
- **Characters are flat 2D cards placed in 3D** (they parallax with the set: during pans they slide out with the table/bench at the same speed as the set at their depth). They receive the scene grade: outdoors head white = warm #fcfaf8 with a cream light-wrap rim on the sun side (#fff6e1, ~6px inside the outline); indoors head = cool #e8eef6 with lavender edge shading #dbd1ed near outline. **No contact/drop shadows** under feet (checked f112, f170).
- **Characters animate on 2s** for limbs (holds 2 frames), facial swaps on 1s/2s. They do NOT lip-sync the narration (narrator VO); mouths are expressions only.
- **Captions**: see §6. Continuous music bed (no silence >0.1 s at -30 dB).

## 1. Shot / move table
| # | frames | time | what | transition in / out |
|---|---|---|---|---|
| A1 | 0–36 | 0.00–1.20 | Hero + piggy bank on wooden table at racetrack, static camera, smash | open / continuous into A2 |
| A2 | 37–92 | 1.23–3.07 | camera pans right + cranes up over track, racing horses + dust, dust "wipe" reveals slow horse | continuous / hold |
| A3 | 92–99 | 3.07–3.30 | hold on slow grey horse + jockey behind daisy-garland fence | hold / dissolve |
| X | 100–108 | 3.33–3.60 | **dissolve** A3→B1, 9 frames, linear opacity, both images static | |
| B1 | 105–149 | 3.50–4.97 | wide static: betting room, crowd laughing at hero | dissolve in / continuous push |
| B2 | 149–176 | 4.97–5.87 | **fast push-in (dolly forward)** through crowd to window bench, peak speed f159–164 | continuous |
| B3 | 176–197 | 5.87–6.57 | slow creep push-in (diff 5–8) on 3 men on bench | |
| B4 | 197–216 | 6.57–7.20 | push-in + slight tilt up, peak f203–206 | |
| B5 | 216–232 | 7.20–7.73 | near-hold; grey man walks out left dropping bills | |
| B6 | 232–260 | 7.73–8.67 | push-in + tilt/boom down to MCU of hero, peak f243–247 | |
| B7 | 260–311 | 8.67–10.37 | locked hold (diff 0.4–2) on hero MCU; mirror gag | |
| B8 | 311–~335 | 10.37–11.0+ | **pull-out (dolly back) + truck left**, peak f320–322; reveals new character (bowler/plaid) on bench left → 2-shot | continues into seg2 |

## 2. Shots in detail

### A1 — f0–36 "He bet his life savings"
**Camera:** locked, eye level ≈ hero chest (≈1.2 m), slight low angle (looking a little up: horizon at y≈820, table top seen from above at ~25°). Normal lens ~35 mm equiv. DoF: hero+pig+table sharp; clouds/distant fence slightly soft (≈2–3px blur).
**Framing:** hero head centre (290,500), head diam ≈240px = **33% frame width**; hat top y≈360. Pig centre (480,790), ~230x290 px. Table occupies bottom-right quarter from y≈890 to bottom, extends off right & bottom edges.
**Environment (build):**
- Sky: vertical gradient #2772f1 (top) → #5497fe (y300) → #64a6ff (y480) → horizon haze #cdbfc0 (y820). 
- Clouds: 2 big puffy dome clouds left (x0–200,y540–700) and right (x380–720,y540–690), cream lit tops #fef2da, underside lavender-cream #f5e9e0/#fbefd9, broken dark-lavender brush outline. SDF: union of 5–8 spheres squashed in Y, flat bottom (cut by plane), soft noise displacement.
- Background: white wooden rail fence (posts+2 rails, rail colour #b195c6 in shade), behind it a low lavender wall/inner-rail band #b49cd6 (y≈840–870), distant green treeline #7c9093 hazed, track dirt orange #cd5e1f in shade, sand #d28a33 in sun at bottom-left.
- Table (rounded boxes): top = 3–4 planks with gaps (gap colour #db4918), lit top #dd4c14–#ec5819, front apron dark #43130e/#3b1619, legs lathe-turned cylinders (stack of cylinders/spheres) #6c2317. Painted wood-grain noise streaks along planks. Table casts long violet shadow down-left on sand.
- Piggy bank (3D, glossy ceramic, toon-shaded): body ellipsoid #fb7186, highlight (spec, upper-left) #fdafa5, shadow side #e0567f / ears #ba5a80, snout cylinder w/ nostrils #6f132b, 4 stubby cylinder legs, coin slot on top, small yellow flower decal on flank. Dark outline.
**Lighting:** sun high and slightly behind-right (back/side-light): table top bright, front face very dark, shadows fall toward camera-left. Fill = sky blue, shadow tint violet #4a3d5e–#53435b. Warm cream rim on hero head left edge.
**Hero (char "boater"):** straw boater hat (crown #693927 dark brown top, cream band #f8e4b8, brim #43313d), white round head (slightly egg-shaped, wider at top), dark plum outline ~7px (#1e1626-ish, sampled AA #797075). Body = mint capsule #7cecbe with darker teal side shading, red bow-tie #d56573/#f34359 with white polka dots. Thin dark legs #261425 visible under table. Left arm hangs, right arm raised holding wooden mallet/gavel (head #631f0d, handle #572417, dark outline).
**Animation (hero face, on 1s):**
- f0–6 smug (half-lid eyes, one-sided smile "J" mouth).
- f7 half-blink, **f8–9 closed** (eyes as horizontal dashes), f10–11 open with brows raised.
- **f12–13 closed** again (squint), mouth small.
- f14–26 determined: narrowed eyes, angled brows (inner up), mouth small "o"/pursed. Head micro-bob ±2px every 2 frames.
- Hammer: f0–26 raised, slight wobble ±3° (hand bob on 2s).
- **f27 anticipation**: arm stretches up straight, mallet scaled ×1.5 (squash-stretch exaggeration).
- **f28 impact smear**: mallet head drawn buried in pig (pig still intact, crack lines appear).
- f29 pig crack-burst (scene diff jump 18).
- f30–36 eyes closed content smile (^_^ dashes + smile) during explosion.

### A2 — f37–92 "on the slowest horse in the race"
**Camera move:** continuous from f37: pan right (yaw) + truck right, ease-in f37–41, fastest f41–48 (frame-diff 25), decelerating to f63, second smaller push f64–91 (diff 10–15) continuing right + crane up & forward, settles f92. Total travel ≈ 1.5 screen widths right. Hero & table exit frame left by f52 (hero card moves with table = same depth).
Lens normal-wide ~28 mm, camera height ≈ 1.5 m rising to ≈ 2.5 m.
**Environment (racetrack, wide):**
- Sky #3884f5 top → #6aaafe → #ece5e3 at horizon (y≈560). 1 large dome cloud (centre-left, (220,420), ~380x170px) lit #fef2da, underside #ccd2ea.
- Far: lavender-blue hills #c5cad9, snowy mountain cone right (#fdf1db), row of tall dark cypress trees far right #3c7440, green infield grass #3f911b, small red/pink barn-dome far right.
- Mid: white rail fence running diagonally away to right vanishing point (posts every ~60px, top rail draped with green garland with zig-zag swags), lavender inner-rail board #9688b9 under it, orange dirt strip #d1601f/#b4511a.
- Foreground: wide sand track #da9334 (lit) / #c08551, with **long diagonal shadows of the fence posts/rails** in deep violet #4a3d5e running lower-left (strong graphic element). Bonus: in f47–62 table and piggy debris visible in lower-left foreground.
- Racing horses: 5–6 brown horses with tiny jockeys (2D-ish white heads, coloured silks) galloping right→left at mid-distance along the fence (y≈720–800 at f47), fast; massive dust cloud trail behind them #fedebe / #edbf9d with darker tan core #dea068, sprinkled with flying brown dirt clods (3–6px dots, ~30–60 per frame, ballistic arcs). Dust is semi-transparent, soft, lit warm.
- **Dust wipe**: f66–80 camera passes through the dust wall (whole lower-mid frame hazed), slow horse fades in through dust f74–84.
**Debris from smash (f29–62), particles:**
- Pig shards: 15–25 irregular polygons (4–6 verts), 20–70px, pink outside #fb7186/#e0567f, cream ceramic inside #f3e4d4, dark outline 3px, rotating 10–25°/frame, ballistic up-and-out from pig centre then gravity; big shards land and slide on table.
- Coins: 30–50 silver discs (pale #e8eef4 with white spec, grey rim), 12–25px, plus 10–15 copper coins #e07a35 (8–14px); spin (ellipse squash), spray up to top of frame (y≈0–200 by f36), fall with gravity, some bounce on table.
- Dust puff: cream #fbe6c8 soft blob (radius ≈150px) expanding f30–40 behind pig, fading by f45.
- Some 2D smear frames at f29 (crack burst star).

### A3 — f92–99 "The whole..." (hold), slow horse
**Camera:** settled, slight drift. Telephoto-ish (~70 mm): background compressed and **strongly hazed/defocused** (contrast low, sky #a7bee9, distant hills lavender #d7ccd4, mountain #f4ebd8, trees #93baac, red barn #d381a2, grass #95af7c). DoF: fence sharp, horse slightly soft, BG blur ≈6–8px + haze.
**Objects:** white wooden fence FG (posts box 30x220px, rails lavender-shaded #b399d0, outlines), green garland (#3a8f2a-ish rope) with white daisies (white petals, yellow centres) on top rail; track dirt orange #cf733d, FG sand #eaa33d with violet shadows #b47e4c→#53435b.
Slow dappled-grey horse (3D, painterly dapples, cream #f8dba9 lit / #dcba8d shade, dark mane #664d45, leather bridle) walking slowly right→left behind fence, head down. Jockey = 2D toon: tan-brown flat cap with pom (#b6835f), moustache, brown capsule body #be946b, holding open newspaper ("The Daily …" headline "HORSE LOSES RACE… MILK CART" style tiny text), saddle #c98143.

### Dissolve f100–108
Straight linear cross-fade, 9 frames, A3 static, B1 static. B fully opaque by f108–109.

### B1 — f105–149 "betting room is laughing at him" (wide)
**Camera:** static wide, eye-level ~1.4 m, normal ~30 mm, centred one-point perspective looking at the back wall; DoF: FG floor tickets (bottom 20%) blurred ≈4px, dark teal FG ledge band y>1200 (#123136, out of focus), back wall sharp.
**Environment (build):**
- Ceiling: dark teal panel/beam #233747 with grey beam #615f70 across top (y≈140).
- Back wall = giant **tote odds board**: dark navy chalk panels #252e45/#1d253d framed with thin gold/brass trim #583a1a–#c8a050. Text (cream chalk/serif, gold): top-left "WINNER", top-right "RESULTS", left column odds "F 1-5", "S 4-1", "E 6…", "CE 8…", centre plaque "9 MILK RUN 100-1" (cream label with black number badge), right column horse names on cream plaques: "TIN LIZZ…", "HOTSY TOTSY", "7 ALONE…", "…IVVER". Build as textured planes (canvas text) on boxes.
- Centre: window (white-frame box with teal mullions) through back wall, showing bright street (sky #a9dcfa, street #826759 in shade) — rendered as distant set or 2.5D backplate.
- Under window: low wall brown #472c13; wooden bench with blue/white striped cushion (#41497a / #adb3da) on raised wooden plank platform #573f3b.
- Right: tall wooden ladder (2 rails + rungs, #7c7360) leaning on board; ladder man on it.
- Floor: grey-beige carpet/stone **covered with hundreds of discarded betting tickets** (flat rectangles ~30x18px, mostly cream #a29176 in shade with ~15% coloured: pink #aa5768, yellow #967937, green, teal, light-blue), random rotation, dense overlap — scatter instanced thin boxes. Wooden plank floor patch in centre (warm brown) where bench sits.
- A single red ticket falling from top centre (f112, y≈20).
**Lighting:** interior, dim cool ambient (#3a4560 shadow), soft top light, window is the brightest element (bloom-ish). Overall darker/cooler than outdoors; characters graded cool.
**Characters (scale = head % of width):**
- FG left standing "plaid": bowler hat #4c3229, cigar #a8998f, yellow plaid suit #c98e26, purple tie, head 28% at (150,560). Animation: f118–128 smirk w/ cigar; f129 squint; **f130 eyes ^ ^ closed laugh**; f131–149 big open laughing mouth (dark-red interior + tongue), head tilts back ~10°, body bounces on 2s (±6px); **hat pop**: f133 hat lifts off head, f135–148 hat floats ~40–60px above head, wobbling ±10°.
- On bench (centre back, heads ~10%): grey suit old man with round glasses+moustache #7c89af, hero (mint #7cecbe-ish but cool), cap man in rust vest #bb5634. From f126 all laugh: grey man covers mouth with hand (f126–165), cap man laughs with closed eyes.
- Right standing woman: teal dress #098ba6, magenta beret #ac256b with white feather, laughs eyes closed f126+.
- On ladder: blue cap man, laughs.
- Hero during laughter (f118–150): stays deadpan smug, eyes half-lidded.

### B2 — f149–176 fast push-in
Dolly forward ≈ 3–4 m toward bench; speed bell curve: ease-in f149–155, max f157–166 (diff 30–34), ease-out f166–176. Slight tilt down keeping bench centred. FG plaid man and teal woman slide out L/R edges (f155–162) with parallax; board text grows ("9 MILK RUN 100-1" plaque fills top f160). Subtle radial zoom-blur on floor periphery f156–163 (concentric streak, ~8px). Ends framing: window fills upper half, bench with 3 men in middle.

### B3–B6 — bench by the window (f165–260)
**Framing at f170:** window frame (white-washed wood #7c7a8a/#89849b outer, teal mullions #183942/#20343c) occupies y≈60–620; bench y≈740–880; floor below. Heads: grey man 22% (x≈90..260,y≈420..580), hero 22% (290..450), cap man 24% (510..690). Camera height ≈ bench seat +0.6 m, ~35 mm, mild DoF: street through window slightly soft.
**Window view (backplate, 1920s small-town main street, one-point perspective):**
- Sky #31536f…#63b3fc (top) → #b4e3fd near roofs, small cumulus #edf1fd/#f5fbfc.
- Green hill centre #91d482 with a white roller-coaster/ferris structure on top.
- Left: red-brick & yellow 2–3 storey shopfront buildings (#765721 / yellow #d8b040), striped awnings, telegraph poles with many sagging black wires.
- Right: grey stone bank building "FURLONG SAVINGS …" sign (#3b5a9b stone in shade, cream sign), street lamp posts, tall arched windows.
- Street: sandy road #c49151 with rail/tram tracks, vintage Model-T car centre-left (black, boxy), tiny pedestrians.
- Hanging wooden sign inside the window top-left: "BETS OPEN" (board #86682e/#634c22, dark serif text, 2 chains).
- Window sill / ledge: pale yellow-cream #d6d2ef-ish in shade, warm yellow strip in sun.
**Bench:** wooden frame #45281a (dark) with thick cushion: blue #40496a / white #c4c9db horizontal stripes (ticking pattern, thin dark pin stripes), rounded box. Back of bench = wall planks dark brown #35201e.
**Floor:** wide wooden planks running toward camera, warm #a37961 lit / #966650 / #c59b80 highlights, dark plank seams, nail-hole dots, soft window-light pool in centre. A few stray tickets on floor (f165–180 right side).
**Lighting:** window back-light (bright sky), interior fill warm-neutral; heads cool white #e8eef6, mint body darker #4dc5bf indoors.
**Characters & events:**
- Grey man (left): grey-blue suit #888ea4 with gold buttons, round wire glasses, white moustache, frowning. f165–196 arms folded/holding wad of cash. **f204–221 flicks single dollar bills** off a wad: bills ~28x12px pale grey-green #c8d0c4 with dark outline, tumble down rotating ~30°/frame with side-sway, fall ≈8–10px/frame, 6–10 bills in air at a time, land on floor f225–245. **f222–234 he turns and walks out of frame left** (2D walk on 2s, card slides left ~25px/frame).
- Cap man (right): brown flat cap #775a54, moustache, rust vest #af5640 with suspenders, arms crossed; pushed out of frame right by camera B4 (f200–210).
- Hero: sitting on bench edge, legs dangling (rubber-hose, knees bent, L-feet), hands on knees. Face: smug half-lid smile. Blinks: **f196 half, f197 closed, f198–199 brow-raise smile**. Body sway ±2px on 2s.
**Camera B4/B6:** B4 push f197–216 (+ slight tilt up). B6 push f232–260 with boom down (frame content moves up: dy +4…+12/frame at 180px scale), ends MCU: hero head 46% width (x≈230–560, y≈330–720), hat top y≈350, bow-tie y≈735, bench cushion y≈950–1050.

### B7 — f260–311 hold, "smiling because he has a mirror."
Locked camera (diff 0.4–1.5 = pure character anim).
Hero face: f260–270 smug; **f271 half, f272 closed, f273 open** (blink); f274–289 smile + brow flicks; **f290–291 closed** (blink); f292–296 open.
Mirror gag: f297 hand comes from chest holding round hand-mirror (gold rim, back side brown #8a5a2a) — f297–300 hand rises (on 2s) in arc from bow-tie (y≈760) to beside head (y≈450, x≈200), mirror flips **f301–302** (eyes closed f301–302 while flipping), f303–311 mirror face (glass #eaf0f7 with white spec, gold rim #c8a050) held at left of head, slight ±3° wobble; hero eyes half-closed admiring.

### B8 — f311–329(+) pull-back reveal "Wait,"
Dolly back + truck left, ease-in f311–318, max f319–323, ease-out to ~f335. Frame widens from MCU to 2-shot: window frame back in view (outer frame dark maroon top #420e26 at f329).
New char ("bowler" 2): enters frame left at f318 (head first visible f318–320 because of truck), sitting on bench left of hero. Black bowler #1b101e, cigar #cac3a4 in mouth corner, yellow-ochre plaid vest #ae8624 with dark plaid lines #4e343f, purple tie #3b226a, orange pocket square #de6714, navy legs #2c203f. Head 35% width at f329 (x≈60–310, y≈440–700), hero head 28% (x≈380–590). Face f318–321 squint side-eye, **f322–329 talking: mouth shapes change every 2 frames** (open "a" f324–325, "w" f322, wide f326–327, smirk f328–329) = this char speaks "Wait," (2nd voice). Hero keeps mirror up, eyes half-closed.

## 3. Colour palette summary (sampled)
- Outdoor sky: #2772f1, #3884f5, #5497fe, #64a6ff, #7cb3fe, horizon #ece5e3 / #cdbfc0
- Clouds: lit #fef2da, underside #ccd2ea / #d7d5e5 / #f5e9e0
- Track: orange dirt #cd5e1f / #d1601f / #b4511a; sand #da9334 / #c08551 / #eaa33d; fence shadow violet #4a3d5e; inner rail lavender #b49cd6 / #9688b9 / #b399d0
- Grass #3f911b, cypress #3c7440, far hills #c5cad9, snow peak #fdf1db
- Dust #fedebe / #edbf9d / #dea068
- Table wood #dd4c14 / #ec5819 / gap #db4918 / dark face #43130e / leg #6c2317
- Pig #fb7186 / #fdafa5 / #e0567f / #ba5a80 / nostril #6f132b
- Betting room: ceiling #233747, beam #615f70, board #252e45 / #1d253d, trim #583a1a, window sky #a9dcfa, wall #472c13, bench blue #41497a / white #adb3da, floor #573f3b, tickets #a29176 / #aa5768 / #967937, FG ledge #123136
- Bench shot: window mullion #183942, frame #7c7a8a, sky #63b3fc→#b4e3fd, cloud #f5fbfc, hill #91d482, street #c49151, stone bldg #3b5a9b, sign #86682e, bench #40496a/#c4c9db/#45281a, floor #a37961/#966650/#c59b80
- Characters: head out #fcfaf8 / in #e8eef6, head edge shade #dbd1ed, rim (sun) #fff6e1, outline ≈#1e1626, legs #261425 / #2c203f, mint body #7cecbe (out) / #4dc5bf (in), bowtie #d56573/#f34359+white dots, boater crown #693927 band #f8e4b8 brim #43313d, plaid yellow #c98e26 / #ae8624, tie #3b226a, grey suit #7c89af / #888ea4, rust vest #bb5634 / #af5640, teal dress #098ba6, magenta hat #ac256b

## 4. Characters — construction notes
- Head: near-circle, slightly flattened bottom/wider top, diameter = 1.0 unit; outline 0.025–0.03 of head diameter (≈7px at 240px head), uneven brush stroke (thicker at bottom-right). Soft inner shading gradient (lavender) at lower-left edge; sun rim cream on lit side outdoors.
- Eyes: small dark ovals (#3a3040) under heavy short brow strokes; half-lid = flat top line over oval; closed = horizontal dash ~0.18 head wide. Mouth: thin curve/“J” smirk; laughing = open D shape dark red with tongue.
- Body: capsule/bean ≈0.75 head wide × 1.0 head tall, under the head with slight overlap; thin hose limbs ~0.04 head thick, dark navy; feet = short L line; hands = small circles/mitten.
- Hats sit on top, ~0.75 head wide, slight tilt; hat-pop = translate up 0.2–0.3 head + rotate.
- Card-in-3D: each char is a billboard at a 3D depth; camera moves parallax them correctly; they get scene grade (warm outdoors / cool indoors) but no cast shadow.

## 5. Effects summary
- Pig smash (f27–45): stretch anticipation f27, smear impact f28, burst f29; shards 15–25, coins 40–65 (silver+copper), dust puff 1 large; gravity ≈ +2.5px/frame²; shards spin 10–25°/frame; debris persists on table to f62.
- Race: dust trail (volumetric/billboard puffs) + 30–60 dirt clod dots per frame; dust wall used as wipe f66–84.
- Dollar bills (f204–245): 6–10 bills, tumbling, sway, slow fall.
- Floor tickets (B world): static instanced scatter, hundreds.
- Radial zoom-blur during fastest push (f156–163), subtle.
- No lens flares, no speed lines, no glow except bright window slight bloom.

## 6. Captions
- Font: heavy geometric/grotesk sans (Montserrat ExtraBold/Black-like), mostly lowercase as spoken (sentence-initial capital: "He", "The", "Wait,"), punctuation kept (".", ",").
- Fill #FFFFFF; black stroke ≈5–6px (outside) + soft dark shadow; no box.
- Size: cap-height ≈31px, ascender-to-descender 43px ("laughing" y 882–925) → **font-size ≈44px @720w (≈66px @1080w)**.
- Position: centred x=360, text block y≈882–925 (baseline ≈916), i.e. ~70% down the frame; constant across shots.
- Animation: **none** — hard swap on the frame, 1–3 words per chunk, synced to VO words.
- Timing (frame in–out): He bet 1–9 | his 10–14 | life 15–24 | savings 25–41 | on the 42–46 | slowest 47–65 | horse 66–73 | in the 74–79 | race. 80–92 | The whole 93–104 | betting 105–116 | room is 117–125 | laughing at him 126–148 | because 149–157 | all day 158–170 | long he 171–187 | hasn't 188–195 | bet 196–202 | a single 203–220 | dollar. 221–234 | He just 235–243 | sits 244–250 | by the 251–258 | window, 259–271 | smiling 272–289 | because 290–296 | he has 297–305 | a 306 | mirror. 307–318 | Wait, 319–(330+)
- Visual events are staged to land on caption words: smash on "savings" (f28), dust/race on "slowest horse", reveal of slow horse on "race.", dissolve on "The whole", laugh on "laughing", bills drop on "a single dollar", mirror on "mirror.", new char on "Wait,".

## 7. Working files
contact sheets cs10_*.jpg (10fps), f30_*.jpg (every frame, 6x5), tr1/2/3.jpg (transitions), head1–4.jpg (face anim), smash*.jpg, full_<n>.png keyframes, samp2.py (colour sampler).