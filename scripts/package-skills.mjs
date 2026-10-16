#!/usr/bin/env node
// Packages every skill in .claude/skills as a self-contained zip for the Claude app (Settings → Skills → + Add → Upload):
//   npm run skills:package            → dist-skills/<name>.zip (one per skill) + dist-skills/<name>/ (unzipped, to inspect)
//
// In the repo the skills point outside their own folder (`../noon-ui/…`, `.claude/resources/…`). An uploaded skill
// only has its own folder, so each zip carries what it links to:
//   <name>/SKILL.md, spec.md, references/   the skill itself (links rewritten)
//   <name>/skills/<every skill>/             all skills' markdown (SKILL.md renamed INSTRUCTIONS.md: the Claude app
//                                            accepts exactly one SKILL.md per zip), so cross-skill links resolve
//   <name>/resources/                        .claude/resources (screen index, patterns, tooling, flow briefs)
// Scripts and evals are left out (they need the repo). Paths like `src/flows/…` and `npm run …` still refer to the
// flow-kit repo; a note under the frontmatter says so.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(root, '.claude/skills');
const resourcesDir = join(root, '.claude/resources');
const out = join(root, 'dist-skills');
const skills = readdirSync(skillsDir).filter((d) => existsSync(join(skillsDir, d, 'SKILL.md')));
const repo = (() => {
  try {
    return execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim().replace(/\.git$/, '');
  } catch {
    return 'the noon Flow Kit repo';
  }
})();

/** Markdown files of a folder, without scripts/ and evals/. */
function mdFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) return ['scripts', 'evals'].includes(e) ? [] : mdFiles(p, base);
    return e.endsWith('.md') ? [relative(base, p)] : [];
  });
}

/** Rewrite repo-relative links for a file that sits at `depth` folders below the package root. */
function rewrite(text, { depth, atRoot }) {
  const up = '../'.repeat(depth);
  let s = text.replaceAll('.claude/resources/', `${up}resources/`).replaceAll('.claude/skills/', `${up}skills/`);
  // only the root SKILL.md / spec.md / references need `../<skill>/` → `skills/<skill>/`; copies under skills/ resolve as is
  if (atRoot) s = s.replace(/(?<![\w./])(?:\.\.\/)+([a-z][\w-]*)\//g, (m, name) => (skills.includes(name) ? `${up}skills/${name}/` : m));
  // bundled copies of the skills are INSTRUCTIONS.md: an uploaded zip must contain exactly one SKILL.md
  return s.replace(/((?:skills|\.\.)\/([a-z][\w-]*)\/)SKILL\.md/g, (m, dir, name) => (skills.includes(name) ? `${dir}INSTRUCTIONS.md` : m));
}

const note = (name) => `
> **Packaged skill.** Built from ${repo} (\`.claude/skills/${name}\`) by \`npm run skills:package\`. Everything it links to is bundled:
> the other noon skills in \`skills/<name>/INSTRUCTIONS.md\` (+ spec and references) and the branch resources (screen index, patterns, tooling, per-flow briefs) in \`resources/\`.
> Paths such as \`src/flows/…\`, \`scripts/…\` and \`npm run …\` refer to that repo. Inside the repo (Claude Code), use them directly.
> Anywhere else, treat them as reference: ask the user to share the files you need or to run the commands, and never invent their contents.
> If a screen skill this one routes to (\`/home-page\`, \`/search\`, \`/cart\`, \`/checkout\`, \`/pdp\`, \`/noon-ui\`) isn't installed, read its bundled copy instead: \`skills/<name>/INSTRUCTIONS.md\` and the \`spec.md\` / \`references/\` next to it.
`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const name of skills) {
  const pkg = join(out, name);
  // the skill itself at the root
  for (const f of mdFiles(join(skillsDir, name))) {
    const depth = f.split('/').length - 1;
    let text = rewrite(readFileSync(join(skillsDir, name, f), 'utf8'), { depth, atRoot: true });
    if (f === 'SKILL.md') text = text.replace(/^(---\n[\s\S]*?\n---\n)/, `$1${note(name)}`);
    mkdirSync(dirname(join(pkg, f)), { recursive: true });
    writeFileSync(join(pkg, f), text);
  }
  // every skill's markdown under skills/ (cross-skill links keep working)
  for (const other of skills)
    for (const f of mdFiles(join(skillsDir, other))) {
      const target = join(pkg, 'skills', other, f === 'SKILL.md' ? 'INSTRUCTIONS.md' : f);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, rewrite(readFileSync(join(skillsDir, other, f), 'utf8'), { depth: f.split('/').length + 1, atRoot: false }));
    }
  // shared resources (markdown only)
  for (const f of mdFiles(resourcesDir)) {
    const target = join(pkg, 'resources', f);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(resourcesDir, f), target);
  }
  execFileSync('zip', ['-qr', `${name}.zip`, name], { cwd: out });
  const kb = Math.round(statSync(join(out, `${name}.zip`)).size / 1024);
  console.log(`dist-skills/${name}.zip  ${kb} KB`);
}
console.log('\nUpload: Claude app → Settings → Skills (Customize → Skills) → + Add → Upload a skill → pick a zip. Upload noon-ui first.');
