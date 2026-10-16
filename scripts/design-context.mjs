#!/usr/bin/env node
// Reuse finder for stage A / E of the design workflow (.claude/skills/noon-ui/references/design-workflow.md):
// before designing or building, list what the kit already has for the words you give it.
//
//   node scripts/design-context.mjs rating stars            # everything matching "rating" or "stars"
//   node scripts/design-context.mjs bottom sheet --all      # no per-section limit
//   node scripts/design-context.mjs stepper --json          # machine-readable
//
// Sections: shared components (real props from the generated API), flow-local components, tokens (with their CSS
// variable), Origin icons, motion presets, asset files, and the closest registered screens (from the inventory).
// It reads generated files; run `npm run components:api` / `npm run resources:build` first if they're stale.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const all = args.includes('--all');
const asJson = args.includes('--json');
const terms = args.filter((a) => !a.startsWith('--')).map((t) => t.toLowerCase());
/** each term also matches its singular ("stars" → "star", "sheets" → "sheet") */
const forms = (w) => [...new Set([w, w.replace(/ies$/, 'y'), w.replace(/es$/, ''), w.replace(/s$/, '')])].filter((f) => f.length > 1);
if (!terms.length) {
  console.error('usage: node scripts/design-context.mjs <word> [word…] [--all] [--json]');
  process.exit(1);
}
const LIMIT = all ? Infinity : 8;
const read = (p) => readFileSync(join(root, p), 'utf8');
const json = (p) => (existsSync(join(root, p)) ? JSON.parse(read(p)) : null);
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([a-zA-Z])(\d)/g, '$1$2').toLowerCase();
/** score: how many terms appear (name hits weigh double) */
const score = (name, text = '') => {
  const n = name.toLowerCase();
  const t = text.toLowerCase();
  const exact = terms.some((w) => forms(w).some((f) => n === f || n.endsWith(`.${f}`))) ? 3 : 0;
  return exact + terms.reduce((s, w) => s + (forms(w).some((f) => n.includes(f)) ? 2 : forms(w).some((f) => t.includes(f)) ? 1 : 0), 0);
};
const top = (items) => items.filter((i) => i.score > 0).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, LIMIT);

// components
const api = json('.claude/skills/noon-ui/references/component-api.generated.json');
const shared = api
  ? top(api.shared.map((c) => ({ name: c.name, file: `${c.file}:${c.line}`, doc: c.doc ?? '', props: c.props.map((p) => `${p.name}${p.optional ? '?' : ''}`).join(', '), score: score(c.name, `${c.doc} ${c.props.map((p) => p.name).join(' ')}`) })))
  : [];
const local = api ? top(api.flowLocal.map((c) => ({ name: c.name, flow: c.flow, file: `${c.file}:${c.line}`, doc: c.doc ?? '', score: score(c.name, c.doc) }))) : [];

// tokens: keys of the token objects, with their trailing comment as description
const tokenGroups = [
  ['src/foundations/tokens.ts', 'colors', 'color'],
  ['src/foundations/palette.ts', 'palette', 'palette'],
  ['src/foundations/tokens.ts', 'spacing', 'space'],
  ['src/foundations/tokens.ts', 'radius', 'radius'],
  ['src/foundations/tokens.ts', 'type', 'type'],
  ['src/foundations/tokens.ts', 'shadow', 'shadow'],
  ['src/foundations/tokens.ts', 'layout', 'layout'],
];
const tokens = [];
for (const [file, obj, prefix] of tokenGroups) {
  const src = read(file);
  const start = src.indexOf(`export const ${obj} = {`);
  if (start < 0) continue;
  const end = src.indexOf('\n};', start);
  for (const line of src.slice(start, end).split('\n').slice(1)) {
    const m = line.match(/^\s{2}(\w+):\s*(.+?),?\s*(?:\/\/\s*(.*))?$/);
    if (!m) continue;
    tokens.push({ name: `--nk-${prefix}-${kebab(m[1])}`, key: `${obj}.${m[1]}`, value: m[2].slice(0, 60), doc: m[3] ?? '', score: score(m[1], m[3] ?? '') });
  }
}

// Origin icons
const iconSrc = read('src/components/Icon/originIcons.ts');
const iconNames = [...iconSrc.matchAll(/^\s+'([a-z0-9-]+)',$/gm)].map((m) => m[1]);
const icons = top(iconNames.map((n) => ({ name: n, score: score(n.replace(/-/g, ' ')) })));

// motion presets (exported names + keys of the preset objects)
const presets = read('src/motion/presets.ts');
const motion = [];
for (const m of presets.matchAll(/^export const (\w+)/gm)) motion.push({ name: m[1], score: score(m[1]) });
for (const grp of ['easing', 'duration', 'spring', 'handoff', 'supermall']) {
  const s = presets.indexOf(`export const ${grp} = {`);
  if (s < 0) continue;
  const block = presets.slice(s, presets.indexOf('\n};', s));
  for (const m of block.matchAll(/^\s{2}(\w+):/gm)) motion.push({ name: `${grp}.${m[1]}`, score: score(m[1], grp) });
}
if (existsSync(join(root, 'src/motion/recipes.tsx'))) for (const m of read('src/motion/recipes.tsx').matchAll(/^export (?:function|const) (\w+)/gm)) motion.push({ name: `recipes.${m[1]}`, score: score(m[1]) });

// assets
const assets = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else assets.push({ name: relative(root, p), score: score(f.replace(/[-_.]/g, ' '), relative(join(root, 'src/assets'), dir)) });
  }
};
walk(join(root, 'src/assets'));

// screens
const inv = json('.claude/resources/inventory.json');
const screens = inv ? top(inv.flows.flatMap((f) => f.screens.map((s) => ({ name: s.route, title: s.title, urls: (s.urls ?? []).join(' '), label: s.label, score: score(s.route, `${s.title} ${s.source ?? ''}`) })))) : [];

const out = { terms, shared, local, tokens: top(tokens), icons, motion: top(motion), assets: top(assets.filter((a) => !/\/icons\/origin\//.test(a.name))), screens };
if (asJson) {
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const section = (title, rows, fmt) => {
  console.log(`\n${title}${rows.length ? '' : ': none'}`);
  for (const r of rows) console.log(`  ${fmt(r)}`);
};
console.log(`Kit matches for: ${terms.join(', ')}${api ? '' : '  (component API missing: run npm run components:api)'}`);
section('Shared components (src/components — use these first)', shared, (c) => `${c.name.padEnd(22)} ${c.file}\n${''.padEnd(25)}props: ${c.props || '—'}${c.doc ? `\n${''.padEnd(25)}${c.doc.slice(0, 110)}` : ''}`);
section('Flow-local components (reuse or flag for promotion; never copy)', local, (c) => `${c.name.padEnd(22)} ${c.file}`);
section('Tokens', out.tokens, (t) => `${t.name.padEnd(40)} ${t.key} = ${t.value}${t.doc ? `  // ${t.doc.slice(0, 50)}` : ''}`);
section('Origin icons (<OriginIcon name="…">)', icons, (i) => i.name);
section('Motion (src/motion)', out.motion, (m) => m.name);
section('Assets', out.assets, (a) => a.name);
section('Closest screens', screens, (s) => `${s.name.padEnd(30)} ${s.title}${s.urls ? `  ${s.urls}` : ''}  [${s.label}]`);
if (!all) console.log('\n(top 8 per section; --all for everything)');
