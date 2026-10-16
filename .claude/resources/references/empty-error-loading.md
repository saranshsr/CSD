# Empty, error and loading states

These states cover the time when there is nothing to show yet, there is genuinely nothing there, or something broke. A
great state keeps the page's chrome and context in place (search bar, title, filters, tab bar), shows grey blocks in the
shape of the real content while it loads, and gives one clear way forward: shop, retry, or a link that explains. An
average state wipes the screen, centres a spinner, and on failure shows a dead end like "Something went wrong" with no
way out.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Instacart · search results loading](https://mobbin.com/screens/0e6e079f-f375-416c-8d45-792f4d53fe9c) | The search bar stays live with the query ("walmart water"), back and cart included. Below it, repeating skeleton groups: a store-header block (logo square + 3 lines) over a 3-up row of product tiles (image block + 3 text bars), split by hairlines | Each skeleton has the exact footprint of the result rows, so the swap doesn't jump. The user can still edit the query while results load |
| [Instacart · choose a store loading](https://mobbin.com/screens/34742039-c73c-41e3-b249-aea2d9b2b5fc) | The real header ("Choose a store"), section titles ("Stores to help you save", "All stores in Menlo Park") and filter chips (All / EBT / Fastest / Offers / Low prices) render right away. Only the logo tiles and list rows are skeletons | Static copy is never skeletoned. Only the data-dependent parts shimmer, so the page reads as "this page, loading", not "a loading screen" |
| [Airbnb · wishlists first use](https://mobbin.com/screens/7c140f48-a9ae-4420-8686-9018dc681449) | A sheet over the empty Wishlists tab: one product photo with the heart already on it, the title "Save your favorites in one place", one line of how-to ("Tap the heart icon as you browse…") and one full-width "Got it" | The empty state teaches the gesture with a picture of the gesture's result, not a generic illustration. One action, no competing links |
| [Amazon · empty cart](https://mobbin.com/screens/5fc84dca-fb23-4e2a-b6e8-c3331d3fc244) | The empty message is a compact row at the top (small cart drawing + "Your Amazon Cart is empty" + "Pick up where you left off" link), then a promo card, then a "Deals on everyday essentials" product rail with ratings and prices | The empty state takes up a fifth of the screen and the rest is shoppable. An empty cart turns into a feed, not a blank page |
| [Fresha · no internet in search](https://mobbin.com/screens/b6f7d349-7d9f-466f-87ce-a2ed5c95b585) | The map, filter chips and bottom tabs stay in place. Only the results panel switches to a small icon, "No internet connection", one line of explanation and an outlined "Try again" pill | The error lives where the content would be, not on a takeover. The user keeps their filters and the retry is a small secondary pill, not a shouty CTA |
| [Blue Bottle Coffee · order failed](https://mobbin.com/screens/0900deaa-0c70-4297-9567-a208a55b7736) | A sheet over the dimmed "Review your order" screen: "Something went wrong", a small spill illustration, "We're having a little trouble sending your order. Please try again, or contact support." (the last part is a link), and a full-width "Try again" | It names what failed (sending your order) and the order is still visible behind it, so nothing feels lost. Retry is primary, support is the fallback link |

## What great looks like (the bar)

- Chrome loads first: header, search bar, section titles, chips and the tab bar render immediately and stay usable. Only
  the data blocks are skeletons (Instacart store list, Fresha).
- Skeleton blocks match the loaded layout 1:1: same image aspect, same number of text bars (title 70%, meta 50%, price
  30%), same gaps and dividers. Swapping in real data moves nothing.
- Skeleton colour is one flat light grey with a soft shimmer. No spinner on top of a skeleton. The exception is a long,
  named wait, which gets a short label ("Generating your shoppable recipe…", [Instacart](https://mobbin.com/screens/d86eb9ee-13e3-4fc9-9e81-1bc81d9522c7)).
- Empty state = title (what's empty, in plain words) + one line (how to fill it) + one action. The title is 17–20
  semibold, the body 14–15 secondary and at most 2 lines.
- In commerce, the empty state is short and the page under it stays shoppable: "Pick up where you left off", recently
  viewed, deals rails (Amazon empty cart).
- Errors say what failed and keep context: errors in the page replace only the failed section; blocking errors use a
  sheet over the dimmed screen, never a blank page.
- Retry sits right next to the message: an outlined pill in the page, or a full-width primary in a sheet. Support or
  "go back" is a text link, never a second big button.
- Illustrations are small (≈96–160px) and optional. The copy has to work on its own.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Skeleton block | `Skeleton width height radius` | Use the real component's radius (`r.r6` text, r8–r12 images). Build the whole row or card from the same layout CSS as the loaded one |
| Product grid loading | flow-local `SkeletonCard` (`src/flows/plp/components/SkeletonCard.tsx`) | Same footprint as the PLP card. Copy its approach for other cards, don't invent a new one |
| Page that loads | `<Screen header footer>` with the real `Header` / `SearchBarButton` / `PillRow` rendered | Only swap the body; a `state: 'loading' \| 'empty'` param like `CartScreen` makes each state demoable |
| Empty title + line | `Text variant="heading"` + `Text variant="body" color="textSecondary"` | Left-aligned in lists, centred only for whole-page empties |
| Empty illustration | `src/assets/<flow>/empty-*.webp` (e.g. `@assets/cart/empty-generic.webp`) | ≈120px display, 3× asset, `npm run assets:optimize` |
| Empty CTA | `Button variant="fieldPrimary" fieldSize="H48"` (Origin) or `variant="noon"` (ports) | Exactly one. Under it, real content: `SkuCard` rail or `ProductCard` grid |
| Retry in the page | `Button variant="fieldSecondary" fieldSize="H36"` | Small and outlined, sits right under the message. Keep filters / header usable |
| Blocking error | sheet (`presentation: 'sheet'`) with `SheetHeader` / `SheetBody` / `SheetFooter layout="single"` | Grabber, so no X. Primary "Try again" + `Button variant="fieldText"` for support |
| Inline / transient failure | `nav.toast(title, { type: 'error', subtitle, action })` | For an action that failed (add to cart, save), not for a page that failed to load |
| Retry in progress | `Button loading` | Don't swap the button for a `Spinner` |
| Long named wait | `Lottie name="boxAnim" loop` or `Spinner variant="ios"` + `Text variant="caption"` | Only when the wait is long and has a name |

## Avoid

- A full-screen centred spinner while the page loads. Show the chrome and skeletons instead.
- Skeletons that don't match the real layout (generic grey bars), so the page jumps when data arrives.
- Skeletoning static copy like titles, section headers and filter labels.
- "Something went wrong" with no cause and no retry, or a retry that drops the user's filters and scroll position.
- An error that wipes the tab bar and header and traps the user.
- Empty states with two or three equal CTAs, or a big illustration that pushes the action below the fold.
- Cute copy that hides the fact ("Oops!") instead of saying what's empty or what failed.
- Using a toast for a page that failed to load: the toast goes away and leaves a blank page behind.

Last researched: 2026-10-14
