#!/usr/bin/env node
// Asset optimiser for src/assets + the product photos in src/data/products (raster · svg · dotLottie · lottie json). Idempotent: a file is only rewritten when
// the result is at least MIN_GAIN smaller AND (for lossy candidates) visually lossless (PSNR ≥ PSNR_MIN vs the source).
//
//   node scripts/optimize-assets.mjs                 optimise every asset in place, print a before/after report
//   node scripts/optimize-assets.mjs <path…>         only these files / folders
//   node scripts/optimize-assets.mjs --dry           report what would change, write nothing
//   node scripts/optimize-assets.mjs --check         CI: fail on duplicates / files over failKB; warn over warnKB or above size cap
//   node scripts/optimize-assets.mjs --measure       (dev server on :5180, PORT=…) screenshot-free crawl of every route that
//                                                    records each raster's largest rendered CSS size → maxEdge in asset-budget.json
//
// Rules (config + allowlists live in scripts/asset-budget.json):
// - raster (webp/png/gif/jpg): long edge capped at `maxEdge[path]` (3× the largest measured rendered size) or, when the
//   asset was never seen rendered, width capped at `defaultMaxWidth` (3× the 390pt phone). Re-encoded in the same
//   format and filename: webp → smallest of lossless / near-lossless / lossy q82·q90·q95 that passes the PSNR gate; png → lossless max compression or a
//   palette quantisation that passes the PSNR gate; gif → cgif re-encode. Animated webp/gif keep every frame.
// - svg: svgo preset-default + multipass, keeping viewBox, ids (refs from masks/gradients, and several ?raw SVGs are
//   inlined into the same DOM) and dimensions.
// - .lottie (zipped dotLottie): inner JSON minified with floats rounded to 3 dp, inner PNGs recompressed, max deflate.
// - .json (lottie): minified, floats rounded to 3 dp.
// - fonts are never touched.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(root, 'src/assets');
/** product photos live next to their product.ts (src/data/products/<id>/card.webp …) */
const PRODUCT_PHOTOS = path.join(root, 'src/data/products');
const BUDGET_FILE = path.join(root, 'scripts/asset-budget.json');
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const targets = args.filter((a) => !a.startsWith('--')).map((a) => path.resolve(a));
const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
const MIN_GAIN = 0.03; // rewrite only when ≥3% smaller (keeps repeated runs stable)
const PSNR_MIN = budget.psnrMin ?? 37; // dB; lossy candidates below this are rejected
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const typeOf = (f) => {
  const e = path.extname(f).slice(1).toLowerCase();
  return e === 'jpeg' ? 'jpg' : e;
};
const allAssets = () => [
  ...walk(ASSETS).filter((f) => !f.includes(`${path.sep}fonts${path.sep}`)),
  ...(fs.existsSync(PRODUCT_PHOTOS) ? walk(PRODUCT_PHOTOS).filter((f) => /\.(webp|png|jpe?g|avif|svg)$/i.test(f)) : []),
].filter((f) => !path.basename(f).startsWith('.'));


// ───────────────────────────────────────────── optimise ─────────────────────────────────────────────
async function optimise() {
  const dry = flag('--dry');
  const files = allAssets().filter((f) => !targets.length || targets.some((t) => f === t || f.startsWith(t + path.sep)));
  const stats = {};
  const rows = [];
  for (const f of files) {
    const type = typeOf(f);
    const r = rel(f);
    const before = fs.statSync(f).size;
    const s = (stats[type] ??= { n: 0, before: 0, after: 0, changed: 0 });
    s.n++;
    s.before += before;
    let out = null;
    let note = '';
    let resized = false;
    try {
      if (budget.skip?.[r]) note = 'skipped (allowlist)';
      else if (['webp', 'png', 'gif', 'jpg'].includes(type)) ({ out, note, resized } = await raster(f, r));
      else if (type === 'svg') out = await svg(f);
      else if (type === 'lottie') out = await dotLottie(f);
      else if (type === 'json') out = Buffer.from(JSON.stringify(roundFloats(JSON.parse(fs.readFileSync(f, 'utf8')))));
    } catch (e) {
      note = `ERROR ${e.message}`;
    }
    let after = before;
    if (out && out.length < before * (resized ? 1 : 1 - MIN_GAIN)) {
      after = out.length;
      s.changed++;
      if (!dry) fs.writeFileSync(f, out);
    }
    s.after += after;
    if (after !== before || note.startsWith('ERROR')) rows.push([r, before, after, note]);
  }
  rows.sort((a, b) => b[1] - b[2] - (a[1] - a[2]));
  for (const [r, b, a, note] of rows.slice(0, flag('--verbose') ? Infinity : 40)) console.log(`${kb(b).padStart(10)} → ${kb(a).padStart(10)}  ${r}${note ? `  (${note})` : ''}`);
  if (rows.length > 40 && !flag('--verbose')) console.log(`… ${rows.length - 40} more (--verbose)`);
  console.log(`\n${dry ? '[dry run] ' : ''}type     files  changed      before →      after   saved`);
  let tb = 0;
  let ta = 0;
  for (const [t, s] of Object.entries(stats).sort((a, b) => b[1].before - a[1].before)) {
    tb += s.before;
    ta += s.after;
    console.log(`${t.padEnd(8)} ${String(s.n).padStart(6)} ${String(s.changed).padStart(8)} ${kb(s.before).padStart(11)} → ${kb(s.after).padStart(10)}  ${(100 - (s.after / s.before) * 100).toFixed(1)}%`);
  }
  console.log(`${'total'.padEnd(8)} ${String(files.length).padStart(6)} ${''.padStart(8)} ${kb(tb).padStart(11)} → ${kb(ta).padStart(10)}  ${(100 - (ta / tb) * 100).toFixed(1)}%`);
}

// ───────────────────────────────────────────── raster ─────────────────────────────────────────────
let _sharp;
async function sharpLib() {
  _sharp ??= (await import('sharp')).default;
  return _sharp;
}

/**
 * Target size for a raster: long edge ≤ measured cap (3× rendered) or width ≤ the default phone-width cap.
 * When the box can follow the image's intrinsic ratio (exactAspect, or never measured) the new size keeps the ratio
 * exactly (a multiple of w/gcd × h/gcd), so layout doesn't move by a sub-pixel; if no such smaller size exists, no resize.
 */
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
function capFor(r, w, h) {
  const m = budget.maxEdge?.[r];
  const want = m ? (w >= h ? { width: Math.min(w, m) } : { height: Math.min(h, m) }) : { width: Math.min(w, budget.defaultMaxWidth ?? 1200) };
  if ((want.width ?? w) >= w && (want.height ?? h) >= h) return { width: w, height: h };
  if (m && !budget.exactAspect?.includes(r)) return want;
  const g = gcd(w, h);
  const k = want.width ? Math.ceil(want.width / (w / g)) : Math.ceil(want.height / (h / g));
  return k >= g ? { width: w, height: h } : { width: k * (w / g), height: k * (h / g) };
}

async function raster(f, r) {
  const sharp = await sharpLib();
  const src = fs.readFileSync(f);
  const meta = await sharp(src, { animated: true }).metadata();
  const animated = (meta.pages ?? 1) > 1;
  const w = meta.width;
  const h = meta.pageHeight ?? meta.height;
  const type = typeOf(f);
  const cap = capFor(r, w, h);
  const resize = (cap.width ?? w) < w || (cap.height ?? h) < h;
  const base = () => {
    let p = sharp(src, { animated });
    if (resize) p = p.resize({ ...cap, kernel: 'lanczos3', fit: cap.width && cap.height ? 'fill' : 'inside' });
    return p;
  };
  // Reference pixels (resized, lossless) for the PSNR gate.
  const ref = await base().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // GIF has 1-bit transparency: judge candidates against the thresholded alpha a GIF can actually hold
  if (type === 'gif') for (let i = 3; i < ref.data.length; i += 4) ref.data[i] = ref.data[i] >= 128 ? 255 : 0;
  const passes = async (buf) => {
    const got = await sharp(buf, { animated }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (got.info.width !== ref.info.width) return false;
    if (got.data.length === ref.data.length) return psnr(ref.data, got.data) >= PSNR_MIN;
    if (!animated) return false;
    // encoders (cgif) merge identical consecutive frames and sum their delays: compare on the timeline instead
    const gm = await sharp(buf, { animated }).metadata();
    const frame = (img, k) => img.data.subarray(k * (img.data.length / img.pages), (k + 1) * (img.data.length / img.pages));
    const A = { data: ref.data, pages: meta.pages };
    const B = { data: got.data, pages: gm.pages };
    if (A.data.length / A.pages !== B.data.length / B.pages || !meta.delay || !gm.delay) return false;
    const sumA = meta.delay.reduce((a, b) => a + b, 0);
    const sumB = gm.delay.reduce((a, b) => a + b, 0);
    if (Math.abs(sumA - sumB) > 20) return false;
    const pa = [];
    const pb = [];
    let t = 0;
    for (let i = 0; i < A.pages; i++) {
      let acc = 0;
      let j = 0;
      while (j < B.pages - 1 && acc + gm.delay[j] <= t) acc += gm.delay[j++];
      pa.push(frame(A, i));
      pb.push(frame(B, j));
      t += meta.delay[i];
    }
    return psnr(Buffer.concat(pa), Buffer.concat(pb)) >= PSNR_MIN;
  };
  const cands = [];
  // A lossy source re-encoded lossy loses a little each time: demand a real gain so repeated runs settle.
  const lossySrc = (type === 'webp' && !src.includes(Buffer.from('VP8L'))) || type === 'jpg';
  if (type === 'webp') {
    cands.push({ buf: await base().webp({ lossless: true, effort: 6 }).toBuffer(), exact: true });
    cands.push({ buf: await base().webp({ nearLossless: true, quality: 60, effort: 6 }).toBuffer() });
    cands.push({ buf: await base().webp({ quality: 82, alphaQuality: 100, effort: 6, smartSubsample: true }).toBuffer() });
    for (const quality of [90, 95]) cands.push({ buf: await base().webp({ quality, alphaQuality: 100, effort: 6, smartSubsample: true }).toBuffer() });
  } else if (type === 'png') {
    cands.push({ buf: await base().png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 }).toBuffer(), exact: true });
    // never re-quantise an already-palette PNG (each run would compound the loss)
    if (!meta.isPalette) cands.push({ buf: await base().png({ palette: true, quality: 95, dither: 1, compressionLevel: 9, effort: 10 }).toBuffer() });
  } else if (type === 'gif') {
    cands.push({ buf: await base().gif({ effort: 10, reuse: true, dither: 0 }).toBuffer() });
    cands.push({ buf: await base().gif({ effort: 10, reuse: false, dither: 0.5 }).toBuffer() });
  } else if (type === 'jpg') {
    cands.push({ buf: await base().jpeg({ quality: 82, mozjpeg: true }).toBuffer() });
  }
  cands.sort((a, b) => a.buf.length - b.buf.length);
  const limit = resize ? Infinity : src.length * (1 - MIN_GAIN);
  for (const c of cands) {
    if (c.buf.length >= limit) break;
    if (!c.exact && lossySrc && !resize && c.buf.length > src.length * 0.85) continue;
    if (c.exact || (await passes(c.buf))) {
      const note = [resize ? `resized ${w}×${h} → ${cap.width ?? '…'}×${cap.height ?? '…'}` : '', animated ? `${meta.pages} frames` : ''].filter(Boolean).join(', ');
      return { out: c.buf, note, resized: resize };
    }
  }
  return { out: null, note: '' };
}

function psnr(a, b) {
  let se = 0;
  // compare premultiplied-ish: colour error weighted by alpha so invisible pixels don't count
  for (let i = 0; i < a.length; i += 4) {
    const al = Math.max(a[i + 3], b[i + 3]) / 255;
    for (let c = 0; c < 3; c++) se += ((a[i + c] - b[i + c]) * al) ** 2;
    se += (a[i + 3] - b[i + 3]) ** 2;
  }
  const mse = se / a.length;
  return mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
}

// ───────────────────────────────────────────── svg ─────────────────────────────────────────────
let _svgo;
async function svg(f) {
  _svgo ??= await import('svgo');
  const src = fs.readFileSync(f, 'utf8');
  const res = _svgo.optimize(src, {
    path: f,
    multipass: true,
    floatPrecision: 3,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupIds: false, // ids are referenced by url(#…) and ?raw svgs share one DOM: never rename/merge
            removeUnknownsAndDefaults: { keepRoleAttr: true },
            convertPathData: { floatPrecision: 3 },
          },
        },
      },
    ],
  });
  return Buffer.from(res.data);
}

// ───────────────────────────────────────────── lottie ─────────────────────────────────────────────
function roundFloats(v) {
  if (typeof v === 'number') return Number.isInteger(v) ? v : Math.round(v * 1000) / 1000;
  if (Array.isArray(v)) return v.map(roundFloats);
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = typeof x === 'string' && x.startsWith('data:image/') ? x : roundFloats(x);
    return o;
  }
  return v;
}

function readZip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('not a zip');
  const n = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = [];
  for (let i = 0; i < n; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central dir');
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const off = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nlen).toString('utf8');
    const lp = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    const raw = buf.subarray(lp, lp + csize);
    const data = method === 0 ? Buffer.from(raw) : method === 8 ? zlib.inflateRawSync(raw) : null;
    if (!data) throw new Error(`zip method ${method}`);
    entries.push({ name, data });
    p += 46 + nlen + xlen + clen;
  }
  return entries;
}

function writeZip(entries) {
  const locals = [];
  const centrals = [];
  let off = 0;
  // fixed DOS timestamp (1980-01-01) so output is deterministic
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const deflated = zlib.deflateRawSync(data, { level: 9, memLevel: 9 });
    const store = deflated.length >= data.length;
    const body = store ? data : deflated;
    const crc = zlib.crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0x0800, 6);
    lh.writeUInt16LE(store ? 0 : 8, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0x21, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(body.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    lh.copy(ch, 8, 6, 30); // flags, method, time, date, crc, sizes, name len (+ extra len = 0)
    ch.writeUInt32LE(off, 42);
    locals.push(lh, nameBuf, body);
    centrals.push(ch, nameBuf);
    off += 30 + nameBuf.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}

async function dotLottie(f) {
  const sharp = await sharpLib();
  const entries = readZip(fs.readFileSync(f));
  for (const e of entries) {
    if (e.name.endsWith('.json')) e.data = Buffer.from(JSON.stringify(roundFloats(JSON.parse(e.data.toString('utf8')))));
    else if (e.name.endsWith('.png')) {
      const lossless = await sharp(e.data).png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 }).toBuffer();
      if (lossless.length < e.data.length) e.data = lossless;
    }
  }
  return writeZip(entries);
}

// ───────────────────────────────────────────── check ─────────────────────────────────────────────
async function check() {
  const sharp = await sharpLib();
  const files = allAssets();
  const problems = [];
  const warnings = [];
  const byHash = new Map();
  for (const f of files) {
    const r = rel(f);
    const size = fs.statSync(f).size;
    const h = crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
    byHash.set(h, [...(byHash.get(h) ?? []), r]);
    const allowed = budget.allow?.[r];
    if (size > budget.failKB * 1024 && !allowed) problems.push(`${r} is ${kb(size)} (> ${budget.failKB} KB; optimise it or allowlist it with a reason)`);
    else if (size > budget.warnKB * 1024 && !allowed) warnings.push(`${r} is ${kb(size)} (> ${budget.warnKB} KB)`);
    if (['webp', 'png', 'gif', 'jpg'].includes(typeOf(f)) && !budget.skip?.[r]) {
      const m = await sharp(f, { animated: true }).metadata();
      const w = m.width;
      const hh = m.pageHeight ?? m.height;
      const cap = capFor(r, w, hh);
      // a warning, not a failure: a downscaled re-encode can come out larger (tiny palette GIFs), and then we keep the original
      if ((cap.width ?? w) < w || (cap.height ?? hh) < hh) warnings.push(`${r} is ${w}×${hh}, above its size cap (${cap.width ?? "…"}×${cap.height ?? "…"}); run the optimiser — it keeps the original when a downscaled re-encode is not smaller`);
    }
  }
  const allowedDupes = (budget.duplicates ?? []).map((d) => new Set(d.files));
  for (const group of byHash.values()) {
    if (group.length < 2) continue;
    if (allowedDupes.some((s) => group.every((g) => s.has(g)))) continue;
    problems.push(`duplicate content: ${group.join(', ')} (keep one copy, e.g. in src/assets/shared/, and import it)`);
  }
  for (const w of warnings) console.log(`warn  ${w}`);
  for (const p of problems) console.log(`FAIL  ${p}`);
  console.log(`\n${files.length} assets checked: ${problems.length} problem(s), ${warnings.length} warning(s)`);
  return problems.length ? 1 : 0;
}

// ───────────────────────────────────────────── measure ─────────────────────────────────────────────
async function measure() {
  const sharp = await sharpLib();
  const { chromium } = await import('playwright');
  const base = `http://localhost:${process.env.PORT ?? 5180}/`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto(base);
  await page.waitForTimeout(800);
  const routes = await page.evaluate(() => window.__NK_ROUTES__);
  const seen = new Map(); // rel path → max scale (rendered CSS px / natural px)
  const ratioDeps = new Set(); // rendered with an auto width/height somewhere
  for (const route of routes) {
    await page.goto(`${base}#/${route}`);
    await page.reload();
    await page.waitForTimeout(1800);
    const usages = await page.evaluate(collectUsages).catch(() => []);
    for (const [url, scale, ratioDep] of usages) {
      let p;
      try {
        p = decodeURIComponent(new URL(url).pathname);
      } catch {
        continue;
      }
      if (!p.startsWith('/src/assets/') && !p.startsWith('/src/data/products/')) continue;
      const r = p.slice(1);
      seen.set(r, Math.max(seen.get(r) ?? 0, scale));
      if (ratioDep) ratioDeps.add(r);
    }
    process.stdout.write('.');
  }
  await browser.close();
  const maxEdge = { ...(budget.maxEdge ?? {}) };
  let n = 0;
  for (const [r, scale] of seen) {
    const f = path.join(root, r);
    if (!fs.existsSync(f) || !['webp', 'png', 'gif', 'jpg'].includes(typeOf(f))) continue;
    const m = await sharp(f, { animated: true }).metadata();
    const long = Math.max(m.width, m.pageHeight ?? m.height);
    const need = Math.max(budget.minEdge ?? 96, Math.ceil(long * scale * 3));
    if (need < long) {
      maxEdge[r] = need;
      n++;
    } else delete maxEdge[r];
  }
  budget.exactAspect = [...new Set([...(budget.exactAspect ?? []).filter((r) => !seen.has(r)), ...ratioDeps])].sort();
  budget.maxEdge = Object.fromEntries(Object.entries(maxEdge).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(budget, null, 2) + '\n');
  console.log(`\n${routes.length} routes, ${seen.size} rasters seen rendered, ${n} capped below their native size → scripts/asset-budget.json maxEdge`);
}

/** Runs in the page: [url, scale] for every rendered <img>, background-image and mask-image inside the phone. */
async function collectUsages() {
  const out = [];
  const nat = new Map();
  const natural = (url) => {
    if (!nat.has(url))
      nat.set(
        url,
        new Promise((ok) => {
          const i = new Image();
          i.onload = () => ok([i.naturalWidth, i.naturalHeight]);
          i.onerror = () => ok(null);
          i.src = url;
        }),
      );
    return nat.get(url);
  };
  const len = (tok, box) => (tok.endsWith('%') ? (parseFloat(tok) / 100) * box : tok.endsWith('px') ? parseFloat(tok) : null);
  const sizeScale = (size, W, H, nw, nh) => {
    const t = size.trim().split(/\s+/);
    if (t[0] === 'cover') return Math.max(W / nw, H / nh);
    if (t[0] === 'contain') return Math.min(W / nw, H / nh);
    const a = len(t[0], W);
    const b = len(t[1] ?? 'auto', H);
    if (a == null && b == null) return 1;
    if (a == null) return b / nh;
    if (b == null) return a / nw;
    return Math.max(a / nw, b / nh);
  };
  const stage = document.querySelector('.pg-stage') ?? document.body;
  for (const el of stage.querySelectorAll('*')) {
    const W = el.offsetWidth;
    const H = el.offsetHeight;
    if (!W || !H) continue;
    const cs = getComputedStyle(el);
    if (el.tagName === 'IMG' && el.currentSrc && el.naturalWidth) {
      const cw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ch = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const sx = cw / el.naturalWidth;
      const sy = ch / el.naturalHeight;
      const fit = cs.objectFit;
      const s = fit === 'contain' ? Math.min(sx, sy) : fit === 'none' ? 1 : fit === 'scale-down' ? Math.min(1, sx, sy) : Math.max(sx, sy);
      // Does the box follow the image's intrinsic aspect ratio (width or height auto)? Then a resize must keep the ratio exact.
      const box = [el.offsetWidth, el.offsetHeight];
      const prev = el.style.aspectRatio;
      el.style.aspectRatio = '1 / 9';
      const ratioDep = el.offsetWidth !== box[0] || el.offsetHeight !== box[1];
      el.style.aspectRatio = prev;
      out.push([el.currentSrc, s, ratioDep]);
    }
    for (const [img, size] of [
      [cs.backgroundImage, cs.backgroundSize],
      [cs.maskImage || cs.webkitMaskImage, cs.maskSize || cs.webkitMaskSize],
    ]) {
      if (!img || img === 'none') continue;
      const urls = [...img.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]);
      const sizes = (size || 'auto').split(',');
      for (let i = 0; i < urls.length; i++) {
        const n = await natural(urls[i]);
        if (n && n[0] && n[1]) out.push([new URL(urls[i], location.href).href, sizeScale(sizes[i % sizes.length], el.clientWidth || W, el.clientHeight || H, n[0], n[1]), false]);
      }
    }
  }
  return out;
}

if (flag('--measure')) await measure();
else if (flag('--check')) process.exit(await check());
else await optimise();
