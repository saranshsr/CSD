# Field Design System → kit mapping

[Field Design System](https://github.com/ayaneshu/field-design-system) (`@field-ds/*`, commit `13229e7`, 2026-07-03) is noon's
coded **Origin Design System**: React Native components named `M-*`, the M-Icon set, Noontree fonts and tokens synced
from Figma. The kit already ports parts of Origin (M-BottomSheet, M-Toast, `_ETA`, the icons), so most Field components
have a kit counterpart. **Use the kit component; extend it with a backward-compatible prop when Field has a state or size
it lacks.** Don't add a second copy of a component that already exists (design-rules.md §0).

**Status (implemented):** every row below is available in the kit — the five MISSING ones as new components (`Radio`,
`ActionBar`, `Accordion`, `TextField`, `TextArea`) and the CLOSE ones as opt-in `variant="field*"` props (API in
components.md → "Field Design System"; gallery `fieldds/gallery`). The 61 missing icons were imported. The "Hand-rolled in
flows" column lists where a flow could adopt them; the ports were left as they are.

Verdicts: **SAME** (use as is) · **CLOSE** (same role; the differences listed) · **MISSING** (no shared counterpart).

## Components

| Field (M-*) | Kit component | Verdict | Differences (Field vs kit) | Hand-rolled in flows today (examples) |
|---|---|---|---|---|
| BottomSheet | navigator `SheetLayer` (origin) + `SheetHeader` / `SheetBody` / `SheetFooter` | CLOSE | visuals match (scrim, 12 inset, r16, 680 max, grabber 36×4); spring 300/28 vs 260/30, drag-dismiss 60px vs 120px, no stretch-up | `plp/FiltersSheet.tsx`, `cart/VariantsSheet.tsx`; `SheetHeader` / `SheetFooter` have 0 uses |
| Toast | `nav.toast` → `Snackbar` / `SnackbarStack` | CLOSE | no `close` action, peek 12 vs 10px + 6% shrink, 2600 vs 3000ms, no swipe-dismiss | `checkout/components/VoucherToast.tsx`, `address/components/primitives.tsx`, `cart/components/CartSnackBar.tsx` (legacy ports) |
| ActionBar | `SheetFooter` (stacked only) | CLOSE / MISSING | no `split`, `leadingTrailing`, neutral tone or full-screen use; `BottomBar` is a different (bappzaar) design | `cart/components/CartFooter.tsx`, `returns/*Screen.tsx` footers, `noonone/components/landing/StickyFooter.tsx`, `plp/FiltersSheet.tsx:275` |
| PrimaryButton | `Button variant="bright"` | CLOSE | no pressed colour (#0F7EFF → #0F61FF), press 0.96 vs 0.98, H52 padX 20 16/24, spinner swaps the label (width jumps) | — |
| SecondaryButton | — (`SheetFooter` fakes it in CSS) | MISSING | white + #D6E9FF border, #0F61FF text | `cart/VariantsSheet.tsx:159` |
| SecondaryNeutralButton | `Button variant="secondary"` | CLOSE | no pressed colours | — |
| NeutralButton | `Button variant="dark"` | CLOSE | #101628 vs #0E0E0E | — |
| TextButton · NeutralTextButton | `ghost` / `noonGhost` · `noonGhostSecondary` | CLOSE | Field has 28/24h boxes with pressed tint | — |
| RoundButton | — | MISSING | pill CTA, white + #EAECF0, H40/H36 | — |
| IconButton | `IconButton` (`Header`) | CLOSE | border #F2F3F7 vs #EAECF0, icon #1D2539 vs #0E0E0E, no `action` emphasis, no H36 | — |
| PageHeader | `Header` | CLOSE (title, title-center) / MISSING (search-pill, location, breadcrumb, icons) | title 16/20 vs 16/22, no image slot | 18+ bespoke headers: `cart/components/CartHeader.tsx`, `wishlist/components/WishlistHeader.tsx`, `returns/components/AFSBackHeader.tsx` … |
| BottomNav | `TabBar` | CLOSE structure, visuals differ | Field: 4×43 blue indicator, 28px `bottomnav-*` icons, B11 labels, 260ms; kit = bappzaar UITabBar 1:1 | — |
| Checkbox | `Checkbox` | CLOSE | kit is a 20px glyph only: no sizes 16/20/24, no `onChange`, disabled or 220ms fill + tick draw | `checkout/AlternatePhoneScreen.tsx:193`, `checkout/AddPaymentCardScreen.tsx:122`, `checkout/components/ProviderForm.tsx:225` |
| Radio | — | MISSING | #0F61FF disc with a white tick, sizes 16/20/24, 220/180ms | ~20 `<img>` swaps: `checkout/components/CheckoutShipment.tsx:182`, `checkout/EmiPlansScreen.tsx:66`, `returns/components/sections/Sections.tsx`, `noonone/components/plans/PlanCard.tsx`, `account/CountrySheet.tsx:36`, `plp/SortSheet.tsx:30` |
| **Switch** (2–4 option segmented) | **`Segmented`** | CLOSE | ⚠ name clash. Kit adds a 1px border (~42 vs 40h), 250ms tween vs spring, no sizes 40/48, drag or disabled | `account/NotificationsSheet.tsx:77`, `membership/perks/ReferralsInputOverlayScreen.tsx:122`, `noonone/screens/OffersOverlayScreen.tsx:178`; `Segmented` has 0 uses |
| **Toggle** (on/off) | **`Switch`** | CLOSE | ⚠ name clash. 37×20 vs 34×20, tween vs spring + knob stretch, no sizes 16/20/24, no disabled | uses kit `Switch` already (cards, checkout, account, reviews) |
| FilterChip | `Pill` | CLOSE | Field 36h r8 14/600 #1D2539, added = #101628 border + count + separate clear (×) target; Pill nav is 30h r20 13/500, blue selected | `orders/OrdersListScreen.tsx:61`, `returns/ReturnsHistoryScreen.tsx:104` |
| InfoBanner | `StatusChip` | CLOSE | same tint-to-white idea; Field small/large (11/12 Medium), rounded/rect, 7 colours (adds supermall, purple); kit 13/600, 6 tones | `orders/components/OrderCards.tsx:97`, `checkout/components/CouponStatus.tsx:15`, `returns/ReturnsHistoryScreen.tsx:159`; `StatusChip` has 0 uses |
| RatingInput | `Stars` (+ reviews `StarRatingInput`) | CLOSE / weak | Field #F5C400, sizes 20/28/32, clear on re-tap, 25ms stagger + bounce; kit `Stars` #F8B200, no motion | `orders/components/StarRating.tsx:36`, `reviews/components/StarRatingInput.tsx`; `Stars` has 0 uses |
| Accordion | — (pdp `SfAccordion`) | MISSING shared | `SfAccordion` matches the metrics (44h, p12, r12, #F9F9FB, 14/600); Field adds controlled mode, 320/260ms, hairline | `pdp/components/storefront/SfProductDetails.tsx:21`, `pdp/components/Sections.tsx:214`, `noonone/components/landing/npModules.tsx:340` |
| Divider | `Divider` / `DashedDivider` | SAME (low) / CLOSE | no `emphasis` prop (high = `border` #EAECF0); dashed 4/4 vs 4/3 | — |
| ListItem | `ListRow` / `ListGroup` | CLOSE | Field p12, gap 8, 24 leading, B14/H16 title, B12 subtitle, `titleSlot`; kit p18/16, 15/500 | `account/components/AccountSection.tsx:29`, `account/ManageDevicesScreen.tsx:38` |
| InputText | — (address `FormInput`, account `FloatingInput`) | MISSING shared | Field 48h (inline 56), r12, label modes, helper, error, counter | raw `<input>` in ~20 files: `checkout/components/ProviderForm.tsx:100`, `cards/components/Form.tsx:36`, `cart/components/CouponInput.tsx:65` |
| InputTextarea | — (reviews `ReviewTextField`) | MISSING shared | Field min 180h, label, helper, error, `n/max` counter | `returns/components/CommentInput.tsx:25`, `orders/OrderCancelScreen.tsx:96` |
| SearchBar | `SearchInput` / `SearchBarButton` | CLOSE | Field H48/H44, border #F2F3F7, B14 Medium, `elevation`, `iconRightTwo`; kit 52h, gray400 border, 16/22 | `address/components/select.tsx:43`, `returns/ReturnsHistoryScreen.tsx:70`, `plp/FiltersSheet.tsx:198` |

## Tokens

- **Grey names are shifted one step.** Field `text-n-icon.secondary` #475067 = kit `textMuted`; Field `tertiary` #666D85 = kit `textSecondary`; Field `muted` #989FB3 = kit `textTertiary`. Map by **hex**, never by name.
- **Same role, different hex:** error #D92626 (kit `danger` #DE1C1C; palette has `dangerRed`), warning #E5641A (kit `warning` #FF9741; palette `sunsetOrange`), muted surface #EAECF0 (kit `bgMuted` #F3F4F8), inverted surface #101628 (kit `bgInverse` #0E0E0E), input border #EAECF0 (kit `borderInput` #D7DAE3).
- **Not in the palette:** #FFF7C2 yellow-mild, #F5C400 yellow-bold, #083F3B success-extrabold, #A36200 yellow-dark, #C0C2F6 border.supermall, #CBF6E5 border.success.
- **Type:** Field body lines are taller (B14 14/20, B12 12/18, H16 16/20) with −0.1 to −0.25 letter-spacing. The kit has the Lh20 / Lh18 presets except `B14_Medium` (14/20 500).
- **Motion:** durations 100 / 160 / 200 / 220 / 260 / 320, easing standard `[0.32, 0.72, 0, 1]`, springs snappy 280/22, springLight 300/28, springBouncy 280/18.

## Icons

Field ships 458 SVGs (436 `system-*`, 22 `bottomnav-*`); 382 match kit Origin icons by name (kit drops the `system-`
prefix, files are SVGO-optimised, same shapes). Missing from the kit: the 22 `bottomnav-*` icons, 32 `*-bold` variants
(arrows, chevrons, plus/minus, refresh, sort, trend-up/down …) and `noon-wallet-filled-2`. Field `-1` / `-2` suffixes are
`-v2` in the kit, and Field typos are fixed (`vetricle-three-dot-menu` → `vertical-three-dot-menu`, `cart-exclaimation`
→ `cart-exclamation`). Import missing icons with `npm run icons:import`.
