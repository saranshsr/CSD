#!/usr/bin/env node
// Builds the distributable plugin from the canonical skills:  npm run release:build   (--check: exit 1 when stale)
//
//   .claude/skills/<skill>/        canonical skills (SKILL.md, spec.md, references/, templates/)   ─┐
//   .claude/resources/**/*.md      canonical shared knowledge (brain map cards, briefs, indexes)   ─┤ copied, never edited
//                                                                                                     ▼
//   plugins/noon-ui/.claude-plugin/plugin.json      Claude Code plugin manifest (version = package.json version)
//   plugins/noon-ui/skills/<skill>/                 one Agent Skills folder per skill (standard SKILL.md)
//   plugins/noon-ui/skills/noon-ui/resources/       the shared knowledge, bundled once, inside the hub skill
//   .claude-plugin/marketplace.json                 the GitHub marketplace that lists the plugin
//
// Every path token in the copied markdown (backtick spans and link targets) that points at a bundled file is
// rewritten relative to its skill's folder (`../noon-ui/resources/brain/INDEX.md`), so the package resolves on its
// own. Paths to files that are not bundled (src/, scripts/, visual/, the skill scripts) stay repo-root paths: they
// refer to the noon Flow Kit repo, which each SKILL.md says in its "Package" note. Scripts and evals are not
// bundled (they need the repo). Nothing here is hand-edited; scripts/release/check.mjs verifies the result.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const check = process.argv.includes('--check');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const PLUGIN = 'noon-ui';
const MARKETPLACE = 'noon-flow-kit';
const REPO = 'arnabdebnath07/noon-app-skill';
const pluginDir = join(root, 'plugins', PLUGIN);
const skillsSrc = join(root, '.claude/skills');
const resourcesSrc = join(root, '.claude/resources');
const rel = (from, to) => relative(from, to).split('\\').join('/');

const skills = readdirSync(skillsSrc).filter((d) => existsSync(join(skillsSrc, d, 'SKILL.md'))).sort();
const EXCLUDE_DIRS = new Set(['scripts', 'evals', 'node_modules']);

function files(dir, filter) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return EXCLUDE_DIRS.has(e.name) ? [] : files(p, filter);
    return filter(p) ? [p] : [];
  }).sort();
}

// source file → package path, and the skill folder each package file belongs to
const map = new Map();
const baseOf = new Map(); // package path → package skill folder
for (const s of skills) for (const f of files(join(skillsSrc, s), (p) => /\.(md|json)$/.test(p) && !/evals\.json$/.test(p))) {
  const out = join(pluginDir, 'skills', s, relative(join(skillsSrc, s), f));
  map.set(f, out);
  baseOf.set(out, join(pluginDir, 'skills', s));
}
for (const f of files(resourcesSrc, (p) => p.endsWith('.md'))) {
  const out = join(pluginDir, 'skills', PLUGIN, 'resources', relative(resourcesSrc, f));
  map.set(f, out);
  baseOf.set(out, join(pluginDir, 'skills', PLUGIN));
}
// the generated component API index is markdown + json; only the markdown is bundled
for (const [f] of map) if (f.endsWith('.json')) map.delete(f);

/** the source file a path token in `srcFile` points at, if it is a bundled file */
function target(token, srcFile, srcBase) {
  const clean = token.replace(/#.*$/, '').replace(/:\d+(-\d+)?$/, '');
  if (!clean || /^(https?:|mailto:|\/|~)/.test(clean) || !/[/.]/.test(clean) || /[*<>{}$|]/.test(clean)) return null;
  const cands = clean.startsWith('.claude/') ? [join(root, clean)] : [resolve(dirname(srcFile), clean), resolve(srcBase, clean), join(root, clean)];
  for (const c of cands) if (map.has(c)) return { src: c, suffix: token.slice(clean.length) };
  // a skill-relative path to a repo file that is not bundled (`scripts/validate.mjs` in noon-ui) → its repo path
  if (!clean.startsWith('.claude/') && !/^(src|scripts|visual|docs)\//.test(clean) || clean.startsWith('scripts/')) {
    for (const c of [resolve(dirname(srcFile), clean), resolve(srcBase, clean)]) if (c.startsWith(skillsSrc) && existsSync(c) && statSync(c).isFile()) return { repo: rel(root, c), suffix: token.slice(clean.length) };
  }
  return null;
}

function rewrite(text, srcFile, outFile) {
  const srcBase = srcFile.startsWith(resourcesSrc) ? join(skillsSrc, PLUGIN) : join(skillsSrc, relative(skillsSrc, srcFile).split('/')[0]);
  const outBase = baseOf.get(outFile);
  const swap = (tok) => {
    const t = target(tok, srcFile, srcBase);
    if (t?.repo) return t.repo + t.suffix;
    return t ? rel(outBase, map.get(t.src)) + t.suffix : tok;
  };
  return text
    .replace(/`([^`\n]+)`/g, (m, span) => (span.includes(' ') ? `\`${span.split(' ').map(swap).join(' ')}\`` : `\`${swap(span)}\``))
    .replace(/\]\(([^)\s]+)\)/g, (m, link) => `](${swap(link)})`);
}

const note = (s) => `
> **Package note** (noon Flow Kit ${pkg.version}, built from \`.claude/skills/${s}\` by \`npm run release:build\`). Files under \`../noon-ui/\` (design-system references, \`../noon-ui/resources/\` with the brain map, flow briefs and screen index) are part of this package. Paths under \`src/\`, \`scripts/\`, \`visual/\` or \`.claude/\` and \`npm run …\` commands refer to the noon Flow Kit repo (https://github.com/${REPO}): use them inside a checkout of it; anywhere else treat them as reference, ask for what you need, and never invent their contents. Claude Code-only parts (slash commands, the design-guard hook, Claude-specific tools) are listed in \`../noon-ui/resources/DISTRIBUTION.md\`.
`;

const outputs = new Map();
for (const [src, out] of map) {
  let text = rewrite(readFileSync(src, 'utf8'), src, out);
  if (out.endsWith('/SKILL.md')) {
    const s = relative(join(pluginDir, 'skills'), out).split('/')[0];
    text = text.replace(/^(---\n[\s\S]*?\n---\n)/, (fm) => `${fm}${note(s)}`);
  }
  outputs.set(out, text);
}

// distribution notes bundled with the knowledge (what is portable, what needs Claude Code or the repo)
outputs.set(join(pluginDir, 'skills', PLUGIN, 'resources', 'DISTRIBUTION.md'), readFileSync(join(root, 'docs/distribution/PACKAGE-NOTES.md'), 'utf8'));

const description = 'noon app design knowledge for building and restyling noon screens and flows with the noon Flow Kit: design tokens, components, motion, Origin Design System parts, flow specs and the brain map, plus screen skills for home, search, PDP, cart, checkout, orders, returns, reviews, account and noon One.';
outputs.set(join(pluginDir, '.claude-plugin', 'plugin.json'), `${JSON.stringify({
  $schema: 'https://anthropic.com/claude-code/plugin.schema.json',
  name: PLUGIN,
  version: pkg.version,
  description,
  author: { name: 'Arnab Debnath' },
  homepage: `https://github.com/${REPO}`,
  repository: `https://github.com/${REPO}`,
  license: 'UNLICENSED',
  keywords: ['noon', 'design-system', 'ui', 'prototype', 'skills'],
  skills: ['./skills/'],
}, null, 2)}\n`);
outputs.set(join(root, '.claude-plugin', 'marketplace.json'), `${JSON.stringify({
  $schema: 'https://anthropic.com/claude-code/marketplace.schema.json',
  name: MARKETPLACE,
  owner: { name: 'Arnab Debnath' },
  metadata: { description: 'noon Flow Kit plugins: noon app design knowledge for Claude Code.', version: pkg.version },
  plugins: [{ name: PLUGIN, source: `./plugins/${PLUGIN}`, description, version: pkg.version, category: 'design', keywords: ['noon', 'design-system', 'ui'] }],
}, null, 2)}\n`);
outputs.set(join(pluginDir, 'README.md'), readFileSync(join(root, 'docs/distribution/PLUGIN-README.md'), 'utf8').replaceAll('{{version}}', pkg.version));

if (check) {
  const want = new Set([...outputs.keys()]);
  const stale = [...outputs].filter(([p, t]) => (existsSync(p) ? readFileSync(p, 'utf8') : null) !== t).map(([p]) => rel(root, p));
  const extra = files(pluginDir, () => true).filter((p) => !want.has(p)).map((p) => rel(root, p));
  if (stale.length || extra.length) {
    console.log(`✗ plugin package out of date: ${[...stale, ...extra.map((x) => `${x} (remove)`)].slice(0, 12).join(', ')}${stale.length + extra.length > 12 ? ' …' : ''} — run npm run release:build`);
    process.exit(1);
  }
  console.log(`✓ plugin package current (${PLUGIN} ${pkg.version}: ${skills.length} skills, ${outputs.size} files)`);
} else {
  rmSync(pluginDir, { recursive: true, force: true });
  for (const [p, t] of outputs) {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, t);
  }
  console.log(`wrote plugins/${PLUGIN}/ (${skills.length} skills, ${outputs.size} files) and .claude-plugin/marketplace.json`);
}
