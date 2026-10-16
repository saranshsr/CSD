#!/usr/bin/env node
// Validates every skill in .claude/skills against the code:  npm run skill:check   (-v lists what passed)
//
//  1. Structure   each skill folder has SKILL.md with frontmatter `name` = folder name and a `description`;
//                 every screen skill is listed in noon-ui's skill table.
//  2. Paths       every backticked file path in the skill files exists (resolved from the repo root, the skill
//                 folder or the file's own folder).
//  3. Tokens      every `--nk-*` CSS variable mentioned exists (central tokens, flow tokens, vars set in src).
//  4. Routes      every `flow/screen` route mentioned is registered.
//                 Paths, variables and routes that a file proposes (not built yet) go in a `<!-- planned: a, b -->` comment;
//                 files outside this repo (bappzaar, Figma exports) in `<!-- external: a, b -->`.
//  5. Coverage    noon-ui's references mention every component, token, transition, recipe, preset, asset folder,
//                 Origin icon (also in the generated originIcons.ts), flow and screen.
// Exits 1 on any problem, so it can run in CI.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const noonUi = join(skillsRoot, 'noon-ui');
const root = join(skillsRoot, '../..');
const verbose = process.argv.includes('-v');
const read = (p) => readFileSync(join(root, p), 'utf8');
const rel = (p) => relative(root, p);
const problems = [];
const ok = (msg) => verbose && console.log(`✓ ${msg}`);
const mentions = (doc, word) => new RegExp(`(^|[^\\w-])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\w-])`).test(doc);

// ── Load the real registry and tokens through Vite (screens and tokens live in TS modules).
const { createServer } = await import(join(root, 'node_modules/vite/dist/node/index.js'));
const vite = await createServer({ root, configFile: false, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', assetsInclude: ['**/*.lottie'], resolve: { alias: { '@assets': join(root, 'src/assets') } } });
let allFlows, tokens, tokensToCssVars, screenTruth;
try {
  ({ allFlows } = await vite.ssrLoadModule('/src/flows/index.ts'));
  ({ screenTruth } = await vite.ssrLoadModule('/src/kit/registry.ts'));
  ({ tokens } = await vite.ssrLoadModule('/src/foundations/tokens.ts'));
  ({ tokensToCssVars } = await vite.ssrLoadModule('/src/foundations/ThemeProvider.tsx'));
} finally {
  await vite.close();
}
const routes = new Set(allFlows.flatMap((f) => f.screens.map((s) => `${f.id}/${s.id}`)));
const flowIds = new Set(allFlows.map((f) => f.id));

const cssVars = new Set(Object.keys(tokensToCssVars(tokens)));
for (const f of allFlows) if (f.tokens) for (const v of Object.keys(tokensToCssVars(f.tokens))) cssVars.add(v);
(function scan(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (/\.(tsx?|css)$/.test(e.name)) for (const m of readFileSync(p, 'utf8').matchAll(/['"`](--nk-[a-z0-9-]+)['"`]|(--nk-[a-z0-9-]+)\s*:/g)) cssVars.add(m[1] ?? m[2]);
  }
})(join(root, 'src'));

// ── Collect skill files.
const skills = readdirSync(skillsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const mdFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) mdFiles.push(p);
  }
})(skillsRoot);
// Shared resources the skills load on demand (.claude/resources): checked like skill files, never a skill themselves.
const resourcesRoot = join(root, '.claude/resources');
if (existsSync(resourcesRoot)) for (const f of readdirSync(resourcesRoot, { recursive: true })) if (f.endsWith('.md')) mdFiles.push(join(resourcesRoot, f));
const planned = new Set(mdFiles.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/<!--\s*(?:planned|external):([^>]*)-->/g)].flatMap((m) => m[1].split(',').map((s) => s.trim()).filter(Boolean))));

// ── 1. Structure.
const noonUiSkill = readFileSync(join(noonUi, 'SKILL.md'), 'utf8');
for (const name of skills) {
  const file = join(skillsRoot, name, 'SKILL.md');
  if (!existsSync(file)) {
    problems.push(`${name}/ has no SKILL.md`);
    continue;
  }
  const fm = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  const field = (k) => fm?.[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1].trim();
  if (!fm) problems.push(`${name}/SKILL.md has no frontmatter`);
  else if (field('name') !== name) problems.push(`${name}/SKILL.md: frontmatter name "${field('name')}" must equal the folder name`);
  else if (!field('description')) problems.push(`${name}/SKILL.md: missing description`);
  else if (field('description').length > 1024) problems.push(`${name}/SKILL.md: description is ${field('description').length} chars (max 1024)`);
  else if (/[<>]/.test(field('description'))) problems.push(`${name}/SKILL.md: description contains < or > (the Claude app rejects XML-like tags; write e.g. "src/flows" instead of "src/flows/<flow>")`);
  else ok(`${name}: frontmatter`);
  if (name !== 'noon-ui') {
    if (!noonUiSkill.includes(`\`/${name}\``)) problems.push(`noon-ui/SKILL.md: screen skill /${name} is not in the skill table`);
    if (!existsSync(join(skillsRoot, name, 'spec.md'))) problems.push(`${name}/ has no spec.md (flow specification)`);
    // screen skills inherit the research-first design workflow instead of restating it
    if (!readFileSync(file, 'utf8').includes('../noon-ui/references/design-workflow.md')) problems.push(`${name}/SKILL.md: doesn't link ../noon-ui/references/design-workflow.md (screen skills inherit the design workflow)`);
  }
}
for (const r of ['design-workflow.md', 'research.md', 'component-checklist.md', 'progress-messages.md']) {
  if (!existsSync(join(noonUi, 'references', r))) problems.push(`noon-ui/references/${r} is missing`);
  else if (!noonUiSkill.includes(`references/${r}`)) problems.push(`noon-ui/SKILL.md doesn't link references/${r}`);
}
if (!existsSync(join(noonUi, 'templates/DESIGN.md'))) problems.push('noon-ui/templates/DESIGN.md is missing (new-flow and design-workflow.md copy it)');

// ── 2–4. Paths, CSS variables and routes in every skill file.
const pathLike = /^(src\/|scripts\/|\.claude\/|references\/|evals\/)[\w./@-]*$|^\.\.?\/[\w./@-]*\.(md|mjs|json)$|^[\w-]+\.(md|mjs|json)$/;
// Bare file names (`MAPPING.md`, `token-map.json`) are fine when a file with that name exists anywhere in the repo.
const basenames = new Set();
(function names(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    // Skip gitignored output so the check gives the same answer locally and on a clean CI checkout.
    if (['node_modules', '.git', 'test-results', 'playwright-report', '.vite', '.cache'].includes(e.name) || e.name.startsWith('dist')) continue;
    if (e.isDirectory()) names(join(dir, e.name));
    else basenames.add(e.name);
  }
})(root);
const exists = (bases, p) => (!p.includes('/') && basenames.has(p)) || bases.some((b) => ['', '.ts', '.tsx', '/index.ts'].some((x) => existsSync(join(b, p + x))));
for (const file of mdFiles) {
  const text = readFileSync(file, 'utf8');
  const where = rel(file);
  const badPaths = new Set();
  const badVars = new Set();
  const badRoutes = new Set();
  for (const [, code] of text.matchAll(/`([^`\n]+)`/g)) {
    // Paths: a whole backtick span that looks like a path, or a path at the start of a command.
    for (const candidate of [code, ...code.split(/\s+/)]) {
      const p = candidate.replace(/[),.;:]+$/, '').replace(/#.*$/, '').replace(/:\d+$/, '');
      if (!pathLike.test(p) || /[*<>{}]/.test(p)) continue;
      // Relative links resolve from their own file only; other paths from the repo root, the skill or the file.
      const home = file.startsWith(resourcesRoot) ? resourcesRoot : join(skillsRoot, where.split('/')[2]);
      const bases = /^\.\.?\//.test(p) ? [dirname(file)] : [root, home, dirname(file)];
      if (!planned.has(p) && !exists(bases, p)) badPaths.add(p);
    }
  }
  for (const [, v] of text.matchAll(/(--nk-[a-z0-9-]*[a-z0-9])(?![\w*-])/g)) if (!cssVars.has(v) && !planned.has(v)) badVars.add(v);
  for (const [, r] of text.matchAll(/[`'"]([a-z][a-zA-Z0-9]*\/[a-z][a-zA-Z0-9-]*)[`'"]/g)) {
    const [flow] = r.split('/');
    if (flowIds.has(flow) && !routes.has(r) && !planned.has(r) && !existsSync(join(root, 'src/flows', r)) && !existsSync(join(root, 'src/flows', `${r}.ts`))) badRoutes.add(r);
  }
  if (badPaths.size) problems.push(`${where}: paths that don't exist: ${[...badPaths].join(', ')}`);
  if (badVars.size) problems.push(`${where}: CSS variables that don't exist: ${[...badVars].join(', ')}`);
  if (badRoutes.size) problems.push(`${where}: routes that aren't registered (add to <!-- planned: … --> if new): ${[...badRoutes].join(', ')}`);
  if (!badPaths.size && !badVars.size && !badRoutes.size) ok(`${where}: paths, tokens, routes`);
}

// ── 5. Coverage of noon-ui's references.
const ref = (name) => {
  const p = join(noonUi, 'references', name);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
};
function expect(label, names, doc, file) {
  const missing = [...new Set(names)].filter((n) => !mentions(doc, n));
  if (missing.length) problems.push(`noon-ui/references/${file} is missing ${label}: ${missing.join(', ')}`);
  else ok(`${file}: all ${new Set(names).size} ${label}`);
}
/** Top-level keys of `export const <name> = { … }` in a TS source (two-space indented keys). */
function keysOf(src, name) {
  const start = src.indexOf(`export const ${name} = {`);
  if (start < 0) return [];
  const rest = src.slice(start);
  return [...rest.slice(0, rest.search(/\n\}/)).matchAll(/^ {2}'?([\w-]+)'?\s*:/gm)].map((m) => m[1]);
}

const components = [];
for (const dir of readdirSync(join(root, 'src/components'), { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const f of readdirSync(join(root, 'src/components', dir.name))) {
    if (!/\.tsx?$/.test(f)) continue;
    for (const m of read(`src/components/${dir.name}/${f}`).matchAll(/^export (?:function|const) ([A-Z]\w*)/gm)) components.push(m[1]);
  }
}
const componentsDoc = ref('components.md');
expect('components', components, componentsDoc, 'components.md');
const stale = [...componentsDoc.matchAll(/^#{2,4} `?([A-Z]\w*)`?\s*$/gm)].map((m) => m[1]).filter((h) => !components.includes(h));
if (stale.length) problems.push(`noon-ui/references/components.md documents components that no longer exist: ${stale.join(', ')}`);

const tokensSrc = read('src/foundations/tokens.ts');
for (const group of ['colors', 'spacing', 'radius', 'fontSize', 'type', 'shadow', 'layout']) expect(`${group} tokens`, keysOf(tokensSrc, group), ref('tokens.md'), 'tokens.md');
expect('component token groups', ['button', 'iconButton', 'badge', 'pill', 'stepper', 'searchBar', 'tabBar', 'quickAdd'].filter((g) => tokensSrc.includes(`export const ${g} = {`)), ref('tokens.md'), 'tokens.md');

const transitionsSrc = read('src/motion/transitions.ts');
const builtIn = keysOf(transitionsSrc.replace(/const builtIn[^=]*= \{/, 'export const builtIn = {'), 'builtIn');
const custom = [...read('src/motion/custom/index.ts').matchAll(/registerTransition\('([\w-]+)'/g)].map((m) => m[1]);
expect('transitions', [...builtIn, ...custom], ref('motion.md'), 'motion.md');
expect('recipes', [...read('src/motion/recipes.tsx').matchAll(/^export function (\w+)/gm)].map((m) => m[1]), ref('motion.md'), 'motion.md');
for (const group of ['easing', 'duration', 'spring']) expect(`${group} presets`, keysOf(read('src/motion/presets.ts'), group), ref('motion.md'), 'motion.md');
expect('supermall presets', keysOf(read('src/motion/presets.ts'), 'supermall'), ref('motion.md'), 'motion.md');
expect('haptic kinds', keysOf(read('src/motion/haptics.ts'), 'haptics'), ref('motion.md'), 'motion.md');

const assetDirs = readdirSync(join(root, 'src/assets')).filter((d) => statSync(join(root, 'src/assets', d)).isDirectory());
expect('asset folders', assetDirs, ref('assets.md'), 'assets.md');

const originIcons = readdirSync(join(root, 'src/assets/icons/origin')).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4));
expect('Origin icons (run `npm run icons:import`)', originIcons, ref('icons.md'), 'icons.md');
expect('Origin icons (run `npm run icons:import`)', originIcons, read('src/components/Icon/originIcons.ts'), '../../../src/components/Icon/originIcons.ts');

const flowsDoc = ref('flows.md');
for (const flow of allFlows) {
  expect(`flow "${flow.id}"`, [flow.id], flowsDoc, 'flows.md');
  const missing = flow.screens.map((s) => s.id).filter((s) => !flowsDoc.includes(`${flow.id}/${s}`) && !flowsDoc.includes(`\`${s}\``));
  if (missing.length) problems.push(`noon-ui/references/flows.md is missing screens of "${flow.id}": ${missing.join(', ')}`);
  else ok(`flows.md: ${flow.id} (${flow.screens.length} screens)`);
}

// ── 5a. Bottom sheets: the sheets that existed before Origin M-BottomSheet (scripts/sheet-baseline.json) keep their
//        current UI (`sheet: 'classic'`); every new sheet uses the Origin sheet (the default, no `sheet` field) unless it
//        is a 1:1 bappzaar port (truth `bappzaar`). Sheets = `presentation: 'sheet'` screens + `nav.sheet('…')` targets.
{
  const baseline = new Set(JSON.parse(readFileSync(join(root, 'scripts/sheet-baseline.json'), 'utf8')).classic);
  const navTargets = new Set();
  (function scan(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (/\.tsx?$/.test(e.name)) for (const m of readFileSync(p, 'utf8').matchAll(/\.sheet\(\s*'([\w-]+\/[\w-]+)'/g)) navTargets.add(m[1]);
    }
  })(join(root, 'src'));
  let classic = 0;
  let origin = 0;
  let floating = 0;
  for (const f of allFlows) {
    for (const sc of f.screens) {
      const r = `${f.id}/${sc.id}`;
      if (sc.presentation !== 'sheet' && !navTargets.has(r)) continue;
      const layout = (typeof sc.sheet === 'string' ? sc.sheet : sc.sheet?.layout) ?? 'origin';
      if (baseline.has(r)) {
        if (layout !== 'classic') problems.push(`${r}: existing sheet must keep its current UI — set \`sheet: 'classic'\` (scripts/sheet-baseline.json)`);
        else classic++;
      } else if (layout === 'classic' && screenTruth(sc) !== 'bappzaar') {
        problems.push(`${r}: new sheets use the Origin M-BottomSheet (drop \`sheet: 'classic'\`, fill it with <SheetHeader> / <SheetBody> / <SheetFooter>); 'classic' is only for 1:1 bappzaar ports`);
      } else if (layout === 'classic') classic++;
      else if (layout === 'floating') floating++; // bappzaar OverlayBottomSheet isFloating, 1:1
      else origin++;
    }
  }
  const gone = [...baseline].filter((r) => !routes.has(r));
  if (gone.length) problems.push(`scripts/sheet-baseline.json lists routes that no longer exist: ${gone.join(', ')}`);
  ok(`sheets: ${classic} classic (existing UI kept), ${floating} floating (OverlayBottomSheet isFloating), ${origin} Origin M-BottomSheet`);
}

// ── 5b. Source of truth per screen: every screen names its reference; `figma` / `mixed` screens need the flow's
//        FIGMA-MAPPING.md (or MAPPING.md) to say which area follows which; `verified` is a YYYY-MM-DD date.
const truthCount = {};
let verifiedCount = 0;
for (const f of allFlows) {
  for (const sc of f.screens) {
    const r = `${f.id}/${sc.id}`;
    if (!sc.source) problems.push(`${r}: no \`source\` (bappzaar path, Figma <fileKey> · <node>, or reference: …)`);
    const t = screenTruth(sc);
    truthCount[t] = (truthCount[t] ?? 0) + 1;
    if (sc.verified !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(sc.verified)) problems.push(`${r}: \`verified\` must be YYYY-MM-DD (got "${sc.verified}")`);
      else verifiedCount++;
    }
    if ((t === 'figma' || t === 'mixed') && sc.truth && !['FIGMA-MAPPING.md', 'MAPPING.md'].some((m) => existsSync(join(root, 'src/flows', f.id, m)))) {
      problems.push(`${r}: truth "${t}" but src/flows/${f.id} has no FIGMA-MAPPING.md / MAPPING.md saying which area follows which reference`);
    }
  }
}
ok(`source of truth: ${Object.entries(truthCount).map(([k, v]) => `${v} ${k}`).join(' · ')}; ${verifiedCount} verified`);
const truthSummary = `${Object.entries(truthCount).map(([k, v]) => `${v} ${k}`).join(' / ')} · ${verifiedCount} verified`;

// ── 7. The generated screen index in .claude/resources is current.
if (existsSync(join(resourcesRoot, 'scripts/build.mjs'))) {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, [join(resourcesRoot, 'scripts/build.mjs'), '--check'], { encoding: 'utf8' });
  if (r.status !== 0) problems.push('.claude/resources generated files are out of date: run npm run resources:build');
  else ok('resources: screens.md current');
}

// ── 6. Flow / screen / route counts quoted in prose ("17 flows", "147 screens") match the registry, with line numbers
//       (scripts/check-inventory.mjs; the resources staleness check is step 7 above, so --no-build).
const nFlows = allFlows.length;
const nScreens = routes.size;
if (existsSync(join(root, 'scripts/check-inventory.mjs'))) {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, [join(root, 'scripts/check-inventory.mjs'), '--no-build'], { encoding: 'utf8' });
  if (r.status !== 0) {
    const out = (r.stdout + r.stderr).split('\n');
    const from = out.findIndex((l) => l.startsWith('✗'));
    const items = out.slice(from + 1).filter((l) => /^ {2}- /.test(l));
    for (const l of items.length ? items : [out[from] ?? 'scripts/check-inventory.mjs failed']) problems.push(`counts: ${l.replace(/^\s*(-|✗)\s*/, '')}`);
  }
  else ok(`counts: ${nFlows} flows, ${nScreens} screens`);
}

// ── 8. References against source: component names / props / variants (the generated component API), motion preset,
//       transition and recipe names, asset paths, page URLs and nav targets mentioned in the skill docs.
//       Problems fail the run; `warnings` are new strictness that existing docs don't meet yet (printed, never fail).
const warnings = [];
{
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, [join(root, 'scripts/component-api.mjs'), '--check'], { encoding: 'utf8', timeout: 60000 });
  if (r.status !== 0) problems.push('noon-ui/references/component-api.generated.{md,json} are out of date: run node scripts/component-api.mjs');
  else ok('component API: generated files current');
}
const apiPath = join(noonUi, 'references/component-api.generated.json');
const api = existsSync(apiPath) ? JSON.parse(readFileSync(apiPath, 'utf8')) : { shared: [], flowLocal: [], inheritedPropNames: [] };
const sharedApi = new Map(api.shared.map((c) => [c.name, c]));
const localApi = new Map();
for (const c of api.flowLocal) localApi.set(c.name, [...(localApi.get(c.name) ?? []), c]);
const inheritedProps = new Set([...api.inheritedPropNames, 'key', 'ref']);
const propOk = (c, p) => p === 'key' || (p === 'ref' && c.forwardRef) || c.props.some((x) => x.name === p) || (!!c.inherits && (inheritedProps.has(p) || /^(aria|data)-/.test(p)));
// every capitalised declaration in src (screens and helpers define local components too) + React / motion built-ins
const declared = new Set(['Fragment', 'Suspense', 'StrictMode', 'AnimatePresence', 'MotionConfig', 'LayoutGroup', 'Reorder', 'LazyMotion']);
(function scan(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (/\.tsx?$/.test(e.name)) for (const m of readFileSync(p, 'utf8').matchAll(/(?:function|const|class|let)\s+([A-Z]\w*)/g)) declared.add(m[1]);
  }
})(join(root, 'src'));

/** JSX opening tags in a code snippet: name, attribute names and string-literal values (brace / quote aware). */
function jsxTags(code) {
  const out = [];
  for (const m of code.matchAll(/<([A-Z][\w.]*)(?=[\s/>])/g)) {
    const prev = code[m.index - 1] ?? ' ';
    if (/[\w/>]/.test(prev)) continue; // generics (useState<T>), paths (components/<Name>/), placeholders (text<size><Weight>)
    const attrs = [];
    const values = {};
    let depth = 0;
    let quote = null;
    let cur = '';
    let last = null;
    let selfClosing = false;
    let i = m.index + m[0].length;
    for (; i < code.length; i++) {
      const c = code[i];
      if (quote) {
        if (c === quote) {
          quote = null;
          if (depth === 0 && last) values[last] = cur;
        } else cur += c;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        quote = c;
        cur = '';
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (depth === 0 && c === '>') {
        selfClosing = code[i - 1] === '/';
        break;
      } else if (depth === 0 && /[a-zA-Z]/.test(c) && /[\s}]/.test(code[i - 1])) {
        const a = code.slice(i).match(/^[a-zA-Z][\w-]*/)[0];
        attrs.push(a);
        last = a;
        i += a.length - 1;
      }
    }
    const name = m[1].split('.')[0];
    out.push({ name, attrs, values, real: attrs.length > 0 || selfClosing || code.includes(`</${m[1]}>`) });
  }
  return out;
}
const codeOf = (text) => [...[...text.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]), ...[...text.replace(/```[\s\S]*?```/g, '').matchAll(/`([^`\n]+)`/g)].map((m) => m[1])];
const placeholder = (v) => /[…*<>{}|]|\.\.\./.test(v);

// motion names
const presetsSrc = read('src/motion/presets.ts');
const presetGroups = Object.fromEntries(['easing', 'duration', 'spring', 'supermall', 'handoff'].map((g) => [g, new Set(keysOf(presetsSrc, g))]));
presetGroups.haptics = new Set(keysOf(read('src/motion/haptics.ts'), 'haptics'));
const allTransitions = new Set(builtIn);
const presetUses = new Set(); // flow-local motion tokens used in code (reviews `M.spring.snappy`) are real names too
(function scan(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (/\.tsx?$/.test(e.name)) {
      const src = readFileSync(p, 'utf8');
      for (const m of src.matchAll(/registerTransition\(\s*'([\w-]+)'/g)) allTransitions.add(m[1]);
      for (const m of src.matchAll(/\.(easing|duration|spring|supermall|handoff)\.(\w+)/g)) presetUses.add(`${m[1]}.${m[2]}`);
    }
  }
})(join(root, 'src'));
const recipes = new Set([...read('src/motion/recipes.tsx').matchAll(/^export function (\w+)/gm)].map((m) => m[1]));
// page URLs: kit/routes.ts aliases + ScreenDef.path + flow ids + flow/screen
const pageNames = new Set([...read('src/kit/routes.ts').matchAll(/^\s+'?([\w-]+)'?:\s*'[\w]+\/[\w-]+'/gm)].map((m) => m[1]));
for (const f of allFlows) {
  pageNames.add(f.id);
  for (const sc of f.screens) for (const p of [sc.path ?? []].flat()) pageNames.add(String(p).replace(/^\//, ''));
}
for (const s of skills) pageNames.add(s); // `/home-page` is a slash command, not a URL
const pageOk = (u) => {
  const p = u.replace(/^\/+|\/+$/g, '').replace(/[?#].*$/, '');
  return !p || pageNames.has(p) || routes.has(p) || planned.has(u) || planned.has(p);
};

let componentRefs = 0;
// generated files are checked by their generators (categories-views.md quotes noon.com CMS URLs)
const generatedDocs = new Set(['screens.md', 'inventory.md', 'flows/categories-views.md'].map((p) => join(resourcesRoot, p)));
const docFiles = mdFiles.filter((f) => !f.endsWith('.generated.md') && !generatedDocs.has(f));
for (const file of docFiles) {
  const text = readFileSync(file, 'utf8');
  const where = rel(file);
  const code = codeOf(text);
  const bad = { props: new Set(), variants: new Set(), unknown: new Set(), presets: new Set(), transitions: new Set(), assets: new Set(), pages: new Set(), nav: new Set() };
  for (const snippet of code) {
    // components, props, variants
    for (const t of jsxTags(snippet)) {
      if (!t.real || planned.has(t.name)) continue;
      const s = sharedApi.get(t.name);
      const locals = localApi.get(t.name) ?? [];
      if (!s && !locals.length) {
        if (!declared.has(t.name) && !recipes.has(t.name)) bad.unknown.add(t.name);
        continue;
      }
      componentRefs++;
      if (!s) continue; // flow-local: prop names from destructuring only, not checked
      const wrong = t.attrs.filter((a) => !propOk(s, a));
      // a flow-local component of the same name (address SearchInput, pdp Stars) may be the one meant
      if (wrong.length && !locals.some((l) => t.attrs.every((a) => l.props.includes(a) || inheritedProps.has(a)))) for (const a of wrong) bad.props.add(`<${t.name} ${a}>`);
      for (const [k, v] of Object.entries(t.values)) if (s.variants?.[k] && !placeholder(v) && !s.variants[k].includes(v)) bad.variants.add(`<${t.name} ${k}="${v}"> (${s.variants[k].join(' | ')})`);
    }
    // motion presets: easing.out, spring.press, duration.fast, haptics.tap, supermall.reveal …; tween('fast', 'standard')
    for (const m of snippet.matchAll(/(?<![\w.])(easing|duration|spring|supermall|handoff|haptics)\.([a-zA-Z]\w*)/g)) if (!presetGroups[m[1]].has(m[2]) && !/^(ts|tsx|js|mjs|json|md|css|svg|webp|png|lottie)$/.test(m[2]) && !presetUses.has(`${m[1]}.${m[2]}`) && !planned.has(`${m[1]}.${m[2]}`)) bad.presets.add(`${m[1]}.${m[2]}`);
    for (const m of snippet.matchAll(/\btween\(\s*'(\w+)'(?:\s*,\s*'(\w+)')?/g)) {
      if (!presetGroups.duration.has(m[1])) bad.presets.add(`tween('${m[1]}')`);
      if (m[2] && !presetGroups.easing.has(m[2])) bad.presets.add(`tween(…, '${m[2]}')`);
    }
    // transitions: { transition: 'fade' } / transition="fade" (CSS / motion objects have spaces or braces and don't match)
    for (const m of snippet.matchAll(/\btransition\s*[:=]\s*['"]([a-z][\w-]*)['"]/g)) if (!allTransitions.has(m[1]) && !planned.has(m[1])) bad.transitions.add(m[1]);
    // assets: @assets/… or …/assets/… with an extension, in code
    for (const m of snippet.matchAll(/(?:@assets|(?<![\w-])(?:\.\.\/)*(?:src\/)?assets)\/([\w./@-]+\.[a-z0-9]{2,6})(?![\w/])/g)) {
      const p = `src/assets/${m[1]}`;
      if (!/[*<>{}]/.test(p) && !existsSync(join(root, p)) && !planned.has(p) && !planned.has(m[0])) bad.assets.add(m[0]);
    }
    // navigation targets: nav.push('plp'), nav.sheet('plp/filters'), reset / replace; shot.mjs <route>
    for (const m of snippet.matchAll(/\bnav\.(?:push|sheet|replace|reset)\(\s*'([^']+)'/g)) if (!placeholder(m[1]) && !pageOk(m[1])) bad.nav.add(m[1]);
    for (const m of snippet.matchAll(/\bshot\.mjs\s+([a-z][\w/-]*)/g)) if (!pageOk(m[1])) bad.nav.add(m[1]);
  }
  // page URLs written as a whole inline code span: `/cart`, `/plp?query=x`, `/manage-membership`
  for (const [, u] of text.replace(/```[\s\S]*?```/g, '').matchAll(/`(\/[a-z][\w-]*(?:\/[\w-]+)?(?:\?[^`\s]*)?)`/g)) if (!/^\/(tmp|src|users|private)\b/i.test(u) && !pageOk(u)) bad.pages.add(u);

  const list = (s) => [...s].join(', ');
  if (bad.props.size) problems.push(`${where}: props the component doesn't have (see component-api.generated.md): ${list(bad.props)}`);
  if (bad.variants.size) problems.push(`${where}: variant values that don't exist: ${list(bad.variants)}`);
  if (bad.presets.size) problems.push(`${where}: motion presets that don't exist (src/motion/presets.ts, haptics.ts): ${list(bad.presets)}`);
  if (bad.transitions.size) problems.push(`${where}: transitions that aren't registered (add to <!-- planned: … --> if new): ${list(bad.transitions)}`);
  if (bad.assets.size) problems.push(`${where}: asset paths that don't exist: ${list(bad.assets)}`);
  if (bad.nav.size) problems.push(`${where}: nav / shot targets that aren't routes, page URLs or flows: ${list(bad.nav)}`);
  if (bad.pages.size) warnings.push(`${where}: page URLs that aren't in src/kit/routes.ts / ScreenDef.path: ${list(bad.pages)}`);
  if (bad.unknown.size) warnings.push(`${where}: JSX components that exist nowhere in src (typo, removed, or proposed → <!-- planned: … -->): ${list(bad.unknown)}`);
}
ok(`references: ${componentRefs} component usages checked against the generated API`);

// components.md prop tables: every prop in a table row must exist on the section's component(s); every prop of an
// exported component should appear in its section (warning: the generated file lists them all).
{
  const lines = componentsDoc.split('\n');
  const sections = [];
  let cur = null;
  lines.forEach((l, i) => {
    const h = l.match(/^#{2,3} (.+)/);
    if (h) {
      cur = { title: h[1], names: [...h[1].matchAll(/\b([A-Z]\w+)\b/g)].map((m) => m[1]).filter((n) => sharedApi.has(n)), start: i, text: '' };
      sections.push(cur);
    } else if (cur) cur.text += l + '\n';
  });
  const badRows = [];
  for (const sec of sections) {
    if (!sec.names.length) continue;
    let tableFor = null;
    sec.text.split('\n').forEach((l, k) => {
      if (!l.startsWith('|')) return void (tableFor = null);
      const first = l.split('|')[1] ?? '';
      if (/^\s*(Prop|`?[A-Z]\w*`? prop)\b/.test(first)) {
        const named = first.match(/`([A-Z]\w*)`/)?.[1];
        tableFor = named && sharedApi.has(named) ? [named] : sec.names;
        return;
      }
      if (!tableFor || /^\s*-+\s*$/.test(first)) return;
      for (const [, p] of first.matchAll(/`([a-z][\w-]*)`/g)) {
        if (!tableFor.some((n) => propOk(sharedApi.get(n), p))) badRows.push(`${tableFor.join('/')}.${p} (line ${sec.start + k + 2})`);
      }
    });
  }
  if (badRows.length) problems.push(`noon-ui/references/components.md documents props that don't exist: ${badRows.join(', ')}`);
  const undocumented = [];
  for (const c of api.shared) {
    const sec = sections.find((s) => s.names.includes(c.name));
    if (!sec) continue; // a missing component is reported by the coverage check (step 5)
    const miss = c.props.filter((p) => !new RegExp(`\`${p.name}\\??[\`:= ]|\`${p.name}\\b`).test(sec.text) && !['children', 'className', 'style'].includes(p.name)).map((p) => p.name);
    if (miss.length) undocumented.push(`${c.name}: ${miss.join(', ')}`);
  }
  if (undocumented.length) warnings.push(`noon-ui/references/components.md doesn't mention these props (they are in component-api.generated.md): ${undocumented.join('; ')}`);
  else ok('components.md: every prop of every component mentioned');
}

// ── 9. Design records: every flow has a MAPPING.md / FIGMA-MAPPING.md or a filled-in DESIGN.md
//       (scripts/check-design-docs.mjs; baseline flows are warnings).
if (existsSync(join(root, 'scripts/check-design-docs.mjs'))) {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, [join(root, 'scripts/check-design-docs.mjs'), '--json'], { encoding: 'utf8' });
  let res = null;
  try {
    res = JSON.parse(r.stdout);
  } catch {
    problems.push(`design records: scripts/check-design-docs.mjs failed (${(r.stderr || r.stdout).trim().split('\n')[0]})`);
  }
  if (res) {
    for (const p of res.problems) problems.push(`design records: ${p}`);
    for (const w of res.warnings) warnings.push(`design records: ${w}`);
    if (!res.problems.length) ok(`design records: ${res.flows.length} flows documented (${res.warnings.length} baseline)`);
  }
}

const summary = `${skills.length} skills · ${mdFiles.length} files · ${routes.size} routes · ${cssVars.size} CSS variables · truth ${truthSummary}`;
if (problems.length) {
  console.log(`✗ skills are out of date (${problems.length} problems; ${summary}):\n`);
  for (const p of problems) console.log(`  - ${p}`);
  printWarnings();
  console.log('\nFix the skill files in .claude/skills/ and add a line to noon-ui/CHANGELOG.md.');
  process.exit(1);
}
console.log(`✓ skills match the code (${summary})`);
printWarnings();
function printWarnings() {
  if (!warnings.length) return;
  console.log(`\n⚠ ${warnings.length} warning(s) (not failing yet):\n`);
  for (const w of warnings) console.log(`  - ${w}`);
}
