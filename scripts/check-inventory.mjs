#!/usr/bin/env node
// Flow / screen / route counts quoted in the docs must match the registry.
//   node scripts/check-inventory.mjs            check (exit 1 on a wrong count or a stale inventory)
//   node scripts/check-inventory.mjs --no-build skip the staleness check of the generated resources
//
// The registry numbers come from .claude/resources/inventory.json, which `npm run resources:build` generates from
// src/flows/index.ts; the script first runs `build.mjs --check` so it never compares against a stale inventory.
//
// What is checked, in README.md, CONTRIBUTING.md, .claude/skills/**/*.md and .claude/resources/**/*.md (generated
// files and CHANGELOGs are skipped; a line containing `<!-- count-ok -->` is skipped):
//   totals    "17 flows", "17 ready-made flows", "147 screens", "147 routes", "17 flows (147 screens)". A number is
//             a total when it is above the largest flow's screen count (smaller "N screens" are per-flow or examples).
//   per flow  "N screens" written plainly inside a section whose heading starts with a flow id (`## noonone …`,
//             `### checkout · …`) or in a screen skill's own files, compared with that flow's screen count.
//   review    qualified per-flow numbers ("+ 21 screens", "(22 screens)", "20 step / post-order screens") count files
//             or sub-sets, so they are listed for a human but never fail the check.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const resources = join(root, '.claude/resources');

if (!process.argv.includes('--no-build')) {
  const r = spawnSync(process.execPath, [join(resources, 'scripts/build.mjs'), '--check'], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.log(`✗ ${(r.stdout + r.stderr).trim().split('\n').pop()}`);
    process.exit(1);
  }
}
const inv = JSON.parse(readFileSync(join(resources, 'inventory.json'), 'utf8'));
const { flows: nFlows, screens: nScreens, largestFlow } = inv.totals;
const flowById = Object.fromEntries(inv.flows.map((f) => [f.id, f]));
// screen skill folder → the single flow it specifies (a skill covering several flows gets no per-flow context)
const skillFlow = {};
for (const f of inv.flows) for (const s of f.docs.skills) (skillFlow[s.split('/')[2]] ??= []).push(f.id);

const generated = new Set(['screens.md', 'inventory.md', 'flows/categories-views.md'].map((p) => join(resources, p)));
const files = [join(root, 'README.md'), join(root, 'CONTRIBUTING.md')].filter(existsSync);
for (const dir of [join(root, '.claude/skills'), resources]) {
  for (const p of readdirSync(dir, { recursive: true })) {
    const abs = join(dir, p);
    if (p.endsWith('.md') && !/(^|\/)CHANGELOG\.md$/.test(p) && !generated.has(abs)) files.push(abs);
  }
}

const problems = [];
const review = [];
let checked = 0;
for (const file of files) {
  const rel = relative(root, file);
  const skill = rel.match(/^\.claude\/skills\/([\w-]+)\//)?.[1];
  const skillCtx = skill && skillFlow[skill]?.length === 1 ? skillFlow[skill][0] : null;
  let headingCtx = null;
  let inFence = false;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const h = !inFence && line.match(/^#{1,4}\s+`?([\w-]+)/);
    if (h) headingCtx = flowById[h[1]] ? h[1] : null;
    if (line.includes('<!-- count-ok -->')) return;
    const at = `${rel}:${i + 1}`;
    for (const m of line.matchAll(/\b(\d+) (?:ready-made |registered |real )?flows\b/g)) {
      if (+m[1] <= 5) continue; // "2 flows", "a new flow of 2–8 screens": prose, not a total
      checked++;
      if (+m[1] !== nFlows) problems.push(`${at}: "${m[0]}" but the registry has ${nFlows} flows`);
    }
    const ctx = headingCtx ?? skillCtx;
    for (const m of line.matchAll(/\b(\d+) (?:registered |ready-made |real )?(screens|routes)\b/g)) {
      const n = +m[1];
      checked += n > largestFlow || ctx ? 1 : 0;
      if (n > largestFlow) {
        if (n !== nScreens) problems.push(`${at}: "${m[0]}" but the registry has ${nScreens} ${m[2]}`);
      } else if (ctx && n !== flowById[ctx].screenCount) {
        const want = flowById[ctx].screenCount;
        if (/(\+|\()\s*$/.test(line.slice(0, m.index))) review.push(`${at}: "${line.slice(Math.max(0, m.index - 12), m.index).trimStart()}${m[0]}" (${ctx} registers ${want} screens; this may count files or a subset)`);
        else problems.push(`${at}: "${m[0]}" in a ${ctx} section but ${ctx} has ${want} screens`);
      }
    }
    // qualified per-flow numbers ("21 step / post-order screens"): a subset or a file count, listed for review only
    if (ctx) for (const m of line.matchAll(/\b(\d+) ((?:(?!flows\b|and\b|screens\b|routes\b)[a-z][\w-]*(?: \/)? ){1,3})screens\b/g)) {
      const want = flowById[ctx].screenCount;
      if (+m[1] <= largestFlow && +m[1] !== want) review.push(`${at}: "${m[0]}" (${ctx} registers ${want} screens; this may count files or a subset)`);
    }
  });
}

const head = `${nFlows} flows · ${nScreens} screens · ${files.length} docs · ${checked} counts checked`;
if (review.length) {
  console.log(`  review (not failing): qualified per-flow counts that differ from the registry:`);
  for (const r of review) console.log(`    - ${r}`);
}
if (problems.length) {
  console.log(`✗ doc counts disagree with the registry (${head}):`);
  for (const p of problems) console.log(`  - ${p}`);
  console.log('\nFix the number, or point to .claude/resources/inventory.md instead of quoting it.');
  process.exit(1);
}
console.log(`✓ doc counts match the registry (${head})`);
