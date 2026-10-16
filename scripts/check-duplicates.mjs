#!/usr/bin/env node
// Duplicate finder: flags likely duplicate implementations so they get a reuse decision. Report only — it never edits
// or moves code (promotion to src/components is a design decision: see components.md "Duplicates and promotion").
//
//   node scripts/check-duplicates.mjs              report (top 15 per section)
//   node scripts/check-duplicates.mjs --all        every finding
//   node scripts/check-duplicates.mjs --json       machine-readable
//   node scripts/check-duplicates.mjs <path>…      only findings that touch these paths (e.g. src/flows/cart)
//
// 1. Components   flow-local components (any capitalised function in src/flows/**.tsx, exported or not) whose name
//                 matches a shared component or another flow's component, or whose props overlap heavily.
// 2. CSS rules    identical / near-identical CSS-module rule blocks (≥ 4 declarations) in different flows, or a flow
//                 rule that repeats a src/components rule.
// 3. SVG paths    the same inline SVG path (`d`, ≥ 40 chars) in more than one file — an icon to share (OriginIcon,
//                 MaskIcon + an asset, or one flow-local component).
// Exit code is always 0: duplicates are a review signal, not a build failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const all = args.includes('--all');
const only = args.filter((a) => !a.startsWith('-')).map((a) => a.replace(/^\.\//, '').replace(/\/$/, ''));
const TOP = all ? Infinity : 15;
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const touches = (...files) => !only.length || files.some((f) => only.some((o) => f === o || f.startsWith(o + '/')));

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e.name) && !e.name.endsWith('.d.ts')) files.push(p);
  }
})(path.join(root, 'src'));
const areaOf = (r) => (r.startsWith('src/flows/') ? `flow:${r.split('/')[2]}` : r.startsWith('src/components/') ? 'shared' : r.split('/').slice(0, 2).join('/'));
const lineAt = (text, idx) => text.slice(0, idx).split('\n').length;

// ── 1. Components ──────────────────────────────────────────────────────────────────────────────────────────────
// Shared props come from the generated API (the checker); flow-local props from the destructured parameter.
let shared = [];
const apiFile = path.join(root, '.claude/skills/noon-ui/references/component-api.generated.json');
if (fs.existsSync(apiFile)) shared = JSON.parse(fs.readFileSync(apiFile, 'utf8')).shared.map((c) => ({ name: c.name, file: c.file, line: c.line, area: 'shared', props: c.props.map((p) => p.name) }));
else {
  const { extractComponentApi } = await import(pathToFileURL(path.join(root, 'scripts/component-api.mjs')).href);
  shared = (await extractComponentApi()).shared.map((c) => ({ name: c.name, file: c.file, line: c.line, area: 'shared', props: c.props.map((p) => p.name) }));
}

/** prop names of `function X({ a, b = 1, c: d, ...rest }` (top-level keys of the first destructured parameter) */
function destructured(src, from) {
  const open = src.indexOf('({', from);
  if (open < 0 || open - from > 200) return [];
  let depth = 0;
  let i = open + 1;
  let buf = '';
  const keys = [];
  for (; i < src.length; i++) {
    const c = src[i];
    if ('{[('.includes(c)) depth++;
    if ('}])'.includes(c)) depth--;
    if (depth === 0) break;
    if (depth === 1 && c === ',') {
      keys.push(buf);
      buf = '';
    } else if (depth >= 1) buf += c;
  }
  keys.push(buf);
  return keys.map((k) => k.replace(/^\s*\{?/, '').trim().match(/^([a-zA-Z_]\w*)/)?.[1]).filter(Boolean);
}
const local = [];
for (const f of files) {
  const r = rel(f);
  if (!r.startsWith('src/flows/') || !f.endsWith('.tsx')) continue;
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/^(?:export\s+)?(?:function\s+([A-Z]\w*)\s*(?:<[^>(]*>)?\s*\(|const\s+([A-Z]\w*)\s*=\s*(?:memo\(|forwardRef[^(]*\()?\s*(?:function\s*\w*)?\s*\()/gm)) {
    const name = m[1] ?? m[2];
    if (/Screen$|Sheet$/.test(name) && !r.includes('/components/')) continue; // screens themselves are not reuse candidates
    local.push({ name, file: r, line: lineAt(src, m.index), area: areaOf(r), props: destructured(src, m.index + m[0].length - 1) });
  }
}

const FLOW_PREFIX = /^(Cart|Checkout|Pdp|Plp|Sf|Noon|NoonOne|Home|Orders?|Returns?|Reviews?|Account|Address|Cards?|Deals|Membership|Mb|Wishlist|Search|Categories|Local|Flow|My|Custom|Simple|Base)(?=[A-Z])/;
const norm = (n) => {
  let s = n;
  for (let k = 0; k < 2; k++) s = s.replace(FLOW_PREFIX, '');
  return s.replace(/(Component|View|Item|Block|Module|Section|V2|New|2025)$/, '').toLowerCase();
};
const jaccard = (a, b) => {
  const A = new Set(a);
  const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / (A.size + B.size - inter || 1);
};
const IGNORE_PROPS = new Set(['children', 'className', 'style', 'onPress', 'onClick']);
const meaningful = (ps) => ps.filter((p) => !IGNORE_PROPS.has(p));
const componentPairs = [];
const pool = [...shared, ...local];
for (let i = 0; i < local.length; i++) {
  const a = local[i];
  for (let j = 0; j < pool.length; j++) {
    const b = pool[j];
    if (j < shared.length ? false : j - shared.length <= i) continue; // each local pair once
    if (b.area === a.area) continue;
    const sameName = a.name === b.name;
    const sameStem = !sameName && norm(a.name).length >= 4 && norm(a.name) === norm(b.name);
    const pa = meaningful(a.props);
    const pb = meaningful(b.props);
    const overlap = pa.length >= 3 && pb.length >= 3 ? jaccard(pa, pb) : 0;
    if (!sameName && !sameStem && overlap < 0.6) continue;
    const score = (sameName ? 3 : sameStem ? 2 : 0) + overlap * 2 + (b.area === 'shared' ? 0.5 : 0);
    componentPairs.push({ score: +score.toFixed(2), why: [sameName && 'same name', sameStem && 'same name stem', overlap >= 0.4 && `props ${Math.round(overlap * 100)}% shared`].filter(Boolean).join(', ') || `props ${Math.round(overlap * 100)}% shared`, a, b, commonProps: pa.filter((p) => pb.includes(p)) });
  }
}
componentPairs.sort((x, y) => y.score - x.score);

// ── 2. CSS rules ───────────────────────────────────────────────────────────────────────────────────────────────
const postcss = (await import(pathToFileURL(path.join(root, 'node_modules/postcss/lib/postcss.js')).href)).default;
const LAYOUT = /^(display|flex(-\w+)?|align-\w+|justify-\w+|place-\w+|gap|row-gap|column-gap|position|inset(-\w+)*|top|left|right|bottom|(min-|max-)?(width|height|inline-size|block-size)|overflow(-\w)?|object-fit|object-position|z-index|pointer-events|box-sizing|order|grid(-\w+)*|aspect-ratio|text-align|white-space|text-overflow|vertical-align|isolation|contain)$/;
const rules = [];
for (const f of files) {
  if (!f.endsWith('.module.css')) continue;
  const r = rel(f);
  const area = areaOf(r);
  if (area !== 'shared' && !area.startsWith('flow:')) continue;
  let ast;
  try {
    ast = postcss.parse(fs.readFileSync(f, 'utf8'), { from: f });
  } catch {
    continue;
  }
  ast.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
    const decls = rule.nodes.filter((n) => n.type === 'decl').map((d) => `${d.prop.trim().toLowerCase()}:${d.value.replace(/\s+/g, ' ').trim().toLowerCase()}`);
    if (decls.length < 4) return;
    // pure layout blocks (flex column + gap, absolute fill, img cover) repeat by nature; only blocks that carry look count
    if (decls.every((d) => LAYOUT.test(d.split(':')[0]))) return;
    rules.push({ file: r, line: rule.source?.start?.line, selector: rule.selector.replace(/\s+/g, ' '), area, decls: [...new Set(decls)].sort() });
  });
}
const cssGroups = new Map(); // identical declaration sets
for (const r of rules) {
  const key = r.decls.join(';');
  if (!cssGroups.has(key)) cssGroups.set(key, []);
  cssGroups.get(key).push(r);
}
const identical = [...cssGroups.values()].filter((g) => new Set(g.map((r) => r.area)).size > 1).map((g) => ({ decls: g[0].decls, rules: g })).sort((a, b) => b.rules.length * b.decls.length - a.rules.length * a.decls.length);
const near = [];
const firstOf = new Map([...cssGroups].map(([k, g]) => [g[0], k]));
const reps = [...firstOf.keys()];
for (let i = 0; i < reps.length; i++) {
  for (let j = i + 1; j < reps.length; j++) {
    const a = reps[i];
    const b = reps[j];
    if (a.area === b.area || Math.min(a.decls.length, b.decls.length) < 5) continue;
    if (Math.abs(a.decls.length - b.decls.length) > 2) continue;
    const s = jaccard(a.decls, b.decls);
    if (s >= 0.75 && s < 1) near.push({ similarity: +s.toFixed(2), a, b, differ: [...a.decls.filter((d) => !b.decls.includes(d)), ...b.decls.filter((d) => !a.decls.includes(d)).map((d) => `↔ ${d}`)] });
  }
}
near.sort((x, y) => y.similarity - x.similarity || y.a.decls.length - x.a.decls.length);

// ── 3. Inline SVG paths ─────────────────────────────────────────────────────────────────────────────────────────
const svg = new Map();
for (const f of files) {
  if (!/\.tsx?$/.test(f)) continue;
  const r = rel(f);
  if (r.startsWith('src/components/Icon/originIcons')) continue;
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bd\s*[=:]\s*\{?\s*["'`]([MmLlHhVvCcSsQqTtAaZz0-9.,\s-]{40,})["'`]/g)) {
    const d = m[1].replace(/\s+/g, ' ').trim();
    if (!svg.has(d)) svg.set(d, []);
    svg.get(d).push({ file: r, line: lineAt(src, m.index), area: areaOf(r) });
  }
}
const svgDupes = [...svg].filter(([, uses]) => new Set(uses.map((u) => u.file)).size > 1).map(([d, uses]) => ({ d, uses })).sort((a, b) => b.uses.length - a.uses.length);

// ── Report ──────────────────────────────────────────────────────────────────────────────────────────────────────
const comp = componentPairs.filter((p) => touches(p.a.file, p.b.file));
const ident = identical.filter((g) => touches(...g.rules.map((r) => r.file)));
const nearF = near.filter((n) => touches(n.a.file, n.b.file));
const svgF = svgDupes.filter((s) => touches(...s.uses.map((u) => u.file)));
if (asJson) {
  console.log(JSON.stringify({ components: comp, cssIdentical: ident, cssNear: nearF, svgPaths: svgF }, null, 2));
  process.exit(0);
}
const at = (x) => `${x.file}:${x.line}`;
const head = (title, n, shown) => console.log(`\n${title} — ${n}${n > shown ? ` (top ${shown}; --all for every one)` : ''}`);
console.log(`Duplicate report · ${local.length} flow-local components vs ${shared.length} shared · ${rules.length} CSS rules (≥ 4 decls) · ${svg.size} distinct SVG paths${only.length ? ` · only ${only.join(', ')}` : ''}`);

head('1. Components that look like another one', comp.length, Math.min(comp.length, TOP));
for (const p of comp.slice(0, TOP)) {
  console.log(`  ${p.a.name} (${at(p.a)})  ~  ${p.b.name} (${p.b.area === 'shared' ? 'shared, ' : ''}${at(p.b)})   [${p.why}]${p.commonProps.length ? `  common props: ${p.commonProps.join(' ')}` : ''}`);
}
head('2a. Identical CSS rule blocks across flows', ident.length, Math.min(ident.length, TOP));
for (const g of ident.slice(0, TOP)) {
  console.log(`  ${g.decls.length} decls × ${g.rules.length}: ${g.rules.map((r) => `${at(r)} ${r.selector}`).join('  |  ')}`);
}
head('2b. Near-identical CSS rule blocks across flows (≥ 75% of declarations equal)', nearF.length, Math.min(nearF.length, TOP));
for (const n of nearF.slice(0, TOP)) {
  console.log(`  ${Math.round(n.similarity * 100)}%  ${at(n.a)} ${n.a.selector}  ~  ${at(n.b)} ${n.b.selector}   differ: ${n.differ.slice(0, 4).join('; ')}${n.differ.length > 4 ? ' …' : ''}`);
}
head('3. Inline SVG paths repeated in several files', svgF.length, Math.min(svgF.length, TOP));
for (const s of svgF.slice(0, TOP)) console.log(`  ×${s.uses.length}  ${s.d.slice(0, 48)}…  ${s.uses.map(at).join('  ')}`);
console.log('\nReport only. Before merging or promoting anything, decide intended reuse and the API first (components.md → "Duplicates and promotion").');
