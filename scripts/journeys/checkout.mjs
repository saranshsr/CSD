// Checkout: payment method + CVV gate the slide-to-pay; sliding places the order (placing → confirmation, cart
// cleared); a failing payment lands on payment-failure and its CTA returns to checkout.
import { cartBadge, drag, expect, open, tap, top, waitFor, waitRoute } from './lib.mjs';

const chk = (page) => page.locator('[data-route="checkout/checkout"]').last();
const slider = (page) => chk(page).getByRole('slider');
const sliderDisabled = async (page) => (await slider(page).getAttribute('aria-disabled')) === 'true';

/** card row selected + CVV typed → the slider enables; returns the CVV input */
async function cardWithCvv(page, shot) {
  const c = chk(page);
  expect(await sliderDisabled(page), 'slide to pay is enabled before a CVV is entered');
  // Tabby needs no CVV: the slider enables; back on the saved card it is gated again
  await tap(page, c.getByRole('button', { name: /^Tabby/ }).first());
  await waitFor(async () => !(await sliderDisabled(page)), 'selecting Tabby did not enable slide to pay');
  await page.waitForTimeout(900); // the payment update's fake latency + reloader swallow taps meanwhile
  await tap(page, c.getByRole('button', { name: /^Debit\/Credit Card/ }).first());
  await waitFor(() => sliderDisabled(page), 'back on the card (no CVV) slide to pay stays enabled');
  await page.waitForTimeout(900);
  const cvv = c.getByRole('textbox', { name: 'CVV' });
  await cvv.scrollIntoViewIfNeeded();
  await cvv.fill('12');
  await page.waitForTimeout(300);
  expect(await sliderDisabled(page), 'a 2-digit CVV enables slide to pay');
  await cvv.fill('123');
  await waitFor(async () => !(await sliderDisabled(page)), 'card + 3-digit CVV did not enable slide to pay');
  await page.keyboard.press('Tab').catch(() => undefined);
  await page.waitForTimeout(500);
  await shot('cvv-entered');
}

async function slide(page) {
  const track = slider(page).locator('xpath=..');
  const w = (await track.boundingBox())?.width ?? 340;
  await drag(page, slider(page), w);
}

export default [
  {
    name: 'checkout-slide-to-pay',
    area: 'checkout',
    title: 'Checkout: card + CVV enable slide to pay; sliding → placing → confirmation, cart cleared; Continue Shopping → home',
    async run(page, shot) {
      await open(page, 'checkout/checkout', { settle: 2200 });
      await shot('checkout');
      await cardWithCvv(page, shot);
      await slide(page);
      await waitRoute(page, 'checkout/placing', 'checkout/placing (order placing)', 4000);
      await page.waitForTimeout(800);
      await shot('placing');
      const n = await waitRoute(page, 'checkout/confirmation', 'checkout/confirmation', 15000);
      await page.waitForTimeout(1200);
      const conf = await top(page);
      expect(await conf.getByText(/order placed/i).first().isVisible(), 'confirmation shows no "Order placed"');
      expect(!n.stack.includes('checkout/placing'), `placing stayed on the stack: ${n.stack.join(' → ')}`);
      await shot('confirmation');
      await tap(page, conf.getByRole('button', { name: 'Continue Shopping' }), { scroll: false });
      const h = await waitRoute(page, 'home/home', 'home/home (Continue Shopping)');
      expect(h.stack.length === 1, `Continue Shopping left ${h.stack.join(' → ')}`);
      await page.waitForTimeout(1000);
      expect((await cartBadge(page)) === 0, `the cart badge shows ${await cartBadge(page)} after the order (cart should be cleared)`);
      await shot('home-after-order');
    },
  },
  {
    name: 'checkout-payment-failure',
    area: 'checkout',
    title: 'A declined payment lands on payment-failure; "Try another payment method" returns to checkout with the slider reset',
    async run(page, shot) {
      await open(page, 'checkout/checkout?failPayment=1', { settle: 2200, expectRoute: 'checkout/checkout' });
      await cardWithCvv(page, shot);
      await slide(page);
      const n = await waitRoute(page, 'checkout/payment-failure', 'checkout/payment-failure', 15000);
      expect(n.stack[0] === 'checkout/checkout', `payment-failure is not over checkout: ${n.stack.join(' → ')}`);
      await page.waitForTimeout(2600); // the CTA fades in after 2 s
      const fail = await top(page);
      expect(await fail.getByText(/unable to process your payment/i).first().isVisible(), 'no failure message');
      await shot('payment-failure');
      await tap(page, fail.getByRole('button', { name: /try another payment method/i }), { scroll: false });
      await waitRoute(page, 'checkout/checkout', 'checkout/checkout (retry)');
      await page.waitForTimeout(1200);
      expect((await slider(page).getAttribute('aria-valuenow')) === '0', 'the slider was not reset');
      const x = await slider(page).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
      expect(Math.abs(x) < 4, `the slider thumb is still at ${Math.round(x)}px after returning`);
      expect((await chk(page).innerText()).includes('Items'), 'checkout lost its items after a failed payment');
      await shot('back-on-checkout');
    },
  },
];
