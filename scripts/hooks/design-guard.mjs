#!/usr/bin/env node
// Design guard: a Claude Code PreToolUse hook (wired in .claude/settings.json for Write / Edit / MultiEdit).
// It inspects only the lines an edit ADDS to src/**/*.{ts,tsx,css} and blocks the edit (exit 2, reason on stderr,
// which Claude reads and must address) when they:
//   · add a raw colour literal (#hex, rgb(a), hsl(a)) — use a token (the message names it via scripts/token-map.json)
//   · import a foreign icon or UI library (lucide, react-icons, heroicons, MUI, Chakra, Radix, shadcn `@/components/ui`,
//     styled-components, emotion) — noon uses OriginIcon and src/components
//   · set a raw font-family — use var(--nk-type-*) / <Text variant>
//   · write the text "AED" in a string — prices use the dirham sign `currency`
// Not checked: comments, token definition files (src/foundations/**, src/flows/*/tokens*.ts), src/app/**, lines with
// `token-lint-ignore — <reason>`. Everything else passes (exit 0). Same rules as scripts/token-lint.mjs and
// .claude/skills/noon-ui/references/component-checklist.md.
//
// Manual test:  echo '{"tool_name":"Edit","tool_input":{"file_path":"src/flows/x/a.tsx","old_string":"","new_string":"color: \"#FF0000\""}}' | node scripts/hooks/design-guard.mjs
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../..', import.meta.url).pathname;

let input = '';
try {
  input = readFileSync(0, 'utf8');
} catch {
  process.exit(0);
}
let event;
try {
  event = JSON.parse(input);
} catch {
  process.exit(0); // not a hook payload: never block on our own parsing problems
}

const tool = event.tool_name;
const ti = event.tool_input ?? {};
if (!['Write', 'Edit', 'MultiEdit'].includes(tool) || !ti.file_path) process.exit(0);

const rel = relative(event.cwd ?? root, ti.file_path).replace(/\\/g, '/');
const relRoot = relative(root, ti.file_path.startsWith('/') ? ti.file_path : join(event.cwd ?? root, ti.file_path)).replace(/\\/g, '/');
const path = relRoot.startsWith('..') ? rel : relRoot;
if (!/^src\/.+\.(tsx?|css)$/.test(path)) process.exit(0);
if (/^src\/(foundations|app)\//.test(path) || /^src\/flows\/[^/]+\/tokens(\.[\w-]+)?\.ts$/.test(path) || /\.d\.ts$/.test(path)) process.exit(0);

// the lines this edit adds
let onDisk = '';
try {
  onDisk = readFileSync(join(root, path), 'utf8'); // a Write over an existing file only adds the lines that are new
} catch {
  /* new file */
}
const pairs = tool === 'Write' ? [[onDisk, ti.content ?? '']] : tool === 'Edit' ? [[ti.old_string ?? '', ti.new_string ?? '']] : (ti.edits ?? []).map((e) => [e.old_string ?? '', e.new_string ?? '']);
const added = [];
for (const [oldS, newS] of pairs) {
  const before = new Set(oldS.split('\n').map((l) => l.trim()));
  for (const l of newS.split('\n')) if (!before.has(l.trim())) added.push(l);
}
if (!added.length) process.exit(0);

// strip comments (block comments that span lines are tracked across the added lines)
const isCss = path.endsWith('.css');
let inBlock = false;
const code = added.map((line) => {
  if (line.includes('token-lint-ignore')) return '';
  let out = '';
  let i = 0;
  while (i < line.length) {
    if (inBlock) {
      const end = line.indexOf('*/', i);
      if (end < 0) return out;
      inBlock = false;
      i = end + 2;
      continue;
    }
    const b = line.indexOf('/*', i);
    const s = isCss ? -1 : line.search(/(^|[^:])\/\//);
    const lineComment = s >= 0 ? (line[s] === '/' ? s : s + 1) : -1;
    if (b >= 0 && (lineComment < 0 || b < lineComment)) {
      out += line.slice(i, b);
      inBlock = true;
      i = b + 2;
      continue;
    }
    out += lineComment >= 0 ? line.slice(i, lineComment) : line.slice(i);
    break;
  }
  return out;
});

let map = {};
try {
  map = JSON.parse(readFileSync(join(root, 'scripts/token-map.json'), 'utf8')).colors ?? {};
} catch {
  /* suggestions are optional */
}
const tokenFor = (hex) => {
  const h = hex.toUpperCase();
  const full = h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
  const m = map[full] ?? map[h];
  return m ? ` → ${m.cssVar}` : ' → no token yet: add it to the flow tokens.ts (or palette) with its source';
};

const problems = [];
code.forEach((l, k) => {
  if (!l.trim()) return;
  const ln = `+${k + 1}`;
  for (const m of l.matchAll(/(?<![\w&-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g)) {
    // `#id` selectors / anchors in CSS or strings like '#/cart' aren't colours
    if (isCss && /^\s*#[\w-]+\s*[{,]/.test(l)) continue;
    if (/['"`]#\/|href=/.test(l)) continue;
    problems.push(`${ln} raw colour ${m[0]}${tokenFor(m[0])}`);
  }
  for (const m of l.matchAll(/\b(rgba?|hsla?)\(\s*\d/g)) problems.push(`${ln} raw ${m[1]}() colour → use a --nk-color-* / --nk-palette-* token (alpha variants exist, e.g. --nk-palette-black-alpha10)`);
  const lib = l.match(/from\s+['"](lucide-react|react-icons[^'"]*|@heroicons\/[^'"]*|@mui\/[^'"]*|@material-ui\/[^'"]*|@chakra-ui\/[^'"]*|@radix-ui\/[^'"]*|@\/components\/ui[^'"]*|styled-components|@emotion\/[^'"]*|antd)['"]/);
  if (lib) problems.push(`${ln} imports ${lib[1]} → noon uses <OriginIcon name> (references/icons.md) and src/components; no second design system`);
  // a font-family that falls back to the kit's font (`'Cairo', var(--nk-font-family)`) and @font-face are fine
  if (((/font-family\s*:/i.test(l) && !/@font-face/.test(l)) || /fontFamily\s*:\s*['"`]/.test(l)) && !/var\(--nk-/.test(l)) problems.push(`${ln} raw font-family → use var(--nk-type-*) or <Text variant> (fonts are set by the kit)`);
  // ScreenDef metadata (notes / source / title / description) is developer text, not UI copy
  if (/['"`>][^'"`<]*\bAED\b/.test(l) && !/^\s*(notes|source|title|description)\s*:/.test(l)) problems.push(`${ln} "AED" in text → prices use the dirham sign \`currency\` (src/mocks/products.ts)`);
});

if (!problems.length) process.exit(0);
console.error(
  `noon design guard blocked this edit to ${path}:\n` +
    problems.map((p) => `  ${p}`).join('\n') +
    `\n\nFix it with tokens / OriginIcon / shared components (.claude/skills/noon-ui/references/component-checklist.md). ` +
    `True geometry or a documented exception: add \`token-lint-ignore — <reason>\` on that line.`,
);
process.exit(2);
