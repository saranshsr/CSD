# Membership and subscription

A membership screen sells a recurring commitment, so it has to make the value concrete and the cost unsurprising.
Average paywalls stack feature bullets and a "Subscribe" button with the price in small print. Great ones lead with the
benefit in money or in a single sentence, show the plan choice as two or three cards with a per-month equivalent and one
"Best value" tag, state exactly what happens when the trial ends, offer a reminder, and make managing or cancelling a
plain, findable row instead of a maze.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Revolut · select plan](https://mobbin.com/screens/1af3056a-424f-4d82-8f48-b5797a1e3171) | Large "Select plan" title with "Not now" top-right; Metal / Premium segmented pills; hero card "Premium · 1 month free then $9.99/month" with a "Special Offer" chip; "Included with Premium" rail of partner app icons with names; "Top features" list; pinned "Start free trial" with one line of plan terms under it | Trial and post-trial price in one line on the hero; partner perks as a scannable icon rail instead of bullets; the exit ("Not now") is visible and polite; tier switching is in place |
| [Instacart · annual vs monthly](https://mobbin.com/screens/f165a2dc-1306-4b6e-8da9-e13f410dd577) | Title "You're saving the most with an annual plan" with renewal explanation; two stacked plan cards: Annual (selected, tinted, "✓ Best value" badge, "$99 ($8.25 / month)") and Monthly ($9.99); legal paragraph; "Keep annual plan" | The headline states the conclusion; the annual card shows its monthly equivalent so the comparison is like for like; one badge only; the CTA names the selected plan |
| [Instacart+ · free trial](https://mobbin.com/screens/8b5db7ce-d38f-4845-81a8-75b458ddf64d) | Headline "Unlimited $0 delivery fee." then benefit rows with icon tiles ($0 grocery delivery fees, $0 restaurant delivery fees, Share membership perks) ending with "$99/yr after trial · Cancel anytime" as a benefit row; auto-renew disclosure above "Start 14-day free trial" | The post-trial price is listed as one of the rows, in the same weight as benefits, so it can't be missed; the benefit headline is a money outcome |
| [Duolingo · trial reminder](https://mobbin.com/screens/dffccfd7-c78a-4964-b31a-49d052b1e176) | "When should we remind you before your trial ends?" with two option rows "2 days before · Dec 14" and "3 days before · Dec 13"; "Easy to cancel, no penalties or fees"; "START MY FREE WEEK" disabled until a choice is made | Turns the trial-end anxiety into a choice the user owns, with real dates; the reassurance line sits right above the CTA |
| [Careem · Plus free trial sheet](https://mobbin.com/screens/13c58a23-0cc9-4b70-98d5-081d8e548a8c) | Sheet over the Careem Plus landing: "1 / month", "Careem Plus free trial", explanation that a charge of 1 will be applied and instantly refunded and that the subscription auto-renews in 60 days, Terms link; saved Visa row with "Change"; "Try 60 days free"; "You can cancel anytime" | Payment confirmation in one sheet, without leaving the landing; the verification charge is explained before it happens; card is pre-selected with a Change link |
| [Coinbase · manage membership](https://mobbin.com/screens/4e99597f-6e8e-4888-b3e2-f296d836ea24) | Sections Plan ("Monthly · Free trial until Nov 16, 2024 · S$29.99", Tier "Standard"), Payment method ("Pay with", "Crypto backup payments · Active"), Promotions ("Add promo code"); pinned neutral "Cancel membership" | Trial end date and price on the first row; every setting is one chevron row; cancel is honest and visible, but a neutral secondary, not a red alarm. Compare [Public's billing card](https://mobbin.com/screens/c77d253b-e7e7-43fa-996b-f9061d7ce7ab) (Price, Next billing date, Edit, Cancel Premium) |

## What great looks like (the bar)

- The headline is a concrete outcome ("Unlimited $0 delivery fee", "You're saving the most with an annual plan"), not
  the brand name.
- Plans are 2–3 selectable cards; the selected card is tinted with a strong border; exactly one "Best value" style tag;
  annual shows its per-month equivalent (Instacart, Revolut).
- Trial copy always pairs "free" with the after-trial price and date in the same line ("1 month free then $9.99/month",
  "$99/yr after trial · Cancel anytime").
- One pinned CTA naming the action and length ("Start 14-day free trial", "Try 60 days free"), with one reassurance
  line ("You can cancel anytime") and at most one line of terms beside it; a quiet "Not now" / "No thanks" exit.
- Benefits are icon + title + one-line explainer rows, 3–5 of them; partner perks as a logo rail (Revolut).
- Payment for the plan happens in a sheet over the landing with the saved card pre-selected and a Change link (Careem).
- A trial reminder or "we'll remind you N days before" is offered at sign-up (Duolingo).
- Manage: current plan, price and next billing / trial-end date on the first row; payment method and promo as chevron
  rows; cancel visible as a neutral secondary or text link (Coinbase, Public).

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Landing (non-member / member) | `LandingScreen` with CMS `modules` / `npModules` (`src/flows/noonone/components/landing/`), `LandingHeader` | Lead with the saving outcome; member overview shows savings to date |
| Sticky trial footer | flow-local `StickyFooter` + `SubscriptionButton` (+ `Flyout`) | One CTA with trial length; after-trial price in the line under it |
| Plan select | `PlanSelectScreen` with flow-local `PlanCard` / `BundlePlanCard` (`src/flows/noonone/components/plans/`) | One tag only; show the per-month equivalent on annual using `Money` |
| Monthly / annual or tier switch | `Segmented variant="field" size={40}` | Like Revolut's Metal / Premium pills |
| Plan details, trial guide | `PlanDetailsOverlayScreen`, `TrialGuideOverlayScreen` as Origin sheets (`SheetHeader` / `SheetBody` / `SheetFooter`) | Trial guide carries the Duolingo idea: what happens on which date |
| Subscription payment | `PaymentScreen`, `AddCardOverlayScreen`, `AddCvvOverlayScreen`, `MobilePayOverlayScreen`; `useQuickPay` | Saved card pre-selected with Change; verification charges explained before they happen |
| Offers / vouchers / partner offers | `OffersV2Screen`, `ConfirmOfferPlanScreen`, `ConfirmVoucherPlanScreen` | Partner perks as a logo rail, not bullets |
| Benefit rows | `ListRow variant="field" leading={…}` or `SectionCard` | Icon tile + title + one-line explainer |
| Entry points (cart, checkout, PDP, orders) | cart `NoonOneNudge`, checkout `NoonOneSection` / `NoonOneCtaReveal`, `useMembership()` | One line with the exact saving, like Uber Eats "Add $8.77 to save with Uber One" |
| Manage membership | `ManageMembershipScreen` with flow-local `ManagePlan`, `FamilyMembersSection` (`src/flows/membership/`), `useMembershipManage()` | Plan + price + renewal date first; cancel as `Button variant="fieldSecondaryNeutral"` or `fieldNeutralText` |
| Success | `Lottie` / `TransitionAnim` (landing) | Confirm the trial end date on the success screen |
| Prices | `Money` / `Price` with `currency` from `src/data` | Dirham sign, never "AED" |

## Avoid

- "Free" in large type with the renewal price only in the legal paragraph.
- Three or more "Popular" / "Best value" / "Recommended" badges on the same screen.
- Comparing an annual total against a monthly price without the per-month equivalent.
- A paywall without a visible exit, or an exit styled to look like a disabled control.
- Long feature tables on mobile; 3–5 benefit rows plus a "See all benefits" sheet.
- Cancel hidden behind support chat or three nested screens; equally, a red destructive cancel button as the most
  prominent element on the manage screen.
- Pushing a full-page payment form for a one-tap subscription when a saved card exists.

Last researched: 2026-10-14
