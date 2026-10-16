#!/usr/bin/env node
// Builds the brain map:  npm run brain:build   (--check: exit 1 when the committed output is stale)
//
// A generated knowledge graph of the kit, read by the skills before they open source files
// (.claude/resources/brain/README.md explains the IDs, the cards and the retrieval workflow).
//
//   graph.json            every entity (flow, screen, component, token, motion, icon, asset, store, data, test, doc
//                         section) and every relationship, derived from the code — nothing is hand-typed
//   INDEX.md              the compact entry point: product areas, flows, layer cards, how to query
//   flows/<flow>.md       one card per flow: entries / exits, and per screen its module, components, tokens,
//                         motion, nav out / in, tests and the spec / brief sections that describe it
//   components.md · tokens.md · motion.md · journeys.md · findings.md   layer cards
//
// Sources: the live registry (src/flows/index.ts through Vite SSR, so spread / generated screen lists resolve),
// an oxc AST of every src/**/*.{ts,tsx} (imports through barrels, JSX, nav calls, string routes, token member
// access), CSS modules (var() use), component-api.generated.json, inventory.json, the journeys, visual/refs.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = join(root, '.claude/resources/brain');
const check = process.argv.includes('--check');
const rel = (p) => relative(root, p).split('\\').join('/');
const read = (p) => readFileSync(join(root, p), 'utf8');
const readIf = (p) => (existsSync(join(root, p)) ? read(p) : '');
const sortU = (a) => [...new Set(a)].sort();
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([a-zA-Z])(\d)/g, '$1$2').toLowerCase();

// ── 1. Live registry, tokens, transitions (Vite SSR; lazyScreen is patched to expose its import path).
const { createServer } = await import(join(root, 'node_modules/vite/dist/node/index.js'));
const { parseAst } = await import(join(root, 'node_modules/rolldown/dist/parse-ast-index.mjs')).catch(() => import('rolldown/parseAst'));
const vite = await createServer({
  root, configFile: false, logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', assetsInclude: ['**/*.lottie'],
  resolve: { alias: { '@assets': join(root, 'src/assets') } },
  plugins: [{ name: 'brain-lazy-path', transform(code, id) {
    if (id.endsWith('/src/kit/lazyScreen.ts')) return code.replace('return Object.assign(C, { preload: once });', 'return Object.assign(C, { preload: once, __brain: { load: String(load), name } });');
  } }],
});
let allFlows, screenTruth, pageAliases, tokens, tokensToCssVars, listTransitions, builtInNames;
const directModules = new Map(); // component fn → { file, name }
try {
  ({ allFlows } = await vite.ssrLoadModule('/src/flows/index.ts'));
  ({ screenTruth } = await vite.ssrLoadModule('/src/kit/registry.ts'));
  ({ pageAliases } = await vite.ssrLoadModule('/src/kit/routes.ts'));
  ({ tokens } = await vite.ssrLoadModule('/src/foundations/tokens.ts'));
  ({ tokensToCssVars } = await vite.ssrLoadModule('/src/foundations/ThemeProvider.tsx'));
  const tr = await vite.ssrLoadModule('/src/motion/transitions.ts');
  listTransitions = tr.listTransitions;
  builtInNames = Object.keys(tr.builtIn ?? {});
  for (const [id, mod] of vite.moduleGraph.idToModuleMap) {
    const exp = mod.ssrModule;
    if (!exp || !id.startsWith(join(root, 'src'))) continue;
    for (const [name, v] of Object.entries(exp)) if (typeof v === 'function' || (v && typeof v === 'object' && v.$$typeof)) if (!directModules.has(v)) directModules.set(v, { file: rel(id.split('?')[0]), name });
  }
} finally {
  await vite.close();
}

const routes = new Map(); // route → { flow, screen }
for (const f of allFlows) for (const s of f.screens) routes.set(`${f.id}/${s.id}`, { f, s });
const flowById = new Map(allFlows.map((f) => [f.id, f]));
const screenPaths = {}; // ScreenDef.path → route
for (const [r, { s }] of routes) for (const p of [s.path ?? []].flat()) screenPaths[p] = r;

// ── 2. Source files: parse every TS/TSX with oxc, CSS with regexes.
const SRC = join(root, 'src');
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e.name) && !e.name.endsWith('.d.ts')) files.push(rel(p));
  }
})(SRC);
files.sort();
const fileSet = new Set(files);

const EXT = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
function resolveSpec(from, spec) {
  spec = spec.replace(/\?(raw|url|inline|worker)$/, '');
  let base;
  if (spec.startsWith('@assets/')) base = join(root, 'src/assets', spec.slice(8));
  else if (spec.startsWith('.')) base = resolve(join(root, dirname(from)), spec);
  else return { external: spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0] };
  for (const x of EXT) {
    const r = rel(base + x);
    if (fileSet.has(r)) return { file: r };
  }
  const r = rel(base);
  if (existsSync(base)) return { asset: r };
  return { missing: r };
}

/** flow id of a file under src/flows/<id>/ */
const flowOf = (file) => file.match(/^src\/flows\/([^/]+)\//)?.[1] ?? null;
function kindOf(file) {
  if (file.startsWith('src/flows/')) return /\/components\//.test(file) ? 'flow-component' : file.endsWith('.css') ? 'flow-css' : 'flow';
  if (file.startsWith('src/components/')) return 'shared';
  for (const k of ['kit', 'motion', 'foundations', 'data', 'app', 'mocks', 'assets']) if (file.startsWith(`src/${k}/`)) return k;
  return 'other';
}

// AST helpers
function walkAst(node, fn, parent) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const n of node) walkAst(n, fn, parent); return; }
  if (typeof node.type === 'string') fn(node, parent);
  for (const k in node) {
    if (k === 'start' || k === 'end' || k === 'type') continue;
    const v = node[k];
    if (v && typeof v === 'object') walkAst(v, fn, node);
  }
}
const strOf = (n) => (n?.type === 'Literal' && typeof n.value === 'string' ? n.value : n?.type === 'TemplateLiteral' && n.expressions.length === 0 ? n.quasis.map((q) => q.value.cooked).join('') : null);
const jsxName = (n) => (n?.type === 'JSXIdentifier' ? n.name : n?.type === 'JSXMemberExpression' ? `${jsxName(n.object)}.${n.property.name}` : null);

const TOKEN_OBJ = { colors: 'color', palette: 'palette', spacing: 'space', radius: 'radius', type: 'type', fontSize: 'font-size', fontWeight: 'font-weight', shadow: 'shadow', layout: 'layout' };
const REF_FN = { color: 'color', palette: 'palette', space: 'space', radius: 'radius', type: 'type', fontSize: 'font-size', fontWeight: 'font-weight', shadow: 'shadow', layout: 'layout' };
const NAV_METHODS = new Set(['push', 'sheet', 'replace', 'reset', 'switchTab']);

const facts = {}; // file → parsed facts
for (const file of files) {
  const text = file.endsWith('.css') ? read(file).replace(/\/\*[\s\S]*?\*\//g, '') : read(file);
  const f = { kind: kindOf(file), flow: flowOf(file), imports: [], rawImports: [], dynImports: [], named: [], externals: [], assets: [], missing: [], vars: [], icons: [], iconsDynamic: 0, nav: [], navDynamic: [], routeRefs: [], transitions: [], members: [], exportsLocal: [], reexports: [], stars: [] };
  facts[file] = f;
  if (file.endsWith('.css')) {
    for (const m of text.matchAll(/var\(\s*(--nk-[a-z0-9-]*[a-z0-9])(?![\w-])/g)) f.vars.push(m[1]);
    for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) { const r = resolveSpec(file, m[1]); if (r.asset) f.assets.push(r.asset); }
    for (const m of text.matchAll(/composes:[^;]*from\s+['"]([^'"]+)['"]/g)) { const r = resolveSpec(file, m[1]); if (r.file) f.imports.push(r.file); }
    continue;
  }
  let ast;
  try { ast = parseAst(text, { lang: file.endsWith('.tsx') ? 'tsx' : 'ts' }); } catch (e) { f.parseError = String(e.message ?? e).slice(0, 120); continue; }
  const localImports = {}; // local name → { file, imported }
  const addImport = (spec, specifiers, isType) => {
    const r = resolveSpec(file, spec);
    if (r.external) { f.externals.push(r.external); return null; }
    if (r.asset) { f.assets.push(r.asset); return null; }
    if (r.missing) { f.missing.push(r.missing); return null; }
    const names = [];
    for (const s of specifiers ?? []) {
      if (s.importKind === 'type' || isType) continue;
      const imported = s.type === 'ImportDefaultSpecifier' ? 'default' : s.type === 'ImportNamespaceSpecifier' ? '*' : s.imported?.name ?? s.imported?.value;
      localImports[s.local.name] = { file: r.file, imported };
      f.named.push({ from: r.file, name: imported });
      names.push(imported);
    }
    // side-effect imports keep the module; named imports are re-pointed at their defining files after parsing
    if (!isType && (!specifiers?.length || names.length)) f.rawImports.push({ file: r.file, names: specifiers?.length ? names : null });
    return r.file;
  };
  for (const st of ast.body) {
    if (st.type === 'ImportDeclaration') addImport(st.source.value, st.specifiers, st.importKind === 'type');
    else if (st.type === 'ExportNamedDeclaration') {
      if (st.source) {
        const r = resolveSpec(file, st.source.value);
        if (r.file && st.exportKind !== 'type') {
          f.imports.push(r.file);
          for (const s of st.specifiers) f.reexports.push({ name: s.exported.name ?? s.exported.value, from: r.file, imported: s.local.name ?? s.local.value });
        }
      } else if (st.declaration) {
        const d = st.declaration;
        if (d.id?.name) f.exportsLocal.push(d.id.name);
        for (const v of d.declarations ?? []) if (v.id?.name) f.exportsLocal.push(v.id.name);
      } else for (const s of st.specifiers) {
        const local = s.local.name ?? s.local.value;
        const name = s.exported.name ?? s.exported.value;
        if (localImports[local]) f.reexports.push({ name, from: localImports[local].file, imported: localImports[local].imported });
        else f.exportsLocal.push(name);
      }
    } else if (st.type === 'ExportAllDeclaration') {
      const r = resolveSpec(file, st.source.value);
      if (r.file && st.exportKind !== 'type') { f.imports.push(r.file); f.stars.push(r.file); }
    } else if (st.type === 'ExportDefaultDeclaration') f.exportsLocal.push('default');
  }
  // top-level `const X = 'flow/screen'` and functions that return route strings (for dynamic nav targets)
  f.consts = {};
  f.fns = {};
  for (const st0 of ast.body) {
    const st = st0.type === 'ExportNamedDeclaration' && st0.declaration ? st0.declaration : st0;
    const decls = st.type === 'VariableDeclaration' ? st.declarations.map((d) => [d.id?.name, d.init]) : st.type === 'FunctionDeclaration' ? [[st.id?.name, st]] : [];
    for (const [name, init] of decls) {
      if (!name || !init) continue;
      if (strOf(init) != null) f.consts[name] = strOf(init);
      else if (/Function/.test(init.type)) {
        const lits = [];
        let prefix = null;
        walkAst(init.body, (x) => {
          const v = strOf(x);
          if (v != null) lits.push(v);
          else if (x.type === 'TemplateLiteral' && x.expressions.length && /^[a-z]\w*\/$/.test(x.quasis[0].value.cooked)) prefix = x.quasis[0].value.cooked;
        });
        f.fns[name] = { lits, prefix };
      }
    }
  }
  walkAst(ast, (n, parent) => {
    if (n.type === 'ImportExpression') {
      const s = strOf(n.source);
      if (s) { const r = resolveSpec(file, s); if (r.file) f.dynImports.push(r.file); else if (r.asset) f.assets.push(r.asset); }
    } else if (n.type === 'CallExpression' && n.callee?.type === 'MemberExpression' && !n.callee.computed && NAV_METHODS.has(n.callee.property?.name) && /^(nav|navigation|navigator)$/i.test(n.callee.object?.name ?? '')) {
      const arg = strOf(n.arguments[0]);
      const opt = n.arguments[1]?.type === 'ObjectExpression' ? n.arguments[1].properties.find((p) => p.key?.name === 'transition') : null;
      if (opt && strOf(opt.value)) f.transitions.push(strOf(opt.value));
      if (arg != null) f.nav.push({ method: n.callee.property.name, target: arg });
      else f.navDynamic.push({ method: n.callee.property.name, expr: text.slice(n.arguments[0]?.start ?? 0, n.arguments[0]?.end ?? 0).slice(0, 60), node: n.arguments[0], localImports });
    } else if (n.type === 'CallExpression' && n.callee?.type === 'MemberExpression' && n.callee.object?.name === 'ref' && REF_FN[n.callee.property?.name]) {
      const k = strOf(n.arguments[0]);
      if (k) f.vars.push(`--nk-${REF_FN[n.callee.property.name]}-${kebab(k)}`);
    } else if (n.type === 'MemberExpression' && !n.computed && n.object?.type === 'Identifier') {
      const imp = localImports[n.object.name];
      if (imp && /^src\/foundations\/(tokens|palette)\.ts$/.test(imp.file) && TOKEN_OBJ[imp.imported]) f.vars.push(`--nk-${TOKEN_OBJ[imp.imported]}-${kebab(n.property.name)}`);
      else if (imp) f.members.push({ from: imp.file, name: imp.imported, member: n.property.name });
    } else if (n.type === 'JSXOpeningElement') {
      const name = jsxName(n.name);
      const attr = (k) => n.attributes.find((a) => a.type === 'JSXAttribute' && a.name?.name === k);
      if (name === 'OriginIcon') {
        const v = strOf(attr('name')?.value) ?? strOf(attr('name')?.value?.expression);
        if (v) f.icons.push(v); else if (attr('name')) f.iconsDynamic++;
      } else if (name === 'Text') {
        const v = strOf(attr('variant')?.value);
        if (v) f.vars.push(`--nk-type-${kebab(v)}`);
        const c = strOf(attr('color')?.value);
        if (c && /^[a-z][a-zA-Z0-9]*$/.test(c)) f.vars.push(`--nk-color-${kebab(c)}`);
      }
      const t = strOf(attr('transition')?.value);
      if (t) f.transitions.push(t);
    } else if (n.type === 'Property' && !n.computed && (n.key?.name ?? n.key?.value) === 'transition' && strOf(n.value) && f.kind.startsWith('flow')) {
      f.transitions.push(strOf(n.value));
    } else if ((n.type === 'Literal' && typeof n.value === 'string') || (n.type === 'TemplateLiteral' && n.expressions.length === 0)) {
      const s = strOf(n);
      for (const m of s.matchAll(/var\(\s*(--nk-[a-z0-9-]+)/g)) f.vars.push(m[1]);
      const r = s.replace(/\?.*$/, '');
      if (/^[a-z]\w*\/[a-zA-Z]\w*$/.test(r) && routes.has(r)) f.routeRefs.push(r);
    }
  });
}

// ── 3. Export resolution through barrels: (file, name) → defining { file, name }.
const memo = new Map();
function defining(file, name, depth = 0) {
  const key = `${file}#${name}`;
  if (memo.has(key)) return memo.get(key);
  let out = null;
  const f = facts[file];
  if (f && depth < 12) {
    if (f.exportsLocal.includes(name)) out = { file, name };
    else {
      const re = f.reexports.find((r) => r.name === name);
      if (re) out = defining(re.from, re.imported, depth + 1);
      else for (const s of f.stars) { out = defining(s, name, depth + 1); if (out) break; }
    }
  }
  memo.set(key, out);
  return out;
}

// Named imports point at the file that defines each name, not at the barrel that re-exports it
// (`import { Button } from '../../components'` → src/components/Button/Button.tsx), so closures stay precise.
for (const file of files) {
  const f = facts[file];
  for (const { file: m, names } of f.rawImports) {
    if (!names || names.includes('*')) { f.imports.push(m); continue; }
    for (const n of names) f.imports.push(defining(m, n)?.file ?? m);
  }
  f.imports = sortU(f.imports);
}

// ── 4. Entities.
const api = JSON.parse(read('.claude/skills/noon-ui/references/component-api.generated.json'));
const components = {}; // id → { kind, name, flow, file, line, doc }
const compByDef = new Map(); // file#name → id
for (const c of api.shared) { const id = `cmp:${c.name}`; components[id] = { kind: 'shared', name: c.name, file: c.file, line: c.line, doc: c.doc ?? '' }; compByDef.set(`${c.file}#${c.name}`, id); }
for (const c of api.flowLocal) {
  let id = `cmp:${c.flow}/${c.name}`;
  if (components[id]) id = `cmp:${c.flow}/${c.name}@${c.file.split('/').slice(-2, -1)[0]}`;
  components[id] = { kind: 'local', name: c.name, flow: c.flow, file: c.file, line: c.line, doc: c.doc ?? '' };
  compByDef.set(`${c.file}#${c.name}`, id);
}

// tokens: every central var with its group; flow token vars per flow
const tokenGroupOf = {}; // var → group
for (const [g, values] of Object.entries(tokens)) for (const v of Object.keys(tokensToCssVars({ [g]: values }))) tokenGroupOf[v] = g;
const flowTokenVars = {}; // flow → [vars]
for (const f of allFlows) if (f.tokens) flowTokenVars[f.id] = Object.keys(tokensToCssVars(f.tokens)).sort();
const definedInSrc = new Set();
for (const file of files) for (const m of read(file).matchAll(/['"`](--nk-[a-z0-9-]+)['"`]|(--nk-[a-z0-9-]+)\s*:/g)) definedInSrc.add(m[1] ?? m[2]);
const definedVars = new Set([...Object.keys(tokenGroupOf), ...Object.values(flowTokenVars).flat(), ...definedInSrc, '--nk-font-family']);

const presetsSrc = read('src/motion/presets.ts');
const recipeNames = new Set(facts['src/motion/recipes.tsx']?.exportsLocal ?? []);
const PRESET_GROUPS = ['easing', 'duration', 'spring', 'supermall', 'handoff'];
const transitionNames = sortU([...builtInNames, ...listTransitions().map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean)]);
const transitionFiles = {};
for (const file of files) for (const m of readIf(file).matchAll(/registerTransition\(\s*'([\w-]+)'/g)) transitionFiles[m[1]] = file;

const STORE_FILES = { 'src/kit/DemoStore.tsx': 'store:demo', 'src/kit/membership.ts': 'store:membership' };
for (const file of files) { const m = file.match(/^src\/flows\/(\w+)\/store\.ts$/); if (m) STORE_FILES[file] = `store:${m[1]}`; }

// per-file derived uses
const uses = {};
for (const file of files) {
  const f = facts[file];
  const u = { components: [], tokens: [], icons: sortU(f.icons), assets: sortU(f.assets), motion: [], stores: [], data: [] };
  for (const { from, name } of f.named) {
    const d = name === '*' ? null : defining(from, name);
    const def = d ?? { file: from, name };
    const cid = compByDef.get(`${def.file}#${def.name}`);
    if (cid && def.file !== file) u.components.push(cid);
    if (def.file === 'src/motion/recipes.tsx' && recipeNames.has(def.name)) u.motion.push(def.name === 'useReduceMotion' ? 'mo:reduced-motion' : `mo:recipe/${def.name}`);
    if (def.file === 'src/motion/reducedMotion.ts') u.motion.push('mo:reduced-motion');
    if (def.file === 'src/motion/haptics.ts') u.motion.push('mo:haptics');
    if (def.file === 'src/motion/presets.ts' && !PRESET_GROUPS.includes(def.name)) u.motion.push(`mo:preset/${def.name}`);
    if (STORE_FILES[def.file]) u.stores.push(STORE_FILES[def.file]);
    if (def.file.startsWith('src/data/') && /^[a-z]/.test(def.name)) u.data.push(`data:${def.name}`);
  }
  for (const m of f.members) {
    const d = defining(m.from, m.name) ?? { file: m.from, name: m.name };
    if (d.file === 'src/motion/presets.ts' && PRESET_GROUPS.includes(d.name)) u.motion.push(`mo:preset/${d.name}.${m.member}`);
  }
  for (const t of f.transitions) u.motion.push(`mo:transition/${t}`);
  u.tokens = sortU(f.vars);
  for (const k of ['components', 'motion', 'stores', 'data']) u[k] = sortU(u[k]);
  uses[file] = u;
}

// screens → module
const screens = {};
const findings = [];
const find = (level, rule, msg, ref) => findings.push({ level, rule, msg, ref });
for (const [route, { f, s }] of routes) {
  let mod = null;
  const b = s.component?.__brain;
  if (b) { const m = b.load.match(/__vite_ssr_dynamic_import__\("\/?([^"]+)"/); if (m) mod = { file: m[1].replace(/^\//, ''), name: b.name }; }
  else if (directModules.has(s.component)) mod = directModules.get(s.component);
  if (!mod || !fileSet.has(mod.file)) find('error', 'screen-module', `${route}: could not resolve the screen component to a source file`, `scr:${route}`);
  const urls = sortU([...Object.entries(pageAliases).filter(([, r]) => r === route).map(([a]) => `/${a}`), ...[s.path ?? []].flat().map((p) => `/${p}`)]);
  screens[route] = {
    flow: f.id, id: s.id, title: s.title, presentation: s.presentation ?? 'screen',
    sheet: s.presentation === 'sheet' ? (typeof s.sheet === 'string' ? s.sheet : s.sheet?.layout ?? 'origin') : undefined,
    transition: s.transition, transitionEffective: s.transition ?? (s.presentation === 'sheet' ? 'sheet' : s.presentation === 'modal' ? 'modal' : 'push'), urls, truth: screenTruth(s), truthExplicit: Boolean(s.truth), verified: s.verified ?? null,
    source: s.source ?? null, notes: s.notes ? s.notes.slice(0, 400) : null, params: s.defaultParams ? Object.keys(s.defaultParams).sort() : [], module: mod?.file ?? null, export: mod?.name ?? null,
  };
  if (s.transition) (uses[`__screen:${route}`] = { motion: [`mo:transition/${s.transition}`] });
}

// nav target resolution
function resolveTarget(target, fromFile, method) {
  const fromFlow = flowOf(fromFile);
  if (method === 'switchTab') { const fl = allFlows.find((x) => x.tabBar?.tab === target); return fl ? `${fl.id}/${fl.initial}` : null; }
  let t = target.replace(/\?.*$/, '').replace(/^\/+|\/+$/g, '').replace(/^#\//, '');
  if (routes.has(t)) return t;
  if (pageAliases[t]) return pageAliases[t];
  if (screenPaths[t]) return screenPaths[t];
  if (flowById.has(t)) return `${t}/${flowById.get(t).initial}`;
  if (!t.includes('/') && fromFlow && routes.has(`${fromFlow}/${t}`)) return `${fromFlow}/${t}`;
  return null;
}
const navEdges = []; // { file, method, target, to, resolved? }
for (const file of files) {
  for (const n of facts[file].nav) {
    const to = resolveTarget(n.target, file, n.method);
    navEdges.push({ file, method: n.method, target: n.target, to });
    if (!to) find('error', 'nav-target', `${file}: nav.${n.method}('${n.target}') targets no registered route, alias or flow`, file);
  }
}
// Dynamic targets: follow ternaries / ||, consts (`LANDING`) and helper functions that return route strings
// (`draftRoute()`, `routeForPage(p)`) or build one (`acquisitionRoute('payment')` → `noonone/${…}`). Edges found this
// way are marked `resolved` (shown with ~): the code can reach them, but which one depends on runtime state.
function lookup(file, localImports, name) {
  if (facts[file]?.consts[name] != null || facts[file]?.fns[name]) return { file, name };
  const imp = localImports?.[name];
  return imp ? defining(imp.file, imp.imported) : null;
}
function candidates(node, file, localImports, depth = 0) {
  if (!node || depth > 4) return [];
  const v = strOf(node);
  if (v != null) return [v];
  if (node.type === 'ConditionalExpression') return [...candidates(node.consequent, file, localImports, depth + 1), ...candidates(node.alternate, file, localImports, depth + 1)];
  if (node.type === 'LogicalExpression') return [...candidates(node.left, file, localImports, depth + 1), ...candidates(node.right, file, localImports, depth + 1)];
  if (node.type === 'Identifier') { const d = lookup(file, localImports, node.name); const c = d && facts[d.file]?.consts[d.name]; return c != null ? [c] : []; }
  if (node.type === 'CallExpression' && node.callee?.type === 'Identifier') {
    const d = lookup(file, localImports, node.callee.name);
    const fn = d && facts[d.file]?.fns[d.name];
    if (!fn) return [];
    const out = fn.lits.filter((x) => /^[a-z]\w*\/[a-zA-Z]\w*$/.test(x));
    if (fn.prefix) for (const a of node.arguments) for (const c of candidates(a, file, localImports, depth + 1)) out.push(`${fn.prefix}${c}`);
    if (fn.prefix && !out.length) out.push(fn.prefix.slice(0, -1));
    return out;
  }
  return [];
}
for (const file of files) {
  facts[file].navDynamic = facts[file].navDynamic.filter((d) => {
    const to = sortU(candidates(d.node, file, d.localImports).map((c) => resolveTarget(c, file, d.method)).filter(Boolean));
    for (const t of to) navEdges.push({ file, method: d.method, target: d.expr, to: t, resolved: true });
    return !to.length;
  });
}

// closures
const importsOf = (file) => facts[file] ? [...facts[file].imports, ...(facts[file].kind === 'flow' && /\/index\.ts$/.test(file) ? [] : facts[file].dynImports)] : [];
function closure(start) {
  const seen = new Set([start]);
  const q = [start];
  while (q.length) for (const n of importsOf(q.shift())) if (!seen.has(n) && !n.startsWith('src/app/')) { seen.add(n); q.push(n); }
  return seen;
}

// tests
const journeys = [];
for (const jf of readdirSync(join(root, 'scripts/journeys')).filter((x) => x.endsWith('.mjs') && !['lib.mjs', 'report.mjs'].includes(x)).sort()) {
  const text = readFileSync(join(root, 'scripts/journeys', jf), 'utf8');
  let ast;
  try { ast = parseAst(text, { lang: 'js' }); } catch { continue; }
  const def = ast.body.find((s) => s.type === 'ExportDefaultDeclaration')?.declaration;
  for (const el of def?.type === 'ArrayExpression' ? def.elements : []) {
    if (el?.type !== 'ObjectExpression') continue;
    const prop = (k) => strOf(el.properties.find((p) => (p.key?.name ?? p.key?.value) === k)?.value);
    const touched = new Set();
    walkAst(el, (n) => {
      const s = strOf(n);
      if (s == null) return;
      for (const m of s.matchAll(/(?:^|["'\s(=])\/?([a-z]\w*\/[a-zA-Z]\w*)(?=$|[?"'\s\]])/g)) if (routes.has(m[1])) touched.add(m[1]);
      const bare = s.replace(/^\//, '').replace(/\?.*$/, '');
      if (pageAliases[bare]) touched.add(pageAliases[bare]);
    });
    journeys.push({ id: `test:journey/${prop('name')}`, name: prop('name'), area: prop('area'), title: prop('title'), file: `scripts/journeys/${jf}`, routes: sortU(touched) });
  }
}
const manifest = JSON.parse(read('visual/refs/manifest.json'));
const visualRefs = (manifest.refs ?? []).map((r) => ({ id: `test:visual/${r.name}`, name: r.name, route: (r.route ?? '').replace(/\?.*$/, ''), source: r.source ?? null }));

// docs: spec / brief / mapping sections that mention a route (so a skill reads lines, not the file)
const inventory = JSON.parse(read('.claude/resources/inventory.json'));
const invFlow = Object.fromEntries(inventory.flows.map((f) => [f.id, f]));
function sections(path) {
  const text = readIf(path);
  if (!text) return [];
  const lines = text.split('\n');
  const out = [];
  let cur = null;
  let fence = false;
  lines.forEach((l, i) => {
    if (/^```/.test(l)) fence = !fence;
    const h = !fence && l.match(/^(#{2,4})\s+(.+)/);
    if (h) { if (cur) { cur.end = i; out.push(cur); } cur = { heading: h[2].trim(), level: h[1].length, start: i + 1, end: lines.length, text: '' }; }
    if (cur) cur.text += `${l}\n`;
  });
  if (cur) out.push(cur);
  return out.map((s) => ({ path, heading: s.heading, start: s.start, end: s.end, routes: sortU([...s.text.matchAll(/`([a-z]\w*\/[a-zA-Z]\w*)/g)].map((m) => m[1]).filter((r) => routes.has(r))) }));
}
const docSections = {};
for (const f of allFlows) {
  const inv = invFlow[f.id];
  const paths = sortU([...(inv?.docs.specs ?? []), ...(inv?.docs.brief ? [inv.docs.brief.replace(/#.*$/, '')] : []), ...(inv?.docs.mapping ?? [])]);
  for (const p of paths) docSections[p] ??= sections(p);
}

// ── 5. Per-screen summary.
const usedBy = {}; // entity id → Set(route)
const mark = (id, route) => (usedBy[id] ??= new Set()).add(route);
const screenSummary = {};
for (const [route, sc] of Object.entries(screens)) {
  if (!sc.module) continue;
  const cl = closure(sc.module);
  const own = [...cl].filter((x) => flowOf(x) === sc.flow).sort(); // files of the screen's own flow
  const foreign = [...cl].filter((x) => flowOf(x) && flowOf(x) !== sc.flow).sort();
  const pick = (k, list) => sortU(list.flatMap((x) => uses[x]?.[k] ?? []));
  const direct = pick('components', own);
  const shared = direct.filter((c) => components[c]?.kind === 'shared');
  const local = direct.filter((c) => components[c]?.kind === 'local');
  const allComps = pick('components', [...cl]);
  const motion = sortU([...pick('motion', own), ...(sc.transition ? [`mo:transition/${sc.transition}`] : [])]);
  const tokensUsed = pick('tokens', own);
  const nav = navEdges.filter((e) => cl.has(e.file) && e.to).map((e) => ({ to: e.to, method: e.method, via: e.file, ...(e.resolved ? { resolved: true } : {}) }));
  const navOut = [];
  const seenNav = new Set();
  for (const e of nav.sort((a, b) => Number(Boolean(a.resolved)) - Number(Boolean(b.resolved)))) { const k = `${e.method} ${e.to}`; if (!seenNav.has(k)) { seenNav.add(k); navOut.push(e); } }
  navOut.sort((a, b) => a.to.localeCompare(b.to) || a.method.localeCompare(b.method));
  const refs = sortU([...cl].filter((x) => /^src\/(flows|components)\//.test(x)).flatMap((x) => facts[x]?.routeRefs ?? []).filter((r) => r !== route && !seenNav.has(`push ${r}`) && !navOut.some((n) => n.to === r)));
  const tests = sortU([...journeys.filter((j) => j.routes.includes(route)).map((j) => j.id), ...visualRefs.filter((v) => v.route === route).map((v) => v.id)]);
  const docs = Object.values(docSections).flat().filter((s) => s.routes.includes(route)).map((s) => `${s.path}:${s.start}-${s.end}`);
  screenSummary[route] = {
    files: own, foreignFiles: foreign, closureSize: cl.size, shared, local, transitiveComponents: allComps.filter((c) => !direct.includes(c)),
    tokens: tokensUsed, icons: pick('icons', own), assets: pick('assets', own), motion, stores: pick('stores', [...cl].filter((x) => x.startsWith('src/flows/') || x.startsWith('src/kit/DemoStore') || x.startsWith('src/kit/membership'))).filter((s) => s !== 'store:demo' || true),
    data: pick('data', own), navOut, routeRefs: refs, tests, docs,
  };
  for (const id of [...allComps, ...pick('tokens', [...cl]), ...pick('motion', [...cl]), ...motion, ...pick('icons', [...cl]).map((i) => `icon:${i}`), ...pick('assets', [...cl]).map((a) => `asset:${a}`), ...pick('stores', [...cl]), ...pick('data', [...cl])]) mark(id.startsWith('--nk-') ? `tok:${id}` : id, route);
}
const navIn = {};
for (const [route, s] of Object.entries(screenSummary)) for (const n of s.navOut) if (n.to !== route) (navIn[n.to] ??= []).push({ from: route, method: n.method, ...(n.resolved ? { resolved: true } : {}) });

// ── 6. Findings (consistency checks).
for (const file of files) {
  const f = facts[file];
  if (f.parseError) find('warn', 'parse', `${file}: could not parse (${f.parseError})`, file);
  for (const m of sortU(f.missing)) find('warn', 'missing-import', `${file}: import resolves to nothing: ${m}`, file);
  const fl = f.flow;
  if (fl) {
    for (const imp of sortU([...f.imports, ...f.dynImports])) {
      const other = flowOf(imp);
      if (!other || other === fl) continue;
      if (/\/data(\.[\w-]+)?\.ts$/.test(imp)) find('warn', 'cross-flow-data', `${file} imports another flow's data: ${imp} (CLAUDE.md: never import another flow's data.ts)`, file);
      else if (facts[imp]?.kind === 'flow-component') find('info', 'cross-flow-component', `${file} imports ${imp} from flow \`${other}\` (promotion candidate for src/components)`, file);
    }
    for (const ext of sortU(f.externals)) if (/^(lucide|@mui|@radix-ui|styled-components|@emotion|react-icons|@heroicons|antd|@chakra-ui)/.test(ext)) find('warn', 'foreign-ui', `${file} imports ${ext} (no second design system)`, file);
  }
  for (const v of sortU(f.vars)) if (!definedVars.has(v)) find('warn', 'undefined-token', `${file}: uses var(${v.replace(/^--/, '')} (written without the leading --), which no token, flow token or src declaration defines`, file);
}
for (const [id, c] of Object.entries(components)) {
  const by = [...(usedBy[id] ?? [])];
  const flows = sortU(by.map((r) => r.split('/')[0]));
  if (c.kind === 'shared' && !by.length) find('info', 'unused-component', `${id} (${c.file}) is not reached from any registered screen`, id);
  if (c.kind === 'local' && flows.some((x) => x !== c.flow)) find('info', 'promotion-candidate', `${id} is used by screens of ${flows.join(', ')}`, id);
}
const entryRoutes = new Set(allFlows.flatMap((f) => [`${f.id}/${f.initial}`, ...(f.tabBar?.screens ?? []).map((s) => `${f.id}/${s}`)]));
for (const [route, s] of Object.entries(screens)) {
  const reachable = navIn[route]?.length || entryRoutes.has(route) || s.urls.length || Object.values(screenSummary).some((x) => x.routeRefs.includes(route));
  if (!reachable) find('info', 'no-entry', `${route}: no nav call, route string, URL or flow entry leads here (sidebar / direct URL only, or a dynamic route)`, `scr:${route}`);
  const tests = screenSummary[route]?.tests ?? [];
  if (!tests.length) find('info', 'untested', `${route}: only \`check:routes\` covers it (no journey, no visual reference)`, `scr:${route}`);
}
for (const file of files) for (const d of facts[file].navDynamic) find('info', 'nav-dynamic', `${file}: nav.${d.method}(${d.expr}) — dynamic target, not in the graph`, file);
const levelOrder = { error: 0, warn: 1, info: 2 };
findings.sort((a, b) => levelOrder[a.level] - levelOrder[b.level] || a.rule.localeCompare(b.rule) || a.msg.localeCompare(b.msg));

// ── 7. graph.json
const graph = {
  generatedBy: 'scripts/brain/build.mjs',
  readme: '.claude/resources/brain/README.md',
  ids: { flow: 'flow:<id>', screen: 'scr:<flow>/<screen>', component: 'cmp:<Name> (shared) · cmp:<flow>/<Name> (flow-local)', token: 'tok:--nk-<var>', tokenGroup: 'tokgrp:<group>', motion: 'mo:transition/<name> · mo:preset/<group>.<key> · mo:recipe/<Name> · mo:reduced-motion · mo:haptics', icon: 'icon:<origin name>', asset: 'asset:<path>', store: 'store:demo · store:membership · store:<flow>', data: 'data:<export of src/data>', test: 'test:journey/<name> · test:visual/<name> · test:routes', file: '<repo path>' },
  flows: Object.fromEntries(allFlows.map((f) => {
    const inv = invFlow[f.id];
    return [f.id, { title: f.title, group: f.group ?? null, initial: `${f.id}/${f.initial}`, parent: f.parent ?? null, tab: f.tabBar?.tab ?? null, coverage: inv?.coverage ?? null, skills: inv?.docs.skills ?? [], specs: inv?.docs.specs ?? [], brief: inv?.docs.brief ?? null, mapping: inv?.docs.mapping ?? [], tokenVars: flowTokenVars[f.id]?.length ?? 0, screens: f.screens.map((s) => `${f.id}/${s.id}`) }];
  })),
  screens: Object.fromEntries(Object.entries(screens).map(([r, s]) => [r, { ...s, ...screenSummary[r], navIn: (navIn[r] ?? []).sort((a, b) => a.from.localeCompare(b.from)) }])),
  components: Object.fromEntries(Object.entries(components).sort(([a], [b]) => a.localeCompare(b)).map(([id, c]) => [id, { ...c, doc: c.doc.slice(0, 160), usedBy: sortU([...(usedBy[id] ?? [])]), uses: uses[c.file]?.components.filter((x) => x !== id) ?? [] }])),
  tokens: {
    groups: Object.fromEntries(Object.keys(tokens).map((g) => { const vars = Object.keys(tokenGroupOf).filter((v) => tokenGroupOf[v] === g).sort(); return [g, { count: vars.length, used: vars.filter((v) => usedBy[`tok:${v}`]).length }]; })),
    flowTokens: flowTokenVars,
    usedBy: Object.fromEntries(Object.keys(usedBy).filter((k) => k.startsWith('tok:')).sort().map((k) => [k, usedBy[k].size])),
  },
  motion: {
    transitions: Object.fromEntries(transitionNames.map((t) => [t, { file: transitionFiles[t] ?? 'src/motion/transitions.ts', usedBy: sortU([...(usedBy[`mo:transition/${t}`] ?? [])]), defaultFor: Object.entries(screens).filter(([, x]) => !x.transition && x.transitionEffective === t).map(([r]) => r).sort() }])),
    other: Object.fromEntries(Object.keys(usedBy).filter((k) => k.startsWith('mo:') && !k.startsWith('mo:transition/')).sort().map((k) => [k, sortU([...usedBy[k]])])),
  },
  tests: { journeys, visualRefs, routes: { id: 'test:routes', command: 'npm run check:routes', covers: 'every registered screen' } },
  docSections,
  files: Object.fromEntries(files.map((file) => {
    const f = facts[file];
    const u = uses[file];
    const o = { kind: f.kind };
    if (f.flow) o.flow = f.flow;
    const imps = sortU([...f.imports, ...f.dynImports]);
    if (imps.length) o.imports = imps;
    for (const k of ['components', 'tokens', 'icons', 'assets', 'motion', 'stores', 'data']) if (u[k].length) o[k] = u[k];
    const nav = navEdges.filter((e) => e.file === file).map((e) => `${e.method} ${e.to ?? `?${e.target}`}${e.resolved ? '~' : ''}`);
    if (nav.length) o.nav = sortU(nav);
    if (f.routeRefs.length) o.routeRefs = sortU(f.routeRefs);
    return [file, o];
  })),
  findings,
};

// ── 8. Cards (markdown).
const code = (s) => `\`${s}\``;
const list = (a, n = 40) => (a.length ? a.slice(0, n).map(code).join(', ') + (a.length > n ? ` … +${a.length - n}` : '') : '—');
const shortName = (cid) => cid.replace(/^cmp:/, '').replace(/^[a-z]\w*\//, '');
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const trim = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s ?? '');
const HEADER = (what) => `<!-- Generated by scripts/brain/build.mjs from ${what}. Do not edit; run \`npm run brain:build\`. -->`;
const tokenGroupsOf = (vars, flow) => {
  const o = {};
  for (const v of vars) { const g = tokenGroupOf[v] ?? (flowTokenVars[flow]?.includes(v) ? `flow:${flow}` : Object.entries(flowTokenVars).find(([, l]) => l.includes(v))?.[0] ? `flow:${Object.entries(flowTokenVars).find(([, l]) => l.includes(v))[0]}` : 'local'); (o[g] ??= []).push(v); }
  return o;
};

const cards = {};
// flow cards
for (const f of allFlows) {
  const g = graph.flows[f.id];
  const scr = f.screens.map((s) => [`${f.id}/${s.id}`, graph.screens[`${f.id}/${s.id}`]]);
  const outFlows = {};
  const inFlows = {};
  for (const [r, s] of scr) {
    for (const n of s.navOut ?? []) if (!n.to.startsWith(`${f.id}/`)) (outFlows[n.to] ??= new Set()).add(r);
    for (const n of s.navIn ?? []) if (!n.from.startsWith(`${f.id}/`)) (inFlows[n.from] ??= new Set()).add(r);
  }
  const L = [`# ${f.id} · ${f.title} (flow card)`, '', HEADER('the registry and the flow\'s source'), ''];
  L.push(`**flow:${f.id}** · group ${f.group ?? '—'} · initial ${code(g.initial)}${g.parent ? ` · parent ${code(g.parent)}` : ''}${g.tab ? ` · tab \`${g.tab}\`` : ''} · coverage ${g.coverage}`, '');
  L.push(`- Docs: ${[...g.skills, ...g.specs, ...(g.brief ? [g.brief] : []), ...g.mapping].map(code).join(' · ') || '—'}`);
  L.push(`- Folder: ${code(`src/flows/${f.id}/`)} · tokens ${code(`src/flows/${f.id}/tokens.ts`)} (${g.tokenVars} flow vars)${existsSync(join(root, `src/flows/${f.id}/store.ts`)) ? ` · store ${code(`src/flows/${f.id}/store.ts`)}` : ''}`);
  const flowDir = join(root, `src/flows/${f.id}`);
  const areaFiles = readdirSync(flowDir).filter((x) => /^(data|tokens)\.[\w-]+\.ts$|^(store|motion|assets|scrollStates|transitions|links)\.ts$/.test(x)).sort();
  if (areaFiles.length) L.push(`- Area data / token / helper files: ${areaFiles.join(', ')}`);
  L.push(`- Enters from: ${Object.entries(inFlows).sort().map(([from, to]) => `${code(from)} → ${[...to].map((x) => x.split('/')[1]).join(', ')}`).join(' · ') || '—'}`);
  L.push(`- Exits to: ${Object.entries(outFlows).sort().map(([to, from]) => `${code(to)} (from ${[...from].map((x) => x.split('/')[1]).join(', ')})`).join(' · ') || '—'}`);
  L.push('', '## Screens', '', '| Screen | Presentation | URL | Truth · verified | Module | Tests |', '|---|---|---|---|---|---|');
  for (const [r, s] of scr) L.push(`| ${code(`scr:${r}`)} ${cell(s.title)} | ${s.presentation}${s.sheet ? ` (${s.sheet})` : ''}${s.transition ? ` · ${s.transition}` : ''} | ${s.urls.join(' ') || '—'} | ${s.truth}${s.truthExplicit ? '' : '*'} · ${s.verified ?? 'never'} | ${s.module ? code(`${s.module.replace(`src/flows/${f.id}/`, '')}`) : '?'}${s.params.length ? ` (${s.params.join(', ')})` : ''} | ${s.tests?.length ?? 0} |`);
  L.push('', '`*` truth inferred from `source`. Tests = journeys + visual references (every screen also runs in `check:routes`). In nav lines, `~` = target resolved through a const / helper / ternary (reachable, runtime-dependent); no mark = a literal `nav.*(\'…\')` call.', '');
  const byModule = {};
  for (const [r, s] of scr) (byModule[s.module ?? '?'] ??= []).push([r, s]);
  for (const [mod, list2] of Object.entries(byModule)) {
    const [, s] = list2[0];
    L.push(`## ${list2.map(([r]) => code(r)).join(' · ')}`, '');
    L.push(`- Module ${code(mod)}${list2.length > 1 ? ` (shared by ${list2.length} screens; params pick the state)` : ''} · ${s.files?.length ?? 0} own files, ${s.closureSize ?? 0} in the import closure${s.foreignFiles?.length ? ` · **imports from other flows:** ${list(s.foreignFiles, 6)}` : ''}`);
    L.push(`- Source: ${cell(trim(s.source ?? '—', 220))}`);
    const ownBy = (re) => sortU((s.files ?? []).filter((x) => x !== mod && re.test(x)).map((x) => x.replace(`src/flows/${f.id}/`, '')));
    const styles = ownBy(/\.css$/);
    const helpers = ownBy(/\.ts$/).filter((x) => !/^components\//.test(x) || !/[A-Z]/.test(x.split('/').pop()[0]));
    if (styles.length) L.push(`- Styles: ${styles.join(', ')}`);
    if (helpers.length) L.push(`- Data / helpers: ${helpers.join(', ')}`);
    L.push(`- Shared components: ${list((s.shared ?? []).map(shortName))}`);
    L.push(`- Flow components: ${list((s.local ?? []).map(shortName))}`);
    const tg = tokenGroupsOf(s.tokens ?? [], f.id);
    L.push(`- Tokens (${s.tokens?.length ?? 0}): ${Object.entries(tg).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k} ${v.length}`).join(' · ') || '—'}`);
    if (s.motion?.length) L.push(`- Motion: ${list(s.motion.map((m) => m.replace(/^mo:/, '')))}`);
    if (s.icons?.length || s.assets?.length) L.push(`- Icons: ${list(s.icons ?? [], 20)} · assets ${s.assets?.length ?? 0}`);
    if (s.stores?.length || s.data?.length) L.push(`- State / data: ${list([...(s.stores ?? []), ...(s.data ?? [])], 20)}`);
    const navs = s.navOut ?? [];
    if (navs.length) L.push(`- Nav out: ${navs.map((n) => `${n.method} ${code(n.to)}${n.resolved ? '~' : ''}${flowOf(n.via) === f.id ? '' : ` (via ${n.via.split('/').pop().replace(/\.tsx?$/, '')})`}`).join(' · ')}`);
    if (s.routeRefs?.length) L.push(`- Route strings (data-driven links): ${list(s.routeRefs, 20)}`);
    for (const [r, x] of list2) {
      const extra = [];
      if (x.navIn?.length) extra.push(`in ← ${x.navIn.map((n) => code(n.from)).join(', ')}`);
      if (x.tests?.length) extra.push(`tests ${x.tests.map(code).join(', ')}`);
      if (x.docs?.length) extra.push(`docs ${x.docs.map(code).join(', ')}`);
      if (extra.length) L.push(`- ${code(r.split('/')[1])}: ${extra.join(' · ')}`);
    }
    L.push('');
  }
  cards[`flows/${f.id}.md`] = L.join('\n');
}

// components card
{
  const L = ['# Components (layer card)', '', HEADER('component-api.generated.json and the import graph'), '', 'Props and variants: `.claude/skills/noon-ui/references/component-api.generated.md` (search the name). Usage rules: `.claude/skills/noon-ui/references/components.md`. Impact of a change: `npm run brain -- impact cmp:<Name>`.', '', '## Shared (`src/components`)', '', '| Component | File | Screens | Flows | Uses |', '|---|---|---|---|---|'];
  for (const [id, c] of Object.entries(graph.components).filter(([, c]) => c.kind === 'shared')) {
    const flows = sortU(c.usedBy.map((r) => r.split('/')[0]));
    L.push(`| ${code(id)} | ${code(`${c.file}:${c.line}`)} | ${c.usedBy.length} | ${flows.join(', ') || '—'} | ${c.uses.map(shortName).join(', ') || '—'} |`);
  }
  L.push('', '## Flow-local (`src/flows/<flow>/components`)', '', 'One line per flow: components and how many screens reach each. Used outside its flow = promotion candidate (see findings.md).', '');
  const byFlow = {};
  for (const [id, c] of Object.entries(graph.components)) if (c.kind === 'local') (byFlow[c.flow] ??= []).push([id, c]);
  for (const [fl, l] of Object.entries(byFlow).sort()) L.push(`- **${fl}** (${l.length}): ${l.map(([id, c]) => `${shortName(id)}${c.usedBy.length ? ` ${c.usedBy.length}` : ' 0'}`).join(', ')}`);
  L.push('');
  cards['components.md'] = L.join('\n');
}
// tokens card
{
  const L = ['# Tokens (layer card)', '', HEADER('src/foundations/tokens.ts, flow tokens and every var() / ref.* / <Text> use'), '', 'Values, meaning and Figma mapping: `.claude/skills/noon-ui/references/tokens.md`. Literal → token: `scripts/token-map.json`. Usage counts are screens whose import closure reads the token.', '', '| Group | CSS prefix | Tokens | Used | Most used |', '|---|---|---|---|---|'];
  for (const [g, v] of Object.entries(graph.tokens.groups)) {
    const vars = Object.keys(tokenGroupOf).filter((x) => tokenGroupOf[x] === g);
    const top = vars.map((x) => [x, usedBy[`tok:${x}`]?.size ?? 0]).filter(([, n]) => n).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 4);
    const pre = vars[0]?.replace(/-[^-]+$/, '-') ?? '';
    L.push(`| ${code(`tokgrp:${g}`)} | ${code(pre.replace(/(--nk-[a-z]+(?:-[a-z]+)?-).*/, '$1'))} | ${v.count} | ${v.used} | ${top.map(([x, n]) => `${code(x)} ${n}`).join(', ') || '—'} |`);
  }
  L.push('', '## Flow token sets', '', '| Flow | Vars | File |', '|---|---|---|');
  for (const [fl, vars] of Object.entries(flowTokenVars).sort()) L.push(`| ${code(`flow:${fl}`)} | ${vars.length} | ${code(`src/flows/${fl}/tokens.ts`)} |`);
  const unused = Object.keys(tokenGroupOf).filter((v) => !usedBy[`tok:${v}`] && !['palette'].includes(tokenGroupOf[v])).sort();
  L.push('', `## Central tokens no screen reads (${unused.length}, palette excluded)`, '', 'Candidates for cleanup only after a search: a token can be read by a consumer app, the dev preview or a dynamic key.', '', list(unused, 400), '');
  cards['tokens.md'] = L.join('\n');
}
// motion card
{
  const L = ['# Motion (layer card)', '', HEADER('src/motion and every transition / preset / recipe use'), '', 'Values and recipes: `.claude/skills/noon-ui/references/motion.md` · per-flow motion and reduced-motion behaviour: `motion-matrix.md`. Reduced motion is kit-wide (`reducedTransition`, `data-nk-motion="reduce"`, `useReduceMotion()`).', '', '## Screen transitions', '', '| Transition | Defined in | Opened with it (ScreenDef or nav option) | Default for (no explicit transition; Navigator: sheet → sheet, modal → modal, else push) |', '|---|---|---|---|'];
  for (const [t, v] of Object.entries(graph.motion.transitions)) L.push(`| ${code(`mo:transition/${t}`)} | ${code(v.file)} | ${v.usedBy.length ? list(v.usedBy, 12) : '—'} | ${v.defaultFor.length ? `${v.defaultFor.length} screens` : '—'} |`);
  L.push('', '## Presets, recipes, reduced motion, haptics', '', '| Id | Screens | Flows |', '|---|---|---|');
  for (const [k, l] of Object.entries(graph.motion.other)) L.push(`| ${code(k)} | ${l.length} | ${sortU(l.map((r) => r.split('/')[0])).join(', ')} |`);
  L.push('');
  cards['motion.md'] = L.join('\n');
}
// journeys card
{
  const L = ['# Journeys and tests (layer card)', '', HEADER('nav calls, route strings, scripts/journeys and visual/refs'), '', '## Flow-to-flow navigation', '', 'Edges come from static `nav.*(\'…\')` calls in each screen\'s import closure (dynamic targets are listed in findings.md as `nav-dynamic`). Shortest path between two screens: `npm run brain -- path <from> <to>`.', '', '| From flow | → To flows |', '|---|---|'];
  const ff = {};
  for (const [r, s] of Object.entries(graph.screens)) for (const n of s.navOut ?? []) { const a = r.split('/')[0]; const b = n.to.split('/')[0]; if (a !== b) (ff[a] ??= new Set()).add(b); }
  for (const [a, b] of Object.entries(ff).sort()) L.push(`| ${code(a)} | ${sortU([...b]).join(', ')} |`);
  L.push('', '## Journey tests (`npm run test:journeys`)', '', '| Test | Area | Routes it touches |', '|---|---|---|');
  for (const j of journeys) L.push(`| ${code(j.id)} ${cell(trim(j.title, 90))} | ${j.area} | ${list(j.routes, 10)} |`);
  L.push('', '## Visual references (`npm run visual:ref`)', '', '| Test | Route | Reference |', '|---|---|---|');
  for (const v of visualRefs) L.push(`| ${code(v.id)} | ${code(v.route)} | ${cell(v.source ?? '—')} |`);
  const flowsT = allFlows.map((f) => { const sc = f.screens.map((s) => graph.screens[`${f.id}/${s.id}`]); return [f.id, sc.filter((s) => s.tests?.length).length, sc.length, sc.filter((s) => s.verified).length]; });
  L.push('', '## Coverage per flow', '', '| Flow | Screens with a journey / visual test | Verified side by side |', '|---|---|---|');
  for (const [id, t, n, v] of flowsT) L.push(`| ${code(id)} | ${t}/${n} | ${v}/${n} |`);
  L.push('');
  cards['journeys.md'] = L.join('\n');
}
// findings card
{
  const by = {};
  for (const x of findings) (by[`${x.level} · ${x.rule}`] ??= []).push(x);
  const L = ['# Findings (generated consistency report)', '', HEADER('the graph'), '', '`error` fails `npm run brain:check` (and `skill:check`); `warn` and `info` are for review. Each line is a fact the generator found, not a judgement: open the file before acting.', '', '| Level · rule | Count |', '|---|---|'];
  for (const [k, l] of Object.entries(by)) L.push(`| ${k} | ${l.length} |`);
  for (const [k, l] of Object.entries(by)) { L.push('', `## ${k}`, ''); for (const x of l.slice(0, 80)) L.push(`- ${x.msg}`); if (l.length > 80) L.push(`- … +${l.length - 80} more (graph.json → findings)`); }
  L.push('');
  cards['findings.md'] = L.join('\n');
}
// index
{
  const groups = {};
  for (const f of allFlows) (groups[f.group ?? 'Other'] ??= []).push(f);
  const nScreens = Object.keys(screens).length;
  const errors = findings.filter((x) => x.level === 'error').length;
  const L = ['# Brain map index', '', HEADER('the registry and the graph'), '',
    `${allFlows.length} flows · ${nScreens} screens · ${api.shared.length} shared + ${api.flowLocal.length} flow-local components · ${Object.keys(tokenGroupOf).length} central tokens · ${transitionNames.length} transitions · ${journeys.length} journeys · ${visualRefs.length} visual refs · ${findings.length} findings (${errors} errors).`, '',
    'Start here, then load **one** flow card, then only the files it names. How to retrieve, the ID scheme and the impact workflow: `README.md` (this folder). Query instead of reading: `npm run brain -- context "<request>"`.', '',
    '## Product areas and flows', '', '| Area | Flow | Entry | URL | Screens | Skill / coverage | Card |', '|---|---|---|---|---|---|---|'];
  for (const [grp, fl] of Object.entries(groups)) for (const f of fl) {
    const g = graph.flows[f.id];
    const url = graph.screens[g.initial]?.urls?.[0] ?? '—';
    L.push(`| ${grp} | ${code(`flow:${f.id}`)} ${cell(f.title)} | ${code(g.initial)} | ${url} | ${f.screens.length} | ${g.skills.map((s) => `/${s.split('/')[2]}`).join(' ') || '—'} ${g.coverage} | ${code(`flows/${f.id}.md`)} |`);
  }
  L.push('', '## Shell and shared layers', '', '| Layer | What | Card / source |', '|---|---|---|',
    '| Navigation | `useNav()` push / sheet / back / replace / reset / switchTab · URL aliases · tab bar | `src/kit/Navigator.tsx`, `src/kit/routes.ts`, `journeys.md` |',
    '| Layout | `<Screen header footer>`, `<Header>`, sheets (`SheetHeader` / `SheetBody` / `SheetFooter`) | `components.md`, `../../skills/noon-ui/references/screen-recipes.md` |',
    '| Design system | tokens, type, colour, spacing, radius, component tokens | `tokens.md`, `../../skills/noon-ui/references/tokens.md` |',
    '| Components | shared + flow-local, props, who uses what | `components.md`, `../../skills/noon-ui/references/component-api.generated.md` |',
    '| Motion | transitions, presets, recipes, reduced motion, haptics | `motion.md`, `../../skills/noon-ui/references/motion.md` |',
    '| State | `store:demo` (cart, wishlist, coupon), `store:membership`, `store:<flow>` | `src/kit/DemoStore.tsx`, `src/kit/membership.ts` |',
    '| Data | products, catalogue, categories, variants, user, money (`data:<export>`) | `src/data/README.md` |',
    '| Validation | journeys, visual refs, check:routes, token lint, skill:check | `journeys.md`, `README.md` → Validation |',
    '| Consistency | broken links, cross-flow imports, undefined tokens, untested screens | `findings.md` |', '');
  cards['INDEX.md'] = L.join('\n');
}

// Counts in the cards are per screen / per module, not flow totals: mark them for scripts/check-inventory.mjs.
for (const k of Object.keys(cards)) cards[k] = cards[k].split('\n').map((l) => (/\b\d+\s+(screens?|flows?|routes?)\b/i.test(l) && !l.startsWith('<!--') ? `${l} <!-- count-ok -->` : l)).join('\n');
const outputs = { 'graph.json': `${JSON.stringify(graph)}\n`, ...cards };
const errorCount = findings.filter((x) => x.level === 'error').length;
if (check) {
  // graph.json is a local build artefact (gitignored, rebuilt by `npm run brain`); the cards are committed and checked
  const stale = Object.entries(outputs).filter(([p]) => p !== 'graph.json').filter(([p, t]) => (existsSync(join(outDir, p)) ? readFileSync(join(outDir, p), 'utf8') : '') !== t).map(([p]) => p);
  const existing = existsSync(join(outDir, 'flows')) ? readdirSync(join(outDir, 'flows')).map((x) => `flows/${x}`) : [];
  const extra = existing.filter((p) => !outputs[p]);
  if (stale.length || extra.length) { console.log(`✗ brain map out of date (${[...stale, ...extra.map((x) => `${x} (remove)`)].join(', ')}): run npm run brain:build`); process.exit(1); }
  if (errorCount) { console.log(`✗ brain map: ${errorCount} error finding(s) — see .claude/resources/brain/findings.md`); for (const x of findings.filter((y) => y.level === 'error')) console.log(`  - ${x.msg}`); process.exit(1); }
  console.log(`✓ brain map current (${Object.keys(screens).length} screens, ${findings.length} findings, 0 errors)`);
} else {
  if (existsSync(join(outDir, 'flows'))) rmSync(join(outDir, 'flows'), { recursive: true });
  mkdirSync(join(outDir, 'flows'), { recursive: true });
  for (const [p, t] of Object.entries(outputs)) writeFileSync(join(outDir, p), t);
  console.log(`wrote .claude/resources/brain/ (${Object.keys(outputs).length} files; ${findings.length} findings, ${errorCount} errors)`);
}
