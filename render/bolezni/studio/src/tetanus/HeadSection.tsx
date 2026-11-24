import React from "react";
import { mulberry } from "../components/rand";

// Сагиттальный разрез головы и шеи (смотрит влево): кости, мозг, полость носа, язык, глотка,
// надгортанник, гортань → трахея, пищевод, шейные позвонки со спинным мозгом, слюнные железы.
// Режимы: spasm 0..1 — мышцы глотки сжимаются (красный пульс, сужение, дрожь), капля воды застревает;
// saliva 0..1 — слюнные железы светятся зелёным, по протокам течёт слюна с вирусами.
const OUT = "#2a1610";

const blur = (id: string, s: number) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={s} /></filter>
);

// профиль головы + шея
const HEAD =
  "M330 470 C420 380 600 360 720 410 C830 460 880 570 875 690 C872 780 840 850 800 900 C790 960 770 1040 760 1110 " +
  "C755 1250 760 1380 770 1560 L420 1560 C430 1420 430 1290 410 1200 C380 1150 330 1120 300 1080 " +
  "C285 1060 290 1040 300 1030 C280 1010 270 990 285 975 C262 962 262 940 282 928 C270 912 268 895 285 885 " +
  "C250 860 225 830 215 805 C210 790 225 780 245 775 C260 740 270 700 280 650 C290 580 300 520 330 470 Z";

export const HeadSection: React.FC<{ frame: number; spasm?: number; saliva?: number; water?: number }> = ({ frame, spasm = 0, saliva = 0, water = 0 }) => {
  const r = mulberry(3);
  const vib = spasm * Math.sin(frame * 2.3) * 4;
  const squeeze = spasm * (0.55 + 0.45 * Math.abs(Math.sin(frame / 5))); // сила сжатия
  const pw = 34 * (1 - squeeze * 0.75); // ширина просвета глотки
  // капля воды: из рта к глотке, потом застревает и дёргается назад
  const wt = Math.min(1, water);
  const dropX = 330 + wt * 200 + (spasm > 0.3 ? -Math.abs(Math.sin(frame / 3)) * 20 * spasm : 0);
  const dropY = 955 + wt * 40;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, filter: "blur(0.5px)" }}>
      <defs>
        {blur("hs30", 30)}
        {blur("hs12", 12)}
        {blur("hs5", 5)}
        <clipPath id="hsClip"><path d={HEAD} /></clipPath>
        <radialGradient id="hsSkin" cx="45%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#c98a72" />
          <stop offset="100%" stopColor="#8a5444" />
        </radialGradient>
        <radialGradient id="hsBrain" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#e8b6b0" />
          <stop offset="100%" stopColor="#b97a7a" />
        </radialGradient>
        <linearGradient id="hsMuscle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c0473a" />
          <stop offset="100%" stopColor="#7e2018" />
        </linearGradient>
        <pattern id="hsFib" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(60)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#5a120c" strokeWidth="1.4" opacity="0.5" />
        </pattern>
        <filter id="hsTex" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={4} seed={4} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 -1.6 1.1" />
        </filter>
      </defs>
      <g transform={`translate(${vib - 150} -250) scale(1.28)`}>
        {/* кожа/мягкие ткани */}
        <path d={HEAD} fill="url(#hsSkin)" />
        <g clipPath="url(#hsClip)">
          <rect width="1080" height="1920" filter="url(#hsTex)" opacity={0.35} />
          {/* череп: свод (кремовая полоса) */}
          <path d="M350 600 C380 470 520 420 650 440 C770 460 840 560 830 700 C825 770 800 820 770 850" stroke="#efe2c4" strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d="M350 600 C380 470 520 420 650 440 C770 460 840 560 830 700 C825 770 800 820 770 850" stroke="#b8a37e" strokeWidth={34} fill="none" strokeDasharray="2 9" opacity={0.6} />
          {/* мозг */}
          <path d="M380 620 C400 500 520 465 640 478 C750 492 805 580 800 690 C796 770 760 810 690 820 C600 830 520 800 460 760 C410 730 375 690 380 620 Z" fill="url(#hsBrain)" stroke="#7a3a3a" strokeWidth={3} />
          {Array.from({ length: 16 }, (_, i) => {
            const x = 420 + (i % 8) * 46, y = 540 + Math.floor(i / 8) * 110;
            return <path key={i} d={`M${x} ${y} q20 ${-18 + (i % 3) * 8} 40 0 q14 16 30 ${(i % 2) * 10}`} stroke="#8a4848" strokeWidth={3} fill="none" opacity={0.6} />;
          })}
          {/* мозжечок и ствол */}
          <ellipse cx={720} cy={850} rx={70} ry={48} fill="#c48a86" stroke="#7a3a3a" strokeWidth={3} />
          <path d="M640 800 C650 870 660 930 670 990" stroke="#d8a8a0" strokeWidth={36} fill="none" strokeLinecap="round" />
          {/* полость носа, раковины */}
          <path d="M260 800 C320 760 420 760 520 790 L540 860 C440 850 340 850 270 860 Z" fill="#3a1a18" />
          {[790, 815, 838].map((y, i) => <path key={y} d={`M${300 + i * 10} ${y} C360 ${y - 18} 440 ${y - 14} ${500 - i * 10} ${y + 4}`} stroke="#c87a6a" strokeWidth={14} fill="none" strokeLinecap="round" />)}
          {/* твёрдое нёбо (кость) */}
          <path d="M275 870 C360 862 450 862 540 880" stroke="#efe2c4" strokeWidth={16} fill="none" strokeLinecap="round" />
          {/* челюсть и зубы */}
          <path d="M285 1010 C320 1060 380 1090 470 1080" stroke="#efe2c4" strokeWidth={22} fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => <rect key={`tu${i}`} x={285 + i * 26} y={880} width={20} height={34} rx={6} fill="#f6f0e2" stroke="#9a8a6a" strokeWidth={2} />)}
          {[0, 1, 2, 3].map((i) => <rect key={`tl${i}`} x={290 + i * 26} y={968} width={20} height={34} rx={6} fill="#f6f0e2" stroke="#9a8a6a" strokeWidth={2} />)}
          {/* шейные позвонки + спинной мозг */}
          {Array.from({ length: 7 }, (_, i) => (
            <g key={`v${i}`}>
              <rect x={600 + i * 4} y={950 + i * 82} width={86} height={62} rx={12} fill="#ece0c4" stroke="#9a8a6a" strokeWidth={3} />
              <path d={`M${700 + i * 4} ${965 + i * 82} l60 18 l-58 22 Z`} fill="#e2d4b4" stroke="#9a8a6a" strokeWidth={2} />
            </g>
          ))}
          <path d="M700 900 C705 1100 712 1300 730 1560" stroke="#f0c850" strokeWidth={18} fill="none" opacity={0.85} />
          {/* язык */}
          <path d="M300 930 C340 900 430 890 500 910 C560 930 590 990 580 1060 C560 1110 480 1120 420 1080 C370 1050 320 1000 300 960 Z" fill="url(#hsMuscle)" stroke="#5a1410" strokeWidth={3} />
          <path d="M300 930 C340 900 430 890 500 910 C560 930 590 990 580 1060 C560 1110 480 1120 420 1080 C370 1050 320 1000 300 960 Z" fill="url(#hsFib)" />
          {/* глотка: просвет-воздуховод за языком (сужается при спазме) */}
          <path d={`M${560} 870 C${590 - pw * 0.3} 950 ${590 - pw * 0.2} 1050 ${575} 1150 L${575 + pw} 1150 C${590 + pw * 0.7} 1050 ${595 + pw * 0.6} 950 ${560 + pw} 870 Z`} fill="#1e0c0a" />
          {/* мышцы-констрикторы глотки */}
          {[0, 1, 2].map((i) => (
            <path key={`c${i}`} d={`M${545 + i * 3} ${900 + i * 85} C${575} ${885 + i * 85} ${600 + pw} ${905 + i * 85} ${615 + pw * 0.5} ${940 + i * 85}`} stroke={spasm > 0.1 ? "#ff3a20" : "#b0402c"} strokeWidth={20 + squeeze * 16} fill="none" strokeLinecap="round" opacity={0.85} />
          ))}
          {spasm > 0.05 && <ellipse cx={590} cy={1010} rx={150} ry={190} fill="#ff2a10" opacity={squeeze * 0.45} filter="url(#hs30)" />}
          {/* надгортанник, гортань, голосовые складки, трахея */}
          <path d="M545 1080 C520 1100 515 1130 530 1150" stroke="#f0d0b8" strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M470 1160 L560 1160 L555 1560 L480 1560 Z" fill="#2a1210" />
          {Array.from({ length: 9 }, (_, i) => <path key={`tr${i}`} d={`M466 ${1240 + i * 36} q-10 14 0 26`} stroke="#e8dcc4" strokeWidth={14} fill="none" strokeLinecap="round" />)}
          <path d="M460 1170 C440 1190 440 1230 462 1240" stroke="#e8dcc4" strokeWidth={22} fill="none" />
          <path d="M490 1200 L548 1205" stroke="#f0c8b0" strokeWidth={6} />
          {/* пищевод (за трахеей, спавшийся) */}
          <path d="M575 1150 C578 1300 582 1430 585 1560" stroke="#a8483a" strokeWidth={34} fill="none" />
          <path d="M575 1150 C578 1300 582 1430 585 1560" stroke="#5a1a14" strokeWidth={4} fill="none" />
          {/* слюнные железы: околоушная, поднижнечелюстная, подъязычная */}
          {[
            [650, 905, 62, 48],
            [440, 1110, 52, 34],
            [370, 1010, 36, 18],
          ].map(([x, y, rx, ry], i) => (
            <g key={`g${i}`}>
              <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={saliva > 0 ? `rgb(${200 - saliva * 80},${170 + saliva * 60},${120 - saliva * 40})` : "#d8b080"} stroke="#6a4a2a" strokeWidth={3} />
              {Array.from({ length: 10 }, (_, k) => <circle key={k} cx={x + (r() - 0.5) * rx * 1.4} cy={y + (r() - 0.5) * ry * 1.3} r={rx * 0.14} fill="none" stroke="#6a4a2a" strokeWidth={1.5} opacity={0.6} />)}
              {saliva > 0 && <ellipse cx={x} cy={y} rx={rx * 2} ry={ry * 2} fill="#9bff4a" opacity={saliva * 0.45 * (0.7 + 0.3 * Math.sin(frame / 4 + i))} filter="url(#hs12)" />}
            </g>
          ))}
          {/* протоки слюны → рот, с частицами вируса */}
          {saliva > 0 && (
            <g>
              <path d="M600 905 C520 900 420 930 330 940" stroke="#bfff8a" strokeWidth={6} fill="none" strokeDasharray="10 12" strokeDashoffset={frame * 2} opacity={saliva} />
              <path d="M420 1100 C390 1060 360 1020 330 975" stroke="#bfff8a" strokeWidth={6} fill="none" strokeDasharray="10 12" strokeDashoffset={frame * 2} opacity={saliva} />
              {Array.from({ length: 14 }, (_, k) => {
                const t = ((frame * 0.012 + k / 14) % 1);
                const x = 600 - t * 270, y = 905 + Math.sin(t * Math.PI) * 10 + t * 35;
                return <rect key={k} x={x - 7} y={y - 3} width={14} height={6} rx={3} fill="#9bff4a" opacity={saliva} />;
              })}
              {/* слюна стекает изо рта */}
              <path d={`M285 985 C283 ${1030 + saliva * 60} 290 ${1070 + saliva * 90} 282 ${1110 + saliva * 160}`} stroke="#eaf6f8" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85 * saliva} />
            </g>
          )}
          {/* капля воды */}
          {water > 0 && (
            <g transform={`translate(${dropX} ${dropY})`}>
              <ellipse rx={26} ry={20} fill="#7ac8f0" opacity={0.85} stroke="#d8f2ff" strokeWidth={3} />
              <ellipse cx={-8} cy={-6} rx={8} ry={5} fill="#fff" opacity={0.8} />
            </g>
          )}
          {/* аэрограф: тень по краю профиля */}
          <path d={HEAD} fill="none" stroke="#3a1a10" strokeWidth={60} opacity={0.35} filter="url(#hs30)" />
        </g>
        <path d={HEAD} fill="none" stroke={OUT} strokeWidth={4} />
      </g>
    </svg>
  );
};
