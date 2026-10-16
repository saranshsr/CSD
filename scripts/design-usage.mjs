#!/usr/bin/env node
// Design usage map: what the flows actually use, and the drift a new screen must not add.
//
//   node scripts/design-usage.mjs                write .claude/skills/noon-ui/references/design-usage.generated.{md,json}
//   node scripts/design-usage.mjs --check        exit 1 if a flow has more design findings than scripts/design-baseline.json
//                                                allows (a flow missing from the baseline must have none)
//   node scripts/design-usage.mjs --flow <id>    print one flow's findings (file:line kind value → fix)
//   node scripts/design-usage.mjs --baseline     rewrite scripts/design-baseline.json from today's counts
//
// Scans src/flows/**/*.module.css and *.tsx (not tokens*.ts / data*.ts) and src/components for the reference counts.
// CSS: every declaration is classified by role (text / surface / border / icon / shadow colour; padding / margin / gap /
// offset spacing; radius; font) and the selector's last class by element kind (card, sheet, pill, button, row …).
// TSX: shared components (imports from the components barrel + JSX use), <Text variant color>, Button variants,
// OriginIcon vs lucide Icon, and raw inline-style spacing.
// Findings (what `--check` counts): raw colour, raw font shorthand / size, spacing or radius off the token scale,
// a scale value written as raw px, and colour-role mismatches (a text-* token as a background, a bg-* token as text).
// The rules these numbers back are hand-written in .claude/skills/noon-ui/references/design-rules.md.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const argOf = (f) => (args.indexOf(f) >= 0 ? args[args.indexOf(f) + 1] : null);
const refDir = path.join(root, '.claude/skills/noon-ui/references');
const baselinePath = path.join(root, 'scripts/design-baseline.json');

// ── scales (from src/foundations/tokens.ts, parsed so they never drift) ────────────────────────────────────────────
const tokensSrc = fs.readFileSync(path.join(root, 'src/foundations/tokens.ts'), 'utf8');
const scaleOf = (name) => {
  const m = tokensSrc.match(new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\n\\}`));
  return new Map([...(m?.[1] ?? '').matchAll(/(\w+):\s*(\d+)/g)].map(([, k, v]) => [Number(v), k]));
};
const SPACE = scaleOf('spacing'); // 12 → 's12'
const RADIUS = scaleOf('radius'); // 12 → 'r12'
// 1px hairlines, 3px borders and half-pixels are geometry, not rhythm
const GEOMETRY = new Set([1, 0.5, 1.5, 3]);

// ── files ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const walk = (d, out = []) => {
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(module\.css|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
};
const rel = (p) => path.relative(root, p);
const flowOf = (p) => rel(p).match(/^src\/flows\/([^/]+)\//)?.[1] ?? (rel(p).startsWith('src/components/') ? '(components)' : null);
const files = [...walk(path.join(root, 'src/flows')), ...walk(path.join(root, 'src/components'))].filter((p) => flowOf(p));

const stripComments = (s, css) =>
  css ? s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')) : s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
const lineAt = (src, idx) => src.slice(0, idx).split('\n').length;

// ── classification ───────────────────────────────────────────────────────────────────────────────────────────────────
const KINDS = [
  ['sheet', /sheet|overlay|modal|drawer|tray|dialog/],
  ['button', /button|btn|cta|action(?!s?row)/],
  ['pill', /pill|chip|tag|badge|label(?=$)|capsule|flag/],
  ['input', /input|field|search(?!result)|textarea|select(?!ed)/],
  ['image', /image|img|thumb|photo|avatar|logo|banner|icon/],
  ['footer', /footer|bottombar|dock|sticky/],
  ['header', /header|topbar|navbar|titlebar/],
  ['card', /card|tile|box|panel|module|block|section|group|container|wrapper|item/],
  ['row', /row|entry|line|list/],
  ['page', /page|screen|content|body|feed|scroll|root|main/],
];
const kindOf = (selector) => {
  const cls = [...selector.matchAll(/\.([A-Za-z][\w-]*)/g)].map((m) => m[1].toLowerCase());
  const last = cls.at(-1) ?? selector.trim().toLowerCase();
  for (const [k, re] of KINDS) if (re.test(last)) return k;
  return 'other';
};
const COLOR_ROLE = (prop) =>
  prop === 'color' ? 'text'
  : /^background/.test(prop) ? 'surface'
  : /^(border|outline)/.test(prop) ? 'border'
  : /^(fill|stroke)$/.test(prop) ? 'icon'
  : /shadow/.test(prop) ? 'shadow'
  : /^(caret-color|text-decoration|-webkit-text)/.test(prop) ? 'text'
  : null;
const SPACE_ROLE = (prop) =>
  /^padding/.test(prop) ? 'padding'
  : /^margin/.test(prop) ? 'margin'
  : /^(gap|row-gap|column-gap)$/.test(prop) ? 'gap'
  : /^(top|left|right|bottom|inset)/.test(prop) ? 'offset'
  : null;

// ── accumulators ─────────────────────────────────────────────────────────────────────────────────────────────────────
const inc = (o, k, n = 1) => ((o[k] = (o[k] ?? 0) + n), o);
const flows = {}; // id → { components, local, text, button, icons, color:{role:{tok:n}}, space:{role:{val:n}}, radius:{kind:{val:n}}, type:{tok:n}, findings:[] }
const F = (id) =>
  (flows[id] ??= { components: {}, local: {}, textVariant: {}, textColor: {}, buttonVariant: {}, icons: { origin: 0, lucide: 0, mask: 0 }, color: {}, space: {}, radius: {}, type: {}, findings: [] });
const add = (id, file, line, kind, value, fix) => F(id).findings.push({ file: rel(file), line, kind, value, fix });

const roleMismatch = (role, name) => {
  // semantic intent is in the name; palette vars are neutral
  if (!name.startsWith('color-')) return null;
  const n = name.slice(6);
  if (role === 'surface' && /^text-/.test(n)) return `text token as a background → bg-inverse (dark fill) / bg-* / a flow token named for the role`;
  if (role === 'text' && /^(bg-|surface)/.test(n)) return `background token as text → text-inverse (on dark) / a text-* token`;
  if (role === 'border' && /^text-/.test(n) && !/text-(secondary|tertiary|primary)/.test(n)) return `text token as a border → border / border-strong`;
  return null;
};

function scanCss(file, raw) {
  const id = flowOf(file);
  const src = stripComments(raw, true);
  const f = F(id);
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    if (selector.startsWith('@')) continue;
    const kind = kindOf(selector);
    const bodyStart = m.index + m[0].indexOf('{') + 1;
    for (const d of m[2].matchAll(/([a-z-]+)\s*:\s*([^;]+)/g)) {
      const prop = d[1];
      const value = d[2].trim();
      const line = lineAt(src, bodyStart + d.index);
      if (/token-lint-ignore|design-ignore/.test(raw.split('\n')[line - 1] ?? '')) continue;
      if (prop.startsWith('--')) continue;
      // colours
      const cRole = COLOR_ROLE(prop);
      if (cRole) {
        for (const v of value.matchAll(/var\(--nk-((?:color|palette)-[a-z0-9-]+)/g)) {
          inc((f.color[cRole] ??= {}), v[1]);
          const why = roleMismatch(cRole, v[1]);
          if (why) add(id, file, line, 'role', `${prop}: var(--nk-${v[1]})`, why);
        }
        for (const v of value.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g)) {
          inc((f.color[cRole] ??= {}), `raw ${v[0]}`);
          add(id, file, line, 'raw-colour', `${prop}: ${v[0]}`, 'token-map.json → --nk-color-* / --nk-palette-*');
        }
      }
      // spacing
      const sRole = SPACE_ROLE(prop);
      if (sRole && !/calc\(\s*-?\s*100%|%/.test(value)) {
        for (const v of value.matchAll(/var\(--nk-space-s(\d+)\)/g)) inc((f.space[sRole] ??= {}), `s${v[1]}`);
        for (const v of value.replace(/var\([^)]*\)/g, '').matchAll(/(-?\d*\.?\d+)px/g)) {
          const n = Math.abs(Number(v[1]));
          if (n === 0 || GEOMETRY.has(n)) continue;
          inc((f.space[sRole] ??= {}), `${n}px`);
          if (SPACE.has(n)) add(id, file, line, 'raw-space', `${prop}: ${n}px`, `var(--nk-space-${SPACE.get(n)})`);
          else if (sRole !== 'offset') add(id, file, line, 'off-scale-space', `${prop}: ${n}px`, `nearest ${nearest(SPACE, n)}`);
        }
      }
      // radius
      if (/radius/.test(prop)) {
        for (const v of value.matchAll(/var\(--nk-radius-(r\d+|full)\)/g)) inc((f.radius[kind] ??= {}), v[1]);
        for (const v of value.replace(/var\([^)]*\)/g, '').matchAll(/(\d*\.?\d+)(px|%)/g)) {
          const n = Number(v[1]);
          if (v[2] === '%' || n === 0) { inc((f.radius[kind] ??= {}), `${n}${v[2]}`); continue; }
          inc((f.radius[kind] ??= {}), `${n}px`);
          if (n >= 999) add(id, file, line, 'raw-radius', `${prop}: ${n}px`, 'var(--nk-radius-full)');
          else if (RADIUS.has(n)) add(id, file, line, 'raw-radius', `${prop}: ${n}px`, `var(--nk-radius-${RADIUS.get(n)})`);
          else add(id, file, line, 'off-scale-radius', `${prop}: ${n}px`, `nearest ${nearest(RADIUS, n)}`);
        }
      }
      // type
      if (prop === 'font') {
        const t = value.match(/var\(--nk-type-([a-z0-9-]+)\)/);
        if (t) inc(f.type, t[1]);
        else if (/\d+px/.test(value)) { inc(f.type, 'raw'); add(id, file, line, 'raw-font', `font: ${value}`, 'var(--nk-type-*) (token-map.json type)'); }
      } else if (prop === 'font-size' && /\d+px/.test(value)) {
        inc(f.type, 'raw font-size');
        add(id, file, line, 'raw-font', `font-size: ${value}`, 'a whole var(--nk-type-*) shorthand');
      }
    }
  }
}
const nearest = (scale, n) => {
  const [v, k] = [...scale.entries()].sort((a, b) => Math.abs(a[0] - n) - Math.abs(b[0] - n))[0];
  return `${k} (${v})`;
};

function scanTsx(file, raw) {
  const id = flowOf(file);
  const src = stripComments(raw, false);
  const f = F(id);
  // shared components from the barrel
  const shared = (spec) => path.resolve(path.dirname(file), spec) === path.join(root, 'src/components');
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]((?:\.\.\/)+components)['"]/g)) {
    if (!shared(m[2])) {
      for (const name of m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter((s) => /^[A-Z]/.test(s))) inc(f.local, name);
      continue;
    }
    for (const name of m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter((s) => /^[A-Z]/.test(s))) {
      const uses = (src.match(new RegExp(`<${name}[\\s/>.]`, 'g')) ?? []).length;
      inc(f.components, name, Math.max(uses, 1));
    }
  }
  // direct component-folder imports (bypassing the barrel) count too
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]((?:\.\.\/)+components)\/([A-Za-z]+)\/[A-Za-z]+['"]/g)) {
    if (!shared(m[2])) continue;
    for (const name of m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter((s) => /^[A-Z]/.test(s))) inc(f.components, name);
  }
  // flow-local components
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]\.\.?\/(?:components\/)?([A-Z]\w+)['"]/g)) {
    for (const name of m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter((s) => /^[A-Z]/.test(s))) inc(f.local, name);
  }
  for (const m of src.matchAll(/<Text\b([^>]*)>/g)) {
    const v = m[1].match(/variant=["'](\w+)["']/)?.[1];
    const c = m[1].match(/color=["'](\w+)["']/)?.[1];
    if (v) inc(f.textVariant, v);
    if (c) inc(f.textColor, c);
  }
  for (const m of src.matchAll(/<Button\b[^>]*?variant=["'](\w+)["']/g)) inc(f.buttonVariant, m[1]);
  for (const m of src.matchAll(/<Button\b(?![^>]*variant=)[^>]*>/g)) inc(f.buttonVariant, '(default)');
  for (const m of src.matchAll(/<(motion\.)?button\b/g)) {
    const line = lineAt(src, m.index);
    if (/design-ignore/.test(raw.split('\n')[line - 1] ?? '')) continue;
    add(id, file, line, 'raw-button', `<${m[1] ?? ''}button>`, '<Pressable> (rows, cards, chips) or <Button variant> (CTAs)');
  }
  f.icons.origin += (src.match(/<OriginIcon\b/g) ?? []).length;
  f.icons.lucide += (src.match(/<Icon\b/g) ?? []).length;
  f.icons.mask += (src.match(/<MaskIcon\b/g) ?? []).length;
  // inline style spacing / radius numbers: style={{ padding: 13 }} (only in style objects, not props)
  for (const s of src.matchAll(/style=\{\{([^}]*)\}\}/g)) {
    for (const d of s[1].matchAll(/\b(padding\w*|margin\w*|gap|rowGap|columnGap|borderRadius)\s*:\s*(\d+(?:\.\d+)?)\b/g)) {
      const n = Number(d[2]);
      if (n === 0 || GEOMETRY.has(n)) continue;
      const line = lineAt(src, s.index + s[0].indexOf(d[0]));
      if (/token-lint-ignore|design-ignore/.test(raw.split('\n')[line - 1] ?? '')) continue;
      const isR = d[1] === 'borderRadius';
      const scale = isR ? RADIUS : SPACE;
      add(id, file, line, isR ? 'raw-radius' : 'raw-space', `style ${d[1]}: ${n}`, scale.has(n) ? `var(--nk-${isR ? 'radius' : 'space'}-${scale.get(n)})` : `nearest ${nearest(scale, n)}`);
    }
  }
}

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.css')) scanCss(file, raw);
  else scanTsx(file, raw);
}

// ── aggregate ────────────────────────────────────────────────────────────────────────────────────────────────────────
const flowIds = Object.keys(flows).filter((k) => k !== '(components)').sort();
const merge = (pick) => {
  const out = {};
  for (const id of flowIds) for (const [k, v] of Object.entries(pick(flows[id]) ?? {})) inc(out, k, v);
  return out;
};
const mergeNested = (key) => {
  const out = {};
  for (const id of flowIds) for (const [role, m] of Object.entries(flows[id][key])) for (const [k, v] of Object.entries(m)) inc((out[role] ??= {}), k, v);
  return out;
};
const spread = (pick, k) => flowIds.filter((id) => (pick(flows[id]) ?? {})[k]);
const top = (o, n = 12) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
const total = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '—');

const findingKinds = ['raw-colour', 'raw-font', 'role', 'raw-button', 'off-scale-space', 'raw-space', 'off-scale-radius', 'raw-radius'];
const counts = (id) => Object.fromEntries(findingKinds.map((k) => [k, flows[id].findings.filter((x) => x.kind === k).length]));

// ── modes ────────────────────────────────────────────────────────────────────────────────────────────────────────────
if (argOf('--flow')) {
  const id = argOf('--flow');
  if (!flows[id]) { console.error(`no flow ${id}`); process.exit(1); }
  for (const x of flows[id].findings) console.log(`${x.file}:${x.line}  ${x.kind.padEnd(16)} ${x.value}  →  ${x.fix}`);
  console.log(`\n${flows[id].findings.length} findings · ${JSON.stringify(counts(id))}`);
  process.exit(0);
}

if (has('--baseline')) {
  const b = Object.fromEntries(flowIds.map((id) => [id, counts(id)]));
  fs.writeFileSync(baselinePath, JSON.stringify({ _note: 'design-usage findings per flow at the time the rules landed; flows may only go down. New flows are not listed, so they must have none. Regenerate with node scripts/design-usage.mjs --baseline only after fixing findings.', ...b }, null, 2) + '\n');
  console.log(`wrote ${rel(baselinePath)}`);
  process.exit(0);
}

if (has('--check')) {
  const base = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : {};
  const bad = [];
  for (const id of flowIds) {
    const c = counts(id);
    const allowed = base[id] ?? Object.fromEntries(findingKinds.map((k) => [k, 0]));
    for (const k of findingKinds) if (c[k] > (allowed[k] ?? 0)) bad.push(`${id}: ${k} ${c[k]} > ${allowed[k] ?? 0}${base[id] ? '' : ' (new flow: must be 0)'}`);
  }
  if (bad.length) {
    console.error('✗ design rules: findings above the baseline (node scripts/design-usage.mjs --flow <id> lists them; rules: .claude/skills/noon-ui/references/design-rules.md)');
    for (const l of bad) console.error('  ' + l);
    process.exit(1);
  }
  console.log(`✓ design rules: ${flowIds.length} flows at or under the baseline`);
  process.exit(0);
}

// ── report ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const components = merge((f) => f.components);
const localAll = {};
for (const id of flowIds) for (const k of Object.keys(flows[id].local)) (localAll[k] ??= new Set()).add(id);
const color = mergeNested('color');
const space = mergeNested('space');
const radius = mergeNested('radius');
const type = merge((f) => f.type);
const textVariant = merge((f) => f.textVariant);
const textColor = merge((f) => f.textColor);
const buttonVariant = merge((f) => f.buttonVariant);
const icons = flowIds.reduce((a, id) => ({ origin: a.origin + flows[id].icons.origin, lucide: a.lucide + flows[id].icons.lucide, mask: a.mask + flows[id].icons.mask }), { origin: 0, lucide: 0, mask: 0 });

const json = {
  generated: 'node scripts/design-usage.mjs',
  flows: Object.fromEntries(flowIds.map((id) => [id, { components: flows[id].components, findings: counts(id) }])),
  components,
  color,
  space,
  radius,
  type,
  textVariant,
  textColor,
  buttonVariant,
  icons,
};
fs.writeFileSync(path.join(refDir, 'design-usage.generated.json'), JSON.stringify(json, null, 2) + '\n');

const L = [];
const tbl = (head, rows) => {
  L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`);
  for (const r of rows) L.push(`| ${r.join(' | ')} |`);
  L.push('');
};
const valTok = (k) => (k.startsWith('raw ') || /px$|%$/.test(k) ? `\`${k}\` (raw)` : `\`${k}\``);

L.push(
  '# Design usage (generated)',
  '',
  '> Generated by `node scripts/design-usage.mjs` (run by `npm run resources:build`); do not edit. What the',
  `> ${flowIds.length} flows in \`src/flows\` actually use, counted from their CSS modules and TSX. The rules these numbers back,`,
  '> and the why, are in [`design-rules.md`](design-rules.md). Per-flow findings: `node scripts/design-usage.mjs --flow <id>`.',
  ''
);

L.push('## 1. Shared components by use', '', 'JSX uses across all flows, and how many flows use each. A component in many flows is the default for its job.', '');
tbl(['Component', 'Uses', 'Flows', 'Which'], top(components, 45).map(([k, v]) => {
  const fl = spread((f) => f.components, k);
  return [`\`${k}\``, v, fl.length, fl.length > 8 ? `all but ${flowIds.filter((x) => !fl.includes(x)).join(', ') || '—'}` : fl.join(', ')];
}));
const unused = JSON.parse(fs.readFileSync(path.join(refDir, 'component-api.generated.json'), 'utf8'));
const exported = (unused.shared ?? []).map((c) => c.name).filter((n) => /^[A-Z]/.test(n));
const never = exported.filter((n) => !components[n]);
if (never.length) L.push(`Exported but used by no flow (${never.length}): ${never.map((n) => `\`${n}\``).join(', ')}.`, '');
const dupLocal = Object.entries(localAll).filter(([, s]) => s.size > 1).map(([k, s]) => `\`${k}\` (${[...s].join(', ')})`);
if (dupLocal.length) L.push(`Flow-local names that exist in more than one flow (promotion candidates, or name clashes): ${dupLocal.join(', ')}.`, '');

L.push('## 2. Text: `<Text variant color>` and CSS `font`', '');
tbl(['`<Text variant>`', 'Uses'], top(textVariant, 16).map(([k, v]) => [`\`${k}\``, v]));
tbl(['`<Text color>`', 'Uses'], top(textColor, 14).map(([k, v]) => [`\`${k}\``, v]));
const typeTotal = total(type);
L.push(`CSS \`font:\` declarations: ${typeTotal}, of which tokenised ${pct(typeTotal - (type.raw ?? 0) - (type['raw font-size'] ?? 0), typeTotal)}. Most used \`--nk-type-*\`:`, '');
tbl(['Type token', 'Uses', 'Flows'], top(Object.fromEntries(Object.entries(type).filter(([k]) => !k.startsWith('raw'))), 24).map(([k, v]) => [`\`${k}\``, v, spread((f) => f.type, k).length]));

L.push('## 3. Colour by role', '', 'Which token each role reaches for (CSS `color` = text, `background` = surface, `border*` = border, `fill`/`stroke` = icon). Raw literals are counted as `raw …`.', '');
for (const role of ['text', 'surface', 'border', 'icon', 'shadow']) {
  const m = color[role] ?? {};
  const t = total(m);
  const rawN = Object.entries(m).filter(([k]) => k.startsWith('raw')).reduce((a, [, v]) => a + v, 0);
  L.push(`### ${role} (${t} declarations, ${pct(t - rawN, t)} tokenised)`, '');
  tbl(['Token', 'Uses', 'Share', 'Flows'], top(m, 14).map(([k, v]) => [valTok(k), v, pct(v, t), spread((f) => f.color[role], k).length]));
}

L.push('## 4. Spacing by kind', '', 'Values in `padding*`, `margin*`, `gap`/`row-gap`/`column-gap` and offsets (`top`/`inset`…). Tokenised `sN` and raw `Npx` are listed separately so the gap between the scale and the code is visible. Hairlines (1, 0.5, 1.5, 3) are geometry and skipped.', '');
for (const role of ['padding', 'gap', 'margin', 'offset']) {
  const m = space[role] ?? {};
  const t = total(m);
  const tok = Object.entries(m).filter(([k]) => k.startsWith('s')).reduce((a, [, v]) => a + v, 0);
  const byPx = {};
  for (const [k, v] of Object.entries(m)) inc(byPx, k.startsWith('s') ? Number(k.slice(1)) : Number(k.replace('px', '')), v);
  L.push(`### ${role} (${t} values, ${pct(tok, t)} written as tokens)`, '');
  tbl(['Value', 'Uses', 'Share', 'On scale'], top(byPx, 14).map(([k, v]) => [`${k}`, v, pct(v, t), SPACE.has(Number(k)) ? `\`s${k}\`` : '**off**']));
}

L.push('## 5. Radius by element kind', '', 'Element kind is read from the selector\'s last class name (card/tile/box/section → card, pill/chip/tag/badge → pill, …).', '');
const kinds = Object.keys(radius).sort((a, b) => total(radius[b]) - total(radius[a]));
tbl(['Kind', 'Declarations', 'Top values'], kinds.map((k) => [k, total(radius[k]), top(radius[k], 6).map(([v, n]) => `${v} ×${n}`).join(' · ')]));

L.push('## 6. Buttons and icons', '');
tbl(['`<Button variant>`', 'Uses'], top(buttonVariant, 16).map(([k, v]) => [`\`${k}\``, v]));
L.push(`Icons in flow TSX: \`OriginIcon\` ${icons.origin} · lucide \`Icon\` ${icons.lucide} · \`MaskIcon\` ${icons.mask}.`, '');

L.push('## 7. Findings per flow', '', 'What `node scripts/design-usage.mjs --check` counts. Existing flows are held at `scripts/design-baseline.json` (they may only go down: most are 1:1 bappzaar ports whose odd values are the spec). A flow not in the baseline (every new flow) must be at 0.', '');
tbl(['Flow', ...findingKinds.map((k) => `\`${k}\``), 'Total'], [...flowIds, '(components)'].filter((id) => flows[id]).map((id) => {
  const c = counts(id);
  return [id, ...findingKinds.map((k) => c[k] || ''), total(c)];
}));

fs.writeFileSync(path.join(refDir, 'design-usage.generated.md'), L.join('\n'));
console.log(`wrote ${rel(path.join(refDir, 'design-usage.generated.md'))} (+ .json) · ${flowIds.length} flows · ${files.length} files`);
