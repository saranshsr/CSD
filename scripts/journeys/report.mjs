// Writes test-results/journeys/report.{json,md} and prints the categorised summary at the end of a run.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const CATEGORIES = {
  startup: 'Build / startup failures',
  behaviour: 'Behavioural failures (assertions)',
  console: 'Console / page errors',
  visual: 'Visual-capture issues',
  a11y: 'Accessibility findings (warnings)',
};

/**
 * results: [{ name, title, area, status: 'pass'|'fail'|'known-fail'|'unexpected-pass'|'flaky', category?, error?,
 *             known?, consoleErrors: [], checkpoints: [{ n, label, file, route }], visual: [], a11y: [], seconds }]
 * startup: [{ message }] (failures before any journey ran)
 */
export function writeReport(outRoot, { base, startedAt, results, startup }) {
  // a11y findings: dedupe across journeys by rule + route + detail, keep where they were seen
  const a11y = new Map();
  for (const r of results)
    for (const f of r.a11y) {
      const key = `${f.rule}|${f.route}|${f.detail}`;
      const cur = a11y.get(key) ?? { ...f, journeys: [] };
      cur.count = Math.max(cur.count ?? 1, f.count ?? 1);
      if (!cur.journeys.includes(r.name)) cur.journeys.push(r.name);
      a11y.set(key, cur);
    }
  const a11yList = [...a11y.values()].sort((a, b) => a.rule.localeCompare(b.rule) || a.route.localeCompare(b.route));
  const cats = {
    startup: [...startup.map((s) => ({ journey: '(runner)', message: s.message })), ...results.filter((r) => r.category === 'startup').map((r) => ({ journey: r.name, message: r.error }))],
    behaviour: results.filter((r) => r.category === 'behaviour').map((r) => ({ journey: r.name, message: r.error, known: r.known })),
    console: results.flatMap((r) => r.consoleErrors.map((m) => ({ journey: r.name, message: m }))),
    visual: results.flatMap((r) => r.visual.map((v) => ({ journey: r.name, ...v }))),
    a11y: a11yList,
  };
  const count = (s) => results.filter((r) => r.status === s).length;
  const summary = {
    journeys: results.length,
    pass: count('pass'),
    flaky: count('flaky'),
    fail: count('fail'),
    knownFail: count('known-fail'),
    unexpectedPass: count('unexpected-pass'),
    startupFailures: cats.startup.length,
    consoleErrors: cats.console.length,
    visualIssues: cats.visual.length,
    a11yFindings: cats.a11y.length,
    ok: !cats.startup.length && !results.some((r) => r.status === 'fail'),
  };
  const json = { base, startedAt, finishedAt: new Date().toISOString(), summary, categories: cats, journeys: results };
  writeFileSync(join(outRoot, 'report.json'), `${JSON.stringify(json, null, 2)}\n`);

  const md = [];
  md.push('# Journey report', '');
  md.push(`${startedAt} · ${base} · ${summary.journeys} journeys: **${summary.pass} pass**, ${summary.flaky} flaky, **${summary.fail} fail**, ${summary.knownFail} known failure(s), ${summary.unexpectedPass} unexpectedly passing.`, '');
  md.push('| Journey | Area | Result | Checkpoints | Time | Note |', '|---|---|---|---|---|---|');
  for (const r of results) md.push(`| \`${r.name}\` | ${r.area} | ${r.status} | ${r.checkpoints.length} | ${r.seconds.toFixed(1)}s | ${(r.status === 'pass' ? '' : r.error ?? r.known ?? '').replace(/\|/g, '\\|').slice(0, 200)} |`);
  md.push('');
  const section = (key, rows, fmt) => {
    md.push(`## ${CATEGORIES[key]} (${rows.length})`, '');
    if (!rows.length) md.push('None.', '');
    else md.push(...rows.map(fmt), '');
  };
  section('startup', cats.startup, (x) => `- **${x.journey}**: ${x.message}`);
  section('behaviour', cats.behaviour, (x) => `- **${x.journey}**${x.known ? ' (known failure)' : ''}: ${x.message}${x.known ? `\n  - why: ${x.known}` : ''}`);
  section('console', cats.console, (x) => `- **${x.journey}**: \`${x.message.slice(0, 300).replace(/`/g, "'")}\``);
  section('visual', cats.visual, (x) => `- **${x.journey}** \`${x.checkpoint}\`: ${x.issue}`);
  section('a11y', cats.a11y, (x) => `- \`${x.rule}\` on \`${x.route}\`: ${x.detail}${x.count > 1 ? ` ×${x.count}` : ''} (seen in ${x.journeys.join(', ')})`);
  md.push('Screenshots: `test-results/journeys/<journey>/<nn>-<checkpoint>.png`.', '');
  writeFileSync(join(outRoot, 'report.md'), md.join('\n'));
  return { summary, cats };
}

export function printSummary({ summary, cats }) {
  const line = (key, n) => `  ${CATEGORIES[key].padEnd(36)} ${n}`;
  console.log('\nSummary');
  console.log(line('startup', cats.startup.length));
  console.log(line('behaviour', cats.behaviour.filter((x) => !x.known).length) + (cats.behaviour.some((x) => x.known) ? ` (+${cats.behaviour.filter((x) => x.known).length} known)` : ''));
  console.log(line('console', cats.console.length));
  console.log(line('visual', cats.visual.length));
  console.log(line('a11y', cats.a11y.length));
  const byRule = {};
  for (const f of cats.a11y) byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
  if (cats.a11y.length) console.log(`    ${Object.entries(byRule).map(([k, v]) => `${k}: ${v}`).join(' · ')}`);
  for (const x of cats.startup) console.log(`  ✗ startup  ${x.journey}: ${x.message}`);
  for (const x of cats.console.slice(0, 8)) console.log(`  ✗ console  ${x.journey}: ${x.message.split('\n')[0].slice(0, 160)}`);
  for (const x of cats.visual.slice(0, 8)) console.log(`  ! visual   ${x.journey} ${x.checkpoint}: ${x.issue}`);
}
