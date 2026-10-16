#!/usr/bin/env node
// Component API extractor: the real props of every component, read from the TypeScript checker (not from docs).
//
//   node scripts/component-api.mjs            write .claude/skills/noon-ui/references/component-api.generated.{md,json}
//   node scripts/component-api.mjs --check    exit 1 if the generated files are out of date (npm run skill:check runs this)
//   node scripts/component-api.mjs --stdout   print the JSON instead of writing files
//
// Shared components = every value export of src/components/index.ts whose type is callable with one props object and
// whose name starts with a capital letter. For each: file, JSDoc, props (name, declared type text, optional, default
// from the parameter destructuring or an `@default` tag, JSDoc) and variants (props whose resolved type is a union of
// string literals). Props inherited from outside src/ (HTML / motion props) are summarised as `inherits`, not listed.
// Flow-local components = exported capitalised functions in src/flows/<flow>/components/**: name, file, prop names —
// the index you search before creating a component (see components.md "Search before you create").
//
// Uses the TypeScript 7 API (`typescript/unstable/sync`, the tsgo server). `import { extractComponentApi }` to reuse it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '.claude/skills/noon-ui/references');
const OUT_JSON = path.join(outDir, 'component-api.generated.json');
const OUT_MD = path.join(outDir, 'component-api.generated.md');

const relOf = (p) => path.relative(root, p).split(path.sep).join('/');
/** the API reports case-folded paths on case-insensitive file systems: map them back to the real spelling */
const realFiles = new Map();
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) realFiles.set(p.toLowerCase(), p);
  }
})(path.join(root, 'src'));
const realPath = (p) => realFiles.get(String(p).toLowerCase()) ?? String(p);
const inSrc = (p) => String(p).toLowerCase().startsWith(path.join(root, 'src').toLowerCase() + path.sep);
const COMMON_DOM = ['className', 'style', 'onClick', 'disabled', 'role', 'aria-label', 'id', 'initial', 'animate', 'exit', 'transition', 'whileTap', 'layout'];
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

export async function extractComponentApi() {
  const { API, SymbolFlags, SignatureKind } = await import(pathToFileURL(path.join(root, 'node_modules/typescript/dist/api/sync/api.js')).href);
  const { SyntaxKind } = await import(pathToFileURL(path.join(root, 'node_modules/typescript/dist/ast/index.js')).href);
  const api = new API({ cwd: root });
  try {
    const snap = api.updateSnapshot({ openProject: path.join(root, 'tsconfig.json') });
    const proj = snap.getProjects()[0];
    const { checker, program } = proj;
    const sourceText = new Map();
    const textOf = (file) => {
      const real = realPath(file);
      if (!sourceText.has(real)) sourceText.set(real, fs.readFileSync(real, 'utf8'));
      return sourceText.get(real);
    };
    const nodeOf = (handle) => {
      try {
        return handle?.resolve(proj);
      } catch {
        return undefined;
      }
    };
    const lineOf = (file, pos) => {
      const t = textOf(file);
      // skip leading trivia so the line is the declaration's, not the comment's
      let i = pos;
      while (i < t.length && /\s/.test(t[i])) i++;
      if (t.startsWith('/*', i)) i = t.indexOf('*/', i) + 2;
      while (i < t.length && /\s/.test(t[i])) i++;
      return t.slice(0, i).split('\n').length;
    };
    const inheritedNames = new Set(); // every DOM / React / motion prop name some component inherits (validators accept these)
    const resolveAlias = (s) => (s.flags & SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s);

    /** first function-like node (the component body) inside a declaration: function X() / const X = forwardRef(function X() …) */
    function findFunction(node) {
      if (!node) return undefined;
      if ([SyntaxKind.FunctionDeclaration, SyntaxKind.FunctionExpression, SyntaxKind.ArrowFunction].includes(node.kind)) return node;
      let found;
      node.forEachChild((c) => {
        if (!found) found = findFunction(c);
        return found;
      });
      return found;
    }
    /** defaults from `({ a = 1, b: alias = 'x' }: Props)` */
    function defaultsOf(fn) {
      const out = {};
      const param = fn?.parameters?.[0];
      if (!param || param.name?.kind !== SyntaxKind.ObjectBindingPattern) return out;
      for (const el of param.name.elements) {
        if (!el.initializer) continue;
        const key = el.propertyName ? el.propertyName.getText() : el.name.getText();
        out[key] = clean(el.initializer.getText());
      }
      return out;
    }

    function componentFrom(sym, exportName) {
      const target = resolveAlias(sym);
      if (!(target.flags & (SymbolFlags.Function | SymbolFlags.Variable))) return undefined;
      if (!/^[A-Z]/.test(exportName)) return undefined;
      const type = checker.getTypeOfSymbol(target);
      if (!type) return undefined;
      const sigs = checker.getSignaturesOfType(type, SignatureKind.Call);
      if (!sigs.length) return undefined;
      const params = sigs[0].getParameters();
      if (params.length > 2) return undefined; // (props, ref?) — anything else is a helper, not a component
      const decl = target.valueDeclaration ?? target.declarations[0];
      const file = realPath(decl.path);
      if (!inSrc(file)) return undefined;
      const declNode = nodeOf(decl);
      const fn = findFunction(declNode);
      const defaults = defaultsOf(fn);
      const component = {
        name: exportName,
        file: relOf(file),
        line: declNode ? lineOf(file, declNode.pos) : undefined,
        doc: clean(target.getDocumentationComment(checker)),
        generic: !!sigs[0].getTypeParameters().length,
        forwardRef: !!declNode && /\bforwardRef\s*[<(]/.test(declNode.getText()),
        props: [],
        variants: {},
        inherits: [],
      };
      if (!params.length) return component;
      const propsType = checker.getTypeOfSymbol(params[0]);
      if (!propsType) return component;
      const propsDecl = params[0].valueDeclaration && nodeOf(params[0].valueDeclaration);
      const annotation = propsDecl?.type ? clean(propsDecl.type.getText()) : '';
      const fwd = declNode?.getText().match(/\bforwardRef\s*<[^,>]+,\s*([A-Z]\w*)\s*>/);
      if (fwd) component.propsType = fwd[1];
      else if (/^[A-Z]\w+(<[^>]*>)?$/.test(annotation)) component.propsType = annotation;
      let external = 0;
      const externalNames = [];
      for (const p of checker.getPropertiesOfType(propsType)) {
        const pd = p.declarations?.[0];
        if (p.name === 'key' || p.name === 'ref') continue; // React's own; `forwardRef` says when a ref is forwarded
        if (!pd || !inSrc(pd.path)) {
          // React / motion / DOM props (HTMLMotionProps, HTMLAttributes …): counted, not listed
          external++;
          inheritedNames.add(p.name);
          if (COMMON_DOM.includes(p.name)) externalNames.push(p.name);
          continue;
        }
        const pn = nodeOf(pd);
        const pType = checker.getTypeOfSymbol(p);
        const declared = pn?.type ? clean(pn.type.getText()) : pType ? clean(checker.typeToString(pType)) : '';
        // the interface / type alias that declares the prop (inline `{ … }` props have none)
        const owner = pn?.parent;
        const ownerName =
          owner?.kind === SyntaxKind.InterfaceDeclaration ? owner.name.getText() : owner?.kind === SyntaxKind.TypeLiteral && owner.parent?.kind === SyntaxKind.TypeAliasDeclaration ? owner.parent.name.getText() : undefined;
        const tags = p.getJsDocTags(checker) ?? [];
        const defTag = tags.find((t) => t.name === 'default' || t.name === 'defaultValue');
        const tagText = (t) => clean(Array.isArray(t.text) ? t.text.map((x) => x.text).join('') : t.text);
        const prop = {
          name: p.name,
          type: declared,
          optional: !!(p.flags & SymbolFlags.Optional),
          default: defaults[p.name] ?? (defTag ? tagText(defTag) : undefined),
          doc: clean(p.getDocumentationComment(checker)) || undefined,
        };
        // forwardRef / memo components have no annotation on the outer signature: the first declaring interface names the props
        if (!component.propsType && ownerName && !component.props.length) component.propsType = ownerName;
        if (ownerName && component.propsType && ownerName !== component.propsType.replace(/<.*$/, '')) prop.from = ownerName;
        if (prop.default === undefined) delete prop.default;
        if (prop.doc === undefined) delete prop.doc;
        component.props.push(prop);
        // variants: a union made only of string literals (plus undefined)
        const base = pType && (checker.getNonNullableType(pType) ?? pType);
        const members = base?.isUnionType?.() ? base.getTypes() : base?.isStringLiteralType?.() ? [base] : [];
        // (not for props typed by React / CSS types: `align?: CSSProperties['textAlign']` is not a kit variant)
        if (members.length && members.every((m) => m.isStringLiteralType()) && !/CSSProperties|React\.|HTML/.test(declared)) {
          const values = members.map((m) => String(m.value));
          if (values.length <= 24) component.variants[p.name] = values;
        }
      }
      if (external) component.inherits = { count: external, examples: COMMON_DOM.filter((n) => externalNames.includes(n)) };
      else delete component.inherits;
      if (!Object.keys(component.variants).length) delete component.variants;
      return component;
    }

    function exportsOf(file) {
      const sf = program.getSourceFile(file);
      if (!sf) return [];
      const mod = checker.getSymbolAtLocation(sf);
      if (!mod) return [];
      return checker.getExportsOfModule(mod);
    }

    // Shared components (the package surface).
    const shared = [];
    for (const sym of exportsOf(path.join(root, 'src/components/index.ts'))) {
      const c = componentFrom(sym, sym.name);
      if (c) shared.push(c);
    }
    shared.sort((a, b) => a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0));

    // Flow-local components (src/flows/<flow>/components/**).
    const flowLocal = [];
    const flowsDir = path.join(root, 'src/flows');
    for (const flow of fs.readdirSync(flowsDir).sort()) {
      const dir = path.join(flowsDir, flow, 'components');
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir, { recursive: true }).filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.d.ts')).sort();
      for (const f of files) {
        for (const sym of exportsOf(path.join(dir, f))) {
          const c = componentFrom(sym, sym.name);
          if (!c || c.file !== relOf(path.join(dir, f))) continue; // skip re-exports
          flowLocal.push({ flow, name: c.name, file: c.file, line: c.line, doc: c.doc ? c.doc.split(/(?<=\.)\s/)[0].slice(0, 160) : undefined, props: c.props.map((p) => p.name), ...(c.variants ? { variants: c.variants } : {}) });
        }
      }
    }
    return { generatedBy: 'scripts/component-api.mjs', shared, flowLocal, inheritedPropNames: [...inheritedNames].sort() };
  } finally {
    api.close();
  }
}

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
/** inline code that survives backticks inside the value (template-literal defaults) */
const code = (s) => (String(s).includes('`') ? `\`\` ${esc(s)} \`\`` : `\`${esc(s)}\``);
export function renderMarkdown(data) {
  const L = [];
  L.push('# Component API (generated)');
  L.push('');
  L.push('<!-- Generated by scripts/component-api.mjs from the TypeScript checker. Do not edit: run `node scripts/component-api.mjs`. -->');
  L.push('');
  L.push('The source of truth for component **names, props, types, defaults and variants**. Hand-written guidance (when to use, gotchas, examples) is in `components.md`; when the two disagree, this file is right and `components.md` is stale.');
  L.push('');
  L.push(`${data.shared.length} shared components exported from \`src/components/index.ts\` · ${data.flowLocal.length} flow-local components in \`src/flows/*/components/\`. "—" = no static default; \`?\` = optional. Variants = props typed as a union of string literals.`);
  L.push('');
  L.push('## Shared components');
  L.push('');
  for (const c of data.shared) {
    L.push(`### ${c.name}`);
    L.push('');
    const bits = [`\`${c.file}:${c.line}\``];
    if (c.propsType) bits.push(`props \`${c.propsType}\``);
    if (c.forwardRef) bits.push('forwardRef');
    if (c.generic) bits.push('generic');
    L.push(bits.join(' · '));
    if (c.doc) L.push('', c.doc);
    L.push('');
    if (c.props.length) {
      L.push('| Prop | Type | Default | Notes |', '|---|---|---|---|');
      for (const p of c.props) L.push(`| \`${p.name}${p.optional ? '?' : ''}\` | ${code(p.type)} | ${p.default !== undefined ? code(p.default) : '—'} | ${esc([p.from ? `from ${p.from}` : '', p.doc ?? ''].filter(Boolean).join('; '))} |`);
    } else L.push('No props.');
    if (c.inherits) L.push('', `Also accepts ${c.inherits.count} inherited DOM / React / motion props (not listed${c.inherits.examples.length ? `; e.g. ${c.inherits.examples.map((n) => `\`${n}\``).join(' ')}` : ''}).`);
    if (c.variants) {
      L.push('', 'Variants:');
      for (const [k, v] of Object.entries(c.variants)) L.push(`- \`${k}\`: ${v.map((x) => `\`${x}\``).join(' · ')}`);
    }
    L.push('');
  }
  L.push('## Flow-local components');
  L.push('');
  L.push('Search these before you create a component (`components.md` → "Search before you create"). A flow-local component another flow needs is a promotion candidate, not something to copy.');
  L.push('');
  L.push('| Flow | Component | File | Props |', '|---|---|---|---|');
  for (const c of data.flowLocal) L.push(`| ${c.flow} | \`${c.name}\` | \`${c.file}:${c.line}\` | ${c.props.length ? c.props.map((p) => `\`${p}\``).join(' ') : '—'} |`);
  L.push('');
  // JSDoc quotes bappzaar source paths (`src/components/HtmlView/styles.ts`): declare the ones not in this repo as
  // external citations so `npm run skill:check` doesn't read them as broken repo paths.
  const external = new Set();
  const docs = [...data.shared.flatMap((c) => [c.doc, ...c.props.map((p) => p.doc)]), ...data.flowLocal.map((c) => c.doc)];
  for (const d of docs) for (const [, span] of String(d ?? '').matchAll(/`([^`\n]+)`/g)) {
    for (const cand of [span, ...span.split(/\s+/)]) {
      const p = cand.replace(/[),.;:]+$/, '').replace(/#.*$/, '').replace(/:\d+$/, '');
      if (/^(src|scripts|marketplaces)\//.test(p) && !/[*<>{}]/.test(p) && !['', '.ts', '.tsx', '/index.ts'].some((x) => fs.existsSync(path.join(root, p + x)))) external.add(p);
    }
  }
  if (external.size) L.push(`<!-- external: ${[...external].sort().join(', ')} -->`, '');
  return L.join('\n');
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const t0 = Date.now();
  const data = await extractComponentApi();
  const json = JSON.stringify(data, null, 2) + '\n';
  const md = renderMarkdown(data);
  if (process.argv.includes('--stdout')) {
    process.stdout.write(json);
  } else if (process.argv.includes('--check')) {
    const same = (f, s) => fs.existsSync(f) && fs.readFileSync(f, 'utf8') === s;
    if (!same(OUT_JSON, json) || !same(OUT_MD, md)) {
      console.error('✗ component-api.generated.{md,json} are out of date: run node scripts/component-api.mjs');
      process.exit(1);
    }
    console.log(`✓ component API current (${data.shared.length} shared, ${data.flowLocal.length} flow-local)`);
  } else {
    fs.writeFileSync(OUT_JSON, json);
    fs.writeFileSync(OUT_MD, md);
    const nProps = data.shared.reduce((n, c) => n + c.props.length, 0);
    console.log(`✓ ${relOf(OUT_MD)} (+ .json): ${data.shared.length} shared components, ${nProps} props, ${data.flowLocal.length} flow-local components · ${Date.now() - t0}ms`);
  }
}
