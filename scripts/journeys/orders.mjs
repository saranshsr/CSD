// Orders list: the header (back + search pill + filter chips) stays pinned while the list scrolls; status chips filter
// the history and toggle off again.
import { expect, open, tap, waitFor } from './lib.mjs';

export default [
  {
    name: 'orders-pinned-filter',
    area: 'orders',
    title: 'Orders: header stays pinned on scroll; Delivered / Cancelled chips filter the history, tap again restores it',
    async run(page, shot) {
      await open(page, 'orders/list', { settle: 1800 });
      const list = page.locator('[data-route="orders/list"]').last();
      const scroller = list.locator('.nk-scroll').first();
      const search = list.getByRole('button', { name: 'Search all orders' });
      const chip = (name) => list.getByRole('button', { name, exact: true });
      const rows = list.locator('button[class*=itemRow]');
      const active = list.getByRole('button', { name: /track order/i });
      const y0 = (await search.boundingBox()).y;
      const rows0 = await rows.count();
      expect(rows0 >= 3, `only ${rows0} order item rows`);
      expect((await active.count()) > 0, 'no active order card at the top of the list');
      await shot('list');
      // pinned header
      await scroller.evaluate((el) => el.scrollTo({ top: 900 }));
      await page.waitForTimeout(700);
      const scrolled = await scroller.evaluate((el) => el.scrollTop);
      expect(scrolled > 200, `the orders list did not scroll (scrollTop ${scrolled})`);
      const y1 = (await search.boundingBox()).y;
      expect(Math.abs(y1 - y0) <= 1, `the header moved ${Math.round(y1 - y0)}px on scroll (not pinned)`);
      const hit = await search.evaluate((el) => { const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return el.contains(top); });
      expect(hit, 'the search pill is covered by the scrolled content');
      const white = await list.locator('[class*=headerWhite]').first().evaluate((el) => Number(getComputedStyle(el).opacity)).catch(() => 1);
      expect(white > 0.5, `the header backdrop did not turn white on scroll (opacity ${white})`);
      await shot('scrolled-header-pinned');
      // Delivered chip
      await tap(page, chip('Delivered'), { scroll: false });
      await waitFor(async () => (await chip('Delivered').getAttribute('aria-pressed')) === 'true', 'the Delivered chip is not pressed after a tap');
      await page.waitForTimeout(700);
      const delivered = await rows.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? e.innerText));
      expect(delivered.length > 0 && delivered.length <= rows0, `Delivered shows ${delivered.length} rows (of ${rows0})`);
      // matchesFilter (src/flows/orders/data.ts): Delivered includes exchanged orders
      expect(delivered.every((t) => /^(Delivered|Exchanged)/i.test(t)), `non-delivered rows under Delivered: ${delivered.filter((t) => !/^(Delivered|Exchanged)/i.test(t)).slice(0, 2).join(' / ')}`);
      expect(!(await active.count()), 'the active order card stays visible under a history filter');
      await shot('delivered');
      // Cancelled chip replaces it
      await tap(page, chip('Cancelled'), { scroll: false });
      await waitFor(async () => (await chip('Cancelled').getAttribute('aria-pressed')) === 'true' && (await chip('Delivered').getAttribute('aria-pressed')) === 'false', 'Cancelled did not replace Delivered');
      await page.waitForTimeout(700);
      const cancelled = await list.innerText();
      const none = /no orders match this filter/i.test(cancelled);
      const cRows = await rows.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? e.innerText));
      expect(none || (cRows.length > 0 && cRows.every((t) => /^Cancel/i.test(t))), `non-cancelled rows under Cancelled: ${cRows.filter((t) => !/^Cancel/i.test(t)).slice(0, 2).join(' / ')}`);
      await shot(none ? 'cancelled-empty' : 'cancelled');
      // tap again: cleared
      await tap(page, chip('Cancelled'), { scroll: false });
      await waitFor(async () => (await chip('Cancelled').getAttribute('aria-pressed')) === 'false', 'Cancelled did not toggle off');
      await waitFor(async () => (await rows.count()) === rows0 && (await active.count()) > 0, async () => `clearing the filter shows ${await rows.count()} rows (expected ${rows0}) / active card ${await active.count()}`, 3000);
      await shot('cleared');
    },
  },
];
