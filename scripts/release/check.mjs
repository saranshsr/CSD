#!/usr/bin/env node
// Release checks for the plugin, the marketplace and the portable skills:  npm run release:check   (--release: also
// require a CHANGELOG section for the version, for tagging)
//
//  1. Current      plugins/noon-ui/ and .claude-plugin/marketplace.json match what release:build generates
//  2. Metadata     every SKILL.md: frontmatter first, `name` = folder, lowercase letters / digits / hyphens, ≤ 64,
//                  `description` 1–1024 characters, no angle brackets; names unique
//  3. Versions     package.json = plugin.json = marketplace entry = marketplace metadata
//  4. Marketplace  every plugin entry points at a folder with a manifest of the same name; no duplicate entries
//  5. References   every path in the package resolves: inside the package (from the skill folder or the file's
//                  folder), or — for repo paths (src/, scripts/ …) — to a file that exists in the kit repo
//  6. Duplicates   no two bundled files with the same content (the knowledge is bundled once)
//  7. Claude Code  `claude plugin validate --strict` on the plugin and the marketplace, when the CLI is installed
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const release = process.argv.includes('--release');
const problems = [];
const passed = [];
const rel = (p) => relative(root, p).split('\\').join('/');
const read = (p) => readFileSync(p, 'utf8');

// 1
const b = spawnSync(process.execPath, [join(root, 'scripts/release/build-plugin.mjs'), '--check'], { encoding: 'utf8' });
if (b.status !== 0) problems.push(b.stdout.trim() || b.stderr.trim()); else passed.push(b.stdout.trim().replace(/^✓ /, ''));

const pkg = JSON.parse(read(join(root, 'package.json')));
const market = JSON.parse(read(join(root, '.claude-plugin/marketplace.json')));
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));

// 4 (and the plugin list for the rest)
const names = market.plugins.map((p) => p.name);
if (new Set(names).size !== names.length) problems.push(`marketplace: duplicate plugin entries: ${names.join(', ')}`);
const plugins = [];
for (const entry of market.plugins) {
  const dir = typeof entry.source === 'string' ? join(root, entry.source) : null;
  const manifest = dir && join(dir, '.claude-plugin/plugin.json');
  if (!manifest || !existsSync(manifest)) { problems.push(`marketplace: ${entry.name}: source ${JSON.stringify(entry.source)} has no .claude-plugin/plugin.json`); continue; }
  const m = JSON.parse(read(manifest));
  if (m.name !== entry.name) problems.push(`marketplace: entry ${entry.name} points at a plugin named ${m.name}`);
  plugins.push({ entry, dir, m });
}
passed.push(`marketplace ${market.name}: ${plugins.length} plugin(s)`);

// 3
for (const { entry, m } of plugins) {
  const v = { 'package.json': pkg.version, 'plugin.json': m.version, 'marketplace entry': entry.version, 'marketplace metadata': market.metadata?.version };
  if (new Set(Object.values(v)).size !== 1) problems.push(`versions differ: ${Object.entries(v).map(([k, x]) => `${k} ${x}`).join(' · ')}`);
  else passed.push(`version ${pkg.version} everywhere`);
  if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(m.version)) problems.push(`plugin.json version ${m.version} is not semver`);
}
if (release && !new RegExp(`^## \\[${pkg.version.replace(/\./g, '\\.')}\\]`, 'm').test(read(join(root, 'CHANGELOG.md')))) problems.push(`CHANGELOG.md has no "## [${pkg.version}]" section (move Unreleased under it before tagging)`);

for (const { dir } of plugins) {
  const skillsDir = join(dir, 'skills');
  const skillDirs = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory());
  // 2
  const seen = new Set();
  for (const s of skillDirs) {
    const f = join(skillsDir, s, 'SKILL.md');
    if (!existsSync(f)) { problems.push(`${rel(join(skillsDir, s))}: no SKILL.md`); continue; }
    const fm = read(f).match(/^---\n([\s\S]*?)\n---\n/);
    if (!fm) { problems.push(`${rel(f)}: YAML frontmatter must open the file`); continue; }
    const name = fm[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
    if (name !== s) problems.push(`${rel(f)}: name "${name}" must equal the folder name "${s}"`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name ?? '') || name.length > 64) problems.push(`${rel(f)}: name must be lowercase letters, digits and single hyphens, ≤ 64`);
    if (!desc || desc.length > 1024) problems.push(`${rel(f)}: description must be 1–1024 characters (has ${desc?.length ?? 0})`);
    if (/[<>]/.test(`${name}${desc}`)) problems.push(`${rel(f)}: no angle brackets in name / description`);
    if (seen.has(name)) problems.push(`duplicate skill name ${name}`);
    seen.add(name);
  }
  passed.push(`${skillDirs.length} SKILL.md files with valid frontmatter`);

  // 5
  const pathLike = /^(src\/|scripts\/|visual\/|docs\/|\.claude\/|references\/|resources\/|templates\/|evals\/)[\w./@-]*$|^\.\.?\/[\w./@-]*\.(md|mjs|json)$|^[\w.-]+\.(md|mjs|json)$/; // the skill:check rule (+ package folders); routes, imports and bappzaar files are not paths here
  const basenames = new Set(walk(dir).map((p) => p.split('/').pop()));
  const tracked = execFileSync('git', ['-C', root, 'ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const trackedNames = tracked.map((p) => p.split('/').pop());
  const repoHas = (p) => ['', '.ts', '.tsx', '/index.ts'].some((x) => existsSync(join(root, p + x)));
  // like skill:check: `<!-- planned: … -->` / `<!-- external: … -->` in any doc mark paths that are proposed or outside the repo
  const plannedAll = new Set(walk(skillsDir).filter((p) => p.endsWith('.md')).flatMap((f) => [...read(f).matchAll(/<!--\s*(?:planned|external):([^>]*)-->/g)].flatMap((m) => m[1].split(',').map((x) => x.trim()))));
  let checked = 0;
  const broken = [];
  for (const f of walk(skillsDir).filter((p) => p.endsWith('.md'))) {
    const base = join(skillsDir, relative(skillsDir, f).split('/')[0]);
    const text = read(f).replace(/<!--[\s\S]*?-->/g, '');
    const planned = plannedAll;
    const toks = [...text.matchAll(/`([^`\n]+)`/g)].flatMap((m) => [m[1], ...m[1].split(/\s+/)]).concat([...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]));
    for (const t of new Set(toks)) {
      const p = t.replace(/[),.;:]+$/, '').replace(/#.*$/, '').replace(/:\d+(-\d+)?$/, '');
      if (!pathLike.test(p) || /[*<>{}$]|\.\.\.|…/.test(p) || /^https?:/.test(p) || planned.has(p) || planned.has(t) || planned.has(p.split('/').pop())) continue;
      if (/^\.\/[\w/-]+$/.test(p)) continue; // an import specifier in a code sample (`./components`), not a file
      checked++;
      const inPkg = [resolve(base, p), resolve(dirname(f), p)].some((c) => existsSync(c) && c.startsWith(dir));
      const bare = !p.includes('/') && (basenames.has(p) || repoHas(p) || trackedNames.some((n) => n === p || n.endsWith(`.${p}`)));
      if (!inPkg && !bare && !repoHas(p.replace(/^\.\//, ''))) broken.push(`${rel(f)}: ${p}`);
    }
  }
  if (broken.length) problems.push(`${broken.length} path(s) resolve neither in the package nor in the repo:\n    - ${[...new Set(broken)].slice(0, 25).join('\n    - ')}`);
  else passed.push(`${checked} path references resolve (package or repo)`);

  // 6
  const hashes = {};
  for (const f of walk(dir)) { const h = createHash('sha1').update(readFileSync(f)).digest('hex'); (hashes[h] ??= []).push(rel(f)); }
  const dups = Object.values(hashes).filter((l) => l.length > 1);
  if (dups.length) problems.push(`duplicate files in the package: ${dups.map((l) => l.join(' = ')).join('; ')}`); else passed.push('no duplicate files in the package');
}

// 7
const hasClaude = spawnSync('claude', ['--version'], { encoding: 'utf8' }).status === 0;
if (hasClaude) {
  for (const target of [...plugins.map((p) => p.dir), root]) {
    const r = spawnSync('claude', ['plugin', 'validate', '--strict', target], { encoding: 'utf8' });
    if (r.status !== 0) problems.push(`claude plugin validate --strict ${rel(target) || '.'}:\n${(r.stdout + r.stderr).trim()}`);
    else passed.push(`claude plugin validate --strict ${rel(target) || '.'}`);
  }
} else passed.push('claude CLI not installed: skipped `claude plugin validate` (CI runs the schema checks above)');

for (const p of passed) console.log(`✓ ${p}`);
if (problems.length) {
  console.log(`\n✗ ${problems.length} release problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
