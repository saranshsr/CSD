// Shared helpers for the journey suite (scripts/journeys.mjs). Journeys drive the dev preview like a finger would and
// read the Navigator's state from `window.__NK_NAV__` ({ route, stack, params }).
//
// Error kinds decide the report category:
//   StartupError   → "build / startup" (the app never booted, a route never resolved)
//   AssertionError → "behaviour" (thrown by expect())
//   anything else  → "behaviour" too (a locator timeout means the UI the journey needs is not there)
// Console / page errors are collected by the runner and land in "console".

export class StartupError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'StartupError';
  }
}
export class AssertionError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'AssertionError';
  }
}

/** set by the runner */
export const env = { base: 'http://localhost:5180/' };

export function expect(cond, msg) {
  if (!cond) throw new AssertionError(msg);
}

export const nav = (page) => page.evaluate(() => window.__NK_NAV__ ?? { route: undefined, stack: [], params: {} });

export async function waitRoute(page, pred, label, timeout = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const n = await nav(page);
    if (n.route && (typeof pred === 'string' ? n.route === pred : pred(n.route, n))) return n;
    await page.waitForTimeout(50);
  }
  const n = await nav(page);
  throw new AssertionError(`expected route ${label ?? pred}, still on ${n.route} (stack ${n.stack.join(' → ')})`);
}

/** Polls `fn` until it returns a truthy value; throws an AssertionError with `msg` (or msg(lastValue)) on timeout. */
export async function waitFor(fn, msg, timeout = 4000) {
  const t0 = Date.now();
  let last;
  while (Date.now() - t0 < timeout) {
    last = await fn();
    if (last) return last;
    await new Promise((r) => setTimeout(r, 60));
  }
  throw new AssertionError(typeof msg === 'function' ? await msg(last) : msg);
}

/**
 * Opens a page by its `#/<flow>/<screen>?params` URL in a fresh app (the DemoStore is in memory, so every open resets
 * cart / wishlist). Throws a StartupError when the app does not boot or the route does not resolve.
 */
export async function open(page, route, { settle = 1400, expectRoute } = {}) {
  try {
    await page.goto(`${env.base}#/${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (e) {
    throw new StartupError(`could not load ${route}: ${e.message.split('\n')[0]}`);
  }
  const want = expectRoute ?? route.split('?')[0];
  const t0 = Date.now();
  let n;
  while (Date.now() - t0 < 12000) {
    n = await nav(page).catch(() => undefined);
    if (n?.route === want) break;
    await page.waitForTimeout(80);
  }
  if (!n?.route) throw new StartupError(`the app did not boot on ${route} (no window.__NK_NAV__ after 12s)`);
  if (n.route !== want) throw new StartupError(`${route} resolved to ${n.route}, expected ${want}`);
  await page.waitForTimeout(settle);
  return n;
}

/** CSS selector for the top-most stack layer (screen, modal or sheet): the layer whose z-index is stack.length − 1. */
async function topSelector(page) {
  const n = await nav(page);
  return `:is([data-route], [class*=sheetLayer])[style*="z-index: ${Math.max(0, n.stack.length - 1)};"]`;
}
/** Locator for the top-most layer, so lookups don't hit screens mounted underneath. */
export async function top(page) {
  return page.locator(await topSelector(page)).last();
}
/** The scroll container of the top layer. */
export async function scroller(page) {
  return (await top(page)).locator('.nk-scroll').first();
}
export async function isSheetOnTop(page) {
  return (await top(page)).evaluate((el) => /sheetLayer/.test(el.className)).catch(() => false);
}

/** the cart count on the tab bar of the bottom screen (0 when there is no badge) */
export const cartBadge = (page) =>
  page.evaluate(() => Number([...document.querySelectorAll('nav [aria-label=Cart]')].at(-1)?.querySelector('span span')?.textContent ?? 0));

/** the phone viewport (PhoneFrame `.viewport`: status bar + every stack layer), for screenshots and on-screen checks */
export const phone = (page) => page.locator('.pg-stage [class*=_viewport_]').first();

/**
 * Tap an element's centre like a finger: Playwright's actionability waits never settle on chrome that keeps animating
 * (the PDP header's expandable search springs), and scroll-into-view moves overlay headers. Scrolls it into view of
 * its own scroller first when it is off screen.
 */
export async function tap(page, locator, { scroll = true } = {}) {
  await locator.waitFor({ state: 'attached', timeout: 4000 }).catch(() => undefined);
  let box = await locator.boundingBox({ timeout: 4000 }).catch(() => null);
  if (!box) throw new AssertionError(`tap: ${locator} is not on screen`);
  const vp = page.viewportSize();
  const frame = await page.evaluate(() => {
    const r = (document.querySelector('.pg-stage [class*=_viewport_]') ?? document.querySelector('[data-route]')?.parentElement)?.getBoundingClientRect();
    return r ? { top: r.top, bottom: r.bottom } : undefined;
  });
  const bottom = Math.min(vp.height, frame?.bottom ?? vp.height);
  if (scroll && (box.y < (frame?.top ?? 0) || box.y + box.height > bottom - 90)) {
    await locator.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
    await page.waitForTimeout(450);
    box = await locator.boundingBox({ timeout: 4000 }).catch(() => null);
    if (!box) throw new AssertionError(`tap: ${locator} is not on screen after scrolling`);
  }
  // wait (≤ 2.5 s) for it to stop moving: entrance / success animations slide controls in
  for (let t0 = Date.now(); Date.now() - t0 < 2500; ) {
    await page.waitForTimeout(120);
    const b = await locator.boundingBox({ timeout: 1000 }).catch(() => null);
    if (!b) break;
    const still = Math.abs(b.x - box.x) < 0.5 && Math.abs(b.y - box.y) < 0.5;
    box = b;
    if (still) break;
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

/** Drag from the centre of `locator` by dx (a slide-to-pay thumb). */
export async function drag(page, locator, dx, { steps = 24 } = {}) {
  const box = await locator.boundingBox({ timeout: 4000 }).catch(() => null);
  if (!box) throw new AssertionError(`drag: ${locator} is not on screen`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x + (dx * i) / steps, y);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
}

/** Parse a price-ish string ("Total 3,346.00") into a number. */
export const money = (s) => Number(String(s).replace(/[^\d.]/g, '')) || 0;

/** Closes whatever sheets / modals are on top until `route` is the top of the stack, using the app's own controls. */
export async function backTo(page, route, max = 5) {
  for (let i = 0; i < max && (await nav(page)).route !== route; i++) {
    if (await isSheetOnTop(page)) await scrimTap(page);
    else await tap(page, (await top(page)).getByRole('button', { name: /^(Back|Close)$/i }).first(), { scroll: false });
    await page.waitForTimeout(700);
  }
  return waitRoute(page, route, `${route} (back)`);
}

/** Tap the scrim of the top sheet, above the sheet body. */
export async function scrimTap(page) {
  const layer = await top(page);
  const scrim = layer.locator('[class*=scrim i]').first();
  const box = await scrim.boundingBox({ timeout: 4000 }).catch(() => null);
  if (!box) throw new AssertionError('no scrim on the top sheet');
  await page.mouse.click(box.x + box.width / 2, box.y + 24);
}

// ── accessibility scan ───────────────────────────────────────────────────────────────────────────────────────────
/**
 * Lightweight a11y checks on the visible top layer (+ whole-document duplicate ids). Returns findings
 * [{ rule, severity, detail, count }]. Heuristic, not axe: names are computed from aria-label / labelledby / text /
 * title / img alt / svg title / input labels.
 */
export async function a11yScan(page) {
  const sel = await topSelector(page);
  return page.evaluate((sel) => {
    const out = [];
    const topEl = [...document.querySelectorAll(sel)].at(-1);
    if (!topEl) return out;
    const frame = topEl.parentElement.getBoundingClientRect();
    const hiddenByAria = (el) => !!el.closest('[aria-hidden=true], [inert]');
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      if (r.bottom < frame.top || r.top > frame.bottom || r.right < frame.left || r.left > frame.right) return false;
      const cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.01;
    };
    const describe = (el) => {
      const cls = (el.className?.baseVal ?? el.className ?? '').toString().split(/\s+/).find((c) => c && c !== 'nk-pressable') ?? '';
      const clean = cls.replace(/^_/, '').replace(/_[a-z0-9]{5}_\d+$/i, '');
      const ctx = (el.closest('section, [class*=card], [class*=row], li')?.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return `<${el.tagName.toLowerCase()}${el.getAttribute('role') ? ` role=${el.getAttribute('role')}` : ''}${clean ? ` .${clean}` : ''}>${ctx ? ` near "${ctx}"` : ''}`;
    };
    const nameOf = (el) => {
      const lab = el.getAttribute('aria-label')?.trim();
      if (lab) return lab;
      const by = el.getAttribute('aria-labelledby');
      if (by) {
        const t = by.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ').trim();
        if (t) return t;
      }
      if (el.matches('input, textarea, select')) {
        if (el.labels?.length) return [...el.labels].map((l) => l.textContent).join(' ').trim();
        return (el.getAttribute('placeholder') ?? el.getAttribute('title') ?? '').trim();
      }
      const txt = (el.innerText ?? '').trim();
      if (txt) return txt;
      const title = el.getAttribute('title')?.trim();
      if (title) return title;
      const img = [...el.querySelectorAll('img[alt]')].map((i) => i.alt.trim()).find(Boolean);
      if (img) return img;
      const roleImg = el.querySelector('[role=img][aria-label]')?.getAttribute('aria-label')?.trim();
      if (roleImg) return roleImg;
      const svg = el.querySelector('svg title')?.textContent?.trim();
      return svg ?? '';
    };
    // 1. interactive elements without an accessible name
    const interactive = topEl.querySelectorAll('button, a[href], input:not([type=hidden]), textarea, select, [role=button], [role=link], [role=tab], [role=switch], [role=checkbox], [role=radio], [role=slider], [role=menuitem]');
    const unnamed = new Map();
    for (const el of interactive) {
      if (hiddenByAria(el) || !visible(el) || nameOf(el)) continue;
      const d = describe(el);
      unnamed.set(d, (unnamed.get(d) ?? 0) + 1);
    }
    for (const [detail, count] of unnamed) out.push({ rule: 'interactive-no-name', severity: 'warning', detail, count });
    // 1b. keyboard-focusable elements with no role (a clickable <div>/<article tabindex=0>): screen readers announce
    //     no control, so the action is invisible to them
    const noRole = new Map();
    for (const el of topEl.querySelectorAll('[tabindex]:not([tabindex="-1"])')) {
      if (el.matches('button, a[href], input, textarea, select, summary, [role], [contenteditable]') || hiddenByAria(el) || !visible(el)) continue;
      const d = `<${el.tagName.toLowerCase()} tabindex=${el.getAttribute('tabindex')}${(() => { const c = (el.className?.baseVal ?? el.className ?? '').toString().split(/\s+/).find(Boolean); return c ? ` .${c.replace(/^_/, '').replace(/_[a-z0-9]{5}_\d+$/i, '')}` : ''; })()}>`;
      noRole.set(d, (noRole.get(d) ?? 0) + 1);
    }
    for (const [detail, count] of noRole) out.push({ rule: 'focusable-no-role', severity: 'warning', detail, count });
    // 2. images without alt (alt="" = decorative is fine; aria-hidden / role=presentation excluded)
    const noAlt = new Map();
    for (const img of topEl.querySelectorAll('img:not([alt])')) {
      if (hiddenByAria(img) || img.getAttribute('role') === 'presentation' || img.getAttribute('role') === 'none' || !visible(img)) continue;
      if (img.closest('button, a, [role=button]')?.getAttribute('aria-label')) continue; // named by its control
      const d = `img src=${(img.getAttribute('src') ?? '').split('/').pop().split('?')[0].slice(0, 40)}`;
      noAlt.set(d, (noAlt.get(d) ?? 0) + 1);
    }
    for (const [detail, count] of noAlt) out.push({ rule: 'img-no-alt', severity: 'warning', detail, count });
    // 3. duplicate ids anywhere in the document
    const ids = new Map();
    for (const el of document.querySelectorAll('[id]')) if (el.id) ids.set(el.id, (ids.get(el.id) ?? 0) + 1);
    for (const [id, count] of ids) if (count > 1) out.push({ rule: 'duplicate-id', severity: 'warning', detail: `#${id}`, count });
    // 4. focusable elements in layers covered by a sheet (keyboard / screen-reader users can reach them)
    if (/sheetLayer/.test(topEl.className)) {
      const layers = [...topEl.parentElement.children].filter((c) => c !== topEl && c.matches('[data-route], [class*=sheetLayer]'));
      let n = 0;
      const routes = new Set();
      for (const layer of layers) {
        if (layer.closest('[inert], [aria-hidden=true]')) continue;
        for (const el of layer.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]):not([type=hidden]), textarea, select, [tabindex]:not([tabindex="-1"])')) {
          if (el.closest('[inert], [aria-hidden=true]') || el.tabIndex < 0) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue;
          n++;
          routes.add(layer.getAttribute('data-route') ?? 'sheet');
        }
      }
      if (n) out.push({ rule: 'focusable-behind-sheet', severity: 'warning', detail: `focusable elements in the covered ${[...routes].join(', ')} (not inert / aria-hidden)`, count: n });
    }
    return out;
  }, sel);
}
