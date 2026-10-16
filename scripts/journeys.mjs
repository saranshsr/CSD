// Journey tests: walks the critical user journeys in a real browser, asserts behaviour (routes, stack, state, visible
// UI), saves a screenshot at every checkpoint, scans each checkpoint for accessibility problems and fails on any
// console / page error.
//
//   npm run test:journeys                       # starts its own Vite dev server (port 5199)
//   PORT=5182 npm run test:journeys             # or reuse a running one
//   npm run test:journeys -- plp-filter cart    # only journeys whose name or area contains one of the words
//   npm run test:journeys -- --list             # list journeys and exit
//   npm run test:journeys -- --retry            # rerun a failed journey once; a pass on retry is reported "flaky"
//   npm run test:journeys -- --no-a11y          # skip the accessibility scans
//
// Journeys live in scripts/journeys/*.mjs (one module per area). Output (git-ignored):
//   test-results/journeys/<journey>/<nn>-<checkpoint>.png   screenshots
//   test-results/journeys/report.md / report.json           categorised report (startup · behaviour · console · visual · a11y)
// Exit code 1 when a journey fails (known failures excepted) or the app does not start.
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { a11yScan, AssertionError, env, nav, phone, StartupError, top } from './journeys/lib.mjs';
import { printSummary, writeReport } from './journeys/report.mjs';
import shopping from './journeys/shopping.mjs';
import navigation from './journeys/navigation.mjs';
import state from './journeys/state.mjs';
import sheets from './journeys/sheets.mjs';
import checkout from './journeys/checkout.mjs';
import membership from './journeys/noonone.mjs';
import states from './journeys/states.mjs';
import orders from './journeys/orders.mjs';

const journeys = [...shopping, ...navigation, ...state, ...sheets, ...checkout, ...membership, ...states, ...orders];

const root = new URL('..', import.meta.url).pathname;
const outRoot = join(root, 'test-results/journeys');
const argv = process.argv.slice(2);
const only = argv.filter((a) => !a.startsWith('-'));
const flag = (f) => argv.includes(f);
const selected = journeys.filter((x) => !only.length || only.some((o) => x.name.includes(o) || x.area === o));

if (flag('--list')) {
  for (const j of journeys) console.log(`${j.name.padEnd(28)} ${j.area.padEnd(10)} ${j.title}${j.known ? `  [known failure: ${j.known}]` : ''}`);
  process.exit(0);
}
if (!selected.length) {
  console.error(`no journey matches ${only.join(', ')} (npm run test:journeys -- --list)`);
  process.exit(1);
}

// ── dev server ───────────────────────────────────────────────────────────────────────────────────────────────
const startedAt = new Date().toISOString();
const startup = [];
let server;
mkdirSync(outRoot, { recursive: true });
try {
  if (process.env.PORT) env.base = `http://localhost:${process.env.PORT}/`;
  else {
    const { createServer } = await import('vite');
    server = await createServer({ root, logLevel: 'error', server: { port: 5199, strictPort: false } });
    await server.listen();
    env.base = server.resolvedUrls.local[0];
  }
} catch (e) {
  startup.push({ message: `Vite dev server did not start: ${e.message.split('\n')[0]}` });
}

const browser = await chromium.launch();

// preflight: the app boots and registers its routes
if (!startup.length) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  try {
    await page.goto(env.base, { timeout: 20000 });
    await page.waitForFunction(() => Array.isArray(window.__NK_ROUTES__) && window.__NK_NAV__, null, { timeout: 15000 });
  } catch (e) {
    startup.push({ message: `the app did not boot at ${env.base}: ${errs[0] ?? e.message.split('\n')[0]}` });
  }
  await page.close();
}

// ── run ──────────────────────────────────────────────────────────────────────────────────────────────────────
const results = [];
async function runOnce(j) {
  const dir = join(outRoot, j.name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  ctx.setDefaultTimeout(8000);
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  const checkpoints = [];
  const visual = [];
  const a11y = [];
  const shot = async (label) => {
    const n = String(checkpoints.length + 1).padStart(2, '0');
    const file = `${n}-${label}.png`;
    const route = (await nav(page).catch(() => ({}))).route ?? '?';
    checkpoints.push({ n: checkpoints.length + 1, label, file: `${j.name}/${file}`, route });
    try {
      const box = await phone(page).boundingBox().catch(() => undefined);
      if (!box) visual.push({ checkpoint: file, issue: 'phone frame not found: captured the full page' });
      const empty = await (await top(page)).evaluate((el) => !el.innerText.trim() && !el.querySelector('img, svg, canvas, video')).catch(() => true);
      if (empty) visual.push({ checkpoint: file, issue: `top layer (${route}) has no content: blank frame` });
      const buf = await page.screenshot({ path: join(dir, file), clip: box });
      if (buf.length < 2500) visual.push({ checkpoint: file, issue: `screenshot is ${buf.length} bytes: probably blank` });
    } catch (e) {
      visual.push({ checkpoint: file, issue: `screenshot failed: ${e.message.split('\n')[0]}` });
    }
    if (!flag('--no-a11y')) {
      const found = await a11yScan(page).catch((e) => [{ rule: 'scan-error', severity: 'warning', detail: e.message.split('\n')[0], count: 1 }]);
      for (const f of found) a11y.push({ ...f, route, checkpoint: file });
    }
  };
  const t0 = Date.now();
  let error;
  let category;
  try {
    await j.run(page, shot);
    if (consoleErrors.length) {
      category = 'console';
      error = `console errors: ${consoleErrors.slice(0, 3).join(' | ')}`;
    }
  } catch (e) {
    category = e instanceof StartupError ? 'startup' : 'behaviour';
    error = String(e.message).split('\n')[0];
    if (!(e instanceof AssertionError) && !(e instanceof StartupError)) error = `${e.name ?? 'Error'}: ${error}`;
    await shot('failure').catch(() => undefined);
  }
  await ctx.close();
  return { error, category, consoleErrors, checkpoints, visual, a11y, seconds: (Date.now() - t0) / 1000 };
}

if (!startup.length) {
  for (const j of selected) {
    let r = await runOnce(j);
    let status = r.error ? (j.known ? 'known-fail' : 'fail') : j.known ? 'unexpected-pass' : 'pass';
    if (status === 'fail' && flag('--retry')) {
      const again = await runOnce(j);
      if (!again.error) {
        status = 'flaky';
        again.visual.push({ checkpoint: '-', issue: `first attempt failed (${r.category}): ${r.error}` });
        r = again;
      }
    }
    const res = { name: j.name, title: j.title, area: j.area, status, known: j.known, ...r };
    if (status === 'pass' || status === 'flaky') res.category = undefined;
    results.push(res);
    const icon = { pass: '✓', flaky: '~', fail: '✗', 'known-fail': '◌', 'unexpected-pass': '!' }[status];
    const tail = status === 'flaky' ? ' (flaky: passed on retry)' : status === 'unexpected-pass' ? ` (marked known failure but passes: remove \`known\`)` : '';
    console.log(`${icon} ${j.name.padEnd(28)} ${j.title} (${r.seconds.toFixed(1)}s, ${r.checkpoints.length} checkpoints)${tail}`);
    if (r.error && status !== 'flaky') console.log(`    [${r.category}] ${r.error}${j.known ? `\n    known failure: ${j.known}` : ''}`);
  }
}
await browser.close();
await server?.close();

const report = writeReport(outRoot, { base: env.base, startedAt, results, startup });
printSummary(report);
const s = report.summary;
console.log(`\n${s.ok ? 'all journeys pass' : `${s.fail + s.startupFailures} failure(s)`}${s.knownFail ? ` · ${s.knownFail} known failure(s)` : ''}${s.flaky ? ` · ${s.flaky} flaky` : ''} · report: test-results/journeys/report.md · screenshots in test-results/journeys/`);
process.exit(s.ok ? 0 : 1);
