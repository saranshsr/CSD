// Shared state through useDemoStore(): add to cart (product card, PDP) → badge + cart line + totals; qty + / − / remove;
// coupon; wishlist toggle reflected on the wishlist screen. The store is in memory, so these journeys only navigate
// with in-app taps after the first open().
import { cartBadge, expect, money, nav, open, tap, top, waitFor, waitRoute } from './lib.mjs';

const SHIPPING_FEE = 10; // src/kit/DemoStore.tsx SHIPPING_FEE: a group crossing the free-delivery line changes the total by this much

const cartLayer = (page) => page.locator('[data-route="cart/cart"]').last();
export const cartTotal = async (page) => money(await cartLayer(page).locator('[class*=footer] button[aria-expanded]').innerText());
export const cartLines = (page) => cartLayer(page).locator('[class*=_card_]:has([aria-label="Select item"])');
const tabTo = async (page, label, route) => {
  // the glass tab bar hides on scroll (ScrollVisibilityProvider): scroll the screen back to the top first, as a user would
  await (await top(page)).locator('[data-screen-scroll]').first().evaluate((el) => el.scrollTo({ top: 0 })).catch(() => undefined);
  await page.waitForTimeout(400);
  await tap(page, (await top(page)).locator('nav').getByRole('button', { name: label, exact: true }), { scroll: false });
  await waitRoute(page, route);
  await page.waitForTimeout(1400);
};
/** first line of a ProductCard's title */
const cardTitle = async (card) => (await card.locator('img[alt]').first().getAttribute('alt')).trim();
/** a cart line's sale price: its first line of text that is just a number (the was-price comes after it) */
const unitPrice = (text) => money(text.split('\n').find((l) => /\d/.test(l) && !/[\p{L}%]/u.test(l) && money(l) > 1) ?? '');
const firstWords = (s, n = 4) => s.replace(/\s+/g, ' ').split(' ').slice(0, n).join(' ');

export default [
  {
    name: 'cart-add-from-card',
    area: 'state',
    title: 'Home rail QuickAdd + → cart badge +1; the Cart tab lists the product and its total grows by its price',
    async run(page, shot) {
      await open(page, 'cart/cart', { settle: 2200 });
      const total0 = await cartTotal(page);
      const lines0 = await cartLines(page).count();
      const badge0 = await cartBadge(page);
      await tabTo(page, 'Home', 'home/home');
      // the first rail card whose + adds straight away (a sized fashion product opens pdp/variants instead)
      const cards = (await top(page)).locator('article:has([aria-label="Add to cart"])');
      let title;
      for (let i = 0; i < Math.min(6, await cards.count()); i++) {
        const card = cards.nth(i);
        // settle the rail first (scroll-snap moves it after scrollIntoView), then tap the + where it is
        await card.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
        await page.waitForTimeout(900);
        const t = await cardTitle(card);
        await tap(page, card.getByRole('button', { name: 'Add to cart' }), { scroll: false });
        await page.waitForTimeout(900);
        if ((await nav(page)).route === 'home/home') {
          title = t;
          break;
        }
        await page.locator('[class*=scrim]').last().click({ position: { x: 20, y: 20 } }).catch(() => undefined);
        await waitRoute(page, 'home/home');
        await page.waitForTimeout(500);
      }
      expect(title, 'no rail product card adds to cart from its + (all open the variants sheet?)');
      const badge1 = await waitFor(async () => { const b = await cartBadge(page); return b !== badge0 && b; }, `cart badge stayed ${badge0} after QuickAdd`);
      expect(badge1 === badge0 + 1, `cart badge ${badge0} → ${badge1}, expected +1`);
      await shot('quick-added');
      await tabTo(page, 'Cart', 'cart/cart');
      const lines1 = await cartLines(page).count();
      const text = await cartLayer(page).innerText();
      expect(text.includes(firstWords(title)), `the cart has no line for "${title}"`);
      expect(lines1 === lines0 + 1, `cart lines ${lines0} → ${lines1}, expected a new line`);
      const total1 = await cartTotal(page);
      const delta = Math.round((total1 - total0) * 100) / 100;
      expect(total1 > total0, `cart total did not grow (${total0} → ${total1})`);
      const price = unitPrice(await cartLines(page).filter({ hasText: firstWords(title) }).first().innerText());
      expect(Math.abs(delta - price) <= SHIPPING_FEE, `cart total grew by ${delta}, the new line costs ${price}`);
      await shot('cart-with-line');
    },
  },
  {
    name: 'cart-add-from-pdp',
    area: 'state',
    title: 'PDP Add to cart → quick-cart sheet → View cart: badge +1, the cart lists the product',
    async run(page, shot) {
      await open(page, 'pdp/detail?productId=p2', { settle: 1800, expectRoute: 'pdp/detail' });
      const title = (await (await top(page)).locator('[class*=titleToggle]').first().innerText().catch(() => '')).trim();
      const badge0 = await cartBadge(page);
      await tap(page, (await top(page)).locator('button', { hasText: /^Add to cart$/ }).last(), { scroll: false });
      const n = await waitRoute(page, (r) => r === 'pdp/added' || r === 'pdp/variants', 'pdp/added (quick cart)', 6000);
      expect(n.route === 'pdp/added', `Add to cart on p2 opened ${n.route}`);
      await page.waitForTimeout(1200);
      const badge1 = await cartBadge(page);
      expect(badge1 === badge0 + 1, `cart badge ${badge0} → ${badge1} after PDP Add to cart`);
      await shot('quick-cart');
      await tap(page, (await top(page)).getByRole('button', { name: /view cart/i }).first(), { scroll: false });
      const c = await waitRoute(page, 'cart/cart', 'cart/cart (View cart)');
      expect(c.stack.at(-1) === 'cart/cart' && c.stack.includes('pdp/detail'), `View cart stack is ${c.stack.join(' → ')}`);
      await page.waitForTimeout(1600);
      const text = await cartLayer(page).innerText();
      if (title) expect(text.includes(firstWords(title, 3)), `the cart has no line for "${title}"`);
      await shot('cart');
    },
  },
  {
    name: 'cart-qty-totals',
    area: 'state',
    title: 'Cart stepper: + raises the line and the total by the unit price, − brings it back, trash removes the line',
    async run(page, shot) {
      await open(page, 'cart/cart', { settle: 2200 });
      const total0 = await cartTotal(page);
      const badge0 = await cartBadge(page);
      const lines0 = await cartLines(page).count();
      // the second line (Anker cable, 39): cheap enough not to cross a free-delivery threshold by itself
      const line = cartLines(page).nth(1);
      const name = firstWords(await line.innerText(), 3);
      const unit = unitPrice(await line.innerText());
      expect(unit > 0, `could not read the unit price of "${name}"`);
      await tap(page, line.getByRole('button', { name: 'Increase' }));
      // the stepper commits after a 1.2 s debounce + loader
      const total1 = await waitFor(async () => { const t = await cartTotal(page); return t !== total0 && t; }, `total stayed ${total0} after +`, 5000);
      expect(Math.abs(total1 - total0 - unit) <= SHIPPING_FEE, `+ moved the total by ${total1 - total0}, unit price ${unit}`);
      expect((await cartBadge(page)) === badge0 + 1, `badge ${badge0} → ${await cartBadge(page)} after +`);
      await shot('increased');
      await tap(page, line.getByRole('button', { name: 'Decrease' }));
      const total2 = await waitFor(async () => { const t = await cartTotal(page); return t !== total1 && t; }, `total stayed ${total1} after −`, 5000);
      expect(Math.abs(total2 - total0) < 0.01, `− left the total at ${total2}, expected ${total0}`);
      await shot('decreased');
      await tap(page, line.getByRole('button', { name: 'Remove' }));
      await waitFor(async () => (await cartLines(page).count()) === lines0 - 1, `the line "${name}" was not removed (${lines0} lines)`, 4000);
      const total3 = await waitFor(async () => { const t = await cartTotal(page); return t !== total2 && t; }, 'total unchanged after removing a line');
      expect(total3 < total0, `total ${total0} → ${total3} after removing a line`);
      expect((await cartBadge(page)) === badge0 - 1, `badge ${badge0} → ${await cartBadge(page)} after removing a line`);
      expect(!(await cartLayer(page).innerText()).includes(name), `"${name}" is still listed after removal`);
      await shot('removed');
    },
  },
  {
    name: 'cart-coupon',
    area: 'state',
    title: 'Cart coupon: APPLY enables on input, NOON10 lowers the total, Remove restores it; a bad code is rejected',
    async run(page, shot) {
      await open(page, 'cart/cart', { settle: 2200 });
      const total0 = await cartTotal(page);
      const input = cartLayer(page).getByPlaceholder(/coupon code/i);
      const apply = cartLayer(page).getByRole('button', { name: /^APPLY$/i });
      await input.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      expect(await apply.isDisabled(), 'APPLY is enabled with an empty code');
      await input.fill('BOGUS1');
      expect(!(await apply.isDisabled()), 'APPLY stays disabled after typing a code');
      await apply.click();
      await page.waitForTimeout(1500);
      expect(Math.abs((await cartTotal(page)) - total0) < 0.01, 'an invalid code changed the total');
      // an invalid code stays in the field (read-only) with an error and a Remove button, as on master
      const remove = cartLayer(page).getByRole('button', { name: /^Remove$/i }).last();
      expect(await remove.isVisible(), 'no Remove button after an invalid code');
      await shot('invalid-code');
      await remove.click();
      await waitFor(async () => !(await apply.isDisabled().catch(() => true)) || (await input.inputValue()) === '', 'Remove did not clear the invalid code');
      await page.waitForTimeout(300);
      await input.fill('NOON10');
      await apply.click();
      const total1 = await waitFor(async () => { const t = await cartTotal(page); return t !== total0 && t; }, `NOON10 did not change the total (${total0})`, 4000);
      expect(total1 < total0, `NOON10 raised the total ${total0} → ${total1}`);
      expect(total0 - total1 <= 150.01, `NOON10 took ${total0 - total1} off, the cap is 150`);
      await shot('coupon-applied');
      await cartLayer(page).getByRole('button', { name: /^Remove$/i }).last().click();
      await waitFor(async () => Math.abs((await cartTotal(page)) - total0) < 0.01, 'removing the coupon did not restore the total', 4000);
      await shot('coupon-removed');
    },
  },
  {
    name: 'cart-coupon-tray',
    area: 'state',
    title: 'Coupon tray: "View available coupons & offers" opens it; Apply closes it and lowers the total; reopen → Remove restores it in place; noon One coupon locked for non-members',
    async run(page, shot) {
      await open(page, 'cart/cart', { settle: 2200 });
      const total0 = await cartTotal(page);
      await tap(page, cartLayer(page).getByRole('button', { name: /View available coupons/i }));
      await waitRoute(page, 'cart/couponTray', 'the coupon tray did not open');
      const tray = page.locator('[class*=sheetLayer] [data-testid=coupon-tray][data-state=ready]');
      await tray.waitFor({ timeout: 4000 });
      await page.waitForTimeout(1500); // stagger-in
      await shot('tray');
      const one = tray.locator('[data-testid=coupon-tray-offer][data-code=ONE20]');
      expect((await one.getAttribute('data-state')) === 'locked', 'ONE20 is not locked for a non-member');
      expect(await one.getByRole('button', { name: /^Apply$/ }).isDisabled(), 'the locked ONE20 Apply is enabled');
      expect(await one.getByRole('button', { name: /Join One/ }).isVisible(), 'no Join One banner on the noon One coupon');
      const weekend = tray.locator('[data-testid=coupon-tray-offer][data-code=WEEKEND15]');
      await weekend.scrollIntoViewIfNeeded();
      await weekend.getByRole('button', { name: /^Apply$/ }).click();
      await waitRoute(page, 'cart/cart', 'the tray did not close after Apply', 5000);
      const total1 = await waitFor(async () => { const t = await cartTotal(page); return t !== total0 && t; }, 'WEEKEND15 did not change the total', 4000);
      expect(total1 < total0 && total0 - total1 <= 75.01, `WEEKEND15 took ${total0 - total1} off (cap 75)`);
      await shot('applied');
      await waitFor(async () => (await page.locator('[class*=sheetLayer]').count()) === 0, 'the tray layer is still mounted after closing', 3000);
      await tap(page, cartLayer(page).getByRole('button', { name: /View available coupons/i }));
      await waitRoute(page, 'cart/couponTray', 'the tray did not reopen');
      const weekend2 = page.locator('[class*=sheetLayer] [data-testid=coupon-tray-offer][data-code=WEEKEND15]');
      await weekend2.scrollIntoViewIfNeeded();
      await weekend2.getByRole('button', { name: /^Remove$/ }).click();
      await waitFor(async () => (await weekend2.getByRole('button', { name: /^Apply$/ }).count()) === 1, 'Remove did not turn back into Apply', 4000);
      expect((await nav(page)).route === 'cart/couponTray', 'Remove closed the tray (it refreshes in place)');
      await shot('removed');
    },
  },
  {
    name: 'wishlist-toggle',
    area: 'state',
    title: 'Heart on a home card → the product is on the wishlist screen; ⋮ → Remove item there → gone, and the home card is un-hearted',
    async run(page, shot) {
      await open(page, 'home/home', { settle: 1600 });
      // a stable handle: the n-th article (a :has(label) locator would re-resolve to another card once the label flips)
      const articles = (await top(page)).locator('article');
      const idx = await articles.evaluateAll((els) => els.findIndex((el) => el.querySelector('[aria-label="Add to wishlist"]')));
      expect(idx >= 0, 'no un-hearted product card on home');
      const card = articles.nth(idx);
      const title = await cardTitle(card);
      const heart = card.getByRole('button', { name: 'Add to wishlist' });
      await tap(page, heart);
      await waitFor(async () => (await card.getByRole('button', { name: 'Remove from wishlist' }).count()) === 1, `the heart on "${title}" did not toggle`);
      await shot('hearted');
      // back to the top so the header's Wishlist button is not under the collapsed search bar
      await (await top(page)).locator('.nk-scroll').first().evaluate((el) => el.scrollTo({ top: 0 }));
      await page.waitForTimeout(700);
      await tap(page, (await top(page)).getByRole('button', { name: 'Wishlist', exact: true }).first(), { scroll: false });
      const n = await waitRoute(page, 'wishlist/wishlist');
      expect(n.stack.join() === 'home/home,wishlist/wishlist', `wishlist stack ${n.stack.join(' → ')}`);
      await page.waitForTimeout(1400);
      const wl = page.locator('[data-route="wishlist/wishlist"]').last();
      expect((await wl.innerText()).includes(firstWords(title)), `"${title}" is not on the wishlist screen`);
      await shot('on-wishlist');
      // remove it on the wishlist (NoonWishlistV2): its product box's ⋮ → the options sheet → Remove item
      const box = wl.locator('[data-testid="product_box"]').filter({ hasText: firstWords(title) }).first();
      await tap(page, box.getByRole('button', { name: 'Item options' }));
      await waitRoute(page, 'wishlist/options', 'wishlist/options (⋮)');
      await page.waitForTimeout(500);
      await tap(page, page.getByRole('button', { name: 'Remove item' }).last(), { scroll: false });
      await waitRoute(page, 'wishlist/wishlist', 'back on the wishlist after Remove item');
      await waitFor(async () => !(await wl.innerText()).includes(firstWords(title)), `"${title}" is still saved after Remove item`, 4000);
      await shot('removed-on-wishlist');
      await tap(page, wl.getByRole('button', { name: 'Back', exact: true }).first(), { scroll: false });
      await waitRoute(page, 'home/home');
      await page.waitForTimeout(800);
      expect((await card.getByRole('button', { name: 'Add to wishlist' }).count()) === 1, `the home card for "${title}" still shows as wishlisted`);
      await shot('home-unhearted');
    },
  },
];
