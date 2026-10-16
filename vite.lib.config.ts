import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

/**
 * Library build: lets any React repo `import { NoonPrototype, homeFlow, Button } from '@noon/flow-kit'`.
 *
 * Not Vite "lib mode" on purpose — lib mode base64-inlines every asset (hero images, lotties, fonts) into the
 * JS, which made the package ~23 MB. This is a plain ES build instead:
 * - one module per source file (preserveModules) so consumers tree-shake flows/components they don't import;
 * - assets emitted as files and referenced with `new URL('./x', import.meta.url)` (resolved by Vite / webpack 5);
 * - all CSS in one `noon-flow-kit.css` (exported as `@noon/flow-kit/style.css`).
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@kit': fileURLToPath(new URL('./src', import.meta.url)), '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)) } },
  assetsInclude: ['**/*.lottie'],
  publicDir: false,
  experimental: { renderBuiltUrl: () => ({ relative: true }) },
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    copyPublicDir: false,
    rollupOptions: {
      // Public entry points (package.json "exports"). Listed explicitly so pure re-export barrels (components/index)
      // still get their own file under preserveModules.
      input: {
        index: 'src/index.ts',
        'components/index': 'src/components/index.ts',
        'foundations/tokens': 'src/foundations/tokens.ts',
        'data/index': 'src/data/index.ts',
        'flows/index': 'src/flows/index.ts',
        ...Object.fromEntries(
          readdirSync('src/flows', { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => [`flows/${d.name}/index`, `src/flows/${d.name}/index.ts`]),
        ),
      },
      preserveEntrySignatures: 'strict',
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^motion($|\/)/, 'lucide-react', /^@lottiefiles\//],
      output: {
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: (info) => (info.names?.some((n) => n.endsWith('.css')) ? 'noon-flow-kit.css' : 'assets/[name]-[hash][extname]'),
      },
    },
  },
});
