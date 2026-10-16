# Verify

A screen is done when it builds cleanly, renders without errors, uses only kit parts and tokens, and a noon designer looking at the screenshot would not spot a foreign part. You find faults by looking, so look first.

## Commands

Run from the repo root. The dev server must be running for the browser checks (`npm run dev`, port 5180; if Vite picks another port, prefix the scripts with `PORT=<port>`).

| Command | What it proves |
|---|---|
| `npm run typecheck` | App and library typecheck. Token names used through `ref.*` are typed, so typos fail here. |
| `npm run lint:tokens` | Raw hex / rgba / font literals per folder. Must be 0 for `src/components`; keep the folders you touched at 0 (`npm run lint:tokens -- -v src/flows/<id>` lists findings). |
| `npm run check:routes` | Every registered screen renders with no console errors and no placeholders. |
| `npm run test:journeys` | Behaviour, not just rendering: `scripts/journeys.mjs` walks the core journeys (search → PLP hand-off with no empty frame and a still bar · PLP quick-pill filter on / off · Sort sheet reorders · PLP → PDP → Add to cart → Back keeps the results · cart summary open / close → Checkout, through the noon One push) and fails on any console error. Checkpoint screenshots in `test-results/journeys/<journey>/`. Starts its own Vite server unless `PORT` is set; `-- <name>` runs one. Add a journey when you build or change a flow's interactions (tap with `tap()` on animating chrome; match buttons by exact name). |
| `node scripts/shot.mjs <flow>/<screen> /tmp/x.png` | Screenshot of one screen (the 390×844 phone at dpr 2, deterministic capture below) plus `/tmp/x.json` with the profile, steps, scroll and console errors. `--scroll <y\|top\|bottom\|el:<selector>>` to see below the fold, `--click "<selector>"` to open a sheet or tap through, `--type "<text>"`, `--press <Key>`, `--hover "<selector>"`, `--wait <ms>` (steps run in order; scroll is applied last), `--dpr <n>`, `--stage` (old 1400-wide stage with backdrop), `--live` (real clock, live Lottie / GIFs), `--full-motion` (no reduced-motion emulation). |
| `node .claude/skills/noon-ui/scripts/snap.mjs <flow \| flow/screen>...` | Every screen of a flow through the same capture, into `/tmp/noon-ui-snap/` (`--out`, `--scroll`, `--dpr`, `--stage`, `--live`) with a `<out>/capture.json` index. Read every PNG. |
| `npm run visual:ref` | **Reference fidelity** against external references in `visual/refs/` (see "Reference-backed validation" below). PASS / NEEDS-REVIEW / FAIL per reference with geometry, pixel share, worst regions, colour ΔE and element checks; `test-results/visual-ref/report.md` and `test-results/visual-ref/report.json`, images `<name>.{kit,ref,diff,compare}.png`. `-- <name>` runs one; `-- --coverage` lists which screens have references. Exit 0 all PASS, 1 any FAIL, 2 NEEDS-REVIEW only. Never put a kit screenshot in `visual/refs/`. |
| `npm run visual:snap -- <dir> [flow ...]` / `npm run visual:diff -- <a> <b> [--out <diffDir>]` | Pixel regression of the kit against its previous self across every screen (or the flows listed); use around any change to a shared component or token. Not fidelity: both sides are the kit. `diff` warns when the folders were captured with different profiles and flags routes that never settled. |
| `npm run assets:check` | No duplicate or oversized assets (after `npm run assets:optimize`). |
| `npm run verify` | typecheck + token lint + asset check + library build; run before calling the work done. |
| `npm run skill:check` | The skill's references still match the code (run after adding components, tokens, transitions or flows). |

## Rendered is not approved

A screen that renders without errors is **rendered, not visually verified**. It is visually verified only where an external reference covers it and `npm run visual:ref` reports PASS (or a human accepted the difference). It is done when (1) `npm run visual:ref -- <name>` is PASS for its references, or there is no reference and you compared your screenshot with the source side by side, listed every difference, and say "rendered, not visually verified" when you report it; (2) `npm run test:journeys` passes for the flows you touched; (3) its `ScreenDef.verified` date is set. A reference covers only the region it selects (a footer, a card row): say which parts were verified. If a reference fails and the cause is outside your change (another edit, a data difference), report it — don't raise the threshold or add a mask to make it pass. Never call a check passed you didn't run.

## Deterministic capture

`shot.mjs`, `snap.mjs`, `visual-snap.mjs` and `visual-ref.mjs` all capture through `scripts/lib/capture.mjs`, so the same route gives the same pixels on every run:

- **Device**: the kit phone, 390×844 CSS px (`layout.deviceWidth/Height`), captured without the stage backdrop; a reference renders the phone at its own `viewport` width (Figma frames are often 375) with the squircle clip off. `deviceScaleFactor` is explicit: 2 for screenshots, the reference's `scale` for `visual:ref`.
- **Environment**: `prefers-reduced-motion: reduce` (so the kit's reduced-motion presentation is what you see; `--full-motion` turns it off), `prefers-color-scheme: light`, locale en-US, Asia/Dubai, a fresh browser context per screen.
- **Time**: Playwright's fake clock, paused at 2026-10-13 09:41 Dubai and advanced only in fixed steps while settling. Countdowns, "get it by" dates, entrance motion and autoplaying carousels are in the same state on every run, however slow the machine is. `Math.random` is seeded.
- **Freezes**: CSS transitions 0s, carets hidden, smooth scroll off; animated GIF / WebP / APNG images swapped for frame 0; a Lottie that keeps animating is shown on its first painted frame (`--lottie <n>` for another), one that paints a still (the reduced-motion hold frame) keeps it; videos paused at 0. The screenshot itself uses `animations: 'disabled'`.
- **Settle**: phone mounted → network idle → `document.fonts.ready` → visible images loaded and decoded → Lottie canvases painted → +1500ms page time → network idle again → the phone paints the same pixels twice in a row (capped). `settle.stable: false` in the metadata means something never stopped moving; treat its diff as possibly noise.
- **Scroll and steps**: scroll presets `top`, `<y>`, `bottom`, `el:<selector>` (all `.nk-scroll` containers); steps `click`, `tap`, `type`, `press`, `hover`, `fill`, `wait`, `waitFor`, `scroll`, each followed by a short settle and recorded with its result and the route it ended on.
- The dev server port comes from `PORT` (default 5180). A capture that hangs is abandoned after 90s; a capture hit by a Vite reload is retried once.

## Reference-backed validation

Use this for every screen you build or restyle from a Figma frame or a real-app screenshot. A reference is a PNG from **outside the kit**: a Figma export or a screenshot of the real noon app. Never a kit capture: `--set-ref` refuses files from `test-results/`, `/tmp/noon-ui-snap`, files with a capture `.json` next to them, and anything identical to a kit capture.

**1. Add a reference.**
- Export the frame (Figma `get_screenshot` / Export PNG, or a device screenshot of the app). Keep the export scale (1× or 2×) and the frame width (375 / 390 / 393).
- Save it as `visual/refs/<name>.png` and add an entry to `visual/refs/manifest.json`: `name`, `file`, `source` (`Figma <fileKey> · <node> (<what>), exported YYYY-MM-DD` or `noon app <version> <device>, captured YYYY-MM-DD`), `route` (with the query that puts the screen in the reference's state), `select` (selectors whose union box matches the reference), `viewport`, `scale`.
- Find the real top-left: Figma exports carry shadow bleed, so set `refCrop` to the frame's own box. If the reference shows the element at a known place on screen, add `refPosition` to check its position too.
- Mask only data that legitimately differs (prices, counts, names, timers, a strip that shows content scrolled behind): `masks` in CSS px of the cropped reference. A mask that hides a design difference is a lie; more than 40% masked goes to NEEDS-REVIEW.
- Add `checks` for what the reference says about layout: `{ name, selector, expect: { width, height, x, y, right, bottom }, sticky: <scroll y>, source }`. `sticky` asserts the box doesn't move when the screen scrolls. Write in `source` how you read each expected value off the reference.
- Leave the thresholds at the manifest `defaults` (5% pass, 3× that fails, 2px / 8px geometry) unless the reference needs otherwise. Tight component crops can go to 3%, whole screens with photos maybe 8%. Record why in `_note`.

**2. Capture and compare.** `PORT=<port> npm run visual:ref -- <name>` (or no name for all). It renders the route at the reference's viewport and scale, runs `scrollTo` / `steps` if the entry has them, and captures the `select` box.

**3. Read the report.** Open `test-results/visual-ref/report.md` and the `<name>.compare.png` (ref | kit | diff; red differs, blue masked, grey same).
- **Geometry**: kit box vs reference box. A size delta usually means padding, gap or type size; fix that first, because it shifts every pixel after it.
- **Pixels**: the share of unmasked pixels that differ (any channel off by more than 40).
- **Worst regions**: connected hot areas in reference CSS px. Look there first.
- **Colour**: ΔE76 mean / p95 and the most common ref → kit colour swaps. A swap like `#E7FBF3 → #FFFFFF` names the wrong token; a high p95 with a low mean is usually anti-aliasing or an icon.
- **Checks**: each element check with the measured value against the reference's.

**4. Status.**
- **PASS**: diff ≤ `threshold`, geometry within `sizeTolerance`, all checks within `positionTolerance`, and the capture settled. A recorded acceptance still applies.
- **NEEDS-REVIEW**: over `threshold` but within `failThreshold`; geometry over `sizeTolerance` but within `failSizeTolerance`; a check slightly off; an ambiguous selector; masks hiding most of the frame; or the capture never settled.
- **FAIL**: over `failThreshold` or `failSizeTolerance`; a selector or the reference file is missing; or there were console or capture errors.

**5. Human review** (every NEEDS-REVIEW, and FAILs you can't fix). The report lists the exact commands for each entry:
- **The kit is wrong**: fix it, then `PORT=<port> npm run visual:ref -- <name>`.
- **The reference is outdated** (the design moved on): export the frame again, then `node scripts/visual-ref.mjs --set-ref <name> --from <export.png> --source "<origin>, exported YYYY-MM-DD"`. This clears any previous acceptance. Re-check `refCrop` and `masks`.
- **The difference is intended** (a mock-data length, an agreed deviation): a human runs `node scripts/visual-ref.mjs --accept <name> --by "<who>" --note "<why>"`. It records `review` in the manifest, pinned to the reference file's hash and the current diff (+0.5%) and size. A bigger diff or a new reference file needs review again. An agent never accepts on its own; FAILs can't be accepted.

**Coverage.** `PORT=<port> npm run visual:ref -- --coverage` writes `test-results/visual-ref/coverage.md` from the registry and the manifest: the screens with references, the Figma/mixed-truth screens without one (add those first), and per-flow counts.

As of 2026-10-14: **156 registered screens, 2 with an external reference, 146 rendered, not visually verified.**

| Screen skill | Routes with a reference (what it covers) | Status 2026-10-13 | Reference next |
|---|---|---|---|
| `/cart` | `cart/cart`: `cart-sticky-footer` (savings wave + sticky Checkout footer, Figma 127:40209) | PASS 0.7%, footer 375×72, sticky | shipment group card, cart item, empty state |
| `/account` | `account/account`: `account-action-cards-empty` (My Orders / My Wishlist cards, Figma 8886:66691) | NEEDS-REVIEW: 9.9% > 8%, box 345×128 vs 351×136. The kit shows a flat row of four icons with no subtitle; the reference has a stacked hero icon and "3 active" / "curate your favourites" | profile card, menu groups |
| `/home-page` | none | rendered, not visually verified | header + switcher, hero banners, category grid |
| `/search` | none | rendered, not visually verified | search entry with recent / trending |
| `/pdp` | none | rendered, not visually verified | gallery + main info, add-to-cart bar |
| `/checkout` | none | rendered, not visually verified | address header, Pay With, slide-to-pay dock |
| `/orders` | none | rendered, not visually verified | order tracking (`orders/tracking`) |
| `/returns` | none | rendered, not visually verified | return submission steps |
| `/reviews` | none | rendered, not visually verified | rate & pick, write a review (Figma sources in `source`) |
| `/noon-one` | none | rendered, not visually verified | `noonone/landing` non-member landing |

Screens whose `truth` is figma / mixed and have no reference are listed by `--coverage` (15 on 2026-10-13: home, PDP, checkout, orders tracking, the reviews screens and the noon One landing among them); add references for those first.

## Screenshot review

Screenshot every screen you built or changed, at the top and scrolled, and every sheet and state (empty, loading, selected, error). Read each PNG. Then check:

**Structure**
- The screen matches the plan (or the reference): same sections, same order, same primary action.
- Header, content and footer sit inside the safe areas; the footer clears the home indicator (`--nk-inset-bottom`).
- Nothing is clipped, overlapping or overflowing horizontally; long copy wraps or truncates cleanly.

**Kit parts**
- Every button, price, pill, tag, row, card, switch and checkbox is the kit component, not a look-alike.
- Prices show the dirham sign, not "AED".
- Icons come from `Icon` / `MaskIcon` at the sizes other flows use.

**Tokens**
- Colours, type, spacing and radii match neighbouring flows. Put your PNG next to the closest existing screen (`node scripts/shot.mjs orders/list`) and compare rhythm: section gaps, card padding, title sizes.
- `lint:tokens` is at 0 for the flow folder.

**Motion**
- Pushed screens transition, sheets slide up, lists stagger in once and settle, presses give feedback.
- Nothing loops forever except intended carousels or Lotties; reduced motion still works.

**Behaviour**
- Every tappable element does something: navigates, opens a sheet, toggles state or shows a toast. No dead buttons.
- Back returns to where the user came from; the page URL updates to the screen's path.
- Shared state is consistent across flows (add to cart here shows in the cart flow).

## Common faults

| Fault | Fix |
|---|---|
| Raw `#hex` or `font: 600 14px` in a CSS module | Look it up in `scripts/token-map.json`, use the token. |
| Footer button sits on the home indicator | Put it in `Screen`'s `footer` with `padding-bottom: calc(var(--nk-inset-bottom) + …)` as other flows do. |
| Content scrolls under a sticky header | Pass the header through `Screen header`, not inside the scroll content. |
| A screen opens but isn't in the URL bar | Add `path` to the `ScreenDef` or an alias in `src/kit/routes.ts`. |
| `check:routes` shows a placeholder | The `ScreenDef.component` is still the scaffold or `Placeholder`; build it or remove the screen. |
| A copied reference colour | Snap it to the semantic token for its role (`tokens.md`). |
| Ad-hoc `@keyframes` | Use a recipe, preset or registered transition (`motion.md`). |
| A new component duplicates a central one | Delete it and use the central component, adding a variant there only if it is a real noon variant. |
