# ref.mp4: sound and pacing analysis (64.17 s, 720x1280 @30 fps, AAC 44.1 kHz stereo)
Method: faster-whisper small/int8 word timestamps; librosa STFT/pyin/HPSS; **side channel (L−R)** used as a voice-free stem, because the VO is mono-centred (L/R corr 0.9988, side −26 dB below mid). Shots come from colour-histogram and pixel-diff peaks over 8 frames, plus a 2 fps contact sheet. Captions come from a white-plus-black-outline text mask in crop y=860–940.
Files: words.json and w.json (word timings), spec_*.jpg, lf_*.jpg, z*.jpg, q*.jpg (spectrograms), cs_as.jpg and cs_bs.jpg (2 fps contact sheets), a1–a8.py.

## 1. Voice
- **Transcript:** 244 words (EN), 0.00 → 63.68 s. The voice runs wall-to-wall: the first word is at 0.00 s and the last ends 0.5 s before the video ends.
- **Rate:** **3.83 words/s = 230 wpm**, about 4.8 syllables/s, median word length 0.22 s. This is fast and conversational, not documentary pace.
- **Rate per sentence (words/s):** 4.03 / 3.95 / 4.65 / 4.38 / 4.53 / 3.50 / 4.45 / 3.43 / 3.82 / 3.57 / 4.07 / 4.43 / 4.03 / 3.80 / 4.12 / 3.69. Range 3.4–4.65. The slowest sentences are the punchy ones: "Race after race…" 3.50, "Hey, Mirror Man…" 3.43, "Then the hill flashes…" 3.57.
- **Sentence lengths:** 1.6–7.6 s (median about 3.5 s). The 16 sentences average 15 words.
- **Pauses (Whisper gaps):** 211 of 243 inter-word gaps are 0 ms. Of the rest: 4 are 100–150 ms, 10 are 150–200 ms, 13 are 200–300 ms, 5 are 300–400 ms, and none exceed 0.4 s.
  - Between sentences: mean **0.19 s** (0.00–0.34). Values: 0.22 0.20 0.30 0.20 0.30 0.22 0.16 0.00 0.10 0.20 0.14 0.16 0.16 0.20 0.34.
  - Comma pauses after "Wait," "Well," "Hey," "Hal," "You see," are 0.18–0.34 s, often as long as or longer than sentence pauses. These are rhetorical beats.
- **Pauses (true silence by energy):** only 16 runs drop more than 18 dB below the median, each **50–90 ms** long, at −37 to −41 dBFS RMS (the bed shows through). The VO is breath-edited and butt-spliced, so there is never real silence.
- **Pitch:** pyin F0 median 198 Hz (p10 133, p90 297), about 17 semitones p5–p95. That is very animated, a "storyteller/cartoon narrator" contour.
  - Per 8 s: 244 / 195 / 184 / 220 / 199 / 190 / 197 / 176 Hz. The hook is pitched highest (244 Hz), there is a lift at the "Hey, Mirror Man / last race" beat (220 Hz), and the delivery drops lower and calmer for the payoff (176 Hz).
- **Character:** **dry.** There is no audible reverb tail: energy falls to the bed within about 50–90 ms after phrase ends. Delivery is close-mic.
  - **Heavily compressed and limited:** crest factor 5.4 (14.7 dB), RMS −16.8 dBFS, 50 ms RMS peak −9.5, LRA only 2.6 LU.
  - Bright: speech centroid about 2.25 kHz, with strong sibilance to 10 kHz.
- **Loudness (full mix):** **−14.0 LUFS integrated, LRA 2.6 LU (−15.2…−12.6), true peak −2.1 dBTP**, sample peak −2.14 dBFS. Effectively mono (side/mid −26 dB).

## 2. Music bed
- **Is there music? Yes, but it is very low.**
  - In the side stem, sustained harmonic note-lines (fundamentals about 150–600 Hz, partials to about 3 kHz) run through most of the piece.
  - In the mid spectrogram, long horizontal tonal lines at 1–7 kHz are visible in the voice gaps. Gap frames are tonal (flatness 0.017).
- **Level:**
  - The pause floor is about −37…−41 dBFS RMS against a voice median of −17.7 dBFS (10 ms frames), so the bed sits about **−20 to −23 dB under the voice**.
  - The side-stem music is about −50 dBFS, roughly 32 dB below the mid.
  - Spectrally, gaps are −19 to −24 dB relative to speech at 80–1000 Hz, but only −7.6 dB at 30–80 Hz. The bed is bass/low-mid weighted and the highs are mostly voice.
- **Tempo:** onset autocorrelation on the side stem (150–3000 Hz) peaks at lags 0.40 / 0.79 / 1.19 s (r = 0.16 / 0.28 / 0.18). That is a **0.397 s grid, about 151 BPM (or 76 BPM half-time)**.
  - The value is consistent across 0–12 s, 22–40 s and 40–64 s. librosa tempo agrees at 150.
  - Note-onset IOIs cluster at 0.5–1.2 s: sparse notes, not a drum loop. There is no kick or snare pattern; the percussive autocorrelation is flat (r < 0.05).
- **Key/colour:** pitch-class centre **D** (chroma rank D > G > A > A#(Bb) > F# > C#). This suggests a D/G minor colour with chromatic F#/C#: "sneaky/mischievous" cartoon harmony.
- **Instruments (guess):** light plucked/pizzicato or mallet notes (short attacks, about 0.3–0.8 s decays) plus soft sustained mid tones. Bell/celesta-like high partials (4–7 kHz horizontal lines) appear at sparkle moments.
  - Genre: **quirky "heist/scheme" cartoon underscore**, unobtrusive, no drums.
- **Changes at story beats** (side-stem RMS per 2 s, dBFS):
  - 0–12 s: about −50 (setup).
  - **12–22 s: drops to −56…−59** (explaining the mirror trick, "race after race… hill stays dark"). The music thins out under the exposition.
  - **22 s: back to −49** at the cut to the regulars.
  - Dip −55 at 34 s before "Then the hill flashes", then back to −49 at 36 s.
  - −45 at 44 s (milk cart).
  - **Dip −58 at 46 s** ("You see, back then…" exposition), then −53/−55 at 48–53 s.
  - **Rises to −48/−45/−46 at 54–58 s** (horse nine comes from nowhere: climax).
  - −50 at 60–64 s (payoff).
  - Pattern: duck or thin the music under explanations; swell at action and climax.

## 3. Sound effects
Detected with band onset detectors (mid and side), short-time spectral "noise-fill" (20th percentile across 1.5–7 kHz), and zoomed spectrograms. Levels are relative to voice where measurable.

| t (s) | SFX (best guess) | Evidence | Level |
|---|---|---|---|
| 0.85–3.2 | **Piggy-bank smash at 0.85–1.0, then racetrack crowd roar plus galloping hooves** | broadband noise 1–11 kHz begins at 0.85 s; noise-fill −2…−4 dB vs a typical −16 dB; LF thumps at 1.27/1.59/1.88/2.30/2.64 s (about 0.3 s apart) | crowd noise-fill +12 dB over normal; it is the loudest non-voice element, close to voice level in the 1.5–7 kHz band. LF (<100 Hz) −14 dB re voice |
| 8.17 | **Whoosh/swish on the cut** (into the close-up "sits by the window") | 120 ms broadband 1–11 kHz burst; side +25 dB (strongly stereo, so not voice) | approximately −10…−15 dB re voice |
| 8.2 / 15.4 / 30.1 | **Glint "ting"** (mirror / sparkle) | narrow vertical lines at 4–5.7 kHz in the side stem | very low, about −30 dB |
| 15.33–15.55 | **Whoosh plus click/pop** on the cut to the buddy with the mirror | side +25 dB at 15.33 s; 5 ms full-band click at 15.555 s | −15…−20 dB |
| 18.2–20.4 | Fast cuts to the telescope view: no distinct whooshes | side excess only +8…+10 dB | – |
| 22.1–23.3 | **Betting-room crowd murmur/laughter**, starting exactly on the cut at 22.13 s | dense broadband fill 0.5–11 kHz for about 1.2 s; noise-fill +6.6 dB over typical | about −15 dB re voice |
| 3.5–5.0, 58–64 | "Room laughing" lines: **no clearly audible laughter bed** | noise-fill not elevated (−17…−20) | at most −25 dB if present |
| 28.2–31.8 | **Gallop hooves** under "In the last race…" | LF thumps in pairs about 0.17 s apart, repeating every 0.35–0.37 s (28.33, 28.50, 28.87, 29.14, 29.40, 29.57, 29.94, 30.11, 30.47, 30.64, 31.01, 31.18, 31.54, 31.71) | LF −22 dB re voice |
| 35.6–36.0 | **Flash shimmer** ("the hill flashes") | 6–10 kHz bursts plus noise fill at 35.5 s (−10) | about −15 dB |
| 37.17–37.9 | **Click/thud** (money slap on the counter) | 37.17 s full-band click; LF +23 dB at 37.66 s | −12 dB |
| 43.7–45.2 | **Cart rattle and rumble** ("pulling the milk cart") | 43.70 s transient; side LF rumble 44.1–45.1 s; LF −19 dB re voice | −15…−19 dB |
| 45.72 | **Bell "ding"** (finish / cash bell), about 0.3 s ring | full-band attack plus tonal partials at 1.1 / 3.6 / 7.8 kHz; side +31 dB | about −12 dB |
| 46.07, 51.13–51.23, 54.34 | **Whooshes on cuts** | side +22 / +21 / +13 dB at the cut frames | −15…−20 dB |
| 47.40–47.93 | **Telegraph clicks** (7 clicks in 0.5 s, about 70–130 ms apart) on the telegraph-booth shot | sharp >4 kHz 3 ms transients | −20…−30 dBFS HF |
| 49.16–49.53, 50.13–50.54, 51.9–52.6 | **Telegraph clicking** under "came clicking in over a wire… bets stayed open" | click clusters of 4–6 | same |
| 55.0–57.2 | **Hoof thunder and crowd** (horse nine steals it) | LF rumble 20–100 Hz; LF −17.6 dB re voice; LF +21 dB burst at 55.11 s | −15 dB |
| 60.06–62.0 | **Telegraph clicking** ("the wire starts clicking… spells out nine") | 9 clicks in 1.0 s at 60.06–61.03, then 61.31/61.51/61.90 | clicks up to −15 dBFS HF; the loudest clicks are in the finale |
| 61.0–63.0 | **Money shower / coin-chime sparkle** (money falls on "nine") | noise-fill −8 dB at 61–61.6 s; horizontal chime partials at 5.4–6.6 kHz around 62 s; LF +22 dB at 62.10 s | −12…−15 dB |

**Summary:**
- About 15–18 distinct SFX moments in 64 s, about one every 3.5–4 s.
- Most sit about **12–20 dB under the voice**. Only the opening crowd/hooves approaches voice level.
- SFX are literal, story-illustrating sounds (smash, crowd, hooves, telegraph, bell, coins), with only a few whooshes. On average, cuts are **not** systematically whooshed: side excess at cuts is +8.0 dB vs a random baseline of +7.5 dB. Only about 5 of 44 cuts get a whoosh.

## 4. Cut rhythm
- **Shot boundaries** (hist + pixel detectors, cross-checked against the 2 fps sheet): **44 cuts → 45 shots**.
  - Cut times: 1.70 2.70 3.49 5.44 6.83 8.17 10.67 12.53 12.90 15.33 17.70 18.19 19.08 19.73 20.37 22.13 24.20 24.97 27.40 31.13 32.80 35.08 35.83 36.70 37.23 38.83 39.37 42.67 43.22 46.07 46.72 47.47 48.15 48.70 48.97 50.90 51.23 52.77 54.34 55.63 56.14 56.70 57.50 58.10
  - Plain ffmpeg scene > 0.1 found only 20 hits (18.3–20.4 and 47–48, 54.3), because many transitions are fast push-ins, whips or dissolves.
  - A few pixel-only hits (6.83, 24.20, 31.13, 35.83) may be fast camera moves rather than cuts.
- **Shot length:** **ASL 1.43 s, median 1.00 s**, min 0.27 s, max 6.07 s (the final room shot 58.1–64.2 s holds as the payoff).
  - 0–18 s: shots about 1–2.5 s.
  - **18.2–20.4 s: 4 rapid alternations at about 0.6–0.9 s** (buddy and telescope view, "Race after race").
  - 27.4–35 s: a longer 3.7 s race shot.
  - **46–58 s: densest stretch, 13 cuts in 12 s** (about 0.9 s ASL, the climax).
- **Relation to speech:**
  - Cuts fall **mid-sentence** about 85% of the time: only 7 of 44 are within 0.3 s of a sentence start (10.67, 12.53, 18.19, 24.97, 38.83, 57.50 and similar).
  - The median |cut − nearest word onset| is 80 ms, and 29/44 are within 100 ms. The random baseline is 69 ms and 67%, because words are so dense (4/s), so onset alignment is not statistically above chance.
  - The real rule is **semantic: the cut lands on the noun that names the new picture.** Examples: "his **buddy**" 15.33 (onset 15.34), "the **5th**" 22.13, "**milk** cart" 43.22, "who **won**/**winner**" 48.70, "horse **nine**" 54.34, "**steal** it" 56.14, "**the** room" 58.10, "**Race** after race" 18.19 (cut 0.27 s before the word).
  - Cuts hit within about ±0.1 s of that keyword, typically 0–3 frames before it.

## 5. Caption timing
- **Style:** caption box in crop y≈875–925 of 1280 (about 70% down the frame). White heavy sans with a black outline. 1–2 words per caption.
- **Caption count:** 182 changes for 244 words. Words per caption: 87 one-word, 63 two-word, 10 three-word (some merges come from missed detections).
- **Dwell time:** median 0.33 s (mean 0.35 s).
- **Captions never blank:** only 2 frames without text. The text stays up through pauses.
- **Sync, all captions:** caption change minus Whisper word onset has a median of **−3 ms**, mean −5 ms, IQR −40…+40 ms. That is within ±1 frame, about the Whisper timing error.
- **Sync, after pauses (most reliable, n=31):** the caption appears **−93 ms median** (IQR −113…−57 ms) before the word, i.e. **about 3 frames early**.
  - Cross-checked against the energy onset: "Wait," caption at 10.73 s vs voice onset at 10.81 s (−80 ms); "Well," 12.53 vs 12.62 (−90 ms); "Race" 18.30 vs 18.46 (−160 ms).
- **Recommendation:** show each caption 2–3 frames (70–100 ms) before the word onset, and hold it until the next caption.

## Targets for our short
1. **VO:** about 230 wpm and about 4.8 syllables/s, wall-to-wall.
   - Sentence gaps 0.15–0.3 s; comma beats 0.2–0.35 s; no pause longer than 0.35 s.
   - Remove breaths.
   - Dry, close, bright, heavily compressed, animated pitch (about 17 semitones range). Start the hook highest.
2. **Master:** −14 LUFS integrated, LRA ≤3 LU, true peak about −2 dBTP. Mono-compatible; VO dead centre.
3. **Music:**
   - Light, drumless, quirky plucked/mallet "scheme" cue around 150 BPM (or 76 half-time), D-minor colour.
   - Sit it **20–23 dB under the VO**, bass-weighted.
   - Duck it further (about −6 to −8 dB) under exposition and swell it at the action/climax and payoff.
4. **SFX:**
   - One SFX every 3.5–4 s, literal to the story: crowd, hooves, smash, bell, telegraph clicks, coin shower.
   - Sit them 12–20 dB under the VO; only the cold-open crowd/impact reaches near voice level.
   - Whoosh only about 1 in 8 cuts.
5. **Cuts:**
   - ASL about 1.4 s (median 1.0 s); 0.6–0.9 s bursts for montages and the climax; hold the final payoff shot about 6 s.
   - Cut on the keyword noun (0–3 frames early), not on sentence boundaries.
6. **Captions:** 1–2 words, 2–3 frames early, always on screen.