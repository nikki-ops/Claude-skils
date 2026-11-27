export function h(type, props, ...children) {
  if (typeof type === "function") return type({ ...(props || {}), children: children.flat(Infinity) });
  return { type, props: props || {}, children: children.flat(Infinity).filter((c) => c != null && c !== false && c !== true) };
}
export const Fragment = (p) => p.children;
