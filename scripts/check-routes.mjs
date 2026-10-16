// Smoke test: opens every registered route and reports console errors / placeholders.
// Usage: node scripts/check-routes.mjs [word …]   (dev server running on :5180, or PORT=…; words limit it to routes containing one)
// Fails (exit 1) on page errors, console errors or "Coming soon" placeholders, as before. Also reports, as warnings
// that do not fail the run: a route that resolves to a different route, and a route that renders a blank screen.
// Ends with a per-category summary and writes test-results/check-routes.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
const base = `http://localhost:${process.env.PORT ?? 5180}/`;
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1400, height: 1000 } });
let pageErrs = [];
let consoleErrs = [];
page.on('pageerror', (e) => pageErrs.push(e.message));
page.on('console', (m) => m.type() === 'error' && consoleErrs.push(m.text()));
let routes;
try {
  await page.goto(base, { timeout: 15000 });
  await page.waitForTimeout(800);
  routes = await page.evaluate(() => window.__NK_ROUTES__);
} catch (e) {
  console.log(`✗ startup: dev server not reachable at ${base} (${e.message.split('\n')[0]}) — run \`npm run dev\` or set PORT`);
  await b.close();
  process.exit(1);
}
if (!Array.isArray(routes)) {
  console.log(`✗ startup: the app at ${base} did not register window.__NK_ROUTES__${pageErrs.length ? ` (${pageErrs[0]})` : ''}`);
  await b.close();
  process.exit(1);
}
const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (only.length) routes = routes.filter((r) => only.some((o) => r.includes(o)));
const cats = { pageError: [], consoleError: [], placeholder: [], mismatch: [], blank: [] };
let failed = 0;
for (const r of routes) {
  pageErrs = [];
  consoleErrs = [];
  await page.goto(`${base}#/${r}`);
  await page.reload();
  await page.waitForTimeout(1300);
  const txt = await page.locator('.pg-stage').innerText().catch(() => '');
  const landed = await page.evaluate(() => window.__NK_NAV__?.route).catch(() => undefined);
  const blank = await page.evaluate(() => { const top = [...document.querySelectorAll('[data-route]')].at(-1); return !top || (!top.innerText.trim() && !top.querySelector('img, svg, canvas, video')); }).catch(() => true);
  const errs = [...pageErrs, ...consoleErrs];
  // a Vite full reload mid-check (someone saved a file) re-runs main.tsx on the same root: say so, it is not the route
  const hmr = errs.some((m) => /createRoot\(\) on a container that has already been passed/.test(m));
  const placeholder = txt.includes('Coming soon');
  if (pageErrs.length) cats.pageError.push({ route: r, messages: pageErrs });
  if (consoleErrs.length) cats.consoleError.push({ route: r, messages: consoleErrs });
  if (placeholder) cats.placeholder.push({ route: r });
  if (landed !== r) cats.mismatch.push({ route: r, landed });
  if (blank) cats.blank.push({ route: r });
  const bad = errs.length || placeholder;
  if (bad) failed++;
  const warn = [landed !== r ? ` → ${landed}` : '', blank ? ' BLANK' : '', hmr ? ' (looks like a dev-server reload: rerun this route)' : ''].join('');
  console.log(`${bad ? '✗' : warn ? '!' : '✓'} ${r.padEnd(26)} ${errs.join(' | ').slice(0, 200)}${placeholder ? ' PLACEHOLDER' : ''}${warn}`);
}
console.log(`\n${routes.length - failed}/${routes.length} routes clean`);
console.log('\nBy category');
console.log(`  page errors (fail)          ${cats.pageError.length}${cats.pageError.length ? `  ${cats.pageError.map((x) => x.route).join(', ')}` : ''}`);
console.log(`  console errors (fail)       ${cats.consoleError.length}${cats.consoleError.length ? `  ${cats.consoleError.map((x) => x.route).join(', ')}` : ''}`);
console.log(`  placeholders (fail)         ${cats.placeholder.length}${cats.placeholder.length ? `  ${cats.placeholder.map((x) => x.route).join(', ')}` : ''}`);
console.log(`  resolves elsewhere (warn)   ${cats.mismatch.length}${cats.mismatch.length ? `  ${cats.mismatch.map((x) => `${x.route}→${x.landed}`).join(', ')}` : ''}`);
console.log(`  blank render (warn)         ${cats.blank.length}${cats.blank.length ? `  ${cats.blank.map((x) => x.route).join(', ')}` : ''}`);
const out = join(new URL('..', import.meta.url).pathname, 'test-results');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'check-routes.json'), `${JSON.stringify({ base, at: new Date().toISOString(), routes: routes.length, failed, categories: cats }, null, 2)}\n`);
await b.close();
process.exit(failed ? 1 : 0);
