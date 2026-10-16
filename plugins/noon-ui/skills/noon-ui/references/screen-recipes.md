# Screen recipes

How a noon screen is put together in this kit, with trimmed code from real screens (paths cited; `…` = removed lines). Imports: components from `'../../components'`, `useNav`/`useParams` from `'../../kit/Navigator'`, `ref` from `'../../foundations/tokens'`, presets from `'../../motion/presets'`.

---

## 1. The skeleton: `<Screen header footer>`

`src/components/Screen/Screen.tsx`. Layout: fixed `header` slot → scroll container (`div.nk-scroll`, flex 1) → fixed `footer` slot.

| Prop | Default | Use |
|---|---|---|
| `header` | – | `<Header …/>` for pushed screens; a custom bar for tab roots / special headers |
| `footer` | – | sticky bottom bar (CTA, totals) |
| `background` | `'bgPage'` | token name (`bgPage` `bgSurface` `bgSubtle` `bgPdp` …) or any CSS value (`'var(--nk-color-chk-fig-page)'`) |
| `safeTop` | `!header` | pads the scroll content with `var(--nk-inset-top)`; set `false` when a custom header or edge-to-edge hero handles it |
| `overlayHeader` | – | header is absolutely positioned over content (PDP gallery, order tracking, noon One landing) |
| `withTabBar` | – | bottom padding clears the tab bar (tab roots) |
| `padded` | – | `paddingInline: 12` |
| `gap` | – | makes content a flex column with this gap |
| `onScroll` | – | `(y: number) => void` |
| `contentStyle` | – | merged last into the scroll container style (override padding here) |
| `ref` | – | forwarded to the scroll container (for `useScroll({ container: ref })`, `scrollTo`) |

Bottom padding Screen applies automatically: with `footer` → `16px`; with `withTabBar` → `tabBar + inset-bottom + 16px`; otherwise `inset-bottom + 16px`.

Safe areas: `--nk-inset-top` (status bar) and `--nk-inset-bottom` (home indicator) are set by `PhoneFrame`. `<Header>` already includes the top inset. A custom header must pad itself (`padding-top: var(--nk-inset-top)`). A footer must pad itself: `padding-bottom: calc(var(--nk-inset-bottom) + 8px)` (or `var(--nk-inset-bottom)`).

`<Header>` props (`src/components/Header/Header.tsx`): `title`, `subtitle`, `back?` (default `nav.canGoBack`), `onBack` (default `nav.back`), `right`, `align: 'center' | 'left'` (default center), `variant: 'surface' | 'transparent' | 'page'`, `bordered`, `children` (rendered under the row, e.g. pills). `IconButton { icon, onPress, variant: 'outline' | 'glass' | 'plain' | 'subtle', badge, label, size, iconSize }` for header actions; `back` and `chevronRight` icons flip in RTL automatically.

### Recipe A — pushed screen with header and two-button sticky footer
`src/flows/orders/OrderCancelScreen.tsx`

```tsx
return (
  <Screen
    background="bgSubtle"
    header={<Header title="Select items to cancel" variant="transparent" />}
    footer={
      <div className={styles.cancelFooter}>
        <AnimatePresence>
          {refund > 0 && (
            <motion.div className={styles.refundBanner} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <b>{currency} {formatPrice(refund)} refund</b> will be initiated to …
            </motion.div>
          )}
        </AnimatePresence>
        <div className={styles.cancelBtns}>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={() => confirm(true)}>Cancel all items</Button>
          <Button variant="checkout" size="lg" style={{ flex: 1 }} disabled={!ids.length} onClick={() => confirm()}>
            Cancel selected{ids.length ? ` (${ids.length})` : ''}
          </Button>
        </div>
      </div>
    }
    contentStyle={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 15px 24px' }}
  >
    {/* checkbox cards … */}
  </Screen>
);
// confirm: nav.toast('2 items cancelled', { tone: 'success', icon: <Icon name="checkCircle" size={18} /> }); nav.back();
```
```css
/* orders.module.css */
.cancelFooter { background: var(--nk-color-bg-surface); padding: 10px 15px calc(var(--nk-inset-bottom) + 8px); display: flex; flex-direction: column; gap: 10px; box-shadow: 0 -2px 8px var(--nk-palette-black-alpha5); }
.cancelBtns { display: flex; gap: 8px; }
```

For a new screen, `BottomBar` (`src/components/BottomBar`) gives the same footer on tokens (white, top radius 16, `shadow('bottomBar')`, inset-bottom padding): `footer={<BottomBar><Button variant="noon" block>Continue</Button></BottomBar>}`.

---

## 2. Tab root with staggered sections

`src/flows/account/AccountScreen.tsx`

```tsx
const enter = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring' as const, mass: 1, damping: 15, stiffness: 120, delay: 0.05 * i },
});

export function AccountScreen() {
  const nav = useNav();
  return (
    <Screen background="bgPage" withTabBar safeTop={false}>
      <div className={styles.statusCover} />           {/* sticky bg strip under the status bar */}
      <div className={styles.page}>                     {/* flex column, gap 12, padding 12px 0 */}
        <motion.div {...enter(0)}><ProfileCard /></motion.div>
        <motion.div {...enter(1)}><ActionCards /></motion.div>
        <motion.div {...enter(3)}>
          <MenuGroup items={accountSection} extra={[<LanguageRow key="lang" />, <CountryRow key="country" />]} />
        </motion.div>
        <motion.div {...enter(5)}>
          <MenuGroup items={securitySection}
            extra={[<AccountSectionItem key="signout" before={<AccountIconImg name="signOut" size={20} />} title="Sign out" onPress={() => nav.sheet('account/signOut')} />]} />
        </motion.div>
      </div>
    </Screen>
  );
}
```
Menu rows come from data (`MenuItem { id, title, icon, route?, presentation?, toast? }`) and open with `nav.push(m.route, {}, { presentation: m.presentation })` or `nav.toast(...)`. Generic equivalents in `src/components`: `ListGroup` (white r14 card, margin `0 15px`, dashed separators) of `ListRow { icon | iconNode, title, subtitle, right, chevron = true, onPress, danger }`.

---

## 3. Feed of horizontal rails (CMS page)

`src/flows/deals/DealsScreen.tsx`

```tsx
const header = (
  <div className={styles.header}>
    <SearchBarButton height={44} onPress={() => nav.push('search/search')} />
  </div>
);

return (
  <Screen header={header} background="bgSurface" withTabBar>
    <div className={styles.feed}>
      <div className={`${styles.heroes} nk-hscroll`}>
        {heroes.map((h) => (
          <Pressable key={h.image} className={styles.hero} style={{ width: dealsTokens.heroWidth, height: dealsTokens.heroHeight }} onClick={() => toPlp(h.query)} scale={0.98}>
            <img src={h.image} alt="" />
          </Pressable>
        ))}
      </div>
      {rails.map((rail) => <Rail key={rail.title} title={rail.title} offset={rail.offset} />)}
      <section className={styles.module}>
        <div className={styles.moduleHeader}><Text variant="section" color="textStrong">{gridTitle}</Text></div>
        <div className={styles.grid}>{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
    </div>
  </Screen>
);

function Rail({ title, offset }: { title: string; offset: number }) {
  const nav = useNav();
  return (
    <section className={styles.module}>
      <div className={styles.moduleHeader}>
        <Text variant="section" color="textStrong">{title}</Text>
        <Pressable className={styles.viewAll} onClick={() => nav.push('plp/listing', { query: title })}>
          View All <Icon name="chevronRight" size={14} strokeWidth={2.4} flipRtl />
        </Pressable>
      </div>
      <div className="nk-hscroll" style={{ gap: 8, padding: '0 16px' }}>
        {rotate(products, offset).slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} compact width={dealsTokens.railCardWidth} />
        ))}
      </div>
    </section>
  );
}
```
Carousel rules: `.nk-hscroll` (flex, `overflow-x: auto`, hidden scrollbar, `scroll-snap-type: x proximity`); put the side gutter as `padding` on the scroller (not margin) so cards scroll to the edge; items need `flex: 0 0 auto` / a fixed `width` (`ProductCard width` sets `flexShrink: 0`). Use `compact` cards in rails (no coupon/delivery rows). Image creatives: `Pressable` with a fixed size and `img { width:100%; height:100%; object-fit: cover | contain }`. Hero snapping: `scroll-snap-type: x mandatory` + `scroll-snap-align: center` (home `.hero`, `.heroCard`).

---

## 4. Product grid with skeleton → staggered rise

`src/flows/plp/ListingScreen.tsx`

```tsx
// cards rise out of their own skeletons on the handoff timeline (plpTokens.timeline: cardsAt 0.68, 60ms apart, first 8)
<div className={styles.grid}>   {/* display:grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 2px 12px 50px */}
  {shown.list.map((p, i) => (
    <motion.div key={`${shown.epoch}-${p.id}`} layout="position" transition={{ layout: { duration: 0.36, ease: [0.4, 0, 0.2, 1] } }}>   {/* sort reorders in place */}
      <SkeletonReveal
        skeleton={<SkeletonCard />}
        animateIn={i < T.animateFirst}
        loading={reloading && i < T.animateFirst}          // a filter change dissolves the cards back into skeletons…
        delay={(shown.epoch === 0 ? T.cardsAt : 0) + i * handoff.stagger.in}   // …and plpTokens.swap.revealAt later they rise again (epoch + 1)
      >
        <ProductCard product={p} />
      </SkeletonReveal>
    </motion.div>
  ))}
</div>
{!reloading && shown.list.length === 0 && (
  <div className={styles.empty}>
    <Text variant="section">No results match your filters</Text>
    <Pressable onClick={() => plpStore.set({ filters: {} })}>Clear all filters</Pressable>
  </div>
)}
```
`SkeletonCard` (`plp/components/SkeletonCard.tsx`) keeps the card footprint: `Skeleton` image at `aspectRatio: 0.8`, then 12/12/18/16px bars. Below-the-fold grids (home "Recommended for you") use `whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}` with delay `(i % 2) * 0.035`. `ProductCard` already opens `pdp/detail` on tap, has the heart (`WishlistHeart`) and quick-add (`quickAdd={false}` to hide). The generic recipe `Stagger` (`src/motion/recipes.tsx`) does the same rise for any list.

---

## 5. Header that reacts to scroll

Two patterns. Simple threshold (`src/flows/pdp/DetailScreen.tsx`):

```tsx
const scrollRef = useRef<HTMLDivElement>(null);
const { scrollY } = useScroll({ container: scrollRef });
const [solid, setSolid] = useState(false);
useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > pdpTokens.headerChangeAfter - pdpTokens.headerInnerHeight));

<Screen ref={scrollRef} header={<SfHeader product={product} solid={solid} />} overlayHeader
  background={solid ? 'bgSurface' : 'bgPage'} safeTop={false} contentStyle={{ paddingBottom: 0 }} footer={<SfAtcBar … />}>
```

Continuous (`src/flows/orders/OrdersListScreen.tsx`):

```tsx
const { scrollY } = useScroll({ container: scrollRef });
const headerBg = useTransform(scrollY, [0, 16], [palette.antiFlashWhite, palette.white]);
const headerRadius = useTransform(scrollY, [0, 16], [0, 10]);

<Screen ref={scrollRef} background="bgPage"
  header={<motion.div className={styles.listHeader} style={{ background: headerBg, borderBottomLeftRadius: headerRadius, borderBottomRightRadius: headerRadius }}>…</motion.div>}
  contentStyle={{ padding: '0 15px calc(var(--nk-inset-bottom) + 24px)' }}>
```
Lighter alternative: `onScroll={(y) => setScrolled(y > 4)}` + a `data-scrolled` attribute driving a CSS shadow. Hide-on-scroll tab bar + header (bappzaar ScrollVisibilityProvider / HidableView): `usePlpScrollStates` (`src/flows/plp/scrollStates.ts`, used by `plp/ListingScreen.tsx`); tab bar alone: `useTabBarScrollHide` (`src/kit/tabBarScroll.ts`, used by `pdp/DetailScreen.tsx`, footer floated in `Screen overlay`). Pinned compact header after a hero: `overlayHeader` + `AnimatePresence` on `y > 220` (`orders/OrderTrackingScreen.tsx`). Collapsing rows: `motion.div animate={collapsed ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}` with `overflow: hidden` (`home/HomeScreen.tsx`, `y >= 100`).

---

## 6. Bottom sheets

**Default for every new sheet: the Origin Design System M-BottomSheet** (Figma `wFRKiKskxZ4vjIHbDVvngJ · 3207:15`). Use another layout only when the request explicitly asks for one, or when porting a bappzaar sheet 1:1 (then `sheet: 'classic'`).

Register with `presentation: 'sheet'` (or open with `nav.sheet(route, params)`). The navigator's `SheetLayer` draws the chrome:
- a bold scrim (`--nk-sheet-scrim`, rgba(0,0,0,0.8)); tapping it dismisses;
- the grabber **above** the sheet, on the scrim (36×4, white at 0.64, in a 28px zone); dragging it down dismisses;
- the sheet floating with a 12px side inset, r16 on all four corners, max 680 high, a gap above the home indicator.

The screen renders only the three slots, in order (no `<Screen>`, no own container):
```tsx
import { SheetBody, SheetFooter, SheetHeader, Text } from '../../components';

export function DeliveryInfoSheet() {
  const nav = useNav();
  return (
    <>
      <SheetHeader title="Delivery options" subtitle="Pick a slot" />   {/* 48 high; no close X — it has a grabber */}
      <SheetBody>…rows, form, Lottie, illustration…</SheetBody>         {/* scrolls inside the sheet past 680 */}
      <SheetFooter primary={{ label: 'Confirm', onPress: () => nav.back() }} secondary={{ label: 'Cancel', onPress: nav.back }} />
    </>
  );
}
// index.ts: { id: 'deliveryInfo', title: 'Delivery options', component: DeliveryInfoSheet, presentation: 'sheet' }
```

Rules:
- **A sheet with a grabber has no close button.** For a sheet that must not be dragged away (a blocking confirm, a form with unsaved input), set `sheet: { grabber: false }`: the grabber goes and `<SheetHeader>` shows the close (X) instead (44×44). Add `dismissible: false` to stop a scrim tap from closing it.
- Leave out `<SheetHeader>` or `<SheetFooter>` when the sheet doesn't need them (Origin "Show header / Show footer"). `SheetFooter` is M-StackedActionBar: optional `top` slot, primary (H52, r12, `bright`), optional secondary (white, `#D6E9FF` border, `#0F61FF` text), optional `bottom` slot.
- A different fill: `sheet: { surface: 'var(--nk-color-bg-subtle)' }` (any surface colour).
- One sheet at a time: for a second confirmation, close this one first or use a modal. Don't use a sheet for persistent navigation.
- A Lottie intro goes in `<SheetBody>`: play it once, then swap to the real content.
- `<SheetBody inset={false}>` for edge-to-edge rows (ListRow brings its own padding).

**Floating sheets (bappzaar `OverlayBottomSheet isFloating`, 1:1).** When the bappzaar screen passes `isFloating` (or `useScrollToClose(…, true)`), set `sheet: 'floating'`:
- scrim rgba(30,30,30,0.7), fading in over 350ms;
- a #B7B7B7 36×4 handle 18px above the sheet, on the scrim; tapping or dragging it closes;
- 12px side inset, r16, 60px top gap, bottom gap = the safe area (15 without one);
- no shadow, and no close X.

Example: `checkout/learn-more` (NoonCheckoutLearnMoreScreen). The screen renders its own content exactly as the port does.

A gorhom `detached` sheet (e.g. NoonFiltersScreenV2: marginHorizontal 8, bottomInset 36) uses the same frame with its own geometry: `sheet: { layout: 'floating', inset: 8, bottomGap: 36 }` (`plp/filters`).

**Classic sheets (the bappzaar ports).** The 39 existing sheet screens set `sheet: 'classic'`: an edge-to-edge white sheet with r24 top corners, the grabber inside it, `max-height: 88%` and bottom inset padding. They keep their current UI, both the sheet frame and their contents (close buttons included): never move an existing sheet to Origin or restyle its header unless the user asks for that sheet. `scripts/sheet-baseline.json` lists them, and `npm run skill:check` fails if one loses `sheet: 'classic'` or if a new sheet sets `'classic'` without being a 1:1 bappzaar port. bappzaar's own rule matches: sheets that swipe to dismiss (OverlayBottomSheet, the gorhom BottomSheet) draw a grabber and never a close button. Only the legacy `Overlay`, which has no drag, uses an X.

Classic list sheet — `src/flows/plp/SortSheet.tsx`:
```tsx
export function SortSheet() {
  const nav = useNav();
  const { sort } = usePlpStore();               // shared with the grid via createStore
  return (
    <div style={{ padding: '4px 0 12px' }}>
      <Text variant="titleSmall" color="textMuted" style={{ display: 'block', padding: '4px 16px 8px' }}>Sort by</Text>
      {sortOptions.map((o) => {
        const on = o.id === sort;
        return (
          <Pressable key={o.id} scale={0.98} onClick={() => { plpStore.set({ sort: o.id }); setTimeout(nav.back, 180); }} …>
            {o.label}
            <span …>{on && <motion.span layoutId="sort-radio" … />}</span>
          </Pressable>
        );
      })}
    </div>
  );
}
```

Classic sheet with title row, scroll body and footer — `src/flows/plp/FiltersSheet.tsx` (+ `filters.module.css`: `.sheet { display:flex; flex-direction:column; height:600px; max-height:100% }`, `.footer { display:flex; gap:8px; padding:12px 12px 4px; border-top:1px solid var(--nk-color-border-subtle) }`):
```tsx
<div className={styles.sheet}>
  <div className={styles.titleRow}>
    <Text variant="titleSmall">Filters</Text>   {/* no close X: the sheet has a grabber */}
  </div>
  <div className={styles.body}>
    <nav className={`nk-scroll ${styles.sidebar}`}>…</nav>
    <div className={`nk-scroll ${styles.options}`}>…</div>
  </div>
  <div className={styles.footer}>
    <Pressable className={styles.clear} onClick={() => setDraft({})}>Clear All</Pressable>
    <Pressable className={styles.show} onClick={() => { plpStore.set({ filters: draft }); nav.back(); }}>Show {count} results</Pressable>
  </div>
</div>
```
Draft-then-commit: copy store state into local `useState` on open, write back only on the primary action.

Confirm sheet — `src/flows/account/SignOutSheet.tsx`: `SheetBody` → icon card (icon, title, description) → `SheetButtons cancelLabel confirmLabel onCancel={nav.back} onConfirm`. Navigate after closing: `nav.back(); nav.reset('account/signedOut')`, or delay a store update/toast with `setTimeout(…, 600)` so it lands after the sheet animates out.

Custom overlay sheets (noonone `VIPOverlay`, membership `VipOverlay`) are `presentation: 'modal'` + a transparent transition and draw their own backdrop; use them only inside those flows. In-screen overlays (`returns` `ReturnsOverlay open onClosed`) are local state, for overlays that need the screen's live data.

---

## 7. Loading, error and empty states

One screen, three states — `src/flows/categories/CategoriesScreen.tsx`:
```tsx
type ViewState = 'loading' | 'error' | 'content';
const { state: pinned } = useParams<CategoriesParams>();          // ScreenDefs pin states via defaultParams
const [view, setView] = useState<ViewState>(pinned ?? (warmed ? 'content' : 'loading'));

if (view === 'loading')
  return <Screen background="bgSurface" withTabBar safeTop={false} contentStyle={{ paddingBottom: 0 }}><ProgressLoader /></Screen>;
if (view === 'error')
  return <Screen background="bgSurface" withTabBar contentStyle={{ display: 'flex' }}><ErrorView onRetry={() => setView('loading')} /></Screen>;
return <Screen header={header} background="bgSurface" withTabBar>…</Screen>;
```
```ts
// index.ts: each state is its own route, so it opens by URL and can be screenshotted
{ id: 'loading', title: 'Loading', component: CategoriesScreen, defaultParams: { state: 'loading' } satisfies CategoriesParams, … },
{ id: 'error',   title: 'Error',   component: CategoriesScreen, defaultParams: { state: 'error' } satisfies CategoriesParams, … },
```

| State | Real example | Shape |
|---|---|---|
| Page loading | `categories/components/ProgressLoader.tsx`, cart `CartLoading` | pale page + 4px gradient bar sweeping (800ms) |
| Item loading | `plp/components/SkeletonCard.tsx`, address `select` (650ms), cards (1s shimmer) | `Skeleton { width, height, radius }` blocks at the final footprint |
| Inline busy | account `ChangePasswordScreen` | `Spinner` inside the CTA; `Button loading` |
| Error | `categories/components/ErrorView.tsx` | image, title, message, Retry → loading |
| Empty (page) | cart `EmptyCart`, `wishlist/components/EmptyState.tsx` | image/animated art, title, one-line message, CTA or recommendations; fade/rise in (`initial={{ opacity: 0, y: 12 }}`) |
| Empty (filtered) | PLP, orders list | inline message + "Clear filters" |

---

## 8. Floating element over the scroll (outside `<Screen>`)

`src/flows/wishlist/WishlistScreen.tsx` — wrap Screen in a positioned stage so the pill is placed against the viewport, not the scroll content:
```tsx
return (
  <div className={styles.stage}>    {/* position:relative; flex:1; min-height:0; display:flex; flex-direction:column */}
    <Screen header={<WishlistHeader swapped={swapped} />} background="bgSurface" onScroll={onScroll}>…</Screen>
    <ViewCartPill visible={wishInCart.length > 0} lines={wishInCart} count={count} />
  </div>
);
```
```css
.viewCartWrap { position: absolute; left: 0; right: 0; bottom: calc(var(--nk-inset-bottom) + 24px); display: flex; justify-content: center; z-index: 40; pointer-events: none; }
```
The pill springs in with `initial={{ y: 140 }} animate={{ y: 0 }}`. Same idea: cart `CartSnackBar`, checkout `VoucherToast` / `Reloader` (siblings of `<Screen>` inside a root div). For transient messages prefer `nav.toast(...)`.

---

## 9. Server-ordered sections + measured footer

`src/flows/cart/CartScreen.tsx` — render sections from an ordered id list; the footer reports its height so the last section is not hidden:
```tsx
const SECTIONS = ['updates', 'groups', 'secondary_groups', 'cms_bottom', 'wishlist', 'free_gifts', 'coupon_tray', 'callouts'] as const;
const renderSection = (section: (typeof SECTIONS)[number]) => {
  switch (section) {
    case 'groups': return groups.map((g) => <CartGroup key={g.type} type={g.type} lines={g.lines} subtotal={g.subtotal} … />);
    case 'coupon_tray': return empty ? null : <CouponInput key={section} />;
    …
  }
};
<Screen
  header={<CartHeader scrollY={scrollY} showBackButton={!isTabRoot && nav.canGoBack} />}
  footer={empty ? undefined : <CartFooter totals={cartTotals} cart={lines} isTabRoot={isTabRoot} onCheckout={onCheckout} onHeightChange={setFooterH} />}
  background="bgPage"
  withTabBar={empty && isTabRoot}
  onScroll={(y) => scrollY.set(y)}
  contentStyle={{ paddingTop: 0, paddingBottom: empty ? undefined : Math.max(16, footerH - 40) }}
>
  {empty && <EmptyCart />}
  {SECTIONS.map(renderSection)}
</Screen>
```
Checkout does the same with `CheckoutSectionId[]` and a `sections` param. `isTabRoot = nav.stack[0]?.route === nav.route` decides back button vs tab bar for screens that are both a tab and pushable.

---

## 10. Cards and section containers

| Container | Where | Spec |
|---|---|---|
| `SectionCard { title, right, padding=12, gap=12, margin='0 12px 12px', radius=16, onClick }` | central | white r16 card with optional 16/700 title row — default for a new section |
| `Card { title, gap, contentGap }` | `pdp/components/Sections.tsx` | same metrics in CSS (`.card` margin `0 s12 s12`, padding `s12`, r16) |
| `.block` | orders tracking | white r16, padding 12, gap 8, `blockTitle` = `--nk-type-section` |
| `AccountSection` / `ListGroup` | account / central | white r14, margin `0 15px`, rows split by dashed/dotted dividers |
| Order card | orders list | white r16 + 3px white border, status strip, body, action row, `whileTap={{ scale: 0.98 }}` |
| Yellow module | home "Deals of the day" | r12, `linear-gradient(var(--nk-palette-kit-yellow83), var(--nk-palette-kit-yellow95))` |

Dividers: `Divider`, `DashedDivider { color, inset, margin }`, `DottedDivider` between rows inside a card; never between cards (cards are separated by the page background).

---

## Spacing rhythm (from real flows)

The enforced version, with radius, colour and type rules and the counts behind them: [`references/design-rules.md`](references/design-rules.md).

| What | Value | Seen in |
|---|---|---|
| Card side gutter | 12 | `SectionCard`, PDP cards, PLP grid, checkout content, home grid |
| List side gutter | 15 | account sections, `ListGroup`, orders content, order cancel |
| Rail / creative gutter | 16 | home & deals rails (`padding: '0 16px'`), section titles |
| Between cards | 12 | `SectionCard` margin-bottom, account `.page` gap |
| Between feed modules | 20 | home `.feed` |
| Between blocks on a detail page | 16 | order tracking content gap, orders `.section` gap |
| Inside a card | 12 padding, 8–12 gap | |
| Grid | 2 columns, gap 12 | PLP, home, deals, wishlist |
| Rail item gap | 8 products · 10 creatives · 12 collections/hero | deals/home/wishlist |
| Title → content | 12 | home `.module` gap |
| Footer | padding `8–12px 15–16px`, bottom `calc(var(--nk-inset-bottom) + 8px)` | `BottomBar`, orders, returns |

Use the tokens: `var(--nk-space-s12)`, `var(--nk-space-s15)`, `var(--nk-space-s16)` etc.; `Text variant="section" color="textStrong"` for section titles.

---

## Interaction details

- Everything tappable is `Pressable` (`scale` default 0.96; use 0.98 for wide rows/cards) or `Button`. Cards built as `motion.article` use `whileTap={{ scale: 0.98 }}`.
- Feedback for actions without a screen: `nav.toast('Order number copied', { icon: <Icon name="copy" size={18} /> })`, `tone: 'success' | 'error'`.
- Child buttons inside a tappable card: `e.stopPropagation()` (orders `ActiveOrderCard`).
- Params by URL are strings: compare `params.empty === '1' || params.empty === 'true'`.
- Prices: `` `${currency} ${formatPrice(n)}` `` or `<Price price was />` / `<Money value />`.

---

## RTL

- `<NoonPrototype rtl>` sets `dir="rtl"` on `.nk-root` and switches the font to Cairo (`fontFamily.rtl`).
- Use logical CSS: `margin-inline-*`, `padding-inline-*`, `inset-inline-start` (account `LanguageSwitcher` animates `insetInlineStart`), `text-align: start`.
- Directional icons: `Icon flipRtl` (adds `.nk-flip-rtl`, mirrored under `[dir='rtl']`); `IconButton` flips `back` / `chevronRight` itself. Mirror directional images with the `nk-flip-rtl` class or `AccountIconImg flipRtl`.
- Horizontal motion offsets must flip sign: `const dir = document.querySelector('[dir="rtl"]') ? -1 : 1; x: -20 * dir` (account `ProfileCard` noon One strip).
- `.nk-hscroll` rails and CSS grid reverse automatically; don't hardcode `left`/`right` for absolutely positioned tags/hearts in new components.
