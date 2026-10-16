#!/usr/bin/env node
// Query the brain map instead of reading the repo:  npm run brain -- <command> [args] [--json]
//
//   context "<request>"      intent → flows / screens → the minimum reading list (with line ranges and a size
//                            estimate), what to reuse, tokens, motion, nav, tests, and the words nothing matched (gaps)
//   impact <entity>          what a change touches: files that use it → screens → flows → tests to run → docs
//                            entity: cmp:Name | Name | tok:--nk-x | --nk-x | mo:… | icon:x | store:x | data:x | scr:flow/screen | a path
//   deps <screen|cmp>        the forward chain: screen → module → components → tokens / motion / nav → tests
//   path <from> <to>         shortest navigation path between two screens (static + resolved nav edges)
//   show <id>                one entity as JSON
//
// Reads .claude/resources/brain/graph.json and rebuilds it first when it is missing or older than src/.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const graphFile = join(root, '.claude/resources/brain/graph.json');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const args = argv.filter((a) => a !== '--json');
const [cmd, ...rest] = args;

function newestMtime(dir) {
  let t = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    t = Math.max(t, e.isDirectory() ? newestMtime(p) : statSync(p).mtimeMs);
  }
  return t;
}
const sources = [join(root, 'src'), join(root, 'scripts/journeys'), join(root, 'visual/refs/manifest.json'), join(root, 'scripts/brain/build.mjs')];
const newest = Math.max(...sources.map((p) => (statSync(p).isDirectory() ? newestMtime(p) : statSync(p).mtimeMs)));
if (!existsSync(graphFile) || statSync(graphFile).mtimeMs < newest) {
  process.stderr.write('brain: graph.json missing or older than src/ — rebuilding…\n');
  execFileSync(process.execPath, [join(root, 'scripts/brain/build.mjs')], { stdio: ['ignore', 'ignore', 'inherit'] });
}
const G = JSON.parse(readFileSync(graphFile, 'utf8'));
const out = [];
const say = (s = '') => out.push(s);
const sortU = (a) => [...new Set(a)].sort();
const bytes = (p) => { try { return statSync(join(root, p.replace(/[:#].*$/, ''))).size; } catch { return 0; } };
const lineBytes = (p, a, b) => { try { return readFileSync(join(root, p), 'utf8').split('\n').slice(a - 1, b).join('\n').length; } catch { return 0; } };
const tok = (n) => `~${Math.round(n / 4).toLocaleString('en-US')} tok`;
const shortName = (id) => id.replace(/^cmp:/, '').replace(/^[a-z]\w*\//, '');

// ── reverse import graph (for impact)
const importers = {};
for (const [f, x] of Object.entries(G.files)) for (const i of x.imports ?? []) (importers[i] ??= []).push(f);
function reverseClosure(startFiles) {
  const seen = new Set(startFiles);
  const q = [...startFiles];
  while (q.length) for (const n of importers[q.shift()] ?? []) if (!seen.has(n) && !n.startsWith('src/app/') && n !== 'src/index.ts' && !/^src\/flows\/(index|[^/]+\/index)\.ts$/.test(n)) { seen.add(n); q.push(n); }
  return seen;
}
const moduleScreens = {};
for (const [r, s] of Object.entries(G.screens)) if (s.module) (moduleScreens[s.module] ??= []).push(r);

/** files that directly use an entity */
function filesUsing(id) {
  const out2 = [];
  for (const [f, x] of Object.entries(G.files)) {
    if (id.startsWith('cmp:') && (x.components ?? []).includes(id)) out2.push(f);
    else if (id.startsWith('tok:') && (x.tokens ?? []).includes(id.slice(4))) out2.push(f);
    else if (id.startsWith('mo:') && (x.motion ?? []).some((m) => m === id || m.startsWith(`${id}.`))) out2.push(f);
    else if (id.startsWith('icon:') && (x.icons ?? []).includes(id.slice(5))) out2.push(f);
    else if (id.startsWith('asset:') && (x.assets ?? []).some((a) => a === id.slice(6) || a.startsWith(id.slice(6)))) out2.push(f);
    else if (id.startsWith('store:') && (x.stores ?? []).includes(id)) out2.push(f);
    else if (id.startsWith('data:') && (x.data ?? []).includes(id)) out2.push(f);
  }
  return out2;
}
function normalise(q) {
  if (!q) return null;
  if (/^(cmp|tok|mo|icon|asset|store|data|scr|flow|test):/.test(q)) return q;
  if (q.startsWith('--nk-')) return `tok:${q}`;
  if (G.screens[q]) return `scr:${q}`;
  if (G.flows[q]) return `flow:${q}`;
  if (G.components[`cmp:${q}`]) return `cmp:${q}`;
  const local = Object.keys(G.components).filter((k) => k.endsWith(`/${q}`));
  if (local.length === 1) return local[0];
  if (G.files[q] || existsSync(join(root, q))) return q.startsWith('src/assets/') ? `asset:${q}` : `file:${q}`;
  if (local.length) return local[0];
  return null;
}
function screensForFiles(fileSet) {
  return sortU([...fileSet].flatMap((f) => moduleScreens[f] ?? []));
}
function testsFor(routes) {
  const j = G.tests.journeys.filter((x) => x.routes.some((r) => routes.includes(r)));
  const v = G.tests.visualRefs.filter((x) => routes.includes(x.route));
  return { journeys: j, visual: v };
}
function docMentions(word) {
  const hits = [];
  const walk = (d) => {
    for (const e of readdirSync(join(root, d), { withFileTypes: true })) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) { if (!/brain$|node_modules/.test(p)) walk(p); }
      else if (e.name.endsWith('.md')) {
        const lines = readFileSync(join(root, p), 'utf8').split('\n');
        const re = new RegExp(`(^|[^\\w-])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\w-])`);
        const n = lines.map((l, i) => (re.test(l) ? i + 1 : 0)).filter(Boolean);
        if (n.length) hits.push(`${p}:${n.slice(0, 5).join(',')}${n.length > 5 ? '…' : ''}`);
      }
    }
  };
  walk('.claude/skills');
  walk('.claude/resources');
  for (const fl of Object.keys(G.flows)) for (const m of ['MAPPING.md', 'FIGMA-MAPPING.md', 'DESIGN.md']) {
    const p = `src/flows/${fl}/${m}`;
    if (existsSync(join(root, p)) && new RegExp(`(^|[^\\w-])${word}($|[^\\w-])`).test(readFileSync(join(root, p), 'utf8'))) hits.push(p);
  }
  return hits;
}

// ── commands
function impact(q) {
  const id = normalise(q);
  if (!id) { say(`brain: no entity matches "${q}". Try cmp:<Name>, --nk-<var>, mo:transition/<name>, scr:<flow/screen> or a path.`); return; }
  let direct;
  let title = id;
  if (id.startsWith('scr:')) {
    const r = id.slice(4);
    const s = G.screens[r];
    say(`# impact ${id}`);
    say(`Changing this screen: module \`${s.module}\` (shared with ${(moduleScreens[s.module] ?? []).filter((x) => x !== r).join(', ') || 'no other screen'}).`);
    say(`Screens that navigate here: ${(s.navIn ?? []).map((n) => `${n.from}${n.resolved ? '~' : ''}`).join(', ') || '—'}`);
    const t = testsFor([r]);
    say(`Tests: ${[...t.journeys.map((x) => x.id), ...t.visual.map((x) => x.id)].join(', ') || 'check:routes only'}`);
    say(`Docs: ${(s.docs ?? []).join(', ') || '—'}`);
    return;
  }
  if (id.startsWith('flow:')) { say(`# impact ${id}`, ''); say(`Use the flow card: .claude/resources/brain/flows/${id.slice(5)}.md (screens, entries, exits, tests).`); return; }
  if (id.startsWith('file:')) { direct = [id.slice(5)]; title = id.slice(5); }
  else direct = filesUsing(id);
  if (id.startsWith('cmp:') && G.components[id]) direct.push(G.components[id].file);
  const all = reverseClosure(direct);
  let routes = screensForFiles(all);
  if (id.startsWith('mo:transition/')) {
    const t = G.motion.transitions[id.slice(14)];
    if (t) routes = sortU([...routes, ...t.usedBy, ...t.defaultFor]);
  }
  const byFlow = {};
  for (const r of routes) (byFlow[r.split('/')[0]] ??= []).push(r.split('/')[1]);
  const t = testsFor(routes);
  const word = id.startsWith('cmp:') ? shortName(id) : id.startsWith('tok:') ? id.slice(4) : id.replace(/^[a-z]+:/, '').split('/').pop();
  const docs = word && word.length > 2 ? docMentions(word) : [];
  if (asJson) { console.log(JSON.stringify({ id, directFiles: sortU(direct), files: all.size, screens: routes, flows: Object.keys(byFlow), tests: { journeys: t.journeys.map((x) => x.id), visual: t.visual.map((x) => x.id) }, docs }, null, 2)); process.exit(0); }
  say(`# impact ${title}`);
  say('');
  say(`Direct users (${sortU(direct).length} files): ${sortU(direct).slice(0, 25).map((f) => `\`${f}\``).join(', ')}${direct.length > 25 ? ' …' : ''}`);
  say(`Reaches ${all.size} files → **${routes.length} screens in ${Object.keys(byFlow).length} flows**:`);
  for (const [f, l] of Object.entries(byFlow).sort()) say(`- ${f}: ${l.join(', ')}`);
  say('');
  say(`Re-run: \`npm run check:routes\`${t.journeys.length ? ` · \`npm run test:journeys -- ${sortU(t.journeys.map((x) => x.name)).join(' ')}\`` : ''}${t.visual.length ? ` · \`npm run visual:ref -- ${t.visual.map((x) => x.name).join(' ')}\`` : ''}`);
  say(`Snap to review: ${Object.keys(byFlow).sort().map((f) => `\`node .claude/skills/noon-ui/scripts/snap.mjs ${f}\``).slice(0, 6).join(' · ')}${Object.keys(byFlow).length > 6 ? ' …' : ''}`);
  say(`Docs that mention it (update in the same change): ${docs.length ? docs.join(' · ') : '—'}`);
}

function deps(q) {
  const id = normalise(q);
  if (id?.startsWith('scr:')) {
    const r = id.slice(4);
    const s = G.screens[r];
    if (asJson) { console.log(JSON.stringify({ route: r, ...s }, null, 2)); process.exit(0); }
    say(`# ${r} · ${s.title}`);
    say(`${s.presentation}${s.sheet ? ` (${s.sheet})` : ''} · ${s.urls.join(' ') || 'no URL'} · truth ${s.truth}${s.truthExplicit ? '' : '*'} · verified ${s.verified ?? 'never'}`);
    say(`└─ module \`${s.module}\`${s.params.length ? ` (params ${s.params.join(', ')})` : ''}`);
    for (const c of s.local ?? []) {
      const cc = G.components[c];
      say(`   ├─ ${shortName(c)}  \`${cc.file}\`${cc.uses.length ? `  → ${cc.uses.map(shortName).join(', ')}` : ''}`);
    }
    say(`   ├─ shared: ${(s.shared ?? []).map((c) => { const cc = G.components[c]; return `${shortName(c)}${cc.uses.length ? ` (→ ${cc.uses.map(shortName).join(', ')})` : ''}`; }).join(' · ') || '—'}`);
    const groups = {};
    for (const v of s.tokens ?? []) { const g = v.replace(/^--nk-/, '').split('-')[0]; groups[g] = (groups[g] ?? 0) + 1; }
    say(`   ├─ tokens: ${Object.entries(groups).map(([g, n]) => `${g} ${n}`).join(' · ') || '—'}`);
    say(`   ├─ motion: ${(s.motion ?? []).join(', ') || '—'}`);
    say(`   ├─ state: ${[...(s.stores ?? []), ...(s.data ?? [])].join(', ') || '—'}`);
    say(`   ├─ nav → ${(s.navOut ?? []).map((n) => `${n.method} ${n.to}${n.resolved ? '~' : ''}`).join(' · ') || '—'}`);
    say(`   ├─ nav ← ${(s.navIn ?? []).map((n) => `${n.from}${n.resolved ? '~' : ''}`).join(' · ') || '—'}`);
    say(`   └─ tests: ${(s.tests ?? []).join(', ') || 'check:routes only'}`);
    return;
  }
  if (id?.startsWith('cmp:')) {
    const c = G.components[id];
    if (asJson) { console.log(JSON.stringify({ id, ...c }, null, 2)); process.exit(0); }
    const usesTok = G.files[c.file]?.tokens ?? [];
    const css = (G.files[c.file]?.imports ?? []).filter((f) => f.endsWith('.css'));
    const cssTok = css.flatMap((f) => G.files[f]?.tokens ?? []);
    say(`# ${id}  \`${c.file}:${c.line}\``);
    say(c.doc);
    say(`├─ uses components: ${c.uses.map(shortName).join(', ') || '—'}`);
    say(`├─ tokens (${sortU([...usesTok, ...cssTok]).length}): ${sortU([...usesTok, ...cssTok]).slice(0, 30).join(' ')}`);
    say(`├─ motion: ${(G.files[c.file]?.motion ?? []).join(', ') || '—'}`);
    say(`├─ nav: ${(G.files[c.file]?.nav ?? []).join(', ') || '—'}`);
    say(`└─ used by ${c.usedBy.length} screens: ${c.usedBy.slice(0, 20).join(', ')}${c.usedBy.length > 20 ? ' …' : ''}`);
    say(`Props: search "${c.name}" in .claude/skills/noon-ui/references/component-api.generated.md`);
    return;
  }
  say(`brain: deps takes a screen (flow/screen) or a component (cmp:Name / Name).`);
}

function path(a, b) {
  const from = normalise(a)?.replace(/^scr:/, '');
  const to = normalise(b)?.replace(/^scr:/, '');
  const resolveFlow = (x) => (G.flows[x] ? G.flows[x].initial : x);
  const s0 = resolveFlow(from ?? a);
  const t0 = resolveFlow(to ?? b);
  if (!G.screens[s0] || !G.screens[t0]) { say(`brain: unknown screen ${!G.screens[s0] ? a : b}`); return; }
  const prev = { [s0]: null };
  const q = [s0];
  while (q.length) {
    const n = q.shift();
    if (n === t0) break;
    for (const e of G.screens[n].navOut ?? []) if (!(e.to in prev)) { prev[e.to] = { from: n, e }; q.push(e.to); }
  }
  if (!(t0 in prev)) { say(`No static nav path from ${s0} to ${t0} (dynamic targets are not followed; see findings.md → nav-dynamic).`); return; }
  const steps = [];
  for (let n = t0; prev[n]; n = prev[n].from) steps.unshift(prev[n]);
  say(`# ${s0} → ${t0} (${steps.length} step${steps.length === 1 ? '' : 's'})`);
  for (const st of steps) say(`- ${st.from} —${st.e.method}${st.e.resolved ? '~' : ''}→ ${st.e.to}   (in \`${st.e.via}\`)`);
}

function context(words) {
  const terms = words.join(' ').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));
  const forms = (w) => sortU([w, w.replace(/ies$/, 'y'), w.replace(/es$/, ''), w.replace(/s$/, ''), ...(SYN[w] ?? [])]).filter((f) => f.length > 2);
  const hit = (text, w) => forms(w).some((f) => text.includes(f));
  const matched = new Set();
  const scoreText = (name, text) => terms.reduce((n, w) => { const a = hit(name, w); const b = !a && hit(text, w); if (a || b) matched.add(w); return n + (a ? 3 : b ? 1 : 0); }, 0);
  // flows: id, title, skill names; screens: route, title, urls, notes
  const flows = Object.entries(G.flows).map(([id, f]) => ({ id, f, score: scoreText(`${id} ${f.title} ${f.skills.map((s) => s.split('/')[2]).join(' ')}`.toLowerCase(), '') })).filter((x) => x.score).sort((a, b) => b.score - a.score);
  const screens = Object.entries(G.screens).map(([r, s]) => ({ r, s, score: scoreText(`${r} ${s.title} ${s.urls.join(' ')}`.toLowerCase(), `${s.notes ?? ''} ${s.source ?? ''}`.toLowerCase()) + (flows[0] && r.startsWith(`${flows[0].id}/`) ? 2 : 0) })).filter((x) => x.score > 1).sort((a, b) => b.score - a.score || a.r.localeCompare(b.r));
  const comps = Object.entries(G.components).map(([id, c]) => ({ id, c, score: scoreText(c.name.toLowerCase(), c.doc.toLowerCase()) })).filter((x) => x.score > 1).sort((a, b) => b.score - a.score || b.c.usedBy.length - a.c.usedBy.length).slice(0, 10);
  const top = screens.slice(0, 3);
  const flowIds = sortU([...flows.slice(0, 2).map((x) => x.id), ...top.map((x) => x.s.flow)]).slice(0, 3);
  const gaps = terms.filter((w) => !matched.has(w));
  if (asJson) { console.log(JSON.stringify({ terms, flows: flows.slice(0, 5).map((x) => x.id), screens: screens.slice(0, 8).map((x) => x.r), components: comps.map((x) => x.id), gaps }, null, 2)); process.exit(0); }

  let total = 0;
  const item = (label, p, n) => { total += n; say(`- ${label} \`${p}\`  (${tok(n)})`); };
  say(`# context: ${words.join(' ')}`);
  say('');
  say('## 1. Intent → product area');
  say(flows.length ? flows.slice(0, 4).map((x) => `\`flow:${x.id}\` ${x.f.title}${x.f.skills.length ? ` (${x.f.skills.map((s) => `/${s.split('/')[2]}`).join(' ')})` : ''}`).join(' · ') : 'No flow matches by name — closest screens below; a new flow is likely (`npm run new-flow`).');
  say('');
  say('## 2. Closest screens');
  for (const { r, s } of screens.slice(0, 6)) say(`- \`${r}\` ${s.title} · ${s.presentation} · ${s.urls[0] ?? ''} · truth ${s.truth} · verified ${s.verified ?? 'never'}`);
  if (!screens.length) say('- none');
  say('');
  say('## 3. Read, in this order (stop when you have enough)');
  item('L0 index', '.claude/resources/brain/INDEX.md', bytes('.claude/resources/brain/INDEX.md'));
  for (const id of flowIds) {
    const f = G.flows[id];
    item(`L1 flow card ${id}`, `.claude/resources/brain/flows/${id}.md`, bytes(`.claude/resources/brain/flows/${id}.md`));
    for (const sk of f.skills) item(`L1 skill`, sk, bytes(sk));
  }
  const secs = sortU(top.flatMap((x) => x.s.docs ?? [])).slice(0, 6);
  for (const s of secs) { const m = s.match(/^(.*):(\d+)-(\d+)$/); item('L2 spec / brief lines', s, m ? lineBytes(m[1], +m[2], +m[3]) : bytes(s)); }
  for (const m of sortU(top.map((x) => x.s.module).filter(Boolean))) item('L3 screen module', m, bytes(m));
  say(`Total ≈ ${tok(total)} before opening components. Deeper: \`npm run brain -- deps <screen>\`, then only the component files you change.`);
  say('');
  say('## 4. Reuse (what the closest screens already use)');
  const t0 = top[0]?.s;
  if (t0) {
    say(`- Shared: ${(t0.shared ?? []).map(shortName).join(', ') || '—'}`);
    say(`- Flow-local (${t0.flow}): ${(t0.local ?? []).map(shortName).join(', ') || '—'}`);
  }
  if (comps.length) say(`- Matching by name / doc: ${comps.map((x) => `${x.id} (${x.c.usedBy.length} screens)`).join(', ')}`);
  say('- Props: `.claude/skills/noon-ui/references/component-api.generated.md` · find before you build: `node scripts/design-context.mjs <words>`');
  say('');
  if (t0) {
    say('## 5. Tokens · motion · state · nav (closest screen)');
    const g = {};
    for (const v of t0.tokens ?? []) { const k = v.replace(/^--nk-/, '').split('-')[0]; g[k] = (g[k] ?? 0) + 1; }
    say(`- Tokens: ${Object.entries(g).map(([k, n]) => `${k} ${n}`).join(' · ') || '—'} · flow tokens \`src/flows/${t0.flow}/tokens.ts\``);
    say(`- Motion: ${(t0.motion ?? []).join(', ') || 'default push'} · transitions/presets: \`.claude/resources/brain/motion.md\``);
    say(`- State / data: ${[...(t0.stores ?? []), ...(t0.data ?? [])].join(', ') || '—'}`);
    say(`- Nav → ${(t0.navOut ?? []).slice(0, 10).map((n) => `${n.method} ${n.to}${n.resolved ? '~' : ''}`).join(' · ') || '—'}`);
    say(`- Nav ← ${(t0.navIn ?? []).slice(0, 8).map((n) => n.from).join(' · ') || '—'}`);
    say('');
    say('## 6. Validate');
    const tt = testsFor(top.map((x) => x.r));
    say(`- Existing tests: ${[...tt.journeys.map((x) => x.id), ...tt.visual.map((x) => x.id)].join(', ') || 'check:routes only (add a journey: .claude/resources/tooling.md)'}`);
    say(`- Run: \`npm run typecheck\` · \`npm run lint:tokens\` · \`npm run check:routes\` · \`node .claude/skills/noon-ui/scripts/snap.mjs ${t0.flow}\`${tt.journeys.length ? ` · \`npm run test:journeys -- ${sortU(tt.journeys.map((x) => x.name)).slice(0, 6).join(' ')}\`` : ''}${tt.visual.length ? ' · `npm run visual:ref`' : ''}`);
    say(`- Acceptance: the "Acceptance" section of the flow's spec (see L2) · rules: \`.claude/resources/brain/README.md\` → Validation`);
    say('');
  }
  say('## 7. Gaps');
  say(gaps.length ? `Nothing in the kit matches: ${gaps.map((g) => `"${g}"`).join(', ')}. Research (Mobbin, \`.claude/skills/noon-ui/references/research.md\`) or ask before inventing.` : 'Every term matched something in the kit; build from the pieces above.');
}

const STOP = new Set(['the', 'and', 'for', 'with', 'page', 'screen', 'flow', 'build', 'make', 'new', 'add', 'create', 'update', 'like', 'noon', 'that', 'this', 'from', 'into', 'show', 'want', 'need', 'please', 'design', 'implement', 'generate']);
const SYN = { basket: ['cart'], bag: ['cart'], product: ['pdp'], detail: ['pdp'], details: ['pdp'], results: ['plp', 'listing'], listing: ['plp'], category: ['categories'], payment: ['checkout', 'pay'], pay: ['checkout', 'payment'], home: ['homepage'], homepage: ['home'], vip: ['noonone', 'membership'], membership: ['noonone'], subscription: ['noonone', 'membership'], profile: ['account'], settings: ['account'], tracking: ['orders', 'track'], order: ['orders'], review: ['reviews', 'rating'], rating: ['reviews', 'rate'], favourite: ['wishlist'], favorite: ['wishlist'], address: ['address'], card: ['cards'], search: ['search', 'suggestions'] };

switch (cmd) {
  case 'context': context(rest); break;
  case 'impact': impact(rest.join(' ')); break;
  case 'deps': deps(rest[0]); break;
  case 'path': path(rest[0], rest[1]); break;
  case 'show': { const id = normalise(rest[0]); const k = id?.replace(/^scr:/, ''); console.log(JSON.stringify(G.screens[k] ?? G.components[id] ?? G.flows[id?.replace(/^flow:/, '')] ?? G.files[id?.replace(/^file:/, '')] ?? null, null, 2)); process.exit(0); }
  default:
    say('usage: npm run brain -- context "<request>" | impact <entity> | deps <screen|cmp> | path <from> <to> | show <id> [--json]');
}
console.log(out.join('\n'));
