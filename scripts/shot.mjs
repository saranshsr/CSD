// Usage: node scripts/shot.mjs <route> [out.png] [--click "selector"] [--type "text"] [--wait ms] [--scroll y|top|bottom|el:<sel>]
//          [--press Key] [--hover "selector"] [--dpr n] [--stage] [--live] [--lottie first|<n>|live] [--no-meta]
// Screenshots the phone (390×844 CSS px, dpr 2) at the given route, e.g. `node scripts/shot.mjs pdp/detail`.
// --click / --type / --wait / --press / --hover run in order as interaction steps; --scroll is applied last.
// Capture profile and settle rules: scripts/lib/capture.mjs (fixed clock, seeded random, CSS transitions off, Lottie
// frozen on its first frame). Writes <out>.json next to the PNG with the profile, steps, scroll and console errors.
// --stage captures the old 1400-wide stage with the dark backdrop. Dev server on PORT (default 5180).
import { openCapture, profileFlags } from './lib/capture.mjs';

const args = process.argv.slice(2);
const overrides = profileFlags(args);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return false;
  args.splice(i, 1);
  return true;
};
const stage = flag('--stage');
const noMeta = flag('--no-meta');
const positional = [];
const steps = [];
let scroll;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith('--')) { positional.push(a); continue; }
  const v = args[++i];
  if (a === '--scroll') scroll = v;
  else if (['--click', '--type', '--wait', '--press', '--hover'].includes(a)) steps.push({ [a.slice(2)]: a === '--wait' ? Number(v) : v, settle: 900 });
  else { console.error(`unknown flag ${a}`); process.exit(1); }
}
const [route = 'home/home', out = `/tmp/nk-${route.replace(/\//g, '_')}.png`] = positional;

const session = await openCapture(overrides);
if (!(await session.reachable())) {
  console.error(`✗ dev server not reachable at ${session.base} — run \`npm run dev\` (or set PORT)`);
  await session.close();
  process.exit(1);
}
const { meta, errors } = await session.capture(route, { path: out, steps, scroll, target: stage ? 'stage' : 'phone', tool: 'shot', meta: !noMeta });
await session.close();
const notes = [
  meta.settle && !meta.settle.stable ? 'not stable (something keeps moving: loader, autoplay, live Lottie)' : '',
  meta.settle?.images?.broken ? `${meta.settle.images.broken} broken image(s)` : '',
].filter(Boolean);
console.log(meta.file ?? '(no file written)', errors.length ? `\nERRORS:\n${errors.join('\n')}` : '(no console errors)', notes.length ? `\nnote: ${notes.join(' · ')}` : '');
process.exit(meta.file ? 0 : 1);
