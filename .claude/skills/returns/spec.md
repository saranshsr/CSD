# Returns — flow specification

The contract a returns build must meet. Read from the code on 2026-10-13 (`src/flows/returns/`); the design source is bappzaar **origin/master** `d481712d6d9` (2026-10-10), `features/afs/returns/`, mapped in `src/flows/returns/MAPPING.md`. No screen has `truth` or `verified` set, so `screenTruth` infers `bappzaar` for all five. Flow: group `Post-order`, `initial: 'history'`, `parent: 'account/account'`, flow tokens `returnsFlowTokens`.

## Screens

Every screen is a pushed `screen` (default `push` transition); none is a sheet or modal route.

| Route | URL | Params (defaults) | What it is | bappzaar source | Status |
|---|---|---|---|---|---|
| `returns/history` | `/returns/history`, `/returns-history` | `empty?` | Returns history (Account → Returns), the flow's `initial` | `legacy/screens/AFSReturnsHistoryListScreen` (MAPPING §9) | exists |
| `returns/returnable` | `/returns/returnable`, `/returnable-items` | `rootKey?` | "Your recent purchases" | `legacy/screens/AFSReturnsReturnableListScreen` (§10) | exists |
| `returns/submit` | `/returns/submit` | `{ orderId: 'o3', productId: 'p5' }`, `rootKey?`, `error?` | AFS v3 return submission, one section at a time | `screens/AFSReturnsReturnSubmissionScreen` (§11) | exists |
| `returns/summary` | `/returns/summary` | `{ productId: 'p5' }`, `returnNr?` | Return request summary | `screens/AFSReturnsRequestSummaryScreen` (§12) | exists |
| `returns/details` | `/returns/details`, `/returns` (alias in `src/kit/routes.ts`) | `{ productId: 'p5' }`, `returnNr?`, `success?`, `rootKey?` | Return details, plain or with the success header | `screens/AFSReturnsDetailsScreen` (§3) | exists |

Entry points (MAPPING §1): Account "Returns" row → `returns/history` (`src/flows/account/data.ts`); `orders/tracking?orderId=o9` Return → `returns/submit { orderId, productId: 'pds-fridge' }`; order tracking `view_return_details` / return-card `view_refund_tracking` → `returns/details`; orders list `HistoryOrderCard` "Track my refund" → `returns/details` (default p5).

## Screen anatomy

All five screens: `<Screen background="bgSubtle" safeTop={false} contentStyle={{ paddingBottom: 0 }}>` (page `--nk-color-bg-subtle`).

### `returns/history`

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Header | inline in `ReturnsHistoryScreen.tsx` | 40 circle back (`MaskIcon` slim chevron, RTL flip) · title "Returns" (`copy.historyHeader`) · 40 circle search; tapping search expands the field (title fades + scales 0.9, field scales X 0.7 → 1, search button width 40 → 0); back while expanded collapses and clears |
| 2 | Filters | `nk-hscroll` row | year picker pill (`yearFilters`: Last 3 months / 2026 / 2025, opens `YearPickerOverlay`) + status chips (`statusFilters`: In progress / Completed / Cancelled; tap toggles, × on the selected chip) |
| 3 | List | `HistoryCard` | status strip (`itemStatusGradient[colorCode]` background, `Icon` + label in `itemStatusText`), 49×68 `ProductImage`, `#R…` return number, title, chevron; optional "Track refund" row (`trackingAction`) |
| 4 | Empty | inline | `empty-return-requests@3x.webp` 280×155, `copy.emptyTitle`, `copy.emptyMessage` |
| 5 | Footer | `AFSButton` | "New return request" (`copy.newReturnRequest`); empty: `copy.createNewReturn` |

Search filters by product title or return number, debounced 300ms.

### `returns/returnable`

`overlayHeader`, `AFSBackHeader blur` "Your recent purchases". Cards (demo list `returnable` inside the screen file: p5, iPhone 17 Pro, p2 returnable; p7 window closed): status strip with the window text (`Icon name="clock"`), `ProductImage` + title + price (`currency` + `price2`) + "Sold by", "Return" `Tap` row (only `status: 'returnable'`), `Dashed`, item number + `MarketplaceTag kind="express"`. No footer.

### `returns/submit`

`overlayHeader`, `AFSBackHeader blur` (no title on the reason step, then `copy.titleSubmit`). Sections in `sectionOrder` (`data.ts`): `reason` → `comment_images` → `return_mode` → `refund_method` → `pickup_details`; only the current one is open, finished ones collapse to summary cards above it.

| # | Section | Component (`components/sections/Sections.tsx`) | Spec |
|---|---|---|---|
| 1 | Reason | `ReasonSection` (+ `ReasonArt`) | 6 `reasons`; picking one dims the others to `returnsTokens.reasonDimmedOpacity` and opens its sub-reasons on `sectionSpring` |
| 2 | Photos + note | `EvidenceSection` (+ `PhotoGuideCarousel`, `CommentInput`) | grid of up to `evidenceConfig.images.maxCount` (5) photos, add tile → upload overlay, guidelines link; note optional, 10–500 chars (`validateNote`) |
| 3 | Resolution | `ResolutionSection` (+ `EstimatedRefundButton`) | refund / replacement (`resolution.modes`) |
| 4 | Refund method | `RefundSection` | original card / noon credits "Instant" (`refundSection`) |
| 5 | Pickup | `PickupSection` | address (→ address overlay), 5 dates, slots (`pickupSection`) |
| — | Done sections | `SummaryCard` / `EvidenceSummary` (in the screen file) | reason art + text, mode glyph, photo thumbs + note, edit pen; tap re-opens the section (asks to discard dirty edits first) |
| — | Footer | `AFSButton size="lg"` or "Skip this step" `Tap` | Continue / Submit Return (last section) / Skip (empty evidence); disabled = `footerDisabledOpacity` + `footerDisabledScale`; `loading` while committing (`submitDelay` 600ms); after completion "Go back" |

### `returns/summary`

`overlayHeader`, `AFSBackHeader solid` "Return request summary". Cards: return details (Requested date + Return ID tiles, `Dashed`, reason / sub-reason / comment) → pickup (address + phone, `Dashed`, date/time; `Svg` icons) → "Uploaded images" `nk-hscroll` (tap → toast). Footer `AFSButton size="lg"` Continue shopping.

### `returns/details`

`overlayHeader`, `AFSBackHeader blur` ("Return details" only without the success header).

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Success header (`success=1`) | `Lottie src={lottieFiles.processing}` → `Lottie name="orderConfirmedCheck"` + `successHeader` title / description | after `detailsFetchDelay`, moves up `successMoveUpDelay` (1.8s) later over `headerRevealDuration` (0.5s, `easing.out`) while the list fades / slides in; scroll scales it to `headerMinScrollScale` |
| 1′ | Cancel header | error icon + `copy.cancelHeaderTitle` / `cancelHeaderDesc` | replaces the success header after a cancel on this screen |
| 2 | Tracking box | `TrackingSteps` in a `Tap` (→ timeline overlay) + `AFSButton size="sm" variant="outline"` Cancel return / SD tracking action | Cancel only while `record.allowCancel` (until pickup); "Track refund" when `trackingAction.actionCode === 'refunded'` (toast for its deep link); stages from `trackingFor(currentStage, cancelled, requestedAt)`, each dated once reached |
| 3 | Feedback box | `FeedbackWidget` (0–10) | only while `feedbackRate == null`; a score opens the feedback overlay |
| 4 | Product card | `ProductDetails hideFlags` + `MarketplaceTag kind="express"` + `SummaryButton` rows split by `Dashed` | Refund summary (amount via `formatRefund`) → overlay · Return request summary → `returns/summary` · Order summary → `orders/tracking` · Return policy → overlay |
| 5 | Footer | `AFSButton size="lg"` | Continue shopping |
| — | Loader | `Spinner size={32}` | opaque while the details "fetch" runs (no success header), translucent during cancel |

## In-screen overlays (not routes)

All are `ReturnsOverlay` (`components/ReturnsOverlay.tsx`) rendered next to `<Screen>` and switched by local `overlay` state; they cannot be opened by URL or screenshotted with `snap.mjs`.

| Screen | Overlay | Component |
|---|---|---|
| history | Year picker + DONE | `YearPickerOverlay` (in `ReturnsHistoryScreen.tsx`) |
| submit | Discard this return? (Back) | `ConfirmOverlay kind="discardReturn"` with `cancelText` |
| submit | Discard section changes? | `ConfirmOverlay kind="discardSection"` |
| submit | Estimated refund breakdown | `RefundDetailsOverlay` |
| submit | Upload image (Camera / Gallery) | `UploadImageOverlay` |
| submit | Photo guidelines | `ImageGuidelineOverlay` |
| submit | Skip evidence (note required) | `EvidenceSkipOverlay` |
| submit | Pickup address | `PickupAddressOverlay` |
| details | Tracking timeline (+ Cancel) | `TrackingTimelineOverlay` |
| details | Cancel return confirm | `ConfirmOverlay kind="cancelRequest"` |
| details | Refund summary | `RefundSummaryOverlay` |
| details | Return policy | `PolicyOverlay` |
| details | Feedback (options + success Lottie) | `FeedbackOverlay` |

## Navigation

| From | Action |
|---|---|
| history back | `nav.back()` (parent `account/account` when opened directly) |
| history "New return request" | `nav.push('returns/returnable', { rootKey: ownKey(nav) })` |
| history card | `nav.push('returns/details', { productId, returnNr, rootKey })` |
| history "Track refund" | `nav.toast(…)` (refund deep link not ported) |
| returnable card | `nav.push('pdp/detail', { productId })` |
| returnable "Return" | `nav.push('returns/submit', { productId, rootKey })` |
| submit Back | `nav.back()` when completed or in error, else the discard overlay → `nav.back()` |
| submit last section committed | `returnsStore.create(…)` → `nav.push('returns/details', { productId, returnNr, success: '1', rootKey })` |
| submit error "Contact support" | `nav.toast(…)` |
| details back | stack of 1 → `nav.reset('returns/history')`; else `popTo(nav, rootKey, below === 'returns/submit' ? 2 : 1)` (`nav.ts`) |
| details rows | `nav.push('returns/summary', { productId, returnNr })`, `nav.push('orders/tracking', { orderId: orderIdFor(productId) })` |
| details policy button | `nav.toast(…)` (web view not ported) |
| summary image | `nav.toast(…)` (gallery not ported) |
| details / summary Continue shopping | `nav.switchTab('home')` |

## State

- **`returnsStore`** (`store.ts`, `createStore<{ returns: ReturnRecord[] }>`): seeded with p5 (pickup scheduled), p3 (refunded, "Track refund"), p7 (under inspection), p8 (cancelled). `useReturns()`, `get(productId?, returnNr?)`, `create(rec)` (newest first, stage 1 "Return requested"), `cancel(returnItemNr)`, `rate(returnItemNr, rate)`, `reset()`. `recordFor(productId, returnNr)` seeds a record for a deep-linked product; `pickupAddress(code)` builds the pickup block from `user` + `addresses`.
- **Submission** (local to `ReturnSubmitScreen`): `drafts` vs `committed` (`Drafts`: reason, sub, assets, note, mode, refundFlow, address, optionIdx, slot), section index, `submitting`, `completed`, `error`, `overlay`, `pendingFocus`. A section is dirty when any of its draft keys differs from committed.
- **Details** (local): `status` pending → success, header `ready`, `canceledHere`, `cancelLoading`, `rate`, `overlay`.
- **History** (local): `yearIdx` (display only — no year filtering in the demo), `status`, `expanded`, `term` / `debounced`, `picker`.

## States

| State | How | Status |
|---|---|---|
| History empty | `returns/history?empty=1` (or no match for filter / search) | exists (param only, no ScreenDef) |
| Submit error | `returns/submit?error=1` → `SubmitErrorView` (error icon, Try again → form, Contact support → toast) | exists (param only) |
| Details success | `returns/details?success=1` (processing Lottie → success header) | exists (param only) |
| Details cancelled | Cancel return → confirm → cancel header + store `cancel` | exists (interaction only) |
| Details loading | `Spinner` for `detailsFetchDelay` (900ms) on open without the success header | exists |
| Submit committing | footer `AFSButton loading` for `submitDelay` | exists |
| Returnable empty / loading / error | — | doesn't exist (static list in the screen file) |
| History / summary loading or error | — | doesn't exist |
| Details error | — | doesn't exist |

None of the param states is its own ScreenDef, so `snap.mjs returns` captures only the five defaults; screenshot the others by URL. A new state that should be screenshot-able gets a ScreenDef with `defaultParams`.

## Data

- Copy: `copy` in `src/flows/returns/data.ts` (keys listed in `MAPPING.md` §13).
- Server-driven demo data (`data.ts`, MAPPING §15): `reasons`, `evidenceConfig`, `resolution`, `estimatedRefund`, `refundSection`, `pickupSection`, `addresses`, `cancelText`, `sectionOrder`, `yearFilters`, `statusFilters`, `trackingFor`, `refundDetailsFor`, `feedbackWidget`, `returnPolicy`, `successHeader`.
- Helpers: `resolveProduct` (whole catalogue via `getProduct`, falls back to p5), `orderIdFor`, `returnNumberFor`, `isExpress`, `price2`, `formatRefund`.
- Assets: `src/assets/returns/` through `assets.ts` (`icons`, `images`, `lottieFiles`); the feedback Lottie is the shared `order-confirmed-checkmark.lottie`.
- Tokens: `src/flows/returns/tokens.ts` — `returnsFlowTokens` (CSS `--nk-color-returns-*`, e.g. `--nk-color-returns-status-blue`), `returnsTokens` (motion and timing), `itemStatusGradient`, `itemStatusText`, `trackingColors`, `trackingTextColors`.

## Motion

Flow motion lives in `returnsTokens`; easing from `src/motion/presets.ts` (`easing.out`). Cross-flow overview: `../noon-ui/references/motion-matrix.md`<!-- planned: ../noon-ui/references/motion-matrix.md -->; presets and recipes: `../noon-ui/references/motion.md`.

| Moment | Kit |
|---|---|
| Push between screens | default `push` |
| Overlay open / close | `ReturnsOverlay`: card y 110% → 0 on `overlaySpring` (damping 15, stiffness 110), close `overlayClose` 0.35s, scrim `overlayFadeDuration`; drag down > `overlayDragOffset` or > `overlayDragVelocity` closes |
| Press | `Tap` / `AFSButton` spring to `pressScale` 0.98 (`pressSpring`); history / returnable cards `whileTap` opacity 0.2 |
| History search expand | `searchDuration` 0.25s, `easing.out` |
| Section enter | `AnimatedSection`: opacity 0.25s + y −16 → 0 spring; reason dim + sub-reason open on `sectionSpring` |
| Done summary cards | `layout`, y `summaryOffset` → 0 on `fadeIn` |
| Photo added / removed | grid item scale 0.6 → 1 on `fadeIn` |
| Footer swap | `AnimatePresence mode="wait"`, disabled opacity / scale on `fadeIn` |
| Details success header | move-up after `successMoveUpDelay`, `headerRevealDuration` on `easing.out`; scroll scale via `useScroll` + `useTransform` |

## Acceptance

- [ ] Routes and URL paths unchanged (`/returns`, `/returns-history`, `/returnable-items`); new screens registered with `title`, `notes`, `source`; `check:routes` clean.
- [ ] Every screen `<Screen background="bgSubtle">` with `AFSBackHeader` (or the history header) and an `AFSButton` footer where the table says.
- [ ] Status strips coloured only through `itemStatusGradient` / `itemStatusText` / `trackingColors`.
- [ ] Submission: one open section, done sections collapse to edit cards, footer disabled until valid, discard prompts on Back and on dirty section edits, last commit creates a store record and opens details with the success header.
- [ ] Details: tracker opens the timeline, Cancel return updates the store and shows the cancel header, feedback hides after rating, all four rows navigate or open their overlay.
- [ ] Back from details returns to the screen that started the return (`rootKey` passed on every push).
- [ ] Order ids o3 / o9 and `orderIdFor` untouched; orders → returns entry points still land on the right screen.
- [ ] Forced states (`?empty=1`, `?error=1`, `success=1`) render without changing `returnsStore`.
- [ ] Tokens only (`lint:tokens` 0 for `src/flows/returns`); new values are `returns*` tokens with a `MAPPING.md` row.
- [ ] Screenshots of every default screen and each param state read against `MAPPING.md`; overlays opened by tapping and checked.
