#!/usr/bin/env node
// Measures the brain map against the existing workflow:  npm run brain:eval   (writes .claude/resources/brain/eval-report.md)
//
// For each representative task it compares two reading sets:
//   baseline  what the skills tell an agent to read before building today: noon-ui SKILL.md step 2 + the
//             resources README "read first" list + the screen skill (SKILL.md, spec.md) + the flow brief, then the
//             flow's index.ts, initial screen module, data.ts, tokens.ts, components/ and mapping docs
//   brain     noon-ui SKILL.md + INDEX.md + the `brain context` output + the L0–L3 items it lists
// and reports, per set: files, size (tokens ≈ characters / 4 — an estimate, not a tokenizer), and pointer recall:
// of the flow's source files that real commits changed (git history = ground truth), the share the set names by
// path or file name, so an agent can open them without searching. Same rule for both sets.
// What it cannot measure (visual similarity, revision cycles) is listed in the report, not estimated.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => { try { return readFileSync(join(root, p), 'utf8'); } catch { return ''; } };
const tokens = (s) => Math.round(s.length / 4);
const G = () => JSON.parse(read('.claude/resources/brain/graph.json'));

const TASKS = [
  { id: 'home', request: 'update the home page hero banners and product carousels', flows: ['home'], skill: 'home-page' },
  { id: 'search-results', request: 'change the search results listing filter and sort pills', flows: ['search', 'plp'], skill: 'search' },
  { id: 'pdp', request: 'change the product detail page variant picker tiles', flows: ['pdp'], skill: 'pdp' },
  { id: 'cart', request: 'add a free delivery progress bar to the cart shipment groups', flows: ['cart'], skill: 'cart' },
  { id: 'checkout', request: 'add a new payment method to the checkout pay with section', flows: ['checkout'], skill: 'checkout' },
];

function walk(dir) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { recursive: true }).map((p) => `${dir}/${p}`).filter((p) => statSync(join(root, p)).isFile());
}

// ground truth: source files of the flow changed by any commit in history (assets excluded)
const log = execFileSync('git', ['-C', root, 'log', '--name-only', '--format=--%h'], { encoding: 'utf8' });
const changed = new Set(log.split('\n').filter((l) => /^src\/.*\.(tsx?|css)$/.test(l)));

const graph = G();
const results = [];
for (const t of TASKS) {
  const flowFiles = t.flows.flatMap((f) => walk(`src/flows/${f}`)).filter((p) => /\.(tsx?|css)$/.test(p));
  const truth = flowFiles.filter((p) => changed.has(p) && existsSync(join(root, p)));

  // baseline reading set
  const main = graph.flows[t.flows[0]].initial;
  const baseDocs = ['.claude/skills/noon-ui/SKILL.md', '.claude/skills/noon-ui/references/flows.md', '.claude/resources/README.md', '.claude/resources/screens.md', '.claude/resources/inventory.md', '.claude/resources/patterns.md', `.claude/skills/${t.skill}/SKILL.md`, `.claude/skills/${t.skill}/spec.md`, ...t.flows.map((f) => `.claude/resources/flows/${f}.md`)].filter((p) => existsSync(join(root, p)));
  const baseCode = t.flows.flatMap((f) => [`src/flows/${f}/index.ts`, `src/flows/${f}/data.ts`, `src/flows/${f}/tokens.ts`, ...walk(`src/flows/${f}/components`).filter((p) => /\.tsx?$/.test(p)), ...['MAPPING.md', 'FIGMA-MAPPING.md'].map((m) => `src/flows/${f}/${m}`)]).concat(graph.screens[main]?.module ?? []).filter((p) => existsSync(join(root, p)));
  const base = [...new Set([...baseDocs, ...baseCode])];

  // brain reading set
  const t0 = Date.now();
  const ctx = execFileSync(process.execPath, [join(root, 'scripts/brain/query.mjs'), 'context', t.request], { encoding: 'utf8' });
  const ms = Date.now() - t0;
  const listed = [...ctx.matchAll(/^- L\d [^`]*`([^`]+)`/gm)].map((m) => m[1]);
  const brainFiles = ['.claude/skills/noon-ui/SKILL.md', ...listed];
  const brainText = ctx + brainFiles.map((p) => { const m = p.match(/^(.*):(\d+)-(\d+)$/); return m ? read(m[1]).split('\n').slice(+m[2] - 1, +m[3]).join('\n') : read(p); }).join('\n');
  const baseText = base.map(read).join('\n');

  const named = (text, files) => (p) => files.includes(p) || text.includes(p) || new RegExp(`\\b${basename(p).replace(/\.(tsx?|css)$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text);
  const baseHit = truth.filter(named(baseText, base));
  const brainHit = truth.filter(named(brainText, brainFiles.map((p) => p.replace(/:\d+-\d+$/, ''))));
  results.push({
    ...t,
    truth: truth.length,
    base: { files: base.length, tokens: tokens(baseText), docsTokens: tokens(baseDocs.map(read).join('\n')), recall: baseHit.length },
    brain: { files: brainFiles.length, tokens: tokens(brainText), recall: brainHit.length, ms },
    missedByBrain: truth.filter((p) => !brainHit.includes(p)),
  });
}

const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : '—');
const fmt = (n) => n.toLocaleString('en-US');
const L = [
  '# Brain map evaluation',
  '',
  '<!-- Generated by scripts/brain/eval.mjs (`npm run brain:eval`). Static part re-runs on demand; the live A/B section is recorded by hand from real agent runs. -->',
  '',
  'Tokens ≈ characters / 4 (an estimate; the same rule for both sets). **Pointer recall** = of the flow\'s source files that real commits changed (git history), the share the reading set names by path or file name. Baseline = what the skills instruct an agent to read before building today (noon-ui step 2, the resources "read first" list, the screen skill, the brief, the flow\'s code entry points and components). Brain = noon-ui SKILL.md + INDEX + `brain context` + the items it lists.',
  '',
  '| Task | Ground-truth files | Baseline files · tokens | Baseline recall | Brain files · tokens | Brain recall | Brain query |',
  '|---|---|---|---|---|---|---|',
];
for (const r of results) L.push(`| ${r.id} (${r.flows.join(' + ')}) | ${r.truth} | ${r.base.files} · ${fmt(r.base.tokens)} (docs ${fmt(r.base.docsTokens)}) | ${r.base.recall}/${r.truth} (${pct(r.base.recall, r.truth)}) | ${r.brain.files} · ${fmt(r.brain.tokens)} | ${r.brain.recall}/${r.truth} (${pct(r.brain.recall, r.truth)}) | ${r.brain.ms} ms |`);
const sum = (k, s) => results.reduce((n, r) => n + r[s][k], 0);
const truthN = results.reduce((n, r) => n + r.truth, 0);
L.push(`| **all** | ${truthN} | ${sum('files', 'base')} · ${fmt(sum('tokens', 'base'))} | ${pct(sum('recall', 'base'), truthN)} | ${sum('files', 'brain')} · ${fmt(sum('tokens', 'brain'))} | ${pct(sum('recall', 'brain'), truthN)} | |`);
L.push('', `Context size: the brain set is ${pct(sum('tokens', 'brain'), sum('tokens', 'base'))} of the baseline (${fmt(sum('tokens', 'base') - sum('tokens', 'brain'))} fewer tokens over ${results.length} tasks).`, '');
L.push('## Ground-truth files the brain set does not name', '', 'The brain set names screen modules and the components of the closest screens; it deliberately does not list every helper. These are the files an agent would still have to find with `brain deps` or a search:', '');
for (const r of results) L.push(`- ${r.id}: ${r.missedByBrain.length ? r.missedByBrain.map((p) => `\`${p}\``).join(', ') : 'none'}`);
L.push('', '## Not measured here', '', '- Visual similarity to references, motion and navigation correctness of a *generated* screen, implementation errors and revision cycles: they need an agent to build the screen and a reviewer (or `visual:ref`) to score it. The live A/B below measures retrieval only.', '- Ground truth comes from large multi-flow commits, so it is "files that changed in this flow", not "files one task needed": recall is an upper-bound style signal, not task accuracy.', '');
const reportPath = join(root, '.claude/resources/brain/eval-report.md');
const prev = existsSync(reportPath) ? readFileSync(reportPath, 'utf8') : '';
const live = prev.includes('## Live A/B') ? prev.slice(prev.indexOf('## Live A/B')) : '## Live A/B (recorded)\n\nNot run yet.\n';
writeFileSync(reportPath, `${L.join('\n')}\n${live}`);
console.log(L.join('\n'));
