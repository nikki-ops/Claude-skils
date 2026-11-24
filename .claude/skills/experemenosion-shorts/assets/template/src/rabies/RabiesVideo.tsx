import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import DATA from "./shots.json";
import { FaceOld } from "../components/FaceOld";
import { Neurons } from "../components/three/Neurons";
import { WarmPortraitBG, DeepBG } from "../components/Backgrounds";
import { Grain } from "../components/Film";
import { HUD, Note } from "../components/HUD";
import { Caption } from "../components/Caption";
import { StatCard, EmberBG } from "../components/StatCard";
import { C, grid } from "../style/tokens";
import { Nerve } from "./Nerve";
import { Wind, Monitor } from "./Props";
import { HeadSection } from "./HeadSection";
import { EyeMacro, BedTop, MicroscopeDrop, NerveCross, Curtain, Stopwatch } from "./Variety";
import { OldHand, WOUND } from "../hands/OldHand";
import { HandsWithGlass } from "../hands/HandsWithGlass";
import { OfferedGlass } from "../hands/OfferedGlass";
import { XrayShot } from "../xray3d/XrayShot";
import { FoxEnterShot, FoxAttackShot, FoxCloseUpShot, GardenDayShot } from "../fox3d/Shots";

// Ролик 01 «Бешенство», версия 2: 36 тактов @96 BPM = 90 с, у каждого такта свой план.
const g = grid(DATA.bpm);
const B = g.bar; // 75 кадров
export const RABIES_FRAMES = DATA.bars * B;

type Shot = (typeof DATA.shots)[number] & Record<string, any>;
const SHOTS = DATA.shots as any as Shot[];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MED_BG = "radial-gradient(ellipse 70% 55% at 50% 55%, #1a2a3a, #05080e)";

// ---------- лицо (портрет) с вариантами: крупно, рот, ветер, стакан от дочери ----------
const faceProps = (s: Shot, f: number) => {
  const p: any = s.face || {};
  const blinkBase = f % 90 >= 40 && f % 90 <= 46 ? Math.sin(((f % 90 - 40) / 6) * Math.PI) : 0;
  let blink = Math.max(p.blink || 0, blinkBase);
  let spasm = p.spasm || 0;
  if (p.spasmPulse) spasm = Math.max(0, Math.sin((f / B) * Math.PI * 4)) * 0.8;
  let pallor = 0, erase = 0;
  if (p.dying) {
    pallor = interpolate(f, [0, B], [0.35, 1], clamp);
    blink = interpolate(f, [5, 40], [0.4, 1], clamp);
    erase = interpolate(f, [45, B], [0, 0.2], clamp);
  }
  return { frame: f, blink, spasm, pallor, erase, mouth: p.mouth || 0, look: p.look || 0, fear: p.fear || 0, pupil: p.pupil || 0, redEye: p.redEye || 0, sweat: p.sweat || 0, flush: p.flush || 0, drool: p.drool || 0 };
};

const FaceShot: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const fp = faceProps(s, f);
  const mouth = s.kind === "mouth";
  const scale = mouth ? interpolate(f, [0, B], [2.5, 2.7]) : s.close ? interpolate(f, [0, B], [1.38, 1.5]) : interpolate(f, [0, B], [1, 1.06]);
  const origin = mouth ? "50% 61%" : s.close ? "50% 50%" : "50% 58%";
  return (
    <>
      <WarmPortraitBG />
      <AbsoluteFill style={{ transform: `scale(${scale * (1 + Math.sin(f / 22) * 0.004)})`, transformOrigin: origin }}>
        <FaceOld {...fp} />
        {s.kind === "hook" && <HandsWithGlass frame={f} shake={1} />}
        {s.offered && <OfferedGlass frame={f} progress={interpolate(f, [0, 28], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })} />}
      </AbsoluteFill>
      {s.wind && <><Wind frame={f} /><Curtain frame={f} /></>}
    </>
  );
};

const HandShot: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const h: any = s.hand || {};
  const bite = h.biteIn ? interpolate(f, [8, 14], [0, 1], clamp) : h.bite ?? (h.burn ? 0 : 1);
  const zoom = h.dive ? interpolate(f, [0, B], [1, 7], { easing: (x) => x * x * x }) : interpolate(f, [0, B], [h.zoom || 1, (h.zoom || 1) * 1.06]);
  const shakeBite = h.biteIn && f >= 8 && f < 16 ? Math.sin(f * 3) * 18 * (1 - (f - 8) / 8) : 0;
  const origin = `${(WOUND[0] / 1080) * 100}% ${(WOUND[1] / 1920) * 100}%`;
  return (
    <AbsoluteFill style={{ transform: `translate(${shakeBite}px, 0) scale(${zoom})`, transformOrigin: origin }}>
      <OldHand frame={f} uid={`h${s.bar}`} bite={bite} burn={h.burn ? 0.6 : 0} water={h.water ? interpolate(f, [0, 8], [0, 1], clamp) : 0} soap={h.soap ? interpolate(f, [5, 30], [0.2, 1], clamp) : 0} syringe={h.syringe ? interpolate(f, [3, 70], [0, 1], clamp) : 0} tremble={h.burn ? 0.4 : 0} />
    </AbsoluteFill>
  );
};

const NerveShot: React.FC<{ f: number }> = ({ f }) => {
  const { width, height } = useVideoConfig();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#140c02" }} />
      <ThreeCanvas width={width} height={height} camera={{ fov: 64, near: 0.05, far: 120 }}>
        <fog attach="fog" args={["#1a1004", 5, 32]} />
        <Nerve t={f / 30} progress={f / B * 0.6} swarm={interpolate(f, [0, 30], [0.4, 1], clamp)} />
      </ThreeCanvas>
    </>
  );
};

const NEURO_BARS = SHOTS.filter((s) => s.kind === "neuro").map((s) => s.bar);
const NeuroShot: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const { width, height } = useVideoConfig();
  const idx = NEURO_BARS.indexOf(s.bar);
  const T = idx * B + f;
  return (
    <>
      <DeepBG />
      <ThreeCanvas width={width} height={height} camera={{ fov: 50, position: [idx ? 3 : 0, idx ? -2 : 0, interpolate(T, [0, 2 * B], [20, 13])], near: 0.1, far: 100 }}>
        <fog attach="fog" args={["#050b16", 22, 40]} />
        <group rotation={[idx ? 0.25 : 0, (T / 30) * 0.08, Math.sin(T / 100) * 0.03]}>
          <Neurons t={T / 30} virus plaque={interpolate(T, [0, B], [0.05, 1], clamp)} loss={interpolate(T, [10, 2 * B], [0, 1], clamp)} />
        </group>
      </ThreeCanvas>
      {idx === 1 && <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,40,10,0.0), rgba(255,40,10,0.35))", opacity: 0.6 + 0.4 * Math.sin(f / 5) }} />}
      <Note text={`ЗАРАЖЕНО НЕЙРОНОВ: ${Math.round(interpolate(T, [10, 2 * B], [3, 87], clamp))}%`} y={1680} color={idx === 1 ? C.red : C.yellow} size={40} />
    </>
  );
};

const XrayView: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const [a, b] = s.xray;
  const p = interpolate(f, [0, B], [a, b], clamp);
  const hit = b >= 1 ? interpolate(f, [B - 22, B - 4], [0, 1], clamp) : 0;
  return (
    <>
      <XrayShot frame={f} p={p} brainHit={hit} />
      <Note text={`ДО МОЗГА: ${Math.max(0, Math.round(92 * (1 - p)))} СМ`} y={1700} color={p >= 0.99 ? C.red : C.yellow} size={44} />
    </>
  );
};

const MonitorShot: React.FC<{ f: number }> = ({ f }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "#020604" }} />
    <Monitor frame={f} amp={interpolate(f, [0, B * 0.55], [1, 0], clamp)} bpm={140} />
    <Note text={f > B * 0.55 ? "ПУЛЬС: 0" : `ПУЛЬС: ${Math.round(interpolate(f, [0, B * 0.55], [140, 20], clamp))}`} y={1420} color={f > B * 0.55 ? C.red : "#3dff8a"} size={52} />
  </>
);

// фон карточки: размытая сцена из ролика
const CardBG: React.FC<{ kind: string; f: number }> = ({ kind, f }) => (
  <>
    <AbsoluteFill style={{ filter: "blur(14px) brightness(0.75) saturate(0.85)", transform: `scale(${interpolate(f, [0, B], [1.12, 1.2])})` }}>
      {kind === "fox" && <FoxCloseUpShot frame={30} />}
      {kind === "micro" && <MicroscopeDrop frame={f} />}
      {kind === "eye" && <EyeMacro frame={f} pupil={1} red={0.7} />}
      {kind === "xray" && <XrayShot frame={f} p={0.55} overlay={false} />}
      {kind === "throat" && <><div style={{ position: "absolute", inset: 0, background: MED_BG }} /><HeadSection frame={f} spasm={1} /></>}
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 47%, rgba(0,0,0,0.55), rgba(40,4,0,0.35))" }} />
    <AbsoluteFill style={{ opacity: 0.45, mixBlendMode: "screen" }}><EmberBG /></AbsoluteFill>
  </>
);

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const hud = s.hud as [string, number, number] | undefined;
  const k = s.kind;
  return (
    <AbsoluteFill>
      {(k === "face" || k === "hook" || k === "mouth") && <FaceShot s={s} f={f} />}
      {k === "foxEnter" && <FoxEnterShot frame={f} />}
      {k === "foxAttack" && <FoxAttackShot frame={f} />}
      {k === "foxClose" && <FoxCloseUpShot frame={f} />}
      {k === "gardenDay" && <GardenDayShot frame={f} />}
      {k === "hand" && <HandShot s={s} f={f} />}
      {k === "micro" && <MicroscopeDrop frame={f} />}
      {k === "nerve" && <NerveShot f={f} />}
      {k === "xray" && <XrayView s={s} f={f} />}
      {k === "cross" && <NerveCross frame={f} />}
      {k === "bed" && <BedTop frame={f} face={faceProps(s, f)} thermo={s.thermo} breath={s.face?.dying ? interpolate(f, [0, 40], [1, 0], clamp) : 1} />}
      {k === "neuro" && <NeuroShot s={s} f={f} />}
      {k === "eye" && <EyeMacro frame={f} pupil={interpolate(f, [0, 50], [0.3, 1], clamp)} red={0.7} fox={f > 34 && f < 60 ? 1 : 0} dart={1} />}
      {k === "throat" && <><div style={{ position: "absolute", inset: 0, background: MED_BG }} /><HeadSection frame={f} water={Math.min(1, f / 25)} spasm={f > 22 ? 1 : 0} /></>}
      {k === "saliva" && <><div style={{ position: "absolute", inset: 0, background: MED_BG }} /><HeadSection frame={f} saliva={Math.min(1, f / 20)} /></>}
      {k === "monitor" && <MonitorShot f={f} />}
      {k === "card" && <CardBG kind={s.cardBg} f={f} />}
      {s.watch && <Stopwatch frame={f} />}
      <Grain amount={k === "xray" || k === "nerve" || k === "neuro" ? 0.07 : 0.1} vignette={0.6} />
      {hud && <HUD left={hud[0]} label="ШАНС" value={interpolate(f, [0, B], [hud[1], hud[2]], clamp)} />}
      {s.note && <Note text={s.note[0]} y={1690} color={s.note[1] === "r" ? C.red : C.yellow} size={40} />}
      {s.cap && <Caption text={s.cap} from={2} dur={B - 2} top={262} base={s.cap.length > 26 ? 74 : 90} />}
      {s.card && <StatCard big={s.card[0]} sub={s.card[1]} src={s.card[2]} color={s.card[3] as "y" | "r"} from={0} dur={B} />}
    </AbsoluteFill>
  );
};

// ---------- удары и переходы ----------
const RED_HITS = [
  ...SHOTS.filter((s) => s.cap && s.cap.includes("[")).map((s) => s.bar * B + 2 + s.cap.split(/\s+/).findIndex((w: string) => w.includes("[")) * 3 + 3),
  ...SHOTS.filter((s) => s.biteAt).map((s) => s.bar * B + s.biteAt),
];
const shake = (frame: number) => {
  for (const h of RED_HITS) {
    const d = frame - h;
    if (d >= 0 && d < 9) { const a = 14 * Math.exp(-d * 0.45); return `translate(${Math.sin(d * 2.7) * a}px, ${Math.cos(d * 3.3) * a * 0.6}px)`; }
  }
  return undefined;
};
const RedPulse: React.FC<{ frame: number }> = ({ frame }) => {
  let o = 0;
  for (const h of RED_HITS) { const d = frame - h; if (d >= 0 && d < 14) o = Math.max(o, 0.5 * Math.exp(-d * 0.25)); }
  return <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0) 40%, rgba(200,10,0,1) 100%)", opacity: o, mixBlendMode: "screen" }} />;
};

// «Нырок в рану»: в конце такта из раны раскрывается круг — вид под микроскопом
const DIVE_BAR = SHOTS.find((s) => s.hand?.dive)!.bar;
const DiveIris: React.FC<{ frame: number }> = ({ frame }) => {
  const a = DIVE_BAR * B + Math.round(B * 0.62), b = (DIVE_BAR + 1) * B;
  if (frame < a || frame >= b) return null;
  const r = interpolate(frame, [a, b], [0, 1200], { easing: (x) => x * x });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at 50% 50%)` }}>
      <MicroscopeDrop frame={frame - b} />
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${Math.max(40, 300 - r * 0.2)}px rgba(200,30,20,0.9)` }} />
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ frame: number; at: number; color?: string }> = ({ frame, at, color = "#fff" }) =>
  frame >= at && frame < at + 4 ? <AbsoluteFill style={{ background: color, opacity: interpolate(frame, [at, at + 3], [0.85, 0], clamp), pointerEvents: "none" }} /> : null;

export const RabiesVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("rabies_music.wav")} volume={0.9} />
      <AbsoluteFill style={{ transform: shake(frame) }}>
        {SHOTS.map((s) => (
          <Sequence key={s.bar} from={s.bar * B} durationInFrames={B}>
            <ShotView s={s} />
          </Sequence>
        ))}
        <DiveIris frame={frame} />
      </AbsoluteFill>
      <RedPulse frame={frame} />
      <Flash frame={frame} at={DATA.dropBar * B} />
      <Flash frame={frame} at={DATA.secondDrop * B} />
    </AbsoluteFill>
  );
};
