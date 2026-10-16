# World-class UI reference library

The bar for a noon screen is the best app that solves the same problem, not "it renders". This folder is that bar:
one file per pattern, each with the 4–6 strongest real screens from the reference set (via Mobbin), what makes each one
great, and how to get there with noon's own components. Read the pattern file **before** designing a new screen or
section, and review against it **before** calling the screen done (`.claude/skills/noon-ui/references/craft-rubric.md`).

Reference set (chosen by the team): **craft** Airbnb, Apple (App Store, Wallet), Revolut, Uber · **commerce** Amazon,
Shop (Shopify), Instacart, Zara · **regional** talabat, Careem, Amazon.ae / regional noon peers · **interaction and
delight** Linear, Arc, Things, Duolingo. Each pattern draws on the apps that do it best, not all of them. Where a set app had no strong Mobbin screen for a pattern, the file cites the clearest peer instead (IKEA, Snoonu, Target, Walmart, Blue Apron, Coinbase, Fresha, Blue Bottle, Urban Company, Apple Music / Podcasts) — same rules, structure only. Shop returned no screens on Mobbin at research time.

## Patterns

| File | Pattern | Closest noon flows |
|---|---|---|
| `home-feed.md` | home / discovery feed: header, search entry, hero, rails, category grids | `home`, `deals`, `categories` |
| `search.md` | search entry, recents / trending, suggestions as you type | `search` |
| `listing-filters.md` | results grid / list, filter and sort chips, filter sheet | `plp` |
| `product-detail.md` | product / listing detail: gallery, title-price block, variants, sticky CTA | `pdp` |
| `cart.md` | cart / basket: lines, steppers, savings, summary, sticky checkout | `cart` |
| `checkout-payment.md` | checkout, address / delivery choice, payment methods, pay CTA | `checkout`, `cards`, `address` |
| `order-tracking.md` | order list, order status, live tracking, delivery timeline | `orders`, `returns` |
| `membership-subscription.md` | plans, paywall, trial, manage subscription | `noonone`, `membership` |
| `account-settings.md` | profile hub, settings lists, toggles, security | `account` |
| `bottom-sheets.md` | sheets: pickers, confirmations, multi-step sheets | every flow's sheets |
| `navigation-tabbar.md` | tab bars, headers, large titles, back / close behaviour | kit `TabBar`, `Header` |
| `feedback-toasts.md` | toasts, snackbars, inline confirmations, success moments | `nav.toast`, Lotties |
| `empty-error-loading.md` | skeletons, empty states, errors and retry | every flow's states |
| `onboarding-signin.md` | sign-in, OTP, permissions, first run | `account` signed-out |
| `reviews-ratings.md` | rating entry, review writing, review lists | `reviews`, `pdp` reviews |

## File template

```md
# <Pattern>

<one paragraph: the job this pattern does for the user and what separates great from average>

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Airbnb · listing detail](https://mobbin.com/screens/<id>) | <structure you can see in the screen> | <the specific craft decision: hierarchy, spacing rhythm, grouping, motion, copy> |

## What great looks like (the bar)

- <5–8 concrete, checkable observations drawn from the references: "one primary action, pinned; price + dates + CTA in
  the footer", "section titles 22–24 bold with 32+ above, body 15–16", "photos edge to edge, everything else on a 24
  side margin" …>

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| <sticky reserve bar> | `ActionBar layout="leadingTrailing"` / `SfAtcBar` | <how> |

## Avoid

- <the average-app mistakes the references avoid: three competing CTAs, centred body copy, a card inside a card …>
```

## Rules

- **Links only.** Cite every screen by its `mobbin_url`. Never commit Mobbin images or hotlink `image_url` (they
  expire after 30 days). Describe only what the screen actually shows; no screen, no claim.
- **Structure, not branding.** Take hierarchy, grouping, rhythm, interaction and copy tone. Never colours, fonts, icons,
  illustrations or component styling from another product: noon's tokens and components build it
  (`design-rules.md` §0 — reuse only; a reference never licenses a new component look).
- **noon wins on conflicts** with a 1:1 port (`truth: 'bappzaar' | 'figma'`), unless the user asks to change it.
- **Keep it fresh.** Refresh a pattern file when a reference app ships a redesign or a new noon flow needs a pattern the
  file doesn't cover; add the date to the file's last line (`Last researched: YYYY-MM-DD`).
