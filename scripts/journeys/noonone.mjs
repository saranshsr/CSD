// noon One acquisition: account strip → non-member landing → Start trial → plan details → subscribe; View other plans →
// plan select with tier tabs and plan cards.
import { expect, nav, open, tap, top, waitFor, waitRoute } from './lib.mjs';

export default [
  {
    name: 'noonone-start-trial',
    area: 'noonone',
    title: 'Account noon One strip → landing (non-member) → Start trial → plan details → Start free trial → success',
    async run(page, shot) {
      await open(page, 'account/account', { settle: 1400 });
      await tap(page, (await top(page)).getByRole('button', { name: /Start Trial/i }).first(), { scroll: false });
      let n = await waitRoute(page, (r) => r.startsWith('noonone/'), 'noonone/* from the account strip');
      expect(n.route === 'noonone/landing', `the account strip opened ${n.route}, expected noonone/landing`);
      expect(n.stack[0] === 'account/account', `landing is not over account: ${n.stack.join(' → ')}`);
      await page.waitForTimeout(1600);
      const landing = await top(page);
      expect(await landing.getByRole('button', { name: /Start your 15 days trial/i }).isVisible(), 'non-member landing has no sticky "Start your 15 days trial"');
      await shot('landing');
      await tap(page, landing.getByRole('button', { name: /Start your 15 days trial/i }), { scroll: false });
      n = await waitRoute(page, 'noonone/planDetails', 'noonone/planDetails (trial guide, first tap)');
      await page.waitForTimeout(900);
      const details = await top(page);
      expect(await details.getByText(/Start your free trial/i).first().isVisible(), 'plan details has no "Start your free trial" title');
      await shot('plan-details');
      await tap(page, details.getByRole('button', { name: /^Start free trial$/i }), { scroll: false });
      // createSubscription → completeSubscription pops back to the landing, which flips to the member overview
      n = await waitRoute(page, 'noonone/landing', 'noonone/landing (after subscribing)', 8000);
      await waitFor(async () => (await (await top(page)).getByText(/free trial active/i).count()) > 0, 'the landing did not switch to the member overview ("Free trial active")', 6000);
      expect(!(await (await top(page)).getByRole('button', { name: /Start your 15 days trial/i }).count()), 'the member landing still shows the Start trial footer');
      await shot('member-landing');
      await tap(page, (await top(page)).getByRole('button', { name: 'Back', exact: true }).first(), { scroll: false });
      await waitRoute(page, 'account/account', 'account/account (Back from the landing)');
      await page.waitForTimeout(900);
      expect(!(await (await top(page)).getByRole('button', { name: /Start Trial/i }).count()), 'the account noon One strip still offers "Start Trial" after subscribing');
      await shot('account-member');
    },
  },
  {
    name: 'noonone-plans-tabs',
    area: 'noonone',
    title: 'Landing → View other plans → plan select: tier tabs swap the plan cards; tapping a plan selects it',
    async run(page, shot) {
      await open(page, 'noonone/landing', { settle: 1800 });
      await tap(page, (await top(page)).getByRole('button', { name: 'View other plans' }), { scroll: false });
      const n = await waitRoute(page, 'noonone/plans');
      expect(n.stack.join() === 'noonone/landing,noonone/plans', `plans stack ${n.stack.join(' → ')}`);
      await page.waitForTimeout(1200);
      const plans = page.locator('[data-route="noonone/plans"]').last();
      const cards = plans.locator('[class*=planContainer]');
      const text = async () => (await cards.allInnerTexts()).join(' / ').replace(/\s+/g, ' ');
      const standard = await text();
      expect((await cards.count()) >= 2, `${await cards.count()} plan cards on One Standard`);
      await shot('one-standard');
      await tap(page, plans.getByRole('button', { name: 'One Bundle', exact: true }), { scroll: false });
      const bundle = await waitFor(async () => { const t = await text(); return t !== standard && t; }, 'the One Bundle tab did not change the plan cards');
      expect(/stream|bundle|\+/i.test(bundle), `One Bundle cards don't read as a bundle: "${bundle.slice(0, 80)}"`);
      await shot('one-bundle');
      await tap(page, plans.getByRole('button', { name: 'One Standard', exact: true }), { scroll: false });
      await waitFor(async () => (await text()) === standard, 'switching back to One Standard did not restore its plans');
      // the selected plan is the disabled one; tap the other and it takes the selection
      const states = () => cards.evaluateAll((els) => els.map((el) => el.disabled || el.getAttribute('aria-disabled') === 'true'));
      const s0 = await states();
      const idx = s0.findIndex((d) => !d);
      expect(idx >= 0 && s0.filter(Boolean).length === 1, `expected exactly one selected plan, got ${JSON.stringify(s0)}`);
      await tap(page, cards.nth(idx), { scroll: false });
      await waitFor(async () => { const s1 = await states(); return s1[idx] && s1.filter(Boolean).length === 1; }, async () => `tapping plan ${idx + 1} did not select it (${JSON.stringify(await states())})`);
      expect((await nav(page)).route === 'noonone/plans', 'selecting a plan navigated away');
      await shot('annual-selected');
    },
  },
];
