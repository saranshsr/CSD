// Empty / error states that exist as screens or params: they render, and their primary CTA works.
import { cartBadge, expect, nav, open, tap, top, waitFor, waitRoute } from './lib.mjs';
import { cartLines } from './state.mjs';

const emptyCopy = /your cart is empty/i;

export default [
  {
    name: 'cart-empty-state',
    area: 'states',
    title: 'Removing every cart line shows the empty cart (badge 0, no Checkout); its carousel + adds a line back',
    async run(page, shot) {
      await open(page, 'cart/cart', { settle: 2200 });
      const cart = page.locator('[data-route="cart/cart"]').last();
      for (let i = 0; i < 8 && (await cartLines(page).count()); i++) {
        const n = await cartLines(page).count();
        // a line with qty > 1 shows "Decrease" instead of the trash: step it down first
        const line = cartLines(page).first();
        const btn = (await line.getByRole('button', { name: 'Remove' }).count()) ? line.getByRole('button', { name: 'Remove' }) : line.getByRole('button', { name: 'Decrease' });
        await tap(page, btn);
        await waitFor(async () => (await cartLines(page).count()) < n || (await line.getByRole('button', { name: 'Remove' }).count()), `line ${i + 1} was not removed`, 5000);
        await page.waitForTimeout(400);
      }
      await waitFor(async () => (await cart.getByText(emptyCopy).count()) > 0, 'no "Your cart is empty" after removing every line', 5000);
      await page.waitForTimeout(800);
      expect((await cartBadge(page)) === 0, `the cart badge shows ${await cartBadge(page)} on an emptied cart`);
      expect(!(await cart.getByRole('button', { name: /^Checkout$/ }).count()), 'an empty cart still offers Checkout');
      await shot('emptied');
      const add = cart.getByRole('button', { name: 'Add to cart' }).first();
      await tap(page, add);
      await waitFor(async () => (await cartBadge(page)) === 1, `the empty cart's carousel + did not add (badge ${await cartBadge(page)})`, 4000);
      await waitFor(async () => (await cartLines(page).count()) === 1, 'the added product is not listed as a cart line', 4000);
      await page.waitForTimeout(600);
      await shot('one-line');
    },
  },
  {
    name: 'cart-empty-param',
    area: 'states',
    title: 'cart/empty renders "Your cart is empty" and the tab badge agrees (0)',
    async run(page, shot) {
      await open(page, 'cart/empty', { settle: 2000 });
      const cart = await top(page);
      expect((await cart.getByText(emptyCopy).count()) > 0, 'cart/empty does not say "Your cart is empty"');
      await shot('empty');
      const badge = await cartBadge(page);
      expect(badge === 0, `cart/empty shows a cart badge of ${badge}`);
    },
  },
  {
    name: 'wishlist-empty-cta',
    area: 'states',
    title: 'Empty wishlist: "Nothing saved yet" + "Start adding items" opens Search',
    async run(page, shot) {
      await open(page, 'wishlist/empty', { settle: 1400 });
      const wl = await top(page);
      expect(await wl.getByText(/nothing saved yet/i).first().isVisible(), 'empty wishlist copy missing');
      await shot('empty');
      await tap(page, wl.getByRole('button', { name: 'Start adding items' }), { scroll: false });
      const n = await waitRoute(page, 'search/search', 'search/search (Start adding items)');
      expect(n.stack.at(-2) === 'wishlist/empty', `Search is not on top of the wishlist: ${n.stack.join(' → ')}`);
      await page.waitForTimeout(900);
      await shot('search');
    },
  },
  {
    name: 'categories-error-retry',
    area: 'states',
    title: 'Categories error: "Oops! Something went wrong" + Retry → loader → the category grid',
    async run(page, shot) {
      await open(page, 'categories/error', { settle: 1200 });
      const cat = await top(page);
      expect(await cat.getByText(/something went wrong/i).first().isVisible(), 'no error copy on categories/error');
      await shot('error');
      await tap(page, cat.getByRole('button', { name: 'Retry' }), { scroll: false });
      await waitFor(async () => !(await cat.getByText(/something went wrong/i).count()), 'Retry did not leave the error view');
      await waitFor(async () => (await cat.getByRole('button', { name: 'What are you looking for?' }).count()) > 0, 'the category page did not load after Retry', 6000);
      await page.waitForTimeout(800);
      expect((await cat.getByRole('button', { name: /^Electronics$/ }).count()) > 0, 'no category banners after Retry');
      await shot('loaded');
    },
  },
  {
    name: 'cards-empty-cta',
    area: 'states',
    title: 'No saved cards: "Save your card for faster payments" + Add card opens the add-card screen',
    async run(page, shot) {
      await open(page, 'cards/empty', { settle: 1400 });
      const c = await top(page);
      expect(await c.getByText(/save your card/i).first().isVisible(), 'empty cards copy missing');
      await shot('empty');
      await tap(page, c.getByRole('button', { name: 'Add card' }), { scroll: false });
      const n = await waitRoute(page, (r) => r === 'cards/add' || r === 'cards/form', 'cards/add (Add card)');
      expect(n.stack[0] === 'cards/empty', `add card is not on top of the empty list: ${n.stack.join(' → ')}`);
      await page.waitForTimeout(900);
      await shot('add-card');
    },
  },
  {
    name: 'account-orders-empty',
    area: 'states',
    title: 'Account with no orders (?orders=none): the My Orders card still opens the orders list',
    async run(page, shot) {
      await open(page, 'account/account?orders=none', { settle: 1400, expectRoute: 'account/account' });
      const acc = await top(page);
      const card = acc.getByRole('button', { name: /^My Orders/ });
      expect((await card.innerText()).trim() === 'My Orders', `the empty My Orders card shows order items: "${(await card.innerText()).trim()}"`);
      await shot('no-orders');
      await tap(page, card, { scroll: false });
      await waitRoute(page, 'orders/list', 'orders/list (My Orders)');
      await page.waitForTimeout(900);
      await shot('orders');
    },
  },
  {
    name: 'noonone-invite-error',
    area: 'states',
    title: 'Expired family invite: the error sheet\'s "Explore noon One" lands on the landing, "Got it" closes it',
    async run(page, shot) {
      await open(page, 'noonone/acceptInviteError', { settle: 1400 });
      let n = await nav(page);
      expect(n.stack.join() === 'noonone/landing,noonone/acceptInviteError', `invite error stack ${n.stack.join(' → ')}`);
      const s = await top(page);
      expect(await s.getByText(/invite has expired/i).first().isVisible(), 'no "This invite has expired"');
      await shot('expired');
      await tap(page, s.getByRole('button', { name: 'Got it' }), { scroll: false });
      n = await waitRoute(page, 'noonone/landing', 'noonone/landing (Got it)');
      expect(n.stack.length === 1, `Got it left ${n.stack.join(' → ')}`);
      await open(page, 'noonone/acceptInviteError', { settle: 1400 });
      await tap(page, (await top(page)).getByRole('button', { name: 'Explore noon One' }), { scroll: false });
      n = await waitRoute(page, (r) => r !== 'noonone/acceptInviteError', 'a route after Explore noon One');
      expect(n.route.startsWith('noonone/'), `Explore noon One opened ${n.route}`);
      await page.waitForTimeout(900);
      await shot('explore');
    },
  },
];
