// Serialize a Higgsedit-like node tree to SVG at local time t (approximate: opacity/offset/scale/morph).
let fid = 0; const defs = [];
// easing: named curves and cubic-bezier arrays [x1,y1,x2,y2] (overshoot allowed), like Higgsedit
const bez = (x1, y1, x2, y2) => (x) => { let lo = 0, hi = 1, u = x; for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; const bx = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u; if (bx < x) lo = u; else hi = u; } return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u; };
const EASE = { linear: (u) => u, "ease-in": bez(0.42, 0, 1, 1), "ease-out": bez(0, 0, 0.58, 1), "ease-in-out": bez(0.42, 0, 0.58, 1), smooth: (u) => u * u * (3 - 2 * u), bounce: bez(0.3, 1.5, 0.6, 1) };
const easeFn = (e) => (Array.isArray(e) ? bez(...e) : EASE[e] || EASE.linear);
const ev = (kf, t) => {
  if (!kf || !kf.length) return null;
  if (t <= kf[0].at) return kf[0].value;
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i], b = kf[i + 1];
    if (t >= a.at && t < b.at) { if (a.easing === "hold") return a.value; const u = easeFn(a.easing)((t - a.at) / (b.at - a.at)); return a.value + (b.value - a.value) * u; }
  }
  return kf[kf.length - 1].value;
};
// smooth shape morph: interpolate every number when both paths have the same command structure
const NUM = /-?\d*\.?\d+(?:e-?\d+)?/g;
function lerpPath(d1, d2, u) {
  if (u === 0) return d1; if (u === 1) return d2;
  const n1 = d1.match(NUM) || [], n2 = d2.match(NUM) || [];
  if (n1.length !== n2.length || d1.replace(NUM, "#") !== d2.replace(NUM, "#")) return u < 0.5 ? d1 : d2;
  let i = 0; return d1.replace(NUM, () => { const v = +n1[i] + (+n2[i] - +n1[i]) * u; i++; return (Math.round(v * 10) / 10).toString(); });
}
function anim(props, t) {
  const o = {};
  for (const a of props.animate || []) {
    let kf = a.keyframes || [{ at: a.at || 0, value: a.from }, { at: (a.at || 0) + (a.duration || 0.01), value: a.to }];
    let tt = t;
    if (a.repeat && kf.length > 1) { const L = kf[kf.length - 1].at - kf[0].at; if (tt < kf[0].at + L * a.repeat) tt = kf[0].at + ((tt - kf[0].at) % L); }
    o[a.property] = ev(kf, tt);
  }
  return o;
}
const col = (c) => (typeof c === "string" ? c : "#888888");
function filt(props) {
  const b = (props.effects || []).find((e) => e.kind === "blur");
  if (!b) return "";
  const id = "f" + fid++; defs.push(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${b.params.px / 2}"/></filter>`);
  return ` filter="url(#${id})"`;
}
export function toSVG(n, t) {
  if (Array.isArray(n)) return n.map((c) => toSVG(c, t)).join("");
  if (!n || typeof n !== "object") return "";
  const p = n.props, a = anim(p, t), op = (a.opacity ?? 1) * (p.opacity ?? 1);
  if (op <= 0.001) return "";
  const O = op < 1 ? ` opacity="${op}"` : "";
  if (n.type === "frame" || n.type === "group") {
    const x = (p.x || 0) + (a.offsetX || 0), y = (p.y || 0) + (a.offsetY || 0);
    const s = a.scale ?? 1, w = p.width || 0, hh = p.height || 0;
    const oc = p.origin === "top-left" ? [0, 0] : [w / 2, hh / 2];
    const sx = s, sy = Math.abs(s);
    const tr = `translate(${x} ${y}) translate(${oc[0]} ${oc[1]}) scale(${sx} ${sy}) rotate(${a.rotation || 0}) translate(${-oc[0]} ${-oc[1]})`;
    return `<g transform="${tr}"${O}${filt(p)}>${toSVG(n.children, t)}</g>`;
  }
  if (n.type === "path") {
    const d = p.morphTo ? lerpPath(p.d, p.morphTo, a.morphProgress ?? 0) : p.d;
    const st = p.stroke ? ` stroke="${col(p.stroke.color)}" stroke-width="${p.stroke.width}" stroke-linecap="${p.stroke.cap || "butt"}" stroke-linejoin="round"` : "";
    return `<path transform="translate(${p.x || 0} ${p.y || 0})" d="${d}" fill="${p.fill ? col(p.fill) : "none"}"${st}${O}${filt(p)}/>`;
  }
  if (n.type === "rect") {
    const st = p.strokeColor ? ` stroke="${p.strokeColor}" stroke-width="${p.strokeWidth || 1}"` : "";
    return `<rect x="${p.x || 0}" y="${p.y || 0}" width="${p.width}" height="${p.height}" rx="${p.radius || 0}" fill="${col(p.fill)}"${st}${O}${filt(p)}/>`;
  }
  if (n.type === "text") {
    const anchor = p.align === "center" ? "middle" : "start", tx = p.align === "center" ? (p.x || 0) + p.width / 2 : p.x || 0;
    const sh = p.shadow ? `<text x="${tx + p.shadow.x}" y="${(p.y || 0) + p.fontSize * 0.85 + p.shadow.y}" text-anchor="${anchor}" font-family="${p.fontFamily}, sans-serif" font-weight="${p.fontWeight}" font-size="${p.fontSize}" fill="${p.shadow.color}" stroke="${p.shadow.color}" stroke-width="${(p.strokeWidth || 0) * 2}" stroke-linejoin="round">${n.children.join("")}</text>` : "";
    return sh + `<text x="${tx}" y="${(p.y || 0) + p.fontSize * 0.85}" text-anchor="${anchor}" font-family="${p.fontFamily}, sans-serif" font-weight="${p.fontWeight}" font-size="${p.fontSize}" fill="${p.color}" stroke="${p.strokeColor || "none"}" stroke-width="${(p.strokeWidth || 0) * 2}" paint-order="stroke" stroke-linejoin="round"${O}>${n.children.join("")}</text>`;
  }
  return toSVG(n.children, t);
}
export const svgDefs = () => defs.join("");
export const resetDefs = () => { defs.length = 0; };
