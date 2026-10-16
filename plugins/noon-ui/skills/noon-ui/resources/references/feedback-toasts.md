# Feedback: toasts, inline confirmations, success moments

Feedback closes the loop on an action: "it worked, here's what changed, here's how to undo or go there". Average apps
either say nothing or throw a modal "Success!" that must be dismissed. Great ones scale the feedback to the action: a
routine action gets a one-line past-tense toast with at most one action, the control that was tapped changes state so
the confirmation outlives the toast, and full-screen celebration is saved for genuine milestones. noon's default is the
Origin M-Toast via `nav.toast`, stacking into M-Stacked Toast when two or more are queued.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Uber Eats · Added to list](https://mobbin.com/screens/99a9500c-050b-4425-b089-38617ea458a7) | A dark toast at the top of the product page: check icon, "Added to Shopping List", trailing "View"; the page and the "Add 1 to cart" button are untouched | One line, past tense, one navigational action; it confirms without blocking the next action |
| [Uber · 2-step verification on](https://mobbin.com/screens/a559ef12-be3b-4b14-a4e0-a1daa2b954e6) | Toast "2-step verification is on." with a check, over the security list whose 2-step row shows a green check and "On" | The toast is the moment; the row's state is the record, so nothing depends on catching the toast |
| [Linear · Notification snoozed](https://mobbin.com/screens/3d9ccfd8-2425-49e9-a00b-27189140d3a3) | Bottom dark toast with a clock icon, "Notification snoozed", trailing "Undo", docked above the floating tab bar | A reversible action offers Undo instead of asking "are you sure?" first |
| [Instacart · Coupon clipped](https://mobbin.com/screens/60328d37-1322-41e1-822a-60f21fc3db28) | In the coupon sheet the heading becomes "Coupon clipped! Scan your loyalty barcode to apply savings." and the primary turns into a disabled "Coupon Clipped" | Inline confirmation: the control that was tapped tells you it's done and can't be done twice, plus the next step |
| [Airbnb · Prices include all fees](https://mobbin.com/screens/4f347fd4-5793-41df-a0d9-b29fe02131cc) | A white pill with a tag icon, "Prices include all fees", floating above the tab bar over the feed | Neutral information looks different from action results: light, no action, no check |
| [Duolingo · Lesson complete](https://mobbin.com/screens/31fdc425-1a41-4b78-b4e6-762bff0b9306) | Full screen: mascot animation, "Lesson complete!", three stat tiles (Total XP, Good 50%, Blazing 1:18), one "Claim XP" button; variants change the headline and line with the result ([Go ahead, brag!](https://mobbin.com/screens/854f4d63-c283-41d8-862e-8034d4b7e6a9) for 0 mistakes) | Celebration earned by a milestone, quantified, with copy that reacts to how you did, and a single way forward |

## What great looks like (the bar)

- Toast copy is one line, past tense, naming the object: "Added to Shopping List", "Notification snoozed",
  "2-step verification is on.". No "Success!" and no exclamation marks for routine actions.
- A leading icon that matches the action (check, clock, tag) and at most one trailing action: "Undo" for reversible
  actions, "View" for navigational ones.
- The toast never covers the primary CTA or the tab bar: it docks above bottom chrome or at the top, and the page stays
  interactive.
- The confirmation outlives the toast: the row shows "On", the button becomes "Coupon Clipped", the heart fills.
- Neutral info and action results look different (light pill without action vs dark toast with a check); error and
  success colours only for those states.
- Reversible actions are done immediately with Undo, not gated behind a confirm sheet.
- Full-screen success is reserved for milestones (order placed, membership joined, review submitted): animation once,
  a headline, 1–3 numbers that quantify the result, one primary.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Default toast | `nav.toast(title, { type, subtitle, icon, action, duration })` → Origin M-Toast | `dark` default; `success` / `error` only for that status; `light` for neutral info |
| Undo / View action | `action: { label: 'Undo', onPress }` | One action only; `action: 'close'` for a dismiss X |
| Link to the result | `subtitle: 'View wishlist', onSubtitlePress: () => nav.push('wishlist/wishlist')` | Subtitle with chevron, as `WishlistHeart` does |
| Several in a row | automatic `SnackbarStack` (2+ queued, up to 3) | Don't build your own queue |
| Bespoke toast (cart snackbar, voucher toast) | `Toast` host with your own look and motion | Only when the M-Toast can't carry it; motion from `src/motion/presets.ts` |
| Inline confirmation on the control | `Button` label / `disabled` change, `WishlistHeart` fill, `ListRow subtitle` value | The persistent half of the feedback |
| Inline status banner | `StatusChip variant="field"` (success / warning tones) | For "Coupon applied" style lines inside a card |
| Added-to-cart moment | PDP `AddedSheet` (Origin sheet + `Lottie name="atcCheck"`) or `QuickAdd` expanding into a stepper | The stepper is the confirmation on cards |
| Milestone success | `Lottie name="orderConfirmedCheck"` / `orderConf` / `reviewCheck`, played once, then headline + `Price` / `Money` facts + one `Button` | `checkout/ConfirmationScreen.tsx`, `PlacingScreen.tsx` are the models; reduced motion holds a frame |
| Success inside a sheet | swap `SheetBody` content in place + `SheetFooter` next steps | See `resources/references/bottom-sheets.md` |

## Avoid

- Modal "Success!" dialogs with an OK button for routine actions.
- Toasts with two actions, two lines of body copy, or no object ("Done").
- Toasts that cover the sticky CTA or the tab bar, or that block taps.
- Feedback that exists only in the toast; the screen must show the new state too.
- Green success styling for neutral info, or confetti for adding one item to the cart.
- Confirm sheets for actions that could simply offer Undo.

Last researched: 2026-10-14
