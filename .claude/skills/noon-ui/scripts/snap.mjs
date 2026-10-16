#!/usr/bin/env node
// Visual validation: screenshot every screen of one or more flows (or single routes) from the running dev server.
//   node .claude/skills/noon-ui/scripts/snap.mjs <flow | flow/screen>... [--out <dir>] [--scroll <y|top|bottom|el:sel>]
//                                               [--dpr n] [--stage] [--live] [--lottie first|<n>|live]
//   e.g. node .claude/skills/noon-ui/scripts/snap.mjs home cart/empty --out /tmp/review
// Writes <out>/<flow>__<screen>.png (default out: /tmp/noon-ui-snap) plus <out>/capture.json (profile, settle, scroll and
// console errors per screen) and prints console errors per screen. Same deterministic capture as scripts/shot.mjs
// (scripts/lib/capture.mjs: the 390×844 phone at dpr 2, fixed clock, seeded random, Lottie on its first frame).
// Needs `npm run dev` running (PORT=<port> if Vite didn't get 5180). Read every PNG it writes. A screenshot shows the
// screen rendered; it is visually verified only against an external reference (`npm run visual:ref`).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openCapture, profileFlags } from '../../../../scripts/lib/capture.mjs';

const args = process.argv.slice(2);
const overrides = profileFlags(args);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args.splice(i, 2)[1];
};
const flag = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? false : (args.splice(i, 1), true);
};
const out = opt('--out', '/tmp/noon-ui-snap');
const scroll = opt('--scroll', undefined);
const stage = flag('--stage');
if (!args.length) {
  console.error('Usage: node .claude/skills/noon-ui/scripts/snap.mjs <flow | flow/screen>... [--out <dir>] [--scroll <y|top|bottom|el:sel>] [--dpr n] [--stage] [--live]');
  process.exit(1);
}

const session = await openCapture(overrides);
if (!(await session.reachable())) {
  console.error(`✗ dev server not reachable at ${session.base} — run \`npm run dev\` (or set PORT)`);
  await session.close();
  process.exit(1);
}
const all = await session.routes();
const targets = args.flatMap((a) => (a.includes('/') ? [a] : all.filter((r) => r.startsWith(`${a}/`))));
const unknown = targets.filter((r) => !all.includes(r));
if (!targets.length || unknown.length) {
  console.error(`✗ unknown flow or route: ${unknown.join(', ') || args.join(', ')}`);
  await session.close();
  process.exit(1);
}

const suffix = scroll && scroll !== 'top' && scroll !== '0' ? `@${String(scroll).replace(/[^\w.-]+/g, '_')}` : '';
const index = { tool: 'snap', profile: session.profile, base: session.base, screens: [] };
let failed = 0;
for (const r of targets) {
  const file = join(out, `${r.replace('/', '__')}${suffix}.png`);
  const { meta, errors } = await session.capture(r, { path: file, scroll, target: stage ? 'stage' : 'phone', tool: 'snap', meta: false });
  index.screens.push(meta);
  if (errors.length) failed++;
  const note = meta.settle && !meta.settle.stable ? ' (not stable: something keeps moving)' : '';
  console.log(`${errors.length ? '✗' : '✓'} ${r.padEnd(32)} ${file}${note}${errors.length ? `\n    ${errors.join('\n    ')}` : ''}`);
}
await session.close();
writeFileSync(join(out, 'capture.json'), `${JSON.stringify(index, null, 2)}\n`);
console.log(`\n${targets.length} screen(s) → ${out}${failed ? ` · ${failed} with console errors` : ''}. Read every PNG against the spec (rendered, not visually verified: see visual:ref).`);
process.exit(failed ? 1 : 0);
