// Visual regression helper: screenshots every registered route's phone into a folder, or diffs two folders.
// This is the kit against its own previous self (did my refactor change anything?), not fidelity: for that, visual:ref.
// Usage (dev server on PORT, default 5180):
//   node scripts/visual-snap.mjs snap <dir> [flow | flow/screen ...] [--dpr n] [--stage] [--live]
//   node scripts/visual-snap.mjs diff <dirA> <dirB> [--out <diffDir>]
// snap uses the deterministic capture of scripts/lib/capture.mjs (fresh browser context per route, fixed clock, seeded
// random, Lottie on its first frame, 390×844 phone at dpr 2) and writes <dir>/capture.json with the profile and the
// per-route settle/errors. diff compares same-named PNGs (a pixel differs when a channel is off by > 40) and warns
// when the two folders were captured with different profiles; --out writes <name>.diff.png for the changed ones.
import fs from 'node:fs';
import { join } from 'node:path';
import { openCapture, profileFlags } from './lib/capture.mjs';
import { compare, rawRgb, writeRgb } from './lib/compare.mjs';

const args = process.argv.slice(2);
const overrides = profileFlags(args);
const take = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? undefined : args.splice(i, 2)[1];
};
const flag = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? false : (args.splice(i, 1), true);
};
const diffOut = take('--out');
const stage = flag('--stage');
const [mode, a, b, ...filters] = args;

if (mode === 'snap') {
  if (!a) { console.error('Usage: node scripts/visual-snap.mjs snap <dir> [flow ...]'); process.exit(1); }
  fs.mkdirSync(a, { recursive: true });
  const session = await openCapture(overrides);
  if (!(await session.reachable())) { console.error(`✗ dev server not reachable at ${session.base} (set PORT)`); await session.close(); process.exit(1); }
  const all = await session.routes();
  const only = [b, ...filters].filter(Boolean);
  const routes = only.length ? all.filter((r) => only.some((o) => (o.includes('/') ? r === o : r.startsWith(`${o}/`)))) : all;
  const index = { tool: 'visual-snap', profile: session.profile, target: stage ? 'stage' : 'phone', base: session.base, capturedAt: new Date().toISOString(), routes: {} };
  let unstable = 0;
  let withErrors = 0;
  for (const r of routes) {
    const { meta, errors } = await session.capture(r, { path: join(a, `${r.replace('/', '__')}.png`), target: stage ? 'stage' : 'phone', tool: 'visual-snap', meta: false });
    index.routes[r] = { stable: meta.settle?.stable ?? false, errors, settle: meta.settle, clock: meta.clock };
    if (!meta.settle?.stable) unstable++;
    if (errors.length) { withErrors++; console.log(`✗ ${r}: ${errors.slice(0, 2).join(' | ')}`); }
  }
  await session.close();
  fs.writeFileSync(join(a, 'capture.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`${routes.length} routes → ${a}${unstable ? ` · ${unstable} never settled (moving content; their diffs may be noise)` : ''}${withErrors ? ` · ${withErrors} with console errors` : ''}`);
  process.exit(withErrors ? 1 : 0);
} else if (mode === 'diff') {
  if (!a || !b) { console.error('Usage: node scripts/visual-snap.mjs diff <dirA> <dirB> [--out <diffDir>]'); process.exit(1); }
  const readIndex = (d) => { try { return JSON.parse(fs.readFileSync(join(d, 'capture.json'), 'utf8')); } catch { return null; } };
  const [ia, ib] = [readIndex(a), readIndex(b)];
  const key = (i) => (i ? JSON.stringify({ ...i.profile, base: undefined, target: i.target }) : 'legacy (no capture.json)');
  if (key(ia) !== key(ib)) console.log(`! the folders were captured with different profiles; expect changes everywhere\n  ${a}: ${key(ia)}\n  ${b}: ${key(ib)}`);
  if (diffOut) fs.mkdirSync(diffOut, { recursive: true });
  const files = fs.readdirSync(a).filter((f) => f.endsWith('.png'));
  let changed = 0;
  for (const f of files) {
    if (!fs.existsSync(join(b, f))) { console.log(`MISSING ${f}`); changed++; continue; }
    const [p, r] = await Promise.all([rawRgb(join(a, f)), rawRgb(join(b, f))]);
    if (p.width !== r.width || p.height !== r.height) { changed++; console.log(`  SIZE  ${f}  ${p.width}×${p.height} → ${r.width}×${r.height}`); continue; }
    const res = compare(p.data, r.data, { width: p.width, height: p.height, channelTolerance: 40 / 3 });
    if (res.different) {
      changed++;
      const route = f.replace('.png', '').replace('__', '/');
      const moving = ia?.routes?.[route]?.stable === false || ib?.routes?.[route]?.stable === false;
      console.log(`${String(res.different).padStart(6)}px  ${f}  ${(res.share * 100).toFixed(2)}%${moving ? '  (never settled: may be noise)' : ''}`);
      if (diffOut) await writeRgb(res.diff, p.width, p.height, join(diffOut, f.replace('.png', '.diff.png')));
    }
  }
  console.log(`${files.length - changed}/${files.length} identical`);
} else {
  console.error('Usage: node scripts/visual-snap.mjs snap <dir> [flow ...] | diff <dirA> <dirB> [--out <diffDir>]');
  process.exit(1);
}
