// Navigation: tab bar switching, Back from a pushed screen, Back from a page opened directly by URL (logical parent).
import { expect, nav, open, tap, top, waitRoute } from './lib.mjs';

const TABS = [
  ['Categories', 'categories/categories'],
  ['Deals', 'deals/deals'],
  ['Account', 'account/account'],
  ['Cart', 'cart/cart'],
  ['Home', 'home/home'],
];

async function tapBack(page) {
  await tap(page, (await top(page)).getByRole('button', { name: 'Back', exact: true }).first(), { scroll: false });
}

export default [
  {
    name: 'tab-bar-switching',
    area: 'navigation',
    title: 'Tab bar: home → categories → deals → account → cart → home, each a fresh one-screen stack with its tab current',
    async run(page, shot) {
      await open(page, 'home/home');
      await shot('home');
      for (const [label, route] of TABS) {
        await tap(page, (await top(page)).locator('nav').getByRole('button', { name: label, exact: true }), { scroll: false });
        const n = await waitRoute(page, route, `${route} (tab ${label})`);
        expect(n.stack.length === 1, `switching to ${label} left a stack of ${n.stack.join(' → ')}`);
        await page.waitForTimeout(900);
        const current = await (await top(page)).locator('nav [aria-current=page]').getAttribute('aria-label').catch(() => null);
        expect(current === label, `tab bar marks "${current}" current on ${route}, expected "${label}"`);
        const tabBars = await (await top(page)).locator('nav [aria-label=Home]').count();
        expect(tabBars === 1, `${tabBars} tab bars on ${route}`);
        await shot(route.split('/')[0]);
      }
    },
  },
  {
    name: 'back-from-pushed',
    area: 'navigation',
    title: 'Back pops a pushed screen: account → My Orders → Back; home → product card → PDP → Back',
    async run(page, shot) {
      await open(page, 'account/account');
      await tap(page, (await top(page)).getByRole('button', { name: /^My Orders/ }));
      let n = await waitRoute(page, 'orders/list');
      expect(n.stack.join() === 'account/account,orders/list', `My Orders stack is ${n.stack.join(' → ')}`);
      await page.waitForTimeout(900);
      await shot('orders-pushed');
      await tapBack(page);
      n = await waitRoute(page, 'account/account', 'account/account after Back');
      expect(n.stack.length === 1, `Back left ${n.stack.join(' → ')}`);
      await page.waitForTimeout(700);
      await shot('back-on-account');
      // home rail product → PDP → Back to home, scroll position kept
      await tap(page, (await top(page)).locator('nav').getByRole('button', { name: 'Home', exact: true }), { scroll: false });
      await waitRoute(page, 'home/home');
      await page.waitForTimeout(1200);
      // a rail product card (ProductCard is a clickable <article>; its + is the QuickAdd)
      const card = (await top(page)).locator('article:has([aria-label="Add to cart"])').first();
      await tap(page, card.locator('[class*=info]').first());
      n = await waitRoute(page, 'pdp/detail', 'pdp/detail from a home product card');
      expect(n.stack.join() === 'home/home,pdp/detail', `PDP stack is ${n.stack.join(' → ')}`);
      await page.waitForTimeout(1400);
      await shot('pdp-from-home');
      await tapBack(page);
      n = await waitRoute(page, 'home/home', 'home/home after Back');
      expect(n.stack.length === 1, `Back left ${n.stack.join(' → ')}`);
      await page.waitForTimeout(700);
      await shot('back-on-home');
    },
  },
  {
    name: 'back-direct-url',
    area: 'navigation',
    title: 'A page opened by URL goes Back to its logical parent (screen.parent → flow.parent → home)',
    async run(page, shot) {
      const cases = [
        ['orders/list', 'account/account'],
        ['checkout/checkout', 'cart/cart'],
        ['pdp/deliveryVariants', 'pdp/detail'],
        ['wishlist/wishlist', 'home/home'],
        ['noonone/landing', 'account/account'],
      ];
      for (const [from, parent] of cases) {
        await open(page, from);
        const n0 = await nav(page);
        expect(n0.stack.length === 1, `${from} opened with a stack of ${n0.stack.join(' → ')}`);
        await tapBack(page);
        const n = await waitRoute(page, parent, `${parent} (Back from ${from})`);
        expect(n.stack.join() === parent, `Back from ${from} left ${n.stack.join(' → ')}, expected just ${parent}`);
        await page.waitForTimeout(700);
        await shot(`${from.replace('/', '-')}--back`);
      }
    },
  },
];
