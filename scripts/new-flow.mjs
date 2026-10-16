#!/usr/bin/env node
// Scaffold a new flow:  npm run new-flow -- loyalty "noon Loyalty" "Profile"
// Creates src/flows/<id>/{index.ts,tokens.ts,data.ts,<Name>Screen.tsx,<id>.module.css,DESIGN.md} and registers it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [id, title = id, group = 'Flows'] = process.argv.slice(2);
if (!id || !/^[a-z][a-zA-Z0-9]*$/.test(id)) {
  console.error('Usage: npm run new-flow -- <flowId camelCase> ["Title"] ["Sidebar group"]');
  process.exit(1);
}
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/flows', id);
if (existsSync(dir)) {
  console.error(`src/flows/${id} already exists`);
  process.exit(1);
}
const Name = id[0].toUpperCase() + id.slice(1);
mkdirSync(join(dir, 'components'), { recursive: true });

const files = {
  'tokens.ts': `import type { TokenOverrides } from '../../foundations/tokens';

/** Tokens only for the ${title} flow. Override any central token, or add your own keys. */
export const ${id}Tokens = {
  heroGradient: 'linear-gradient(135deg, #0F61FF, #6E51FF)',
} as const;

export const ${id}FlowTokens: TokenOverrides = {
  // colors: { bgPage: '#FFFFFF' },
};
`,
  'data.ts': `import { products } from '../../data';

/** Mock content for ${title}. Keep copy here so PMs can edit text without touching layout. */
export const ${id}Copy = {
  title: '${title}',
  subtitle: 'Describe what this demo shows',
  cta: 'Continue',
  sheetTitle: 'How it works',
  sheetBody: 'Bottom sheets use the Origin layout: grabber above, header, body, footer button.',
  sheetCta: 'Got it',
};

export const ${id}Products = products.slice(0, 4);
`,
  [`${Name}Screen.tsx`]: `import { Button, Header, ProductCard, Screen, SectionCard, SheetBody, SheetFooter, SheetHeader, Text } from '../../components';
import { useNav } from '../../kit/Navigator';
import { FadeIn, Stagger } from '../../motion/recipes';
import { ${id}Copy, ${id}Products } from './data';
import { ${id}Tokens } from './tokens';
import styles from './${id}.module.css';

export function ${Name}Screen() {
  const nav = useNav();
  return (
    <Screen
      header={<Header title={${id}Copy.title} />}
      footer={
        <div className={styles.footer}>
          <Button size="lg" block onClick={() => nav.push('${id}/next', {}, { transition: 'fade-up' })}>
            {${id}Copy.cta}
          </Button>
        </div>
      }
    >
      <FadeIn>
        <div className={styles.hero} style={{ background: ${id}Tokens.heroGradient }}>
          <Text variant="titleLarge" color="textInverse">{${id}Copy.title}</Text>
          <Text color="textInverse">{${id}Copy.subtitle}</Text>
        </div>
      </FadeIn>
      <SectionCard title="Picked for you">
        <Stagger className={styles.grid}>
          {${id}Products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Stagger>
      </SectionCard>
    </Screen>
  );
}

export function ${Name}NextScreen() {
  const nav = useNav();
  return (
    <Screen header={<Header title="Step 2" />}>
      <SectionCard title="All done">
        <Button variant="soft" onClick={() => nav.sheet('${id}/info')}>How it works</Button>
        <Button variant="dark" onClick={() => nav.popToRoot()}>Back to start</Button>
      </SectionCard>
    </Screen>
  );
}

/** Default bottom sheet (Origin M-BottomSheet): the navigator draws the chrome; render only the three slots.
 *  It has a grabber, so no close button. */
export function ${Name}InfoSheet() {
  const nav = useNav();
  return (
    <>
      <SheetHeader title={${id}Copy.sheetTitle} />
      <SheetBody>
        <Text color="textSecondary">{${id}Copy.sheetBody}</Text>
      </SheetBody>
      <SheetFooter primary={{ label: ${id}Copy.sheetCta, onPress: () => nav.back() }} />
    </>
  );
}
`,
  [`${id}.module.css`]: `/* values follow .claude/skills/noon-ui/references/design-rules.md: gutter 12, card r16, tokens only */
.hero { margin: var(--nk-space-s12); padding: var(--nk-space-s24) var(--nk-space-s16); border-radius: var(--nk-radius-r16); display: flex; flex-direction: column; gap: var(--nk-space-s6); }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--nk-space-s12); }
.footer { background: var(--nk-color-bg-surface); padding: var(--nk-space-s12) var(--nk-space-s12) calc(var(--nk-inset-bottom) + var(--nk-space-s8)); box-shadow: var(--nk-shadow-bottom-bar); }
`,
  'index.ts': `import { defineFlow } from '../../kit/registry';
import { lazyScreen } from '../../kit/lazyScreen';

// screens load on demand (only what a page shows is in its first download)
const ${Name}Screen = lazyScreen(() => import('./${Name}Screen'), '${Name}Screen');
const ${Name}NextScreen = lazyScreen(() => import('./${Name}Screen'), '${Name}NextScreen');
const ${Name}InfoSheet = lazyScreen(() => import('./${Name}Screen'), '${Name}InfoSheet');
import { ${id}FlowTokens } from './tokens';

export const ${id}Flow = defineFlow({
  id: '${id}',
  title: '${title}',
  group: '${group}',
  description: 'TODO: one line on what this flow demos.',
  initial: 'main',
  tokens: ${id}FlowTokens,
  screens: [
    { id: 'main', title: '${title}', component: ${Name}Screen, notes: 'TODO: what to try on this screen.' },
    { id: 'next', title: 'Step 2', component: ${Name}NextScreen, transition: 'fade-up' },
    { id: 'info', title: 'How it works', component: ${Name}InfoSheet, presentation: 'sheet', notes: 'Default Origin bottom sheet.' },
  ],
});
`,
};
for (const [f, c] of Object.entries(files)) writeFileSync(join(dir, f), c);

// design record (design-workflow.md → stage E): the template, titled; `npm run skill:check` fails until it is filled in
// (or replaced by a MAPPING.md / FIGMA-MAPPING.md for a port)
const tpl = readFileSync(join(root, '.claude/skills/noon-ui/templates/DESIGN.md'), 'utf8');
writeFileSync(join(dir, 'DESIGN.md'), tpl.replace('# <Flow or screen name>', `# ${title}`).replaceAll('<flow>', id));

// register in src/flows/index.ts
const reg = join(root, 'src/flows/index.ts');
let s = readFileSync(reg, 'utf8');
s = s.replace(/(import type \{ FlowDef \} from '..\/kit\/types';\n)/, `$1import { ${id}Flow } from './${id}';\n`);
s = s.replace(/export \{ ([^}]*) \};/, (_, names) => `export { ${names.trim()}, ${id}Flow };`);
s = s.replace(/export const allFlows: FlowDef\[\] = \[([^\]]*)\];/, (_, names) => `export const allFlows: FlowDef[] = [${names.trim()}, ${id}Flow];`);
writeFileSync(reg, s);

console.log(`✔ Created src/flows/${id}  →  open /${id}/main on the dev server`);
console.log(`  Next: fill in src/flows/${id}/DESIGN.md (.claude/skills/noon-ui/references/design-workflow.md); npm run skill:check fails until it is.`);
