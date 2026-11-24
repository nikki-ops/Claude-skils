import React from "react";
import { mulberry } from "../components/rand";
import { FaceOld, FaceProps } from "../components/FaceOld";

const blur = (id: string, s: number) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={s} /></filter>
);

// ---------- Глаз крупно: волокна радужки, расширяющийся зрачок, красные сосуды, ресницы,
// мокрый блик; в отражении зрачка — силуэт лисы (галлюцинация) ----------
export const EyeMacro: React.FC<{ frame: number; pupil: number; red: number; fox?: number; dart?: number }> = ({ frame, pupil, red, fox = 0, dart = 0 }) => {
  const R = mulberry(12);
  const lookX = dart * Math.sin(frame * 0.8) * 40 * (Math.floor(frame / 7) % 2 ? 1 : -1);
  const cx = 540 + lookX, cy = 980;
  const pr = 70 + pupil * 95;
  const fibers = Array.from({ length: 180 }, (_, i) => ({ a: (i / 180) * Math.PI * 2 + R() * 0.02, w: 1 + R() * 2.5, l: 0.6 + R() * 0.4, c: R() > 0.5 ? "#7fa2b0" : "#4c6d7c" }));
  const veins = Array.from({ length: 16 }, () => ({ side: R() > 0.5 ? 1 : -1, y: 860 + R() * 240, l: 160 + R() * 160, b: R() }));
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("em20", 20)}
        {blur("em6", 6)}
        {blur("em2", 2)}
        <radialGradient id="emSkin" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#d49a80" />
          <stop offset="100%" stopColor="#7a4a3a" />
        </radialGradient>
        <radialGradient id="emSclera" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={`rgb(${246 - red * 6},${238 - red * 60},${226 - red * 60})`} />
          <stop offset="100%" stopColor={`rgb(${200 - red * 20},${170 - red * 60},${160 - red * 60})`} />
        </radialGradient>
        <radialGradient id="emIris" cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor="#6d93a4" />
          <stop offset="85%" stopColor="#3d5a68" />
          <stop offset="100%" stopColor="#1c2a32" />
        </radialGradient>
        <clipPath id="emEye"><path d="M140 990 C300 760 780 740 950 960 C780 1190 300 1210 140 990 Z" /></clipPath>
        <filter id="emTex" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves={3} seed={8} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.24  0 0 0 0 0.2  0 0 0 -1.1 0.9" />
        </filter>
      </defs>
      <rect width="1080" height="1920" fill="url(#emSkin)" />
      <rect width="1080" height="1920" filter="url(#emTex)" opacity={0.45} />
      {/* морщины вокруг */}
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${960 + i * 4} ${900 + i * 22} q60 ${-10 + i * 4} 120 ${-20 + i * 8}`} stroke="#5a3022" strokeWidth={4} fill="none" opacity={0.5} />)}
      {[680, 720, 1250, 1290].map((y, i) => <path key={y} d={`M${200 + i * 20} ${y} C450 ${y + (i < 2 ? -40 : 40)} 650 ${y + (i < 2 ? -40 : 40)} ${880 - i * 20} ${y}`} stroke="#5a3022" strokeWidth={5} fill="none" opacity={0.45} />)}
      <ellipse cx={540} cy={1180} rx={420} ry={110} fill="#5e3350" opacity={0.45} filter="url(#em20)" />
      {/* глазное яблоко */}
      <g clipPath="url(#emEye)">
        <rect width="1080" height="1920" fill="url(#emSclera)" />
        {veins.map((v, i) => {
          const x0 = v.side > 0 ? 960 : 120;
          return <path key={i} d={`M${x0} ${v.y} q${-v.side * v.l * 0.5} ${(v.b - 0.5) * 60} ${-v.side * v.l} ${(v.b - 0.5) * 30} m${v.side * v.l * 0.4} 0 q${-v.side * 40} ${-30 + v.b * 60} ${-v.side * 80} ${-20}`} stroke="#c0282a" strokeWidth={1.5 + v.b * 2.5} fill="none" opacity={0.25 + red * 0.7} />;
        })}
        {/* радужка */}
        <circle cx={cx} cy={cy} r={230} fill="url(#emIris)" />
        {fibers.map((fb, i) => (
          <line key={i} x1={cx + Math.cos(fb.a) * (pr + 4)} y1={cy + Math.sin(fb.a) * (pr + 4)} x2={cx + Math.cos(fb.a) * (pr + (226 - pr) * fb.l)} y2={cy + Math.sin(fb.a) * (pr + (226 - pr) * fb.l)} stroke={fb.c} strokeWidth={fb.w} opacity={0.75} />
        ))}
        <circle cx={cx} cy={cy} r={pr + 30} fill="none" stroke="#a88a50" strokeWidth={14} opacity={0.35} />
        <circle cx={cx} cy={cy} r={230} fill="none" stroke="#16222a" strokeWidth={16} />
        {/* зрачок */}
        <circle cx={cx} cy={cy} r={pr} fill="#05080a" />
        {/* отражение: окно + силуэт лисы */}
        <g opacity={0.5}>
          <rect x={cx - 110} y={cy - 150} width={90} height={110} rx={10} fill="#cfe6ff" opacity={0.35} />
          {fox > 0 && (
            <path transform={`translate(${cx + 20} ${cy - 10}) scale(${0.9})`} d="M-60 40 L-40 -20 L-28 10 L-10 -6 L10 -6 L28 10 L40 -20 L60 40 C40 60 20 70 0 72 C-20 70 -40 60 -60 40 Z M60 40 C110 50 150 40 170 20 C160 60 110 80 60 70 Z" fill="#ff9a4a" opacity={fox} filter="url(#em2)" />
          )}
        </g>
        {/* мокрый блик */}
        <ellipse cx={cx - 120} cy={cy - 110} rx={60} ry={38} fill="#fff" opacity={0.85} filter="url(#em2)" />
        <ellipse cx={cx + 140} cy={cy + 120} rx={22} ry={12} fill="#fff" opacity={0.5} />
        {/* тень верхнего века на яблоке */}
        <path d="M140 990 C300 760 780 740 950 960 L950 880 L140 880 Z" fill="#3a2018" opacity={0.45} filter="url(#em20)" />
      </g>
      {/* веки и ресницы */}
      <path d="M140 990 C300 760 780 740 950 960" stroke="#3a1c14" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M140 990 C300 1210 780 1190 950 960" stroke="#6a3a2c" strokeWidth={6} fill="none" />
      <path d="M150 960 C300 690 790 660 960 930" stroke="#7a4636" strokeWidth={5} fill="none" opacity={0.7} />
      {Array.from({ length: 40 }, (_, i) => {
        const t = 0.05 + (i / 40) * 0.9;
        const x = 140 + t * 810, y = 990 - Math.sin(t * Math.PI) * 225 - (t - 0.5) * 30;
        return <path key={i} d={`M${x} ${y} q${-10 + t * 20} -40 ${-24 + t * 50} -70`} stroke="#2a1a14" strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
      {/* слеза у внутреннего угла */}
      <ellipse cx={150} cy={1000} rx={18} ry={26} fill="#e8f4f8" opacity={0.6} />
    </svg>
  );
};

// ---------- Постель сверху: лицо на подушке (FaceOld повёрнут), одеяло с узором, свет ночника ----------
export const BedTop: React.FC<{ frame: number; face: FaceProps; thermo?: boolean; breath?: number }> = ({ frame, face, thermo, breath = 1 }) => {
  const b = 1 + Math.sin(frame / 14) * 0.012 * breath;
  return (
    <>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          {blur("bt40", 40)}
          <pattern id="quilt" patternUnits="userSpaceOnUse" width="90" height="90">
            <rect width="90" height="90" fill="#6a2a2a" />
            <path d="M0 45 L45 0 L90 45 L45 90 Z" fill="#7a3434" />
            <circle cx="45" cy="45" r="8" fill="#c89a5a" />
            <path d="M0 0 L90 90 M90 0 L0 90" stroke="#4a1a1a" strokeWidth="2" />
          </pattern>
          <radialGradient id="pillow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#f0ebe0" />
            <stop offset="100%" stopColor="#b8b0a0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="#2a1e16" />
        {/* простыня */}
        <rect x={60} y={300} width={960} height={1700} rx={30} fill="#d8d0c0" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${80 + i * 120} 320 q40 300 ${-20 + (i % 2) * 40} 700`} stroke="#b8ae9c" strokeWidth={6} fill="none" opacity={0.5} />)}
        {/* подушка */}
        <path d="M140 420 C140 360 940 360 940 420 L960 900 C960 960 120 960 120 900 Z" fill="url(#pillow)" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${220 + i * 260} 430 q30 200 -10 420`} stroke="#a8a090" strokeWidth={5} fill="none" opacity={0.5} />)}
        {/* тёплый ночник слева */}
        <ellipse cx={0} cy={700} rx={500} ry={600} fill="#ffb060" opacity={0.25} filter="url(#bt40)" />
      </svg>
      {/* лицо: портрет FaceOld повёрнут на 90°, голова на подушке */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "translate(0px, -330px) scale(0.78)", transformOrigin: "50% 50%" }}>
        <FaceOld frame={frame} {...face} />
      </div>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          {blur("bt40b", 40)}
          <pattern id="quiltB" patternUnits="userSpaceOnUse" width="90" height="90">
            <rect width="90" height="90" fill="#6a2a2a" />
            <path d="M0 45 L45 0 L90 45 L45 90 Z" fill="#7a3434" />
            <circle cx="45" cy="45" r="8" fill="#c89a5a" />
            <path d="M0 0 L90 90 M90 0 L0 90" stroke="#4a1a1a" strokeWidth="2" />
          </pattern>
        </defs>
        {/* одеяло, дышит */}
        <g transform={`translate(540 1300) scale(1 ${b}) translate(-540 -1300)`}>
          <path d="M60 960 C200 910 880 910 1020 960 L1020 1920 L60 1920 Z" fill="url(#quiltB)" stroke="#2a0e0e" strokeWidth={4} />
          <path d="M60 960 C200 910 880 910 1020 960 L1020 1030 C880 990 200 990 60 1030 Z" fill="#e8e0d0" />
          <ellipse cx={540} cy={1500} rx={500} ry={300} fill="#000" opacity={0.25} filter="url(#bt40b)" />
        </g>
      </svg>
      {thermo && (
        <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(700 1130) rotate(-20)">
            <rect x={0} y={-12} width={260} height={24} rx={12} fill="#eef4f6" stroke="#7a8a90" strokeWidth={3} />
            <rect x={30} y={-4} width={170} height={8} rx={4} fill="#d8302a" />
            <circle cx={14} cy={0} r={18} fill="#d8302a" stroke="#7a8a90" strokeWidth={3} />
            {Array.from({ length: 10 }, (_, i) => <line key={i} x1={60 + i * 18} y1={-12} x2={60 + i * 18} y2={-2} stroke="#5a6a70" strokeWidth={2} />)}
          </g>
        </svg>
      )}
    </>
  );
};

// ---------- Микроскоп: капля слюны, в ней вирусы-«пули» шевелятся ----------
export const MicroscopeDrop: React.FC<{ frame: number; density?: number }> = ({ frame, density = 1 }) => {
  const R = mulberry(41);
  const v = Array.from({ length: 70 }, () => ({ x: (R() - 0.5) * 640, y: (R() - 0.5) * 640, a: R() * Math.PI * 2, s: 0.6 + R() * 0.8, ph: R() * 6 }));
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("md30", 30)}
        {blur("md3", 3)}
        <radialGradient id="mdField" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f2f0d8" />
          <stop offset="70%" stopColor="#d8d4b0" />
          <stop offset="100%" stopColor="#8a8460" />
        </radialGradient>
        <clipPath id="mdC"><circle cx={540} cy={1000} r={430} /></clipPath>
      </defs>
      <rect width="1080" height="1920" fill="#050403" />
      <g clipPath="url(#mdC)">
        <rect width="1080" height="1920" fill="url(#mdField)" />
        {/* клетки эпителия на фоне */}
        {Array.from({ length: 7 }, (_, i) => {
          const x = 300 + ((i * 173) % 500), y = 760 + ((i * 251) % 500);
          return (
            <g key={i}>
              <path d={`M${x - 70} ${y} C${x - 60} ${y - 60} ${x + 50} ${y - 70} ${x + 80} ${y - 10} C${x + 90} ${y + 50} ${x - 20} ${y + 70} ${x - 70} ${y} Z`} fill="#e8c8c0" stroke="#b08080" strokeWidth={2} opacity={0.6} />
              <circle cx={x + 6} cy={y} r={14} fill="#8a5a8a" opacity={0.6} />
            </g>
          );
        })}
        {v.slice(0, Math.round(70 * density)).map((p, i) => {
          const x = 540 + p.x + Math.sin(frame / 20 + p.ph) * 14, y = 1000 + p.y + Math.cos(frame / 23 + p.ph) * 14;
          const a = (p.a + Math.sin(frame / 15 + p.ph) * 0.3) * (180 / Math.PI);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(${p.s})`}>
              <path d="M-26 -10 L14 -10 C30 -10 34 0 34 0 C34 0 30 10 14 10 L-26 10 Z" fill="#6cc030" stroke="#2a5a10" strokeWidth={2.5} />
              <path d="M-20 -10 L-20 10 M-10 -10 L-10 10 M0 -10 L0 10 M10 -10 L10 10" stroke="#3a7a14" strokeWidth={1.5} />
            </g>
          );
        })}
        {/* пузырьки слюны */}
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={240 + ((i * 97) % 600)} cy={700 + ((i * 131) % 600)} r={18 + (i % 4) * 14} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5} />)}
      </g>
      <circle cx={540} cy={1000} r={430} fill="none" stroke="#000" strokeWidth={60} opacity={0.8} filter="url(#md30)" />
      <circle cx={540} cy={1000} r={432} fill="none" stroke="#1a1814" strokeWidth={8} />
      {/* шкала окуляра */}
      <line x1={340} y1={1360} x2={540} y2={1360} stroke="#222" strokeWidth={4} />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={340 + i * 20} y1={1350} x2={340 + i * 20} y2={i % 5 ? 1360 : 1342} stroke="#222" strokeWidth={3} />)}
    </svg>
  );
};

// ---------- Поперечный срез нерва: аксоны в миелине, вирус внутри; иммунные клетки снаружи отскакивают ----------
export const NerveCross: React.FC<{ frame: number }> = ({ frame }) => {
  const R = mulberry(19);
  const axons = Array.from({ length: 26 }, () => {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 240;
    return { x: 540 + Math.cos(a) * d, y: 1000 + Math.sin(a) * d, r: 26 + R() * 22, inf: R() > 0.55 };
  });
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("nc20", 20)}
        {blur("nc4", 4)}
        <radialGradient id="ncBg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#2a0e14" />
          <stop offset="100%" stopColor="#0a0306" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#ncBg)" />
      {/* оболочка нерва */}
      <circle cx={540} cy={1000} r={300} fill="#3a2214" stroke="#e8c070" strokeWidth={14} />
      <circle cx={540} cy={1000} r={290} fill="none" stroke="#a87a3a" strokeWidth={6} strokeDasharray="4 10" />
      {axons.map((ax, i) => (
        <g key={i}>
          <circle cx={ax.x} cy={ax.y} r={ax.r} fill="#f2dca0" stroke="#b8904a" strokeWidth={3} />
          <circle cx={ax.x} cy={ax.y} r={ax.r * 0.55} fill={ax.inf ? "#2a4a10" : "#6a3a2a"} />
          {ax.inf && (
            <g>
              <circle cx={ax.x} cy={ax.y} r={ax.r * 0.9} fill="#9bff4a" opacity={0.35 + 0.2 * Math.sin(frame / 4 + i)} filter="url(#nc4)" />
              <rect x={ax.x - 8} y={ax.y - 3} width={16} height={6} rx={3} fill="#c8ff8a" transform={`rotate(${frame * 2 + i * 40} ${ax.x} ${ax.y})`} />
            </g>
          )}
        </g>
      ))}
      {/* иммунные клетки: бродят снаружи, упираются в оболочку */}
      {Array.from({ length: 7 }, (_, i) => {
        const base = (i / 7) * Math.PI * 2 + frame * 0.01 * (i % 2 ? 1 : -1);
        const bump = Math.abs(Math.sin(frame / 9 + i)) ;
        const d = 360 + bump * 60;
        const x = 540 + Math.cos(base) * d, y = 1000 + Math.sin(base) * d;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${frame * 3 + i * 50})`}>
            <path d="M-46 0 C-50 -30 -20 -50 6 -44 C40 -40 52 -10 46 14 C40 44 6 52 -18 42 C-40 34 -44 18 -46 0 Z" fill="#e8eef4" stroke="#8aa0b8" strokeWidth={3} opacity={0.92} />
            <path d="M-14 -10 C-6 -22 14 -18 16 -4 C18 10 2 18 -8 12 C-18 8 -20 0 -14 -10 Z" fill="#6a5ab0" />
            {bump > 0.85 && <text x={0} y={-58} textAnchor="middle" fontSize={44} fontWeight={900} fill="#ff4a2a" fontFamily="sans-serif">?</text>}
          </g>
        );
      })}
    </svg>
  );
};

// ---------- Занавеска на ветру (передний план) ----------
export const Curtain: React.FC<{ frame: number }> = ({ frame }) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <defs>
      {blur("cu10", 10)}
      <linearGradient id="cuG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#efe6d0" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#d8ccb0" stopOpacity="0.55" />
      </linearGradient>
    </defs>
    {[0, 1].map((k) => {
      const w = Math.sin(frame / 5 + k) * 90 + Math.sin(frame / 2.3) * 30;
      return (
        <path key={k} d={`M${-40 + k * 30} 0 L${260 + k * 40} 0 C${300 + w} 500 ${380 + w * 1.6} 1100 ${330 + w * 2.2} 1920 L${-40} 1920 Z`} fill="url(#cuG)" stroke="#b8a888" strokeWidth={3} opacity={0.9 - k * 0.3} />
      );
    })}
    {[60, 140, 220].map((x, i) => <path key={i} d={`M${x} 0 C${x + 30 + Math.sin(frame / 5 + i) * 60} 700 ${x + Math.sin(frame / 4 + i) * 90} 1300 ${x + 40} 1920`} stroke="#b0a080" strokeWidth={5} fill="none" opacity={0.5} />)}
  </svg>
);

// ---------- Секундомер: 15:00 → отсчёт ----------
export const Stopwatch: React.FC<{ frame: number; fps?: number }> = ({ frame }) => {
  const sec = Math.max(0, 15 * 60 - Math.floor(frame * 12)); // ускоренно: 12 с за кадр
  const mm = String(Math.floor(sec / 60)).padStart(2, "0"), ss = String(sec % 60).padStart(2, "0");
  const a = (frame * 12 / 60) * 6 * (Math.PI / 180) * 60;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(820 560)">
        <circle r={150} fill="#101418" stroke="#d8e0e4" strokeWidth={12} />
        <rect x={-24} y={-200} width={48} height={40} rx={8} fill="#d8e0e4" />
        {Array.from({ length: 60 }, (_, i) => <line key={i} x1={0} y1={-130} x2={0} y2={i % 5 ? -120 : -105} stroke="#d8e0e4" strokeWidth={i % 5 ? 2 : 4} transform={`rotate(${i * 6})`} />)}
        <line x1={0} y1={0} x2={0} y2={-115} stroke="#FFD000" strokeWidth={6} strokeLinecap="round" transform={`rotate(${(a * 180) / Math.PI})`} />
        <circle r={10} fill="#FFD000" />
        <text x={0} y={60} textAnchor="middle" fontSize={44} fontWeight={800} fill="#FFD000" fontFamily="Montserrat, sans-serif">{mm}:{ss}</text>
      </g>
    </svg>
  );
};
