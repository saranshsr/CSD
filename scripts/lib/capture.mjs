// One deterministic capture path for every screenshot tool in the kit (shot.mjs, visual-snap.mjs, visual-ref.mjs and
// .claude/skills/noon-ui/scripts/snap.mjs). Same device profile, same settle rules, same metadata, so two captures of
// the same route differ only when the screen differs.
//
// Profile (PROFILE below, override per call):
//   · the phone is the kit device: 390 × 844 CSS px (layout.deviceWidth/Height), captured without the stage backdrop
//     unless `target: 'stage'`; a reference can set its own screen width (e.g. Figma's 375) via `screenWidth`
//   · explicit deviceScaleFactor (default 2), colorScheme 'light', reducedMotion 'reduce', locale en-US, Asia/Dubai
//   · Date / timers / rAF on Playwright's fake clock, paused at a fixed instant (2026-10-13 09:41 Dubai) and advanced
//     only in fixed steps (clock.runFor) while settling, so countdowns, "delivered by" dates, entrance motion and
//     autoplaying carousels are in the same state on every run, however slow the machine is
//   · Math.random seeded (mulberry32), CSS transitions zeroed, carets hidden, smooth scrolling off
//   · Lottie (dotlottie canvases): one that keeps animating is shown on its first non-blank frame (or frame N); one
//     that paints a still (the kit's reduced-motion hold frame) keeps it; 'live' leaves them alone. Animated GIF /
//     WebP / APNG <img> are swapped for a still of frame 0
//   · settle: load → phone mounted → network idle → document.fonts.ready → visible <img> loaded + decoded → videos
//     paused at 0 → advance settleMs → network idle again → the phone renders the same pixels twice in a row after a
//     200ms step (capped at stableMs), all recorded in the metadata
//
// Usage:
//   const session = await openCapture({ dpr: 2 });            // browser + base URL (PORT, default 5180)
//   const shot = await session.capture('cart/cart', { path: '/tmp/cart.png', scroll: 'top', steps: [{ click: '…' }] });
//   shot.meta → { route, url, profile, steps, scroll, settle, errors, box, file }   (also written next to the PNG)
//   await session.close();
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';

export const DEVICE = { width: 390, height: 844 }; // src/foundations/tokens.ts layout.deviceWidth / deviceHeight
export const PROFILE = {
  dpr: 2,
  colorScheme: 'light',
  reducedMotion: 'reduce',
  locale: 'en-US',
  timezoneId: 'Asia/Dubai',
  clock: '2026-10-13T09:41:00+04:00', // false = real clock
  seed: 42, // Math.random seed; false = real Math.random
  lottie: 'first', // 'first' | <n> (nth non-blank frame) | 'live'
  freezeCss: true, // transitions 0s, caret hidden, scroll-behavior auto
  freezeImages: true, // animated GIF / WebP / PNG <img> swapped for their first frame
  settleMs: 1500, // page-time ms advanced after the page is idle (entrance motion, timer-driven loading states)
  stableMs: 4000, // cap for the "same pixels twice" check
  networkIdleMs: 8000,
  imagesMs: 5000,
};
export const PHONE = '.pg-stage [class*=device] > [class*=viewport], .pg-stage [class*=frameless] > [class*=viewport]';
export const STAGE = '.pg-stage';

export const port = () => process.env.PORT ?? 5180;
export const baseUrl = (p = port()) => `http://localhost:${p}/`;

/** Mulberry32 Math.random, the CSS freeze and the Lottie frame lock, installed before any page script runs. */
function initScript({ seed, lottie, freezeCss }) {
  if (seed !== false && seed != null) {
    let s = seed >>> 0;
    Math.random = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  if (freezeCss) {
    const css = '*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important;scroll-behavior:auto!important}';
    const add = () => {
      const el = document.createElement('style');
      el.dataset.nkCapture = 'freeze';
      el.textContent = css;
      (document.head ?? document.documentElement).appendChild(el);
    };
    if (document.documentElement) add();
    else document.addEventListener('DOMContentLoaded', add, { once: true });
  }
  // dotlottie-web paints every frame with putImageData on a 2D canvas. Remember the Nth non-blank paint per canvas; at
  // the shutter (window.__NK_LOTTIE_SHUTTER__) a canvas that kept animating (3+ paints) gets that frame back, while one
  // that painted a still (the kit's reduced-motion setFrame, autoplay off) keeps it. After the shutter nothing paints.
  window.__NK_LOTTIE__ = { mode: lottie, canvases: 0, restored: 0, kept: 0 };
  if (lottie !== 'live') {
    const want = lottie === 'first' ? 1 : Math.max(1, Number(lottie) || 1);
    const state = new Map();
    const proto = CanvasRenderingContext2D.prototype;
    const put = proto.putImageData;
    const blank = (img) => {
      const d = img.data;
      const step = Math.max(4, Math.floor(d.length / 4 / 2048) * 4);
      for (let i = 3; i < d.length; i += step) if (d[i] !== 0) return false;
      return true;
    };
    let shutter = false;
    proto.putImageData = function (img, ...rest) {
      if (shutter) return undefined;
      const c = this.canvas;
      let st = state.get(c);
      if (!st) {
        st = { n: 0, paints: 0, keep: null, ctx: this };
        state.set(c, st);
        window.__NK_LOTTIE__.canvases++;
      }
      const r = put.call(this, img, ...rest);
      st.paints++;
      if (!st.keep && !blank(img) && ++st.n >= want) {
        st.keep = { img: new ImageData(new Uint8ClampedArray(img.data), img.width, img.height), args: rest, w: c.width, h: c.height };
        c.dataset.nkLottie = 'painted';
      }
      return r;
    };
    window.__NK_LOTTIE_SHUTTER__ = () => {
      shutter = true;
      for (const [c, st] of state) {
        if (!st.keep) continue;
        if (st.paints >= 3 && c.width === st.keep.w && c.height === st.keep.h) {
          put.call(st.ctx, st.keep.img, ...st.keep.args);
          window.__NK_LOTTIE__.restored++;
        } else window.__NK_LOTTIE__.kept++;
      }
      return window.__NK_LOTTIE__;
    };
  }
}

/** Parse a scroll preset: 'top' | 'bottom' | <y> | 'el:<selector>' | { y } | { selector, block } */
export function parseScroll(v) {
  if (v == null || v === '' || v === 0 || v === '0' || v === 'top') return { preset: 'top', y: 0 };
  if (typeof v === 'object') return v.selector ? { preset: 'element', selector: v.selector, block: v.block ?? 'start', offset: v.offset ?? 0 } : { preset: 'y', y: Number(v.y) };
  if (v === 'bottom') return { preset: 'bottom' };
  if (String(v).startsWith('el:')) return { preset: 'element', selector: String(v).slice(3), block: 'start', offset: 0 };
  const y = Number(v);
  if (Number.isNaN(y)) throw new Error(`unknown scroll preset "${v}" (top | bottom | <y> | el:<selector>)`);
  return { preset: 'y', y };
}

async function applyScroll(page, scroll) {
  // the kit's scroll containers are `.nk-scroll` (Screen content, sheets); set them all, as shot.mjs always did
  return page.evaluate((s) => {
    const els = [...document.querySelectorAll('.nk-scroll')];
    if (s.preset === 'element') {
      const el = [...document.querySelectorAll(s.selector)].find((e) => e.getClientRects().length);
      if (!el) return { ok: false, error: `scroll target not found: ${s.selector}` };
      el.scrollIntoView({ block: s.block, inline: 'nearest', behavior: 'instant' });
      if (s.offset) els.forEach((e) => (e.scrollTop += s.offset));
    } else {
      els.forEach((e) => (e.scrollTop = s.preset === 'bottom' ? e.scrollHeight : s.y));
    }
    return { ok: true, scrollTops: els.map((e) => Math.round(e.scrollTop)) };
  }, scroll);
}

/** Swap every animated <img> (GIF, animated WebP / PNG) for a still of its first frame. Returns how many were swapped. */
async function freezeAnimatedImages() {
  if (typeof ImageDecoder === 'undefined') return 0;
  let n = 0;
  for (const img of [...document.images]) {
    if (img.dataset.nkFrozen || !img.currentSrc || img.currentSrc.startsWith('data:')) continue;
    img.dataset.nkFrozen = 'checked';
    try {
      const res = await fetch(img.currentSrc);
      const type = res.headers.get('content-type')?.split(';')[0] ?? '';
      if (!/^image\/(gif|webp|png|apng|avif)$/.test(type) || !(await ImageDecoder.isTypeSupported(type))) continue;
      const dec = new ImageDecoder({ data: await res.arrayBuffer(), type });
      await dec.tracks.ready;
      if ((dec.tracks.selectedTrack?.frameCount ?? 1) < 2) { dec.close(); continue; }
      const { image } = await dec.decode({ frameIndex: 0 });
      const c = document.createElement('canvas');
      c.width = image.displayWidth;
      c.height = image.displayHeight;
      c.getContext('2d').drawImage(image, 0, 0);
      image.close();
      dec.close();
      img.removeAttribute('srcset');
      img.src = c.toDataURL('image/png');
      await img.decode().catch(() => {});
      img.dataset.nkFrozen = 'first-frame';
      n++;
    } catch {
      /* leave it animated; the stable check reports it */
    }
  }
  return n;
}

/** Wait until the page is quiet. Returns what happened, for the metadata (nothing here throws). */
export async function settle(page, profile, { target = PHONE, extraMs = 0 } = {}) {
  const t0 = Date.now();
  const out = {};
  // page-side timers may be on the paused fake clock, so every wait is bounded from Node
  const bounded = (p, ms, fallback) => Promise.race([p.catch(() => fallback), new Promise((ok) => setTimeout(() => ok(fallback), ms))]);
  // with the stepped clock, page time only moves when we advance it: the same screen gets the same animation state
  const tick = (ms) => bounded(profile.clock ? page.clock.runFor(ms) : page.waitForTimeout(ms), ms + 10000, null);
  await page.waitForSelector(target, { state: 'visible', timeout: 15000 }).catch(() => (out.targetMissing = true));
  out.networkIdle = await page.waitForLoadState('networkidle', { timeout: profile.networkIdleMs }).then(() => true, () => false);
  const images = () =>
    bounded(
      page.evaluate(async () => {
        const vis = [...document.images].filter((i) => {
          const r = i.getBoundingClientRect();
          return r.width && r.height && r.bottom > 0 && r.top < innerHeight && i.loading !== 'lazy';
        });
        const one = (i) => (i.complete ? Promise.resolve() : new Promise((ok) => { i.addEventListener('load', ok, { once: true }); i.addEventListener('error', ok, { once: true }); })).then(() => i.decode?.().catch(() => {}));
        await Promise.all(vis.map(one));
        return { visible: vis.length, broken: vis.filter((i) => i.complete && !i.naturalWidth).length, done: true };
      }),
      profile.imagesMs,
      { done: false },
    );
  out.fonts = await bounded(page.evaluate(() => document.fonts.ready.then(() => document.fonts.status)), 5000, 'timeout');
  out.images = await images();
  if (profile.freezeImages) {
    const frozen = await bounded(page.evaluate(freezeAnimatedImages), 5000, -1);
    if (frozen) out.animatedImagesFrozen = frozen;
  }
  await page.evaluate(() => document.querySelectorAll('video').forEach((v) => { v.pause(); v.currentTime = 0; })).catch(() => {});
  await tick(profile.settleMs + extraMs);
  // timers that fired during the tick (screen preloads, lazy rails) may have fetched more
  await page.waitForLoadState('networkidle', { timeout: profile.networkIdleMs }).catch(() => {});
  // Lottie: the player (wasm) and the .lottie file load on real time; step page time until every visible canvas has
  // painted its frozen frame (or 6s of real time passed)
  if (profile.lottie !== 'live') {
    const pending = () => page.evaluate(() => [...document.querySelectorAll('canvas')].filter((c) => c.getClientRects().length && c.width && c.height && c.dataset.nkLottie !== 'painted').length).catch(() => 0);
    const until = Date.now() + 6000;
    let left = await pending();
    while (left && Date.now() < until) {
      await page.waitForTimeout(100);
      await tick(50);
      left = await pending();
    }
    if (left) out.lottiePending = left;
  }
  const again = await images();
  if (again.done === false || again.broken) out.images = { ...out.images, after: again };
  await bounded(page.evaluate(() => document.fonts.ready.then(() => true)), 3000, false);
  // stable: the target paints the same pixels twice in a row (infinite loaders and autoplaying carousels never will)
  const box = await page.locator(target).first().boundingBox().catch(() => null);
  // Lottie canvases are masked here: the shutter puts a looping one back on its kept frame anyway
  const mask = profile.lottie !== 'live' ? [page.locator('canvas')] : [];
  const probe = () => (box ? page.screenshot({ clip: box, animations: 'allow', scale: 'css', timeout: 5000, mask }).catch(() => null) : Promise.resolve(null));
  const until = Date.now() + profile.stableMs;
  let prev = await probe();
  out.stable = false;
  let probes = 0;
  while (prev && (profile.clock ? probes++ < profile.stableMs / 200 : Date.now() < until)) {
    await tick(200);
    const next = await probe();
    if (next && next.equals(prev)) { out.stable = true; break; }
    prev = next;
  }
  out.lottie = await page.evaluate(() => window.__NK_LOTTIE__).catch(() => null);
  out.ms = Date.now() - t0;
  return out;
}

async function runStep(page, step) {
  const [kind, value] = Object.entries(step).find(([k]) => k !== 'settle') ?? [];
  switch (kind) {
    case 'click': await page.locator(value).first().click({ timeout: 8000 }); break;
    case 'tap': await page.locator(value).first().tap({ timeout: 8000 }); break;
    case 'hover': await page.locator(value).first().hover({ timeout: 8000 }); break;
    case 'type': await page.keyboard.type(String(value), { delay: 40 }); break;
    case 'fill': await page.locator(value[0]).first().fill(String(value[1])); break;
    case 'press': await page.keyboard.press(String(value)); break;
    case 'wait': await page.waitForTimeout(Number(value)); break;
    case 'waitFor': await page.waitForSelector(value, { state: 'visible', timeout: 8000 }); break;
    case 'scroll': return applyScroll(page, parseScroll(value));
    default: throw new Error(`unknown step ${JSON.stringify(step)}`);
  }
  return { ok: true };
}

const navState = (page) => page.evaluate(() => window.__NK_NAV__ ?? null).catch(() => null);

/**
 * Open a capture session. Options override PROFILE (dpr, colorScheme, clock, seed, lottie, settleMs …).
 * `session.capture(route, opts)` → { buffer, meta, box }:
 *   opts.path        write the PNG (and <path minus .png>.json metadata unless opts.meta === false)
 *   opts.target      'phone' (default) | 'stage' (the legacy 1400-wide backdrop) | CSS selector(s) whose union box is captured
 *   opts.screenWidth / opts.screenHeight   render the phone at another width (a reference's viewport), squircle off
 *   opts.scroll      'top' | 'bottom' | <y> | 'el:<selector>' | { selector, block, offset }
 *   opts.steps       [{ click }, { type }, { wait }, { scroll }, { press }, { hover }, { fill: [sel, text] }, { waitFor }]
 *   opts.wait        extra settle ms (a reference's `wait`)
 *   opts.reload      reload once before settling (resets in-memory stores)
 *   opts.measure     [{ name, selector, scroll? }] boxes to measure (relative to the phone) after the main capture
 */
export async function openCapture(overrides = {}) {
  const profile = { ...PROFILE, ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => v !== undefined)) };
  const base = overrides.base ?? baseUrl();
  const browser = await chromium.launch();

  // Vite can full-reload a page once while it optimises a dependency; that run is retried once
  async function capture(route, opts = {}) {
    const first = await watchdog(route, opts);
    if (!first.errors.some((e) => /Execution context was destroyed|already been passed to createRoot|capture timed out|Target page, context or browser has been closed/.test(e))) return first;
    const second = await watchdog(route, opts);
    second.meta.retried = first.errors;
    return second;
  }

  // a capture that hangs (dev server reloading under an HMR storm, a stuck request) is abandoned after timeoutMs
  async function watchdog(route, opts) {
    const holder = {};
    let timer;
    const timeout = new Promise((ok) => {
      timer = setTimeout(async () => {
        await holder.context?.close().catch(() => {});
        ok({ buffer: null, meta: { route, errors: ['capture timed out'] }, box: null, errors: ['capture timed out'] });
      }, opts.timeoutMs ?? 90000);
    });
    const res = await Promise.race([captureOnce(route, opts, holder), timeout]);
    clearTimeout(timer);
    return res;
  }

  async function captureOnce(route, opts = {}, holder = {}) {
    const dpr = opts.dpr ?? profile.dpr;
    const screenWidth = opts.screenWidth ?? DEVICE.width;
    const screenHeight = opts.screenHeight ?? DEVICE.height;
    const stage = opts.target === 'stage';
    // the page is a bit wider than the phone (the stage centres it; 24px stage padding top and bottom)
    const viewport = stage ? { width: 1400, height: 1000 } : { width: Math.max(screenWidth, DEVICE.width) + 40, height: screenHeight + 56 };
    const context = (holder.context = await browser.newContext({ viewport, deviceScaleFactor: dpr, colorScheme: profile.colorScheme, reducedMotion: profile.reducedMotion, locale: profile.locale, timezoneId: profile.timezoneId }));
    await context.addInitScript(initScript, { seed: profile.seed, lottie: profile.lottie, freezeCss: profile.freezeCss });
    const clockAt = profile.clock ? new Date(profile.clock) : null;
    if (clockAt) {
      // install 1s early and pause on the instant: page time then advances only through settle()'s runFor
      await context.clock.install({ time: clockAt.getTime() - 1000 });
      await context.clock.pauseAt(clockAt);
    }
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    const url = `${base}#/${route}`;
    const meta = { tool: opts.tool, route, url, capturedAt: new Date().toISOString(), profile: { ...profile, dpr, viewport, screen: { width: screenWidth, height: screenHeight }, target: opts.target ?? 'phone' } };
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      if (opts.reload) await page.reload({ waitUntil: 'load' });
      if (opts.screenWidth || opts.screenHeight) {
        await page.addStyleTag({ content: `${PHONE} { width: ${screenWidth}px !important; height: ${screenHeight}px !important; clip-path: none !important; }` });
      }
      meta.settle = await settle(page, profile, { target: PHONE, extraMs: opts.wait ?? 0 });
      meta.steps = [];
      for (const step of opts.steps ?? []) {
        const t = Date.now();
        let res;
        try { res = await runStep(page, step); } catch (e) { res = { ok: false, error: e.message.split('\n')[0] }; }
        const s = await settle(page, { ...profile, settleMs: step.settle ?? 300, stableMs: 1500, networkIdleMs: 3000 });
        meta.steps.push({ ...step, ...res, ms: Date.now() - t, stable: s.stable, routeAfter: (await navState(page))?.route ?? null });
        if (res.ok === false) errors.push(`step ${JSON.stringify(step)} failed: ${res.error}`);
      }
      const scroll = parseScroll(opts.scroll);
      meta.scroll = { ...scroll, ...(scroll.preset === 'top' && !opts.scroll ? { applied: false } : await applyScroll(page, scroll)) };
      if (meta.scroll.ok === false) errors.push(meta.scroll.error);
      if (meta.scroll.applied !== false) meta.scroll.settle = await settle(page, { ...profile, settleMs: 300, stableMs: 2000, networkIdleMs: 3000 });
      if (await page.locator('vite-error-overlay').count()) errors.push('vite error overlay is showing');
      meta.nav = await navState(page);

      // the box to capture
      const selectors = stage ? [STAGE] : !opts.target || opts.target === 'phone' ? [PHONE] : [].concat(opts.target);
      const phoneBox = await page.locator(PHONE).first().boundingBox();
      const box = await page.evaluate((sels) => {
        const rects = sels.map((s) => [...document.querySelectorAll(s)].find((e) => e.getClientRects().length)?.getBoundingClientRect()).filter(Boolean);
        const matches = sels.map((s) => [...document.querySelectorAll(s)].filter((e) => e.getClientRects().length).length);
        if (rects.length !== sels.length) return { missing: sels.filter((_, i) => !matches[i]), matches };
        const x = Math.min(...rects.map((r) => r.left));
        const y = Math.min(...rects.map((r) => r.top));
        return { x, y, width: Math.max(...rects.map((r) => r.right)) - x, height: Math.max(...rects.map((r) => r.bottom)) - y, matches };
      }, selectors);
      meta.box = box && phoneBox && !box.missing ? { ...box, inPhone: { x: box.x - phoneBox.x, y: box.y - phoneBox.y }, phone: phoneBox } : box;

      if (clockAt) meta.clock = { mode: 'stepped', startedAt: clockAt.toISOString(), pageMs: (await page.evaluate(() => Date.now())) - clockAt.getTime() };
      if (profile.lottie !== 'live') meta.lottie = await page.evaluate(() => window.__NK_LOTTIE_SHUTTER__?.() ?? null).catch(() => null);
      let buffer = null;
      if (box && !box.missing && box.width && box.height) {
        buffer = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height }, animations: 'disabled', caret: 'hide', scale: 'device' });
      } else {
        errors.push(`capture target not found: ${(box?.missing ?? selectors).join(', ')}`);
      }

      // extra measurements (element checks), after the main capture; each may scroll first
      if (opts.measure?.length) {
        meta.measure = [];
        for (const m of opts.measure) {
          if (m.scroll != null) {
            const r = await applyScroll(page, parseScroll(m.scroll));
            await settle(page, { ...profile, settleMs: 300, stableMs: 1500, networkIdleMs: 2000 });
            if (r.ok === false) { meta.measure.push({ ...m, error: r.error }); continue; }
          }
          const ph = await page.locator(PHONE).first().boundingBox();
          const r = await page.evaluate((sel) => {
            const all = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length);
            const b = all[0]?.getBoundingClientRect();
            return b ? { x: b.left, y: b.top, width: b.width, height: b.height, matches: all.length } : null;
          }, m.selector);
          meta.measure.push(r && ph ? { ...m, box: { x: r.x - ph.x, y: r.y - ph.y, width: r.width, height: r.height, right: ph.x + ph.width - (r.x + r.width), bottom: ph.y + ph.height - (r.y + r.height) }, matches: r.matches } : { ...m, error: `not found: ${m.selector}` });
        }
      }
      meta.errors = errors;
      if (opts.path && buffer) {
        mkdirSync(dirname(opts.path), { recursive: true });
        writeFileSync(opts.path, buffer);
        meta.file = opts.path;
        if (opts.meta !== false) writeFileSync(opts.path.replace(/\.png$/i, '') + '.json', `${JSON.stringify(meta, null, 2)}\n`);
      }
      return { buffer, meta, box: meta.box, errors };
    } catch (e) {
      errors.push(e.message.split('\n')[0]);
      meta.errors = errors;
      return { buffer: null, meta, box: null, errors };
    } finally {
      await context.close();
    }
  }

  async function routes() {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(base, { waitUntil: 'load', timeout: 15000 });
      await page.waitForFunction(() => window.__NK_ROUTES__, null, { timeout: 15000 });
      return await page.evaluate(() => window.__NK_ROUTES__);
    } finally {
      await context.close();
    }
  }

  async function reachable() {
    try {
      const r = await fetch(base);
      return r.ok;
    } catch {
      return false;
    }
  }

  return { browser, base, profile, capture, routes, reachable, close: () => browser.close() };
}

/**
 * Command-line helpers shared by the CLIs: --dpr <n>, --live (real clock, live Lottie and GIFs, real Math.random),
 * --lottie first|<n>|live, --full-motion (prefers-reduced-motion: no-preference, to review the animated presentation).
 */
export function profileFlags(args) {
  const take = (name) => {
    const i = args.indexOf(name);
    if (i < 0) return undefined;
    return args.splice(i, 2)[1];
  };
  const flag = (name) => {
    const i = args.indexOf(name);
    if (i < 0) return false;
    args.splice(i, 1);
    return true;
  };
  const dpr = take('--dpr');
  const lottie = take('--lottie');
  const live = flag('--live');
  const fullMotion = flag('--full-motion');
  return {
    dpr: dpr ? Number(dpr) : undefined,
    ...(live ? { clock: false, seed: false, lottie: 'live', freezeImages: false } : {}),
    ...(fullMotion ? { reducedMotion: 'no-preference' } : {}),
    ...(lottie ? { lottie: /^\d+$/.test(lottie) ? Number(lottie) : lottie } : {}),
  };
}
