import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * Dev only: the server sends every file with `Cache-Control: no-cache`, so each reload re-asks for hundreds of images,
 * icons, fonts and Lotties. Static assets may be served from the browser cache right away and are re-checked in the
 * background (stale-while-revalidate), so an edited image still shows up on the next reload. Code modules keep Vite's
 * own headers (HMR depends on them).
 */
const ASSET = /\.(webp|png|jpe?g|gif|svg|avif|mp4|webm|lottie|woff2?|ttf|otf|wasm)$/i;
function devAssetCache(): Plugin {
  return {
    name: 'nk-dev-asset-cache',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] ?? '';
        // `?import` / `?url` requests are JS modules that export the URL, not the file itself
        if (ASSET.test(path) && !/[?&](import|url|raw|inline)\b/.test(req.url ?? '')) {
          const setHeader = res.setHeader.bind(res);
          res.setHeader = (name, value) => setHeader(name, name.toLowerCase() === 'cache-control' ? 'max-age=0, stale-while-revalidate=604800' : value);
        }
        next();
      });
    },
  };
}

// Dev preview of the flows (src/app/main.tsx). `npm run dev`
export default defineConfig({
  plugins: [react(), devAssetCache()],
  resolve: { alias: { '@kit': fileURLToPath(new URL('./src', import.meta.url)), '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)) } },
  assetsInclude: ['**/*.lottie'],
  server: {
    port: 5180,
    // transform the app, the kit and every flow's screens when the server starts, not on the first click
    warmup: { clientFiles: ['./src/app/main.tsx', './src/kit/*.tsx', './src/components/index.ts', './src/flows/*/index.ts', './src/flows/*/*Screen.tsx', './src/flows/*/*Sheet.tsx'] },
  },
  // ship images as files, not base64 inside the JS bundle: the bundle stays small to parse and each screen
  // only downloads the images it shows
  build: { assetsInlineLimit: 0 },
});
