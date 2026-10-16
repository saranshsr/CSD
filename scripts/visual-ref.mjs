// Reference fidelity: compares the kit against EXTERNAL references (Figma exports, real-app screenshots) stored in
// visual/refs/, one entry per reference in visual/refs/manifest.json (manifest.defaults hold the default thresholds).
// For each entry it renders the route at the reference's viewport width with the deterministic capture of
// scripts/lib/capture.mjs (fixed clock, seeded random, CSS transitions off, Lottie / GIF stills, reduced motion),
// captures the selected element(s) at the reference's scale, and reports:
//   · geometry: captured box vs the reference (size delta, position delta when the entry gives refPosition)
//   · pixels: share of differing pixels (masked areas excluded), worst regions and 24px cells (reference CSS px)
//   · colour: ΔE76 mean / p95 / max and the most common ref → kit colour swaps
//   · element checks (entry.checks): a selector's box against values read from the reference, sticky after scroll
// Each entry is PASS (within threshold), NEEDS-REVIEW (over threshold but under failThreshold, size off by more than
// sizeTolerance but at most failSizeTolerance, the capture never settled, a selector matched several elements, masks
// hide most of the frame) or FAIL (over failThreshold / failSizeTolerance, selector missing, console errors). A human
// decides every NEEDS-REVIEW: fix the kit, replace the reference with a fresh export (--set-ref), or accept the
// difference (--accept, recorded in the manifest with who/when/why and pinned to the reference file's hash).
//
//   npm run visual:ref                    # all references (starts its own Vite server unless PORT is set)
//   npm run visual:ref -- cart            # entries whose name contains "cart"
//   npm run visual:ref -- --coverage      # registered screens with / without a reference (coverage.md / .json)
//   node scripts/visual-ref.mjs --accept <name> --by "<who>" --note "<why it is fine>"     # after a human review
//   node scripts/visual-ref.mjs --set-ref <name> --from <export.png> --source "Figma <file> · <node>, exported YYYY-MM-DD"
//
// Output: test-results/visual-ref/report.{md,json} and <name>.{kit,ref,diff,compare}.png (git-ignored).
// Exit code: 0 all PASS · 1 any FAIL · 2 NEEDS-REVIEW only.
// Rule: references only ever come from outside the kit. Nothing here writes a kit capture into visual/refs/, and
// --set-ref refuses files that are kit captures — a kit screenshot is never its own baseline (that's
// `npm run visual:snap`, a regression check against the kit's previous self).
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import sharp from 'sharp';
import { openCapture } from './lib/capture.mjs';
import { compare, rawRgb, sideBySide, writeRgb } from './lib/compare.mjs';

const root = new URL('..', import.meta.url).pathname;
const refsDir = join(root, 'visual/refs');
const manifestPath = join(refsDir, 'manifest.json');
const outDir = join(root, 'test-results/visual-ref');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const DEFAULTS = { threshold: 0.05, failFactor: 3, sizeTolerance: 2, failSizeTolerance: 8, positionTolerance: 2, channelTolerance: 40, cell: 24, regionShare: 0.2, maxMaskedShare: 0.4, acceptSlack: 0.005, ...manifest.defaults };
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16);
const saveManifest = () => writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const args = process.argv.slice(2);
const take = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? undefined : args.splice(i, 2)[1];
};
const flag = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? false : (args.splice(i, 1), true);
};

// ── --accept: a human looked at the report and decided the remaining difference is fine ───────────────────────────
const acceptName = take('--accept');
if (acceptName) {
  const by = take('--by');
  const note = take('--note');
  const entry = manifest.refs.find((r) => r.name === acceptName);
  const last = existsSync(join(outDir, 'report.json')) ? JSON.parse(readFileSync(join(outDir, 'report.json'), 'utf8')).entries.find((e) => e.name === acceptName) : null;
  if (!entry || !last) die(`✗ no manifest entry or no report for "${acceptName}" — run \`npm run visual:ref -- ${acceptName}\` first`);
  if (!by || !note) die('✗ --accept needs --by "<who reviewed it>" and --note "<why the difference is fine>"');
  if (last.hard?.length) die(`✗ "${acceptName}" has hard failures that can't be accepted: ${last.hard.join('; ')}`);
  entry.review = { by, date: new Date().toISOString().slice(0, 10), note, refSha: sha(join(refsDir, entry.file)), share: +last.pixels.share.toFixed(4), size: last.geometry.delta };
  saveManifest();
  console.log(`✓ accepted ${acceptName}: diff ${(last.pixels.share * 100).toFixed(1)}%, size Δ ${last.geometry.delta.w}×${last.geometry.delta.h} by ${by} (visual/refs/manifest.json). A larger diff or a new reference file needs review again.`);
  process.exit(0);
}

// ── --set-ref: replace a reference image with a fresh EXTERNAL export ──────────────────────────────────────────────
const setName = take('--set-ref');
if (setName) {
  const from = take('--from');
  const source = take('--source');
  const entry = manifest.refs.find((r) => r.name === setName);
  if (!entry) die(`✗ no manifest entry "${setName}" (add new entries to visual/refs/manifest.json by hand)`);
  if (!from || !existsSync(from)) die('✗ --set-ref needs --from <png exported from Figma or captured from the real app>');
  if (!source || !/\d{4}-\d{2}-\d{2}/.test(source)) die('✗ --set-ref needs --source "<where it came from>, exported YYYY-MM-DD"');
  const abs = realpathSync(resolve(from));
  const kitDirs = [join(root, 'test-results'), '/tmp/noon-ui-snap', join(root, 'visual/refs')].map((d) => (existsSync(d) ? realpathSync(d) : d));
  const kitShas = existsSync(outDir) ? readdirSync(outDir).filter((f) => f.endsWith('.kit.png')).map((f) => sha(join(outDir, f))) : [];
  const sidecar = abs.replace(/\.png$/i, '.json');
  const isCapture = existsSync(sidecar) && /"profile"/.test(readFileSync(sidecar, 'utf8'));
  if (kitDirs.some((d) => abs.startsWith(`${d}/`)) || kitShas.includes(sha(abs)) || isCapture) die(`✗ ${from} is a kit capture (or lives next to them). References must come from outside the kit: export the Figma frame or screenshot the real app.`);
  copyFileSync(abs, join(refsDir, entry.file));
  entry.source = source;
  delete entry.review;
  saveManifest();
  const m = await sharp(join(refsDir, entry.file)).metadata();
  console.log(`✓ visual/refs/${entry.file} ← ${from} (${m.width}×${m.height}); source updated, previous review cleared. Check refCrop / masks / scale, then run \`npm run visual:ref -- ${setName}\`.`);
  process.exit(0);
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}

const coverage = flag('--coverage');
const only = args.filter((a) => !a.startsWith('-'));
mkdirSync(outDir, { recursive: true });

let server;
let base;
if (process.env.PORT) base = `http://localhost:${process.env.PORT}/`;
else {
  const { createServer } = await import('vite');
  server = await createServer({ root, logLevel: 'error', server: { port: 5198, strictPort: false } });
  await server.listen();
  base = server.resolvedUrls.local[0];
}
const session = await openCapture({ base });
if (!(await session.reachable())) {
  await session.close();
  die(`✗ dev server not reachable at ${base}`);
}

// ── --coverage: which registered screens have an external reference ─────────────────────────────────────────────────
if (coverage) {
  const routes = await session.routes();
  await session.close();
  await server?.close();
  const truth = {};
  try {
    for (const line of readFileSync(join(root, '.claude/resources/screens.md'), 'utf8').split('\n')) {
      const m = line.match(/^\| `([^`]+)` \|[^|]*\|[^|]*\|[^|]*\| ([^|]*) \| ([^|]*) \|/);
      if (m) truth[m[1]] = { truth: m[2].trim(), verified: m[3].trim() };
    }
  } catch { /* screens.md is optional */ }
  const byRoute = {};
  for (const r of manifest.refs) (byRoute[r.route.split('?')[0]] ??= []).push(r.name);
  const rows = routes.map((r) => ({ route: r, refs: byRoute[r] ?? [], ...(truth[r] ?? {}) }));
  const flows = {};
  for (const row of rows) (flows[row.route.split('/')[0]] ??= []).push(row);
  const withRef = rows.filter((r) => r.refs.length);
  const figmaNoRef = rows.filter((r) => !r.refs.length && /figma|mixed/.test(r.truth ?? ''));
  const md = [
    '# Visual reference coverage',
    '',
    `${new Date().toISOString().slice(0, 10)} · ${rows.length} registered screens · **${withRef.length} with an external reference** · ${rows.length - withRef.length} rendered, not visually verified · ${manifest.refs.length} reference entries.`,
    '',
    'A reference verifies only the region it selects (a footer, a card row), not the whole screen.',
    '',
    '## Screens with references',
    '',
    '| Route | References | Truth |',
    '|---|---|---|',
    ...withRef.map((r) => `| \`${r.route}\` | ${r.refs.join(', ')} | ${r.truth ?? ''} |`),
    '',
    `## Figma / mixed truth but no reference (${figmaNoRef.length}) — add these first`,
    '',
    figmaNoRef.map((r) => `\`${r.route}\``).join(' · ') || '(none)',
    '',
    '## Per flow',
    '',
    '| Flow | Screens | With reference | Without |',
    '|---|---|---|---|',
    ...Object.entries(flows).map(([f, list]) => `| ${f} | ${list.length} | ${list.filter((r) => r.refs.length).map((r) => `\`${r.route}\``).join(' ') || 0} | ${list.filter((r) => !r.refs.length).length} |`),
    '',
  ].join('\n');
  writeFileSync(join(outDir, 'coverage.md'), md);
  writeFileSync(join(outDir, 'coverage.json'), `${JSON.stringify({ total: rows.length, withReference: withRef.length, entries: manifest.refs.length, rows }, null, 2)}\n`);
  console.log(md);
  console.log(`→ test-results/visual-ref/coverage.{md,json}`);
  process.exit(0);
}

// ── run the references ─────────────────────────────────────────────────────────────────────────────────────────────
const port = new URL(base).port;
const entries = manifest.refs.filter((r) => !only.length || only.some((o) => r.name.includes(o)));
if (!entries.length) die(`✗ no reference matches ${only.join(', ')}`);
const results = [];
const pct = (v) => `${(v * 100).toFixed(1)}%`;

for (const ref of entries) {
  const o = { ...DEFAULTS, ...ref };
  o.failThreshold = ref.failThreshold ?? o.threshold * o.failFactor;
  const scale = ref.scale ?? 1;
  const files = { kit: `${ref.name}.kit.png`, ref: `${ref.name}.ref.png`, diff: `${ref.name}.diff.png`, compare: `${ref.name}.compare.png` };
  const res = { name: ref.name, route: ref.route, source: ref.source, refFile: `visual/refs/${ref.file}`, status: 'PASS', reasons: [], hard: [], warnings: [], images: files, thresholds: { threshold: o.threshold, failThreshold: o.failThreshold, sizeTolerance: o.sizeTolerance, failSizeTolerance: o.failSizeTolerance, positionTolerance: o.positionTolerance, channelTolerance: o.channelTolerance } };
  res.commands = {
    rerun: `PORT=${port} npm run visual:ref -- ${ref.name}`,
    shot: `PORT=${port} node scripts/shot.mjs '${ref.route}' /tmp/${ref.name}.png`,
    accept: `node scripts/visual-ref.mjs --accept ${ref.name} --by "<your name>" --note "<why the difference is fine>"`,
    updateRef: `node scripts/visual-ref.mjs --set-ref ${ref.name} --from <fresh-export.png> --source "<Figma file · node / app build>, exported YYYY-MM-DD"`,
  };
  results.push(res);
  const refPath = join(refsDir, ref.file);
  if (!existsSync(refPath)) { res.hard.push(`reference file missing: visual/refs/${ref.file}`); finish(res); continue; }

  const checks = (ref.checks ?? []).flatMap((c) => (c.sticky != null ? [{ name: `${c.name}@top`, selector: c.selector }, { name: `${c.name}@scroll`, selector: c.selector, scroll: c.sticky }] : [{ name: c.name, selector: c.selector, scroll: c.scroll }]));
  const shot = await session.capture(ref.route, { target: ref.select, dpr: scale, screenWidth: ref.viewport ?? 390, screenHeight: ref.viewportHeight, scroll: ref.scrollTo, steps: ref.steps, wait: ref.wait, measure: checks, tool: 'visual-ref' });
  res.capture = { url: shot.meta.url, profile: shot.meta.profile, steps: shot.meta.steps, scroll: shot.meta.scroll, settle: shot.meta.settle, clock: shot.meta.clock, lottie: shot.meta.lottie };
  if (shot.errors.length) res.hard.push(`console / capture errors: ${shot.errors.slice(0, 3).join(' | ')}`);
  if (!shot.buffer) { res.hard.push(`selector(s) not found on ${ref.route}: ${(shot.box?.missing ?? ref.select).join(', ')}`); finish(res); continue; }
  if (shot.box.matches?.some((n) => n > 1) && !ref.allowMultiple) res.reasons.push(`ambiguous selector: ${ref.select.map((s, i) => `${s} → ${shot.box.matches[i]}`).filter((_, i) => shot.box.matches[i] > 1).join('; ')} visible matches (the first is used; tighten it or set allowMultiple)`);
  if (shot.meta.settle && !shot.meta.settle.stable) res.reasons.push('the kit capture never settled (moving content inside the phone): the diff may be noise');
  writeFileSync(join(outDir, files.kit), shot.buffer);

  // reference (optionally cropped)
  const meta = await sharp(refPath).metadata();
  const crop = ref.refCrop ? { left: ref.refCrop[0] * 1, top: ref.refCrop[1], width: ref.refCrop[2], height: ref.refCrop[3] } : { left: 0, top: 0, width: meta.width, height: meta.height };
  if (crop.left + crop.width > meta.width || crop.top + crop.height > meta.height) { res.hard.push(`refCrop ${ref.refCrop} is outside the ${meta.width}×${meta.height} reference`); finish(res); continue; }
  await sharp(refPath).extract(crop).png().toFile(join(outDir, files.ref));
  const W = crop.width;
  const H = crop.height;

  // geometry
  const kit = { x: +shot.box.inPhone.x.toFixed(1), y: +shot.box.inPhone.y.toFixed(1), w: +shot.box.width.toFixed(1), h: +shot.box.height.toFixed(1) };
  const refBox = { w: W / scale, h: H / scale, ...(ref.refPosition ? { x: ref.refPosition[0], y: ref.refPosition[1] } : {}) };
  const delta = { w: +(kit.w - refBox.w).toFixed(1), h: +(kit.h - refBox.h).toFixed(1), ...(ref.refPosition ? { x: +(kit.x - refBox.x).toFixed(1), y: +(kit.y - refBox.y).toFixed(1) } : {}) };
  res.geometry = { kit, ref: refBox, delta, resized: Math.round(kit.w * scale) !== W || Math.round(kit.h * scale) !== H, position: ref.refPosition ? 'checked' : 'not checked (no refPosition: the reference is a component export)' };
  const worstGeo = Math.max(...Object.values(delta).map(Math.abs));
  if (worstGeo > o.failSizeTolerance) res.hard.push(`geometry off by ${worstGeo}px (> failSizeTolerance ${o.failSizeTolerance}px): Δ ${JSON.stringify(delta)}`);
  else if (worstGeo > o.sizeTolerance) res.reasons.push(`geometry off by ${worstGeo}px (> sizeTolerance ${o.sizeTolerance}px): Δ ${JSON.stringify(delta)}`);

  // pixels
  const [a, b] = await Promise.all([rawRgb(join(outDir, files.ref)), rawRgb(shot.buffer, { width: W, height: H })]);
  const cmp = compare(a.data, b.data, { width: W, height: H, scale, masks: ref.masks ?? [], channelTolerance: o.channelTolerance, cell: o.cell, regionShare: o.regionShare });
  await writeRgb(cmp.diff, W, H, join(outDir, files.diff));
  await sideBySide([join(outDir, files.ref), join(outDir, files.kit), join(outDir, files.diff)], join(outDir, files.compare), Math.min(H, 900));
  res.pixels = { share: cmp.share, counted: cmp.counted, different: cmp.different, maskedShare: +cmp.maskedShare.toFixed(3) };
  res.regions = cmp.regions.slice(0, 5).map((r) => ({ ...r, share: +r.share.toFixed(3) }));
  res.worstCells = cmp.cells.filter((c) => c.share > o.regionShare).sort((p, q) => q.share - p.share).slice(0, 6).map((c) => ({ x: c.x, y: c.y, share: +c.share.toFixed(2) }));
  res.colour = cmp.colour;
  if (cmp.maskedShare > o.maxMaskedShare) res.reasons.push(`masks hide ${pct(cmp.maskedShare)} of the frame (> ${pct(o.maxMaskedShare)}): too little left to compare`);
  if (cmp.share > o.failThreshold) res.hard.push(`diff ${pct(cmp.share)} > failThreshold ${pct(o.failThreshold)}`);
  else if (cmp.share > o.threshold) res.reasons.push(`diff ${pct(cmp.share)} > threshold ${pct(o.threshold)}`);

  // element checks
  res.checks = (ref.checks ?? []).map((c) => {
    const tol = c.tolerance ?? o.positionTolerance;
    const got = (n) => shot.meta.measure?.find((m) => m.name === n);
    if (c.sticky != null) {
      const top = got(`${c.name}@top`);
      const after = got(`${c.name}@scroll`);
      if (!top?.box || !after?.box) return { name: c.name, status: 'FAIL', detail: top?.error ?? after?.error ?? 'not measured' };
      const moved = Math.max(...['x', 'y', 'width', 'height'].map((k) => Math.abs(after.box[k] - top.box[k])));
      const exp = c.expect ? Object.entries(c.expect).map(([k, v]) => [k, v, after.box[k]]) : [];
      const off = Math.max(moved, ...exp.map(([, v, g]) => Math.abs(g - v)));
      return { name: c.name, status: off <= tol ? 'PASS' : off <= o.failSizeTolerance ? 'NEEDS-REVIEW' : 'FAIL', detail: `after scrolling ${c.sticky}px it moved ${moved.toFixed(1)}px${exp.map(([k, v, g]) => ` · ${k} ${g.toFixed(1)} vs ${v}`).join('')}`, box: after.box, source: c.source };
    }
    const m = got(c.name);
    if (!m?.box) return { name: c.name, status: 'FAIL', detail: m?.error ?? 'not measured' };
    const exp = Object.entries(c.expect ?? {}).map(([k, v]) => [k, v, m.box[k]]);
    const off = Math.max(0, ...exp.map(([, v, g]) => Math.abs(g - v)));
    return { name: c.name, status: off <= tol ? 'PASS' : off <= o.failSizeTolerance ? 'NEEDS-REVIEW' : 'FAIL', detail: exp.map(([k, v, g]) => `${k} ${g.toFixed(1)} vs ${v}`).join(' · '), box: m.box, source: c.source };
  });
  for (const c of res.checks) {
    if (c.status === 'FAIL') res.hard.push(`check "${c.name}": ${c.detail}`);
    else if (c.status === 'NEEDS-REVIEW') res.reasons.push(`check "${c.name}": ${c.detail}`);
  }
  if (!/\d{4}-\d{2}-\d{2}/.test(ref.source ?? '')) res.warnings.push('source has no export date');

  // a recorded human acceptance covers the metrics it was given for (same reference file, diff not grown)
  if (ref.review && !res.hard.length) {
    const same = ref.review.refSha === sha(refPath);
    const within = cmp.share <= ref.review.share + o.acceptSlack && Math.abs(delta.w - (ref.review.size?.w ?? 0)) <= 1 && Math.abs(delta.h - (ref.review.size?.h ?? 0)) <= 1;
    if (same && within && !res.checks.some((c) => c.status !== 'PASS')) {
      res.accepted = ref.review;
      res.reasons = [];
    } else res.warnings.push(`review by ${ref.review.by} on ${ref.review.date} no longer applies (${same ? 'the diff grew' : 'the reference file changed'})`);
  }
  finish(res);
}

function finish(res) {
  res.status = res.hard.length ? 'FAIL' : res.reasons.length ? 'NEEDS-REVIEW' : 'PASS';
  const g = res.geometry;
  const icon = { PASS: '✓', 'NEEDS-REVIEW': '?', FAIL: '✗' }[res.status];
  console.log(
    `${icon} ${res.status.padEnd(12)} ${res.name.padEnd(28)}` +
      (res.pixels ? ` diff ${pct(res.pixels.share)} (pass ≤ ${pct(res.thresholds.threshold)}, fail > ${pct(res.thresholds.failThreshold)})` : '') +
      (g ? ` · box ${g.kit.w}×${g.kit.h} vs ${g.ref.w}×${g.ref.h} (Δ ${g.delta.w}, ${g.delta.h})` : '') +
      (res.colour ? ` · ΔE mean ${res.colour.deltaE.mean} p95 ${res.colour.deltaE.p95}` : '') +
      (res.accepted ? `\n    accepted by ${res.accepted.by} on ${res.accepted.date}: ${res.accepted.note}` : '') +
      [...res.hard, ...res.reasons].map((r) => `\n    · ${r}`).join('') +
      (res.regions?.length ? `\n    worst regions (ref CSS px x,y w×h · share): ${res.regions.slice(0, 3).map((r) => `${r.x},${r.y} ${r.w}×${r.h} · ${pct(r.share)}`).join('  ')}` : '') +
      (res.colour?.swaps?.length ? `\n    colour swaps (ref → kit): ${res.colour.swaps.slice(0, 3).map((s) => `${s.ref}→${s.kit} ${pct(s.share)}`).join('  ')}` : '') +
      (res.checks?.length ? `\n    checks: ${res.checks.map((c) => `${c.status === 'PASS' ? '✓' : '✗'} ${c.name} (${c.detail})`).join(' · ')}` : '') +
      `\n    ${res.source}`,
  );
}

await session.close();
await server?.close();

// ── report.json / report.md ─────────────────────────────────────────────────────────────────────────────────────────
const summary = { PASS: 0, 'NEEDS-REVIEW': 0, FAIL: 0 };
for (const r of results) summary[r.status]++;
const report = { generatedAt: new Date().toISOString(), base, defaults: DEFAULTS, profile: session.profile, summary, entries: results };
writeFileSync(join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
const md = [
  '# Visual reference report',
  '',
  `${report.generatedAt} · ${base} · **${summary.PASS} PASS · ${summary['NEEDS-REVIEW']} NEEDS-REVIEW · ${summary.FAIL} FAIL**`,
  '',
  'PASS = within the entry\'s thresholds (or a recorded human acceptance still applies). NEEDS-REVIEW = a human decides: fix the kit, replace the reference with a fresh export, or accept the difference. FAIL = far off, or broken (selector missing, console errors). Screens without a reference are rendered, not visually verified (`npm run visual:ref -- --coverage`).',
  '',
  '| Status | Reference | Route | Diff | Box kit vs ref | ΔE mean / p95 |',
  '|---|---|---|---|---|---|',
  ...results.map((r) => `| ${r.status}${r.accepted ? ' (accepted)' : ''} | [${r.name}](#${r.name}) | \`${r.route}\` | ${r.pixels ? `${pct(r.pixels.share)} / ${pct(r.thresholds.threshold)}` : '—'} | ${r.geometry ? `${r.geometry.kit.w}×${r.geometry.kit.h} vs ${r.geometry.ref.w}×${r.geometry.ref.h}` : '—'} | ${r.colour ? `${r.colour.deltaE.mean} / ${r.colour.deltaE.p95}` : '—'} |`),
  '',
  ...results.flatMap((r) => [
    `## ${r.name}`,
    '',
    `**${r.status}**${r.accepted ? ` — accepted by ${r.accepted.by} on ${r.accepted.date}: ${r.accepted.note}` : ''} · \`${r.route}\` · ${r.source}`,
    '',
    ...(r.hard.length || r.reasons.length ? [...r.hard.map((h) => `- FAIL: ${h}`), ...r.reasons.map((h) => `- review: ${h}`), ''] : []),
    ...(r.warnings.length ? [...r.warnings.map((w) => `- note: ${w}`), ''] : []),
    ...(r.pixels ? [`![ref | kit | diff](${r.images.compare})`, '', `[ref](${r.images.ref}) · [kit](${r.images.kit}) · [diff](${r.images.diff}) (red = differs, blue = masked, grey = same)`, ''] : []),
    ...(r.geometry ? [`- Geometry: kit ${r.geometry.kit.w}×${r.geometry.kit.h} at (${r.geometry.kit.x}, ${r.geometry.kit.y}) in the screen · ref ${r.geometry.ref.w}×${r.geometry.ref.h} · Δ ${JSON.stringify(r.geometry.delta)} (tolerance ${r.thresholds.sizeTolerance}px, fail > ${r.thresholds.failSizeTolerance}px) · position ${r.geometry.position}${r.geometry.resized ? ' · kit resized onto the reference for the pixel diff' : ''}`] : []),
    ...(r.pixels ? [`- Pixels: ${pct(r.pixels.share)} differ (${r.pixels.different} of ${r.pixels.counted}; ${pct(r.pixels.maskedShare)} masked; channel tolerance ${r.thresholds.channelTolerance})`] : []),
    ...(r.regions?.length ? [`- Worst regions (ref CSS px): ${r.regions.map((g) => `(${g.x}, ${g.y}) ${g.w}×${g.h} ${pct(g.share)}`).join(' · ')}`] : []),
    ...(r.colour ? [`- Colour: ΔE76 mean ${r.colour.deltaE.mean}, p95 ${r.colour.deltaE.p95}, max ${r.colour.deltaE.max}${r.colour.swaps.length ? ` · most common swaps ref → kit: ${r.colour.swaps.map((s) => `${s.ref} → ${s.kit} (${pct(s.share)})`).join(', ')}` : ''}`] : []),
    ...(r.checks?.length ? [`- Checks: ${r.checks.map((c) => `${c.status} ${c.name}: ${c.detail}`).join(' · ')}`] : []),
    ...(r.capture ? [`- Capture: ${r.capture.profile.screen.width}×${r.capture.profile.screen.height} screen at dpr ${r.capture.profile.dpr}, clock ${r.capture.clock?.mode ?? 'real'} (+${r.capture.clock?.pageMs ?? '?'}ms), ${r.capture.settle?.stable ? 'settled' : 'never settled'}${r.capture.steps?.length ? `, steps ${JSON.stringify(r.capture.steps.map(({ ms, stable, ...s }) => s))}` : ''}`] : []),
    '',
    ...(r.status !== 'PASS'
      ? ['Next step (a human decides):', '', '```sh', `${r.commands.shot}   # look at the screen`, `${r.commands.rerun}   # after fixing the kit`, `${r.commands.updateRef}   # the reference is outdated`, `${r.commands.accept}   # the difference is intended`, '```', '']
      : []),
  ]),
].join('\n');
writeFileSync(join(outDir, 'report.md'), md);
console.log(`\n${summary.PASS} PASS · ${summary['NEEDS-REVIEW']} NEEDS-REVIEW · ${summary.FAIL} FAIL → ${relative(root, join(outDir, 'report.md'))} (images in ${relative(root, outDir)}/)`);
process.exit(summary.FAIL ? 1 : summary['NEEDS-REVIEW'] ? 2 : 0);
