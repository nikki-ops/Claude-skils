# SEG4 — 33.0 s – 44.0 s (frames F990–F1320, F = round(t*30))

Method: per-frame mean-abs-diff on 72x128 grey (ffmpeg scene filter at 0.1 finds NO hard cuts here — every change is a camera move or dissolve), 30 fps tile sheets (f0984..f1328 in fr/), face crops (crop2/, k/l/m/n/q/r.jpg), full-res PNG samples (full/). Colours are 8x8-px box means from full-res frames (rendered, so lit values, not albedo).

## 0. Shot / transition map

| # | Frames | Time | Content | In | Out |
|---|---|---|---|---|---|
| S1 | ~F950–F1055 (seg from F990) | 31.7–35.2 | Racetrack far end → PARKING lot push-in (continuation of the track pan that started at ~F948) | continuous camera from previous shot | cross-dissolve F1048–F1056 (8 f, linear) |
| S2 | F1048–F1290 | 34.9–43.0 | ONE continuous "oner" camera: betting-booth window close two-shot → pull-back → orbit/track right following the walker into the back room → counter two-shot → arc into bookie MCU → pan right to the milk bottle | dissolve from S1 | match-dissolve F1290–F1301 (11 f) on the milk bottle |
| S3 | F1291–>F1320 (continues past 44 s) | 43.0– | Main street finish line, milk cart race | dissolve, starts defocused + moving | — |

Internal events inside S2 (all continuous camera, no cut):
- F1056–F1084 slow push/drift on window two-shot (flash beat).
- F1084–F1088 CHARACTER-LAYER POSE DISSOLVE (4–5 f): only the left gambler's 2D layer cross-fades from "seated, arm raised, eyes glowing" to "standing, holding cash box, smug". Background keeps moving underneath (you see a translucent double head at F1085–86). Use: opacity crossfade of two character rigs, not a scene dissolve.
- F1088–F1099 dolly back + slight boom up (reveals bench, floor, window frame).
- F1099–F1122 camera yaws/trucks right (~70–90° arc around the walker), walker kept ~centre; motion blur visible F1100–F1110 (diff 25–28/frame, peak F1111).
- F1122–F1160 near-static two-shot at the counter (small drift).
- F1160–F1182 arc right + push-in onto bookie (diff 13–16/f), motion-blurred; lands F1182.
- F1182–F1276 bookie MCU, slow push-in (~4% scale over 3 s) + tiny dutch drift.
- F1276–F1290 pan/truck right: bookie slides to frame-left, milk bottle travels to centre (sets up match dissolve).
- F1290–F1301 dissolve; S3 arrives with heavy DOF blur + camera rising/pulling back with motion blur F1298–F1306, settles ~F1310.

Diff-curve evidence (mean |Δ| per frame, 0–255): F990–F1013 7.3→8.6→6 (S1 push decelerating), F1015–F1047 <2.5 (hold), F1048–F1068 7→16.6 (dissolve + S2 move), F1072–F1100 13–21, F1100–F1120 18–28 (orbit), F1125–F1155 1–5, F1158–F1183 7–16, F1185–F1270 1–4, F1274–F1290 7–16, F1292–F1316 7–27 (dissolve + S3 move).

---

## S1 — Parking lot (F990–F1056)

Camera: continuation of a long lateral track/pan along the racetrack (from F948 the camera pans left off the racing horse and tracks down the empty track toward the far turn). In-segment: forward dolly + zoom-in toward the PARKING sign, ease-out (velocity ~8 diff/f at F990, ~0 by F1015 ≈ 34.5 s), then hold with micro drift F1015–F1048. Framing ends as a medium-wide: sign at x≈37%, y≈45% of frame; fence diagonal from lower-left (y≈63%) rising right; track fills bottom 35%. Camera height ≈1.6–2 m, level, looking slightly down (~5°). Focal ≈50–70 mm equiv (strong compression of poplars vs sign). DOF: focus on sign/horse/cars plane; poplars & hills behind soft (blur ≈6–10 px at 720w), near track also soft (≈4 px) — tilt-shift-like miniature feel.

Environment (SDF build):
- Ground: plane, track dirt orange-terracotta with fbm noise streaks (raked, horizontal streaks); grass infield plane.
- Rail fence: white rounded posts (cylinders r≈0.04, h 1.0) every ~2 m + two horizontal rounded rails, sweeping curve along track edge; posts slightly warm white.
- Poplar trees: 6–8 tall "stacked-blob" trees — vertical column of 6–8 overlapping squashed spheres (r 0.6–0.9) on a thin trunk cylinder; total height ~10–12 m; bright cartoon green with darker AO between blobs.
- PARKING sign: rounded box billboard (2.0x1.0x0.08) on two thin white poles (h≈2.5 m), cream face with thin dark border; red serif "PARKING", blue "10¢", red right arrow → render as texture/2D overlay.
- Vintage cars (Ford Model-T style) parked in row behind fence: boxy rounded boxes with dark cabs, purple roof car, teal car, olive green car, open truck with spoked wheels (torus + cylinder spokes).
- Background: flat tan/ochre fields (patchwork bands), low blue-grey hills, far tree line as blurred blobs, pale hazy sky.
- Horse: grey dappled horse (white with grey dapples) with tiny rider (toon) + small toon attendant (white head, dark cap) standing by horse — both 2D at ~3% head size.

Colours S1 (F1044 samples):
- sky/haze #8CABCE (top) → #9FB6BE near horizon
- far hills #5D8499, field tan #BCB08F / #CCB88A
- grass #59A75C, lit tree #4B9552, tree shade #3F6F5E / #3D6550, trunk #88665D
- track near #C2693B, mid #CB7045, darker streaks #BA5C39
- fence warm white #DEC7BC / #EBD8B5
- sign red text #F53751, sign cream #FCE8BA, blue "10¢" ~#2C4C9C
- car purple roof #B397AE, teal #4987A9, olive #5E9379, horse dapple base #E4CBB1, rider coat #A6714B

Lighting: soft daylight, key from upper-left/front (~40° elevation), very soft shadows (cartoon ambient), shadow colour cool blue-grey (#5D6F7A), strong sky fill, slight warm haze/aerial perspective lifting blacks in the distance (fog factor ~0.15 at 60 m). No hard sun glints.

Characters S1: rider on horse + attendant beside horse (white head, dark cap, light coat); head ≈ 2.5–3% of frame width. Static/idle (no visible animation). Small paper betting slip held by attendant visible in crop (bill/paper).

Transition out: linear cross-dissolve F1048→F1056 (8 f): at F1052 ~50/50 (S1 poplars over S2 window).

---

## S2a — Betting-booth window, the FLASH (F1048–F1088)

Camera: starts as close two-shot (heads ≈37% frame width each), slow push-in + left truck F1056–F1083 (≈3–4% scale growth, ease in-out), then dolly back from F1086. Camera height ≈ seated eye level (~1.1 m), level. Focal ≈35 mm. DOF: characters sharp; window exterior mildly soft (≈2–3 px blur), street far end soft.

Environment:
- Interior wall with big window opening: weathered painted wood frame (rounded boxes, grey-cream #9D847D with wood-grain noise), inner mullions/frame painted dark green (#1D2D2B in shade, ~#2E5A4A lit), two horizontal transom bars dividing upper panes; yellow-painted sill strip (#9E7D39 lit → #D8B54A) on a wooden ledge.
- Bench under window: wooden box frame (#744C3F) with blue/grey-white striped cushion (stripes ~4 cm, colours #44485A / #7B7199 / #858F97).
- Floor: warm wooden planks (#744C3F / #8E695E) with plank seams, scattered paper tickets.
- Exterior (seen through window, could be a 2.5D backplate or SDF): 1920s main street receding to a vanishing point at x≈50% y≈42%: left side brick/blue/purple storefronts with awnings & signs, right side pastel yellow/pink/purple facades (yellow #B8A275, pink #806280 in shade), vertical marquee sign, US flag; pink-mauve brick building closing the street end; telegraph poles + sagging wires (thin dark lines); green rounded hill behind with a tree clump and a lattice tower (derrick/radio mast) on top; pale lavender sky #DAE3EF with cumulus #F9F6FC; road warm grey #92847E.
- Hanging "BETS OPEN" sign outside: rounded board on two chains, gold/ochre face (~#C9A040) with dark brown serif lettering "BETS / OPEN", thin dark border.

Light (pre-flash): bright backlit day; window is the main source (exposure on exterior high, sky near white #F9F6FC), interior warmer & darker (#352128 / #422E37 dominate shadows); characters lit front-soft (white heads read #F5EDF8 with lavender shade #E5D8F0 at bottom edge).

### FLASH construction (frame by frame)
Story: someone on the hill flashes a mirror (heliograph) — sun-star on the hilltop + glare beam onto the left gambler's eyes; the right gambler's raised silver spoon/mirror also glows.
- F1058–1063: base. Right gambler holds up a small silver oval-headed spoon/hand-mirror in his raised hand (screen-left hand), left gambler raises a small yellow object (#F9F29C/gold) in his right hand. Mid-glow region already present faintly around spoon head.
- F1064: spoon head turns into a soft vertical white pill of light (emissive capsule ~14x50 px at 720w, pure #FFFFFF core, gaussian falloff ~20 px). First yellow pixels on left face.
- F1064→F1067 (4 f ramp, ease-in): HILLTOP SUN-STAR appears at the hill crest above the street vanishing point (≈x 59%, y 30% of frame in F1078): white core disc r≈18 px (#FFFFFF), large soft bloom r≈90–120 px (sky near it #F1F1FF), 12–16 thin radial rays, unequal lengths (60–160 px), ray colour #D7DBC5–#FFFFFF at ~40–60% opacity, additive/screen blend, rays taper to 1 px; slight warm-green tint where rays cross the green hill. Count of near-white sky pixels: 40 (F1063) → 93 → 175 → 222 → 445 (F1067), plateau 450–510 until F1082.
- F1067: EYE LIGHT BAND on left gambler: horizontal soft yellow band across both eyes, full head width, height ≈ 55–60 px at 1280h (≈ 12% of head diameter), centre y at eye line. Colour core #FBD563 → edges #FEDEA2 / #FEE2AE → fades to white face #F6EEF9 within ~12 px (gaussian, feather ~10 px). It is NOT on the hat or below the nose. Blend: multiply-ish yellow over white then add glow (looks like an additive yellow gradient band clipped to the head shape + slight outer bloom that spills ~6 px beyond head outline). Inside the band each pupil gets a tiny 4-point white sparkle star (≈8 px) — "glinting eyes".
- F1070–F1071: second, horizontal glare streak from spoon to between heads (midglow peak 721/709 counts), i.e. a 1–2 frame brightening pulse (+25%) — the "flash" hit. Right gambler switches to squint >< eyes at F1070.
- F1072–F1082: hold; the sun-star slowly gains size with the camera push; spoon glow persists as vertical light pillar + soft halo; a light horizontal haze between the two heads (#9E8E8B → white).
- F1083–F1085: sun-star fades out (368 → 218 → 9 counts, 3 f), eye band fades with the pose dissolve (223 → 34 → 0). Spoon glow fades F1084–F1088.
Build recipe: (1) sun-star sprite = radial gradient + N=14 thin additive ray quads at random angles/lengths, slight rotation 0.5°/f; (2) bloom pass on everything >0.95 luminance (radius ~40 px, strength 0.6); (3) eye band = clipped linear-gradient rect inside head mask, colour #FBD563, opacity ramp 0→1 over F1064–1067; (4) eye sparkle = 4-point star polygons.

Characters S2a:
- LEFT GAMBLER (hero): white round head (#F5EDF8, slightly egg-shaped wider than tall, outline dark plum #25182B, brush stroke 5–7 px at 720w, thicker at bottom-right), small brown pork-pie/boater hat (crown #472D2E–#7B4E30, cream band #E4C7B0) perched on top, very small; red bowtie with white polka dots (red ~#C8323F lit, dots white, dark knot #581F33); mint-green shirt body (#74BEB2 / #7CB199) — capsule torso; thin purple-grey rubber-hose arms/legs (#4A3A5A–#563421 shaded) with simple mitten hands. Head ≈37% frame width (close) — F1060 head spans x 15→150 of 360.
  - F1056–F1066: happy closed eyes (^ ^ arcs), small smile; raised right arm holding yellow object (wave), left arm holds cash stack (green bills #90BD9D with cream band) in lap.
  - F1067–F1083: eyes become half-lidded smug "— —" with sparkle, smirk; holds.
- RIGHT GAMBLER: same head type, brown bowler (#764B36) with darker band, cigarette in mouth (white stick with orange tip), yellow-ochre plaid vest (#C0884F base with purple/red check lines) over white shirt, purple tie (#6135A4), small "M"/orange badge on vest. Raised arm holds silver spoon/mirror.
  - F1056–F1069 happy closed eyes, cigarette bobs; F1070–F1079 squint "> <" (blinded), mouth grimace; F1080 → wide round "O O" eyes (big circles with small dots, monocle look) + small frown mustache.
- Both sit on the bench; legs dangle; holds mostly on 2s.

## S2b — Pull-back & walk into the back room (F1088–F1122)

Camera: F1088–F1099 dolly back/up (heads shrink 37%→28%), then F1099–F1122 big right-yaw orbit+truck around the walker (~80° total, ease in-out, peak speed F1108–F1112 with directional motion blur ~10–15 px), keeps walker centred x≈50–55%, slight downward tilt revealing floor. Camera height ≈1.3 m. Focal ≈28–35 mm (wider: visible perspective on ceiling).

Environment (back room):
- Walls: deep red quilted/diamond-tufted wallpaper (lit #A24F48 / #A8524C, shade #74282D → #4A1320) above dark wood wainscot/dado (#895C41), cream crown moulding (#985D55 shaded), ornate pressed-tin ceiling in teal-grey (#384545 / #344243) with square relief tiles.
- Left wall: big black odds boards in wooden frames with white painted numbers "100-1", "10-1", "15-1", "20-1", columns of 1s (chalk) — box panels with texture; a wooden ladder leaning on the board (two rails + rungs, #825B43) with a tiny toon clerk (light-blue shirt, cap) standing on it.
- Back wall: framed horse picture (gold frame #EFAA52 / #DA885C, cream canvas with brown horse silhouette), wall sconce lamp with small shade.
- Ceiling: single bare bulb on a long cord (sphere r 0.06, emissive #FBFBFB, bloom halo ~25 px).
- Floor: wood planks completely littered with discarded paper betting slips — thousands of small rotated cards (white/cream/pink/green, #E2B27A, #C69663, #F7F9E4, accents #8E3A3A, #3A6A4A) — build as instanced thin boxes via hash noise on floor plane.
- Hard sun shaft from the window lands on floor right → overexposed warm patch #FBF4D0 / #FDF0BE with soft edge; light dust haze in the shaft.
Lighting: warm key = window sun (from left/behind camera at start, then from left as we orbit), very bright floor patches, interior otherwise dim red; bulb adds small warm point; heavy ambient occlusion in corners; bloom on sunlit floor.

Characters S2b:
- F1088: left gambler (new pose layer) stands holding cash box (tied stack, green #728E54 with cream band) at chest, smug side-glance, eyes half closed; right gambler seated, round shocked eyes, looks after him.
- F1090–F1099: smug idle (hip sway), eyes closed-lidded smile "he puts".
- F1100–F1122: WALK carrying box with both hands: rubber-hose legs stepping, step every ~6 f (cycle 12 f ≈ 2.5 steps/s), head bob ±3 px, slight forward lean; animated on 2s. Head ≈26% frame width.

## S2c — Counter two-shot (F1122–F1160)

Camera: settles F1122, near-locked with slow push. Framing: walker left (x≈30%), bookie right (x≈70%) behind counter; counter's brass edge cuts diagonally lower-right foreground (foreground counter front fills bottom-right 40%, very dark mahogany). Camera height ≈1.3 m, ~3/4 view onto counter. Focal ≈35 mm. DOF: shallow — foreground counter edge soft, back wallpaper soft.

Environment (counter):
- Counter: long box with green felt top (lit #1E2D32 → #294741 → #3D5450, felt micro-noise) + brass edge strip (#B38733 / #AA8031, thin rounded box with spec highlight) + mahogany raised-panel front (#390F10 / #380D14 / #58251F, inset rectangles).
- On counter: stacks of cash (rounded boxes, pale green #A3AD75 with cream bands), tall milk bottle (cylinder + rounded neck, glass-white/cream #AFA5AC with white "MILK RUN" label, slight transparency), green banker's lamps at back with glowing shades.
- Behind bookie: wooden cubby wall (#442923 / #39231E) with pinned paper notes (#937665/#A19888), red sign "I CREDIT · NO CRYIN'" (#985050 board, cream letters), long black banner high "NOT RESPONSIBLE FOR ERRORS IN WEIGHTS AND JOCKEYS" (#3D2D23 board, gold serif letters ~#C8A24A).
Characters:
- BOOKIE: white head (#E2E5EB) slightly larger, translucent green eyeshade visor (#2CAA75 rim, lit #62D390, light passes through → greenish tint on forehead), small dot eyes, wavy handlebar mustache line, purple shirt (#6E5EA2 / #897098) with dark purple vest/arm garters, pocket protector holding pens (red, yellow, blue), dark tie. Head ≈25% frame width in two-shot, 37–42% in MCU.
- F1124–F1129: walker lifts box over counter (arm arc up), bookie eyes widen.
- F1130: box slammed down → bursts into loose bills (fan of 6–10 bill quads, pale green) — F1131–F1146 walker keeps tossing bills from a hand-held stack in a repeating 4-f arc (hand low F1134 → mid F1135 → high F1136 → release over counter F1137) — "puts every dollar"; pile grows on counter.
- Bookie F1131–F1160: shocked open-mouth "O" (dark red mouth), wide round eyes, small speech-puff/sweat bubbles beside head (white rounded blob next to head at F1134+). Walker: smug lidded eyes, blink F1156–1157 (closed lines), then look.

## S2d — Bookie MCU (F1160–F1290)

Camera: F1160–F1182 arc right + push-in (lands with ease-out), then MCU with slow push (~4%) F1182–F1276, then F1276–F1290 pan right (bookie x 50%→25%, milk bottle → x≈50%). Camera at counter level, very slight low angle; focal ≈50 mm; DOF: bookie sharp, back wall softly blurred (≈3 px), foreground counter front blurred.
Lighting: warm low-key interior: rim/back from bulb and lamps (warm #4F2E23 spill on wood), key soft from front-left; the bookie's white head reads almost glowing (slight self-bloom); green bounce under visor; dark vignette corners (~-35%).

Bookie expression timeline (frame-accurate, crops k/l/m):
- F1163: sweat drop appears on right side of forehead under visor (teardrop, pale blue #C0E0F2 with darker blue outline, ~10% head dia), stays until ~F1201. Expression: flat brows, flat mouth, mustache.
- F1170–F1189: deadpan, tiny head bob. BLINK F1190–F1191 (eyes become horizontal lines), F1192 half-open, F1193 open.
- F1196–F1198: brows lift; F1199: mouth opens wide (wavering), F1200 eyes shut tight "≡", F1201: CRYING begins — eyes = closed downward arcs, mouth wide open bawling (dark red #7A1A2A mouth, pink tongue #E06A85), twin blue tear streams (light blue #A8D8F0 strips with dark outline) running from eyes down the cheeks to chin, small tear droplets flying.
- F1202–F1206: hand raises a single dollar bill (grey-green #A9B29A with dark ink border, 0.4x head size) from lower-left up to the eye.
- F1206–F1221: wipes tears with the bill — bill held over left eye, small back-and-forth rub (±6 px every 2–3 f), crying loop: mouth open/close pulses every 4 f (F1208/1212/1216/1220), tear streams flicker.
- F1222: crying stops instantly; F1222–F1224: bill swings up in an arc (~100°) and TUCKS INTO THE VISOR band on the left side, standing up at ~20° tilt like a press card (stays for rest of shot).
- F1223–F1236: deadpan smug "taking it" — half-lidded eyes, raised brow on one side, mustache smirk.
- F1238–F1247: LAUGH: eyes become round dots raised, mouth opens big "D" grin with top teeth row (white) + pink tongue; head bobs up/down ±4 px every 2 f (laugh chatter) on 2s.
- F1248–F1255: grin closed, teeth showing, mustache.
- F1256–F1266: laugh again with open mouth (talking "That horse"), F1262–63 big open O.
- F1266–F1276: closed-mouth smug, F1276 eyes closed "lost", F1278–F1290 talking grin (mouth shapes change every 2 f).
Secondary: shoulders/body static; head has gentle sway; all character drawings on 2s (camera on 1s).

## S2→S3 match dissolve (F1290–F1301)
Linear cross-dissolve 11 f. During it, the milk bottle on the counter (frame centre, x≈50% y≈60%) overlaps the milk bottle standing on an orange wooden crate in S3 — match-on-object. S3 starts very defocused (bokeh ~15–20 px) and in motion.

## S3 — Main street finish line, milk cart (F1291–F1320+)

Camera: F1291–F1306 rises/pulls back from the crate & bottle (ground-level, ~0.4 m) to ~2 m, slight tilt up, motion blur; settles ~F1310 into a wide low shot looking down the street. Focal ≈24–28 mm (strong perspective). DOF: mild, background crowd soft.
Environment:
- Dirt street (#83634B / #7F6145 / #755741) with scattered light pebbles (instanced small spheres #D8C8B0) and dark wheel ruts.
- Left: red brick building "…LONG MERCANTILE" (brick #B26C44 lit / #8C563D, cream cornice text), storefronts with teal facade (#35557B), "BARBER SHOP" etc., red-white-blue triangular bunting strings across street (#975555 red, white, blue).
- "FINISH" banner across the street: long flat board with black/white checkered edge pattern (black #1E1E28, white #F0F0F0), white serif "FINISH".
- Right: "DAIRY DA[Y]" white banner, more bunting, low pastel facades.
- Crowd: row of toon spectators behind a rope at left (white heads, colourful shirts) — 2D sprites.
- Milk cart: blue wagon box (#112B7D / #2D4C9A lit), red spoked wheels (#C0282F, shaded #441C21), white "MILK RUN" lettering on red panel, crates of bottles on top; pulled by white horse (#E8E4EC) with dust cloud trail (soft beige puffs #E6BD96, additive alpha particles).
- Foreground: orange wooden crate (#B74715 / #C8501E, plank seams) with a single milk bottle (blue cap) standing on it.
- Sky: saturated blue (#62A5EF top → #9ACAFA lower), puffy cartoon clouds (#D0D5DF, flat white with lavender shade).
Lighting: bright midday sun from front-right/high; crisp but soft-edged cast shadows to lower-left (long, cool #4A4458 shadow colour), warm bounce from dirt.

## Effects summary
- Flash/glare: see S2a recipe — 12–16 rays, white core, additive; eye band #FBD563 feathered; pupil sparkles (4-point stars).
- Bloom: global on highlights (sun patch on floor, bulb, sky, white heads) radius ~30–40 px at 720w, threshold ~0.9.
- Motion blur: camera-move frames F1100–F1112, F1165–F1180, F1298–F1306 (directional, ~10–20 px).
- Particles: flying bills (F1131–F1146), tears/droplets (F1201–F1221), dust trail behind milk cart (S3), static paper slips on floor.
- Vignette: interior shots ~-30–40% corners.
- Pose dissolve on character layer F1084–F1088.

## Captions
- Font: heavy geometric sans, lowercase (Montserrat ExtraBold/Black-like; "a","e","g" single-storey shapes), white #FFFFFF, black outline ~3 px + soft dark drop-shadow (~4 px blur, 50%).
- Size: ascender-to-baseline 34 px at 720x1280 (h-height) → font-size ≈46–48 px @720 (≈70 px @1080x1920).
- Position: centred x=360; baseline y≈917 (71.6% of height); text top ≈883.
- One word/short phrase at a time, hard switch on the frame (no pop, no fade, no highlight).
- Timing (start frame → text): F990 "it's" (from earlier) · F995 "practically" · F1011 "in the" · F1017 "parking" · F1028 "lot." · F1038 "Then" · F1050 "the hill" · F1064 "flashes" · F1085 "and" · F1090 "he puts" · F1100 "every" · F1113 "dollar" · F1123 "he has" · F1136 "on" · F1140 "horse" · F1148 "nine." · F1160 "The guy" · F1168 "behind" · F1176 "the" · F1178 "counter" · F1189 "almost" · F1200 "feels" · F1208 "bad" · F1219 "taking" · F1231 "it," · F1238 "pal." · F1253 "That" · F1262 "horse" · F1268 "lost" · F1278 "a race" · F1286 "to the" · F1292 "milk" · F1302 "cart" · F1312 "and" · F1316 "it was" (±1 f).

## Key build numbers
- Head diameter (% frame width): S1 rider ≈3%; S2a close two-shot 37%; S2b 26–28% (walker), seated right guy 15%; S2c walker 19%, bookie 25%; S2d bookie 37→42%.
- Outline: dark plum #25182B, 5–7 px brush at 720w (varying width), heads slightly bloom against dark rooms.
- Character drawing on 2s, camera & 3D on 1s.
- Transitions: 2 scene dissolves (8 f, 11 f linear), 1 character pose dissolve (4–5 f); everything else continuous camera moves with ease-in-out.