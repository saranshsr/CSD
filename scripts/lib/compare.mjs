// Pixel comparison shared by visual-ref.mjs (kit vs external reference) and visual-snap.mjs (kit vs its previous self).
// compare(a, b, { width, height, scale, masks, channelTolerance, cell }) on raw RGB buffers of the same size returns
//   { counted, masked, different, share, cells: [{ x, y, w, h, share, n }] (CSS px), regions, colour, diff (RGB buffer) }
// · a pixel differs when any channel is off by more than channelTolerance (anti-aliasing and hinting stay below 40)
// · regions: connected groups of cells with > regionShare differing pixels, biggest first, as CSS px boxes
// · colour: ΔE76 (CIELAB) over all counted pixels (mean, p95, max) and the most common ref → kit colour swaps
import sharp from 'sharp';

const srgb = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const LIN = Array.from({ length: 256 }, (_, i) => srgb(i));
const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
function lab(r, g, b) {
  const R = LIN[r], G = LIN[g], B = LIN[b];
  const x = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047);
  const y = f(R * 0.2126 + G * 0.7152 + B * 0.0722);
  const z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
const hex = (r, g, b) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
const q = (v) => Math.min(255, Math.round(v / 8) * 8); // 32 levels per channel for grouping colour swaps

export async function rawRgb(input, { width, height } = {}) {
  let img = sharp(input).removeAlpha();
  if (width && height) img = img.resize(width, height, { fit: 'fill' });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

export function compare(a, b, { width: W, height: H, scale = 1, masks = [], channelTolerance = 40, cell = 24, regionShare = 0.2 }) {
  const C = cell * scale;
  const cols = Math.ceil(W / C);
  const rows = Math.ceil(H / C);
  const n = new Uint32Array(cols * rows);
  const d = new Uint32Array(cols * rows);
  const diff = Buffer.alloc(W * H * 3);
  const maskPx = masks.map(([mx, my, mw, mh]) => [mx * scale, my * scale, (mx + mw) * scale, (my + mh) * scale]);
  const isMasked = (x, y) => maskPx.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);
  const swaps = new Map();
  const dE = [];
  let counted = 0;
  let masked = 0;
  let different = 0;
  const step = Math.max(1, Math.floor((W * H) / 200000)); // ΔE on a sample for big images
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      if (isMasked(x, y)) {
        masked++;
        diff[i] = 120; diff[i + 1] = 170; diff[i + 2] = 255;
        continue;
      }
      counted++;
      const off = Math.abs(a[i] - b[i]) > channelTolerance || Math.abs(a[i + 1] - b[i + 1]) > channelTolerance || Math.abs(a[i + 2] - b[i + 2]) > channelTolerance;
      const k = Math.floor(y / C) * cols + Math.floor(x / C);
      n[k]++;
      if ((y * W + x) % step === 0) {
        const p = lab(a[i], a[i + 1], a[i + 2]);
        const r = lab(b[i], b[i + 1], b[i + 2]);
        dE.push(Math.hypot(p[0] - r[0], p[1] - r[1], p[2] - r[2]));
      }
      if (off) {
        different++;
        d[k]++;
        diff[i] = 230; diff[i + 1] = 40; diff[i + 2] = 40;
        const key = `${hex(q(a[i]), q(a[i + 1]), q(a[i + 2]))}>${hex(q(b[i]), q(b[i + 1]), q(b[i + 2]))}`;
        swaps.set(key, (swaps.get(key) ?? 0) + 1);
      } else {
        const g = Math.round(((a[i] + a[i + 1] + a[i + 2]) / 3) * 0.35 + 165);
        diff[i] = g; diff[i + 1] = g; diff[i + 2] = g;
      }
    }
  }
  const cells = [];
  for (let k = 0; k < n.length; k++) if (n[k]) cells.push({ x: (k % cols) * cell, y: Math.floor(k / cols) * cell, w: cell, h: cell, share: d[k] / n[k], n: d[k] });
  // regions: 4-connected flood fill over hot cells
  const hot = new Set(cells.filter((c) => c.share > regionShare).map((c) => (c.y / cell) * cols + c.x / cell));
  const byKey = new Map(cells.map((c) => [(c.y / cell) * cols + c.x / cell, c]));
  const seen = new Set();
  const regions = [];
  for (const start of hot) {
    if (seen.has(start)) continue;
    const stack = [start];
    seen.add(start);
    let x0 = Infinity, y0 = Infinity, x1 = 0, y1 = 0, px = 0, tot = 0;
    while (stack.length) {
      const k = stack.pop();
      const c = byKey.get(k);
      x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x + cell); y1 = Math.max(y1, c.y + cell);
      px += c.n;
      tot += n[k];
      const cx = k % cols;
      for (const nb of [k - cols, k + cols, cx > 0 ? k - 1 : -1, cx < cols - 1 ? k + 1 : -1]) {
        if (nb >= 0 && hot.has(nb) && !seen.has(nb)) { seen.add(nb); stack.push(nb); }
      }
    }
    regions.push({ x: x0, y: y0, w: Math.min(x1, W / scale) - x0, h: Math.min(y1, H / scale) - y0, share: tot ? px / tot : 0, pixels: px });
  }
  regions.sort((p, r) => r.pixels - p.pixels);
  dE.sort((p, r) => p - r);
  const mean = dE.length ? dE.reduce((s, v) => s + v, 0) / dE.length : 0;
  const colour = {
    deltaE: { mean: +mean.toFixed(2), p95: +(dE[Math.floor(dE.length * 0.95)] ?? 0).toFixed(2), max: +(dE.at(-1) ?? 0).toFixed(2) },
    swaps: [...swaps.entries()].sort((p, r) => r[1] - p[1]).slice(0, 5).map(([k, c]) => { const [ref, kit] = k.split('>'); return { ref, kit, share: different ? +(c / different).toFixed(3) : 0 }; }),
  };
  return { counted, masked, different, share: counted ? different / counted : 0, maskedShare: W * H ? masked / (W * H) : 0, cells, regions, colour, diff };
}

export const writeRgb = (buf, width, height, path) => sharp(buf, { raw: { width, height, channels: 3 } }).png().toFile(path);

/** ref | kit | diff side by side with 8px gutters, for the report. */
export async function sideBySide(paths, out, height) {
  const imgs = await Promise.all(paths.map((p) => sharp(p).resize({ height, fit: 'inside' }).png().toBuffer({ resolveWithObject: true })));
  const width = imgs.reduce((s, i) => s + i.info.width, 0) + 8 * (imgs.length - 1);
  let left = 0;
  const composite = imgs.map((i) => { const c = { input: i.data, left, top: 0 }; left += i.info.width + 8; return c; });
  await sharp({ create: { width, height, channels: 3, background: '#ffffff' } }).composite(composite).png().toFile(out);
}
