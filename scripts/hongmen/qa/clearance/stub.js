// Headless stubs for building the hongmen World in node: canvas / document / WebGL are inert proxies.
// Nothing here draws; only geometry, matrices and the scene graph are real.
const __mk = () => { const fn = function () {}; return new Proxy(fn, { get(t, k) { if (k === Symbol.toPrimitive) return () => 0; if (k === "width" || k === "height") return 64; if (k === "data") return new Uint8ClampedArray(64 * 64 * 4); if (k === "length") return 0; if (k === "then") return undefined; if (!(k in t)) t[k] = __mk(); return t[k]; }, set(t, k, v) { t[k] = v; return true; }, apply() { return __mk(); }, construct() { return __mk(); } }); };
globalThis.__mk = __mk;
globalThis.document = { createElement: () => __mk(), createElementNS: () => __mk(), body: __mk(), fonts: __mk() };
globalThis.Image = function () { return __mk(); };
globalThis.OffscreenCanvas = function () { return __mk(); };
globalThis.HTMLCanvasElement = function () {}; globalThis.HTMLImageElement = function () {}; globalThis.ImageBitmap = function () {};
