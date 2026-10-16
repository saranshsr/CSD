#!/usr/bin/env node
// Fetches every page the Categories tab links to, the way the app's DynamicLoaderScreen does:
//   GET https://api-app.noon.com/_svc/catalog/api/v3/u<linkUrl>   (bappzaar src/services/CatalogService.ts getDynamicLoaderData)
// with the headers documented in src/flows/categories/MAPPING.md (X-Locale / X-Platform / X-Content / X-Build).
//
//   npm run categories:fetch                       all 161 unique links of src/flows/categories/data.live.ts
//   npm run categories:fetch -- --only gaming      only links whose category or URL contains "gaming"
//   npm run categories:fetch -- --locale ar-ae --delay 500
//
// Writes the raw responses to .cache/categories-cms/ (git-ignored) and a summary of each page — response type
// (`static` → StaticPage modules, `catalog` → NoonCatalogList, `detail` → PDP) and its sections — to
// src/flows/categories/cms-pages.json, which `npm run resources:build` turns into
// .claude/resources/flows/categories-views.md. Links the app never sends to DynamicLoaderScreen (gift cards,
// cobrand, deep links) are listed but not fetched.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const only = arg('only', '').toLowerCase();
const locale = arg('locale', 'en-ae');
const delay = Number(arg('delay', 300));

const { liveCategoriesPage } = await import(join(root, 'src/flows/categories/data.live.ts'));
const { destinationOf } = await import(join(root, 'src/flows/categories/linkRouting.ts'));

const links = new Map(); // url → [{ category, title }]
for (const main of liveCategoriesPage.banners)
  for (const sub of main.subBanners) {
    if (only && !`${main.title} ${sub.linkUrl}`.toLowerCase().includes(only)) continue;
    links.set(sub.linkUrl, [...(links.get(sub.linkUrl) ?? []), { category: main.title, title: sub.title }]);
  }
if (!only || liveCategoriesPage.adBanner.linkUrl.includes(only)) links.set(liveCategoriesPage.adBanner.linkUrl, [{ category: '(pre-search banner)', title: 'Ad banner' }]);

if (!links.size) {
  console.log(`no links match --only "${only}"`);
  process.exit(1);
}

const headers = { 'X-Locale': locale, 'X-Platform': 'ios', 'X-Content': 'mobile', 'X-Build': '22098', Accept: 'application/json' };
const cacheDir = join(root, '.cache/categories-cms');
mkdirSync(cacheDir, { recursive: true });
const slug = (url) => url.replace(/^\/+|\/+$/g, '').replace(/[^\w-]+/g, '_').slice(0, 120) || 'root';

/** StaticPageUtil.getFlatModules: widgets → modules (tabs layouts become one `tabs` module). */
function flatModules(widgets = []) {
  const out = [];
  for (const w of widgets) {
    if (w.sectionLayout === 'tabs') out.push({ type: 'tabs', modules: w.modules });
    else if (w.sectionLayout === 'customTabs') out.push({ ...w, type: 'customTabs' });
    else for (const m of w.modules ?? []) out.push(m);
  }
  return out;
}
const items = (m) => m.banners ?? m.items ?? m.products ?? m.subCategories ?? m.modules ?? m.data ?? [];
const describe = (m) => ({
  type: m.type ?? m.moduleType ?? '?',
  ...(m.moduleHeader?.titleText || m.titleText ? { title: m.moduleHeader?.titleText ?? m.titleText } : {}),
  ...(Array.isArray(items(m)) ? { count: items(m).length } : {}),
});

function summarise(res) {
  const type = res?.type ?? '?';
  if (type === 'static') {
    const content = res.content ?? res;
    const widgets = content.data ?? res.data ?? [];
    return { type, ...(content.storeInfo ? { store: true } : {}), modules: flatModules(widgets).map(describe) };
  }
  if (type === 'catalog') {
    const c = res.catalog ?? res;
    return {
      type,
      hits: c.nbHits ?? c.totalHits ?? c.hits?.length ?? null,
      navPills: (c.navPills ?? []).map((p) => p.name ?? p.title ?? p.code).filter(Boolean),
      quickFilters: (c.quickFilters ?? []).length,
      facets: (c.facetsV2 ?? c.facets ?? []).map((f) => f.name ?? f.code).filter(Boolean),
      cms: flatModules(c.cms?.data ?? []).map(describe),
      bestSeller: Boolean(c.isBestSellerPage ?? c.categoryBestSeller),
    };
  }
  return { type };
}

const pages = {};
let n = 0;
for (const [url, refs] of links) {
  const dest = destinationOf(url);
  if (dest.kind !== 'dynamicLoader') {
    pages[url] = { refs, destination: dest };
    continue;
  }
  n++;
  try {
    const r = await fetch(`https://api-app.noon.com/_svc/catalog/api/v3/u${url}`, { headers });
    const body = await r.json().catch(() => null);
    if (body) writeFileSync(join(cacheDir, `${slug(url)}.json`), JSON.stringify(body, null, 2));
    pages[url] = { refs, destination: dest, status: r.status, ...(body ? summarise(body) : {}) };
    console.log(`${String(r.status).padEnd(4)} ${(pages[url].type ?? '').padEnd(8)} ${url}`);
  } catch (e) {
    pages[url] = { refs, destination: dest, error: String(e.message ?? e) };
    console.log(`ERR  ${url}  ${e.message ?? e}`);
  }
  await new Promise((r) => setTimeout(r, delay));
}

const out = join(root, 'src/flows/categories/cms-pages.json');
writeFileSync(out, JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), locale, pages }, null, 2) + '\n');
console.log(`\n${n} fetched, ${links.size - n} not fetched (special routes) → src/flows/categories/cms-pages.json; raw → .cache/categories-cms/`);
console.log('Next: npm run resources:build');
