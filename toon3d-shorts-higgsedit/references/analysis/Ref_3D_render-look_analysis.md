# Reference render look — boat-lantern/refs/ref.mp4 (720x1280, 30 fps, 64.2 s)

Frames sampled: every 3 s, t = 1, 4, 7 … 64 (22 frames, `f/tNN.jpg`); zoom crops 2–3x lanczos in `z/z1..z9.jpg`.
Scene map: t01 seaside-ish deck/table under blue sky · t04/t61/t64 betting room (odds boards, plank floor, paper litter) · t07/t10 sunny street seen through window · t13/t22 meadow / farmland + easel · t19 iris-wipe circle on black · t28/t31 grandstand "HILLSIDE DOWNS" · t34 parking/cypress field · t37 betting room with bordeaux wall + sun patch · t40/t43 bordeaux back room, green felt counter · t46 street finish-line race · t49/t58 race + crossfade · t55 dusk/sunset track.

**One-line summary:** a "painted-3D" look in the style of *Cyanide & Happiness 3D / Genshin-lite*. The 3D sets are smooth-lit (not hard cel bands), use hand-painted albedo textures with ink outlines on silhouettes AND the main creases, have strong saturated sky-blue/terracotta colour, cool-violet shadows, heavy bloom on sun hits, and medium–strong DOF. Flat 2D stickmen with thick aubergine outlines sit on top, with a soft 2-tone scene tint.

---
## 1. Shading model
- **Smooth, not banded.** Lambert-style falloff with a soft terminator (~10–15 % of the form). Read it as 2 tones plus a gradient: lit ≈ albedo×1.0, shadow side ≈ albedo×0.45–0.6, hue-shifted toward violet. Plan for an effective **2 main tones + soft ramp**: `smoothstep(-0.1, 0.25, NdotL)` matches it well. Hard cast shadows (sun) are the only "crisp" step.
- **Specular:** almost none. Faint broad sheen on the felt and varnished wood (≤ +8 % lum, lobe ~ power 8–16). No sharp hotspots, except metal/glass (window glass gets a flat light-blue reflection plus a soft diagonal streak).
- **AO:** present but soft and coloured. Interior corners (board/wall, floor/wall) darken 25–35 % over a radius of ~0.3–0.5 m (40–80 px at 720p). AO colour is a warm brown indoors, ~#2f1b1b–#3e2a24, and a violet-brown outdoors.
- **Ink outlines on 3D:** yes. Colour is dark aubergine/brown, **#1b0a1a–#2a1418** (the blackest in-frame pixel, t01 = #1b0a1a). Lines appear on silhouettes and also on the main creases and plank seams (table plank seams drawn as ink). Width: **4–6 px foreground** (t01 table edge = 3 samples at 2 px ≈ 5–6 px), **2–3 px mid**, **~1 px / dissolved far away** (distant street façades have thin 1 px lines). Lines are slightly wobbly/hand-drawn (the table edge in z1 shows uneven width), so they are not pure screen-space constant.
- **Textures:** hand-painted albedo plus low-freq noise. No photoreal maps.
  - **Wood (table, deck, t01):** orange-red planks, albedo ~#bd441d (lit) → #80281a (top in shade) → legs #511d20. The grain is drawn as wavy darker strokes (≈ albedo×0.7, 1–2 px wide, long sine-like lines along the plank) plus subtle per-plank variation of ±6 % value. Seams are ink-dark (#2a1418), 2–4 px.
  - **Wood floor (betting room, t37/t04):** pale honey-brown **#865a45 (shade) – #b2856c (lit)**. Planks run diagonally away. Plank width ≈ **1/9–1/10 of frame width** in mid-ground (~75 px at 720). Plank gaps are dark brown #3a2219, ~2 px, with staggered butt-joints every ~4–6 plank widths. Grain is barely visible. Value variation per plank is ±5–8 %, with tiny dark knots/specks. No outlines on gaps beyond the dark seam itself.
  - **Wallpaper (bordeaux):** solid crimson-raspberry **#954f51 – #9c474e**, with a mottled, sponge-painted value noise of ±8 % (fbm, scale ~ 15–30 px). There is no repeating pattern. Below it sits a darker wood wainscot #8d5941, with a thin dark dado line. Gold picture frames: #e8c040-ish.
  - **Grass (meadow t16/t22):** flat green ground **#2e8831 – #5cb550**. Tufts are drawn as 2D-ish blade clusters (long tapered blades in 3 greens: #2a7a2c / #4caa3e / #8fd070) only in the foreground. Mid/back grass is flat colour plus large patchwork fields (yellow/olive/blue patches) and a slight noise.
  - **Trees (t34):** cypress built from stacked lumpy blobs. Each blob has its own soft shade, with a darker green inked crease between blobs (#2c5a2a). Lit side #4c8d56, highlight #6fbf5a.
  - **Paper litter floor:** a texture of overlapping beige tickets (#ab8565 shade / #e8d5b0 lit) with sparse coloured confetti (pink, teal, yellow).
  - **Sky (day):** vertical gradient, no noise. t01: y0 **#316fe5** → y100 #3b7ef0 → y200 #4b8df7 → y300 #5c9cfb → y400 #66a3fc → y500 **#6caafc** (horizon whiter, ~#9ccbfb). Other day skies are lighter: t10 #81c8fc, t16 #84c8f8 top → haze #c5e3e7 at horizon. t31 grandstand: #4888f2.
  - **Clouds:** big cumulus "cauliflower" puffs, cream-white **#fff5dc / #f2f6ff**, with a soft lavender-grey underside (#c9c3e0). The cloud edge is soft (3–6 px feather) with no outline. Clouds are painted cards, mildly DOF-blurred.
  - **Distant buildings (t10):** sharp-ish painted façades in saturated pastels (yellow clapboard, red brick #a04a3a, blue #455b9d). Thin 1 px outlines, with slight aerial-perspective lift (+10 % toward sky colour).

## 2. Light
- **Exterior day key:** the sun is high, from camera left/back-left, elevation ~45–55°. Key colour is warm **#fff1d6** (intensity 1.0). Shadows are **cool violet**: cast shadow on street #3d3643 vs lit street #775942 (lum ratio 0.50). On the track, horse shadow #693a34 vs lit #b0491d (ratio 0.6, red-violet shift). On the meadow, easel shadow on dirt is #3f352e. Shadow density is 45–55 % of lit. Shadow edge: sharp near contact, penumbra grows to ~4–8 px a body length away. Treat the sun as a disk with angular radius ~1.5–2°.
- **Sky fill:** blue **#8fb8ff** at ~0.35. **Bounce** from ground is warm (terracotta or green depending on ground) at ~0.15, visible on undersides (table underside lit orange #c24d20 rather than black).
- **Rim light:** none as a separate light. Edges get an occasional warm halo only from bloom.
- **Interior betting room (t37):** a hard sunlit window patch on the floor, **#fcfecc** (clipped to 255 with bloom). The room is otherwise lit by a warm diffuse fill **#e8c9a0** at 0.6. The darkest pixel in the room is only #573529 (p1 = 64): **lifted, warm blacks**.
- **Bordeaux back room (t40/t43):** low-key. p50 lum 41–49, warm. Felt **#264540**, dark wood #2f1b1b. Highlights come from clipped white objects and characters. Warm practical lamps: bulbs #fff3c0 with bloom radius ~40–60 px and threshold ~0.85.
- **Dusk (t55):** the key is low (~8–12° elevation), from behind/side, and orange **#ffb070**. The fill is lilac sky **#b598cb**. Shadows are long, stripe-like and red-violet (**#9a4334** on track #aa391d). Trees are backlit with a darker silhouette side #2f4a25 and a lit edge #477431. The whole frame is lifted (p5 = 73) with a pink haze.
- **Bloom:** strong on clipped areas. The sun patch t37 spreads ~25–40 px glow, raising neighbours by +30–60 levels. Threshold ~0.8, intensity ~0.5, radius 30 px @720 (two-level Gaussian: 8 px + 32 px).
- **God rays:** none observed. **Fog/aerial perspective:** yes. Distant hills fade to #6a9f8f (t34) and to the haze #c5e3e7 (t16), at roughly 35–50 % blend at the horizon.

## 3. Camera / lens
- **Focal:** mostly 35–50 mm equivalent vertical framing. Low camera at character eye/hip height. The table close-up (t01) is a wide ~24–28 mm with strong foreground perspective.
- **DOF:** pronounced, with tilt-shift-like separation. Characters in focus. Background at >2–3× subject distance is blurred **4–8 px** radius at 720p (t34 trees and hill, t01 clouds, t37 right wall). Foreground objects close to the lens blur **6–12 px** (t04 paper litter near the bottom edge, t13 lens-like window ring). Far city in a through-window shot (t10) is only ~1–2 px soft.
- **Vignette:** effectively **none** on exteriors. Row profile across the t01 sky: 112/113/113/115/114/112/112 (edge-to-centre drop ≤3 %). t31: 125→128→126. Interiors have darker corners from lighting, not a lens vignette. At most use 5 %.
- **Chromatic aberration:** none visible.
- **Film grain:** none. The high-pass std on flat sky is 0.33–0.43 levels (pure compression). Skies are clean.
- **Sharpening:** mild (edges slightly crisp, ~0.3 unsharp). Compression softness dominates.
- **Motion blur:** yes on fast moves. Whip-pans and horse runs show directional smear of 10–30 px. The dust puff behind the horse (t46) is a soft sprite.
- **Transitions:** cross-dissolves (t58 = two shots blended ~50 %) and **iris/circle wipes** (t13 lens ring, t19 circle on black #000).

## 4. Colour grade (numpy; subtitle band y 960–1070 masked)
| frame | scene | meanL | p1 | p5 | p50 | p95 | p99 | meanSat(HSV) | p95Sat | darkest p0.5 | brightest p99.5 | mean RGB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| t01 | sunny deck/sky | 139 | 20 | 30 | 142 | 245 | 253 | 0.53 | 0.87 | #1b0a1a | #fefdfb | #8788ad |
| t10 | street through window | 127 | 19 | 27 | 138 | 239 | 249 | 0.38 | 0.66 | #190d0f | #fffdf1 | #738093 |
| t16 | meadow | 174 | 27 | 53 | 191 | 224 | 249 | 0.38 | 0.72 | #3c0f00 | #fdfaf3 | #94b79c |
| t31 | grandstand | 130 | 34 | 58 | 123 | 238 | 247 | 0.57 | 0.86 | #2d1209 | #fff9e8 | #907e7b |
| t37 | betting room, bordeaux + sun | 137 | 64 | 74 | 132 | 246 | 254 | 0.35 | 0.58 | #573529 | #fffffb | #a5836d |
| t43 | bordeaux back room, felt | 66 | 27 | 31 | 41 | 235 | 252 | 0.42 | 0.63 | #261714 | #fffcfd | #4e3e40 |
| t55 | dusk track | 145 | 35 | 73 | 163 | 207 | 228 | 0.46 | 0.87 | #6c0009 | #f9f2f9 | #bf847b |
| t04 | betting room boards | 86 | 12 | 20 | 73 | 196 | 243 | 0.37 | 0.66 | #070916 | #f2f6f9 | #595557 |
| t64 | betting room (end) | 78 | 16 | 23 | 65 | 212 | 235 | 0.41 | 0.66 | #130b1a | #f4f2f3 | #4f4a6a |

(The full 22-frame table is in the `stats.py` output; reproduce it with `python3 stats.py`.)
- **Saturation:** high. Mean HSV-S is 0.35–0.57 and p95 is 0.6–0.87. Exteriors (sky + terracotta) are the most saturated, 0.53–0.57.
- **Contrast:** a medium S-curve. Whites clip on characters, clouds and the sun (p99 ≈ 245–253). Blacks are **lifted and tinted**: ink lines reach ~#1b0a1a (aubergine), but large dark areas sit at 20–35 lum. In-room shadows have p1 ≈ 27–64. There is never true neutral black, except the iris-wipe matte.
- **White level:** 250–255 with warm-cream whites (#fff5dc clouds, #fffdf1), and cool-white characters outdoors (#eaeef7).
- **Tint per scene:** day exterior is cool-blue overall (mean #8788ad) with warm terracotta ground. The interior betting room is warm amber/beige (#a5836d). The back room is red-brown low-key (#4e3e40). Dusk is pink-orange (#bf847b). The board room is cool slate (#4f4a6a).

## 5. How 2D characters sit in 3D
- Flat vector fill with **thick outline 7–8 px @720p** (t10 row sample: 4 samples × 2 px), colour **#1f1225–#271629** (aubergine, not black).
- **They do receive scene tint:** face lit outdoors #eaeef7 (cool), interior sun #fffeff, back-room #331e1b where the face is in shadow. There is a **soft 2-tone body shade**: lower/away side of the head #d5cff2 (lavender, about −10 % lum, blurred ~15–25 px gradient), i.e. a fake Lambert from the scene key. Implement it as fill × mix(1, shadeTint, smoothstep over the head disk offset from the key direction), multiplied by a scene ambient tint.
- **Shadows:** props and horses (rendered more 3D-ish) cast real ground shadows in the scene shadow colour (#3d3643 street, #693a34 track). Stickmen **often get no obvious contact shadow** (t04, t37 feet on paper floor). When present, it is a soft dark ellipse under the feet, ~1.2× foot span wide, 0.25 aspect, opacity 25–35 %, blur 6–10 px, coloured like the scene shadow (violet-brown).
- **DOF:** background characters (crowds, people behind glass) are blurred together with the plate, 2–6 px. Foreground hero characters are always sharp.
- **Light wrap:** slight. A 2–4 px bleed of bright backgrounds (sky, sun patch) over the character outline, ~20–30 % (visible against the clouds in t01 and the sun patch in t37). Bloom also passes over characters, because post is applied to the composite.
- Post grade is applied **after** compositing, so characters share saturation, contrast and bloom with the 3D.

## 6. GLSL recipes (`vec4 pixel(vec2 uv)`, sRGB-ish hex → linearise ^2.2 for lighting, back ^(1/2.2))
Common shading:
```glsl
float diff = smoothstep(-0.10, 0.30, dot(n,L));               // soft 2-tone ramp
float sh   = softShadow(p+n*0.01, L, 0.02, 20., k=12.);         // k≈12 → 4–8px penumbra
vec3  lit  = alb*( keyC*diff*sh + fillC*(0.5+0.5*n.y) + bounceC*max(0.,-n.y)*0.6 );
lit = mix(alb*shadowTint*AOamb, lit, ...) // shadowTint gives hue shift toward violet
float ao  = calcAO(p,n, 5 taps, step 0.08) ; lit *= mix(1., ao, AOstr);
// outlines: depth/normal edge from 2 extra SDF samples per pixel OR SDF-thickness trick:
// ink if (marching min-distance along ray < w*t) && hit-depth jump ; ink colour #1f1225
```
Outline width: 5 px for objects <3 m, 3 px at 3–8 m, 1 px beyond 8 m, fading out by 25 m. Add creases on plank seams by drawing the seam lines into albedo with the ink colour. Post (all scenes): bloom threshold 0.80, two Gaussians 8 px + 32 px @720, mix 0.45 · sat ×1.15 · S-curve contrast 1.12 around 0.45 · lift blacks to scene black hex · vignette 0–5 % · no grain/CA · DOF: depth-based gather blur, focus on the character plane, `r = clamp(abs(1/zf-1/z)*K, 0, 8px)` with K giving 6 px at 3× focus distance; foreground cap 12 px. Cheap CPU route: render a depth buffer, then 2 passes of separable blur blended by CoC (3 levels: 0/3/7 px).

### (a) Sunny seaside restaurant terrace
- Sky gradient (top→horizon): #316fe5 → #4b8df7 (40 %) → #6caafc (75 %) → #a9d4fb (horizon). Clouds: cumulus fbm blobs, top #fff5dc, belly #c9c3e0, feather 4 px, DOF 5 px.
- Sea: #2f7fd6 near → #5aa8e8 far, plus horizon line #9ccbfb. Sparkle: 2–3 px dots #ffffff, very sparse; no reflection march. Distant cape: #5f9a7c lit / #4a6f8a shade, fog-blended 45 % to the horizon colour, 1 px outline.
- Deck planks: albedo #c2552a / #b14821 (per-plank ±7 % value, hash per plank). Plank width = 1/10 frame width at mid-ground (~0.14 m). Gap: 0.006 m, colour #3a1a14. Grain: sin(x·40 + fbm·6), 0.8 → ×0.75 darker strokes. Gloss 0.05.
- Railing: white paint #f0ece0, shade #b9b2d6, 4 px ink.
- Striped umbrellas: #e23a3a / #fff3e0 stripes (8–10 gores). Underside shade #8f3a4a / #b9aacc. Pole #6b3a20.
- Tablecloth: #fdf4d8, shade #c9bfdc.
- Key #fff1d6 ×1.0, dir normalize(-0.5,0.8,-0.4). Fill (sky) #8fb8ff ×0.35. Bounce (deck) #e07040 ×0.15. Shadow tint target ≈ ×(0.55,0.50,0.70) → e.g. #6a3c4e on deck. AO strength 0.35, radius 0.3 m, colour #3a2030.
- Fog: exp, density so that 40 % at the horizon, colour #a9d4fb. Post: sat ×1.15, contrast 1.10, black #1b0a1a, bloom 0.4, vignette 0. Target stats: meanL ~135–140, p50 ~140, meanSat ~0.50–0.55.

### (b) Bordeaux bookie room
- Walls: #954f51 with fbm sponge ±8 % (scale 0.15 m). Wainscot #5e2f22 – #8d5941 with a 3 px ink top rail. Ceiling slate-teal #324857 (as t04).
- Counter: green felt **#264540** (lit up to #2f5a50), gloss 0. Felt fibre noise ±4 %, chalk scuffs as thin light lines #6f9a90 at 30 %. Counter wood front #3b1c1a / #5a2a24, gold trim #c9a040.
- Chalkboard: #1f2a2a – #2b3434 with dusty fbm smear #3c4848 (±10 %). Chalk text #e8ecef at 85 %, 2–3 px stroke. Gold frame #b8902f.
- Floor (if visible): planks #865a45 / #b2856c, width 1/9 frame, gaps #3a2219 2 px, butt-joints every 5 planks. Paper litter #ab8565 / #e8d5b0.
- Lights: 2–3 warm point lamps #ffc878 ×1.6, falloff 1/(1+d²), shades with emissive #fff3c0 → bloom radius 40–60 px, threshold 0.75, mix 0.6. Fill #e8c9a0 ×0.25. No sky. Window patch (optional) #fcfecc clipped plus big bloom.
- AO strength 0.5 (corners clearly dark), colour #2f1b1b. Shadows soft (k = 6).
- Post: sat ×1.05, contrast 1.15, black lifted to #22191e (p1 ≈ 27–30), warm tint mean ≈ #4e3e40. Target meanL 65–75, p50 40–50, meanSat ~0.42.

### (c) Open sea with yachts and a cliff/cape
- Sky: top #3a7ce8 → #5c9cfb (50 %) → #b5dcfa horizon. Clouds as in (a), larger and fewer, painted cards at different depths.
- Sea: near #1f6fc4, mid #2f86d8, far #6fb2ec. Wave normals: 2 octaves of sine/noise, 3–5 % amplitude. Specular glints as tiny white dashes (threshold pow 64), no Fresnel reflections beyond mixing 25 % sky colour at grazing. Foam at the hull: #f4f8ff with a 2 px edge.
- Yachts: hull white #f4f0e6 (shade #b9b2d6), red/navy boot stripe #c8322e / #1f3a6a, deck teak #b0703e, sails cream #fff6e2 (shade #d7cfe8, smooth gradient across the sail curvature), mast #d9d2c4, 3–4 px ink outlines.
- Cliff: rock #c99a6a lit / #7a5a6e shade, top grass cap #5cb550 / #2e8831, painted strata lines in ink at 40 %. Far headland fog-blended 40–55 %.
- Lights: key #fff1d6 ×1.0, elevation 50°. Fill #8fb8ff ×0.4. Bounce from sea #4a90d8 ×0.12. AO 0.25.
- Fog colour #b5dcfa, 45 % at the horizon. DOF: focus on the hero yacht/characters, the cape 4–6 px, the sky 5 px.
- Post: sat ×1.15, contrast 1.10, black #1b0a1a, bloom on sun glints 0.35. Target meanL ~140, meanSat ~0.50–0.55, mean RGB ≈ #8090b0.

### (d) Dusk / sunset version of (c)
- Sky gradient from t55: y0 **#af92c7** → #c6a0ca → #d9b2cf → #ebbbc9 → **#f6c0b9** horizon. Add a sun-glow disk #ffd8a0 → #ffb070 (radius 0.15 of frame) with bloom 60 px. Clouds are pink #e8a8c2 with an orange underside rim #ffb478 and lilac shade #b598cb.
- Sea: reflect the sky. Far #e7b2c0, mid #9a7aa8, near #4e4a78, plus a sun-glitter column of #ffd090 dashes.
- Key #ffb070 ×0.9 at elevation 8–12°, from behind-side (backlight). Fill #b598cb ×0.45. Bounce #c86a5a ×0.15. Shadows are long and red-violet: lit × (0.6,0.4,0.55), e.g. #9a4334 on terracotta.
- Silhouette sides: yachts and cliff go to #5a3e5e – #2f2a45. Rim light: use NdotL > 0.9 edge plus Fresnel to add a 1–2 px #ffc890 edge on cliff and sails, intensity 0.6.
- Fog colour #f0bcc0, density ×1.3 vs day. Lamps/portholes: emissive #ffd27a with bloom 30 px.
- Post: sat ×1.10, contrast 0.95 (flatter, lifted), blacks lifted to #30142a (p5 ≈ 50–73), magenta-orange tint. Target meanL 120–145, p50 120–163, meanSat 0.44–0.46, mean RGB ≈ #bf847b (t55) / #a06d6f (t58).

### Character compositing (all)
Outline 7–8 px #1f1225. Body fill × sceneTint (day #fff8ee, interior #ffe9cf, back room #c99a86, dusk #ffc7b0). Shade side: lavender #d5cff2 multiply ~0.9 with a 20 px soft gradient on the side away from the key. Contact ellipse: opacity 0.3, blur 8 px, colour = scene shadow hex. Light wrap: 3 px, 25 %. Background characters get the same CoC blur as the plate at their depth. Apply bloom/grade after the composite.