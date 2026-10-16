#!/usr/bin/env node
// Motion usage map: what moves in the flows today, by purpose, and where its timing comes from.
//
//   node scripts/motion-usage.mjs            write .claude/skills/noon-ui/references/motion-usage.generated.{md,json}
//   node scripts/motion-usage.mjs --flow <id>  print one flow's raw timings (file:line literal)
//
// Report only (nothing fails): the motion guidelines are provisional (references/motion-guidelines.md) until the
// real ones land; this file is the evidence they will be written against.
// Counts, per flow, from src/flows/**/*.tsx|ts and *.module.css (src/components separately):
//   screens  — presentation + ScreenDef.transition + `{ transition: '…' }` on nav calls (Navigator default: sheet → sheet,
//              modal → modal, else push)
//   purpose  — press (Pressable / whileTap / scale props), presence (AnimatePresence), layout (layout / layoutId),
//              scroll-linked (useScroll / useTransform / scroll state), imperative (animate() / useAnimate / rAF),
//              recipes (Stagger, FadeIn, BlurSwap, SkeletonReveal, CountUp, Confetti, …), loading (Skeleton, Spinner),
//              celebration (Lottie), autoplay (setInterval), haptics
//   timing   — preset references (spring.*, easing.*, duration.*, tween(), handoff.*, supermall.*, pressScale) vs raw
//              literals in transition objects (duration / ease arrays / stiffness+damping / delay / stagger), CSS
//              transition / animation durations and @keyframes
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const argOf = (f) => (args.indexOf(f) >= 0 ? args[args.indexOf(f) + 1] : null);
const refDir = path.join(root, '.claude/skills/noon-ui/references');

const walk = (d, out = []) => {
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts|module\.css)$/.test(e.name) && !e.name.endsWith('.d.ts')) out.push(p);
  }
  return out;
};
const rel = (p) => path.relative(root, p);
const flowOf = (p) => rel(p).match(/^src\/flows\/([^/]+)\//)?.[1] ?? (rel(p).startsWith('src/components/') ? '(components)' : null);
const files = [...walk(path.join(root, 'src/flows')), ...walk(path.join(root, 'src/components'))].filter((p) => flowOf(p));
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
const lineAt = (src, i) => src.slice(0, i).split('\n').length;
const inc = (o, k, n = 1) => ((o[k] = (o[k] ?? 0) + n), o);
const count = (src, re) => (src.match(re) ?? []).length;

const flows = {};
const F = (id) => (flows[id] ??= { screens: { total: 0, presentation: {}, transition: {} }, navTransition: {}, purpose: {}, presets: {}, raw: [], css: { transition: 0, animation: 0, keyframes: 0 }, pressScale: {}, durations: {}, springs: {}, eases: {}, staggers: {} });

const PURPOSE = {
  'press · Pressable': /<Pressable\b/g,
  'press · whileTap': /\bwhileTap=/g,
  'enter/exit · AnimatePresence': /<AnimatePresence\b/g,
  'enter · initial→animate': /\binitial=\{\{/g,
  'layout · layout / layoutId': /\blayout(?:Id)?=|\blayout\b(?=\s*[/>])/g,
  'scroll-linked · useScroll / useTransform': /\buse(?:Scroll|Transform|MotionValueEvent)\(/g,
  'imperative · animate() / useAnimate': /\banimate\(|\buseAnimate\(/g,
  'rAF loop': /requestAnimationFrame\(/g,
  'autoplay · setInterval': /setInterval\(/g,
  'drag · drag= / useDragControls': /\bdrag=|useDragControls\(/g,
  'loading · Skeleton': /<Skeleton\b/g,
  'loading · Spinner': /<Spinner\b/g,
  'loading · Button loading': /<Button\b[^>]*\bloading\b/g,
  'celebration · Lottie': /<Lottie\b|<LottieBox\b/g,
  'recipe · Stagger': /<Stagger\b/g,
  'recipe · FadeIn': /<FadeIn\b/g,
  'recipe · BlurSwap': /<BlurSwap\b/g,
  'recipe · SkeletonReveal': /<SkeletonReveal\b/g,
  'recipe · CountUp / Odometer': /<(CountUp|Odometer)\b/g,
  'recipe · Confetti': /<Confetti\b|confetti\(/gi,
  'haptics': /\bhaptic(?:s)?\.\w+\(|\bhaptic\(/g,
};
const PRESET = /\b(spring|easing|duration|handoff|supermall)\.([a-zA-Z]+)(?:\.([a-zA-Z]+))?|\btween\(\s*['"](\w+)['"](?:\s*,\s*['"](\w+)['"])?|\bpressScale\b|\bappleSpring\b/g;

for (const file of files) {
  const id = flowOf(file);
  const raw = fs.readFileSync(file, 'utf8');
  const src = strip(raw);
  const f = F(id);
  if (file.endsWith('.css')) {
    for (const m of src.matchAll(/\btransition\s*:\s*([^;]+)/g)) {
      f.css.transition++;
      for (const d of m[1].matchAll(/(\d*\.?\d+)(ms|s)\b/g)) inc(f.durations, `${d[2] === 'ms' ? Number(d[1]) / 1000 : Number(d[1])}s (css)`);
    }
    f.css.animation += count(src, /\banimation\s*:/g);
    f.css.keyframes += count(src, /@keyframes\b/g);
    continue;
  }
  // screens (flow index.ts and any ScreenDef arrays)
  if (/defineFlow\(/.test(src)) {
    for (const s of src.matchAll(/\{\s*id:\s*'[^']+'[^{}]*?component:[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}/g)) {
      f.screens.total++;
      const pres = s[0].match(/presentation:\s*'(\w+)'/)?.[1] ?? 'push';
      inc(f.screens.presentation, pres);
      const tr = s[0].match(/\btransition:\s*'([\w-]+)'/)?.[1] ?? `(default ${pres === 'sheet' ? 'sheet' : pres === 'modal' ? 'modal' : 'push'})`;
      inc(f.screens.transition, tr);
    }
  }
  for (const m of src.matchAll(/nav\.(?:push|replace|sheet|reset)\([^)]*?transition:\s*'([\w-]+)'/g)) inc(f.navTransition, m[1]);
  for (const [k, re] of Object.entries(PURPOSE)) {
    const n = count(src, re);
    if (n) inc(f.purpose, k, n);
  }
  for (const m of src.matchAll(PRESET)) {
    const key = m[0].startsWith('tween') ? `tween(${m[4]}${m[5] ? `, ${m[5]}` : ''})` : m[1] ? `${m[1]}.${m[2]}${m[3] ? '.' + m[3] : ''}` : m[0];
    if (/^(duration|easing|spring)\.(length|map|then)$/.test(key)) continue;
    // `import { spring } …` and object keys aren't uses
    inc(f.presets, key);
  }
  for (const m of src.matchAll(/\bscale=\{(\d*\.?\d+)\}/g)) inc(f.pressScale, m[1]);
  for (const m of src.matchAll(/whileTap=\{\{\s*scale:\s*(\d*\.?\d+)/g)) inc(f.pressScale, `${m[1]} (whileTap)`);
  // raw literals inside transition-like objects
  const record = (i, kind, value, bucket, key) => {
    const line = lineAt(src, i);
    if (/motion-ignore|token-lint-ignore/.test(raw.split('\n')[line - 1] ?? '')) return;
    f.raw.push({ file: rel(file), line, kind, value });
    if (bucket) inc(f[bucket], key ?? value);
  };
  for (const m of src.matchAll(/\bduration:\s*(\d*\.?\d+)\b(?!\s*[*/])/g)) record(m.index, 'duration', `${Number(m[1])}s`, 'durations');
  for (const m of src.matchAll(/\bstiffness:\s*(\d*\.?\d+)\s*,\s*damping:\s*(\d*\.?\d+)(?:\s*,\s*mass:\s*(\d*\.?\d+))?/g)) record(m.index, 'spring', `${m[1]}/${m[2]}${m[3] ? '/' + m[3] : ''}`, 'springs');
  for (const m of src.matchAll(/\bease:\s*\[\s*(-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+)\s*\]/g)) record(m.index, 'ease', `[${m[1].replace(/\s+/g, '')}]`, 'eases');
  for (const m of src.matchAll(/\bease:\s*'(\w+)'/g)) record(m.index, 'ease', `'${m[1]}'`, 'eases');
  for (const m of src.matchAll(/\b(staggerChildren|delayChildren):\s*(\d*\.?\d+)\b/g)) record(m.index, m[1], `${Number(m[2])}s`, 'staggers', `${m[1]} ${Number(m[2])}s`);
  for (const m of src.matchAll(/\bdelay:\s*\(?\s*[\w.%()\s]*\*\s*(\d*\.?\d+)\b/g)) record(m.index, 'stagger', `i × ${Number(m[1])}s`, 'staggers', `delay i × ${Number(m[1])}s`);
}

// screens: the brain graph has the registry's real presentation + effective transition (the regex above is the fallback)
const graphPath = path.join(root, '.claude/resources/brain/graph.json');
if (fs.existsSync(graphPath)) {
  const g = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  for (const f of Object.values(flows)) f.screens = { total: 0, presentation: {}, transition: {} };
  for (const sc of Object.values(g.screens ?? {})) {
    const f = F(sc.flow);
    f.screens.total++;
    inc(f.screens.presentation, sc.presentation === 'screen' ? 'push (screen)' : sc.presentation);
    inc(f.screens.transition, sc.transition ? sc.transitionEffective : `${sc.transitionEffective} (default)`);
  }
}
const ids = Object.keys(flows).filter((k) => k !== '(components)').sort();
const all = (pick) => {
  const o = {};
  for (const id of ids) for (const [k, v] of Object.entries(pick(flows[id]) ?? {})) inc(o, k, v);
  return o;
};
const flowsWith = (pick, k) => ids.filter((id) => (pick(flows[id]) ?? {})[k]);
const top = (o, n = 15) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

if (argOf('--flow')) {
  const f = flows[argOf('--flow')];
  if (!f) { console.error('no such flow'); process.exit(1); }
  for (const r of f.raw) console.log(`${r.file}:${r.line}  ${r.kind.padEnd(14)} ${r.value}`);
  console.log(`\n${f.raw.length} raw timing literals · presets ${sum(f.presets)}`);
  process.exit(0);
}

const presentation = all((f) => f.screens.presentation);
const screenTr = all((f) => f.screens.transition);
const navTr = all((f) => f.navTransition);
const purpose = all((f) => f.purpose);
const presets = all((f) => f.presets);
const pressScale = all((f) => f.pressScale);
const durations = all((f) => f.durations);
const springs = all((f) => f.springs);
const eases = all((f) => f.eases);
const staggers = all((f) => f.staggers);
const css = ids.reduce((a, id) => ({ transition: a.transition + flows[id].css.transition, animation: a.animation + flows[id].css.animation, keyframes: a.keyframes + flows[id].css.keyframes }), { transition: 0, animation: 0, keyframes: 0 });

fs.writeFileSync(path.join(refDir, 'motion-usage.generated.json'), JSON.stringify({ generated: 'node scripts/motion-usage.mjs', presentation, screenTransition: screenTr, navTransition: navTr, purpose, presets, pressScale, durations, springs, eases, staggers, css, flows: Object.fromEntries(ids.map((id) => [id, { screens: flows[id].screens, purpose: flows[id].purpose, presets: sum(flows[id].presets), raw: flows[id].raw.length, css: flows[id].css }])) }, null, 2) + '\n');

// raw literals that equal a preset (parsed from src/motion/presets.ts)
const presetSrc = fs.readFileSync(path.join(root, 'src/motion/presets.ts'), 'utf8');
const block = (name) => presetSrc.match(new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
const EQ = { duration: {}, ease: {}, spring: {} };
for (const [, k, v] of block('duration').matchAll(/(\w+):\s*(\d*\.?\d+)/g)) EQ.duration[`${Number(v)}s`] = `duration.${k}`;
for (const [, k, v] of block('easing').matchAll(/(\w+):\s*\[([^\]]+)\]/g)) EQ.ease[`[${v.replace(/\s+/g, '')}]`] = `easing.${k}`;
for (const [, k, st, d, m] of block('spring').matchAll(/(\w+):\s*\{[^}]*stiffness:\s*(\d*\.?\d+),\s*damping:\s*(\d*\.?\d+)(?:,\s*mass:\s*(\d*\.?\d+))?/g)) EQ.spring[`${st}/${d}${m ? '/' + m : ''}`] = `spring.${k}`;
EQ.spring['280.6/27.14/1'] = 'handoff.spring';
const eqOf = (kind, v) => EQ[kind]?.[v.replace(/ \(css\)$/, '')] ?? '';
const dupN = ids.reduce((a, id) => a + flows[id].raw.filter((r) => eqOf(r.kind === 'duration' ? 'duration' : r.kind, r.value)).length, 0);

const L = [];
const tbl = (head, rows) => {
  L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`);
  for (const r of rows) L.push(`| ${r.join(' | ')} |`);
  L.push('');
};
const fl = (pick, k) => {
  const w = flowsWith(pick, k);
  return w.length > 8 ? `${w.length} of ${ids.length}` : w.join(', ');
};

L.push(
  '# Motion usage (generated)',
  '',
  '> Generated by `node scripts/motion-usage.mjs` (run by `npm run resources:build`); do not edit. What moves in the',
  `> ${ids.length} flows today and where each timing comes from, counted from their TSX / TS / CSS. Read by purpose in`,
  '> [`motion-guidelines.md`](motion-guidelines.md); per interaction with file:line in [`motion-matrix.md`](motion-matrix.md).',
  '> One flow\'s raw timings: `node scripts/motion-usage.mjs --flow <id>`.',
  ''
);

L.push('## 1. How screens open', '');
tbl(['Presentation', 'Screens'], top(presentation).map(([k, v]) => [`\`${k}\``, v]));
tbl(['Effective transition', 'Screens', 'Flows'], top(screenTr, 20).map(([k, v]) => [`\`${k}\``, v, fl((f) => f.screens.transition, k)]));
if (Object.keys(navTr).length) tbl(['Transition passed on a nav call', 'Calls', 'Flows'], top(navTr).map(([k, v]) => [`\`${k}\``, v, fl((f) => f.navTransition, k)]));

L.push('## 2. In-screen motion by purpose', '', 'Occurrences in flow code (JSX elements, props or calls).', '');
tbl(['Purpose · mechanism', 'Uses', 'Flows'], top(purpose, 30).map(([k, v]) => [k, v, fl((f) => f.purpose, k)]));
L.push('Shared components that move on their own (counted under `(components)`, not above): `Pressable` press, `Skeleton` shimmer, `Spinner`, `Toast` / `Snackbar`, `QuantityStepper`, `Segmented`, `TabBar`, `WishlistHeart`, `QuickAdd`, `SearchBar` ticker, `ProductBoxVertical` nudge ticker.', '');

L.push('## 3. Press feedback', '', '`Pressable` scale (`scale={…}`; default 0.96 = `pressScale`) and `whileTap` scales written in flows.', '');
tbl(['Scale', 'Uses', 'Flows'], top(pressScale, 14).map(([k, v]) => [`\`${k}\``, v, fl((f) => f.pressScale, k)]));

L.push('## 4. Where timing comes from', '');
const rawN = ids.reduce((a, id) => a + flows[id].raw.length, 0);
L.push(`Preset references in flow code: **${sum(presets)}**. Raw timing literals (duration / spring / ease / stagger written inline): **${rawN}**. CSS: ${css.transition} \`transition\`, ${css.animation} \`animation\`, ${css.keyframes} \`@keyframes\`.`, '');
tbl(['Flow', 'Preset refs', 'Raw literals', 'CSS transition / animation / keyframes'], ids.map((id) => [id, sum(flows[id].presets), flows[id].raw.length, `${flows[id].css.transition} / ${flows[id].css.animation} / ${flows[id].css.keyframes}`]));
L.push('### Presets used', '');
tbl(['Preset', 'Uses', 'Flows'], top(presets, 30).map(([k, v]) => [`\`${k}\``, v, fl((f) => f.presets, k)]));
L.push('### Raw values (the spread a guideline will consolidate)', '');
L.push(`**${dupN}** of the raw literals equal an existing preset (they should be the preset).`, '');
tbl(['Duration', 'Uses', 'Equals'], top(durations, 18).map(([k, v]) => [k, v, eqOf('duration', k) ? `\`${eqOf('duration', k)}\`` : '']));
tbl(['Spring stiffness/damping[/mass]', 'Uses', 'Flows', 'Equals'], top(springs, 16).map(([k, v]) => [k, v, fl((f) => f.springs, k), eqOf('spring', k) ? `\`${eqOf('spring', k)}\`` : '']));
tbl(['Ease', 'Uses', 'Equals'], top(eases, 14).map(([k, v]) => [`\`${k}\``, v, eqOf('ease', k) ? `\`${eqOf('ease', k)}\`` : '']));
tbl(['Stagger', 'Uses'], top(staggers, 12).map(([k, v]) => [k, v]));

fs.writeFileSync(path.join(refDir, 'motion-usage.generated.md'), L.join('\n'));
console.log(`wrote ${rel(path.join(refDir, 'motion-usage.generated.md'))} (+ .json) · ${ids.length} flows · ${rawN} raw timing literals`);
